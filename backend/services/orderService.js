const prisma = require("../database/prisma");
const DomainError = require("../errors/domainError");
const {
    calculateAmountPaid,
    calculateOrderTotal,
    calculatePaymentSummary,
    deriveOrderStatus,
    summarizeItem
} = require("../utils/orderCalculations");
const { Prisma } = require("@prisma/client");

const itemWithConsolidations = {
    include: {
        consolidationRecords: {
            orderBy: [
                { consolidatedAt: "asc" },
                { id: "asc" }
            ]
        }
    }
};

const paymentOrder = [
    { paymentDate: "asc" },
    { id: "asc" }
];

const serializePayment = (payment) => ({
    id: payment.id,
    amount: payment.amount.toString(),
    paymentDate: payment.paymentDate,
    reference: payment.reference,
    notes: payment.notes,
    createdAt: payment.createdAt
});

const createOrder = async (supplierId, orderData) => {
    const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
        select: { id: true }
    });
    if (!supplier) {
        throw new DomainError("SUPPLIER_NOT_FOUND", "Supplier not found.");
    }

    return prisma.order.create({
        data: {
            supplierId,
            orderNumber: orderData.orderNumber,
            orderDate: orderData.orderDate,
            currency: orderData.currency,
            notes: orderData.notes,
            items: {
                create: orderData.items
            }
        },
        include: {
            supplier: {
                select: { id: true, name: true, location: true, mobileNumber: true }
            },
            items: itemWithConsolidations
        }
    });
};

const getSupplierOrders = async (supplierId) => {
    const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
        select: { id: true }
    });
    if (!supplier) {
        throw new DomainError("SUPPLIER_NOT_FOUND", "Supplier not found.");
    }

    const orders = await prisma.order.findMany({
        where: { supplierId },
        orderBy: [{ orderDate: "desc" }, { id: "desc" }],
        include: {
            items: itemWithConsolidations,
            payments: { select: { amount: true } }
        }
    });

    return orders.map((order) => {
        const items = order.items.map((item) => summarizeItem(item));
        const paymentSummary = calculatePaymentSummary(order.items, order.payments);
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            currency: order.currency,
            ...paymentSummary,
            consolidationStatus: deriveOrderStatus(items),
            createdAt: order.createdAt
        };
    });
};

const getOrderDetail = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            supplier: {
                select: { id: true, name: true, location: true, mobileNumber: true }
            },
            items: {
                ...itemWithConsolidations,
                orderBy: { id: "asc" }
            },
            payments: { orderBy: paymentOrder }
        }
    });
    if (!order) {
        throw new DomainError("ORDER_NOT_FOUND", "Order not found.");
    }

    const items = order.items.map((item) => summarizeItem(item, true));
    const paymentSummary = calculatePaymentSummary(order.items, order.payments);
    return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        currency: order.currency,
        notes: order.notes,
        supplier: order.supplier,
        items,
        payments: order.payments.map(serializePayment),
        ...paymentSummary,
        consolidationStatus: deriveOrderStatus(items),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    };
};

const updateOrder = async (orderId, orderData) => {
    await prisma.$transaction(async (transaction) => {
        const lockedOrders = await transaction.$queryRaw(
            Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`
        );
        if (!lockedOrders[0]) throw new DomainError("ORDER_NOT_FOUND", "Order not found.");

        await transaction.$queryRaw(
            Prisma.sql`SELECT "id" FROM "OrderItem" WHERE "orderId" = ${orderId} FOR UPDATE`
        );
        const order = await transaction.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { consolidationRecords: true } }, payments: true }
        });
        const existingById = new Map(order.items.map((item) => [item.id, item]));
        const suppliedIds = new Set(orderData.items.filter((item) => item.id).map((item) => item.id));

        for (const item of orderData.items) {
            if (item.id && !existingById.has(item.id)) {
                throw new DomainError("ORDER_ITEM_NOT_FOUND", "Order item not found for this order.");
            }
            if (item.id) {
                const consolidated = existingById.get(item.id).consolidationRecords
                    .reduce((total, record) => total + record.quantity, 0);
                if (item.quantity < consolidated) {
                    throw new DomainError("ORDER_ITEM_QUANTITY_CONFLICT", "Item quantity cannot be reduced below the quantity already consolidated.");
                }
            }
        }

        const removedItems = order.items.filter((item) => !suppliedIds.has(item.id));
        if (removedItems.some((item) => item.consolidationRecords.length > 0)) {
            throw new DomainError("ORDER_ITEM_REMOVAL_CONFLICT", "Item cannot be removed because consolidation history already exists.");
        }

        const proposedTotal = calculateOrderTotal(orderData.items);
        const amountPaid = calculateAmountPaid(order.payments);
        if (proposedTotal.lessThan(amountPaid)) {
            throw new DomainError("ORDER_TOTAL_BELOW_PAID", "Order total cannot be reduced below the amount already paid.");
        }

        if (removedItems.length > 0) {
            await transaction.orderItem.deleteMany({ where: { id: { in: removedItems.map((item) => item.id) } } });
        }
        for (const item of orderData.items) {
            const data = {
                modelNumber: item.modelNumber,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice
            };
            if (item.id) await transaction.orderItem.update({ where: { id: item.id }, data });
            else await transaction.orderItem.create({ data: { orderId, ...data } });
        }
        await transaction.order.update({
            where: { id: orderId },
            data: { orderNumber: orderData.orderNumber, orderDate: orderData.orderDate, notes: orderData.notes }
        });
    });
    return getOrderDetail(orderId);
};

module.exports = {
    createOrder,
    getOrderDetail,
    getSupplierOrders,
    updateOrder
};

const prisma = require("../database/prisma");
const DomainError = require("../errors/domainError");
const {
    calculateOrderTotal,
    deriveOrderStatus,
    summarizeItem
} = require("../utils/orderCalculations");

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
        include: { items: itemWithConsolidations }
    });

    return orders.map((order) => {
        const items = order.items.map((item) => summarizeItem(item));
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            currency: order.currency,
            totalAmount: calculateOrderTotal(order.items).toString(),
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
            }
        }
    });
    if (!order) {
        throw new DomainError("ORDER_NOT_FOUND", "Order not found.");
    }

    const items = order.items.map((item) => summarizeItem(item, true));
    return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        currency: order.currency,
        notes: order.notes,
        supplier: order.supplier,
        items,
        totalAmount: calculateOrderTotal(order.items).toString(),
        consolidationStatus: deriveOrderStatus(items),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    };
};

module.exports = {
    createOrder,
    getOrderDetail,
    getSupplierOrders
};

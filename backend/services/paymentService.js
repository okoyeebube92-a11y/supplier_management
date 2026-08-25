const { Prisma } = require("@prisma/client");
const prisma = require("../database/prisma");
const DomainError = require("../errors/domainError");
const { calculatePaymentSummary } = require("../utils/orderCalculations");

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

const createPayment = async (orderId, paymentData) => prisma.$transaction(async (transaction) => {
    // The order-row lock serializes every balance check and insert for this order.
    const lockedOrders = await transaction.$queryRaw(
        Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`
    );
    if (!lockedOrders[0]) {
        throw new DomainError("ORDER_NOT_FOUND", "Order not found.");
    }

    const [items, payments] = await Promise.all([
        transaction.orderItem.findMany({
            where: { orderId },
            select: { quantity: true, unitPrice: true }
        }),
        transaction.payment.findMany({
            where: { orderId },
            select: { amount: true }
        })
    ]);
    const currentSummary = calculatePaymentSummary(items, payments);
    const newAmountPaid = new Prisma.Decimal(currentSummary.amountPaid).add(paymentData.amount);
    if (newAmountPaid.greaterThan(currentSummary.totalAmount)) {
        throw new DomainError("PAYMENT_EXCEEDS_TOTAL", "Payment exceeds the outstanding order balance.");
    }

    const payment = await transaction.payment.create({
        data: { orderId, ...paymentData }
    });
    const summary = calculatePaymentSummary(items, [
        ...payments,
        { amount: payment.amount }
    ]);

    return { payment: serializePayment(payment), ...summary };
});

const getOrderPayments = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            items: { select: { quantity: true, unitPrice: true } },
            payments: { orderBy: paymentOrder }
        }
    });
    if (!order) {
        throw new DomainError("ORDER_NOT_FOUND", "Order not found.");
    }

    return {
        payments: order.payments.map(serializePayment),
        ...calculatePaymentSummary(order.items, order.payments)
    };
};

module.exports = {
    createPayment,
    getOrderPayments
};

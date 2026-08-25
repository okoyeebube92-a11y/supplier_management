const { Prisma } = require("@prisma/client");

const deriveItemStatus = (consolidatedQuantity, orderedQuantity) => {
    if (consolidatedQuantity === 0) {
        return "PENDING";
    }
    if (consolidatedQuantity === orderedQuantity) {
        return "COMPLETE";
    }
    return "PARTIAL";
};

const deriveOrderStatus = (items) => {
    if (items.every((item) => item.consolidationStatus === "PENDING")) {
        return "PENDING";
    }
    if (items.every((item) => item.consolidationStatus === "COMPLETE")) {
        return "COMPLETE";
    }
    return "PARTIAL";
};

const summarizeItem = (item, includeRecords = false) => {
    const records = item.consolidationRecords || [];
    const consolidatedQuantity = records.reduce((total, record) => total + record.quantity, 0);
    const amount = new Prisma.Decimal(item.unitPrice).mul(item.quantity);
    const summary = {
        id: item.id,
        modelNumber: item.modelNumber,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice.toString(),
        amount: amount.toString(),
        consolidatedQuantity,
        consolidationStatus: deriveItemStatus(consolidatedQuantity, item.quantity),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    };

    if (includeRecords) {
        summary.consolidationRecords = records;
    }

    return summary;
};

const calculateOrderTotal = (items) => items.reduce(
    (total, item) => total.add(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
    new Prisma.Decimal(0)
);

const calculateAmountPaid = (payments) => payments.reduce(
    (total, payment) => total.add(new Prisma.Decimal(payment.amount)),
    new Prisma.Decimal(0)
);

const calculatePaymentSummary = (items, payments) => {
    const totalAmount = calculateOrderTotal(items);
    const amountPaid = calculateAmountPaid(payments);
    const outstandingBalance = totalAmount.sub(amountPaid);
    let paymentStatus = "PARTIAL";
    if (amountPaid.isZero()) {
        paymentStatus = "UNPAID";
    } else if (amountPaid.equals(totalAmount)) {
        paymentStatus = "PAID";
    }

    return {
        totalAmount: totalAmount.toString(),
        amountPaid: amountPaid.toString(),
        outstandingBalance: outstandingBalance.toString(),
        paymentStatus
    };
};

module.exports = {
    calculateAmountPaid,
    calculateOrderTotal,
    calculatePaymentSummary,
    deriveItemStatus,
    deriveOrderStatus,
    summarizeItem
};

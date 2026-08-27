const { Prisma } = require("@prisma/client");
const prisma = require("../database/prisma");
const { calculatePaymentSummary, deriveOrderStatus, summarizeItem } = require("../utils/orderCalculations");

const issuesFor = (paymentStatus, consolidationStatus) => {
    const issues = [];
    if (paymentStatus === "UNPAID") issues.push("Unpaid");
    if (paymentStatus === "PARTIAL") issues.push("Partial payment");
    if (consolidationStatus === "PENDING") issues.push("Pending consolidation");
    if (consolidationStatus === "PARTIAL") issues.push("Partial consolidation");
    return issues;
};

const summarizeOrder = (order) => {
    const items = order.items.map((item) => summarizeItem(item));
    const payment = calculatePaymentSummary(order.items, order.payments);
    const consolidationStatus = deriveOrderStatus(items);
    return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        createdAt: order.createdAt,
        supplier: order.supplier,
        ...payment,
        consolidationStatus,
        issues: issuesFor(payment.paymentStatus, consolidationStatus)
    };
};

const getDashboard = async () => {
    // Load the dashboard graph in two bounded queries so the frontend never fans out into per-supplier or per-order requests.
    const [suppliers, orders] = await Promise.all([
        prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.order.findMany({
            orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
            select: {
                id: true,
                orderNumber: true,
                orderDate: true,
                createdAt: true,
                supplier: { select: { id: true, name: true } },
                items: {
                    select: {
                        quantity: true,
                        unitPrice: true,
                        consolidationRecords: { select: { quantity: true } }
                    }
                },
                payments: { select: { amount: true } }
            }
        })
    ]);

    const summarizedOrders = orders.map(summarizeOrder);
    const attentionOrders = summarizedOrders.filter((order) => order.issues.length > 0);
    const outstandingBalance = attentionOrders.reduce(
        (total, order) => total.add(new Prisma.Decimal(order.outstandingBalance)),
        new Prisma.Decimal(0)
    );
    const attentionSupplierIds = new Set(attentionOrders.map((order) => order.supplier.id));

    const supplierQueue = suppliers.map((supplier) => {
        const supplierOrders = summarizedOrders.filter((order) => order.supplier.id === supplier.id);
        const supplierAttention = supplierOrders.filter((order) => order.issues.length > 0);
        const supplierOutstanding = supplierAttention.reduce(
            (total, order) => total.add(new Prisma.Decimal(order.outstandingBalance)),
            new Prisma.Decimal(0)
        );
        return {
            supplier,
            attentionOrderCount: supplierAttention.length,
            outstandingBalance: supplierOutstanding.toString(),
            latestOrder: supplierOrders[0] ? {
                id: supplierOrders[0].id,
                orderNumber: supplierOrders[0].orderNumber,
                orderDate: supplierOrders[0].orderDate
            } : null,
            nextIssues: supplierAttention[0]?.issues || []
        };
    }).sort((left, right) => right.attentionOrderCount - left.attentionOrderCount || left.supplier.name.localeCompare(right.supplier.name));

    return {
        summary: {
            attentionOrders: attentionOrders.length,
            outstandingBalance: outstandingBalance.toString(),
            partialConsolidationOrders: summarizedOrders.filter((order) => order.consolidationStatus === "PARTIAL").length,
            suppliersNeedingAttention: attentionSupplierIds.size
        },
        attentionOrders,
        recentOrders: summarizedOrders.slice(0, 8),
        supplierQueue
    };
};

module.exports = { getDashboard };

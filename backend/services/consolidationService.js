const { Prisma } = require("@prisma/client");
const prisma = require("../database/prisma");
const DomainError = require("../errors/domainError");
const { deriveItemStatus } = require("../utils/orderCalculations");

const createConsolidationRecord = async (orderId, itemId, recordData) => prisma.$transaction(async (transaction) => {
    // Locking the item serializes quantity checks for concurrent consolidation requests.
    const lockedItems = await transaction.$queryRaw(
        Prisma.sql`SELECT "id", "orderId", "quantity" FROM "OrderItem" WHERE "id" = ${itemId} FOR UPDATE`
    );
    const item = lockedItems[0];
    if (!item || item.orderId !== orderId) {
        throw new DomainError("ORDER_ITEM_NOT_FOUND", "Order item not found for this order.");
    }

    const totals = await transaction.consolidationRecord.aggregate({
        where: { orderItemId: itemId },
        _sum: { quantity: true }
    });
    const existingQuantity = totals._sum.quantity || 0;
    const consolidatedQuantity = existingQuantity + recordData.quantity;
    if (consolidatedQuantity > item.quantity) {
        throw new DomainError(
            "CONSOLIDATION_EXCEEDS_QUANTITY",
            "Consolidation quantity exceeds the remaining ordered quantity."
        );
    }

    const record = await transaction.consolidationRecord.create({
        data: {
            orderItemId: itemId,
            ...recordData
        }
    });

    return {
        consolidationRecord: record,
        consolidatedQuantity,
        consolidationStatus: deriveItemStatus(consolidatedQuantity, item.quantity)
    };
});

module.exports = {
    createConsolidationRecord
};

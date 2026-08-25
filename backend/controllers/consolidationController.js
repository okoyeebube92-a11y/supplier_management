const { createConsolidationRecord } = require("../services/consolidationService");
const { validateOrderId } = require("../validation/orderValidation");
const {
    validateConsolidationBody,
    validateItemId
} = require("../validation/consolidationValidation");

const createConsolidationController = async (req, res, next) => {
    const orderValidation = validateOrderId(req.params.orderId);
    if (orderValidation.error) {
        return res.status(400).json({ error: orderValidation.error });
    }

    const itemValidation = validateItemId(req.params.itemId);
    if (itemValidation.error) {
        return res.status(400).json({ error: itemValidation.error });
    }

    const bodyValidation = validateConsolidationBody(req.body);
    if (bodyValidation.errors) {
        return res.status(400).json({
            error: "Invalid consolidation data.",
            details: bodyValidation.errors
        });
    }

    try {
        const result = await createConsolidationRecord(
            orderValidation.value,
            itemValidation.value,
            bodyValidation.value
        );
        return res.status(201).json(result);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createConsolidationController
};

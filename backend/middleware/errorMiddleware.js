const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: "Route not found."
    });
};

// Keep internal exception details out of API responses while preserving useful JSON errors.
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && err.type === "entity.parse.failed") {
        return res.status(400).json({
            error: "Request body contains invalid JSON."
        });
    }

    // Prisma reports update/delete races and missing records with this stable error code.
    if (err && err.code === "P2025") {
        return res.status(404).json({
            error: "Supplier not found."
        });
    }

    const domainStatuses = {
        SUPPLIER_NOT_FOUND: 404,
        ORDER_NOT_FOUND: 404,
        ORDER_ITEM_NOT_FOUND: 404,
        CONSOLIDATION_EXCEEDS_QUANTITY: 400
    };
    if (err && domainStatuses[err.code]) {
        return res.status(domainStatuses[err.code]).json({ error: err.message });
    }

    if (err && err.code === "P2002") {
        return res.status(409).json({
            error: "Order number already exists for this supplier."
        });
    }

    if (err && err.code === "P2003") {
        return res.status(409).json({
            error: "Operation conflicts with related records."
        });
    }

    console.error(err);
    return res.status(500).json({
        error: "Internal server error."
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};

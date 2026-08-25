const { MAX_PRISMA_INT, validatePositiveIntId } = require("./commonValidation");

const CONSOLIDATION_FIELDS = ["quantity", "location", "consolidatedAt", "notes"];

const validateConsolidationBody = (body) => {
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return { errors: ["Request body must be a JSON object."] };
    }

    const errors = Object.keys(body)
        .filter((field) => !CONSOLIDATION_FIELDS.includes(field))
        .map((field) => `Unknown field: ${field}.`);

    if (!Number.isInteger(body.quantity) || body.quantity <= 0 || body.quantity > MAX_PRISMA_INT) {
        errors.push("quantity must be a positive integer.");
    }

    let location;
    if (typeof body.location !== "string" || body.location.trim().length === 0) {
        errors.push("location must be a non-empty string.");
    } else {
        location = body.location.trim();
    }

    let consolidatedAt;
    if (typeof body.consolidatedAt !== "string" || body.consolidatedAt.trim().length === 0) {
        errors.push("consolidatedAt must be a valid date string.");
    } else {
        const trimmed = body.consolidatedAt.trim();
        consolidatedAt = new Date(trimmed);
        if (Number.isNaN(consolidatedAt.getTime()) || (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) && consolidatedAt.toISOString().slice(0, 10) !== trimmed)) {
            errors.push("consolidatedAt must be a valid date string.");
        }
    }

    let notes;
    if (Object.prototype.hasOwnProperty.call(body, "notes")) {
        if (typeof body.notes !== "string") {
            errors.push("notes must be a string when provided.");
        } else {
            notes = body.notes.trim();
        }
    }

    if (errors.length > 0) {
        return { errors };
    }

    const value = { quantity: body.quantity, location, consolidatedAt };
    if (notes !== undefined) {
        value.notes = notes;
    }

    return { value };
};

const validateItemId = (rawId) => validatePositiveIntId(rawId, "Item ID");

module.exports = {
    validateConsolidationBody,
    validateItemId
};

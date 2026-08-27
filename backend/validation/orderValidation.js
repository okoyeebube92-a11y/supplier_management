const { MAX_PRISMA_INT, validatePositiveIntId } = require("./commonValidation");

const ORDER_FIELDS = ["orderNumber", "orderDate", "currency", "notes", "items"];
const ITEM_FIELDS = ["modelNumber", "description", "quantity", "unit", "unitPrice"];
const EDIT_ORDER_FIELDS = ["orderNumber", "orderDate", "notes", "items"];
const EDIT_ITEM_FIELDS = ["id", ...ITEM_FIELDS];

const validateNonBlankString = (value, label, errors) => {
    if (typeof value !== "string" || value.trim().length === 0) {
        errors.push(`${label} must be a non-empty string.`);
        return undefined;
    }

    return value.trim();
};

const validateOptionalString = (object, field, label, errors) => {
    if (!Object.prototype.hasOwnProperty.call(object, field)) {
        return undefined;
    }

    if (typeof object[field] !== "string") {
        errors.push(`${label} must be a string when provided.`);
        return undefined;
    }

    return object[field].trim();
};

const validateDate = (value, label, errors) => {
    if (typeof value !== "string" || value.trim().length === 0) {
        errors.push(`${label} must be a valid date string.`);
        return undefined;
    }

    const trimmed = value.trim();
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime()) || (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) && date.toISOString().slice(0, 10) !== trimmed)) {
        errors.push(`${label} must be a valid date string.`);
        return undefined;
    }

    return date;
};

const validateUnitPrice = (value, label, errors) => {
    if (typeof value !== "string" || !/^\d+(?:\.\d+)?$/.test(value.trim())) {
        errors.push(`${label} must be a non-negative decimal string.`);
        return undefined;
    }

    const normalized = value.trim();
    const [integerPart, fractionPart = ""] = normalized.split(".");
    if (integerPart.length > 35 || fractionPart.length > 30 || integerPart.length + fractionPart.length > 65) {
        errors.push(`${label} exceeds the supported decimal precision.`);
        return undefined;
    }

    return normalized;
};

const validateOrderItem = (item, index) => {
    const label = `items[${index}]`;
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
        return { errors: [`${label} must be a JSON object.`] };
    }

    const errors = Object.keys(item)
        .filter((field) => !ITEM_FIELDS.includes(field))
        .map((field) => `Unknown field: ${label}.${field}.`);

    const modelNumber = validateNonBlankString(item.modelNumber, `${label}.modelNumber`, errors);
    const unit = validateNonBlankString(item.unit, `${label}.unit`, errors);
    const description = validateOptionalString(item, "description", `${label}.description`, errors);
    const unitPrice = validateUnitPrice(item.unitPrice, `${label}.unitPrice`, errors);

    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > MAX_PRISMA_INT) {
        errors.push(`${label}.quantity must be a positive integer.`);
    }

    if (errors.length > 0) {
        return { errors };
    }

    const value = {
        modelNumber,
        quantity: item.quantity,
        unit,
        unitPrice
    };
    if (description !== undefined) {
        value.description = description;
    }

    return { value };
};

const validateOrderBody = (body) => {
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return { errors: ["Request body must be a JSON object."] };
    }

    const errors = Object.keys(body)
        .filter((field) => !ORDER_FIELDS.includes(field))
        .map((field) => `Unknown field: ${field}.`);

    const orderNumber = validateNonBlankString(body.orderNumber, "orderNumber", errors);
    const orderDate = validateDate(body.orderDate, "orderDate", errors);
    const currency = validateNonBlankString(body.currency, "currency", errors);
    const notes = validateOptionalString(body, "notes", "notes", errors);

    const items = [];
    if (!Array.isArray(body.items) || body.items.length === 0) {
        errors.push("items must contain at least one order item.");
    } else {
        body.items.forEach((item, index) => {
            const validation = validateOrderItem(item, index);
            if (validation.errors) {
                errors.push(...validation.errors);
            } else {
                items.push(validation.value);
            }
        });
    }

    if (errors.length > 0) {
        return { errors };
    }

    const value = { orderNumber, orderDate, currency, items };
    if (notes !== undefined) {
        value.notes = notes;
    }

    return { value };
};

const validateOrderUpdateBody = (body) => {
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return { errors: ["Request body must be a JSON object."] };
    }
    const errors = Object.keys(body)
        .filter((field) => !EDIT_ORDER_FIELDS.includes(field))
        .map((field) => `Unknown field: ${field}.`);
    const orderNumber = validateNonBlankString(body.orderNumber, "orderNumber", errors);
    const orderDate = validateDate(body.orderDate, "orderDate", errors);
    const notes = validateOptionalString(body, "notes", "notes", errors);
    const items = [];
    const seenIds = new Set();
    if (!Array.isArray(body.items) || body.items.length === 0) {
        errors.push("items must contain at least one order item.");
    } else {
        body.items.forEach((item, index) => {
            const label = `items[${index}]`;
            if (item === null || typeof item !== "object" || Array.isArray(item)) {
                errors.push(`${label} must be a JSON object.`);
                return;
            }
            Object.keys(item).filter((field) => !EDIT_ITEM_FIELDS.includes(field))
                .forEach((field) => errors.push(`Unknown field: ${label}.${field}.`));
            let id;
            if (Object.prototype.hasOwnProperty.call(item, "id")) {
                if (!Number.isInteger(item.id) || item.id <= 0 || item.id > MAX_PRISMA_INT) {
                    errors.push(`${label}.id must be a positive integer.`);
                } else if (seenIds.has(item.id)) {
                    errors.push(`Duplicate existing item ID: ${item.id}.`);
                } else {
                    id = item.id;
                    seenIds.add(id);
                }
            }
            const modelNumber = validateNonBlankString(item.modelNumber, `${label}.modelNumber`, errors);
            const unit = validateNonBlankString(item.unit, `${label}.unit`, errors);
            const description = validateOptionalString(item, "description", `${label}.description`, errors);
            const unitPrice = validateUnitPrice(item.unitPrice, `${label}.unitPrice`, errors);
            if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > MAX_PRISMA_INT) {
                errors.push(`${label}.quantity must be a positive integer.`);
            }
            items.push({ id, modelNumber, description, quantity: item.quantity, unit, unitPrice });
        });
    }
    if (errors.length > 0) return { errors };
    return { value: { orderNumber, orderDate, notes, items } };
};

const validateOrderId = (rawId) => validatePositiveIntId(rawId, "Order ID");

module.exports = {
    validateOrderBody,
    validateOrderId,
    validateOrderUpdateBody
};

const { validatePositiveIntId } = require("./commonValidation");

const PAYMENT_FIELDS = ["amount", "paymentDate", "reference", "notes"];

const validatePaymentBody = (body) => {
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return { errors: ["Request body must be a JSON object."] };
    }

    const errors = Object.keys(body)
        .filter((field) => !PAYMENT_FIELDS.includes(field))
        .map((field) => `Unknown field: ${field}.`);

    let amount;
    if (typeof body.amount !== "string" || !/^\d+(?:\.\d+)?$/.test(body.amount.trim())) {
        errors.push("amount must be a positive decimal string.");
    } else {
        amount = body.amount.trim();
        const [integerPart, fractionPart = ""] = amount.split(".");
        if (integerPart.length > 35 || fractionPart.length > 30 || integerPart.length + fractionPart.length > 65) {
            errors.push("amount exceeds the supported decimal precision.");
        } else if (/^0+(?:\.0+)?$/.test(amount)) {
            errors.push("amount must be greater than zero.");
        }
    }

    let paymentDate;
    if (typeof body.paymentDate !== "string" || body.paymentDate.trim().length === 0) {
        errors.push("paymentDate must be a valid date string.");
    } else {
        const value = body.paymentDate.trim();
        paymentDate = new Date(value);
        if (Number.isNaN(paymentDate.getTime()) || (/^\d{4}-\d{2}-\d{2}$/.test(value) && paymentDate.toISOString().slice(0, 10) !== value)) {
            errors.push("paymentDate must be a valid date string.");
        }
    }

    const value = { amount, paymentDate };
    for (const field of ["reference", "notes"]) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            if (typeof body[field] !== "string") {
                errors.push(`${field} must be a string when provided.`);
            } else {
                value[field] = body[field].trim();
            }
        }
    }

    return errors.length > 0 ? { errors } : { value };
};

const validatePaymentOrderId = (rawId) => validatePositiveIntId(rawId, "Order ID");

module.exports = {
    validatePaymentBody,
    validatePaymentOrderId
};

const EDITABLE_SUPPLIER_FIELDS = ["name", "location", "mobileNumber"];
const OPTIONAL_STRING_FIELDS = ["location", "mobileNumber"];
const { validatePositiveIntId } = require("./commonValidation");

// Return structured validation results so controllers can consistently produce 400 responses.
const validateSupplierId = (rawId) => validatePositiveIntId(rawId, "Supplier ID");

const validateSupplierFields = (body, { requireName, requireAtLeastOne }) => {
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return { errors: ["Request body must be a JSON object."] };
    }

    const suppliedFields = Object.keys(body);
    const unknownFields = suppliedFields.filter(
        (field) => !EDITABLE_SUPPLIER_FIELDS.includes(field)
    );
    const errors = unknownFields.map((field) => `Unknown field: ${field}.`);
    const suppliedEditableFields = suppliedFields.filter((field) =>
        EDITABLE_SUPPLIER_FIELDS.includes(field)
    );

    if (requireAtLeastOne && suppliedEditableFields.length === 0) {
        errors.push("At least one editable supplier field is required.");
    }

    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    if ((requireName || hasName) && (typeof body.name !== "string" || body.name.trim().length === 0)) {
        errors.push("Name must be a non-empty string.");
    }

    for (const field of OPTIONAL_STRING_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, field) && typeof body[field] !== "string") {
            errors.push(`${field} must be a string when provided.`);
        }
    }

    if (errors.length > 0) {
        return { errors };
    }

    const value = {};
    if (hasName) {
        value.name = body.name.trim();
    }

    for (const field of OPTIONAL_STRING_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            value[field] = body[field].trim();
        }
    }

    return { value };
};

const validateSupplierBody = (body) => validateSupplierFields(body, {
    requireName: true,
    requireAtLeastOne: false
});

const validateSupplierUpdateBody = (body) => validateSupplierFields(body, {
    requireName: false,
    requireAtLeastOne: true
});

module.exports = {
    validateSupplierBody,
    validateSupplierId,
    validateSupplierUpdateBody
};

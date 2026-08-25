const MAX_PRISMA_INT = 2147483647;

const validatePositiveIntId = (rawId, label) => {
    if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) {
        return { error: `${label} must be a positive integer.` };
    }

    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id > MAX_PRISMA_INT) {
        return { error: `${label} must be a positive integer.` };
    }

    return { value: id };
};

module.exports = {
    MAX_PRISMA_INT,
    validatePositiveIntId
};

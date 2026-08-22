const {
    createSupplier,
    deleteSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier
} = require("../services/supplierService");
const {
    validateSupplierBody,
    validateSupplierId,
    validateSupplierUpdateBody
} = require("../validation/supplierValidation");

const createSupplierController = async (req, res, next) => {
    const validation = validateSupplierBody(req.body);
    if (validation.errors) {
        return res.status(400).json({
            error: "Invalid supplier data.",
            details: validation.errors
        });
    }

    try {
        const newSupplier = await createSupplier(validation.value);
        return res.status(201).json(newSupplier);
    } catch (error) {
        return next(error);
    }
};

const getAllSuppliersController = async (req, res, next) => {
    try {
        const suppliers = await getAllSuppliers();
        return res.status(200).json(suppliers);
    } catch (error) {
        return next(error);
    }
};

const getSupplierByIdController = async (req, res, next) => {
    const validation = validateSupplierId(req.params.id);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const supplier = await getSupplierById(validation.value);
        if (!supplier) {
            return res.status(404).json({ error: "Supplier not found." });
        }

        return res.status(200).json(supplier);
    } catch (error) {
        return next(error);
    }
};

const updateSupplierController = async (req, res, next) => {
    const idValidation = validateSupplierId(req.params.id);
    if (idValidation.error) {
        return res.status(400).json({ error: idValidation.error });
    }

    const bodyValidation = validateSupplierUpdateBody(req.body);
    if (bodyValidation.errors) {
        return res.status(400).json({
            error: "Invalid supplier data.",
            details: bodyValidation.errors
        });
    }

    try {
        const supplier = await updateSupplier(idValidation.value, bodyValidation.value);
        return res.status(200).json(supplier);
    } catch (error) {
        return next(error);
    }
};

const deleteSupplierController = async (req, res, next) => {
    const validation = validateSupplierId(req.params.id);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        await deleteSupplier(validation.value);
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createSupplierController,
    deleteSupplierController,
    getAllSuppliersController,
    getSupplierByIdController,
    updateSupplierController
};

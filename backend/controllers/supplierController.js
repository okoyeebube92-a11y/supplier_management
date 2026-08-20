const { createSupplier, getAllSuppliers } = require("../services/supplierService");
const createSupplierController = async (req, res) => {
    const supplierData = req.body;
    const newSupplier = await createSupplier(supplierData);
    res.json(newSupplier);
};

const getAllSuppliersController = async (req, res) => {
    const suppliers = await getAllSuppliers();
    res.json(suppliers);
};

module.exports = {
    createSupplierController,
    getAllSuppliersController
};
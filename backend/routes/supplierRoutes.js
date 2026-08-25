const express = require("express");
const router = express.Router();
const {
    createSupplierController,
    deleteSupplierController,
    getAllSuppliersController,
    getSupplierByIdController,
    updateSupplierController
} = require("../controllers/supplierController");
const {
    createOrderController,
    getSupplierOrdersController
} = require("../controllers/orderController");

router.post("/", createSupplierController);
router.get("/", getAllSuppliersController);
router.get("/:id", getSupplierByIdController);
router.patch("/:id", updateSupplierController);
router.delete("/:id", deleteSupplierController);
router.post("/:supplierId/orders", createOrderController);
router.get("/:supplierId/orders", getSupplierOrdersController);

module.exports = router;

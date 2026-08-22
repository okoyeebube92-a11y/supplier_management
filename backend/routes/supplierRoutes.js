const express = require("express");
const router = express.Router();
const {
    createSupplierController,
    deleteSupplierController,
    getAllSuppliersController,
    getSupplierByIdController,
    updateSupplierController
} = require("../controllers/supplierController");

router.post("/", createSupplierController);
router.get("/", getAllSuppliersController);
router.get("/:id", getSupplierByIdController);
router.patch("/:id", updateSupplierController);
router.delete("/:id", deleteSupplierController);

module.exports = router;

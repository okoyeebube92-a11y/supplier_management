const express = require("express");
const router = express.Router();
const { createSupplierController, getAllSuppliersController } = require("../controllers/supplierController");
router.post("/", createSupplierController);
router.get("/", getAllSuppliersController);

module.exports = router;
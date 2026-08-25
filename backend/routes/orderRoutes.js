const express = require("express");
const { getOrderDetailController } = require("../controllers/orderController");
const { createConsolidationController } = require("../controllers/consolidationController");
const {
    createPaymentController,
    getOrderPaymentsController
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/:orderId", getOrderDetailController);
router.post("/:orderId/payments", createPaymentController);
router.get("/:orderId/payments", getOrderPaymentsController);
router.post("/:orderId/items/:itemId/consolidations", createConsolidationController);

module.exports = router;

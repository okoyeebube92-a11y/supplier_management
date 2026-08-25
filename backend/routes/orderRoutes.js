const express = require("express");
const { getOrderDetailController } = require("../controllers/orderController");
const { createConsolidationController } = require("../controllers/consolidationController");

const router = express.Router();

router.get("/:orderId", getOrderDetailController);
router.post("/:orderId/items/:itemId/consolidations", createConsolidationController);

module.exports = router;

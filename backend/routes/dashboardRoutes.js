const express = require("express");
const { getDashboardController } = require("../controllers/dashboardController");

const router = express.Router();
router.get("/", getDashboardController);

module.exports = router;

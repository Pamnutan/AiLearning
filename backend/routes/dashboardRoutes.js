const express = require("express");
const router = express.Router();

const { getStats, getRecentOrders } = require("../controllers/dashboardController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Stats route
router.get("/stats", authenticateToken, getStats);

// Recent orders route
router.get("/recent-orders", authenticateToken, getRecentOrders);

module.exports = router;

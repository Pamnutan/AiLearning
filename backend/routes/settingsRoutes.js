const express = require("express");
const router = express.Router();

// 1. Double-check this path to your controller
const { changePassword } = require("../controllers/settingsController");

// 2. Double-check this path to your middleware file
const { authenticateToken } = require("../middleware/authMiddleware"); 

// 3. Ensure both arguments here are defined functions
router.post("/change-password", authenticateToken, changePassword);

module.exports = router;


// const express = require("express");
// const { changePassword } = require("../controllers/settingsController");
// const verifyToken = require("../middleware/authMiddleware");

// const router = express.Router();

// // Protect the endpoint with the JWT validation middleware layer
// router.post("/change-password", verifyToken, changePassword);

// module.exports = router;

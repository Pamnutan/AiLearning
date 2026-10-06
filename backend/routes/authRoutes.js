const express = require("express");
const {
  register,
  login,
  forgotPassword,  // 1. Import forgotPassword
  resetPassword,   // 2. Import resetPassword
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

// 3. New routes for password recovery flow
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;


// const express = require("express");

// const {
//   register,
//   login
// } = require("../controllers/authController");

// const router =
//   express.Router();


// router.post(
//   "/register",
//   register
// );


// router.post(
//   "/login",
//   login
// );


// module.exports = router;

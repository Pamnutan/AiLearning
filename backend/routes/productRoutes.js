const express = require("express");

const {
  getProducts,
  createProduct,
  updateProduct, // Implemented and imported from controller
  deleteProduct
} = require("../controllers/productController");

const {
  authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  getProducts
);

router.post(
  "/",
  authenticateToken,
  createProduct
);

// NEW: Put route to update product information by id
router.put(
  "/:id",
  authenticateToken,
  updateProduct
);

router.delete(
  "/:id",
  authenticateToken,
  deleteProduct
);

module.exports = router;

// const express = require("express");

// const {
//   getProducts,
//   createProduct,
//   deleteProduct
// } = require("../controllers/productController");

// const {
//   authenticateToken
// } = require("../middleware/authMiddleware");


// const router =
//   express.Router();


// router.get(
//   "/",
//   authenticateToken,
//   getProducts
// );


// router.post(
//   "/",
//   authenticateToken,
//   createProduct
// );


// router.delete(
//   "/:id",
//   authenticateToken,
//   deleteProduct
// );


// module.exports = router;


// const express = require("express");

// const {
//   getProducts,
//   createProduct,
//   deleteProduct
// } = require("../controllers/productController");

// const router =
//   express.Router();

// router.get(
//   "/",
//   getProducts
// );

// router.post(
//   "/",
//   createProduct
// );

// router.delete(
//   "/:id",
//   deleteProduct
// );

// module.exports = router;

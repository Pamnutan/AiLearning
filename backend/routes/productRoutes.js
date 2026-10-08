const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'vendor'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin', 'vendor'), updateProduct)
  .delete(protect, authorize('admin', 'vendor'), deleteProduct);

module.exports = router;

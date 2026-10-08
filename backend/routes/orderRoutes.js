const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderItemStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOrder)
  .get(protect, authorize('customer'), getMyOrders)
  .get(protect, authorize('vendor'), getVendorOrders);

router.route('/item/:orderItemId')
  .put(protect, authorize('vendor'), updateOrderItemStatus);

module.exports = router;

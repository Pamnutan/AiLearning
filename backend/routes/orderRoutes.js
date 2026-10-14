const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  getVendorOrders,
  updateOrderItemStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

router.route('/vendor')
  .get(protect, authorize('vendor', 'admin'), getVendorOrders);

router.route('/:id')
  .get(protect, getOrder);

router.route('/item/:orderItemId')
  .put(protect, authorize('vendor', 'admin'), updateOrderItemStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createStore,
  getStore,
  getAllStores,
  updateStore,
  deleteStore
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All store routes require authentication
router.use(protect);

router.route('/')
  .get(getAllStores)
  .post(authorize('admin', 'vendor'), createStore);

router.route('/:id')
  .get(getStore)
  .put(authorize('admin', 'vendor'), updateStore)
  .delete(authorize('admin', 'vendor'), deleteStore);

module.exports = router;

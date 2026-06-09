const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.get(
  '/',
  authMiddleware,
  orderController.getOrders
);

router.get(
  '/:id',
  authMiddleware,
  orderController.getOrderById
);

module.exports = router;
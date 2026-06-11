const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all orders for logged-in user (buyer or farmer)
router.get('/', authMiddleware, orderController.getOrders);

// Get single order by ID
router.get('/:id', authMiddleware, orderController.getOrderById);

module.exports = router;

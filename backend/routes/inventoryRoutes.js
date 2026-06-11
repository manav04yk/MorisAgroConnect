const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Add/Update inventory (farmers only)
router.post('/', authMiddleware, roleMiddleware('farmer'), inventoryController.createOrUpdateInventory);

// Reduce inventory when buyer reserves surplus food (buyers only)
router.post('/reduce', authMiddleware, roleMiddleware('buyer'), inventoryController.reduceInventory);

// Get farmer inventory
router.get('/:farmerId', authMiddleware, inventoryController.getFarmerInventory);

// Delete product from inventory (farmers only)
router.delete('/:productId', authMiddleware, roleMiddleware('farmer'), inventoryController.deleteProduct);

module.exports = router;

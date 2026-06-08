const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post(
  '/',
  authMiddleware,
  roleMiddleware('farmer'),
  inventoryController.createOrUpdateInventory
);

router.get(
  '/:farmerId',
  authMiddleware,
  inventoryController.getFarmerInventory
);

module.exports = router;
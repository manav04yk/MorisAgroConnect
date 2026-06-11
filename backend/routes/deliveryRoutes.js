const express = require('express');
const router = express.Router();

const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
  '/',
  authMiddleware,
  deliveryController.getDeliveries
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('driver', 'admin'),
  deliveryController.updateDeliveryStatus
);

module.exports = router;

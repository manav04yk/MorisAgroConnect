const express = require('express');
const router = express.Router();

const wasteController = require('../controllers/wasteController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post(
  '/',
  authMiddleware,
  roleMiddleware('farmer'),
  wasteController.createWasteListing
);

router.get(
  '/',
  authMiddleware,
  wasteController.getWasteListings
);

module.exports = router;

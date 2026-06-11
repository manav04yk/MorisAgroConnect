const express = require('express');
const router = express.Router();

const sustainabilityController = require('../controllers/sustainabilityController');
const authMiddleware = require('../middleware/authMiddleware');

router.get(
  '/:buyerId',
  authMiddleware,
  sustainabilityController.getSustainabilityMetrics
);

module.exports = router;

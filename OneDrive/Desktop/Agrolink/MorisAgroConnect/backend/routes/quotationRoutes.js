const express = require('express');
const router = express.Router();

const quotationController = require('../controllers/quotationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
  '/',
  authMiddleware,
  quotationController.getQuotations
);

router.patch(
  '/:id/approve',
  authMiddleware,
  roleMiddleware('buyer'),
  quotationController.approveQuotation
);

module.exports = router;
const express = require('express');
const router = express.Router();

const quotationController = require('../controllers/quotationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get all quotations (buyer or farmer sees their own)
router.get('/', authMiddleware, quotationController.getQuotations);

// Get single quotation by ID
router.get('/:id', authMiddleware, quotationController.getQuotationById);

// Create quotation (Called by Agent 4 - Procurement Agent)
router.post('/', authMiddleware, quotationController.createQuotation);

// Approve quotation (Buyer only - then Agent 5 should generate invoice)
router.patch('/:id/approve', authMiddleware, roleMiddleware('buyer'), quotationController.approveQuotation);

module.exports = router;

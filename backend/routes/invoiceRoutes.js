const express = require('express');
const router = express.Router();

const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get(
  '/',
  authMiddleware,
  invoiceController.getInvoices
);

module.exports = router;

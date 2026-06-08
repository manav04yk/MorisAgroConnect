const express = require('express');
const router = express.Router();

const webhookController = require('../controllers/webhookController');

router.post(
  '/salesforce',
  webhookController.handleSalesforceWebhook
);

module.exports = router;
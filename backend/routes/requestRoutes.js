const express = require('express');
const router = express.Router();

const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get all requests for the logged-in user (buyer sees their own)
router.get('/', authMiddleware, requestController.getRequests);

// Get single request by ID
router.get('/:id', authMiddleware, requestController.getRequestById);

// Create new request (buyers only)
router.post('/', authMiddleware, roleMiddleware('buyer'), requestController.createRequest);

module.exports = router;

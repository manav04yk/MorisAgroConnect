const express = require('express');
const router = express.Router();

const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post(
  '/',
  authMiddleware,
  roleMiddleware('buyer'),
  requestController.createRequest
);

router.get(
  '/:id',
  authMiddleware,
  requestController.getRequestById
);

module.exports = router;
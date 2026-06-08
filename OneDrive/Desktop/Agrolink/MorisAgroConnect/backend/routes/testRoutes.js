const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Any logged-in user can access this
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You accessed a protected route',
    user: req.user
  });
});

// Only buyers can access this
router.get('/buyer-only', authMiddleware, roleMiddleware('buyer'), (req, res) => {
  res.json({
    message: 'You accessed a buyer-only route',
    user: req.user
  });
});

// Only farmers can access this
router.get('/farmer-only', authMiddleware, roleMiddleware('farmer'), (req, res) => {
  res.json({
    message: 'You accessed a farmer-only route',
    user: req.user
  });
});

module.exports = router;
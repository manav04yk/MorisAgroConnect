const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes (with authentication)

// Get user by name (for marketplace reservations) - any authenticated user
router.get('/search', authMiddleware, userController.getUserByName);

// Get all users (admin only)
router.get('/', authMiddleware, roleMiddleware('admin'), userController.getAllUsers);

// Get user by ID (admin or self)
router.get('/:id', authMiddleware, userController.getUserById);

// Delete user (admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), userController.deleteUser);

// Update user role (admin only)
router.patch('/:id/role', authMiddleware, roleMiddleware('admin'), userController.updateUserRole);

module.exports = router;
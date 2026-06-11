const db = require('../config/db');

// Get user by name (for marketplace reservations)
exports.getUserByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        error: 'Name parameter is required'
      });
    }

    const [users] = await db.query(
      'SELECT id, name, email, role, location FROM users WHERE name = ?',
      [name]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user by name error:', error);
    res.status(500).json({
      error: 'Server error while fetching user'
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, location, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Server error while fetching users'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      'SELECT id, name, email, role, location, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Users can only view their own data unless they are admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Forbidden. You can only view your own user data'
      });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Server error while fetching user'
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Check if user exists
    const [users] = await connection.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const userToDelete = users[0];

    // Prevent deleting yourself
    if (userToDelete.id === req.user.id) {
      await connection.rollback();
      return res.status(400).json({
        error: 'You cannot delete your own account'
      });
    }

    // Prevent deleting other admins
    if (userToDelete.role === 'admin') {
      await connection.rollback();
      return res.status(403).json({
        error: 'Cannot delete admin users'
      });
    }

    // Delete user (cascade will handle related records)
    await connection.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    await connection.commit();

    res.json({
      message: 'User deleted successfully',
      deleted_user: {
        id: userToDelete.id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Server error while deleting user'
    });
  } finally {
    connection.release();
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['buyer', 'farmer', 'driver', 'admin'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be buyer, farmer, driver, or admin'
      });
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Prevent changing your own role
    if (users[0].id === req.user.id) {
      return res.status(400).json({
        error: 'You cannot change your own role'
      });
    }

    await db.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    const [updatedUser] = await db.query(
      'SELECT id, name, email, role, location, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User role updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Server error while updating user role'
    });
  }
};
const db = require('../config/db');

exports.createOrUpdateInventory = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { name, quantity_kg, price_per_kg, unit } = req.body;

    if (!name || quantity_kg === undefined || price_per_kg === undefined) {
      return res.status(400).json({
        error: 'Product name, quantity_kg, and price_per_kg are required'
      });
    }

    if (Number(quantity_kg) < 0 || Number(price_per_kg) < 0) {
      return res.status(400).json({
        error: 'Quantity and price cannot be negative'
      });
    }

    const [existingProducts] = await db.query(
      'SELECT * FROM products WHERE farmer_id = ? AND name = ?',
      [farmerId, name]
    );

    if (existingProducts.length > 0) {
      const productId = existingProducts[0].id;

      await db.query(
        `UPDATE products
         SET quantity_kg = ?, price_per_kg = ?, unit = ?
         WHERE id = ?`,
        [quantity_kg, price_per_kg, unit || 'kg', productId]
      );

      const [updatedProduct] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );

      return res.json({
        message: 'Inventory updated successfully',
        product: updatedProduct[0]
      });
    }

    const [result] = await db.query(
      `INSERT INTO products (farmer_id, name, quantity_kg, price_per_kg, unit)
       VALUES (?, ?, ?, ?, ?)`,
      [farmerId, name, quantity_kg, price_per_kg, unit || 'kg']
    );

    const [newProduct] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Inventory created successfully',
      product: newProduct[0]
    });
  } catch (error) {
    console.error('Create/update inventory error:', error);
    res.status(500).json({
      error: 'Server error while saving inventory'
    });
  }
};

exports.getFarmerInventory = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const [products] = await db.query(
      `SELECT 
        p.id,
        p.farmer_id,
        u.name AS farmer_name,
        p.name,
        p.quantity_kg,
        p.price_per_kg,
        p.unit,
        p.updated_at
       FROM products p
       JOIN users u ON p.farmer_id = u.id
       WHERE p.farmer_id = ?
       ORDER BY p.updated_at DESC`,
      [farmerId]
    );

    res.json(products);
  } catch (error) {
    console.error('Get farmer inventory error:', error);
    res.status(500).json({
      error: 'Server error while fetching inventory'
    });
  }
};
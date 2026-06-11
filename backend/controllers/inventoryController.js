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

// Reduce inventory when buyer reserves surplus food
exports.reduceInventory = async (req, res) => {
  try {
    const { farmer_id, product_name, quantity_kg } = req.body;

    if (!farmer_id || !product_name || quantity_kg === undefined) {
      return res.status(400).json({
        error: 'farmer_id, product_name, and quantity_kg are required'
      });
    }

    if (Number(quantity_kg) <= 0) {
      return res.status(400).json({
        error: 'quantity_kg must be greater than 0'
      });
    }

    const [products] = await db.query(
      'SELECT * FROM products WHERE farmer_id = ? AND name = ?',
      [farmer_id, product_name]
    );

    if (products.length === 0) {
      return res.status(404).json({
        error: `Product "${product_name}" not found in farmer's inventory`
      });
    }

    const product = products[0];
    const newQuantity = product.quantity_kg - Number(quantity_kg);

    if (newQuantity < 0) {
      return res.status(400).json({
        error: `Insufficient inventory. Only ${product.quantity_kg} kg of ${product_name} available`
      });
    }

    await db.query(
      'UPDATE products SET quantity_kg = ? WHERE id = ?',
      [newQuantity, product.id]
    );

    const [updatedProduct] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [product.id]
    );

    res.json({
      message: 'Inventory updated successfully',
      product: updatedProduct[0],
      previous_quantity: product.quantity_kg,
      new_quantity: newQuantity,
      reduced_by: quantity_kg
    });
  } catch (error) {
    console.error('Reduce inventory error:', error);
    res.status(500).json({
      error: 'Server error while reducing inventory'
    });
  }
};

// Delete product from inventory
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const farmerId = req.user.id;

    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND farmer_id = ?',
      [productId, farmerId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        error: 'Product not found or does not belong to you'
      });
    }

    await db.query('DELETE FROM products WHERE id = ?', [productId]);

    res.json({
      message: 'Product deleted successfully',
      product: products[0]
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: 'Server error while deleting product'
    });
  }
};

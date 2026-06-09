const db = require('../config/db');

exports.createRequest = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { product_name, quantity_kg, required_date } = req.body;

    if (!product_name || quantity_kg === undefined || !required_date) {
      return res.status(400).json({
        error: 'product_name, quantity_kg, and required_date are required'
      });
    }

    if (Number(quantity_kg) <= 0) {
      return res.status(400).json({
        error: 'quantity_kg must be greater than 0'
      });
    }

    const [result] = await db.query(
      `INSERT INTO demand_requests 
       (buyer_id, product_name, quantity_kg, required_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [buyerId, product_name, quantity_kg, required_date, 'pending']
    );

    const [newRequest] = await db.query(
      `SELECT 
        dr.id,
        dr.buyer_id,
        u.name AS buyer_name,
        dr.product_name,
        dr.quantity_kg,
        dr.required_date,
        dr.status,
        dr.created_at
       FROM demand_requests dr
       JOIN users u ON dr.buyer_id = u.id
       WHERE dr.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Produce request created successfully',
      request: newRequest[0]
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      error: 'Server error while creating produce request'
    });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await db.query(
      `SELECT 
        dr.id,
        dr.buyer_id,
        u.name AS buyer_name,
        dr.product_name,
        dr.quantity_kg,
        dr.required_date,
        dr.status,
        dr.created_at
       FROM demand_requests dr
       JOIN users u ON dr.buyer_id = u.id
       WHERE dr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    const request = requests[0];

    if (req.user.role === 'buyer' && request.buyer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden. You can only view your own requests'
      });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      error: 'Server error while fetching request'
    });
  }
};
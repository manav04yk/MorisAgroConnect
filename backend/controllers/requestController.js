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

exports.getRequests = async (req, res) => {
  try {
    const buyerId = req.user.id;
    
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
       WHERE dr.buyer_id = ?
       ORDER BY dr.created_at DESC`,
      [buyerId]
    );
    
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      error: 'Server error while fetching requests'
    });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

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
       WHERE dr.id = ? AND dr.buyer_id = ?`,
      [id, buyerId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    res.json(requests[0]);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      error: 'Server error while fetching request'
    });
  }
};

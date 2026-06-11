const db = require('../config/db');

// Get quotations for buyer or farmer
exports.getQuotations = async (req, res) => {
  try {
    let query = `
      SELECT
        q.id,
        q.request_id,
        q.farmer_id,
        farmer.name AS farmer_name,
        q.buyer_id,
        buyer.name AS buyer_name,
        dr.product_name,
        dr.quantity_kg,
        dr.required_date,
        q.total_amount,
        q.status,
        q.created_at
      FROM quotations q
      JOIN users farmer ON q.farmer_id = farmer.id
      JOIN users buyer ON q.buyer_id = buyer.id
      JOIN demand_requests dr ON q.request_id = dr.id
    `;

    const params = [];

    if (req.user.role === 'buyer') {
      query += ' WHERE q.buyer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'farmer') {
      query += ' WHERE q.farmer_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY q.created_at DESC';

    const [quotations] = await db.query(query, params);
    res.json(quotations);
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({
      error: 'Server error while fetching quotations'
    });
  }
};

// Get single quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [quotations] = await db.query(
      `
      SELECT
        q.id,
        q.request_id,
        q.farmer_id,
        farmer.name AS farmer_name,
        q.buyer_id,
        buyer.name AS buyer_name,
        dr.product_name,
        dr.quantity_kg,
        dr.required_date,
        q.total_amount,
        q.status,
        q.created_at
      FROM quotations q
      JOIN users farmer ON q.farmer_id = farmer.id
      JOIN users buyer ON q.buyer_id = buyer.id
      JOIN demand_requests dr ON q.request_id = dr.id
      WHERE q.id = ?
      `,
      [id]
    );

    if (quotations.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const quotation = quotations[0];

    // Check authorization
    if (req.user.role === 'buyer' && quotation.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.user.role === 'farmer' && quotation.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(quotation);
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({
      error: 'Server error while fetching quotation'
    });
  }
};

// Create quotation (Called by Agent 4 - Procurement Agent)
exports.createQuotation = async (req, res) => {
  try {
    const { request_id, farmer_id, buyer_id, total_amount } = req.body;

    if (!request_id || !farmer_id || !buyer_id || !total_amount) {
      return res.status(400).json({
        error: 'request_id, farmer_id, buyer_id, and total_amount are required'
      });
    }

    // Verify request exists
    const [requests] = await db.query(
      'SELECT * FROM demand_requests WHERE id = ?',
      [request_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Demand request not found' });
    }

    // Verify farmer exists
    const [farmers] = await db.query(
      'SELECT * FROM users WHERE id = ? AND role = ?',
      [farmer_id, 'farmer']
    );

    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Verify buyer exists
    const [buyers] = await db.query(
      'SELECT * FROM users WHERE id = ? AND role = ?',
      [buyer_id, 'buyer']
    );

    if (buyers.length === 0) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const [result] = await db.query(
      `INSERT INTO quotations (request_id, farmer_id, buyer_id, total_amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [request_id, farmer_id, buyer_id, total_amount, 'pending']
    );

    // Update demand request status
    await db.query(
      'UPDATE demand_requests SET status = ? WHERE id = ?',
      ['quoted', request_id]
    );

    const [newQuotation] = await db.query(
      `
      SELECT
        q.id,
        q.request_id,
        q.farmer_id,
        farmer.name AS farmer_name,
        q.buyer_id,
        buyer.name AS buyer_name,
        dr.product_name,
        dr.quantity_kg,
        q.total_amount,
        q.status,
        q.created_at
      FROM quotations q
      JOIN users farmer ON q.farmer_id = farmer.id
      JOIN users buyer ON q.buyer_id = buyer.id
      JOIN demand_requests dr ON q.request_id = dr.id
      WHERE q.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Quotation created successfully',
      quotation: newQuotation[0]
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({
      error: 'Server error while creating quotation'
    });
  }
};

// Approve quotation (Called by Buyer, then Agent 5 should generate invoice)
exports.approveQuotation = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const quotationId = req.params.id;
    const buyerId = req.user.id;

    await connection.beginTransaction();

    const [quotations] = await connection.query(
      'SELECT * FROM quotations WHERE id = ?',
      [quotationId]
    );

    if (quotations.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const quotation = quotations[0];

    if (quotation.buyer_id !== buyerId) {
      await connection.rollback();
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (quotation.status === 'approved') {
      await connection.rollback();
      return res.status(400).json({ error: 'Quotation already approved' });
    }

    // Only update status - NO automatic order/invoice/delivery creation
    await connection.query(
      'UPDATE quotations SET status = ? WHERE id = ?',
      ['approved', quotationId]
    );

    await connection.commit();

    res.json({
      message: 'Quotation approved. Awaiting Agent 5 to generate invoice.',
      quotation_id: quotationId,
      request_id: quotation.request_id,
      buyer_id: quotation.buyer_id,
      farmer_id: quotation.farmer_id,
      total_amount: quotation.total_amount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Approve quotation error:', error);
    res.status(500).json({
      error: 'Server error while approving quotation'
    });
  } finally {
    connection.release();
  }
};

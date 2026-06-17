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

// Create quotation
exports.createQuotation = async (req, res) => {
  try {
    const { request_id, farmer_id, buyer_id, total_amount } = req.body;

    if (!request_id || !farmer_id || !buyer_id || !total_amount) {
      return res.status(400).json({
        error: 'request_id, farmer_id, buyer_id, and total_amount are required'
      });
    }

    const [requests] = await db.query(
      'SELECT * FROM demand_requests WHERE id = ?',
      [request_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Demand request not found' });
    }

    const [farmers] = await db.query(
      'SELECT * FROM users WHERE id = ? AND role = ?',
      [farmer_id, 'farmer']
    );

    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const [buyers] = await db.query(
      'SELECT * FROM users WHERE id = ? AND role = ?',
      [buyer_id, 'buyer']
    );

    if (buyers.length === 0) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const [result] = await db.query(
      `INSERT INTO quotations 
       (request_id, farmer_id, buyer_id, total_amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [request_id, farmer_id, buyer_id, total_amount, 'pending']
    );

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

// Approve quotation, then create order and invoice
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

    if (quotation.status === 'rejected') {
      await connection.rollback();
      return res.status(400).json({
        error: 'Rejected quotation cannot be approved'
      });
    }

    if (quotation.status === 'approved') {
      const [existingOrders] = await connection.query(
        'SELECT * FROM orders WHERE quotation_id = ?',
        [quotationId]
      );

      if (existingOrders.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Quotation already approved'
        });
      }

      // If quotation is approved but order is missing, continue and repair it.
    } else {
      await connection.query(
        'UPDATE quotations SET status = ? WHERE id = ?',
        ['approved', quotationId]
      );
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (quotation_id, buyer_id, farmer_id, status)
       VALUES (?, ?, ?, ?)`,
      [
        quotation.id,
        quotation.buyer_id,
        quotation.farmer_id,
        'confirmed'
      ]
    );

    const orderId = orderResult.insertId;

    const [invoiceResult] = await connection.query(
      `INSERT INTO invoices
       (order_id, amount, due_date, status, pdf_url)
       VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 14 DAY), ?, ?)`,
      [
        orderId,
        quotation.total_amount,
        'pending',
        null
      ]
    );

    const [createdOrder] = await connection.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    const [createdInvoice] = await connection.query(
      'SELECT * FROM invoices WHERE id = ?',
      [invoiceResult.insertId]
    );

    await connection.commit();

    res.json({
      message: 'Quotation approved successfully. Order and invoice created.',
      quotation_id: Number(quotationId),
      order: createdOrder[0],
      invoice: createdInvoice[0]
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
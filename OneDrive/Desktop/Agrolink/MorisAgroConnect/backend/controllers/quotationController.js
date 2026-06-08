const db = require('../config/db');

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

exports.approveQuotation = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const quotationId = req.params.id;
    const buyerId = req.user.id;

    await connection.beginTransaction();

    const [quotations] = await connection.query(
      `SELECT * FROM quotations WHERE id = ?`,
      [quotationId]
    );

    if (quotations.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Quotation not found'
      });
    }

    const quotation = quotations[0];

    if (quotation.buyer_id !== buyerId) {
      await connection.rollback();
      return res.status(403).json({
        error: 'Forbidden. You can only approve your own quotations'
      });
    }

    if (quotation.status === 'approved') {
      await connection.rollback();
      return res.status(400).json({
        error: 'Quotation is already approved'
      });
    }

    if (quotation.status === 'rejected') {
      await connection.rollback();
      return res.status(400).json({
        error: 'Rejected quotation cannot be approved'
      });
    }

    await connection.query(
      `UPDATE quotations SET status = ? WHERE id = ?`,
      ['approved', quotationId]
    );

    const [orderResult] = await connection.query(
      `INSERT INTO orders (quotation_id, buyer_id, farmer_id, status)
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
      `INSERT INTO invoices (order_id, amount, due_date, status, pdf_url)
       VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 14 DAY), ?, ?)`,
      [
        orderId,
        quotation.total_amount,
        'pending',
        null
      ]
    );

    const invoiceId = invoiceResult.insertId;

    const [orders] = await connection.query(
      `SELECT * FROM orders WHERE id = ?`,
      [orderId]
    );

    const [invoices] = await connection.query(
      `SELECT * FROM invoices WHERE id = ?`,
      [invoiceId]
    );

    await connection.commit();

    res.json({
      message: 'Quotation approved successfully',
      order: orders[0],
      invoice: invoices[0]
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
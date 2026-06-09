const db = require('../config/db');

exports.getInvoices = async (req, res) => {
  try {
    let query = `
      SELECT
        i.id,
        i.order_id,
        i.amount,
        i.due_date,
        i.status,
        i.pdf_url,
        o.buyer_id,
        buyer.name AS buyer_name,
        o.farmer_id,
        farmer.name AS farmer_name,
        dr.product_name,
        dr.quantity_kg,
        o.status AS order_status
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users farmer ON o.farmer_id = farmer.id
      JOIN quotations q ON o.quotation_id = q.id
      JOIN demand_requests dr ON q.request_id = dr.id
    `;

    const params = [];

    if (req.user.role === 'buyer') {
      query += ' WHERE o.buyer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'farmer') {
      query += ' WHERE o.farmer_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY i.due_date ASC';

    const [invoices] = await db.query(query, params);

    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      error: 'Server error while fetching invoices'
    });
  }
};
const db = require('../config/db');

exports.getOrders = async (req, res) => {
  try {
    let query = `
      SELECT
        o.id,
        o.quotation_id,
        o.buyer_id,
        buyer.name AS buyer_name,
        o.farmer_id,
        farmer.name AS farmer_name,
        dr.product_name,
        dr.quantity_kg,
        q.total_amount,
        o.status,
        o.created_at
      FROM orders o
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

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.query(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Server error while fetching orders'
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `
      SELECT
        o.id,
        o.quotation_id,
        o.buyer_id,
        buyer.name AS buyer_name,
        o.farmer_id,
        farmer.name AS farmer_name,
        dr.product_name,
        dr.quantity_kg,
        dr.required_date,
        q.total_amount,
        o.status,
        o.created_at,
        i.id AS invoice_id,
        i.amount AS invoice_amount,
        i.due_date,
        i.status AS invoice_status,
        d.id AS delivery_id,
        d.driver_id,
        driver.name AS driver_name,
        d.route,
        d.eta,
        d.status AS delivery_status
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users farmer ON o.farmer_id = farmer.id
      JOIN quotations q ON o.quotation_id = q.id
      JOIN demand_requests dr ON q.request_id = dr.id
      LEFT JOIN invoices i ON i.order_id = o.id
      LEFT JOIN deliveries d ON d.order_id = o.id
      LEFT JOIN users driver ON d.driver_id = driver.id
      WHERE o.id = ?
      `,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const order = orders[0];

    if (req.user.role === 'buyer' && order.buyer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden. You can only view your own orders'
      });
    }

    if (req.user.role === 'farmer' && order.farmer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden. You can only view your own farm orders'
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by id error:', error);
    res.status(500).json({
      error: 'Server error while fetching order'
    });
  }
};

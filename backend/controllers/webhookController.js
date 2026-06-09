const db = require('../config/db');

exports.handleSalesforceWebhook = async (req, res) => {
  try {
    const receivedSecret = req.headers['x-webhook-secret'];
    const expectedSecret = process.env.SALESFORCE_WEBHOOK_SECRET;

    if (!receivedSecret || receivedSecret !== expectedSecret) {
      return res.status(401).json({
        error: 'Unauthorized webhook request'
      });
    }

    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({
        error: 'event and data are required'
      });
    }

    if (event === 'quotation_created') {
      const {
        request_id,
        farmer_id,
        buyer_id,
        total_amount,
        status
      } = data;

      if (!request_id || !farmer_id || !buyer_id || total_amount === undefined) {
        return res.status(400).json({
          error: 'request_id, farmer_id, buyer_id, and total_amount are required for quotation_created'
        });
      }

      const [requestRows] = await db.query(
        'SELECT * FROM demand_requests WHERE id = ?',
        [request_id]
      );

      if (requestRows.length === 0) {
        return res.status(404).json({
          error: 'Demand request not found'
        });
      }

      const [farmerRows] = await db.query(
        'SELECT * FROM users WHERE id = ? AND role = ?',
        [farmer_id, 'farmer']
      );

      if (farmerRows.length === 0) {
        return res.status(404).json({
          error: 'Farmer not found'
        });
      }

      const [buyerRows] = await db.query(
        'SELECT * FROM users WHERE id = ? AND role = ?',
        [buyer_id, 'buyer']
      );

      if (buyerRows.length === 0) {
        return res.status(404).json({
          error: 'Buyer not found'
        });
      }

      const [result] = await db.query(
        `INSERT INTO quotations 
         (request_id, farmer_id, buyer_id, total_amount, status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          request_id,
          farmer_id,
          buyer_id,
          total_amount,
          status || 'pending'
        ]
      );

      await db.query(
        `UPDATE demand_requests
         SET status = ?
         WHERE id = ?`,
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

      return res.status(201).json({
        received: true,
        message: 'Quotation created from Salesforce webhook',
        quotation: newQuotation[0]
      });
    }

    return res.status(400).json({
      error: `Unsupported webhook event: ${event}`
    });
  } catch (error) {
    console.error('Salesforce webhook error:', error);
    res.status(500).json({
      error: 'Server error while handling Salesforce webhook'
    });
  }
};
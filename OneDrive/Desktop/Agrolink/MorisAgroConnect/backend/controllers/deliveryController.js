const db = require('../config/db');

exports.getDeliveries = async (req, res) => {
  try {
    let query = `
      SELECT
        d.id,
        d.order_id,
        d.driver_id,
        driver.name AS driver_name,
        d.route,
        d.eta,
        d.status,
        d.updated_at,
        o.buyer_id,
        buyer.name AS buyer_name,
        o.farmer_id,
        farmer.name AS farmer_name,
        dr.product_name,
        dr.quantity_kg,
        q.total_amount,
        o.status AS order_status
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users farmer ON o.farmer_id = farmer.id
      LEFT JOIN users driver ON d.driver_id = driver.id
      JOIN quotations q ON o.quotation_id = q.id
      JOIN demand_requests dr ON q.request_id = dr.id
    `;

    const params = [];

    if (req.user.role === 'driver') {
      query += ' WHERE d.driver_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'buyer') {
      query += ' WHERE o.buyer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'farmer') {
      query += ' WHERE o.farmer_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY d.updated_at DESC';

    const [deliveries] = await db.query(query, params);

    res.json(deliveries);
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      error: 'Server error while fetching deliveries'
    });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['assigned', 'picked_up', 'delivered'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Use assigned, picked_up, or delivered'
      });
    }

    await connection.beginTransaction();

    const [deliveries] = await connection.query(
      'SELECT * FROM deliveries WHERE id = ?',
      [id]
    );

    if (deliveries.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Delivery not found'
      });
    }

    const delivery = deliveries[0];

    if (req.user.role === 'driver' && delivery.driver_id !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({
        error: 'Forbidden. You can only update your assigned deliveries'
      });
    }

    await connection.query(
      'UPDATE deliveries SET status = ? WHERE id = ?',
      [status, id]
    );

    if (status === 'picked_up') {
      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['in_transit', delivery.order_id]
      );
    }

    if (status === 'delivered') {
      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['delivered', delivery.order_id]
      );
    }

    const [updatedDelivery] = await connection.query(
      `
      SELECT
        d.id,
        d.order_id,
        d.driver_id,
        driver.name AS driver_name,
        d.route,
        d.eta,
        d.status,
        d.updated_at,
        o.status AS order_status
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      LEFT JOIN users driver ON d.driver_id = driver.id
      WHERE d.id = ?
      `,
      [id]
    );

    await connection.commit();

    res.json({
      message: 'Delivery status updated successfully',
      delivery: updatedDelivery[0]
    });
  } catch (error) {
    await connection.rollback();

    console.error('Update delivery status error:', error);
    res.status(500).json({
      error: 'Server error while updating delivery status'
    });
  } finally {
    connection.release();
  }
};
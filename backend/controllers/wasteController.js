const db = require('../config/db');

exports.createWasteListing = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { product, quantity_kg, expiry_date } = req.body;

    if (!product || quantity_kg === undefined || !expiry_date) {
      return res.status(400).json({
        error: 'product, quantity_kg, and expiry_date are required'
      });
    }

    if (Number(quantity_kg) <= 0) {
      return res.status(400).json({
        error: 'quantity_kg must be greater than 0'
      });
    }

    const [result] = await db.query(
      `INSERT INTO food_waste_listings 
       (farmer_id, product, quantity_kg, expiry_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [farmerId, product, quantity_kg, expiry_date, 'available']
    );

    const [newListing] = await db.query(
      `
      SELECT
        fwl.id,
        fwl.farmer_id,
        u.name AS farmer_name,
        u.location AS farmer_location,
        fwl.product,
        fwl.quantity_kg,
        fwl.expiry_date,
        fwl.status
      FROM food_waste_listings fwl
      JOIN users u ON fwl.farmer_id = u.id
      WHERE fwl.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Waste listing created successfully',
      listing: newListing[0]
    });
  } catch (error) {
    console.error('Create waste listing error:', error);
    res.status(500).json({
      error: 'Server error while creating waste listing'
    });
  }
};

exports.getWasteListings = async (req, res) => {
  try {
    const [listings] = await db.query(
      `
      SELECT
        fwl.id,
        fwl.farmer_id,
        u.name AS farmer_name,
        u.location AS farmer_location,
        fwl.product,
        fwl.quantity_kg,
        fwl.expiry_date,
        fwl.status
      FROM food_waste_listings fwl
      JOIN users u ON fwl.farmer_id = u.id
      WHERE fwl.status = 'available'
      ORDER BY fwl.expiry_date ASC
      `
    );

    res.json(listings);
  } catch (error) {
    console.error('Get waste listings error:', error);
    res.status(500).json({
      error: 'Server error while fetching waste listings'
    });
  }
};

const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const requestRoutes = require('./routes/requestRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const sustainabilityRoutes = require('./routes/sustainabilityRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/webhooks', webhookRoutes);
// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Moris AgroConnect backend is running'
  });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');

    res.json({
      status: 'OK',
      message: 'Database connected successfully',
      result: rows[0].result
    });
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
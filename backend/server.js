// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { initDatabases } = require('./config/db');

async function start() {
  try {
    console.log('[server] Initializing databases...');
    const mongoUri = process.env.MONGO_URI;
    await initDatabases({ mongoUri });
    console.log('[server] Databases initialized.');

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(helmet());

    // now require routes (controllers will use getPrisma())
    const authRoutes = require('./routes/auth.routes');
    const adminRoutes = require('./routes/admin.routes');
    const reportRoutes = require('./routes/report.routes');
    const productRoutes = require('./routes/product.routes');
    const orderRoutes = require('./routes/order.routes');

    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT}`);
    });

  } catch (err) {
    // fail fast with readable message (useful in logs)
    console.error('[server] Fatal startup error:', err);
    // crash process so hosting shows failure
    throw err;
  }
}

start();

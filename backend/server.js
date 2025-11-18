// backend/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { initPrisma } = require('./config/db');
const { connectMongo } = require('./config/mongo');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));

// placeholder mounts for product/order/report (will be added later)
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// error handler - should be last
app.use(require('./middlewares/error.middleware'));

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  initPrisma()
    .then(() => connectMongo())
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server', err);
      process.exit(1);
    });
}

module.exports = app;

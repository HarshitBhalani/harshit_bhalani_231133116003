// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { getPrisma } = require('./config/db'); // <-- correct import
const { connectMongo } = require('./config/mongo'); // adjust if your file is named differently

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const reportRoutes = require('./routes/report.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Initialize Prisma (this will generate client if needed and return singleton)
const prisma = getPrisma();

// Initialize Mongo if you have one (non-blocking)
if (typeof connectMongo === 'function') {
  connectMongo().catch(err => console.error('Mongo connect error:', err));
}

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// register routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

// error handler
app.use(errorMiddleware);

// start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

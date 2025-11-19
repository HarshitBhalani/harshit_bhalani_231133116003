// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { getPrisma } = require('./config/db'); // robust helper
const app = express();

// initialize Prisma early (will generate client if needed)
let prisma;
try {
  prisma = getPrisma();
  console.log('[server] Prisma initialized successfully.');
} catch (err) {
  console.error('[server] Prisma initialization failed:', err && err.message ? err.message : err);
  throw err; // let process crash so Render logs show failure
}

// optional: init mongo connection if you have config/mongo.js
try {
  const { connectMongo } = require('./config/mongo');
  if (typeof connectMongo === 'function') {
    connectMongo().catch(e => console.error('[server] Mongo connect failed:', e && e.message ? e.message : e));
  }
} catch (e) {
  // no mongo file or other; continue
}

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// register routes (make sure route files use getPrisma() rather than new PrismaClient())
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reports', require('./routes/report.routes'));

app.get('/', (req, res) => {
  res.send('backend by developer-harshit is running...');
});

// error middleware if present
try {
  const errorMiddleware = require('./middlewares/error.middleware');
  if (typeof errorMiddleware === 'function') app.use(errorMiddleware);
} catch (e) { /* ignore if missing */ }

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`[server] Backend listening on port ${port}`);
});

module.exports = app;

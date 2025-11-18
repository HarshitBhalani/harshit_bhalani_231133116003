// backend/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/checkout', authenticate, orderCtrl.checkout);
router.get('/', authenticate, orderCtrl.getUserOrders); // GET /api/orders -> user's orders

module.exports = router;

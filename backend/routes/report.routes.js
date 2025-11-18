// backend/routes/report.routes.js
const express = require('express');
const router = express.Router();
const reportCtrl = require('../controllers/report.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.get('/', authenticate, requireRole('admin'), reportCtrl.getReports);

module.exports = router;

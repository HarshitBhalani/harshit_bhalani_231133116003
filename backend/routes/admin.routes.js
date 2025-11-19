// backend/routes/admin.routes.js
'use strict';

const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * Public admin endpoints
 */
router.post('/register', adminCtrl.registerAdmin);
router.post('/login', adminCtrl.adminLogin);

/**
 * Protected admin endpoints - require authentication and admin role
 */
router.get('/me', authenticate, authorizeAdmin, adminCtrl.getAdminProfile);
router.get('/users', authenticate, authorizeAdmin, adminCtrl.getAllUsers);
router.patch('/users/:id', authenticate, authorizeAdmin, adminCtrl.updateUser);
router.delete('/users/:id', authenticate, authorizeAdmin, adminCtrl.deleteUser);

module.exports = router;

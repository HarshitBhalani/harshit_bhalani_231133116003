// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/login', authCtrl.login);      // your login already
router.post('/register', authCtrl.register); // if you have it
router.get('/me', authenticate, authCtrl.me);

module.exports = router;

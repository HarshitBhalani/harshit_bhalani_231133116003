// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();



router.get('/me', authenticate, authCtrl.me);

module.exports = router;

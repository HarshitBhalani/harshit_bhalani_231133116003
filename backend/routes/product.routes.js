// backend/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/product.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.get('/', productCtrl.listProducts);        // public
router.get('/:id', productCtrl.getProductById);   // public

// admin-only
router.post('/', authenticate, requireRole('admin'), productCtrl.createProduct);
router.put('/:id', authenticate, requireRole('admin'), productCtrl.updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), productCtrl.deleteProduct);

module.exports = router;

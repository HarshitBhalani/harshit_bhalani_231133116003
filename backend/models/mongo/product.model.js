// backend/models/product.model.js
const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
  sku: String,
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.models.Product || mongoose.model('Product', Schema);

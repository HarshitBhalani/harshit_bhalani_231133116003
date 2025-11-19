// backend/seed/products.js
require('dotenv').config();
const { mongoose } = require('../config/db');
const Product = require('../models/product.model'); // adjust path - your mongoose model file

(async () => {
  try {
    await require('../config/db').initDatabases();
    const exists = await Product.countDocuments();
    if (exists > 0) {
      console.log('Products already present:', exists);
      process.exit(0);
    }

    const sample = [
      { sku: 'SKU-001', name: 'Wireless Headphone', description: 'Comfortable wireless headphones with clear bass.', price: 120, category: 'electronics', stock: 25 },
      { sku: 'SKU-002', name: 'Coffee Mug', description: 'Ceramic coffee mug — dishwasher safe.', price: 12, category: 'home', stock: 50 },
      { sku: 'SKU-003', name: 'Running Shoes', description: 'Lightweight running shoes for daily training.', price: 85, category: 'apparel', stock: 40 },
    ];

    await Product.insertMany(sample);
    console.log('Inserted sample products');
    process.exit(0);
  } catch (err) {
    console.error('Seed products failed:', err);
    process.exit(1);
  }
})();

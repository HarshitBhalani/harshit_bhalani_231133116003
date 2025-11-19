// backend/seed/seed.products.js
'use strict';

const mongoose = require('mongoose');
const { getPrisma } = require('../config/db');
require('dotenv').config();

const SAMPLE_PRODUCTS = [
  {
    sku: 'SKU-001',
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
    price: 120,
    category: 'electronics',
    stock: 25,
    image: 'https://via.placeholder.com/300x300?text=Wireless+Headphones'
  },
  {
    sku: 'SKU-002',
    name: 'Coffee Mug',
    description: 'Ceramic coffee mug - dishwasher safe and microwave friendly.',
    price: 12,
    category: 'home',
    stock: 150,
    image: 'https://via.placeholder.com/300x300?text=Coffee+Mug'
  },
  {
    sku: 'SKU-003',
    name: 'Running Shoes',
    description: 'Lightweight running shoes designed for daily training and comfort.',
    price: 85,
    category: 'apparel',
    stock: 40,
    image: 'https://via.placeholder.com/300x300?text=Running+Shoes'
  },
  {
    sku: 'SKU-004',
    name: 'Mechanical Keyboard',
    description: 'Compact mechanical keyboard with tactile switches and RGB lighting.',
    price: 75,
    category: 'electronics',
    stock: 18,
    image: 'https://via.placeholder.com/300x300?text=Mechanical+Keyboard'
  },
  {
    sku: 'SKU-005',
    name: 'Notebook (A5)',
    description: 'Hardcover A5 notebook with 120 lined pages - perfect for journaling.',
    price: 8,
    category: 'stationery',
    stock: 200,
    image: 'https://via.placeholder.com/300x300?text=Notebook'
  },
  {
    sku: 'SKU-006',
    name: 'Stainless Water Bottle',
    description: 'Insulated 750ml water bottle keeps drinks cold for 24 hours.',
    price: 22,
    category: 'outdoors',
    stock: 60,
    image: 'https://via.placeholder.com/300x300?text=Water+Bottle'
  },
  {
    sku: 'SKU-007',
    name: 'LED Desk Lamp',
    description: 'Smart LED desk lamp with adjustable brightness and color temperature.',
    price: 35,
    category: 'home',
    stock: 45,
    image: 'https://via.placeholder.com/300x300?text=Desk+Lamp'
  },
  {
    sku: 'SKU-008',
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 10-hour battery life and waterproof design.',
    price: 50,
    category: 'electronics',
    stock: 30,
    image: 'https://via.placeholder.com/300x300?text=Bluetooth+Speaker'
  },
  {
    sku: 'SKU-009',
    name: 'Yoga Mat',
    description: 'Premium non-slip yoga mat with carrying strap for fitness enthusiasts.',
    price: 28,
    category: 'sports',
    stock: 55,
    image: 'https://via.placeholder.com/300x300?text=Yoga+Mat'
  }
];

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  image: String,
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function seedProducts() {
  try {
    console.log('[seed] Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecom';
    await mongoose.connect(mongoUri);
    console.log('[seed] MongoDB connected');

    // Clear existing products
    const skus = SAMPLE_PRODUCTS.map(p => p.sku);
    const deleted = await Product.deleteMany({ sku: { $in: skus } });
    console.log(`[seed] Deleted ${deleted.deletedCount} existing products`);

    // Insert new products
    let inserted = 0;
    for (const product of SAMPLE_PRODUCTS) {
      await Product.findOneAndUpdate(
        { sku: product.sku },
        { $set: { ...product, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      inserted++;
      console.log(`[seed] ✓ Upserted: ${product.sku} - ${product.name}`);
    }

    console.log(`[seed] Successfully seeded ${inserted} products!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err.message || err);
    process.exit(1);
  }
}

seedProducts();

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecom';

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  updatedAt: { type: Date, default: Date.now }
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const SAMPLE_PRODUCTS = [
  {
    sku: 'SKU-001',
    name: 'Wireless Headphones',
    description: 'Comfortable wireless headphones with clear bass.',
    price: 120,
    category: 'electronics',
    stock: 25
  },
  {
    sku: 'SKU-002',
    name: 'Coffee Mug',
    description: 'Ceramic coffee mug — dishwasher safe.',
    price: 12,
    category: 'home',
    stock: 150
  },
  {
    sku: 'SKU-003',
    name: 'Running Shoes',
    description: 'Lightweight running shoes for daily training.',
    price: 85,
    category: 'apparel',
    stock: 40
  },
  {
    sku: 'SKU-004',
    name: 'Mechanical Keyboard',
    description: 'Compact mechanical keyboard with tactile switches.',
    price: 75,
    category: 'electronics',
    stock: 18
  },
  {
    sku: 'SKU-005',
    name: 'Notebook (A5)',
    description: 'Hardcover A5 notebook with 120 lined pages.',
    price: 8,
    category: 'stationery',
    stock: 200
  },
  {
    sku: 'SKU-006',
    name: 'Stainless Water Bottle',
    description: 'Insulated 750ml bottle keeps drinks cold for 24h.',
    price: 22,
    category: 'outdoors',
    stock: 60
  },
  {
    sku: 'SKU-007',
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness levels.',
    price: 35,
    category: 'home',
    stock: 45
  },
  {
    sku: 'SKU-008',
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 10h battery life.',
    price: 50,
    category: 'electronics',
    stock: 30
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // optional: clear existing sample SKUs (safe)
    const skus = SAMPLE_PRODUCTS.map(p => p.sku);
    await Product.deleteMany({ sku: { $in: skus } });

    // upsert each product so running the script multiple times is safe
    for (const p of SAMPLE_PRODUCTS) {
      await Product.findOneAndUpdate(
        { sku: p.sku },
        { $set: { ...p, updatedAt: new Date() } },
        { upsert: true }
      );
      console.log('Upserted', p.sku);
    }

    console.log('Seed finished.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

seed();
// backend/config/mongo.js
const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI not set in env - skipping mongo connect');
    return;
  }
  try {
    await mongoose.connect(uri, { dbName: 'ecom' });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

module.exports = { connectMongo };

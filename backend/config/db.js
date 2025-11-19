// backend/config/db.js
'use strict';

const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');

let prismaClient = null;

/**
 * Return Prisma client instance. Assumes you've run `npx prisma generate`
 */
function getPrisma() {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

/**
 * Connect mongoose and verify Prisma can connect.
 * Call this before starting server.
 */
async function initDatabases() {
  // 1) Prisma - will attempt to open a connection lazily when used,
  // but we can do a quick call to ensure it is available.
  try {
    const prisma = getPrisma();
    // lightweight check
    await prisma.$connect();
    console.log('[db] Prisma connected');
  } catch (err) {
    console.error('[db] Prisma init failed:', err.message || err);
    throw err;
  }

  // 2) Mongoose
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    const e = new Error('MONGO_URI not set in env');
    console.error('[db] ' + e.message);
    throw e;
  }

  // If running in production (or on Render) disallow localhost URIs — they won't work on the host.
  const isProdHost = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
  if (isProdHost && /(^mongodb:\/\/localhost|127\.0\.0\.1|::1)/i.test(mongoUri)) {
    // Allow an explicit bypass for advanced users (not recommended).
    if (process.env.ALLOW_LOCAL_MONGO === 'true') {
      console.warn('[db] Warning: MONGO_URI points to localhost but ALLOW_LOCAL_MONGO=true — proceeding anyway (NOT recommended for production)');
    } else {
      const e = new Error('MONGO_URI appears to point to localhost. On Render (or in production) you must provide a network-accessible MongoDB connection string (for example MongoDB Atlas). Set the MONGO_URI environment variable in your Render dashboard to a remote MongoDB URI.');
      console.error('[db] ' + e.message);
      throw e;
    }
  }

  try {
    // Avoid mongoose buffering by setting useNewUrlParser / unifiedTopology implicitly.
    await mongoose.connect(mongoUri, {
      // options are generally not required with mongoose v6+, but explicit is fine
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[db] Mongoose connected');
  } catch (err) {
    console.error('[db] Mongoose connection failed:', err.message || err);
    throw err;
  }
}

module.exports = {
  getPrisma,
  initDatabases,
  mongoose,
};

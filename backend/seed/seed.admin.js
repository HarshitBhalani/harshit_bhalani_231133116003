// backend/seed/seed.admin.js
'use strict';

const bcrypt = require('bcryptjs');
const { getPrisma } = require('../config/db');
require('dotenv').config();

async function seedAdmin() {
  try {
    const prisma = getPrisma();
    
    await prisma.$connect();
    console.log('[seed] Prisma connected');

    // Default admin credentials
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.SEED_ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      console.log(`[seed] Admin user already exists: ${adminEmail}`);
      await prisma.$disconnect();
      process.exit(0);
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
      },
    });

    console.log('[seed] Admin user created successfully:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  Role: ${admin.role}`);
    console.log('[seed] Use these credentials to login.');

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err.message || err);
    process.exit(1);
  }
}

seedAdmin();

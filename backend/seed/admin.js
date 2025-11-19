// backend/seed/admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getPrisma, initDatabases } = require('../config/db');

(async () => {
  try {
    await initDatabases();
    const prisma = getPrisma();
    const email = 'admin@example.com';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }
    const hash = await bcrypt.hash('Admin@123', Number(process.env.BCRYPT_SALT_ROUNDS || 10));
    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        passwordHash: hash,
        role: 'admin',
      },
    });
    console.log('Created admin:', user.email);
    process.exit(0);
  } catch (err) {
    console.error('Seed admin failed:', err);
    process.exit(1);
  }
})();

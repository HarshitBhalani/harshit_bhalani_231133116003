// backend/seed/seed.sql.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function seed() {
  const prisma = new PrismaClient();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
  const hash = await bcrypt.hash(password, saltRounds);

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        passwordHash: hash,
        role: 'admin'
      }
    });
    console.log('Seeded admin user:', adminEmail, 'password:', password);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }

  await prisma.$disconnect();
}

if (require.main === module) seed().catch((e) => { console.error(e); process.exit(1); });
module.exports = seed;

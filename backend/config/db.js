// backend/config/db.js
const { PrismaClient } = require('@prisma/client');

let prisma;

function initPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  // optional: warm up
  return prisma.$connect().then(() => {
    console.log('Prisma connected');
    return prisma;
  });
}

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

module.exports = {
  initPrisma,
  getPrisma
};

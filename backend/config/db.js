// backend/config/db.js
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function ensurePrismaGenerated() {
  try {
    // quick check: is the generated client folder present?
    const generatedClientDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
    if (fs.existsSync(generatedClientDir)) {
      return true;
    }
  } catch (err) {
    // ignored
  }

  // Run `npx prisma generate` synchronously.
  // This will use local node_modules/.bin/prisma if installed, or npx will fetch it.
  console.log('Prisma client missing — running `npx prisma generate` before startup...');

  const opts = { stdio: 'inherit', cwd: path.join(__dirname, '..') }; // run from backend root
  const res = spawnSync('npx', ['prisma', 'generate'], opts);

  if (res.error) {
    console.error('Failed to run prisma generate:', res.error);
    throw res.error;
  }
  if (res.status !== 0) {
    const err = new Error('`prisma generate` failed with exit code ' + res.status);
    console.error(err);
    throw err;
  }

  console.log('Prisma client generated successfully.');
  return true;
}

function initPrisma() {
  ensurePrismaGenerated();

  // now require the generated client
  let PrismaClient;
  try {
    PrismaClient = require('@prisma/client').PrismaClient;
  } catch (err) {
    console.error('Unable to require @prisma/client after generate:', err);
    throw err;
  }

  const prisma = new PrismaClient();
  return prisma;
}

module.exports = { initPrisma };

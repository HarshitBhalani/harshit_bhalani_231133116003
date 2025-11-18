// backend/config/db.js
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendRoot = path.join(__dirname, '..');

function ensurePrismaGenerated() {
  try {
    const generatedClientDir = path.join(backendRoot, 'node_modules', '.prisma', 'client');
    if (fs.existsSync(generatedClientDir)) {
      return true;
    }
  } catch (err) {
    // ignore
  }

  console.log('[prisma] Generated client not found — running `npx prisma generate` synchronously...');
  const res = spawnSync('npx', ['prisma', 'generate'], { stdio: 'inherit', cwd: backendRoot });

  if (res.error) {
    console.error('[prisma] spawn error:', res.error);
    throw res.error;
  }
  if (res.status !== 0) {
    throw new Error('[prisma] `prisma generate` failed with exit code ' + res.status);
  }

  console.log('[prisma] Generated client successfully.');
  return true;
}

let prismaInstance = null;

function getPrisma() {
  if (prismaInstance) return prismaInstance;

  // Make sure generated client exists
  ensurePrismaGenerated();

  // Now require @prisma/client
  let PrismaClient;
  try {
    PrismaClient = require('@prisma/client').PrismaClient;
  } catch (err) {
    console.error('[prisma] require(@prisma/client) failed:', err);
    throw err;
  }

  // Create singleton (safe for serverless/hot reload)
  if (globalThis.__prisma) {
    prismaInstance = globalThis.__prisma;
  } else {
    prismaInstance = new PrismaClient();
    globalThis.__prisma = prismaInstance;
  }

  return prismaInstance;
}

module.exports = { getPrisma };

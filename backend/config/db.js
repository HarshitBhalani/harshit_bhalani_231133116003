// backend/config/db.js
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendRoot = path.join(__dirname, '..');

function runPrismaGenerateSync() {
  console.log('[prisma-helper] Running `npx prisma generate` (sync)...');
  const res = spawnSync('npx', ['prisma', 'generate'], {
    stdio: 'inherit',
    cwd: backendRoot,
    shell: true,
  });

  if (res.error) {
    console.error('[prisma-helper] spawn error:', res.error);
    throw res.error;
  }
  if (res.status !== 0) {
    throw new Error('[prisma-helper] `prisma generate` failed with exit code ' + res.status);
  }
  console.log('[prisma-helper] prisma generate completed successfully.');
}

function generatedClientExists() {
  try {
    const generatedClientDir = path.join(backendRoot, 'node_modules', '.prisma', 'client');
    return fs.existsSync(generatedClientDir);
  } catch (e) {
    return false;
  }
}

function tryRequirePrismaClient() {
  try {
    return require('@prisma/client');
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    if (msg.includes('@prisma/client did not initialize') || msg.includes('Cannot find module') || msg.includes('.prisma/client')) {
      console.warn('[prisma-helper] require(@prisma/client) failed; attempting prisma generate then require again.', msg);
      runPrismaGenerateSync();
      return require('@prisma/client');
    }
    throw err;
  }
}

let prismaInstance = null;

function getPrisma() {
  if (prismaInstance) return prismaInstance;

  // If generated client folder doesn't exist, try to generate it first (best-effort)
  if (!generatedClientExists()) {
    try {
      runPrismaGenerateSync();
    } catch (err) {
      // if generate fails here, try require fallback below which will attempt generate again
      console.warn('[prisma-helper] initial prisma generate attempt failed:', err && err.message ? err.message : err);
    }
  }

  // require @prisma/client, with fallback that will run prisma generate if require throws
  const mod = tryRequirePrismaClient();

  if (!mod || !mod.PrismaClient) {
    throw new Error('[prisma-helper] @prisma/client loaded but PrismaClient export missing');
  }
  const PrismaClient = mod.PrismaClient;

  // singleton pattern (works in serverless/hot reload)
  if (global.__prisma) {
    prismaInstance = global.__prisma;
  } else {
    prismaInstance = new PrismaClient();
    global.__prisma = prismaInstance;
  }

  return prismaInstance;
}

module.exports = { getPrisma, runPrismaGenerateSync, generatedClientExists };

// backend/config/db.js
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendRoot = path.join(__dirname, '..');

// run prisma generate synchronously (if needed)
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
    const p = path.join(backendRoot, 'node_modules', '.prisma', 'client');
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
}

// Try to require @prisma/client from the backend's own node_modules first,
// then fall back to normal require if that fails.
function tryRequirePrismaClientLocalFirst() {
  const localPkgPath = path.join(backendRoot, 'node_modules', '@prisma', 'client');
  try {
    if (fs.existsSync(localPkgPath)) {
      // require using explicit path to ensure we load the backend-local package
      const mod = require(localPkgPath);
      return mod;
    }
  } catch (err) {
    console.warn('[prisma-helper] require from backend node_modules failed:', err && err.message ? err.message : err);
    // fallthrough to try global require
  }

  // fallback: try normal require (may resolve to parent/global)
  try {
    return require('@prisma/client');
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    // If it's a "not generated" kind of error, run generate and try again
    if (msg.includes('@prisma/client did not initialize') || msg.includes('Cannot find module') || msg.includes('.prisma/client')) {
      console.warn('[prisma-helper] global require failed with message that suggests missing generated client. Attempting prisma generate and require again.');
      runPrismaGenerateSync();
      // After generating, attempt to require from backend node_modules explicitly
      return require(localPkgPath);
    }
    throw err;
  }
}

let prismaInstance = null;

function getPrisma() {
  if (prismaInstance) return prismaInstance;

  // Ensure generated client exists if possible
  if (!generatedClientExists()) {
    try {
      runPrismaGenerateSync();
    } catch (err) {
      console.warn('[prisma-helper] prisma generate initial attempt failed:', err && err.message ? err.message : err);
    }
  }

  const mod = tryRequirePrismaClientLocalFirst();

  if (!mod || !mod.PrismaClient) {
    throw new Error('[prisma-helper] Could not load @prisma/client PrismaClient export.');
  }
  const PrismaClient = mod.PrismaClient;

  // singleton
  if (global.__prisma) {
    prismaInstance = global.__prisma;
  } else {
    prismaInstance = new PrismaClient();
    global.__prisma = prismaInstance;
  }

  return prismaInstance;
}

module.exports = { getPrisma, runPrismaGenerateSync, generatedClientExists };

// backend/controllers/auth.controller.js
'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getPrisma } = require('../config/db');

/**
 * Helper - safe JSON-safe user object to return to client
 * @param {object} user - prisma user object
 */
function safeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * POST /api/auth/register
 * body: { name, email, password }
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    // basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    // email basic format
    const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegexp.test(String(email).toLowerCase())) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // get prisma client (will throw if not initialized)
    const prisma = getPrisma();

    // check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // create user (default role: customer)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'customer',
      },
    });

    // sign token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[auth.register] JWT_SECRET not set');
      return res.status(500).json({ message: 'Server configuration error.' });
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const payload = { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email };
    const token = jwt.sign(payload, secret, { expiresIn });

    // return safe user + token
    return res.status(201).json({ token, user: safeUser(newUser) });
  } catch (err) {
    console.error('[auth.register] error:', err);
    // If getPrisma threw a meaningful error, include guidance but don't leak secrets
    const message = err.message && err.message.includes('Prisma') ? 'Server DB initialization error. Make sure databases are initialized.' : 'Server error';
    return res.status(500).json({ message });
  }
}

/**
 * POST /api/auth/login
 * body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const prisma = getPrisma();

    // find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // do not reveal which part is wrong
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // verify password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // sign token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[auth.login] JWT_SECRET not set');
      return res.status(500).json({ message: 'Server configuration error.' });
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const payload = { id: user.id, role: user.role, name: user.name, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn });

    // return token + safe user
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('[auth.login] error:', err);
    const message = err.message && err.message.includes('Prisma') ? 'Server DB initialization error. Make sure databases are initialized.' : 'Server error';
    return res.status(500).json({ message });
  }
}

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 * optional helper that returns current user info (if you decode middleware not present)
 */
async function me(req, res) {
  try {
    // if you have auth middleware that sets req.user, return that first
    if (req.user) {
      return res.json({ user: req.user });
    }

    // otherwise optionally decode token from header
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Missing authorization header.' });
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Missing token.' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Server configuration error.' });

    const payload = jwt.verify(token, secret);
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error('[auth.me] error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  register,
  login,
  me,
};

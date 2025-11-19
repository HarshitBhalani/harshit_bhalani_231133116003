// backend/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { getPrisma } = require('../config/db');

/**
 * Authenticate user and attach req.user
 * Expects Bearer token in Authorization header
 */
async function authenticate(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role, name, ... }

    // Fetch fresh user data from DB to ensure role is current
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user.role = user.role; // Update role from DB
    next();
  } catch (err) {
    console.error('Auth error:', err.message || err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Authorize by role
 * @param {string} role - required role (e.g., 'admin', 'customer')
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

/**
 * Authorize admin only
 */
function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin role required' });
  }
  next();
}

module.exports = { authenticate, requireRole, authorizeAdmin };

// backend/controllers/admin.controller.js
'use strict';

const bcrypt = require('bcryptjs');
const { getPrisma } = require('../config/db');
const jwtUtil = require('../utils/jwt.util');

/**
 * Safe user object for response
 */
function safeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/**
 * POST /api/admin/register
 * Register a new admin user
 * body: { name, email, password }
 * Only accessible by existing admins or via master key (optional)
 */
async function registerAdmin(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).toLowerCase())) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters for admin.' });
    }

    const prisma = getPrisma();

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'admin',
      },
    });

    // Generate JWT token
    const token = jwtUtil.sign({ 
      id: newAdmin.id, 
      email: newAdmin.email, 
      name: newAdmin.name,
      role: newAdmin.role 
    });

    return res.status(201).json({
      message: 'Admin registered successfully.',
      user: safeUser(newAdmin),
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/login
 * Admin login
 * body: { email, password }
 */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const prisma = getPrisma();

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwtUtil.sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role 
    });

    return res.json({
      message: 'Login successful.',
      user: safeUser(user),
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/me
 * Get current admin info
 * Requires auth middleware
 */
async function getAdminProfile(req, res, next) {
  try {
    const prisma = getPrisma();

    // req.user is set by auth middleware
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    return res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
async function getAllUsers(req, res, next) {
  try {
    const prisma = getPrisma();

    // Verify admin role (done by middleware, but double-check)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json({ users });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:id
 * Update user role or info (admin only)
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { role, name } = req.body || {};

    if (!id) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const prisma = getPrisma();

    // Cannot change your own role
    if (parseInt(id) === req.user.id && role && role !== req.user.role) {
      return res.status(400).json({ message: 'Cannot change your own admin role.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (role && ['customer', 'admin'].includes(role)) {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return res.json({
      message: 'User updated successfully.',
      user: safeUser(updatedUser),
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found.' });
    }
    next(err);
  }
}

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Cannot delete yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    const prisma = getPrisma();

    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return res.json({
      message: 'User deleted successfully.',
      user: safeUser(deletedUser),
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found.' });
    }
    next(err);
  }
}

module.exports = {
  registerAdmin,
  adminLogin,
  getAdminProfile,
  getAllUsers,
  updateUser,
  deleteUser,
};

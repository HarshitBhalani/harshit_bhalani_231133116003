// backend/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const { getPrisma } = require('../config/db');
const jwtUtil = require('../utils/jwt.util');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const prisma = getPrisma();

    // check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'customer' }
    });

    const token = jwtUtil.sign({ id: user.id, email: user.email, name: user.name });

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwtUtil.sign({ id: user.id, email: user.email, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}
// backend/controllers/auth.controller.js
// ... other requires
exports.me = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  const { id, email, name, role } = req.user;
  return res.json({ id, email, name, role });
};

module.exports = { register, login, me };

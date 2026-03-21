const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, displayName: user.displayName, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('displayName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name required (max 50 characters)'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, displayName } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'An account with that email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const userCount = await prisma.user.count();
      const role = userCount === 0 ? 'OWNER' : 'READER';
      const user = await prisma.user.create({
        data: { email, passwordHash, displayName: displayName.trim(), role },
      });

      const token = createToken(user);
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
      });
    } catch (err) {
      console.error('register error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      // Use constant-time comparison even when user is not found to prevent timing attacks
      const hashToCheck = user ? user.passwordHash : '$2a$12$invalidhashfortimingattack00000';
      const match = await bcrypt.compare(password, hashToCheck);

      if (!user || !match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = createToken(user);
      res.json({
        token,
        user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
      });
    } catch (err) {
      console.error('login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

module.exports = router;

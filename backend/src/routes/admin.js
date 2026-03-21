const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = Router();
const prisma = new PrismaClient();

// ── GET /api/admin/users ───────────────────────────────────────────────────────
// OWNER only: list all users
router.get('/users', requireAuth, requireRole('OWNER'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, displayName: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── PATCH /api/admin/users/:id/role ───────────────────────────────────────────
// OWNER only: change a user's role
router.patch('/users/:id/role', requireAuth, requireRole('OWNER'), async (req, res) => {
  const { role } = req.body;
  const VALID_ROLES = ['OWNER', 'WRITER', 'READER'];

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be OWNER, WRITER, or READER.' });
  }

  // Prevent owner from downgrading themselves (safety — at least one owner must remain)
  if (req.params.id === req.user.sub && role !== 'OWNER') {
    return res.status(400).json({ error: 'You cannot change your own role.' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, displayName: true, role: true },
    });
    res.json({ user });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    console.error(err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

module.exports = router;

/**
 * requireRole(...roles) — Express middleware factory.
 * Must be used AFTER requireAuth so that req.user is already set.
 *
 * Usage:
 *   router.post('/posts', requireAuth, requireRole('OWNER', 'WRITER'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireRole };

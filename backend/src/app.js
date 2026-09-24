require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');
const webtoonsRoutes = require('./routes/webtoons');
const openfloorRoutes = require('./routes/openfloor');

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
// ALLOWED_ORIGIN may be a comma-separated list. The GitHub Pages site is always
// allowed so pages like /openfloor/ can call this API.
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',').map((o) => o.trim()).filter(Boolean)
  .concat('https://ryanlanesander.github.io');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webtoons', webtoonsRoutes);
app.use('/api/openfloor', openfloorRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

module.exports = app;

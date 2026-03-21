const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = Router();
const prisma = new PrismaClient();

// Parse tags from the JSON string stored in DB
const parsePost = (post) => ({
  ...post,
  tags: (() => { try { return JSON.parse(post.tags); } catch { return []; } })(),
});

// ── GET /api/posts ─────────────────────────────────────────────────────────────
// Public: list all published posts
router.get('/', async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, tags: true,
        publishedAt: true, createdAt: true,
        author: { select: { displayName: true } },
      },
    });
    res.json({ posts: posts.map(parsePost) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ── GET /api/posts/drafts ──────────────────────────────────────────────────────
// Protected (OWNER/WRITER): OWNER sees all drafts, WRITER sees own drafts
router.get('/drafts', requireAuth, requireRole('OWNER', 'WRITER'), async (req, res) => {
  try {
    const where = req.user.role === 'OWNER'
      ? { published: false }
      : { published: false, authorId: req.user.sub };
    const posts = await prisma.post.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, tags: true,
        published: true, updatedAt: true,
        author: { select: { displayName: true } },
      },
    });
    res.json({ posts: posts.map(parsePost) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// ── POST /api/posts ────────────────────────────────────────────────────────────
// Protected (OWNER/WRITER): create a new post
router.post(
  '/',
  requireAuth,
  requireRole('OWNER', 'WRITER'),
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('slug')
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must be lowercase letters, numbers and hyphens only'),
    body('content').trim().notEmpty().withMessage('Content required'),
    body('tags').isArray().withMessage('Tags must be an array'),
    body('published').isBoolean().optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, slug, content, tags = [], published = false } = req.body;

    try {
      const existing = await prisma.post.findUnique({ where: { slug } });
      if (existing) return res.status(409).json({ error: 'A post with that slug already exists' });

      const post = await prisma.post.create({
        data: {
          title,
          slug,
          content,
          tags: JSON.stringify(tags),
          published,
          publishedAt: published ? new Date() : null,
          authorId: req.user.sub,
        },
        include: { author: { select: { displayName: true } } },
      });
      res.status(201).json({ post: parsePost(post) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
);

// ── GET /api/posts/:slug ───────────────────────────────────────────────────────
// Public for published posts; draft visible only to author or OWNER
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: { displayName: true } } },
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.published) {
      // Require auth to view a draft
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(404).json({ error: 'Post not found' });
      }
      try {
        const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        if (payload.sub !== post.authorId && payload.role !== 'OWNER') {
          return res.status(404).json({ error: 'Post not found' });
        }
      } catch {
        return res.status(404).json({ error: 'Post not found' });
      }
    }

    res.json({ post: parsePost(post) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ── PATCH /api/posts/:slug ─────────────────────────────────────────────────────
// Protected (OWNER/WRITER): update a post; WRITERs can only edit their own
router.patch('/:slug', requireAuth, requireRole('OWNER', 'WRITER'), async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (req.user.role === 'WRITER' && post.authorId !== req.user.sub) {
      return res.status(403).json({ error: "Cannot edit another writer's post" });
    }

    const { title, content, tags, published } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (tags !== undefined) data.tags = JSON.stringify(tags);
    if (published !== undefined) {
      data.published = published;
      if (published && !post.published) data.publishedAt = new Date();
      if (!published) data.publishedAt = null;
    }

    const updated = await prisma.post.update({
      where: { slug: req.params.slug },
      data,
      include: { author: { select: { displayName: true } } },
    });
    res.json({ post: parsePost(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// ── DELETE /api/posts/:slug ────────────────────────────────────────────────────
// Protected (OWNER/WRITER): WRITERs can only delete their own
router.delete('/:slug', requireAuth, requireRole('OWNER', 'WRITER'), async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (req.user.role === 'WRITER' && post.authorId !== req.user.sub) {
      return res.status(403).json({ error: "Cannot delete another writer's post" });
    }

    await prisma.post.delete({ where: { slug: req.params.slug } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;

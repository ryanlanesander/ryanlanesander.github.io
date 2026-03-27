const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = Router();
const prisma = new PrismaClient();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── GET /api/webtoons ──────────────────────────────────────────────────────────
// Public: list all series with episode count
router.get('/', async (_req, res) => {
  try {
    const series = await prisma.webtoonSeries.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, description: true, createdAt: true,
        author: { select: { displayName: true } },
        _count: { select: { episodes: true } },
      },
    });
    res.json({ series });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

// ── POST /api/webtoons ─────────────────────────────────────────────────────────
// Protected: create a new series
router.post('/', requireAuth, requireRole('OWNER', 'WRITER'), async (req, res) => {
  const { title, description = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });

  const base = slugify(title.trim());
  let slug = base;
  let i = 1;
  try {
    while (await prisma.webtoonSeries.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    const series = await prisma.webtoonSeries.create({
      data: { title: title.trim(), slug, description, authorId: req.user.sub },
      include: { author: { select: { displayName: true } } },
    });
    res.status(201).json({ series });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create series' });
  }
});

// ── GET /api/webtoons/:seriesId ────────────────────────────────────────────────
// Public: get series with episode list
router.get('/:seriesId', async (req, res) => {
  try {
    const series = await prisma.webtoonSeries.findUnique({
      where: { id: req.params.seriesId },
      include: {
        author: { select: { displayName: true } },
        episodes: {
          orderBy: { episodeNum: 'asc' },
          select: { id: true, title: true, episodeNum: true, createdAt: true },
        },
      },
    });
    if (!series) return res.status(404).json({ error: 'Series not found' });
    res.json({ series });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

// ── DELETE /api/webtoons/:seriesId ─────────────────────────────────────────────
router.delete('/:seriesId', requireAuth, requireRole('OWNER', 'WRITER'), async (req, res) => {
  try {
    const series = await prisma.webtoonSeries.findUnique({ where: { id: req.params.seriesId } });
    if (!series) return res.status(404).json({ error: 'Series not found' });
    if (req.user.role === 'WRITER' && series.authorId !== req.user.sub) {
      return res.status(403).json({ error: "Cannot delete another writer's series" });
    }
    await prisma.webtoonSeries.delete({ where: { id: req.params.seriesId } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete series' });
  }
});

// ── POST /api/webtoons/:seriesId/episodes ──────────────────────────────────────
// Protected: create episode record (no images yet)
router.post('/:seriesId/episodes', requireAuth, requireRole('OWNER', 'WRITER'), async (req, res) => {
  const { title } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Episode title required' });

  try {
    const series = await prisma.webtoonSeries.findUnique({ where: { id: req.params.seriesId } });
    if (!series) return res.status(404).json({ error: 'Series not found' });

    const lastEp = await prisma.webtoonEpisode.findFirst({
      where: { seriesId: req.params.seriesId },
      orderBy: { episodeNum: 'desc' },
    });
    const episodeNum = (lastEp?.episodeNum ?? 0) + 1;

    const episode = await prisma.webtoonEpisode.create({
      data: {
        title: title.trim(),
        episodeNum,
        seriesId: req.params.seriesId,
        authorId: req.user.sub,
      },
    });
    res.status(201).json({ episode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create episode' });
  }
});

// ── GET /api/webtoons/:seriesId/episodes/:episodeId ────────────────────────────
// Public: get episode with all pages
router.get('/:seriesId/episodes/:episodeId', async (req, res) => {
  try {
    const episode = await prisma.webtoonEpisode.findFirst({
      where: { id: req.params.episodeId, seriesId: req.params.seriesId },
      include: {
        series: { select: { id: true, title: true } },
        pages: { orderBy: { order: 'asc' } },
        author: { select: { displayName: true } },
      },
    });
    if (!episode) return res.status(404).json({ error: 'Episode not found' });
    res.json({ episode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
});

// ── POST /api/webtoons/:seriesId/episodes/:episodeId/pages ─────────────────────
// Protected: upload a single page image
router.post(
  '/:seriesId/episodes/:episodeId/pages',
  requireAuth,
  requireRole('OWNER', 'WRITER'),
  upload.single('page'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Image file required' });
    const order = parseInt(req.body.order ?? '0', 10);

    try {
      const episode = await prisma.webtoonEpisode.findFirst({
        where: { id: req.params.episodeId, seriesId: req.params.seriesId },
      });
      if (!episode) return res.status(404).json({ error: 'Episode not found' });

      const imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const page = await prisma.webtoonPage.create({
        data: { episodeId: req.params.episodeId, order, imageData },
      });
      res.status(201).json({ page: { id: page.id, order: page.order } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to upload page' });
    }
  }
);

// ── DELETE /api/webtoons/:seriesId/episodes/:episodeId ─────────────────────────
router.delete('/:seriesId/episodes/:episodeId', requireAuth, requireRole('OWNER', 'WRITER'), async (req, res) => {
  try {
    const episode = await prisma.webtoonEpisode.findFirst({
      where: { id: req.params.episodeId, seriesId: req.params.seriesId },
    });
    if (!episode) return res.status(404).json({ error: 'Episode not found' });
    if (req.user.role === 'WRITER' && episode.authorId !== req.user.sub) {
      return res.status(403).json({ error: "Cannot delete another writer's episode" });
    }
    await prisma.webtoonEpisode.delete({ where: { id: req.params.episodeId } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete episode' });
  }
});

module.exports = router;

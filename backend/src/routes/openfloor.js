const { Router } = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Shalom Open Floor — live Q&A board served from GitHub Pages at /openfloor/.
//
// Visitors need no account. Their browser generates a random token and sends it as
// `X-Visitor`; we store only its hash. That lets people delete their own questions
// and vote once per question. Moderation (topics, TV spotlight, mark answered, video
// answers, deleting any question) is for signed-in OWNER / WRITER accounts.
//
// Serverless functions can't hold live connections, so clients poll
// GET /state?since=<version>; an unchanged board costs a single-row read.

const router = Router();
const prisma = new PrismaClient();

const MAX_TEXT = 280;
const MAX_NAME = 40;
const MAX_TOPIC = 80;
const MAX_QUESTIONS = 5000;
const MOD_ROLES = ['OWNER', 'WRITER'];
const ID_RE = /^[\w-]{1,40}$/;

const hash = (s) => crypto.createHash('sha256').update(s).digest('base64url');
const clean = (s, max) =>
  String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);

function visitor(req) {
  const t = req.headers['x-visitor'];
  if (typeof t !== 'string' || !/^[A-Za-z0-9_-]{20,100}$/.test(t)) return null;
  return hash('v:' + t);
}

function isMod(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return false;
  try {
    const payload = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    return MOD_ROLES.includes(payload.role);
  } catch {
    return false;
  }
}

function ipHash(req) {
  const fwd = req.headers['x-forwarded-for'];
  const ip = (typeof fwd === 'string' && fwd.split(',')[0].trim()) || req.headers['x-real-ip'] || req.socket.remoteAddress || '?';
  return hash('ip:' + (process.env.JWT_SECRET || '') + ':' + ip);
}

// Best-effort per-instance limiter for votes (questions are limited via the database).
const buckets = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    if (buckets.size > 10000) buckets.clear();
    b = { start: now, n: 0 };
    buckets.set(key, b);
  }
  return ++b.n > max;
}

function parseYouTube(raw) {
  let u;
  try { u = new URL(String(raw).trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.replace(/^(www\.|m\.|music\.)/, '');
  let id = null;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else {
      const m = u.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
      if (m) id = m[2];
    }
  }
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
  const t = u.searchParams.get('t') || u.searchParams.get('start') || '';
  let start = 0;
  const hms = String(t).match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (hms) start = (+hms[1] || 0) * 3600 + (+hms[2] || 0) * 60 + (+hms[3] || 0);
  return { id, start: Math.min(start, 86400) };
}

// Every write bumps the board version so pollers know to refetch.
function bump() {
  return prisma.$executeRaw`
    INSERT INTO "openfloor_board" ("id", "version") VALUES (1, 1)
    ON CONFLICT ("id") DO UPDATE SET "version" = "openfloor_board"."version" + 1`;
}

// Wraps a handler so thrown errors become a JSON 500.
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error('openfloor error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'server_error' });
  }
};

function requireMod(req, res, next) {
  if (!isMod(req)) return res.status(403).json({ error: 'admin_only' });
  next();
}
function requireVisitor(req, res, next) {
  req.visitor = visitor(req);
  if (!req.visitor) return res.status(400).json({ error: 'no_visitor' });
  next();
}
function validId(req, res, next) {
  if (!ID_RE.test(req.params.id)) return res.status(404).json({ error: 'not_found' });
  next();
}

router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// ── GET /api/openfloor/state?since=<version> ───────────────────────────────────
router.get('/state', handle(async (req, res) => {
  const board = await prisma.openFloorBoard.findUnique({ where: { id: 1 } });
  const version = board ? board.version : 0;
  const since = Number(req.query.since);
  if (req.query.since !== undefined && since === version) return res.json({ version, unchanged: true });

  const me = visitor(req) || '';
  const [topics, questions, myVotes] = await Promise.all([
    prisma.openFloorTopic.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.openFloorQuestion.findMany({
      select: {
        id: true, text: true, name: true, author: true, topicId: true, answered: true,
        videoId: true, videoStart: true, createdAt: true, _count: { select: { votes: true } },
      },
    }),
    me ? prisma.openFloorVote.findMany({ where: { voter: me }, select: { questionId: true } }) : [],
  ]);
  const voted = new Set(myVotes.map((v) => v.questionId));
  const videos = {};
  for (const q of questions) if (q.videoId) videos[q.id] = { id: q.videoId, start: q.videoStart };

  res.json({
    version,
    topics: topics.map((t) => ({ id: t.id, name: t.name, createdAt: t.createdAt.getTime() })),
    questions: questions.map((q) => ({
      id: q.id, text: q.text, name: q.name, topicId: q.topicId, createdAt: q.createdAt.getTime(),
      answered: q.answered, votes: q._count.votes, mine: !!me && q.author === me, voted: voted.has(q.id),
    })),
    tv: { spotlight: board ? board.spotlightId : null, topic: board ? board.tvTopicId : null },
    videos,
    isAdmin: isMod(req),
  });
}));

// ── POST /api/openfloor/questions ─────────────────────────────────────────────
router.post('/questions', requireVisitor, handle(async (req, res) => {
  const text = clean(req.body.text, MAX_TEXT + 1);
  if (!text) return res.status(400).json({ error: 'empty' });
  if (text.length > MAX_TEXT) return res.status(400).json({ error: 'too_long' });

  const ip = ipHash(req);
  const minuteAgo = new Date(Date.now() - 60000);
  const [byMe, byIp, total] = await Promise.all([
    prisma.openFloorQuestion.count({ where: { author: req.visitor, createdAt: { gt: minuteAgo } } }),
    prisma.openFloorQuestion.count({ where: { ipHash: ip, createdAt: { gt: minuteAgo } } }),
    prisma.openFloorQuestion.count(),
  ]);
  if (byMe >= 5 || byIp >= 20) return res.status(429).json({ error: 'slow_down' });
  if (total >= MAX_QUESTIONS) return res.status(507).json({ error: 'board_full' });

  let topicId = null;
  if (typeof req.body.topicId === 'string' && ID_RE.test(req.body.topicId)) {
    const t = await prisma.openFloorTopic.findUnique({ where: { id: req.body.topicId } });
    if (t) topicId = t.id;
  }
  const q = await prisma.openFloorQuestion.create({
    data: { text, name: clean(req.body.name, MAX_NAME) || null, author: req.visitor, ipHash: ip, topicId },
  });
  await bump();
  res.status(201).json({ id: q.id });
}));

// ── DELETE /api/openfloor/questions/:id — the author or a moderator ─────────────
router.delete('/questions/:id', validId, handle(async (req, res) => {
  const q = await prisma.openFloorQuestion.findUnique({ where: { id: req.params.id } });
  if (!q) return res.status(404).json({ error: 'not_found' });
  const me = visitor(req);
  if (!isMod(req) && !(me && q.author === me)) return res.status(403).json({ error: 'not_yours' });
  await prisma.openFloorQuestion.delete({ where: { id: q.id } });
  await prisma.openFloorBoard.updateMany({ where: { spotlightId: q.id }, data: { spotlightId: null } });
  await bump();
  res.json({ ok: true });
}));

// ── PATCH /api/openfloor/questions/:id — mark answered / reopen ───────────────
router.patch('/questions/:id', validId, requireMod, handle(async (req, res) => {
  const answered = !!req.body.answered;
  const { count } = await prisma.openFloorQuestion.updateMany({ where: { id: req.params.id }, data: { answered } });
  if (!count) return res.status(404).json({ error: 'not_found' });
  if (answered) await prisma.openFloorBoard.updateMany({ where: { spotlightId: req.params.id }, data: { spotlightId: null } });
  await bump();
  res.json({ ok: true });
}));

// ── POST / DELETE /api/openfloor/questions/:id/vote ─────────────────────────────
async function vote(req, res, on) {
  if (limited(req.visitor, 120, 60000)) return res.status(429).json({ error: 'slow_down' });
  const q = await prisma.openFloorQuestion.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!q) return res.status(404).json({ error: 'not_found' });
  if (on) {
    await prisma.openFloorVote.createMany({ data: [{ questionId: q.id, voter: req.visitor }], skipDuplicates: true });
  } else {
    await prisma.openFloorVote.deleteMany({ where: { questionId: q.id, voter: req.visitor } });
  }
  await bump();
  res.json({ ok: true });
}
router.post('/questions/:id/vote', validId, requireVisitor, handle((req, res) => vote(req, res, true)));
router.delete('/questions/:id/vote', validId, requireVisitor, handle((req, res) => vote(req, res, false)));

// ── PUT / DELETE /api/openfloor/questions/:id/video — YouTube answer ──────────────
router.put('/questions/:id/video', validId, requireMod, handle(async (req, res) => {
  const v = parseYouTube(req.body.url);
  if (!v) return res.status(400).json({ error: 'bad_video' });
  const { count } = await prisma.openFloorQuestion.updateMany({
    where: { id: req.params.id }, data: { videoId: v.id, videoStart: v.start },
  });
  if (!count) return res.status(404).json({ error: 'not_found' });
  await bump();
  res.json({ ok: true });
}));
router.delete('/questions/:id/video', validId, requireMod, handle(async (req, res) => {
  await prisma.openFloorQuestion.updateMany({ where: { id: req.params.id }, data: { videoId: null, videoStart: 0 } });
  await bump();
  res.json({ ok: true });
}));

// ── Topics ────────────────────────────────────────────────────────────────────
router.post('/topics', requireMod, handle(async (req, res) => {
  const name = clean(req.body.name, MAX_TOPIC);
  if (!name) return res.status(400).json({ error: 'empty' });
  const t = await prisma.openFloorTopic.create({ data: { name } });
  await bump();
  res.status(201).json({ id: t.id });
}));
router.delete('/topics/:id', validId, requireMod, handle(async (req, res) => {
  await prisma.openFloorTopic.deleteMany({ where: { id: req.params.id } });
  await bump();
  res.json({ ok: true });
}));

// ── PUT /api/openfloor/tv — what the room screen shows ──────────────────────────
router.put('/tv', requireMod, handle(async (req, res) => {
  const { spotlight, topic } = req.body;
  const [q, t] = await Promise.all([
    typeof spotlight === 'string' && ID_RE.test(spotlight) ? prisma.openFloorQuestion.findUnique({ where: { id: spotlight }, select: { id: true } }) : null,
    typeof topic === 'string' && ID_RE.test(topic) ? prisma.openFloorTopic.findUnique({ where: { id: topic }, select: { id: true } }) : null,
  ]);
  const data = { spotlightId: q ? q.id : null, tvTopicId: t ? t.id : null };
  await prisma.openFloorBoard.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  await bump();
  res.json({ ok: true });
}));

module.exports = router;

// Vercel serverless adapter — thin wrapper that exports the Express app.
// Vercel calls this file as a Node.js serverless function for all /api/* routes.
//
// To switch to a different host (Render, Railway, VPS), just run:
//   node backend/src/server.js
// The underlying Express app in backend/src/app.js is identical.
//
// In production, env vars come from Vercel's dashboard (not a .env file).
// Locally, dotenv loads from backend/.env via backend/src/app.js.

const app = require('../backend/src/app');

module.exports = app;

// Vercel serverless adapter — thin wrapper that exports the Express app.
// Vercel calls this file as a Node.js serverless function for all /api/* routes.
//
// To switch to a different host (Render, Railway, VPS), just run:
//   node backend/src/server.js
// The underlying Express app in backend/src/app.js is identical.

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const app = require('../backend/src/app');

module.exports = app;

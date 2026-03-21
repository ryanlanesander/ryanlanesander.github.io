// Standalone server entry — used for non-Vercel hosting (Render, Railway, VPS, etc.)
// Vercel uses api/index.js instead of this file.
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

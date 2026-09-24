#!/bin/sh
# Vercel build (see vercel.json). Runs from the repo root.
set -e

npm install
cd backend
npx prisma generate
# Apply pending database migrations on production deploys only. Previews share
# the same database, so they must never migrate it. If this fails, the build
# fails and Vercel keeps the current production deployment live.
# Migrations take a Postgres advisory lock, which Neon's connection pooler
# doesn't support, so this step uses the direct (non "-pooler") host.
if [ "$VERCEL_ENV" = "production" ]; then
  DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed 's/-pooler\././')" npx prisma migrate deploy
fi

cd ../frontend
npm install
npm run build
# Static pages that live outside the React app (also served by GitHub Pages).
cp -r ../openfloor dist/openfloor

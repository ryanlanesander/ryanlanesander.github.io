#!/bin/sh
# Vercel build (see vercel.json). Runs from the repo root.
set -e

npm install
cd backend
npx prisma generate
# Apply pending database migrations on production deploys only. Previews share
# the same database, so they must never migrate it. If this fails, the build
# fails and Vercel keeps the current production deployment live.
# This step uses Neon's direct (non "-pooler") host, since migrations don't
# work through the connection pooler. Prisma's advisory lock is skipped: a
# pooled connection can hold it indefinitely, and only one production build
# migrates at a time.
if [ "$VERCEL_ENV" = "production" ]; then
  DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed 's/-pooler\././')" \
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 \
    npx prisma migrate deploy
fi

cd ../frontend
npm install
npm run build
# Static pages that live outside the React app (also served by GitHub Pages).
cp -r ../openfloor dist/openfloor

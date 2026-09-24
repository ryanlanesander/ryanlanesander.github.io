#!/bin/sh
# Vercel build (see vercel.json). Runs from the repo root.
set -e

npm install
cd backend
npx prisma generate
# Apply pending database migrations on production deploys only. Previews share
# the same database, so they must never migrate it. If this fails, the build
# fails and Vercel keeps the current production deployment live.
if [ "$VERCEL_ENV" = "production" ]; then
  npx prisma migrate deploy
fi

cd ../frontend
npm install
npm run build
# Static pages that live outside the React app (also served by GitHub Pages).
cp -r ../openfloor dist/openfloor

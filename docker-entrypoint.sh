#!/bin/sh
set -e

mkdir -p /app/data /app/public/uploads

echo "[secretwish] Synchronizing database schema..."
npx prisma db push --accept-data-loss --skip-generate

if [ "${SEED_DEMO:-false}" = "true" ]; then
  echo "[secretwish] Loading demo data (idempotent)..."
  npx prisma db seed
else
  echo "[secretwish] Demo seeding skipped (set SEED_DEMO=true to enable)."
fi

echo "[secretwish] Starting SecretWish production server..."
exec node server.js

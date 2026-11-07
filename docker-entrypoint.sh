#!/bin/sh
set -e

# Ensure data and upload directories exist
mkdir -p /app/data /app/public/uploads

# Run Prisma schema push for SQLite
echo "Synchronizing database schema..."
npx prisma db push --skip-generate

# Start the application
echo "Starting SecretWish application..."
exec "$@"

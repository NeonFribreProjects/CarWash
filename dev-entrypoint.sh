#!/bin/sh
set -e

# Install netcat
apk add --no-cache netcat-openbsd

# Wait for database
echo "Waiting for database..."
while ! nc -z db 5432; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database is ready!"

# We're already in /app/server due to working_dir in docker-compose
echo "Current directory: $(pwd)"

# Debug: Check what's installed
echo "=== DEBUG INFO ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Prisma directory:"
ls -la node_modules/@prisma/ 2>/dev/null || echo "No @prisma directory found"
echo "=================="

# Generate Prisma client with absolute schema path
echo "Generating Prisma client..."
npx prisma generate --schema=/app/server/prisma/schema.prisma

# Reset database and migrations with absolute schema path
echo "Resetting database and migrations..."
npx prisma migrate reset --force --skip-generate --schema=/app/server/prisma/schema.prisma

echo "Prisma setup completed successfully"

# Start development servers from project root
cd /app && npm run dev
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

# FORCE CLEAN PRISMA INSTALLATION
echo "=== FORCING CLEAN PRISMA INSTALLATION ==="
cd /app/server

# Remove the problematic Prisma installation
echo "Removing old Prisma installation..."
rm -rf node_modules/.prisma node_modules/@prisma node_modules/prisma 2>/dev/null || true

# Force reinstall ONLY Prisma packages
echo "Force reinstalling Prisma 5.22.0..."
npm install prisma@5.22.0 @prisma/client@5.22.0 --save --force --no-audit

# Run database migrations to fix schema
echo "Running database migrations..."
npx prisma@5.22.0 migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma@5.22.0 generate

echo "✅ Prisma setup completed successfully"

# Start development servers from project root
cd /app && npm run dev
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
echo "Directory contents:"
ls -la

# Install dependencies if needed
echo "Installing server dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Reset database and migrations
echo "Resetting database and migrations..."
npx prisma migrate reset --force --skip-generate

echo "Prisma setup completed successfully"

# Start development servers from project root
cd /app && npm run dev
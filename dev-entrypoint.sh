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

# All Prisma operations must run from server context
cd /app/server

# Check if we need to run migrations
echo "Checking database state..."
if npx prisma migrate status --schema=./prisma/schema.prisma | grep -q "Database schema is out of sync"; then
  echo "Database schema is out of sync, running migrations..."
  npx prisma migrate deploy
else
  echo "Database schema is up to date"
fi

# In development, reset the database and migrations
echo "Resetting database and migrations..."
npx prisma migrate reset --force

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Seed the database (if a seed file is present)

echo "Generating Prisma client..."
# Ensure @prisma/client is installed
npm install @prisma/client
# Generate the Prisma client
npx prisma generate

# Verify Prisma client generation
if [ ! -d "node_modules/.prisma" ]; then
  echo "Error: Prisma client was not generated properly"
  exit 1
fi

echo "Prisma setup completed successfully"

# Start development servers from project root
cd /app && npm run dev
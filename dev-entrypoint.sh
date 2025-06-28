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

# Ensure we're in the right directory and dependencies are available
echo "Setting up Prisma environment..."
pwd
ls -la node_modules/@prisma/ 2>/dev/null || echo "Prisma client not found in server/node_modules"

# Install dependencies if needed (in case volume mounting caused issues)
echo "Installing server dependencies..."
npm install

# Generate Prisma client first
echo "Generating Prisma client..."
npx prisma generate

# Verify the client was generated
if [ ! -d "node_modules/.prisma" ]; then
  echo "Error: Prisma client was not generated properly"
  exit 1
fi

# Check database state
echo "Checking database state..."
if npx prisma migrate status --schema=./prisma/schema.prisma | grep -q "Database schema is out of sync"; then
  echo "Database schema is out of sync, running migrations..."
  npx prisma migrate deploy
else
  echo "Database schema is up to date"
fi

# Reset database and migrations (skip generate since we did it above)
echo "Resetting database and migrations..."
npx prisma migrate reset --force --skip-generate

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Seed the database (if a seed file is present)

echo "Prisma setup completed successfully"

# Start development servers from project root
cd /app && npm run dev
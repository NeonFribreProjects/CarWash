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

# ADVANCED DEBUGGING - Find the source of Prisma 5.10.0
echo "=== ADVANCED DEBUG INFO ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "Which prisma: $(which prisma)"
echo "Prisma executable: $(ls -la $(which prisma))"

echo "NPX Prisma path: $(npx which prisma)"
echo "NPX Prisma executable: $(ls -la $(npx which prisma))"

echo "All Prisma binaries on system:"
find / -name "prisma" -type f 2>/dev/null | head -10

echo "All Prisma packages in node_modules:"
find /app -name "*prisma*" -type d 2>/dev/null | head -20

echo "Package.json Prisma versions:"
echo "Root: $(grep -A1 -B1 prisma /app/package.json || echo 'Not found')"
echo "Server: $(grep -A1 -B1 prisma /app/server/package.json || echo 'Not found')"

echo "Node modules Prisma versions:"
echo "Root node_modules: $(ls -la /app/node_modules/.bin/prisma 2>/dev/null || echo 'Not found')"
echo "Server node_modules: $(ls -la /app/server/node_modules/.bin/prisma 2>/dev/null || echo 'Not found')"

echo "NPM list prisma:"
npm list prisma --depth=0 || echo "Not found in npm list"
cd /app/server && npm list prisma --depth=0 || echo "Not found in server npm list"

echo "PATH: $PATH"
echo "================================="

# Try to use the specific Prisma from server node_modules
echo "Trying server-specific Prisma..."
cd /app/server
if [ -f "./node_modules/.bin/prisma" ]; then
    echo "Using local server Prisma:"
    ./node_modules/.bin/prisma --version
    ./node_modules/.bin/prisma generate
else
    echo "No local Prisma found, falling back to npx"
    npx prisma generate
fi

echo "✅ Prisma setup completed successfully"

# Start development servers from project root
cd /app && npm run dev
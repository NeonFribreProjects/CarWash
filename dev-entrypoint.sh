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

# Enhanced debugging
echo "=== COMPREHENSIVE DEBUG INFO ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "OpenSSL version: $(openssl version)"
echo "OS Info: $(cat /etc/os-release | grep PRETTY_NAME)"
echo "Architecture: $(uname -m)"
echo ""
echo "Environment Variables:"
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"
echo ""
echo "Prisma files:"
ls -la prisma/ 2>/dev/null || echo "No prisma directory found"
echo ""
echo "Prisma node_modules:"
ls -la node_modules/@prisma/ 2>/dev/null || echo "No @prisma directory found"
echo ""
echo "Prisma engines:"
ls -la node_modules/@prisma/engines/ 2>/dev/null || echo "No engines directory found"
echo "================================="

# Try to generate Prisma client with verbose logging
echo "Generating Prisma client with verbose logging..."
DEBUG=* npx prisma generate --schema=./prisma/schema.prisma 2>&1 || {
    echo "❌ Prisma generate failed. Trying alternative approach..."
    
    # Try without schema path
    echo "Trying without explicit schema path..."
    DEBUG=* npx prisma generate 2>&1 || {
        echo "❌ Both attempts failed. Checking Prisma installation..."
        
        # Check if Prisma is properly installed
        echo "Checking Prisma installation:"
        npm list @prisma/client || echo "❌ @prisma/client not found"
        npm list prisma || echo "❌ prisma CLI not found"
        
        # Try to reinstall Prisma
        echo "Attempting to reinstall Prisma..."
        npm install --force @prisma/client prisma
        
        # Final attempt
        echo "Final attempt at Prisma generate..."
        npx prisma generate --schema=./prisma/schema.prisma
    }
}

echo "✅ Prisma client generated successfully!"

# Reset database and migrations
echo "Resetting database and migrations..."
npx prisma migrate reset --force --skip-generate --schema=./prisma/schema.prisma

echo "✅ Prisma setup completed successfully"

# Start development servers from project root
cd /app && npm run dev
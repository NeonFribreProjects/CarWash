# Build stage for frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Build stage for backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./client/dist

# Copy built backend
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/package*.json ./server/
COPY --from=backend-builder /app/server/prisma ./server/prisma
COPY --from=backend-builder /app/server/prisma/migrations ./server/prisma/migrations

# Install production dependencies
WORKDIR /app/server
RUN npx prisma generate
RUN npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Copy wait-for-it script
COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

# Start the server
CMD ["npm", "start"] 

# =======================================================
# Stage 1: Build Frontend (Vite + React 18)
# =======================================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# =======================================================
# Stage 2: Production Server (Node.js + Express + SQLite)
# =======================================================
FROM node:20-slim AS runner
WORKDIR /app

# Install build essentials for better-sqlite3 native bindings
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Copy built frontend assets into the location expected by backend/src/server.js
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Set working directory to project root
WORKDIR /app

# Default environment configuration for Railway
ENV NODE_ENV=production
ENV PORT=5000

# Expose HTTP port (Railway dynamically injects $PORT)
EXPOSE 5000

# Start server
CMD ["node", "backend/src/server.js"]

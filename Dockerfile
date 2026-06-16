# ── Stage 1: Build React frontend ──────────────────────────────────────────────
FROM node:20-alpine AS client-builder

WORKDIR /build/client

# Install dependencies first (layer-cached unless package files change)
COPY client/package*.json ./
RUN npm ci

# Copy source and build
COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ─────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app/server

# Install server dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/ ./

# Copy built frontend into server/public so Express can serve it
COPY --from=client-builder /build/client/dist ./public

# Create directories that the server expects at runtime
RUN mkdir -p deployed_configs defaults configs

EXPOSE 3000

CMD ["node", "server.js"]

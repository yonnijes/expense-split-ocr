# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build Next.js
RUN npm run build:web

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built files from standalone output
COPY --from=builder /app/apps/web-portal/.next/standalone ./
COPY --from=builder /app/apps/web-portal/.next/static ./apps/web-portal/.next/static
COPY --from=builder /app/apps/web-portal/public ./apps/web-portal/public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start
WORKDIR /app/apps/web-portal
CMD ["node", "server.js"]

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=libs/infrastructure/src/prisma/schema.prisma

# Build API
RUN npm run build:api

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built files
COPY --from=builder /app/dist/apps/api ./dist/apps/api
COPY --from=builder /app/libs/node_modules/.prisma ./libs/node_modules/.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start
CMD ["node", "dist/apps/api/src/main.js"]

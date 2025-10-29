# MADACE Web - Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Set working directory
WORKDIR /app

# Install build dependencies for native addons (bufferutil, utf-8-validate)
# These are needed for WebSocket performance optimizations
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (production only)
# If package-lock.json doesn't exist, npm install will generate it
RUN if [ -f package-lock.json ]; then npm ci --only=production; \
    else npm install --only=production; fi

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (needed for dev dependencies too)
RUN apk add --no-cache python3 make g++

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Install dev dependencies for build
RUN npm install --only=development

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
# This creates .next directory with optimized production build
RUN npm run build

# Stage 3: Runner (Final Production Image)
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create data directory for volume mount
# This will store all user data, config, and generated files
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy MADACE agents/workflows (built-in templates)
COPY --from=builder --chown=nextjs:nodejs /app/madace ./madace

# Copy documentation files for docs viewer
COPY --from=builder --chown=nextjs:nodejs /app/docs ./docs

# Copy package.json for runtime
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy Next.js config
COPY --from=builder --chown=nextjs:nodejs /app/next.config.* ./

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    MADACE_DATA_DIR=/app/data

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js server
CMD ["npm", "start"]

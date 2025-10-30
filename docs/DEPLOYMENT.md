# MADACE Deployment Guide

**Version:** 3.0.0-beta
**Last Updated:** 2025-10-30

This guide covers deploying MADACE v3.0 to production environments with full database support, Web IDE, and collaboration features.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Production Checklist](#production-checklist)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)
- [Scaling](#scaling)

---

## Quick Start

### Minimal Production Deployment

```bash
# 1. Clone repository
git clone <repo-url>
cd MADACE-Method-v2.0

# 2. Create data directory
mkdir madace-data

# 3. Build and start
docker-compose up -d

# 4. Access application
open http://localhost:3000
```

---

## Deployment Options

### Option 1: Docker Compose (Recommended)

**Best for:** Single-server deployments, development, small teams

**Pros:**

- Simple setup
- Easy updates
- Resource efficient
- Data persistence

**Cons:**

- Single point of failure
- Limited scaling

---

### Option 2: Kubernetes

**Best for:** Large-scale deployments, high availability

**Pros:**

- Auto-scaling
- High availability
- Load balancing
- Self-healing

**Cons:**

- Complex setup
- Higher resource usage

---

### Option 3: Cloud Platform (Vercel, Railway, etc.)

**Best for:** Serverless deployments, zero-ops

**Pros:**

- Automatic scaling
- CDN integration
- Zero maintenance

**Cons:**

- Vendor lock-in
- Higher costs at scale

---

## Docker Deployment

### Production Docker Compose

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  madace-web:
    image: madace-web:latest
    container_name: madace-prod
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - ./madace-data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
    healthcheck:
      test:
        ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Build Production Image

```bash
# Build image
docker build -t madace-web:latest .

# Test locally
docker run -d \
  --name madace-test \
  -p 3000:3000 \
  -v $(pwd)/madace-data:/app/data \
  madace-web:latest

# Verify
curl http://localhost:3000/api/health

# Stop test
docker stop madace-test
docker rm madace-test
```

### Deploy

```bash
# Start production
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Update Deployment

```bash
# Pull latest code
git pull

# Rebuild image
docker build -t madace-web:latest .

# Recreate containers
docker-compose up -d --force-recreate

# Verify
curl http://localhost:3000/api/health
```

---

## Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```bash
# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database (Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/madace
# For SQLite (development/single-user):
# DATABASE_URL=file:./madace-data/madace.db

# LLM Providers (configure at least one)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp

CLAUDE_API_KEY=your-claude-api-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-latest

# Local/Ollama (optional)
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama3.1

# WebSocket Collaboration Service
WEBSOCKET_PORT=3001
WEBSOCKET_AUTO_START=true

# NLU Service (Dialogflow CX)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
DIALOGFLOW_PROJECT_ID=your-project-id
DIALOGFLOW_LOCATION=us-central1
DIALOGFLOW_AGENT_ID=your-agent-id

# Data Paths
DATA_DIR=./madace-data
CONFIG_PATH=./madace-data/config/config.yaml

# Logging
LOG_LEVEL=info
LOG_FILE=./madace-data/logs/application.log

# Performance
NEXT_TELEMETRY_DISABLED=1
ANALYZE=false  # Set to true for bundle analysis
```

### Loading Environment Variables

```bash
# Option 1: Docker Compose env_file
services:
  madace-web:
    env_file:
      - .env.production

# Option 2: Export and run
export $(cat .env.production | xargs)
npm run build
npm start
```

---

## Production Checklist

### Pre-Deployment

- [ ] **Code Review** - All changes reviewed and approved
- [ ] **Unit Tests Pass** - `npm test` succeeds
- [ ] **E2E Tests Pass** - `npm run test:e2e` succeeds
- [ ] **Linting** - `npm run lint` passes
- [ ] **Type Check** - `npm run type-check` succeeds
- [ ] **Quality Checks** - `npm run check-all` passes
- [ ] **Build Successful** - `npm run build` completes
- [ ] **Bundle Analysis** - `npm run build:analyze` reviewed
- [ ] **Database Migrations** - `npm run db:migrate` applied
- [ ] **Security Audit** - `npm audit` shows no critical vulnerabilities
- [ ] **Dependencies Updated** - All packages up-to-date
- [ ] **Environment Variables** - All secrets configured (DATABASE_URL, API keys)
- [ ] **Data Backup** - Database and file system backed up

### Deployment

- [ ] **Build Image** - Docker image built successfully
- [ ] **Test Image** - Image tested locally
- [ ] **Deploy** - Containers started
- [ ] **Health Check** - `/api/health` returns 200
- [ ] **Smoke Tests** - Critical flows verified
- [ ] **Monitoring** - Logs and metrics enabled

### Post-Deployment

- [ ] **Verify Endpoints** - All API routes responding
- [ ] **Check Logs** - No errors in application logs
- [ ] **Monitor Performance** - Response times acceptable
- [ ] **Backup Configuration** - Production config saved
- [ ] **Document Changes** - Deployment notes updated
- [ ] **Notify Team** - Deployment complete notification

---

## Monitoring & Logging

### Health Check Endpoint

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": 1729612800000,
  "services": {
    "api": "up",
    "sync": "up",
    "filesystem": "healthy"
  },
  "version": "2.0.0-alpha"
}
```

### Application Logs

```bash
# Docker logs
docker logs madace-prod

# Follow logs
docker logs -f madace-prod

# Last 100 lines
docker logs --tail=100 madace-prod

# Since timestamp
docker logs --since 2025-10-22T00:00:00 madace-prod
```

### Log Levels

- **error** - Critical failures
- **warn** - Warnings and deprecated features
- **info** - General informational messages (default)
- **debug** - Detailed debugging information
- **trace** - Very detailed trace information

### Metrics to Monitor

1. **Response Times**
   - API endpoint latency
   - Page load times
   - Database query times

2. **Error Rates**
   - HTTP 4xx/5xx responses
   - Application exceptions
   - Failed LLM requests

3. **Resource Usage**
   - CPU utilization
   - Memory consumption
   - Disk space
   - Network bandwidth

4. **Business Metrics**
   - Active users
   - Workflow executions
   - Agent interactions
   - LLM API usage

---

## Reverse Proxy (Nginx)

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name madace.example.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name madace.example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/madace.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/madace.example.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Static Files (caching)
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d madace.example.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

---

## Database (Prisma ORM)

**Version 3.0+:** Prisma ORM with PostgreSQL/SQLite support

### Database Setup

```bash
# 1. Configure DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/madace

# 2. Run migrations
npm run db:migrate

# 3. Generate Prisma Client
npm run db:generate

# 4. Import MADACE agents (first-time setup)
npm run import-madace-v3

# 5. Verify database
npm run db:studio  # Opens Prisma Studio at http://localhost:5555
```

### Database Models

**Key tables in v3.0:**

- **Agent** - AI agent definitions (PM, SM, DEV, etc.)
- **WorkflowState** - Workflow execution state
- **ChatSession** - Chat conversation sessions
- **ChatMessage** - Individual chat messages
- **MemoryEntry** - Agent memory/context storage
- **User** - User accounts (future)
- **Project** - Project management (future)

See `prisma/schema.prisma` for complete schema.

### Database Migrations

```bash
# Create new migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset

# Push schema changes (dev only)
npm run db:push
```

### Production Database

```bash
# PostgreSQL setup
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb madace

# Create user
sudo -u postgres createuser madace_user -P

# Grant permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE madace TO madace_user;

# Update DATABASE_URL in .env.production
DATABASE_URL=postgresql://madace_user:password@localhost:5432/madace
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs madace-prod

# Common issues:
# 1. Port already in use
lsof -i :3000
kill -9 <PID>

# 2. Data directory permissions
sudo chown -R 1000:1000 ./madace-data

# 3. Missing environment variables
docker exec madace-prod env | grep API_KEY
```

### High Memory Usage

```bash
# Check memory
docker stats madace-prod

# Restart with memory limit
docker run -d \
  --name madace-prod \
  --memory="1g" \
  --memory-swap="2g" \
  -p 3000:3000 \
  madace-web:latest
```

### Slow Response Times

1. **Check resource usage:**

   ```bash
   docker stats madace-prod
   ```

2. **Enable caching:**

   ```typescript
   // next.config.ts
   export default {
     compress: true,
     poweredByHeader: false,
   };
   ```

3. **Optimize images:**
   ```bash
   npm install sharp
   # Next.js will auto-use sharp for image optimization
   ```

### WebSocket Connection Fails

```bash
# Check sync service status
curl http://localhost:3000/api/sync

# Restart sync service
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# Check firewall
sudo ufw allow 3001/tcp
```

---

## Scaling

### Horizontal Scaling

**Load Balancer Configuration:**

```nginx
upstream madace_backends {
    least_conn;
    server madace-1:3000;
    server madace-2:3000;
    server madace-3:3000;
}

server {
    listen 80;

    location / {
        proxy_pass http://madace_backends;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Docker Compose (Multiple Instances):**

```yaml
version: '3.8'

services:
  madace-1:
    image: madace-web:latest
    ports:
      - '3001:3000'
    volumes:
      - ./madace-data:/app/data

  madace-2:
    image: madace-web:latest
    ports:
      - '3002:3000'
    volumes:
      - ./madace-data:/app/data

  madace-3:
    image: madace-web:latest
    ports:
      - '3003:3000'
    volumes:
      - ./madace-data:/app/data

  nginx:
    image: nginx:latest
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - madace-1
      - madace-2
      - madace-3
```

### Vertical Scaling

```bash
# Increase container resources
docker run -d \
  --name madace-prod \
  --cpus="2.0" \
  --memory="4g" \
  -p 3000:3000 \
  madace-web:latest
```

---

## Security Best Practices

### 1. Environment Variables

```bash
# Never commit secrets
echo ".env*" >> .gitignore

# Use secret management
docker secret create gemini_key gemini_api_key.txt
docker service create --secret gemini_key madace-web
```

### 2. HTTPS Only

```nginx
# Force HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 3. Rate Limiting

```nginx
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

### 4. Security Headers

```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

### 5. Regular Updates

```bash
# Update dependencies
npm audit
npm audit fix

# Update Docker base image
docker pull node:20-alpine
docker build --no-cache -t madace-web:latest .
```

---

## Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup data
tar -czf $BACKUP_DIR/madace-data-$DATE.tar.gz madace-data/

# Backup database (future)
# pg_dump madace > $BACKUP_DIR/madace-db-$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/madace-data-$DATE.tar.gz"
```

### Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Recovery

```bash
# Stop application
docker-compose down

# Restore data
tar -xzf backups/madace-data-20251022_020000.tar.gz

# Restore database (future)
# psql madace < backups/madace-db-20251022_020000.sql

# Restart
docker-compose up -d
```

---

## Performance Optimization

### 1. Enable Compression

```typescript
// next.config.ts
export default {
  compress: true,
};
```

### 2. Image Optimization

```bash
# Install sharp
npm install sharp

# Next.js auto-uses sharp for images
```

### 3. Caching Strategy

```typescript
// API route with caching
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  const data = await fetchData();
  return Response.json(data);
}
```

### 4. Static Generation

```typescript
// Generate at build time
export async function generateStaticParams() {
  const agents = await loadAllAgents();
  return agents.map((agent) => ({
    name: agent.name,
  }));
}
```

---

## Resources

- **API Documentation**: [docs/API.md](./API.md)
- **Component Documentation**: [docs/COMPONENTS.md](./COMPONENTS.md)
- **Development Guide**: [DEVELOPMENT.md](../DEVELOPMENT.md)
- **Architecture**: [ARCHITECTURE.md](../ARCHITECTURE.md)

---

## Support

For deployment issues:

1. Check logs: `docker logs madace-prod`
2. Verify health: `curl http://localhost:3000/api/health`
3. Report issue: [GitHub Issues](https://github.com/tekcin/MADACE-METHOD/issues)

---

**Last Updated:** 2025-10-30
**Version:** 3.0.0-beta

# Migration Guide: MADACE v2.0 → v3.0

**Document Version:** 1.0
**Last Updated:** 2025-10-29
**Target Audience:** Developers migrating from MADACE v2.0 to v3.0

---

## Overview

This guide provides step-by-step instructions for migrating from MADACE-Method v2.0 (experimental Next.js implementation) to v3.0 (production-ready implementation with Prisma ORM and PostgreSQL).

### What Changed?

**v2.0** was an experimental proof-of-concept:

- File-based architecture (YAML agents, Markdown status)
- No database (all state in files)
- Simplified workflow engine
- Basic web UI

**v3.0** is production-ready:

- Database-backed architecture (Prisma ORM + PostgreSQL)
- Hybrid approach (file-based agents + database state)
- Advanced NLU capabilities
- Full-featured web UI with real-time updates
- Enhanced CLI integration

### Migration Complexity: 🟡 MEDIUM

- **Estimated Time:** 2-4 hours
- **Difficulty:** Intermediate (requires database setup)
- **Risk Level:** Low (backward-compatible data migration)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Breaking Changes](#breaking-changes)
3. [File Structure Changes](#file-structure-changes)
4. [Configuration Changes](#configuration-changes)
5. [Database Setup](#database-setup)
6. [Step-by-Step Migration](#step-by-step-migration)
7. [API Changes](#api-changes)
8. [Testing Migration](#testing-migration)
9. [Rollback Plan](#rollback-plan)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting migration, ensure you have:

- ✅ Node.js v20+ installed (v24.10.0 recommended)
- ✅ npm v9+ installed
- ✅ Git repository with clean working tree
- ✅ PostgreSQL 14+ installed (or Docker for local development)
- ✅ Backup of existing v2.0 data (if any)
- ✅ Read access to [PRD.md](./PRD.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)

### Environment Requirements

**Development:**

- PostgreSQL database (local or cloud)
- 4GB+ RAM recommended
- 2GB+ disk space

**Production:**

- PostgreSQL database (managed service recommended)
- Reverse proxy (Caddy/nginx)
- HTTPS certificate (Let's Encrypt)

---

## Breaking Changes

### 🚨 Critical Breaking Changes

#### 1. Database Requirement (NEW)

**v2.0:** No database required
**v3.0:** PostgreSQL database REQUIRED

**Impact:** HIGH
**Action Required:** Set up PostgreSQL and run migrations

#### 2. State Machine Storage

**v2.0:** `docs/mam-workflow-status.md` (Markdown file)
**v3.0:** `docs/workflow-status.md` + PostgreSQL `workflow_state` table

**Impact:** HIGH
**Action Required:** Migrate state from Markdown to database

#### 3. Configuration File Location

**v2.0:** `madace/core/config.yaml` (optional, not created by default)
**v3.0:** `madace/core/config.yaml` (REQUIRED, auto-generated)

**Impact:** HIGH
**Action Required:** Create config.yaml using template

#### 4. Environment Variables

**v2.0:**

```bash
PROJECT_NAME=MADACE-Method v2.0
STATUS_FILE=docs/mam-workflow-status.md
```

**v3.0:**

```bash
PROJECT_NAME=MADACE-Method v3.0
STATUS_FILE=docs/workflow-status.md
DATABASE_URL=postgresql://user:pass@localhost:5432/madace
```

**Impact:** MEDIUM
**Action Required:** Update .env file

### ⚠️ Non-Breaking Changes

#### 1. API Routes Structure

**v2.0:** `/api/agents`, `/api/workflows`, `/api/state`
**v3.0:** Same endpoints, enhanced responses with database IDs

**Impact:** LOW
**Action Required:** None (backward compatible)

#### 2. Agent File Format

**v2.0:** YAML with Zod validation
**v3.0:** Same format, enhanced with database sync

**Impact:** LOW
**Action Required:** None (fully compatible)

#### 3. CLI Commands

**v2.0:** Basic CLI commands
**v3.0:** Enhanced CLI with database operations

**Impact:** LOW
**Action Required:** None (all v2 commands work in v3)

---

## File Structure Changes

### Archived Files (V2 → archive/v2/)

The following files were moved to `archive/v2/` during migration:

```
archive/v2/
├── PRD.md                           # V2 Product Requirements
├── PLAN.md                          # V2 Development Plan
├── ARCHITECTURE.md                  # V2 Architecture
├── FEASIBILITY-REPORT.md            # V2 Feasibility Study
├── ROADMAP-V3-FUTURE-VISION.md      # Early V3 vision doc
├── ARCHITECTURE-V3-FUTURE.md        # Early V3 architecture proposals
└── docs/
    ├── story-V2-001.md              # 25 V2 story files
    ├── story-V2-002.md
    └── ... (23 more files)
```

### Renamed Files (V3 → Main)

V3 files were promoted to primary filenames:

| Old Filename (V3)            | New Filename (Main)       |
| ---------------------------- | ------------------------- |
| `PRD-V3.md`                  | `PRD.md`                  |
| `PLAN-V3.md`                 | `PLAN.md`                 |
| `ARCHITECTURE-V3.md`         | `ARCHITECTURE.md`         |
| `FEASIBILITY-REPORT-V3.md`   | `FEASIBILITY-REPORT.md`   |
| `docs/v3-workflow-status.md` | `docs/workflow-status.md` |
| `docs/story-V3-*.md`         | `docs/story-*.md`         |

### New Files in V3

```
madace/core/config.yaml              # REQUIRED configuration (NEW)
prisma/schema.prisma                 # Database schema (NEW)
prisma/migrations/                   # Database migrations (NEW)
lib/database/                        # Database utilities (NEW)
MIGRATION-V2-TO-V3.md                # This file (NEW)
MADACE-COMPLIANCE-AUDIT-V3.md        # Compliance report (NEW)
```

---

## Configuration Changes

### 1. Create `madace/core/config.yaml`

**This file is now REQUIRED in v3.0.** All agents reference it via `load_always` directive.

```yaml
# madace/core/config.yaml
project_name: 'MADACE-Method v3.0'
output_folder: 'docs'
user_name: 'Developer'
communication_language: 'en'

modules:
  mam:
    enabled: true
    description: 'MADACE Agile Method - Project management and story workflow'
  mab:
    enabled: false
    description: 'MADACE Agent Builder (planned for v3.1+)'
  cis:
    enabled: false
    description: 'Creative Intelligence Suite (planned for v3.1+)'

llm:
  provider: 'gemini'
  model: 'gemini-2.0-flash-exp'
  temperature: 0.7
  max_tokens: 2048

workflow:
  state_file_location: 'docs/workflow-status.md'
  auto_save: true
  validation_level: 'strict'

state_machine:
  max_todo_items: 1
  max_in_progress_items: 1
  enforce_sequential_transitions: true

database:
  provider: 'postgresql'
  connection_pooling: true
  max_connections: 20

cli:
  websocket_port: 3001
  sync_enabled: true
  auto_reconnect: true
```

### 2. Update `.env` File

**Add database configuration:**

```bash
# Database Configuration (NEW in V3)
DATABASE_URL="postgresql://user:password@localhost:5432/madace?schema=public"

# Update project name
PROJECT_NAME="MADACE-Method v3.0"

# Update status file path
STATUS_FILE="docs/workflow-status.md"
```

### 3. Update `package.json` Metadata

```json
{
  "name": "madace-method-v3",
  "version": "3.0.0-alpha",
  "description": "MADACE-Method v3.0 - Production-ready full-stack implementation with Prisma ORM"
}
```

---

## Database Setup

### Option 1: Local PostgreSQL

#### Install PostgreSQL

**macOS (Homebrew):**

```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql-14 postgresql-contrib-14
sudo systemctl start postgresql
```

**Windows:**

- Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Follow installation wizard

#### Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE madace;
CREATE USER madace_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE madace TO madace_user;
\q
```

#### Set DATABASE_URL

```bash
# Add to .env
DATABASE_URL="postgresql://madace_user:your_secure_password@localhost:5432/madace?schema=public"
```

### Option 2: Docker PostgreSQL

**Create `docker-compose.db.yml`:**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    container_name: madace-postgres
    environment:
      POSTGRES_DB: madace
      POSTGRES_USER: madace_user
      POSTGRES_PASSWORD: madace_secure_pass
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Start database:**

```bash
docker-compose -f docker-compose.db.yml up -d

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://madace_user:madace_secure_pass@localhost:5432/madace?schema=public"
```

### Option 3: Managed Cloud Database

**Recommended services:**

- [Neon](https://neon.tech) (Free tier, serverless)
- [Supabase](https://supabase.com) (Free tier, PostgreSQL + more)
- [Railway](https://railway.app) (Free tier with credit)
- AWS RDS (Production)
- Google Cloud SQL (Production)

**Setup steps:**

1. Create PostgreSQL database instance
2. Copy connection string
3. Add to `.env` as `DATABASE_URL`

---

## Step-by-Step Migration

### Step 1: Backup V2 Data

```bash
# Create backup directory
mkdir -p backups/v2-$(date +%Y%m%d)

# Backup configuration
cp -r madace/core backups/v2-$(date +%Y%m%d)/

# Backup state files
cp docs/mam-workflow-status.md backups/v2-$(date +%Y%m%d)/ 2>/dev/null || true
cp docs/workflow-status.md backups/v2-$(date +%Y%m%d)/ 2>/dev/null || true

# Backup custom agents/workflows
cp -r madace/mam backups/v2-$(date +%Y%m%d)/

echo "✅ Backup created in backups/v2-$(date +%Y%m%d)/"
```

### Step 2: Pull V3 Code

```bash
# Ensure clean working tree
git status

# Pull latest changes (if from remote)
git pull origin main

# Or checkout v3.0-alpha tag
git checkout tags/v3.0-alpha
```

### Step 3: Install Dependencies

```bash
# Install npm packages (includes Prisma)
npm install

# Verify versions
npm run validate-versions
```

### Step 4: Create Configuration File

```bash
# Create required config.yaml
cat > madace/core/config.yaml <<EOF
project_name: 'MADACE-Method v3.0'
output_folder: 'docs'
user_name: '$(git config user.name || echo "Developer")'
communication_language: 'en'

modules:
  mam:
    enabled: true
  mab:
    enabled: false
  cis:
    enabled: false

llm:
  provider: 'gemini'
  model: 'gemini-2.0-flash-exp'
  temperature: 0.7
  max_tokens: 2048

workflow:
  state_file_location: 'docs/workflow-status.md'
  auto_save: true
  validation_level: 'strict'

state_machine:
  max_todo_items: 1
  max_in_progress_items: 1
  enforce_sequential_transitions: true

database:
  provider: 'postgresql'
  connection_pooling: true
  max_connections: 20

cli:
  websocket_port: 3001
  sync_enabled: true
  auto_reconnect: true
EOF

echo "✅ Configuration file created"
```

### Step 5: Setup Database

```bash
# Set DATABASE_URL in .env
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/madace?schema=public"' >> .env

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Verify database connection
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

### Step 6: Migrate State Data

**If you have existing workflow state in `docs/mam-workflow-status.md`:**

```bash
# Use migration script (to be created)
npm run migrate:state-to-db

# Or manually via Prisma Studio:
# 1. Open http://localhost:5555
# 2. Navigate to WorkflowState table
# 3. Add records for each story in BACKLOG/TODO/IN_PROGRESS/DONE
```

**State data mapping:**

| V2 (Markdown)          | V3 (Database)            |
| ---------------------- | ------------------------ |
| Story ID               | `entity_id` (VARCHAR)    |
| Status                 | `state` (ENUM)           |
| Markdown content       | `details` (JSONB)        |
| File modification time | `updated_at` (TIMESTAMP) |

### Step 7: Rename Status File

```bash
# If you have old status file
if [ -f docs/mam-workflow-status.md ]; then
  mv docs/mam-workflow-status.md docs/workflow-status.md
  echo "✅ Status file renamed"
fi
```

### Step 8: Run Quality Checks

```bash
# Run all validation checks
npm run check-all

# Expected output:
# ✅ Version validation: PASS
# ✅ TypeScript type-check: PASS
# ✅ ESLint: PASS
# ✅ Prettier format check: PASS
```

### Step 9: Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Open browser
open http://localhost:3000
```

### Step 10: Verify Migration

Visit the following pages and verify functionality:

- ✅ Home: http://localhost:3000
- ✅ Agents: http://localhost:3000/agents
- ✅ Agent Detail: http://localhost:3000/agents/pm
- ✅ Workflows: http://localhost:3000/workflows
- ✅ Status Dashboard: http://localhost:3000/status
- ✅ Settings: http://localhost:3000/settings
- ✅ Documentation: http://localhost:3000/docs

**Check database connection:**

```bash
# Open Prisma Studio
npm run db:studio

# Verify tables exist:
# - WorkflowState
# - Agent
# - Workflow
# - Story
# - Epic
```

---

## API Changes

### Endpoint Compatibility

All v2.0 API endpoints work in v3.0, with enhanced responses:

#### `GET /api/agents`

**V2 Response:**

```json
{
  "success": true,
  "agents": [
    { "name": "pm", "version": "1.0.0", ... }
  ]
}
```

**V3 Response:**

```json
{
  "success": true,
  "agents": [
    {
      "id": "agent_123",          // NEW: Database ID
      "name": "pm",
      "version": "1.0.0",
      "source": "file",            // NEW: Source indicator
      "synced_at": "2025-10-29T...", // NEW: Last sync timestamp
      ...
    }
  ]
}
```

#### `GET /api/status/:type/:id`

**V2 Response:**

```json
{
  "success": true,
  "entity": { "type": "story", "id": "STORY-001" },
  "status": { "state": "IN_PROGRESS" },
  "source": "file:docs/workflow-status.md"
}
```

**V3 Response:**

```json
{
  "success": true,
  "entity": { "type": "story", "id": "STORY-001" },
  "status": {
    "state": "IN_PROGRESS",
    "db_id": "workflow_state_456", // NEW
    "synced": true // NEW
  },
  "sources": [
    "file:docs/workflow-status.md",
    "db:workflow_state.id=456" // NEW
  ]
}
```

### New Endpoints in V3

```
POST /api/database/sync              # Sync file state to database
GET  /api/database/health            # Database connection health
POST /api/database/migrate           # Run pending migrations
GET  /api/stories                    # List all stories (database-backed)
GET  /api/epics                      # List all epics (database-backed)
```

---

## Testing Migration

### Manual Testing Checklist

- [ ] All pages load without errors
- [ ] Agents list displays correctly
- [ ] Agent detail pages render (PM, Analyst, Architect, SM, DEV)
- [ ] Workflow status loads from database
- [ ] Status dashboard shows correct counts
- [ ] Settings page saves configuration
- [ ] Documentation viewer works
- [ ] WebSocket connection establishes (port 3001)
- [ ] CLI commands work (`npm run madace status`)

### Automated Testing

```bash
# Run unit tests
npm test

# Run E2E tests (Playwright)
npm run test:e2e

# Run database tests
npm run test:db
```

### Database Verification

```bash
# Check database migrations
npx prisma migrate status

# Inspect database schema
npx prisma db pull
npx prisma studio

# Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"WorkflowState\";"
psql $DATABASE_URL -c "SELECT entity_id, state FROM \"WorkflowState\" ORDER BY updated_at DESC LIMIT 10;"
```

---

## Rollback Plan

If migration fails, follow these steps to rollback:

### Quick Rollback (V3 → V2)

```bash
# 1. Stop dev server
# Ctrl+C or:
lsof -ti:3000 | xargs kill -9

# 2. Checkout V2 tag or commit
git checkout tags/v2.0-final
# Or: git checkout <v2-commit-hash>

# 3. Restore V2 dependencies
npm ci

# 4. Restore V2 configuration
cp backups/v2-<date>/madace/core/config.yaml madace/core/ 2>/dev/null || true
cp backups/v2-<date>/mam-workflow-status.md docs/ 2>/dev/null || true

# 5. Remove V3-specific files
rm -rf prisma node_modules/.prisma

# 6. Restart V2 dev server
npm run dev
```

### Data Recovery

```bash
# Restore from backup
cp -r backups/v2-<date>/* ./

# Verify data integrity
cat docs/mam-workflow-status.md
ls -la madace/mam/agents/
```

---

## Troubleshooting

### Issue 1: Database Connection Error

**Error:**

```
Error: Can't reach database server at `localhost:5432`
```

**Solution:**

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# If not running, start it:
# macOS:
brew services start postgresql@14

# Ubuntu:
sudo systemctl start postgresql

# Docker:
docker-compose -f docker-compose.db.yml up -d
```

### Issue 2: Prisma Migration Fails

**Error:**

```
Error: P3009: migrate found failed migrations
```

**Solution:**

```bash
# Reset database (⚠️ DELETES ALL DATA)
npm run db:reset

# Or manually fix:
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate deploy
```

### Issue 3: Missing `config.yaml`

**Error:**

```
AgentLoadError: Failed to load madace/core/config.yaml
```

**Solution:**

```bash
# Create config.yaml from template (see Step 4 above)
cat > madace/core/config.yaml <<EOF
project_name: 'MADACE-Method v3.0'
# ... (full template in Step 4)
EOF
```

### Issue 4: Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue 5: TypeScript Errors After Migration

**Error:**

```
Type error: Cannot find module '@prisma/client'
```

**Solution:**

```bash
# Regenerate Prisma Client
npm run db:generate

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Issue 6: ESLint Warnings

**Error:**

```
Warning: Unexpected console statement.  no-console
```

**Solution:**

```bash
# Auto-fix ESLint issues
npm run lint:fix

# Or suppress specific warnings (temporary)
# Add to eslint.config.mjs:
rules: {
  'no-console': ['warn', { allow: ['warn', 'error'] }]
}
```

---

## Additional Resources

### Documentation

- **[PRD.md](./PRD.md)** - V3 Product Requirements Document
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - V3 Architecture Overview
- **[CLAUDE.md](./CLAUDE.md)** - Development Guidelines
- **[MADACE-COMPLIANCE-AUDIT-V3.md](./MADACE-COMPLIANCE-AUDIT-V3.md)** - Compliance Report

### Prisma Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### Community Support

- **GitHub Issues**: [github.com/tekcin/MADACE-Method-v2/issues](https://github.com/tekcin/MADACE-Method-v2/issues)
- **Discussions**: [github.com/tekcin/MADACE-Method-v2/discussions](https://github.com/tekcin/MADACE-Method-v2/discussions)

---

## Summary Checklist

Before considering migration complete, verify:

- [x] PostgreSQL database is running
- [x] `DATABASE_URL` is set in `.env`
- [x] `madace/core/config.yaml` exists
- [x] Prisma migrations have run (`npm run db:migrate`)
- [x] Prisma Client is generated (`npm run db:generate`)
- [x] All quality checks pass (`npm run check-all`)
- [x] Dev server starts without errors (`npm run dev`)
- [x] All pages load correctly in browser
- [x] Database contains migrated state data
- [x] WebSocket server is running (port 3001)
- [x] CLI commands work (`npm run madace status`)
- [x] Backup of V2 data exists in `backups/`

---

## Timeline

**Typical migration timeline:**

| Phase                   | Duration   | Description                     |
| ----------------------- | ---------- | ------------------------------- |
| Backup V2 data          | 5 min      | Create safety backup            |
| Database setup          | 15-30 min  | Install PostgreSQL, create DB   |
| Install V3 dependencies | 5-10 min   | `npm install`                   |
| Configuration           | 10-15 min  | Create config.yaml, update .env |
| Run migrations          | 5 min      | Prisma migrate + generate       |
| Migrate state data      | 10-20 min  | Move Markdown → Database        |
| Testing                 | 30-60 min  | Verify all functionality        |
| **Total**               | **2-4 hr** | Full migration with testing     |

---

## Conclusion

You've successfully migrated from MADACE v2.0 to v3.0! 🎉

**Key Improvements in V3:**

- ✅ Database-backed state management (PostgreSQL + Prisma)
- ✅ Enhanced CLI with WebSocket real-time sync
- ✅ Production-ready architecture
- ✅ Better error handling and validation
- ✅ Improved documentation and compliance

**Next Steps:**

1. Review [PRD.md](./PRD.md) for V3 features
2. Explore new API endpoints
3. Set up production database (if deploying)
4. Configure HTTPS deployment (see [HTTPS-DEPLOYMENT.md](./docs/HTTPS-DEPLOYMENT.md))

**Need Help?**

- Check [Troubleshooting](#troubleshooting) section
- Open an issue on GitHub
- Review MADACE compliance audit

---

**Document Metadata:**

- **Version:** 1.0
- **Last Updated:** 2025-10-29
- **Maintainer:** MADACE Team
- **License:** MIT

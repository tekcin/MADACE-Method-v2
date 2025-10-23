# Milestone 3.1: Database Migration & Unified Configuration

**Epic**: Database Migration & Unified Configuration
**Milestone**: 3.1
**Priority**: P0 (Must Have - Foundation)
**Timeline**: 3-4 weeks
**Total Points**: 48 points
**Status**: 📅 Ready for Development

---

## Week 1: Database Foundation (15 points)

### [DB-001] Set up Prisma ORM and database infrastructure (5 points)

**As a** developer
**I want to** set up Prisma with SQLite for development
**So that** we have a working database layer

**Acceptance Criteria**:
- ✅ Install Prisma dependencies (`prisma`, `@prisma/client`)
- ✅ Initialize Prisma with `npx prisma init`
- ✅ Configure SQLite for development in `.env`
- ✅ Create `prisma/schema.prisma` with basic config
- ✅ Prisma Studio accessible via `npx prisma studio`
- ✅ Documentation: README section on database setup

**Technical Notes**:
```bash
npm install prisma @prisma/client
npx prisma init
# Update .env: DATABASE_URL="file:./dev.db"
npx prisma generate
```

**Files to Create/Modify**:
- `prisma/schema.prisma`
- `.env` (add DATABASE_URL)
- `package.json` (add scripts)
- `README.md` (database setup section)

**Testing**:
- Run `npx prisma studio` and verify database connection
- Create test migration and verify it works

---

### [DB-002] Design and implement core database schema (8 points)

**As a** developer
**I want to** define all database tables and relationships
**So that** we can store agents, config, workflows, and state

**Acceptance Criteria**:
- ✅ Define `Agent` model with metadata, persona, menu, prompts
- ✅ Define `Config` model with key-value storage
- ✅ Define `Workflow` model with steps and state
- ✅ Define `StateMachine` model for story tracking
- ✅ Define `AgentMemory` model for persistent context
- ✅ Define `User` and `Project` models for multi-tenancy
- ✅ Define all relationships and indexes
- ✅ Run initial migration: `npx prisma migrate dev`

**Schema** (from PRD-V3.md):
```prisma
// See PRD-V3.md Section 4.2 for full schema
// Key models: Agent, AgentMemory, Workflow, Config, StateMachine, Project, User
```

**Files to Create/Modify**:
- `prisma/schema.prisma` (complete schema)
- `prisma/migrations/` (auto-generated)

**Testing**:
- Verify migration runs successfully
- Open Prisma Studio and verify all tables created
- Test relationships work correctly

---

### [DB-003] Create database utility functions and client singleton (2 points)

**As a** developer
**I want to** have a singleton Prisma client and utility functions
**So that** database connections are efficient and reusable

**Acceptance Criteria**:
- ✅ Create `lib/database/client.ts` with Prisma singleton
- ✅ Create `lib/database/utils.ts` with common queries
- ✅ Implement connection pooling for production
- ✅ Add error handling for database operations
- ✅ Export type-safe database types

**Technical Notes**:
```typescript
// lib/database/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Files to Create/Modify**:
- `lib/database/client.ts`
- `lib/database/utils.ts`
- `lib/database/index.ts`

**Testing**:
- Test singleton pattern works (only one instance)
- Test connection pooling
- Verify no connection leaks

---

## Week 2: Agent CRUD & API (18 points)

### [DB-004] Create agent CRUD service layer (5 points)

**As a** developer
**I want to** have service functions for agent operations
**So that** I can create, read, update, and delete agents

**Acceptance Criteria**:
- ✅ Create `lib/services/agent-service.ts`
- ✅ Implement `createAgent(data)` function
- ✅ Implement `getAgent(id)` function
- ✅ Implement `listAgents(projectId?)` function
- ✅ Implement `updateAgent(id, data)` function
- ✅ Implement `deleteAgent(id)` function
- ✅ Implement `searchAgents(query)` function
- ✅ Add Zod validation for all inputs

**Files to Create/Modify**:
- `lib/services/agent-service.ts`
- `lib/types/agent-service.ts`

**Testing**:
- Write unit tests for each CRUD function
- Test validation catches invalid data
- Test database constraints work

---

### [DB-005] Build agent CRUD API endpoints (8 points)

**As a** user
**I want to** manage agents via API
**So that** I can create and customize agents dynamically

**Acceptance Criteria**:
- ✅ `POST /api/v3/agents` - Create agent
- ✅ `GET /api/v3/agents` - List all agents
- ✅ `GET /api/v3/agents/:id` - Get single agent
- ✅ `PUT /api/v3/agents/:id` - Update agent
- ✅ `DELETE /api/v3/agents/:id` - Delete agent
- ✅ `POST /api/v3/agents/:id/export` - Export as JSON
- ✅ `POST /api/v3/agents/import` - Import from JSON
- ✅ All endpoints return proper HTTP status codes
- ✅ Error handling with descriptive messages

**Files to Create/Modify**:
- `app/api/v3/agents/route.ts`
- `app/api/v3/agents/[id]/route.ts`
- `app/api/v3/agents/[id]/export/route.ts`
- `app/api/v3/agents/import/route.ts`

**Testing**:
- Write API route tests for each endpoint
- Test error cases (404, 400, 500)
- Test with Postman/Thunder Client

---

### [DB-006] Create agent management UI components (5 points)

**As a** user
**I want to** create and edit agents in the web UI
**So that** I don't need to edit YAML files

**Acceptance Criteria**:
- ✅ Agent creation wizard component
- ✅ Agent editor form (persona, prompts, menu)
- ✅ Agent list/grid view with search
- ✅ Agent delete confirmation modal
- ✅ Agent export/import UI
- ✅ Form validation with Zod
- ✅ Success/error toast notifications

**Components to Create**:
- `components/features/agents/AgentWizard.tsx`
- `components/features/agents/AgentEditor.tsx`
- `components/features/agents/AgentList.tsx`
- `components/features/agents/AgentDeleteModal.tsx`

**Files to Create/Modify**:
- `app/agents/create/page.tsx` - Agent creation page
- `app/agents/[id]/edit/page.tsx` - Agent edit page
- Component files (listed above)

**Testing**:
- Test form validation
- Test create/update/delete flows
- Test error handling

---

## Week 3: Configuration System (12 points)

### [DB-007] Migrate configuration to database (5 points)

**As a** developer
**I want to** store all configuration in the database
**So that** we have a single source of truth

**Acceptance Criteria**:
- ✅ Create config service (`lib/services/config-service.ts`)
- ✅ Implement `getConfig(key)` function
- ✅ Implement `setConfig(key, value)` function
- ✅ Implement `listConfigs()` function
- ✅ Implement `deleteConfig(key)` function
- ✅ Support for encrypted values (API keys)
- ✅ Migration script: YAML/env → database

**Migration Strategy**:
```typescript
// Read existing config.yaml and .env
// Insert into database
// Keep files as backup but read from DB
```

**Files to Create/Modify**:
- `lib/services/config-service.ts`
- `scripts/migrate-config.ts`

**Testing**:
- Test config CRUD operations
- Test encryption/decryption
- Test migration script with v2.0 data

---

### [DB-008] Build configuration API endpoints (3 points)

**As a** user
**I want to** manage configuration via API
**So that** I can update settings programmatically

**Acceptance Criteria**:
- ✅ `GET /api/v3/config` - List all config
- ✅ `GET /api/v3/config/:key` - Get single config
- ✅ `PUT /api/v3/config/:key` - Set config value
- ✅ `DELETE /api/v3/config/:key` - Delete config
- ✅ Secure API keys (don't expose in responses)
- ✅ Validation for known config keys

**Files to Create/Modify**:
- `app/api/v3/config/route.ts`
- `app/api/v3/config/[key]/route.ts`

**Testing**:
- Test all CRUD operations
- Test encryption works for API keys
- Test validation prevents invalid configs

---

### [DB-009] Build unified settings UI page (4 points)

**As a** user
**I want to** manage all settings in one place
**So that** I don't have to edit multiple files

**Acceptance Criteria**:
- ✅ Settings page with tabs: General, LLM, Modules, Advanced
- ✅ Form inputs for all config values
- ✅ Secure input for API keys (masked)
- ✅ Test LLM connection button
- ✅ Reset to defaults button
- ✅ Save button with confirmation
- ✅ Real-time validation

**Files to Create/Modify**:
- `app/settings/page.tsx` (update existing)
- `components/features/settings/SettingsTabs.tsx`
- `components/features/settings/GeneralSettings.tsx`
- `components/features/settings/LLMSettings.tsx`
- `components/features/settings/ModuleSettings.tsx`

**Testing**:
- Test all form inputs
- Test save/reset functionality
- Test API key masking

---

## Week 4: Migration & Testing (3 points)

### [DB-010] Create v2.0 → v3.0 data migration tool (2 points)

**As a** v2.0 user
**I want to** migrate my data to v3.0
**So that** I don't lose my work

**Acceptance Criteria**:
- ✅ CLI command: `npm run migrate:v2-to-v3`
- ✅ Read YAML agent files → insert into database
- ✅ Read config.yaml → insert into config table
- ✅ Read workflow-status.md → insert into state_machine table
- ✅ Preserve all data (no data loss)
- ✅ Backup original files before migration
- ✅ Dry-run mode to preview changes

**Files to Create/Modify**:
- `scripts/migrate-v2-to-v3.ts`
- `package.json` (add script)

**Testing**:
- Test with real v2.0 data
- Test dry-run mode
- Test rollback capability

---

### [DB-011] Write comprehensive tests for database layer (1 point)

**As a** developer
**I want to** have test coverage for all database operations
**So that** we catch bugs early

**Acceptance Criteria**:
- ✅ Unit tests for all service functions (80%+ coverage)
- ✅ Integration tests for API routes
- ✅ Test data fixtures for common scenarios
- ✅ Test database constraints and validation
- ✅ Test migration scripts
- ✅ All tests passing in CI/CD

**Files to Create/Modify**:
- `__tests__/lib/services/agent-service.test.ts`
- `__tests__/lib/services/config-service.test.ts`
- `__tests__/app/api/v3/agents/route.test.ts`
- `__tests__/app/api/v3/config/route.test.ts`

**Testing**:
- Run `npm test` - all tests pass
- Run `npm test -- --coverage` - 80%+ coverage

---

## Story Summary

### By Category

**Database Infrastructure (3 stories, 15 points)**:
- DB-001: Prisma setup (5 points)
- DB-002: Schema design (8 points)
- DB-003: Database utilities (2 points)

**Agent Management (3 stories, 18 points)**:
- DB-004: Agent CRUD service (5 points)
- DB-005: Agent API endpoints (8 points)
- DB-006: Agent management UI (5 points)

**Configuration System (3 stories, 12 points)**:
- DB-007: Config migration (5 points)
- DB-008: Config API endpoints (3 points)
- DB-009: Settings UI (4 points)

**Migration & Testing (2 stories, 3 points)**:
- DB-010: v2→v3 migration tool (2 points)
- DB-011: Test coverage (1 point)

### Total: 11 stories | 48 points

---

## Recommended Execution Order

**Week 1** (15 points):
1. DB-001 → DB-002 → DB-003

**Week 2** (18 points):
2. DB-004 → DB-005 → DB-006

**Week 3** (12 points):
3. DB-007 → DB-008 → DB-009

**Week 4** (3 points):
4. DB-010 → DB-011 → Release v3.1-alpha

---

## Dependencies

**External**:
- Prisma installed and configured
- SQLite for development
- PostgreSQL for production (later)

**Internal**:
- v2.0.0-alpha codebase
- Existing agent YAML files for migration
- Test infrastructure (Jest)

---

## Success Criteria

**Milestone 3.1 Complete When**:
- ✅ All 11 stories DONE
- ✅ Database schema deployed
- ✅ Agent CRUD working in UI and API
- ✅ Configuration unified in database
- ✅ v2.0 data successfully migrated
- ✅ 80%+ test coverage
- ✅ Documentation updated
- ✅ v3.1-alpha tagged and released to GitHub

---

## Next Steps After 3.1

1. **Code Review**: Review all changes
2. **Release**: Tag v3.1-alpha and push to GitHub
3. **User Testing**: Get feedback on agent management
4. **Plan 3.2**: Move to CLI enhancements milestone

---

**Created By**: PM Agent (MADACE Method)
**Date**: 2025-10-23
**Status**: ✅ Ready for Development

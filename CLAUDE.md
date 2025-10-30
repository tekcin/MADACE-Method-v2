# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **MADACE** = **M**ethodology for **A**I-**D**riven **A**gile **C**ollaboration **E**ngine

> **PROJECT VERSION: v3.0 (Production-Ready Implementation)**
>
> This is the **production implementation** of MADACE-Method with full database support, Prisma ORM, and advanced NLU capabilities.
>
> **For V2 (experimental) history:** See [archive/v2/](./archive/v2/)

## Quick Reference

**Most Common Commands:**

```bash
# Development
npm run dev                # Start dev server at http://localhost:3000
npm run check-all          # Run all quality checks (MUST pass before commit)
npm run build              # Production build (verify before commit)

# Database
npm run db:migrate         # Run database migrations
npm run db:studio          # Open Prisma Studio (database GUI)
npm run db:push            # Push schema changes to database

# Quality Checks
npm run type-check         # TypeScript type checking
npm run lint               # ESLint check
npm run format             # Format with Prettier
npm test                   # Run Jest tests
npm run test:e2e           # Run Playwright E2E tests

# Agent Management
npm run import-madace-v3   # Import MADACE agents to database

# CLI Tools
npm run madace repl        # Interactive REPL mode with autocomplete
npm run madace dashboard   # Terminal dashboard (TUI)
npm run madace chat        # Chat with AI agents
```

**Key File Locations:**

- **Business Logic**: `lib/` (TypeScript modules)
- **API Routes**: `app/api/` (Next.js App Router)
- **Database Schema**: `prisma/schema.prisma`
- **Agent Definitions**: `madace/mam/agents/*.agent.yaml`
- **Workflow Status**: `docs/workflow-status.md` (single source of truth)
- **Types**: `lib/types/` (TypeScript interfaces)

**Environment:**

- Node.js v24.10.0 (v20+ required)
- Next.js 15.5.6 with React 19.2.0
- TypeScript 5.9.3 (strict mode)
- Prisma 6.17.1 (PostgreSQL/SQLite)

## Project Overview

**MADACE-Method v3.0** is a production-ready full-stack implementation with:

- **Frontend**: Next.js 15.5.6 with React 19.2.0 and App Router
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: PostgreSQL (production) / SQLite (development)
- **Business Logic**: TypeScript modules
- **UI**: Modern web interface with real-time collaboration
- **LLM**: Multi-provider support (Gemini/Claude/OpenAI/Local)
- **Agent System**: Database-backed with dynamic loading
- **State Machine**: Visual Kanban board with persistence

### Architecture Overview

**V3 Architecture**: Full-Stack TypeScript with Database

```
Browser (React 19) → Next.js App Router
                          ↓
                    API Routes
                          ↓
                  Business Logic (lib/)
                          ↓
         ┌────────────────┴────────────────┐
         │                                  │
         ▼                                  ▼
   Prisma ORM                        File System
         │                                  │
         ▼                                  ▼
   PostgreSQL/SQLite                YAML Agents
```

**Key Differences from V2:**

- ✅ **Database-backed**: Agents, workflows, state stored in DB
- ✅ **Prisma ORM**: Type-safe database access
- ✅ **Agent Management**: CRUD operations via API + UI
- ✅ **Real-time sync**: WebSocket + database watchers
- ✅ **NLU Integration**: Natural language understanding (planned)
- ✅ **Production-ready**: Deployment guides, E2E tests, monitoring

See [PRD.md](./PRD.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Version Locking Policy

**MADACE v3.0 uses EXACT versions for all dependencies. NO version ranges allowed.**

### Locked Core Tech Stack (DO NOT CHANGE)

```json
{
  "next": "15.5.6", // LOCKED
  "react": "19.2.0", // LOCKED
  "react-dom": "19.2.0", // LOCKED
  "typescript": "5.9.3", // LOCKED
  "prisma": "6.17.1" // LOCKED
}
```

**Before any commit:**

```bash
npm run validate-versions  # Check version requirements
npm run check-all          # All quality checks
```

See [VERSION-LOCK.md](./VERSION-LOCK.md) for full policy.

## Development Workflow

### Initial Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd MADACE-Method-v2.0
npm install

# 2. Setup database (SQLite for development)
npm run db:push

# 3. Import MADACE agents
npm run import-madace-v3

# 4. Start dev server
npm run dev
```

### Database Operations

```bash
# Prisma Studio (visual database editor)
npm run db:studio          # Open at http://localhost:5555

# Schema changes
npm run db:migrate         # Create and run migrations
npm run db:push            # Quick schema push (dev only)
npm run db:generate        # Generate Prisma Client
npm run db:reset           # Reset database (WARNING: deletes data)
```

### Code Quality Checks

```bash
# Run before every commit (MANDATORY)
npm run check-all          # Type-check + lint + format

# Individual checks
npm run type-check         # TypeScript errors
npm run lint               # ESLint issues
npm run lint:fix           # Auto-fix ESLint
npm run format             # Format with Prettier
npm run format:check       # Check formatting only
```

### Testing

```bash
# Unit tests (Jest)
npm test                   # Run all unit tests
npm test -- --watch        # Watch mode

# E2E tests (Playwright)
npm run test:e2e           # Run all E2E tests
npm run test:e2e:ui        # Open Playwright UI
npm run test:e2e:debug     # Debug mode
npm run test:e2e:report    # View last report
npm run test:e2e:clean     # Clean run (restart server)
```

## Key Architecture Components

### Database Layer (Prisma)

**Schema**: `prisma/schema.prisma`

```prisma
model Agent {
  id        String   @id @default(cuid())
  name      String   @unique
  title     String
  module    String
  version   String
  icon      String?
  persona   Json
  menu      Json
  prompts   Json?
  loadAlways Json?
  criticalActions Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WorkflowState {
  id          String   @id @default(cuid())
  workflowId  String   @unique
  currentStep Int
  data        Json
  status      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Accessing Database**:

```typescript
import { prisma } from '@/lib/database/client';

// Query agents
const agents = await prisma.agent.findMany();

// Create agent
const agent = await prisma.agent.create({
  data: { name: 'pm', title: 'Product Manager' /* ... */ },
});

// Update workflow state
await prisma.workflowState.update({
  where: { workflowId: 'mam-workflow' },
  data: { currentStep: 2, status: 'in-progress' },
});
```

### Agent System (`lib/agents/`)

**V3 Agent Architecture**:

- **Loader** (`loader.ts`): Loads from YAML or database
- **Service** (`lib/services/agent-service.ts`): CRUD operations
- **Schema** (`schema.ts`): Zod validation for YAML
- **Runtime** (`runtime.ts`): Agent execution engine
- **Conversation** (`conversation.ts`): LLM conversation management
- **Actions** (`actions.ts`): Agent action handlers

**Loading Agents**:

```typescript
// From database (V3)
import { getAgentById, getAllAgents } from '@/lib/services/agent-service';
const agent = await getAgentById('agent-id');
const agents = await getAllAgents();

// From YAML (for importing)
import { loadAgent } from '@/lib/agents/loader';
const yamlAgent = await loadAgent('/path/to/agent.yaml');
```

### API Routes (V3)

**Agent Management**:

- `GET /api/v3/agents` - List all agents (from DB)
- `GET /api/v3/agents/[id]` - Get agent by ID
- `POST /api/v3/agents` - Create new agent
- `PUT /api/v3/agents/[id]` - Update agent
- `DELETE /api/v3/agents/[id]` - Delete agent
- `POST /api/v3/agents/[id]/duplicate` - Duplicate agent
- `POST /api/v3/agents/[id]/export` - Export as JSON
- `POST /api/v3/agents/import` - Import agent from JSON
- `GET /api/v3/agents/search?q=query` - Search agents

**Chat & NLU**:

- `POST /api/v3/nlu/parse` - Parse natural language queries
- `GET /api/v3/nlu/parse` - Check NLU service status
- `POST /api/v3/chat/sessions` - Create chat session
- `GET /api/v3/chat/sessions` - List chat sessions
- `GET /api/v3/chat/sessions/[id]/messages` - Get chat messages
- `POST /api/v3/chat/sessions/[id]/messages` - Send message
- `POST /api/v3/chat/stream` - Stream LLM responses (SSE)

**Workflow Operations**:

- `GET /api/workflows` - List all workflows
- `GET /api/workflows/[id]` - Get workflow details
- `POST /api/workflows/[id]/execute` - Execute next step
- `GET /api/workflows/[id]/state` - Get execution state
- `DELETE /api/workflows/[id]/state` - Reset workflow

**Status Operations**:

- `GET /api/status/[type]/[id]` - Get status by type (story, epic, workflow)
- `PATCH /api/status/[type]/[id]` - Update status

### LLM Client (`lib/llm/`)

Multi-provider architecture with streaming support:

```typescript
import { createLLMClient } from '@/lib/llm/client';

const client = createLLMClient({
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-2.0-flash-exp',
});

// Blocking request
const response = await client.chat({
  messages: [{ role: 'user', content: 'Hello!' }],
});

// Streaming request
for await (const chunk of client.chatStream(request)) {
  process.stdout.write(chunk.content);
}
```

**Providers**: Gemini, Claude, OpenAI, Local (Ollama/Gemma3)

### State Machine (`lib/state/`)

Manages story lifecycle with database persistence:

```
BACKLOG → TODO → IN_PROGRESS → DONE
```

**Critical Rules**:

- Only ONE story in TODO at a time
- Only ONE story in IN_PROGRESS at a time
- Single source of truth: `docs/workflow-status.md` (synced with DB)
- Atomic state transitions (no skipping)

### Template Engine (`lib/templates/`)

Handlebars-based with legacy pattern support:

```typescript
import { renderTemplate } from '@/lib/templates/engine';

const output = await renderTemplate('template-name', {
  projectName: 'My Project',
  userName: 'John Doe',
});
```

**Supported patterns**:

- Handlebars: `{{variable_name}}`
- Legacy: `{variable-name}`, `${variable}`, `%VAR%`

### Workflow Engine (`lib/workflows/`)

YAML-based workflow execution with sub-workflow support:

```yaml
name: mam-workflow
description: MADACE Agile Method workflow
steps:
  - name: assess-complexity
    action: workflow:assess-scale
    agent: pm

  - name: create-prd
    action: workflow:create-prd
    agent: analyst
    condition: 'complexity >= 2'

  - name: sub-workflow
    action: sub-workflow:epic-breakdown
    workflow: epic-breakdown.workflow.yaml
```

## UI Pages

**Agent Management**:

- `/agents` - Agent selector and list
- `/agents/[id]` - Agent detail view
- `/agents/manage` - CRUD interface for agents

**Chat & Collaboration**:

- `/chat` - Conversational chat interface with AI agents
- Real-time streaming responses via Server-Sent Events
- Message history and threading support

**Workflow & Status**:

- `/workflows` - Workflow list and execution
- `/status` - Visual Kanban board (BACKLOG, TODO, IN_PROGRESS, DONE)
- `/kanban` - Alternative Kanban view

**Configuration**:

- `/setup` - Initial setup wizard
- `/settings` - System configuration
- `/assess` - Complexity assessment tool

**Development**:

- `/docs` - Documentation viewer
- `/docs/[...slug]` - Dynamic doc pages
- `/sync-status` - Real-time sync dashboard
- `/llm-test` - LLM connection tester

## Docker Deployment

**Production (HTTP)**:

```bash
mkdir madace-data
docker-compose up -d
# Access: http://localhost:3000
```

**Production (HTTPS with Caddy)**:

```bash
mkdir -p madace-data logs/caddy
export DOMAIN=madace.yourdomain.com
docker-compose -f docker-compose.https.yml up -d
# Access: https://madace.yourdomain.com
```

**Development (with VSCode Server)**:

```bash
mkdir madace-data
docker-compose -f docker-compose.dev.yml up -d
# VSCode: http://localhost:8080 (password: madace123)
# Next.js: http://localhost:3000
```

See [docs/HTTPS-DEPLOYMENT.md](./docs/HTTPS-DEPLOYMENT.md) for production setup.

## Critical Development Rules

### Database Operations

- **ALWAYS use Prisma Client**: Never raw SQL unless absolutely necessary
- **Run migrations in order**: Use `npm run db:migrate` for schema changes
- **Test schema changes**: Use `npm run db:push` in dev, migrations in prod
- **Backup before reset**: `npm run db:reset` deletes all data

### TypeScript & Type Safety

- Use Zod schemas for runtime validation (YAML, API inputs)
- Leverage Prisma-generated types for database models
- Never use `any` type without explicit reason
- Enable strict mode (already enabled)

### State Machine Operations

- NEVER manually edit `docs/workflow-status.md`
- Use state provider API: `lib/status/providers/state-machine-provider.ts`
- Enforce one-at-a-time rule for TODO and IN_PROGRESS
- Sync changes to database via status API

### Git Workflow

**Before committing**:

```bash
npm run check-all          # MUST pass
npm run build              # Verify production build
npm test                   # Unit tests must pass
npm run test:e2e           # E2E tests must pass (optional but recommended)
```

**Commit message format**:

```
type(scope): brief description

feat(agents): add agent duplication feature
fix(workflows): correct step execution order
docs(readme): update setup instructions
test(api): add tests for agent endpoints
```

### Security Rules

- No executable code in YAML (by design)
- Path traversal protection via validation
- Zod validation on all untrusted input
- API keys in `.env` only (never committed)
- Database queries use parameterized statements (Prisma handles this)

## Testing Strategy

### Unit Tests (Jest)

Location: `__tests__/**/*.test.ts`

```typescript
// __tests__/lib/agents/loader.test.ts
import { loadAgent } from '@/lib/agents/loader';

describe('AgentLoader', () => {
  it('should load valid agent YAML', async () => {
    const agent = await loadAgent('/path/to/pm.agent.yaml');
    expect(agent.metadata.name).toBe('PM');
  });
});
```

### E2E Tests (Playwright)

Location: `e2e-tests/**/*.spec.ts`

```typescript
// e2e-tests/agents.spec.ts
import { test, expect } from '@playwright/test';

test('should display agent list', async ({ page }) => {
  await page.goto('/agents');
  await expect(page.locator('h1')).toContainText('MADACE Agents');
});
```

**Test Guidelines**:

- Unit tests for business logic
- E2E tests for user workflows
- Mock external dependencies (LLM APIs)
- Test error cases and edge cases

## Common Tasks

### Adding a New Agent

```bash
# 1. Create YAML file
# madace/mam/agents/new-agent.agent.yaml

# 2. Import to database
npm run import-madace-v3

# 3. Verify in Prisma Studio
npm run db:studio
```

### Creating a New API Endpoint

```typescript
// app/api/v3/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.model.findMany();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error message' }, { status: 500 });
  }
}
```

### Adding a Database Model

```prisma
// prisma/schema.prisma
model NewModel {
  id        String   @id @default(cuid())
  name      String   @unique
  data      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```bash
# Generate migration
npm run db:migrate

# Or quick push (dev only)
npm run db:push
```

## Troubleshooting

### Database Issues

```bash
# Can't connect to database
npm run db:push              # Reinitialize

# Schema out of sync
npm run db:generate          # Regenerate Prisma Client

# Corrupt data
npm run db:reset             # WARNING: Deletes all data
npm run import-madace-v3     # Re-import agents
```

### Port Conflicts

```bash
# Port 3000 in use
lsof -ti:3000 | xargs kill -9

# Port 5555 (Prisma Studio) in use
lsof -ti:5555 | xargs kill -9
```

### TypeScript Errors

```bash
# Clear caches
rm -rf .next node_modules/.cache
npm run build
```

### E2E Test Failures

```bash
# Clean environment
npm run test:e2e:clean       # Restart server + run tests

# Debug mode
npm run test:e2e:debug       # Step through tests
```

## Documentation

**Core Docs**:

- [README.md](./README.md) - Project overview
- [PRD.md](./PRD.md) - Product requirements (V3)
- [PLAN.md](./PLAN.md) - Development roadmap
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [FEASIBILITY-REPORT.md](./FEASIBILITY-REPORT.md) - Technical feasibility

**Guides**:

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development container setup
- [E2E-TESTING-GUIDE.md](./E2E-TESTING-GUIDE.md) - E2E testing guide
- [TESTING-POLICY.md](./TESTING-POLICY.md) - Testing standards
- [docs/HTTPS-DEPLOYMENT.md](./docs/HTTPS-DEPLOYMENT.md) - Production deployment

**V2 Archive**:

- [archive/v2/](./archive/v2/) - V2 documentation and code

## Project Status

**Current Phase**: V3 Alpha - Milestone 3.3 In Progress (Conversational AI & NLU)

**Milestone Progress**:

- ✅ **Milestone 3.1: Database Migration** - COMPLETE (48/48 points)
- ✅ **Milestone 3.2: CLI Enhancements** - COMPLETE (35/35 points)
- ⏳ **Milestone 3.3: Conversational AI & NLU** - IN PROGRESS (33/55 points, 60%)
- 📋 **Milestone 3.4: Web IDE & Collaboration** - PLANNED

**Recently Completed**:

- ✅ Prisma ORM integration with PostgreSQL/SQLite
- ✅ Database schema design (8 models)
- ✅ Agent CRUD API (V3) with search and duplication
- ✅ Agent management UI with responsive design
- ✅ LLM multi-provider client (Gemini/Claude/OpenAI/Local)
- ✅ Interactive REPL mode with autocomplete and history
- ✅ Terminal dashboard (TUI) with 4-pane layout
- ✅ Full CLI feature parity (24 commands across 5 categories)
- ✅ NLU integration with Dialogflow CX
- ✅ Entity extraction and fuzzy matching
- ✅ Chat UI for Web and CLI with streaming responses
- ✅ E2E testing framework with Playwright
- ✅ Docker deployment (HTTP/HTTPS)

**In Progress**:

- ⏳ Message history and threading ([CHAT-002])
- ⏳ Markdown rendering and code highlighting ([CHAT-003])

**Planned**:

- 📋 Agent memory system (persistent and contextual)
- 📋 Real-time collaboration features (Web IDE)
- 📋 Advanced agent orchestration
- 📋 Plugin system

See [docs/workflow-status.md](./docs/workflow-status.md) for detailed story tracking.

---

**For V2 experimental implementation**, see [archive/v2/](./archive/v2/)

**For official MADACE-METHOD (Node.js CLI)**, see https://github.com/tekcin/MADACE-METHOD

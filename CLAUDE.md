# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **MADACE** = **M**ethodology for **A**I-**D**riven **A**gile **C**ollaboration **E**ngine

> **⚠️ PROJECT VERSION: v2.0 (Experimental Next.js Implementation)**
>
> This document describes the **CURRENT project** (v2.0 Alpha).
>
> **For v3.0 future vision:** See [ROADMAP-V3-FUTURE-VISION.md](./ROADMAP-V3-FUTURE-VISION.md) and [ARCHITECTURE-V3-FUTURE.md](./ARCHITECTURE-V3-FUTURE.md)
>
> **DO NOT implement v3.0 features** (database, NLU, web IDE, real-time collaboration) in this v2.0 implementation.

> **IMPORTANT**: This is an **experimental implementation** exploring MADACE-METHOD concepts using Next.js 15 full-stack TypeScript.
>
> The **official MADACE-METHOD** is Node.js CLI-based. See: https://github.com/tekcin/MADACE-METHOD

## Quick Reference

**Most Common Commands:**

```bash
# Development
npm run dev                # Start dev server at http://localhost:3000
npm run check-all          # Run all quality checks (MUST pass before commit)
npm run build              # Production build (verify before commit)

# Quality Checks
npm run type-check         # TypeScript type checking
npm run lint               # ESLint check
npm run format             # Format with Prettier
npm test                   # Run Jest tests

# Docker
docker-compose up -d                          # Production deployment
docker-compose -f docker-compose.dev.yml up -d  # Development with IDEs
docker-compose down                           # Stop containers
```

**Key File Locations:**

- **Business Logic**: `lib/` (TypeScript modules)
- **API Routes**: `app/api/` (Next.js App Router)
- **UI Components**: `components/features/` and `app/*/page.tsx`
- **Agent Definitions**: `madace/mam/agents/*.agent.yaml`
- **State Machine**: `docs/mam-workflow-status.md` (single source of truth)
- **Types**: `lib/types/` (TypeScript interfaces)

**Environment:**

- Node.js v24.10.0 (v20+ required)
- Next.js 15.5.6 with React 19.2.0
- TypeScript 5.9.3 (strict mode)

## ⚠️ CRITICAL: Version Locking Policy

**MADACE-Method v2.0 uses EXACT versions for all dependencies. NO version ranges allowed.**

### Locked Core Tech Stack (DO NOT CHANGE)

```json
{
  "next": "15.5.6",      // LOCKED - NO upgrades without team approval
  "react": "19.2.0",     // LOCKED - Must match react-dom
  "react-dom": "19.2.0", // LOCKED - Must match react
  "typescript": "5.9.3"  // LOCKED - Strict mode enabled
}
```

### Why Exact Versions?

1. **Consistency** - Same behavior across all environments (dev/staging/prod)
2. **Reproducibility** - `npm ci` installs exact versions from package-lock.json
3. **No Surprises** - Version ranges can introduce breaking changes silently
4. **MADACE Compliance** - Official requirement for v2.0-alpha release

### Version Validation

**Before any commit, run:**

```bash
npm run validate-versions  # Checks all version requirements
npm run check-all          # Includes version validation + quality checks
```

**The validation script checks:**
- ✅ Next.js is exactly 15.5.6
- ✅ React is exactly 19.2.0
- ✅ React DOM is exactly 19.2.0
- ✅ TypeScript is exactly 5.9.3
- ✅ Node.js is >= 20.0.0 (recommended: 24.10.0)
- ✅ No version ranges in package.json (no ^, ~, >, <)
- ✅ Installed versions match package.json

### Enforced by Configuration

```bash
# .nvmrc - Node.js version lock
24.10.0

# .npmrc - npm configuration
save-exact=true        # Always save exact versions
engine-strict=true     # Enforce engine requirements
package-lock=true      # Use lockfile for reproducibility

# package.json - Engine requirements
"engines": {
  "node": ">=20.0.0",
  "npm": ">=9.0.0"
}
```

### Rules for Dependencies

1. **NEVER use version ranges** (^, ~, >=, <=, >, <)
2. **ALWAYS use exact versions** (e.g., "15.5.6", not "^15.5.6")
3. **RUN validation before committing** (`npm run validate-versions`)
4. **USE `npm ci`** instead of `npm install` in CI/CD
5. **COMMIT package-lock.json** to git (required)

### Upgrading Dependencies

**⚠️ Core packages (Next.js, React, TypeScript) require team approval.**

**Process for non-core packages:**

```bash
# 1. Check current version
npm list <package-name>

# 2. Update to specific version (no ranges!)
npm install <package-name>@<exact-version>

# 3. Validate
npm run validate-versions
npm run check-all

# 4. Test thoroughly
npm run build
npm test

# 5. Commit with explanation
git add package.json package-lock.json
git commit -m "deps: update <package> to <version> - <reason>"
```

### When to Upgrade Core Packages

**DO NOT upgrade unless:**
- ✅ Critical security vulnerability
- ✅ Team consensus on upgrade path
- ✅ All tests pass with new version
- ✅ Migration guide reviewed
- ✅ Breaking changes documented

**For v2.0-alpha: Core packages are FROZEN until beta release.**

## Project Overview

This repository (MADACE-Method v2.0) is a **proof-of-concept** implementation with a simplified Next.js full-stack architecture:

- **Frontend**: Next.js 15.5.6 with React 19.2.0 and App Router
- **Backend**: Next.js API Routes and Server Actions
- **Business Logic**: TypeScript modules
- **UI**: Web-based interface with visual Kanban board
- **LLM**: User-selectable (Gemini/Claude/OpenAI/Local)

### Architecture

**Current Design**: Next.js 15 Full-Stack TypeScript

- Single runtime (Node.js)
- Single language (TypeScript everywhere)
- Proven stack with battle-tested components
- 4-week timeline to Alpha MVP

See [ADR-003](./docs/adrs/ADR-003-architecture-simplification.md) for architectural decisions.

### Official MADACE-METHOD vs This Project

| Aspect            | Official MADACE       | This Project (Experimental) |
| ----------------- | --------------------- | --------------------------- |
| **Language**      | JavaScript/Node.js    | TypeScript/Node.js          |
| **Interface**     | CLI + IDE integration | Web UI (browser-based)      |
| **Architecture**  | Single runtime        | Single runtime (Next.js)    |
| **Status**        | v1.0-alpha.2 (Stable) | Proof-of-concept (Alpha)    |
| **State Machine** | CLI text              | Visual Kanban board         |
| **LLM Selection** | Fixed                 | User-selectable (4 options) |
| **Use Case**      | Production use        | Research & UI innovation    |

## Project Status

**Current Phase**: ✅ Implementation In Progress - Foundation Complete

**Completed**:

- ✅ Architecture review and simplification decision
- ✅ LLM selection system created
- ✅ Documentation updated for new architecture
- ✅ ADRs created (ADR-001, ADR-002, ADR-003)
- ✅ **Feasibility tests completed (ALL PASSED)**
- ✅ Core dependencies installed (zod, js-yaml, handlebars)
- ✅ Environment validated (Node.js v24.10.0)
- ✅ CLI tools confirmed (Claude CLI v2.0.14, Gemini CLI v0.9.0)
- ✅ **Next.js 15.5.6 project initialized**
- ✅ **Project structure created** (app/, lib/, components/)
- ✅ **ESLint and Prettier configured**
- ✅ **Environment variables configured** (.env.example)
- ✅ **Base layout and navigation** (responsive, dark mode)
- ✅ **Setup Wizard UI** (4-step configuration wizard)
- ✅ **Agent Loader** (Zod validation, YAML parsing, caching)
- ✅ **Multi-provider LLM client** (Gemini, Claude, OpenAI, Local)
- ✅ **API routes** (agents, LLM test)
- ✅ Docker deployment configured (production + development)
- ✅ Development container with VSCode Server + Cursor ready

**In Progress**:

- ⏭️ Configuration persistence (save config.yaml + .env from web UI)
- ⬜ Settings Page (edit configuration)
- ⬜ Workflow Engine
- ⬜ State Machine
- ⬜ Template Engine

**Completed Stories**: 13 stories | 57 points (see [docs/mam-workflow-status.md](./docs/mam-workflow-status.md))

**Feasibility Validation**: See [FEASIBILITY-REPORT.md](./FEASIBILITY-REPORT.md)

**Timeline**: Week 2 of 4-week Alpha MVP timeline

## Development Commands

### LLM Selection (First Step)

```bash
# Interactive LLM selection for planning/architecture
./scripts/select-llm.sh

# Test LLM connection
./scripts/test-llm.sh
```

### Next.js Development

```bash
npm install                # Install dependencies
npm run dev                # Development server (http://localhost:3000)
npm run build              # Production build
npm start                  # Production server

# Code Quality
npm run type-check         # TypeScript type checking (no emit)
npm run lint               # ESLint (check)
npm run lint:fix           # ESLint (auto-fix)
npm run format             # Prettier (format all files)
npm run format:check       # Prettier (check only)
npm run check-all          # Run all checks (type-check + lint + format:check)

# Testing
npm test                   # Run Jest tests (__tests__/ and *.spec.ts)
```

### Docker Deployment

**IMPORTANT: Always use Docker Compose for Docker operations in this project.**

Docker Compose provides:

- Consistent configuration across environments
- Volume management for data persistence
- Easy service orchestration
- Simplified command interface
- Environment-specific configurations

**Two deployment modes:**

#### Development Container (with VSCode + Cursor)

```bash
# Start development environment with IDEs pre-installed
mkdir madace-data
docker-compose -f docker-compose.dev.yml up -d

# Access:
# - VSCode Server: http://localhost:8080 (password: madace123)
# - Next.js Dev: http://localhost:3000
# - Cursor: http://localhost:8081

# Stop containers
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Features:
# ✅ VSCode Server in browser with all extensions
# ✅ Cursor IDE for AI-powered coding
# ✅ Hot reload enabled
# ✅ All dev tools pre-installed (TypeScript, ESLint, Prettier, Jest)
# ✅ Claude CLI integrated
# ✅ Live code sync (edit in browser, saves to host)
```

#### Production Deployment (optimized image)

```bash
# Create data folder on host
mkdir madace-data

# Build and run production container with Docker Compose (RECOMMENDED)
docker-compose up -d

# Stop containers
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f

# Access: http://localhost:3000
# Complete setup wizard (saves to madace-data/config/)
```

**Why Docker Compose?**

- ✅ Declarative configuration in `docker-compose.yml`
- ✅ Automatic volume creation and management
- ✅ Named volumes for better data persistence
- ✅ Easy to scale and add services (future: database, redis, etc.)
- ✅ Consistent commands across dev/prod environments
- ✅ No manual port/volume mapping needed

**Data Persistence (both modes):**

- All config, generated files, and user data stored in `./madace-data/` (host folder)
- Volume mounted to `/app/data` (production) or `/workspace/madace-data` (dev)
- Survives container restarts and updates

## Architecture Highlights

### Component Communication Flow

```
User (Browser) → Frontend (React)
                     ↓
              API Routes (Next.js)
                     ↓
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    Agent System          Workflow Engine
         │                       │
         └───────────┬───────────┘
                     ▼
              State Machine
                     ↓
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   Template Engine         LLM Client
         │                       │
         └───────────┬───────────┘
                     ▼
                File System
         (Agents, Workflows, Status)
```

### Key Architectural Components (TypeScript)

**Agent System** (`lib/agents/`):

- **Loader** (`loader.ts`): AgentLoader class with YAML parsing and caching
  - Singleton pattern with `loadAgent()` and `loadMAMAgents()` functions
  - In-memory caching to avoid repeated file reads
  - Custom `AgentLoadError` for detailed error messages
  - Example: `loadMAMAgents()` loads all 5 MAM agents from `madace/mam/agents/`
- **Schema** (`schema.ts`): Zod validation schemas
  - `AgentFileSchema` validates entire YAML structure
  - `AgentSchema` for agent metadata and definition
  - Runtime type safety with `z.infer<typeof AgentSchema>`
- **Types** (`lib/types/agent.ts`): TypeScript interfaces
  - `Agent`, `AgentMetadata`, `AgentPersona`, `AgentMenu`, `AgentPrompt`
  - Type-safe agent structure throughout the application
- **Runtime** (TODO): Agent execution engine not yet implemented

**Workflow Engine** (TODO - `lib/workflows/`):

- Parses and executes workflow YAML files
- Sequential step execution with state persistence
- Supports action types: elicit, reflect, guide, template, validate, sub-workflow
- State files: `.{workflow-name}.state.json`
- **Status**: Not yet implemented (placeholder index.ts only)

**Template Engine** (TODO - `lib/templates/`):

- Handlebars template rendering (planned)
- Support for legacy patterns: `{var}`, `${var}`, `%VAR%`
- Standard MADACE variables
- Template validation
- **Status**: Not yet implemented (has `llm-system-prompt.ts` placeholder)

**State Machine** (TODO - `lib/state/`):

- Manages story lifecycle: BACKLOG → TODO → IN PROGRESS → DONE
- **Critical Rules**:
  - Only ONE story in TODO at a time
  - Only ONE story in IN PROGRESS at a time
  - Single source of truth: `docs/mam-workflow-status.md`
  - Atomic state transitions (no skipping states)
- **Visual Kanban Board** in Web UI (planned)
- **Status**: Not yet implemented (placeholder index.ts only)

**LLM Client** (`lib/llm/`):

- **Client** (`client.ts`): Factory pattern for multi-provider support
  - `LLMClient` class with `chat()` and `chatStream()` methods
  - Provider switching via `createProvider()` factory
  - Configuration validation before each request
  - Example: `createLLMClient({ provider: 'gemini', apiKey, model })`
- **Providers** (`providers/`): Strategy pattern implementations
  - `BaseLLMProvider` abstract class with common functionality
  - Gemini, Claude, OpenAI, Local providers (all currently stubs)
  - Each provider implements `ILLMProvider` interface
  - Support for both blocking and streaming responses
- **Types** (`types.ts`): LLM interfaces
  - `LLMConfig`, `LLMRequest`, `LLMResponse`, `LLMStreamChunk`, `ILLMProvider`
  - AsyncGenerator for streaming API
- **Config** (`config.ts`): `getLLMConfigFromEnv()` helper
- **API Route**: `app/api/llm/test/route.ts` for testing LLM connections
- **Status**: ✅ Architecture complete, providers need real implementations

**Configuration Manager** (TODO - `lib/config/`):

- Auto-detects config location: `./madace/core/config.yaml` (planned)
- Cross-platform path resolution
- Validates installation integrity
- Zod schema validation
- **Status**: Not yet implemented (placeholder index.ts only)
- **Next**: Implement `app/api/config/route.ts` to save setup wizard config

### API Routes

Currently implemented REST endpoints:

**Agent Operations** (`app/api/agents/`):

- `GET /api/agents` - List all MAM agents
  - Returns array of 5 agents (PM, Analyst, Architect, SM, DEV)
  - Uses `loadMAMAgents()` from agent loader
  - Example response: `[{ name: 'pm', version: '1.0.0', ... }]`
- `GET /api/agents/[name]` - Get single agent by name
  - Example: `/api/agents/pm` returns PM agent definition
  - 404 if agent not found
  - Uses `loadAgent()` with file path

**LLM Operations** (`app/api/llm/`):

- `POST /api/llm/test` - Test LLM connection
  - Request: `{ provider, apiKey, model, testPrompt? }`
  - Response: `{ success, message, provider }`
  - Uses `createLLMClient()` and `chat()` method
  - Validates configuration before testing

**Workflow Operations** (`app/api/workflows/`):

- `GET /api/workflows` - List all workflows
- `GET /api/workflows/[name]` - Get workflow details
- `POST /api/workflows/[name]/execute` - Execute next workflow step
- `GET /api/workflows/[name]/state` - Get workflow execution state
- `DELETE /api/workflows/[name]/state` - Reset workflow state

**State Operations** (`app/api/state/`):

- `GET /api/state` - Get current workflow status from state machine

**Configuration Operations** (`app/api/config/`):

- `GET /api/config` - Load configuration
- `POST /api/config` - Save configuration

**Health Check** (`app/api/health/`):

- `GET /api/health` - System health check (filesystem, state machine, config, LLM)

**Sync Service** (`app/api/sync/`): ✅ **NEW**

- `GET /api/sync` - Get sync service status and connected clients
- `POST /api/sync` - Start/stop WebSocket sync service
  - Request: `{ action: 'start' | 'stop', wsPort?: number }`
  - Response: `{ success, running, clientCount }`

### CLI Integration System ✅ **NEW**

**Overview**: Real-time synchronization between Web UI and external CLI tools (Claude CLI, Gemini CLI).

**Architecture** (`lib/cli/` and `lib/sync/`):

- **CLI Adapters** (`lib/cli/`):
  - `ClaudeCLIAdapter` - Integrates with Anthropic's Claude CLI
  - `GeminiCLIAdapter` - Integrates with Google's Gemini CLI
  - Both adapters use the same TypeScript business logic as Web UI
  - Generate `.claude.json` and `.gemini.json` config files

- **WebSocket Server** (`lib/sync/websocket-server.ts`):
  - Real-time bidirectional communication (port 3001)
  - Broadcasts state changes to all connected clients
  - Client detection (Web UI, Claude CLI, Gemini CLI)
  - Ping/pong heartbeat for connection health
  - Singleton pattern with `getWebSocketServer()`

- **File Watchers** (`lib/sync/file-watcher.ts`):
  - Monitors workflow state files (`.*.state.json`)
  - Monitors configuration changes
  - Debounced change detection (300ms)
  - Auto-broadcasts via WebSocket on file changes

- **Sync Service** (`lib/sync/sync-service.ts`):
  - Coordinates WebSocket server + file watchers
  - Single entry point: `startSyncService()` / `stopSyncService()`
  - Default paths: `madace-data/workflow-states`, `madace-data/config/config.yaml`

**Web UI**:

- **Sync Status Page** (`/sync-status`): Real-time dashboard
  - Shows connected clients with source detection
  - Start/Stop sync service buttons
  - Auto-refresh every 5 seconds
  - Client health indicators (Active/Idle)

**Demo Script**:

```bash
./scripts/demo-cli-integration.sh  # Interactive demo of CLI integration
```

**How It Works**:

1. Web UI or CLI makes changes to workflow state
2. File watcher detects the change
3. WebSocket server broadcasts update to all connected clients
4. All clients (Web UI + CLI tools) receive real-time updates

**Use Cases**:

- Work in Claude CLI while monitoring progress in Web UI
- Make changes in Web UI, see them instantly in CLI
- Multiple developers working on same project simultaneously
- Real-time collaboration between different interfaces

### Module System

Modules are located in `madace/` directory:

- **core**: Framework orchestration (MADACE Master agent) - TODO
- **mam**: MADACE Agile Method - PM, Analyst, Architect, SM, DEV agents ✅
- **mab**: MADACE Builder - Agent/workflow/module creation - TODO
- **cis**: Creative Intelligence Suite - Creativity workflows - TODO

### Directory Structure

```
/Users/nimda/MADACE-Method-v2.0/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page ✅
│   ├── layout.tsx         # Root layout ✅
│   ├── api/               # API routes
│   │   ├── agents/        # Agent operations ✅
│   │   │   ├── route.ts   # GET /api/agents (list all)
│   │   │   └── [name]/route.ts  # GET /api/agents/:name
│   │   ├── llm/           # LLM operations ✅
│   │   │   └── test/route.ts    # POST /api/llm/test
│   │   ├── workflows/     # Workflow execution (TODO)
│   │   ├── state/         # State machine (TODO)
│   │   └── config/        # Configuration API (TODO)
│   ├── setup/             # Setup wizard ✅
│   │   └── page.tsx       # 4-step wizard UI
│   ├── settings/          # Settings page (placeholder)
│   │   └── page.tsx
│   ├── agents/            # Agents page (placeholder)
│   │   └── page.tsx
│   └── workflows/         # Workflows page (placeholder)
│       └── page.tsx
│
├── lib/                   # Business logic (TypeScript)
│   ├── agents/            # Agent system ✅
│   │   ├── loader.ts      # AgentLoader class (YAML + Zod validation)
│   │   ├── schema.ts      # Zod schemas for agent validation
│   │   └── index.ts       # Public exports
│   ├── llm/               # LLM client ✅
│   │   ├── client.ts      # LLMClient (factory pattern)
│   │   ├── types.ts       # LLM interfaces
│   │   ├── config.ts      # Environment config loader
│   │   ├── providers/     # Provider implementations
│   │   │   ├── base.ts    # BaseLLMProvider abstract class
│   │   │   ├── gemini.ts  # Google Gemini (stub)
│   │   │   ├── claude.ts  # Anthropic Claude (stub)
│   │   │   ├── openai.ts  # OpenAI GPT (stub)
│   │   │   └── local.ts   # Local/Ollama (stub)
│   │   └── index.ts       # Public exports
│   ├── types/             # TypeScript types ✅
│   │   ├── agent.ts       # Agent interfaces
│   │   ├── setup.ts       # Setup wizard types
│   │   └── index.ts       # Aggregated exports
│   ├── constants/         # Constants ✅
│   │   └── tech-stack.ts  # Tech stack definitions
│   ├── templates/         # Template engine (placeholders)
│   │   ├── llm-system-prompt.ts
│   │   └── index.ts
│   ├── utils/             # Utility functions ✅
│   │   └── index.ts       # Date, string, JSON, array utilities
│   ├── workflows/         # Workflow engine (TODO)
│   │   └── index.ts
│   ├── state/             # State machine (TODO)
│   │   └── index.ts
│   ├── config/            # Configuration (TODO)
│   │   └── index.ts
│   └── cli/               # CLI integration (TODO)
│       └── index.ts
│
├── components/            # React components
│   ├── features/          # Feature components ✅
│   │   ├── Navigation.tsx # Responsive nav with mobile menu
│   │   ├── Footer.tsx     # Footer with links
│   │   └── setup/         # Setup wizard components
│   │       ├── StepIndicator.tsx   # Progress tracker
│   │       ├── ProjectInfoStep.tsx # Project config
│   │       ├── LLMConfigStep.tsx   # LLM selection
│   │       ├── ModuleConfigStep.tsx # Module toggles
│   │       └── SummaryStep.tsx     # Review config
│   └── ui/                # UI primitives (empty, for Shadcn/ui)
│       └── index.ts
│
├── public/               # Static assets
│   └── agents/          # Agent YAML files
│
├── scripts/              # Utility scripts
│   ├── select-llm.sh    # Interactive LLM selection
│   └── test-llm.sh      # LLM connection test
│
├── docs/                 # Project documentation
│   ├── adrs/            # Architecture Decision Records
│   ├── LLM-SELECTION.md # LLM selection guide
│   └── mam-workflow-status.md   # State machine source of truth
│
├── madace/              # MADACE agents/workflows (built-in) ✅
│   └── mam/
│       └── agents/      # 5 MAM agents (PM, Analyst, Architect, SM, DEV)
│           ├── pm.agent.yaml
│           ├── analyst.agent.yaml
│           ├── architect.agent.yaml
│           ├── sm.agent.yaml
│           └── dev.agent.yaml
│
├── madace-data/         # User data (Docker volume mount)
│   ├── config/
│   │   ├── config.yaml  # Generated by web UI
│   │   └── .env         # API keys (from web UI)
│   ├── agents/custom/   # User-created agents
│   ├── workflows/custom/ # User-created workflows
│   ├── docs/            # Generated PRD, stories, status
│   └── output/          # Generated artifacts
│
├── .env                 # Environment variables (git-ignored)
├── .env.example         # Environment template ✅
├── .gitignore           # Git exclusions ✅
├── .dockerignore        # Docker build exclusions ✅
├── Dockerfile           # Multi-stage Docker build ✅
├── docker-compose.yml   # Production deployment (HTTP) ✅
├── docker-compose.dev.yml # Development with VSCode ✅
├── docker-compose.https.yml # Production deployment (HTTPS) ✅
├── Caddyfile            # Caddy reverse proxy config ✅
├── package.json         # Dependencies and scripts ✅
├── tsconfig.json        # TypeScript config (strict mode) ✅
├── next.config.ts       # Next.js 15 config ✅
├── eslint.config.mjs    # ESLint config ✅
├── prettier.config.js   # Prettier config ✅
└── tailwind.config.ts   # Tailwind CSS 4 config ✅
```

**Legend**: ✅ = Implemented | (TODO) = Not yet implemented | (placeholder) = Basic implementation, needs work

## Design Patterns

**Core Patterns**:

- **Functional Programming**: Pure functions, immutable data
- **Type Safety**: Zod schemas for runtime validation + TypeScript strict mode
- **Singleton Pattern**: Default agent loader instance with caching
- **Factory Pattern**: LLM client creation (`createLLMClient()`, `createProvider()`)
- **Strategy Pattern**: LLM providers implementing `ILLMProvider` interface
- **Component Composition**: Small, reusable React components

**Next.js Patterns**:

- **API Routes**: RESTful endpoints in `app/api/` (App Router)
- **Server Components**: Default for all pages (use `'use client'` when needed)
- **Client Components**: Interactive UI (marked with `'use client'` directive)
  - Example: `app/setup/page.tsx` for wizard with React state
- **Route Handlers**: `route.ts` files for API endpoints
  - Example: `app/api/agents/route.ts` exports `GET` function

**Error Handling**:

- **Custom Errors**: `AgentLoadError` with file path and cause
- **Try-Catch**: All file I/O and YAML parsing wrapped in try-catch
- **Validation**: Zod parsing throws descriptive errors
- **API Errors**: Return proper HTTP status codes (404, 500, etc.)

**File Structure**:

- **Barrel Exports**: `index.ts` files re-export public APIs
- **Type Inference**: `z.infer<typeof Schema>` for Zod schemas
- **Path Aliases**: `@/` prefix for imports (maps to project root)
  - Example: `import { Agent } from '@/lib/types/agent'`

## Key Configuration

### Environment Variables (.env)

```bash
# Planning/Architecture LLM
PLANNING_LLM=gemini                    # Options: gemini, claude, openai, local
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.0-flash-exp

# Implementation uses local Docker agent (automatic)
IMPLEMENTATION_AGENT=docker
```

### MADACE Configuration (madace/core/config.yaml)

```yaml
project_name: string # Required
output_folder: string # Required (e.g., "docs")
user_name: string # Required
communication_language: string # Required
modules:
  mam: { enabled: boolean }
  mab: { enabled: boolean }
  cis: { enabled: boolean }
```

## Common Implementation Patterns

Based on the current codebase, here are examples for implementing common tasks:

### Loading Agents

```typescript
// Single agent
import { loadAgent } from '@/lib/agents/loader';
const agent = await loadAgent('/path/to/agent.yaml');

// All MAM agents
import { loadMAMAgents } from '@/lib/agents/loader';
const agents = await loadMAMAgents();
```

### Creating LLM Clients

```typescript
// From environment variables
import { createLLMClient } from '@/lib/llm/client';
import { getLLMConfigFromEnv } from '@/lib/llm/config';

const config = getLLMConfigFromEnv();
const client = createLLMClient(config);

// Manual configuration
const client = createLLMClient({
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-2.0-flash-exp',
});

// Using the client
const response = await client.chat({
  messages: [{ role: 'user', content: 'Hello!' }],
});

// Streaming
for await (const chunk of client.chatStream(request)) {
  console.log(chunk.content);
}
```

### Creating API Routes

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process body
  return NextResponse.json({ success: true });
}
```

### Zod Validation

```typescript
// Define schema
import { z } from 'zod';

const ConfigSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

// Validate data
const validated = ConfigSchema.parse(untrustedData);

// Type inference
type Config = z.infer<typeof ConfigSchema>;

// Safe parsing (no throw)
const result = ConfigSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Component Structure

```typescript
// Client component with state
'use client';

import { useState } from 'react';
import type { MyType } from '@/lib/types';

export default function MyComponent() {
  const [state, setState] = useState<MyType>({});

  return <div>...</div>;
}

// Server component (default)
import { loadData } from '@/lib/data';

export default async function MyPage() {
  const data = await loadData();
  return <div>{data.title}</div>;
}
```

## Critical Development Rules

### HTTP/HTTPS Security

**ALWAYS use HTTPS for HTTP connections:**

- All external HTTP requests MUST use HTTPS (never plain HTTP)
- LLM provider APIs: Use HTTPS endpoints only
  - Gemini: `https://generativelanguage.googleapis.com`
  - OpenAI: `https://api.openai.com`
  - Claude: `https://api.anthropic.com`
- WebFetch and external API calls: Upgrade HTTP to HTTPS automatically
- Local development (localhost) is exempt from this rule
- Docker internal communication is exempt from this rule
- Production deployments MUST use HTTPS with valid TLS certificates

### Docker Operations

**ALWAYS use Docker Compose for all Docker operations:**

- Use `docker-compose up -d` instead of `docker run`
- Use `docker-compose down` instead of `docker stop` or `docker rm`
- Use `docker-compose logs -f` instead of `docker logs`
- Use `docker-compose up -d --build` to rebuild images
- Configuration lives in `docker-compose.yml` (prod) and `docker-compose.dev.yml` (dev)
- Named volumes are managed automatically by Compose
- Never use standalone `docker` commands for this project

### State Machine Operations

- NEVER manually edit `docs/mam-workflow-status.md`
- ALWAYS read story state from the status file (single source of truth)
- Use state transition methods: `transitionBacklogToTodo()`, `transitionTodoToInProgress()`, `transitionInProgressToDone()`
- Enforce one-at-a-time rule for TODO and IN PROGRESS
- Web UI displays as visual Kanban board

### TypeScript & Type Safety

- Use Zod schemas for all YAML parsing and validation
- Define types with `z.infer<typeof Schema>`
- Never use `any` type without explicit reason
- Enable strict TypeScript mode
- Validate at runtime (YAML is untrusted input)

### YAML Definitions

- Agent files: `*.agent.yaml` with metadata, persona, menu, prompts
- Workflow files: `workflow.yaml` with name, description, steps
- Use `action` field for workflow steps
- All configs are natural language (no executable code)
- Validate with Zod before processing

### Template Rendering

- Primary: Handlebars `{{variable_name}}`
- Legacy support: `{variable-name}`, `${variable}`, `%VAR%`
- Validate required variables before rendering
- Use strict mode to catch missing variables
- Standard variables from config

### Path Handling

- Always use `path.resolve()` for absolute paths
- Cross-platform compatibility (macOS/Linux/Windows)
- Sandbox operations to project directory
- Validate paths are within project boundaries

### LLM Integration

- Use multi-provider client abstraction
- Planning phase: User-selected LLM (configured via web UI)
- Implementation phase: Local Docker agent
- Configuration via web UI (Settings → LLM)
- No manual `.env` editing required (web UI manages it)
- Handle API errors gracefully
- Support streaming responses

## Testing Conventions

**Status**: Jest configured with ts-jest, tests in progress

### Test Framework Setup

- **Test Runner**: Jest 30.2.0 with ts-jest preset
- **Environment**: Node.js (for API routes and business logic)
- **Config**: `jest.config.mjs` with Next.js integration
- **Setup**: `jest.setup.js` provides global mocks (Request, Response, fetch, TextEncoder)

### Running Tests

```bash
npm test                   # Run all tests with Jest
npm run check-all          # Type-check + lint + format (no tests)
npm run build              # Verify production build
npm run dev                # Manual testing in browser
```

### Test File Patterns

**Location and Naming**:

- Unit/Integration tests: `__tests__/**/*.test.ts` (mirrors `lib/` structure)
- API route tests: Colocated as `app/api/**/*.spec.ts` OR in `__tests__/app/api/**/*.test.ts`

**Current Test Coverage**:

- ✅ `__tests__/lib/agents/loader.test.ts` - Agent loading and caching
- ✅ `__tests__/lib/llm/client.test.ts` - LLM client (stub)
- ✅ `__tests__/app/api/agents/route.test.ts` - Agent API endpoints
- ✅ `app/api/llm/test/route.spec.ts` - LLM test endpoint
- ⬜ `__tests__/lib/state/machine.test.ts` - State machine (TODO)

### Testing Patterns

**API Route Testing** (Next.js App Router):

```typescript
// app/api/example/route.spec.ts
import { GET, POST } from './route';
import { NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: { json: jest.fn() },
}));

describe('GET /api/example', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { url: 'http://localhost:3000/api/example' };
  });

  it('should return data', async () => {
    const response = await GET(mockRequest as Request);
    expect(response.status).toBe(200);
  });
});
```

**Business Logic Testing** (lib/ modules):

```typescript
// __tests__/lib/agents/loader.test.ts
import { loadAgent, AgentLoadError } from '@/lib/agents/loader';
import fs from 'fs/promises';

jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('AgentLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load valid agent YAML', async () => {
    mockFs.readFile.mockResolvedValue('agent:\n  metadata:\n    ...');
    const agent = await loadAgent('/path/to/agent.yaml');
    expect(agent.metadata.name).toBe('PM');
  });

  it('should cache loaded agents', async () => {
    mockFs.readFile.mockResolvedValue(validYAML);
    const agent1 = await loadAgent('/path');
    const agent2 = await loadAgent('/path');
    expect(agent1).toBe(agent2); // Same reference
    expect(mockFs.readFile).toHaveBeenCalledTimes(1);
  });
});
```

**Mocking Patterns**:

- Mock Next.js APIs: `jest.mock('next/server')`
- Mock fs operations: `jest.mock('fs/promises')`
- Mock lib modules: `jest.mock('@/lib/agents')`
- Path aliases work in tests: `@/` maps to project root

**Test Guidelines**:

- Use `beforeEach` to clear mocks
- Test error cases (file not found, invalid YAML, API errors)
- Verify caching behavior where applicable
- Mock external dependencies (fs, LLM APIs, Next.js)
- Use TypeScript with proper typing for mocks

## Security Considerations

- No executable code in YAML (by design)
- Path traversal protection via validation
- Template injection prevention (Handlebars auto-escapes)
- API CORS configuration
- `.env` files git-ignored (secrets never committed)
- Zod validation on all untrusted input

## LLM Selection

This project uses different LLMs for different phases:

**Phase 1: Planning & Architecture** (User-Selected)

- Google Gemini (Recommended - Free tier)
- Anthropic Claude (Best reasoning)
- OpenAI GPT (Popular)
- Local Models (Privacy)

Run `./scripts/select-llm.sh` for interactive setup.

**Phase 2: Implementation** (Automatic)

- Local Docker agent
- No user configuration needed

See [`docs/LLM-SELECTION.md`](./docs/LLM-SELECTION.md) for detailed guide.

## Additional Documentation

### Current Project (v2.0)

- **[README.md](./README.md)** - Project overview and quick start
- **[PRD.md](./PRD.md)** - Product requirements document (v2.0 - AUTHORITATIVE)
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development container guide (VSCode + Cursor)
- **[HTTPS-DEPLOYMENT.md](./docs/HTTPS-DEPLOYMENT.md)** - ✅ **HTTPS deployment guide (Caddy + Let's Encrypt)**
- **[FEASIBILITY-REPORT.md](./FEASIBILITY-REPORT.md)** - ✅ **Feasibility validation (ALL PASSED)**
- **[PLAN.md](./PLAN.md)** - Development roadmap (4-week timeline)
- **[USING-MADACE.md](./USING-MADACE.md)** - Using MADACE to build MADACE
- **[LLM-SELECTION.md](./docs/LLM-SELECTION.md)** - LLM selection guide

### Future Vision (v3.0)

- **[ROADMAP-V3-FUTURE-VISION.md](./ROADMAP-V3-FUTURE-VISION.md)** - v3.0 product vision (2026+)
- **[ARCHITECTURE-V3-FUTURE.md](./ARCHITECTURE-V3-FUTURE.md)** - v3.0 architecture proposals (2026+)

### Architecture Decision Records (ADRs)

- **[ADR-001](./docs/adrs/ADR-001-multi-tier-architecture.md)** - Multi-Tier Architecture (Superseded)
- **[ADR-002](./docs/adrs/ADR-002-ffi-strategy.md)** - FFI Strategy (Superseded)
- **[ADR-003](./docs/adrs/ADR-003-architecture-simplification.md)** - Architecture Simplification ✅

## Troubleshooting

### Common Issues

**TypeScript Errors After `npm install`:**

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

**Port Already in Use (3000):**

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

**Docker Container Won't Start:**

```bash
# Check logs
docker-compose logs -f

# Clean rebuild
docker-compose down
docker-compose up -d --build
```

**ESLint/Prettier Conflicts:**

```bash
# Format all files
npm run format

# Fix auto-fixable issues
npm run lint:fix
```

**State Machine Validation Errors:**

- Check `docs/mam-workflow-status.md` - only ONE story in TODO and ONE in IN_PROGRESS
- Ensure proper state format: `[STORY-ID] Title (filename.md) [Status: ...] [Points: N]`
- Never manually edit the status file - use state transition methods

**Agent YAML Not Loading:**

- Verify YAML syntax with a validator
- Check file path is correct relative to project root
- Ensure all required fields are present (metadata, persona, menu)
- Check Zod validation errors in console for specific issues

**LLM API Errors:**

- Verify API key is set in `.env` file
- Check API key has correct permissions
- For local models, ensure Ollama is running: `ollama serve`
- Test connection: http://localhost:3000/llm-test

### Performance Issues

**Slow Development Server:**

```bash
# Clear Next.js cache
rm -rf .next

# Reduce log verbosity
export NODE_ENV=production
npm run build && npm start
```

**High Memory Usage:**

- Check for memory leaks in WebSocket connections
- Restart development server periodically
- Use production build for testing: `npm run build && npm start`

## Getting Started

For new developers joining the project:

1. **Clone and Install**:

   ```bash
   git clone <repo-url>
   cd MADACE-Method-v2.0
   npm install
   ```

2. **Development Server**:

   ```bash
   npm run dev              # Start at http://localhost:3000
   npm run check-all        # Verify code quality
   ```

3. **Explore Current Implementation**:
   - Home page: http://localhost:3000
   - Setup wizard: http://localhost:3000/setup
   - Agents API: http://localhost:3000/api/agents
   - Agent loader: `lib/agents/loader.ts`
   - LLM client: `lib/llm/client.ts`

4. **Next Tasks** (Priority Order):
   - [ ] Configuration persistence (`app/api/config/route.ts`)
   - [ ] Settings page implementation (`app/settings/page.tsx`)
   - [ ] Workflow Engine (`lib/workflows/engine.ts`)
   - [ ] State Machine (`lib/state/machine.ts`)
   - [ ] Template Engine (`lib/templates/engine.ts`)

5. **Docker Deployment** (Optional):

   ```bash
   # Development (with VSCode Server)
   mkdir madace-data
   docker-compose -f docker-compose.dev.yml up -d
   # VSCode: http://localhost:8080 (password: madace123)
   # Next.js: http://localhost:3000

   # Production (HTTP - local/private network)
   mkdir madace-data
   docker-compose up -d
   # Access at http://localhost:3000

   # Production (HTTPS - external access with domain)
   mkdir -p madace-data logs/caddy
   export DOMAIN=madace.yourdomain.com
   docker-compose -f docker-compose.https.yml up -d
   # Access at https://madace.yourdomain.com
   # See docs/HTTPS-DEPLOYMENT.md for detailed setup
   ```

6. **Before Committing**:

   ```bash
   npm run check-all        # MUST pass before commit
   npm run build            # Verify production build works
   ```

---

**Note**: This project is under active development as an experimental Next.js full-stack implementation.

For the production-ready MADACE framework, use the official Node.js implementation: https://github.com/tekcin/MADACE-METHOD

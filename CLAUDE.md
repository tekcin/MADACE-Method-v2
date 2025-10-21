# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **MADACE** = **M**ethodology for **A**I-**D**riven **A**gile **C**ollaboration **E**ngine

> **IMPORTANT**: This is an **experimental implementation** exploring MADACE-METHOD concepts using Next.js 14 full-stack TypeScript.
>
> The **official MADACE-METHOD** is Node.js CLI-based. See: https://github.com/tekcin/MADACE-METHOD

## Project Overview

This repository (MADACE-Method v2.0) is a **proof-of-concept** implementation with a simplified Next.js full-stack architecture:

- **Frontend**: Next.js 14 with React 18 and App Router
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
```

### Docker Deployment

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

# Build and run production container
docker-compose up -d

# Or build manually
docker build -t madace-web:latest .
docker run -d \
  --name madace \
  -p 3000:3000 \
  -v $(pwd)/madace-data:/app/data \
  madace-web:latest

# Access: http://localhost:3000
# Complete setup wizard (saves to madace-data/config/)
```

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

**TODO** (Not yet implemented):

- `POST /api/config` - Save configuration (setup wizard)
- `GET /api/config` - Load configuration
- `GET /api/workflows` - List workflows
- `POST /api/workflows/[name]/execute` - Execute workflow
- `GET /api/state` - Get current state machine state
- `POST /api/state/transition` - Transition story state

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
├── docker-compose.yml   # Production deployment ✅
├── docker-compose.dev.yml # Development with VSCode ✅
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

**Status**: Testing framework not yet configured

- **Unit Tests**: Jest for TypeScript modules (TODO)
- **Component Tests**: React Testing Library for UI (TODO)
- **Integration Tests**: Next.js API route testing (TODO)
- **E2E Tests**: Playwright (future)

Current workflow uses manual testing:

```bash
npm run check-all          # Type-check + lint + format
npm run build              # Verify production build
npm run dev                # Manual testing in browser
```

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

- **[README.md](./README.md)** - Project overview and quick start
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Comprehensive technical reference (2500+ lines)
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development container guide (VSCode + Cursor)
- **[FEASIBILITY-REPORT.md](./FEASIBILITY-REPORT.md)** - ✅ **Feasibility validation (ALL PASSED)**
- **[PRD.md](./PRD.md)** - Product requirements document
- **[PLAN.md](./PLAN.md)** - Development roadmap (4-week timeline)
- **[USING-MADACE.md](./USING-MADACE.md)** - Using MADACE to build MADACE
- **[LLM-SELECTION.md](./docs/LLM-SELECTION.md)** - LLM selection guide

### Architecture Decision Records (ADRs)

- **[ADR-001](./docs/adrs/ADR-001-multi-tier-architecture.md)** - Multi-Tier Architecture (Superseded)
- **[ADR-002](./docs/adrs/ADR-002-ffi-strategy.md)** - FFI Strategy (Superseded)
- **[ADR-003](./docs/adrs/ADR-003-architecture-simplification.md)** - Architecture Simplification ✅

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

   # Production (optimized)
   mkdir madace-data
   docker-compose up -d
   # Access at http://localhost:3000
   ```

6. **Before Committing**:

   ```bash
   npm run check-all        # MUST pass before commit
   npm run build            # Verify production build works
   ```

---

**Note**: This project is under active development as an experimental Next.js full-stack implementation.

For the production-ready MADACE framework, use the official Node.js implementation: https://github.com/tekcin/MADACE-METHOD

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Architecture Evolution

**Previous Design (Rejected)**: Rust (core) + Python (backend) + Next.js (frontend)

- Issues: FFI complexity, 3 runtimes, over-engineering

**Current Design (Approved)**: Next.js 14 Full-Stack TypeScript

- Benefits: Single runtime, single language, proven stack, 4-week timeline

See [ADR-003](./docs/adrs/ADR-003-architecture-simplification.md) for full rationale.

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

**Current Phase**: ✅ Ready for Implementation - Feasibility Confirmed

**Completed**:

- ✅ Architecture review and simplification decision
- ✅ LLM selection system created
- ✅ Documentation updated for new architecture
- ✅ ADRs created (ADR-001, ADR-002, ADR-003)
- ✅ **Feasibility tests completed (ALL PASSED)**
- ✅ Core dependencies installed (zod, js-yaml, handlebars)
- ✅ Environment validated (Node.js v24.10.0)
- ✅ CLI tools confirmed (Claude CLI v2.0.14, Gemini CLI v0.9.0)

**Implementation Ready**:

- ⏭️ Initialize Next.js 14 project
- ⬜ Implement Setup Wizard (Priority #1)
- ⬜ Implement Settings Page (Priority #2)
- ⬜ Implement TypeScript business logic
- ⬜ Build React UI components
- ⬜ Implement CLI integration
- ✅ Docker deployment configured (production + development)
- ✅ Development container with VSCode Server + Cursor ready

**Feasibility Validation**: See [FEASIBILITY-REPORT.md](./FEASIBILITY-REPORT.md)

**Timeline**: 4 weeks to Alpha MVP (confirmed via feasibility tests)

## Development Commands

### LLM Selection (First Step)

```bash
# Interactive LLM selection for planning/architecture
./scripts/select-llm.sh

# Test LLM connection
./scripts/test-llm.sh
```

### Next.js Development (Once Project Created)

```bash
npm install                # Install dependencies
npm run dev                # Development server (http://localhost:3000)
npm run build              # Production build
npm start                  # Production server
npm run lint               # Lint code
npm test                   # Run tests (Jest + RTL)
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

**Agent System** (`lib/agents/loader.ts`, `lib/agents/runtime.ts`):

- Loads and validates agent YAML definitions (Zod schemas)
- Executes critical actions on agent load
- Manages agent personas, menus, and prompts
- Handles execution context and menu commands
- **Type-safe** with runtime validation

**Workflow Engine** (`lib/workflows/engine.ts`):

- Parses and executes workflow YAML files
- Sequential step execution with state persistence
- Supports action types: elicit, reflect, guide, template, validate, sub-workflow
- State files: `.{workflow-name}.state.json`

**Template Engine** (`lib/templates/engine.ts`):

- Handlebars template rendering
- Support for legacy patterns: `{var}`, `${var}`, `%VAR%`
- Standard MADACE variables
- Template validation

**State Machine** (`lib/state/machine.ts`):

- Manages story lifecycle: BACKLOG → TODO → IN PROGRESS → DONE
- **Critical Rules**:
  - Only ONE story in TODO at a time
  - Only ONE story in IN PROGRESS at a time
  - Single source of truth: `docs/mam-workflow-status.md`
  - Atomic state transitions (no skipping states)
- **Visual Kanban Board** in Web UI

**LLM Client** (`lib/llm/client.ts`):

- Multi-provider abstraction (Gemini, Claude, OpenAI, Local)
- Unified interface across providers
- Configuration via `.env` file
- Planning phase: User-selected LLM
- Implementation phase: Local Docker agent

**Configuration Manager** (`lib/config/manager.ts`):

- Auto-detects config location: `./madace/core/config.yaml`
- Cross-platform path resolution
- Validates installation integrity
- Zod schema validation

### Module System

Modules are located in `madace/` directory:

- **core**: Framework orchestration (MADACE Master agent)
- **mam**: MADACE Agile Method - PM, Analyst, Architect, SM, DEV agents
- **mab**: MADACE Builder - Agent/workflow/module creation
- **cis**: Creative Intelligence Suite - Creativity workflows

### Directory Structure (Future)

```
/Users/nimda/MADACE-Method v2.0/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── api/               # API routes
│   │   ├── agents/        # Agent operations
│   │   ├── workflows/     # Workflow execution
│   │   ├── state/         # State machine
│   │   └── health/        # Health check endpoint
│   ├── setup/             # Setup wizard
│   ├── settings/          # Settings page
│   ├── dashboard/         # Dashboard UI
│   └── layout.tsx         # Root layout
│
├── lib/                   # Business logic (TypeScript)
│   ├── agents/
│   │   ├── loader.ts      # Agent YAML loading
│   │   ├── runtime.ts     # Agent execution
│   │   └── types.ts       # Agent TypeScript types
│   ├── workflows/
│   │   ├── engine.ts      # Workflow execution
│   │   ├── parser.ts      # YAML parsing
│   │   └── types.ts       # Workflow types
│   ├── state/
│   │   ├── machine.ts     # State machine logic
│   │   ├── parser.ts      # Status file parsing
│   │   └── types.ts       # State types
│   ├── templates/
│   │   ├── engine.ts      # Template rendering
│   │   └── types.ts       # Template types
│   ├── llm/
│   │   ├── client.ts      # Multi-provider LLM client
│   │   ├── gemini.ts      # Gemini integration
│   │   ├── claude.ts      # Claude integration
│   │   ├── openai.ts      # OpenAI integration
│   │   ├── local.ts       # Local model integration
│   │   └── types.ts       # LLM types
│   ├── config/
│   │   ├── loader.ts      # Config path resolution
│   │   └── storage.ts     # Save/load configuration
│   └── cli/
│       ├── adapter.ts     # Unified CLI adapter
│       ├── claude.ts      # Claude CLI integration
│       └── gemini.ts      # Gemini CLI integration
│
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── agent-card.tsx    # Agent display
│   ├── state-board.tsx   # Kanban board (BACKLOG → DONE)
│   └── workflow-progress.tsx
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
├── madace/              # MADACE agents/workflows (built-in)
│   ├── core/
│   │   └── config.yaml
│   ├── mam/
│   │   ├── agents/
│   │   └── workflows/
│   ├── mab/
│   └── cis/
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
├── .env.example         # Environment template
├── .gitignore
├── .dockerignore        # Docker build exclusions
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Docker Compose config
├── package.json
├── tsconfig.json
└── next.config.js
```

## Design Patterns

- **Functional Programming**: Pure functions, immutable data
- **Type Safety**: Zod schemas for runtime validation
- **API Routes**: RESTful Next.js endpoints
- **Server Actions**: Direct server-side execution
- **Component Composition**: Small, reusable React components

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

- **Unit Tests**: Jest for TypeScript modules
- **Component Tests**: React Testing Library for UI
- **Integration Tests**: Next.js API route testing
- **E2E Tests**: Playwright (future)

```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage
npm test -- --watch         # Watch mode
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

1. **Create Next.js Project**:

   ```bash
   npx create-next-app@latest . --typescript --tailwind --app
   npm install zod js-yaml handlebars
   ```

2. **Implement Web-Based Setup Wizard** (Priority #1):
   - Create `app/setup/page.tsx` - Setup wizard UI
   - Create `app/api/config/route.ts` - Save configuration endpoint
   - Steps: Project Info → LLM Selection → Module Selection
   - Auto-generate `.env` and `config.yaml`

3. **Implement Settings Page** (Priority #2):
   - Create `app/settings/page.tsx` - Settings UI
   - Tabs: Project, LLM, Modules, Advanced
   - Test LLM connection button
   - Real-time configuration validation

4. **Implement TypeScript Business Logic**:
   - Start with `lib/agents/loader.ts`
   - Add `lib/config/storage.ts` (manages YAML + .env)
   - Use Zod for validation
   - Follow functional programming patterns

5. **Build React UI**:
   - Use Shadcn/ui components
   - Implement Kanban board for state machine
   - Connect to API routes

6. **Implement CLI Integration**:
   - Create `lib/cli/claude.ts` - Claude CLI adapter
   - Create `lib/cli/gemini.ts` - Gemini CLI adapter
   - Create `lib/sync/cli-sync.ts` - WebSocket sync
   - Support both web UI and CLI simultaneously

7. **Test & Deploy**:

   ```bash
   npm test                # Run tests
   npm run build           # Production build

   # Development deployment (with IDEs)
   mkdir madace-data
   docker-compose -f docker-compose.dev.yml up -d
   # VSCode: http://localhost:8080
   # Next.js: http://localhost:3000

   # Production deployment (optimized)
   mkdir madace-data
   docker-compose up -d
   # Access at http://localhost:3000
   # Complete setup wizard
   ```

---

**Note**: This project is under active development. The Rust+Python multi-tier architecture has been **rejected** in favor of a simpler Next.js full-stack approach. All documentation has been updated to reflect the new architecture.

For the production-ready MADACE framework, use the official Node.js implementation: https://github.com/tekcin/MADACE-METHOD

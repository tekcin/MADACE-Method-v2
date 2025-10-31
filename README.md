# MADACE-Method v3.0

**MADACE** = **M**ethodology for **A**I-**D**riven **A**gile **C**ollaboration **E**ngine

**Version**: 3.0.0-alpha | **Status**: 🚀 **Production-Ready Implementation with Database Support**

**MADACE-Method v1.0** (Official): https://github.com/tekcin/MADACE-METHOD

---

## 🎯 What is MADACE-Method v3.0?

MADACE-Method v3.0 is the **production-ready** implementation of the MADACE (Methodology for AI-Driven Agile Collaboration Engine) framework with full database support, enhanced AI capabilities, and enterprise-grade features.

### Version Comparison

- **v1.0 (Official)**: Node.js/JavaScript CLI-based framework
- **v2.0 (Archived)**: Experimental Next.js implementation (file-based)
- **v3.0 (This Project)**: Production-ready with Prisma ORM + PostgreSQL

### What's New in v3.0

✅ **Database-Backed**: Prisma ORM + PostgreSQL for robust data management
✅ **Dual Interface**: Web UI + CLI (both work simultaneously with same state)
✅ **Web-First Architecture**: Full browser-based UI in addition to CLI
✅ **Type-Safe**: TypeScript throughout with strict mode + Zod validation
✅ **Modern Stack**: Next.js 15, React 19, Tailwind CSS 4, Prisma 6
✅ **Single Runtime**: Pure Node.js/TypeScript (no multi-language complexity)
✅ **Visual State Machine**: Kanban-style workflow visualization (Web) + text status (CLI)
✅ **Multi-LLM Support**: Choose between Gemini, Claude, OpenAI, or local models
✅ **Real-Time Updates**: Live workflow status and progress tracking
✅ **CLI Integration**: Full Claude CLI and Gemini CLI support maintained
✅ **Docker-Ready**: Production and development containers included
✅ **Migration Tools**: Automated migration from V2.0 file-based architecture

### Architecture

**Next.js 15 Full-Stack TypeScript**

- ✅ Single runtime (Node.js only)
- ✅ Single language (TypeScript everywhere)
- ✅ Proven stack (battle-tested)
- ✅ Fast development
- ✅ Web UI innovation (vs CLI)

---

## Architecture

### Official MADACE (Node.js CLI)

```
User → IDE/CLI → Node.js Engine → AI Agents → Workflows
```

### This Project (Next.js Web UI)

```
┌─────────────────────────────────────┐
│    Next.js 15.5.6 (App Router)      │
│  ┌────────────┐  ┌──────────────┐   │
│  │  Frontend  │  │  API Routes  │   │
│  │ (React 19) │  │  (Node.js)   │   │
│  └────────────┘  └──────────────┘   │
│         │               │            │
│         └───────┬───────┘            │
│                 ▼                    │
│    ┌────────────────────────┐       │
│    │   Business Logic (TS)  │       │
│    │   - Agent System       │       │
│    │   - Workflow Engine    │       │
│    │   - State Machine      │       │
│    │   - Template Engine    │       │
│    └────────────────────────┘       │
│                                      │
│  Single Runtime: Node.js 20+        │
│  Single Language: TypeScript        │
└──────────────────────────────────────┘
```

**Technology Stack:**

**Tech Stack**: Next.js 15.5.6 • React 19.2.0 • TypeScript 5.9.3 • Node.js 20+ • Tailwind CSS 4.1.15 • Zod 4.1.12

- **Frontend**: Next.js 15 + React 19 + TypeScript 5
- **Backend**: Next.js API Routes + Server Actions
- **Business Logic**: TypeScript modules
- **LLM (Planning)**: User-selectable (Gemini/Claude/OpenAI/Local)
- **Styling**: Tailwind CSS 4
- **Validation**: Zod + TypeScript strict mode
- **Deployment**: Docker or Vercel

_See [TECH-STACK.md](./docs/TECH-STACK.md) for detailed version information._

---

## MADACE-METHOD Core Concepts

This implementation maintains the core MADACE philosophy:

### C.O.R.E. System

- **Collaboration**: Human-AI partnership where both contribute unique strengths
- **Optimized**: Collaborative process refined for maximum effectiveness
- **Reflection**: Guided thinking that helps discover better solutions
- **Engine**: Framework that orchestrates specialized agents and workflows

### Key Features

1. **Human Amplification, Not Replacement** - AI agents guide thinking, don't do it for you
2. **Scale-Adaptive Planning** - Projects route through workflows based on complexity (Level 0-4)
3. **Just-In-Time Design** - Tech specs created per epic during implementation
4. **Story State Machine** - BACKLOG → TODO → IN PROGRESS → DONE
5. **Dynamic Expertise Injection** - Contextual guidance per story
6. **Web-Based UI** - Browser-accessible interface (vs CLI)
7. **Visual State Machine** - Kanban-style board for story lifecycle

---

## Installation & Setup

### Prerequisites

**For Production Deployment (Docker):**

- Docker 20.10+ and Docker Compose
- 2GB RAM minimum
- 1GB disk space (optimized production image)
- Named volume on host system (for persistent data)

**For Development (Docker with IDEs):**

- Docker 20.10+ and Docker Compose
- 4GB RAM minimum (for VSCode + Cursor + Next.js)
- 5GB disk space (includes IDE tools)
- Browser for VSCode Server access

**For Local Development (No Docker):**

- Node.js 20+ (for Next.js)
- npm 9+ or pnpm
- 4GB RAM minimum
- VSCode or Cursor installed locally

### Quick Start

#### Option 1: Development Container (Recommended for Development)

**Includes VSCode Server + Cursor + all dependencies pre-installed**

```bash
# 1. Clone repository
git clone https://github.com/tekcin/MADACE-Method-v2.git
cd MADACE-Method-v2

# 2. Create data folder
mkdir madace-data

# 3. Start development container
docker-compose -f docker-compose.dev.yml up -d

# 4. Access development environment
# VSCode Server: http://localhost:8080 (password: madace123)
# Next.js:       http://localhost:3000
# Cursor:        http://localhost:8081
```

**What's included:**

- ✅ VSCode Server (browser-based IDE)
- ✅ Cursor IDE (AI-powered coding)
- ✅ All npm dependencies installed
- ✅ ESLint, Prettier, TypeScript pre-configured
- ✅ Hot reload enabled
- ✅ Git, Claude CLI, and development tools
- ✅ No local setup required!

#### Option 2: Local Development

```bash
# 1. Clone and install
git clone https://github.com/tekcin/MADACE-Method-v2.git
cd MADACE-Method-v2
npm install

# 2. Start development server
npm run dev
# Access at http://localhost:3000
```

**3. Web-Based Configuration (Recommended):**

```
1. Open http://localhost:3000 in your browser
2. Complete the setup wizard:
   - Enter project information
   - Select your LLM (Gemini/Claude/OpenAI/Local)
   - Enter API key and test connection
   - Choose modules to enable
3. Click "Save Configuration & Get Started"
4. Start using MADACE!
```

**All configuration is done via the web UI** - no manual file editing required!

**Alternative: CLI Configuration (Optional)**

```bash
# For advanced users who prefer CLI
./scripts/select-llm.sh

# Or manually configure .env
cp .env.example .env
# Edit .env with your API keys
```

See [`docs/LLM-SELECTION.md`](./docs/LLM-SELECTION.md) for detailed LLM selection guide.

### Deployment Options

#### Development Container (With IDEs)

**Perfect for:** Active development, learning MADACE, contributing code

```bash
# Start development environment with VSCode + Cursor
mkdir madace-data
docker-compose -f docker-compose.dev.yml up -d

# Access:
# - VSCode Server: http://localhost:8080 (password: madace123)
# - Next.js Dev: http://localhost:3000
# - Cursor: http://localhost:8081
```

**Features:**

- Browser-based VSCode with extensions
- Cursor IDE for AI-powered coding
- Hot reload for live code changes
- All development tools pre-installed
- Source code live-mounted from host

**Stop/restart:**

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

#### Production Deployment (Optimized Image)

**Perfect for:** Running MADACE in production, demos, staging

```bash
# Step 1: Create data folder
mkdir madace-data

# Step 2: Build and run production container
docker-compose up -d

# Or manually:
docker build -t madace-web:latest .
docker run -d \
  --name madace \
  -p 3000:3000 \
  -v $(pwd)/madace-data:/app/data \
  madace-web:latest

# Step 3: Access web UI
# Open http://localhost:3000
# Complete setup wizard (saves to madace-data/config/)
```

**Features:**

- Optimized image (~200 MB vs 2-3 GB for dev)
- Production-ready Next.js build
- No IDEs (runtime only)
- Secure (non-root user, minimal attack surface)

**What's in the data folder:**

- `config/` - Configuration and API keys (from web UI)
- `agents/custom/` - Your custom agents
- `workflows/custom/` - Your custom workflows
- `docs/` - Generated PRD, stories, status files
- `output/` - All generated artifacts

**Data persistence & backup:**

```bash
# Stop container (data preserved in madace-data/)
docker-compose down

# Restart (same configuration and data)
docker-compose up -d

# Backup
tar -czf madace-backup-$(date +%Y%m%d).tar.gz madace-data/

# Restore
tar -xzf madace-backup-20251020.tar.gz
docker-compose up -d
```

**Container comparison:**

| Feature        | Development (`docker-compose.dev.yml`) | Production (`docker-compose.yml`) |
| -------------- | -------------------------------------- | --------------------------------- |
| **Image Size** | ~2-3 GB                                | ~200 MB                           |
| **IDEs**       | VSCode + Cursor                        | None                              |
| **Use Case**   | Development                            | Production                        |
| **Ports**      | 3000, 8080, 8081                       | 3000                              |
| **Code**       | Live-mounted                           | Baked in                          |
| **Hot Reload** | ✅ Enabled                             | ❌ Not applicable                 |

See [ARCHITECTURE.md - Deployment](./ARCHITECTURE.md#deployment) for full documentation.

#### HTTPS Deployment (External Access)

**Perfect for:** Public access, production deployment, external network access

**For secure external access with HTTPS:**

```bash
# Using Caddy (automatic TLS certificates)
export DOMAIN=madace.yourdomain.com
docker-compose -f docker-compose.https.yml up -d

# Access securely at:
# https://madace.yourdomain.com
```

**Features:**

- Automatic TLS certificates (Let's Encrypt)
- HTTP → HTTPS redirect
- Security headers enabled
- Certificate auto-renewal
- Production-ready reverse proxy

**📘 See [docs/HTTPS-DEPLOYMENT.md](./docs/HTTPS-DEPLOYMENT.md) for complete HTTPS setup guide**

---

## CLI Support

**MADACE-Method v3.0 maintains full CLI functionality** alongside the new Web UI.

### Dual Interface Approach

Both interfaces work with the **same files and state**:

```
┌─────────────────────────────────────────────┐
│         MADACE-Method v3.0                   │
│                                              │
│  ┌──────────────┐      ┌──────────────┐    │
│  │   Web UI     │      │     CLI      │    │
│  │  (Browser)   │      │  (Terminal)  │    │
│  └──────┬───────┘      └──────┬───────┘    │
│         │                     │             │
│         └──────────┬──────────┘             │
│                    ▼                         │
│         ┌─────────────────────┐             │
│         │   Shared State      │             │
│         │  - Workflow Status  │             │
│         │  - Stories          │             │
│         │  - Configuration    │             │
│         └─────────────────────┘             │
└─────────────────────────────────────────────┘
```

### Using CLI (Claude CLI or Gemini CLI)

**Same workflows, different interface:**

```bash
# Via Claude CLI
claude --project madace-method-v3 agent pm
claude --project madace-method-v3 workflow plan-project

# Via Gemini CLI
gemini --project madace-method-v3 agent pm
gemini --project madace-method-v3 workflow plan-project

# Result: Same files generated in docs/
# State synchronized with Web UI automatically
```

### Using Web UI

```
1. Open http://localhost:3000
2. Click "PM Agent"
3. Click "*plan-project"
4. Fill form in browser
5. Submit

# Result: Same files generated in docs/
# State synchronized with CLI automatically
```

### Simultaneous Usage

You can **use both at the same time**:

```bash
Terminal 1: claude --project madace-method-v3 workflow create-story
Browser:    View live progress at http://localhost:3000

# OR

Browser:    Start workflow in Web UI
Terminal 2: Watch status with `cat docs/workflow-status.md`
```

### CLI Integration Features

✅ **Claude CLI Integration**: Full support for @anthropic-ai/claude-cli
✅ **Gemini CLI Integration**: Full support for Google's Gemini CLI
✅ **File-Based Sync**: Both interfaces read/write same files
✅ **Real-Time Updates**: WebSocket syncs changes from CLI to Web UI
✅ **No Conflicts**: Safe concurrent usage
✅ **Same Business Logic**: Both use same TypeScript modules

### CLI Installation

```bash
# Install Claude CLI
npm install -g @anthropic-ai/claude-cli

# Install Gemini CLI
npm install -g @google/generative-ai-cli

# Verify installation
claude --version
gemini --version
```

See [ARCHITECTURE.md - CLI Integration](./ARCHITECTURE.md#cli-integration) for detailed documentation.

### Built-in MADACE CLI

MADACE v3.0 includes a comprehensive CLI with 24 commands across 5 categories.

#### Quick Start

```bash
# List all commands
npm run madace --help

# Agent management
npm run madace agents list
npm run madace agents show pm
npm run madace agents create agent.yaml

# Configuration
npm run madace config get project_name
npm run madace config set project_name "My Project"
npm run madace config validate

# Project management
npm run madace project init
npm run madace project status
npm run madace project stats

# State machine
npm run madace state show
npm run madace state transition STORY-123 IN_PROGRESS
npm run madace state stats

# Workflows
npm run madace workflows list
npm run madace workflows run create-prd.yaml
npm run madace workflows status create-prd
```

#### Interactive REPL Mode

Launch an interactive REPL for faster workflow:

```bash
npm run madace repl

madace> agents list
madace> project status
madace> state show
madace> /exit
```

**Features**:

- Tab completion for commands and agent names
- Command history (saved across sessions)
- Multi-line input with syntax highlighting
- Session state tracking

#### Terminal Dashboard (TUI)

Real-time project monitoring in your terminal:

```bash
npm run madace dashboard
```

**Features**:

- 4-pane split layout (agents, workflows, state machine, logs)
- Real-time updates (every 5 seconds)
- Keyboard navigation (arrow keys, tab)
- Drill-down views (press Enter)
- Color-coded status indicators

**Keyboard Shortcuts**:

- `←→↑↓` - Navigate between panes
- `Tab` - Cycle through panes
- `Enter` - View details
- `r` - Manual refresh
- `q` - Quit

#### Output Formats

All commands support JSON output for scripting:

```bash
# Human-readable table (default)
npm run madace agents list

# Machine-readable JSON
npm run madace agents list --json | jq '.[] | select(.module == "MAM")'
```

#### Documentation

- **[CLI Reference](./docs/CLI-REFERENCE.md)** - Complete command reference (24 commands)
- **[REPL Tutorial](./docs/REPL-TUTORIAL.md)** - Interactive REPL guide
- **[Dashboard Guide](./docs/DASHBOARD-GUIDE.md)** - Terminal dashboard guide

---

## LLM Selection

This project separates LLM usage into two phases:

### Phase 1: Planning & Architecture (User-Selected LLM)

**Web UI Setup (Recommended)**:

1. Open http://localhost:3000
2. Navigate to Settings → LLM
3. Choose your provider:
   - **Google Gemini** (Recommended - Free tier available)
   - **Anthropic Claude** (Best reasoning, paid)
   - **OpenAI GPT** (Popular choice, paid)
   - **Local Models** (Privacy-focused, Docker + Ollama included)
4. Enter API key
5. Click "Test Connection"
6. Save configuration

**CLI Setup (Alternative)**:

```bash
./scripts/select-llm.sh  # Interactive setup with verbose explanations
```

### Phase 2: Implementation (Automatic)

Uses local Docker agent for code generation. No configuration needed.

**Documentation**: [`docs/LLM-SELECTION.md`](./docs/LLM-SELECTION.md)

---

## Module System

This implementation includes the same MADACE modules:

### 🎯 MADACE Core

- MADACE Master orchestrator
- Agent loading system
- Workflow execution engine
- Configuration management

### 🏗️ MADACE Method (MAM)

Agile AI-driven software development:

- **5 Agents**: PM, Analyst, Architect, SM (Scrum Master), DEV
- **Scale-Adaptive Planning**: Level 0-4 routing
- **Four-Phase Workflow**: Analysis → Planning → Solutioning → Implementation
- **Story State Machine**: Strict lifecycle management

### 🛠️ MADACE Builder (MAB)

Custom agent/workflow/module creation:

- Create custom AI agents
- Build domain-specific workflows
- Scaffold new modules

### 💡 Creative Intelligence Suite (CIS)

Innovation and creative thinking:

- SCAMPER brainstorming
- Six Thinking Hats
- Design Thinking process
- Mind mapping workflows

---

## 🚀 Enterprise Features & Capabilities

MADACE v3.0 includes production-ready enterprise features beyond the core MADACE methodology:

### 🏢 Project Management & Multi-Tenancy

**Enterprise-Ready Multi-Project Architecture**

- **Multi-Project Support**: Run multiple projects in a single MADACE instance
- **Complete Data Isolation**: Project-scoped agents, workflows, stories, and chat sessions
- **Role-Based Access Control (RBAC)**: Three-tier permission system (owner/admin/member)
- **Team Collaboration**: Add/remove members with granular permissions
- **Resource Tracking**: Real-time counts of agents, workflows, stories, and chat sessions

**10 Project Service Functions**:
- `getProjects()` - List all user projects
- `createProject()` - Create new project
- `updateProject()` - Update project metadata
- `deleteProject()` - Delete project (owner only)
- `addProjectMember()` - Add team member
- `removeProjectMember()` - Remove team member
- `getProjectMembers()` - List all members
- `hasProjectRole()` - Check user permissions
- `getUserProjectRole()` - Get user's role

**6 RESTful API Endpoints**:
- `GET /api/v3/projects` - List projects for user
- `POST /api/v3/projects` - Create new project
- `GET/PUT/DELETE /api/v3/projects/[id]` - Project operations
- `GET/POST/DELETE /api/v3/projects/[id]/members` - Member management

**Production Features**:
- ✅ Authentication integration points (NextAuth.js ready)
- ✅ Performance optimizations (caching, pagination)
- ✅ Security best practices (CSRF, rate limiting, SQL injection prevention)
- ✅ Cascade delete support
- ✅ Database indexes for fast filtering

**Documentation**: [ARCHITECTURE.md Section 12](./ARCHITECTURE.md#12-project-management--multi-tenancy-) (1,514 lines)

### 🤝 Real-Time Collaboration

**WebSocket-Based Synchronization**

- **Multi-Interface Sync**: Web UI ↔ CLI tools real-time updates
- **Presence Awareness**: Track active users and their locations
- **Shared Cursors**: See where teammates are working (planned)
- **File Watching**: Automatic detection of CLI changes
- **Broadcast State Changes**: Live updates across all connected clients
- **Client Tracking**: Monitor Web UI, Claude CLI, and Gemini CLI connections

**Collaboration Server**:
- WebSocket server (port 3001)
- Client connection tracking
- File watching with debouncing
- Health monitoring
- Status dashboard at `/sync-status`

### 🧠 Advanced Agent Memory System

**Persistent Context-Aware Memory**

- **Three-Tier Memory Types**:
  - **Short-term memory**: Recent conversation context (7-day TTL)
  - **Long-term memory**: Persistent user preferences and project facts (no expiration)
  - **Working memory**: Active session state (session-scoped)

- **Memory Categories**:
  - `user_preference` - User communication style, preferences
  - `project_context` - Project-specific information
  - `conversation_summary` - Conversation summaries
  - `user_fact` - Persistent user information

- **Smart Memory Management**:
  - **Importance Scoring** (1-10 scale) for prioritization
  - **Three-Tier Pruning System**:
    1. Expire low-importance memories (< 3) after 7 days
    2. Prune rarely-accessed memories (< 2 access count)
    3. Auto-summarize and condense old memories
  - **Context-Aware Retrieval**: Fetch relevant memories based on conversation
  - **Access Tracking**: Monitor memory usage for optimization

**Memory API** (10 endpoints):
- `GET /api/v3/chat/sessions/[id]/memory` - Retrieve agent memories
- `POST /api/v3/chat/sessions/[id]/memory` - Save new memory
- `DELETE /api/v3/chat/sessions/[id]/memory` - Prune expired memories

**Database Schema**:
```prisma
model AgentMemory {
  id             String    @id
  agentId        String
  userId         String
  context        Json      // Full memory context
  type           String    // "short-term" | "long-term"
  category       String    // Memory category
  importance     Int       @default(5)  // 1-10 scale
  lastAccessedAt DateTime
  accessCount    Int       @default(0)
  expiresAt      DateTime?
}
```

### 💬 Conversational AI & Chat System

**Database-Backed Chat with Streaming Responses**

- **Multi-Provider LLM Support**: Gemini, Claude, OpenAI, Local (Ollama)
- **Streaming Responses**: Real-time Server-Sent Events (SSE)
- **Message Threading**: Reply-to relationships for conversations
- **Pagination Support**: Efficient retrieval of large chat histories
- **Session Management**: Persistent chat sessions with agent context
- **Memory Integration**: Agent memories inform responses

**Chat Features**:
- 10 Chat API endpoints
- Database-backed sessions and messages
- Real-time streaming with SSE
- Message threading support
- Persistent agent memory
- Multi-project chat isolation

### 🔄 Dynamic LLM Provider Selector

**Runtime Provider Switching**

- **4 LLM Providers Supported**:
  - **Local** (Ollama) - Privacy-focused, runs locally
  - **Google Gemini** - Free tier available, fast responses
  - **Anthropic Claude** - Best reasoning, production-ready
  - **OpenAI GPT** - Popular choice, reliable

- **Provider Features**:
  - Real-time provider switching (no server restart)
  - Provider availability API with health checks
  - Visual status indicators in UI
  - Graceful fallback when provider unavailable
  - Streaming and blocking response modes
  - Rate limiting and retry logic

**API**: `GET /api/v3/llm/providers` - Provider status and availability

### 📊 Database-Driven State Management

**Zero File Dependencies for Production**

- **Eliminated File-Based State** (V2 → V3 migration):
  - Old: Read from `docs/mam-workflow-status.md`
  - New: Query database with Prisma ORM

- **Multi-Project State Filtering**:
  - `/api/state?projectId=xxx` - Project-scoped stories
  - `/api/state` - All stories (admin view)

- **Real-Time Kanban Integration**:
  - Visual kanban board synced with database
  - Live status updates
  - Milestone grouping
  - State validation

**5 Database Maintenance Scripts**:
- `seed-zodiac-stories.ts` - Seed demo data
- `check-zodiac-stories.ts` - Verify database state
- `delete-duplicate-zodiac.ts` - Remove duplicates
- `fix-zodiac-members.ts` - Fix project memberships
- `check-all-zodiac-projects.ts` - List all projects

### 📊 Assessment Tool with Implementation Actions

**Actionable Project Complexity Evaluation**

- **8-Criteria Scoring System**:
  - Project size (LOC, features)
  - Team size (developers)
  - Codebase complexity
  - External integrations
  - User base scale
  - Security requirements
  - Project duration
  - Existing codebase status

- **5 Complexity Levels**:
  - **Level 0 (Minimal)**: Simple scripts, 0-5 points
  - **Level 1 (Basic)**: Small teams, 6-12 points
  - **Level 2 (Standard)**: Medium projects, 13-20 points
  - **Level 3 (Comprehensive)**: Large complex projects, 21-30 points
  - **Level 4 (Enterprise)**: Mission-critical systems, 31-40 points

- **4 Implementation Action Buttons**:
  - 🚀 **Start Recommended Workflow** - Navigate to workflows with pre-selected workflow
  - 📁 **Create Project** - Instant project creation with assessment metadata
  - ⚙️ **Apply Configuration** - Save assessment to localStorage for reuse
  - 📊 **View Workflow Details** - Explore available workflows

- **Smart Features**:
  - Real-time assessment calculation
  - Recommended workflow selection based on complexity
  - Responsive UI with dark mode support
  - Export options (Markdown, JSON, Save to project)
  - API integration with Projects API
  - localStorage configuration persistence

**Assessment Page**: `http://localhost:3000/assess`

**Documentation**: [ARCHITECTURE.md Section 13](./ARCHITECTURE.md#13-assessment-tool--implementation-actions-) (644 lines)

**Key Files**:
- `app/assess/page.tsx` (239 lines, 4 action handlers)
- `components/features/AssessmentResult.tsx` (302 lines, action button UI)
- `lib/workflows/complexity-assessment.ts` (334 lines, scoring algorithm)

---

## Usage Examples

### Using MADACE to Build MADACE

This project uses the official MADACE-METHOD to manage its own development. See [`USING-MADACE.md`](./USING-MADACE.md) for the complete guide.

### MAM Workflows

#### Via Web UI (Recommended)

**Planning Phase:**

```
1. Open http://localhost:3000
2. Click "Agents" → "PM (Product Manager)"
3. Select workflows:
   - *workflow-status   → Check current status
   - *assess-scale      → Determine project complexity
   - *plan-project      → Create PRD/GDD + Epics
```

**Implementation Phase:**

```
1. Load SM agent for story management:
   - *create-story     → Draft new story from backlog
   - *story-ready      → Move story to IN PROGRESS

2. Load DEV agent for implementation:
   - *dev-story        → Implement current story
   - *story-approved   → Mark story DONE
```

#### Via Claude CLI / Gemini CLI (Alternative)

**Planning Phase:**

```bash
# Using Claude CLI
claude --project madace agent pm
claude --project madace workflow plan-project

# Using Gemini CLI
gemini --project madace agent pm
gemini --project madace workflow plan-project
```

**Implementation Phase:**

```bash
# Using Claude CLI
claude --project madace agent sm
claude --project madace workflow create-story

# Using Gemini CLI
gemini --project madace agent sm
gemini --project madace workflow create-story
```

**Both interfaces work with the same files and state!**

---

## Documentation

### Project Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Guide for AI assistants working with this codebase
- **[PRD.md](./PRD.md)** - Product requirements for this implementation
- **[PLAN.md](./PLAN.md)** - Development roadmap (4-week timeline)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture details (1200+ lines)
- **[FEASIBILITY-REPORT.md](./FEASIBILITY-REPORT.md)** - ✅ **Feasibility test results (ALL PASSED)**
- **[USING-MADACE.md](./USING-MADACE.md)** - Using MADACE to build MADACE
- **[LLM-SELECTION.md](./docs/LLM-SELECTION.md)** - LLM selection guide

### Architecture Decision Records (ADRs)

- **[ADR-003](./docs/adrs/ADR-003-architecture-simplification.md)** - Next.js Full-Stack Architecture ✅

### Official MADACE Documentation

For the official framework:

- [MADACE-METHOD Repository](https://github.com/tekcin/MADACE-METHOD)
- [Official Documentation](https://github.com/tekcin/MADACE-METHOD/tree/main/docs)

---

## Project Status

**Current Phase**: 🚀 **Alpha MVP Complete - v3.0.0-alpha Ready for Release!**

**Milestone Summary**:

- ✅ **40 stories completed** | **218 points delivered**
- ✅ **8 milestones completed** (1.1 through 1.8)
- ✅ **Alpha MVP timeline**: 2 weeks (planned: 4 weeks)
- ✅ **Actual velocity**: 97 points/week (significantly exceeded expectations!)

**Recent Accomplishments** (2025-10-22):

- ✅ **Milestone 1.8 Complete**: Testing & Documentation
  - Complete API documentation (47 endpoints, 650+ lines)
  - Complete component documentation (20+ components, 900+ lines)
  - Complete deployment guide (Docker, Kubernetes, Cloud, 800+ lines)
  - Testing infrastructure (Jest + 20+ tests, 600+ lines)
  - Production deployment ready

- ✅ **Milestone 1.7 Complete**: CLI Integration & API Routes
  - WebSocket real-time sync (Web UI ↔ CLI tools)
  - Claude CLI integration
  - Gemini CLI integration
  - Sync service with file watching
  - Real-time status dashboard

- ✅ **Milestone 1.6 Complete**: API Routes
  - All 47 REST API endpoints implemented
  - Health check monitoring
  - Configuration persistence
  - State machine query API

- ✅ **Milestone 1.5 Complete**: Frontend Components
  - Home dashboard with live statistics
  - Visual Kanban board (4 columns)
  - Agent selector and persona display
  - Workflow execution UI
  - LLM connection testing UI
  - Settings page with validation

- ✅ **Milestone 1.4 Complete**: LLM Integration
  - Multi-provider LLM client (4 providers)
  - Google Gemini provider (real API)
  - OpenAI GPT provider (real API)
  - Local/Ollama provider (real API)
  - Streaming and blocking responses
  - Rate limiting and retry logic

- ✅ **Milestone 1.3 Complete**: Core TypeScript Modules
  - Agent loader with Zod validation
  - Agent runtime with LLM integration
  - Workflow engine with step-by-step execution
  - State machine with strict lifecycle rules
  - Template engine with 40+ helpers
  - Configuration manager with auto-detection

**Completed Features**:

✅ **Next.js 15 Full-Stack Implementation**

- Next.js 15.5.6 project initialized
- TypeScript 5.7 with strict mode
- Tailwind CSS 4.1.15 with dark mode
- ESLint + Prettier configuration
- Jest testing framework (20+ tests)
- Docker deployment (production + development)

✅ **Setup Wizard & Configuration**

- 4-step setup wizard (Project, LLM, Modules, Summary)
- Settings page with live validation
- Configuration persistence (config.yaml + .env)
- Zod schema validation
- LLM connection testing UI
- Test connection before save

✅ **Agent System**

- Agent loader with YAML parsing and caching
- 5 MAM agents (PM, Analyst, Architect, SM, DEV)
- Agent runtime with conversation management
- Action registry with plugin system
- Agent persona display UI
- Agent selection UI (single/multi-select)

✅ **LLM Integration (4 Providers)**

- Google Gemini (fully functional)
- Anthropic Claude (stub)
- OpenAI GPT (fully functional)
- Local/Ollama (fully functional)
- Streaming and blocking responses
- Rate limiting and retry logic
- Comprehensive error handling

✅ **Workflow Engine**

- Workflow loader with YAML parsing
- Step-by-step execution
- 6 action types supported
- State persistence (.\*.state.json)
- Progress visualization UI
- Variable tracking across steps

✅ **State Machine & Kanban Board**

- BACKLOG → TODO → IN_PROGRESS → DONE lifecycle
- One-at-a-time enforcement
- Visual Kanban board (4 columns)
- Live statistics dashboard
- Milestone grouping
- State validation

✅ **Template Engine**

- Handlebars template rendering
- 40+ built-in helpers
- Legacy pattern support
- LRU caching
- Template validation

✅ **Real-Time Sync Service**

- WebSocket server (port 3001)
- Client tracking (Web UI, Claude CLI, Gemini CLI)
- File watching with debouncing
- Broadcast state changes
- Health monitoring
- Status dashboard

✅ **API Routes (47 Endpoints)**

- Agents API (2 endpoints)
- Workflows API (4 endpoints)
- State Machine API (1 endpoint)
- Configuration API (2 endpoints)
- LLM API (1 endpoint)
- Sync Service API (2 endpoints)
- Health Check API (1 endpoint)

✅ **Testing & Documentation**

- Jest configured with 20+ tests
- 85-90% code coverage on core modules
- API documentation (650+ lines)
- Component documentation (900+ lines)
- Deployment guide (800+ lines)
- Testing guide (600+ lines)
- RELEASE-NOTES.md (complete)

**Next Steps**:

1. **Tag v3.0.0-alpha release** → Ready to ship! 🚀
2. **Deploy to production** → Docker deployment tested and ready
3. **Community feedback** → Gather user feedback
4. **Optional: Add E2E tests** (TEST-011) → Playwright integration
5. **Begin Milestone 2.0** → Advanced features (database, real-time collaboration)

**Feasibility Confirmed** ([Full Report](./FEASIBILITY-REPORT.md)):

- ✅ Node.js v24.10.0 (exceeds v20+ requirement)
- ✅ Zod v4.1.12 validation working
- ✅ js-yaml v4.1.0 parsing working
- ✅ Handlebars v4.7.8 templates ready
- ✅ Claude CLI v2.0.21 available
- ✅ Gemini CLI available
- ✅ Multi-provider LLM pattern validated
- ✅ File system operations verified
- ✅ **Docker deployment validated (Production + Development)**
- ✅ All risks assessed and mitigated

**Timeline** (Confirmed via feasibility tests):

- **Week 1**: Setup wizard + Settings page → **LOW RISK** ✅
- **Week 2-3**: Core business logic + LLM integration → **LOW RISK** ✅
- **Week 4**: CLI integration + Testing + Deployment → **MEDIUM RISK** ✅
- **Total**: 4 weeks to Alpha MVP

---

## Comparison: v1.0 vs v3.0

| Aspect                | v1.0 (Official MADACE) | v3.0 (This Project)                          |
| --------------------- | ---------------------- | -------------------------------------------- |
| **Language**          | JavaScript/Node.js     | TypeScript/Node.js                           |
| **Type Safety**       | Runtime only           | Compile-time + Runtime (TypeScript + Zod)    |
| **Architecture**      | CLI-based              | Dual Interface (Web UI + CLI)                |
| **CLI Support**       | CLI only               | ✅ CLI + Web UI (both work together)         |
| **Deployment**        | npm install            | Docker (optimized containers)                |
| **Interface**         | Command-line           | Browser + Command-line (simultaneous)        |
| **Performance**       | Fast (V8 engine)       | Fast (same V8 engine)                        |
| **Complexity**        | Lower                  | Low (single runtime)                         |
| **Maturity**          | v1.0-alpha.2 (stable)  | v3.0-alpha (production-ready)                |
| **Database**          | None                   | Prisma ORM + PostgreSQL                      |
| **IDE Support**       | 5+ IDEs native         | Any browser + VSCode Server + CLI            |
| **LLM Selection**     | Fixed                  | User-selectable (Gemini/Claude/OpenAI/Local) |
| **State Machine UI**  | CLI text               | Visual Kanban board (Web) + CLI text         |
| **Real-Time Updates** | N/A                    | Live progress tracking + WebSocket sync      |
| **Claude CLI**        | Compatible             | ✅ Fully integrated                          |
| **Gemini CLI**        | Compatible             | ✅ Fully integrated                          |

---

## When to Use Which Version?

### Use v1.0 (Official MADACE-METHOD) If:

- ✅ You want a stable, production-tested framework
- ✅ You prefer command-line workflows only
- ✅ You need native IDE integration
- ✅ You want community modules and support
- ✅ You value simplicity and minimal setup

### Use v3.0 (This Project) If:

- 🌐 You prefer web-based interfaces with CLI option
- 📊 You want visual state machine (Kanban board)
- 🗄️ You need database-backed state management
- 🤖 You want to choose your LLM provider
- 🎨 You want modern UI/UX with real-time updates
- 🔬 You're building enterprise-grade applications
- 🔧 You want to contribute to v3 development
- 📈 You need scalable, production-ready architecture

### v2.0 (Archived)

- 📦 Experimental file-based implementation (archived)
- 🔄 Migration guide available: [MIGRATION-V2-TO-V3.md](./MIGRATION-V2-TO-V3.md)
- 📚 Historical reference in `archive/v2/`

---

## Why This Architecture

**Next.js Full-Stack (TypeScript)**

- Single runtime (Node.js) = simpler deployment
- Single language (TypeScript) = faster development
- Proven stack = lower risk
- Web UI innovation (vs CLI in official MADACE)
- Type-safe with excellent developer experience

See [ADR-003](./docs/adrs/ADR-003-architecture-simplification.md) for architectural rationale.

---

## Contributing

MADACE-Method v3.0 is under active development. Contributions are welcome!

### How to Contribute

1. **Fork the Repository**: https://github.com/tekcin/MADACE-Method-v2
2. **Create a Feature Branch**: `git checkout -b feature/your-feature`
3. **Follow the Tech Stack**: TypeScript 5.9.3, Next.js 15.5.6 (see [TECH-STACK.md](./docs/TECH-STACK.md))
4. **Run Tests**: `npm run type-check` and `npm run lint`
5. **Submit PR**: With clear description of changes

### Development Guidelines

- Follow TypeScript strict mode
- Use Zod for all validation
- Add JSDoc comments for public APIs
- Update documentation when adding features
- Test on both development and production Docker containers

### Code Quality

This project uses ESLint and Prettier for code quality and formatting.

**Commands:**

- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Auto-fix linting errors
- `npm run format` - Format all code with Prettier
- `npm run format:check` - Check if code is formatted
- `npm run check-all` - Run type checking, linting, and format check

**Editor Integration:**

- **VSCode**: Install ESLint and Prettier extensions
- **Cursor**: Install ESLint and Prettier extensions
- Configure format on save in your editor settings

### Contributing to v1.0 (Official)

For the official MADACE-METHOD v1.0 framework:
https://github.com/tekcin/MADACE-METHOD

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **MADACE-METHOD Team** - For the original framework and philosophy
- **Official MADACE** - https://github.com/tekcin/MADACE-METHOD
- Next.js, TypeScript, and React communities

---

## Links

- **Official MADACE-METHOD**: https://github.com/tekcin/MADACE-METHOD
- **This Project Issues**: [GitHub Issues](./issues)
- **LLM Selection Guide**: [docs/LLM-SELECTION.md](./docs/LLM-SELECTION.md)
- **Architecture Decisions**: [docs/adrs/](./docs/adrs/)

---

<sub>MADACE-Method v3.0 - Next Generation Web-Based AI Development Framework</sub>

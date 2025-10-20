# MADACE_RUST_PY

**IMPORTANT**: This is an experimental implementation of MADACE-METHOD using a simplified Next.js full-stack architecture.

For the official MADACE-METHOD framework (Node.js-based), see: https://github.com/tekcin/MADACE-METHOD

---

## 🎯 What is This Project?

This repository is a **proof-of-concept** implementation of the MADACE-METHOD philosophy using a modern web-based architecture:

- **Official MADACE**: Node.js/JavaScript CLI-based framework
- **This Project**: Next.js 15 full-stack TypeScript with Web UI

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
│      Next.js 14 (App Router)        │
│  ┌────────────┐  ┌──────────────┐   │
│  │  Frontend  │  │  API Routes  │   │
│  │  (React)   │  │  (Node.js)   │   │
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
- **Frontend**: Next.js 15 + React 19 + TypeScript 5
- **Backend**: Next.js API Routes + Server Actions
- **Business Logic**: TypeScript modules
- **LLM (Planning)**: User-selectable (Gemini/Claude/OpenAI/Local)
- **Styling**: Tailwind CSS 4
- **Deployment**: Docker or Vercel

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
git clone <this-repo-url>
cd MADACE_RUST_PY

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
git clone <this-repo-url>
cd MADACE_RUST_PY
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

| Feature | Development (`docker-compose.dev.yml`) | Production (`docker-compose.yml`) |
|---------|----------------------------------------|-----------------------------------|
| **Image Size** | ~2-3 GB | ~200 MB |
| **IDEs** | VSCode + Cursor | None |
| **Use Case** | Development | Production |
| **Ports** | 3000, 8080, 8081 | 3000 |
| **Code** | Live-mounted | Baked in |
| **Hot Reload** | ✅ Enabled | ❌ Not applicable |

See [ARCHITECTURE.md - Deployment](./ARCHITECTURE.md#deployment) for full documentation.

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
   - **Local Models** (Privacy-focused, requires hardware)
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

**Current Phase**: Alpha - Ready for Implementation ✅

**Recent Milestones**:
- ✅ Next.js 15 full-stack architecture
- ✅ LLM selection system implemented
- ✅ **Feasibility tests completed (ALL PASSED)**
- ✅ **Docker deployment validated (Production + Development)**
- ✅ Core dependencies installed and verified
- ✅ Claude CLI v2.0.21 and Gemini CLI confirmed available
- ✅ Web-based configuration architecture validated
- ✅ Development container with VSCode Server + Cursor ready
- ⏭️ Next: Initialize Next.js project and begin implementation

**Completed**:
- ✅ Next.js 15 project initialized
- ✅ Project structure configured
- ✅ LLM selection system (`./scripts/select-llm.sh`)
- ✅ Documentation
- ✅ **Feasibility testing (Node.js, Zod, YAML, LLM, CLI tools)**
- ✅ **Docker deployment configured (Production + Development containers)**
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS 4
- ✅ Comprehensive feasibility report ([FEASIBILITY-REPORT.md](./FEASIBILITY-REPORT.md))
- ✅ Development environment guide ([DEVELOPMENT.md](./DEVELOPMENT.md))

**Ready to Implement**:
- ⬜ Setup Wizard (web-based configuration)
- ⬜ Settings Page (ongoing configuration)
- ⬜ Agent system implementation (TypeScript)
- ⬜ Workflow engine (TypeScript)
- ⬜ State machine (TypeScript)
- ⬜ LLM client (multi-provider)
- ⬜ CLI integration (Claude + Gemini)
- ⬜ Web UI components (React + Tailwind)

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

## Comparison: Official vs This Implementation

| Aspect | Official MADACE | This Project |
|--------|----------------|--------------|
| **Language** | JavaScript/Node.js | TypeScript/Node.js |
| **Architecture** | CLI-based | Web UI (Next.js) |
| **Deployment** | npm install | Docker (single image + volume) |
| **Interface** | Command-line | Browser-based |
| **Performance** | Fast (V8 engine) | Fast (same V8 engine) |
| **Complexity** | Lower (single runtime) | Low (single runtime) |
| **Maturity** | v1.0-alpha.2 (stable) | Experimental (proof-of-concept) |
| **IDE Support** | 5+ IDEs native | Any browser |
| **LLM Selection** | Fixed | User-selectable (4 options) |
| **State Machine UI** | CLI text | Visual Kanban board |

---

## When to Use Which?

### Use Official MADACE-METHOD If:
- You want a production-ready framework ✅
- You prefer command-line workflows ✅
- You need native IDE integration ✅
- You want community modules and support ✅
- You value simplicity and ease of installation ✅

### Use This Implementation If:
- You prefer web-based interfaces 🌐
- You want visual state machine (Kanban board) 📊
- You want to choose your LLM provider 🤖
- You're exploring alternative MADACE UIs 🔬
- You want to contribute to UI/UX R&D 🔧

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

This is an experimental project. Contributions are welcome, but please note:

1. **Not Official**: This is not the official MADACE-METHOD implementation
2. **Experimental**: Architecture recently simplified, under active development
3. **Educational**: Great for learning Next.js, TypeScript, and MADACE concepts

For contributing to the official framework, see:
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

<sub>Experimental Next.js implementation of MADACE-METHOD with Web UI</sub>

# MADACE-Method v2.0

**MADACE** = **M**ethodology for **A**I-**D**riven **A**gile **C**ollaboration **E**ngine

**Version**: 2.0.0-alpha | **Status**: In Development ✅

**MADACE-Method v1.0** (Official): https://github.com/tekcin/MADACE-METHOD

---

## 🎯 What is MADACE-Method v2.0?

MADACE-Method v2.0 is the **next generation** of the MADACE (Methodology for AI-Driven Agile Collaboration Engine) framework, rebuilt from the ground up with modern web technologies and enhanced user experience.

### Version Comparison

- **v1.0 (Official)**: Node.js/JavaScript CLI-based framework
- **v2.0 (This Project)**: Next.js 15 full-stack TypeScript with Web UI

### What's New in v2.0

✅ **Dual Interface**: Web UI + CLI (both work simultaneously with same state)
✅ **Web-First Architecture**: Full browser-based UI in addition to CLI
✅ **Type-Safe**: TypeScript throughout with strict mode + Zod validation
✅ **Modern Stack**: Next.js 15, React 19, Tailwind CSS 4
✅ **Single Runtime**: Pure Node.js/TypeScript (no multi-language complexity)
✅ **Visual State Machine**: Kanban-style workflow visualization (Web) + text status (CLI)
✅ **Multi-LLM Support**: Choose between Gemini, Claude, OpenAI, or local models
✅ **Real-Time Updates**: Live workflow status and progress tracking
✅ **CLI Integration**: Full Claude CLI and Gemini CLI support maintained
✅ **Docker-Ready**: Production and development containers included

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

**Tech Stack**: Next.js 15.5.6 • React 19.0.0 • TypeScript 5.7.3 • Node.js 20+ • Tailwind CSS 4.1.1 • Zod 4.1.12

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

---

## CLI Support

**MADACE-Method v2.0 maintains full CLI functionality** alongside the new Web UI.

### Dual Interface Approach

Both interfaces work with the **same files and state**:

```
┌─────────────────────────────────────────────┐
│         MADACE-Method v2.0                   │
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
claude --project madace-method-v2 agent pm
claude --project madace-method-v2 workflow plan-project

# Via Gemini CLI
gemini --project madace-method-v2 agent pm
gemini --project madace-method-v2 workflow plan-project

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
Terminal 1: claude --project madace-method-v2 workflow create-story
Browser:    View live progress at http://localhost:3000

# OR

Browser:    Start workflow in Web UI
Terminal 2: Watch status with `cat docs/mam-workflow-status.md`
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

## Comparison: v1.0 vs v2.0

| Aspect                | v1.0 (Official MADACE) | v2.0 (This Project)                          |
| --------------------- | ---------------------- | -------------------------------------------- |
| **Language**          | JavaScript/Node.js     | TypeScript/Node.js                           |
| **Type Safety**       | Runtime only           | Compile-time + Runtime (TypeScript + Zod)    |
| **Architecture**      | CLI-based              | Dual Interface (Web UI + CLI)                |
| **CLI Support**       | CLI only               | ✅ CLI + Web UI (both work together)         |
| **Deployment**        | npm install            | Docker (optimized containers)                |
| **Interface**         | Command-line           | Browser + Command-line (simultaneous)        |
| **Performance**       | Fast (V8 engine)       | Fast (same V8 engine)                        |
| **Complexity**        | Lower                  | Low (single runtime)                         |
| **Maturity**          | v1.0-alpha.2 (stable)  | v2.0-alpha (experimental)                    |
| **IDE Support**       | 5+ IDEs native         | Any browser + VSCode Server + CLI            |
| **LLM Selection**     | Fixed                  | User-selectable (Gemini/Claude/OpenAI/Local) |
| **State Machine UI**  | CLI text               | Visual Kanban board (Web) + CLI text         |
| **Real-Time Updates** | N/A                    | Live progress tracking + WebSocket sync      |
| **Claude CLI**        | Compatible             | ✅ Fully integrated                          |
| **Gemini CLI**        | Compatible             | ✅ Fully integrated                          |

---

## When to Use Which Version?

### Use v1.0 (Official MADACE-METHOD) If:

- ✅ You want a production-ready framework
- ✅ You prefer command-line workflows
- ✅ You need native IDE integration
- ✅ You want community modules and support
- ✅ You value simplicity and ease of installation

### Use v2.0 (This Project) If:

- 🌐 You prefer web-based interfaces
- 📊 You want visual state machine (Kanban board)
- 🤖 You want to choose your LLM provider
- 🎨 You want modern UI/UX with real-time updates
- 🔬 You're exploring next-gen MADACE features
- 🔧 You want to contribute to v2 development

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

MADACE-Method v2.0 is under active development. Contributions are welcome!

### How to Contribute

1. **Fork the Repository**: https://github.com/tekcin/MADACE-Method-v2
2. **Create a Feature Branch**: `git checkout -b feature/your-feature`
3. **Follow the Tech Stack**: TypeScript 5.7.3, Next.js 15.5.6 (see [TECH-STACK.md](./docs/TECH-STACK.md))
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

<sub>MADACE-Method v2.0 - Next Generation Web-Based AI Development Framework</sub>

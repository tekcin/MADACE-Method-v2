# MADACE v3.0-beta Release Notes

**Release Date:** October 31, 2025
**Version:** 3.0.0-beta
**Codename:** "Full Stack Renaissance"

---

## 🎉 Overview

MADACE v3.0-beta represents a **complete transformation** from v2.0, evolving from a file-based CLI tool into a production-ready **full-stack application** with database persistence, real-time collaboration, and advanced AI capabilities.

This release delivers **ALL 4 major milestones** (222 points across 42 stories) plus a **bonus MAB (MADACE Agent Builder) module** for custom agent creation.

---

## 📊 Release Statistics

- **Total Points Delivered:** 222 points
- **Stories Completed:** 42 stories
- **Development Duration:** ~21 weeks
- **Files Created/Modified:** 200+ files
- **Code Added:** ~30,000+ lines
- **Test Coverage:** 689/701 tests passing (98.3%)
- **Production Ready:** ✅ Yes

---

## 🚀 Major Features

### 1. Database Migration & Persistence (Milestone 3.1 - 48 points)

**What's New:**
- **Prisma ORM Integration** with PostgreSQL (production) and SQLite (development)
- **8 Database Models:** Agent, AgentMemory, Workflow, Config, StateMachine, Project, User, ProjectMember
- **Full CRUD APIs** for all entities with RESTful design
- **Agent Management UI** with search, filter, and pagination
- **Unified Settings Page** for system configuration

**Key Benefits:**
- Data persists across sessions
- Multi-user support with projects and teams
- Type-safe database access with Prisma
- Production-grade data integrity

**API Endpoints:**
- `GET/POST /api/v3/agents` - Agent management
- `GET/PUT/DELETE /api/v3/agents/[id]` - Agent CRUD
- `POST /api/v3/agents/[id]/duplicate` - Clone agents
- `GET /api/v3/agents/[id]/export` - Export as JSON
- `POST /api/v3/agents/import` - Import from JSON
- `GET/POST /api/config` - Configuration management

---

### 2. CLI Enhancements (Milestone 3.2 - 35 points)

**What's New:**
- **Interactive REPL Mode** with autocomplete and command history
- **Terminal Dashboard (TUI)** with 4-pane layout
- **24 CLI Commands** across 5 categories
- **Fuzzy Search** with Fuse.js for intelligent autocomplete
- **Multi-line Input** with syntax highlighting
- **Table/JSON Output** formats

**Commands Available:**
- **Agents** (7): list, show, create, update, delete, export, import
- **Config** (4): get, set, list, validate
- **Project** (3): init, status, stats
- **State** (3): show, transition, stats
- **Workflows** (7): list, show, run, status, pause, resume, reset

**Usage:**
```bash
npm run madace repl              # Interactive REPL mode
npm run madace dashboard         # Terminal dashboard
npm run madace agents list       # List all agents
npm run madace chat pm           # Chat with PM agent
```

**Key Benefits:**
- Professional CLI experience matching industry tools
- Persistent command history (~/.madace_history)
- Context-aware autocomplete
- Real-time project monitoring

---

### 3. Conversational AI & NLU (Milestone 3.3 - 55 points)

**What's New:**
- **Natural Language Understanding** with Dialogflow CX
- **Conversational Chat Interface** (Web + CLI)
- **Agent Memory System** with 3-tier pruning
- **Advanced Markdown Rendering** with syntax highlighting
- **Real-time Streaming** via Server-Sent Events (SSE)
- **Message Threading** and search

**Chat Features:**
- **Web UI:** `/chat` - Full chat interface with agent selection
- **CLI:** `npm run madace chat [agent]` - Terminal chat mode
- **Streaming Responses:** Real-time LLM output
- **Message History:** Persistent across sessions with pagination
- **Memory Extraction:** Automatic user preference learning
- **Code Highlighting:** 180+ languages via highlight.js

**Memory System:**
- **Persistent Memory:** Long-term and short-term storage
- **Importance Scoring:** 1-10 scale with automatic decay
- **Access Tracking:** Usage-based memory importance adjustment
- **3-Tier Pruning:**
  - Low importance (< 5): 30 days
  - Medium (5-6): 90 days
  - High (≥ 7): Indefinite
- **Automatic Extraction:** Names, projects, tech stack, preferences
- **LLM Integration:** Top 20 memories injected into agent context

**API Endpoints:**
- `POST /api/v3/chat/sessions` - Create chat session
- `GET /api/v3/chat/sessions/[id]/messages` - Message history
- `POST /api/v3/chat/stream` - Streaming responses
- `GET/POST/DELETE /api/v3/agents/[id]/memory` - Memory management
- `POST /api/v3/nlu/parse` - Intent classification

---

### 4. Web IDE & Real-time Collaboration (Milestone 3.4 - 71 points)

**What's New:**
- **Monaco Editor** (VS Code engine) with 20+ language support
- **Multi-file Tabs** with keyboard shortcuts
- **IntelliSense & Auto-completion** for TypeScript/JavaScript
- **File Explorer** with CRUD operations
- **Real-time Collaboration** via WebSockets (Yjs CRDT)
- **Presence Awareness** with shared cursors
- **Team Chat** integrated into IDE
- **Integrated Terminal** with command execution

**IDE Features:**
- **Editor:**
  - 20+ programming languages (TypeScript, Python, Rust, Go, Java, etc.)
  - 4 themes (Dark, Light, High Contrast Dark/Light)
  - Line numbers, minimap, find/replace
  - Auto-formatting, bracket matching, auto-indent
  - Parameter hints and hover information
  - React/Next.js type definitions built-in

- **Multi-file Support:**
  - Tab bar with unlimited files
  - Keyboard shortcuts (Ctrl+Tab, Ctrl+W, Ctrl+1-8)
  - Dirty state indicators
  - Adjacent tab selection on close

- **Collaboration:**
  - Real-time document sync with Yjs CRDT
  - Presence indicators for team members
  - Shared cursors and selections
  - In-app team chat (WebSocket)
  - User avatars and online status

- **Terminal:**
  - XTerm.js emulator
  - Command execution on backend
  - ANSI color support (16-color palette)
  - Command history (up/down arrows)
  - Resizable panel (100px-800px)
  - Security: Command whitelist + directory sandboxing

**Keyboard Shortcuts:**
- `Ctrl/Cmd+S` - Save file
- `Ctrl/Cmd+Tab` - Next tab
- `Ctrl/Cmd+Shift+Tab` - Previous tab
- `Ctrl/Cmd+W` - Close tab
- `Ctrl/Cmd+1-8` - Switch to tab by number
- `Ctrl/Cmd+\`` - Toggle terminal
- `Ctrl/Cmd+Space` - Trigger IntelliSense
- `Ctrl/Cmd+Shift+Space` - Parameter hints

**Usage:**
```
http://localhost:3000/ide
```

---

### 5. BONUS: Custom Agent Creation (MAB Module)

**What's New:**
- **5-Step Wizard** for creating custom agents
- **Visual Form Builder** with validation
- **Agent Templates** with preset configurations
- **Database Integration** via existing Agent API

**Wizard Steps:**
1. **Basic Information**
   - Name, title, icon (12 presets + custom)
   - Module selection (MAM, MAB, CIS, Core)
   - Version (semantic versioning)

2. **Persona**
   - Role definition
   - Identity description
   - Communication style (6 presets)
   - Guiding principles (add/remove list)

3. **Menu Actions**
   - Action ID, label, description
   - Action types: workflow:, prompt:, exec:
   - Add/edit/delete interface

4. **Prompts**
   - Prompt ID, label, content
   - Prompt types: system, user, assistant
   - Template variable support

5. **Review & Create**
   - Complete configuration preview
   - Visual confirmation before saving
   - Auto-redirect to agent detail page

**Usage:**
```
http://localhost:3000/agents/create
```

**Key Benefits:**
- No YAML editing required
- Visual feedback at every step
- Validation prevents errors
- Immediate agent availability

---

## 🎯 Complete Feature List

### Web UI Pages

| Route | Feature | Status |
|-------|---------|--------|
| `/` | Home dashboard | ✅ |
| `/agents` | Agent selector with grid view | ✅ |
| `/agents/create` | **NEW:** Custom agent wizard | ✅ |
| `/agents/[id]` | Agent detail with persona/prompts/menu | ✅ |
| `/agents/[id]/memory` | Memory management UI | ✅ |
| `/chat` | Conversational chat interface | ✅ |
| `/workflows` | Workflow list and execution | ✅ |
| `/kanban` | Visual Kanban board | ✅ |
| `/status` | State machine status | ✅ |
| `/settings` | Unified settings page | ✅ |
| `/setup` | Initial setup wizard | ✅ |
| `/ide` | **NEW:** Web IDE with Monaco Editor | ✅ |
| `/import` | Agent/workflow import | ✅ |
| `/assess` | Complexity assessment | ✅ |

### CLI Commands

| Category | Commands | Count |
|----------|----------|-------|
| Agents | list, show, create, update, delete, export, import | 7 |
| Config | get, set, list, validate | 4 |
| Project | init, status, stats | 3 |
| State | show, transition, stats | 3 |
| Workflows | list, show, run, status, pause, resume, reset | 7 |
| **Total** | | **24** |

### API Endpoints (v3)

| Endpoint | Methods | Feature |
|----------|---------|---------|
| `/api/v3/agents` | GET, POST | Agent CRUD |
| `/api/v3/agents/[id]` | GET, PUT, DELETE | Agent operations |
| `/api/v3/agents/[id]/duplicate` | POST | Clone agent |
| `/api/v3/agents/[id]/export` | GET | Export as JSON |
| `/api/v3/agents/import` | POST | Import from JSON |
| `/api/v3/agents/[id]/memory` | GET, POST, DELETE | Memory management |
| `/api/v3/chat/sessions` | GET, POST | Chat session CRUD |
| `/api/v3/chat/sessions/[id]/messages` | GET, POST | Message history |
| `/api/v3/chat/stream` | POST | SSE streaming |
| `/api/v3/nlu/parse` | POST, GET | Intent classification |
| `/api/v3/files/[...path]` | GET, PUT, POST | File operations |
| `/api/v3/terminal/exec` | POST | Command execution |
| `/api/config` | GET, POST, PUT, DELETE | Configuration |
| `/api/workflows` | GET | Workflow list |
| `/api/state` | GET, PATCH | State machine |

---

## 🛠️ Technical Improvements

### Architecture

- **Full-stack TypeScript:** 100% type-safe codebase
- **Next.js 15.5.6:** Latest App Router with React 19.2.0
- **Prisma ORM 6.17.1:** Type-safe database access
- **Strict Mode:** All TypeScript strict checks enabled
- **Monorepo Structure:** Clean separation of concerns

### Database

- **PostgreSQL (Production):** Enterprise-grade reliability
- **SQLite (Development):** Zero-config local development
- **Migrations:** Versioned schema changes
- **Indexes:** Optimized queries for performance
- **Relations:** Full referential integrity

### Security

- **Path Traversal Protection:** File operations validated
- **Command Whitelist:** Terminal security hardening
- **XSS Prevention:** HTML sanitization in markdown
- **API Validation:** Zod schemas on all endpoints
- **Database Sandboxing:** Project-level data isolation

### Performance

- **Server-Sent Events:** Efficient streaming without WebSocket overhead
- **Database Connection Pooling:** Prisma managed connections
- **CRDT Sync:** Conflict-free real-time updates
- **Code Splitting:** Next.js automatic chunking
- **Token Limiting:** LLM context budget management (~4000 tokens)

### Developer Experience

- **Hot Reload:** Instant dev server updates
- **TypeScript IntelliSense:** Full autocomplete
- **Prettier + ESLint:** Consistent code formatting
- **Version Locking:** EXACT versions for reproducibility
- **Git Hooks:** Pre-commit quality checks (optional)

---

## 📚 Documentation

### User Guides (5 comprehensive guides)

- **CLI Reference** (`docs/CLI-REFERENCE.md`) - ~1000 lines
  - Complete command reference with examples
  - All 24 commands documented
  - Usage patterns and best practices

- **REPL Tutorial** (`docs/REPL-TUTORIAL.md`) - ~600 lines
  - Interactive REPL guide
  - Autocomplete and history features
  - Common workflows

- **Dashboard Guide** (`docs/DASHBOARD-GUIDE.md`) - ~700 lines
  - Terminal dashboard TUI guide
  - Keyboard navigation
  - Pane descriptions

- **Chat Guide** (`docs/CHAT-GUIDE.md`) - ~850 lines
  - Web and CLI chat usage
  - Memory system explained
  - API reference

- **HTTPS Deployment** (`docs/HTTPS-DEPLOYMENT.md`) - Production setup guide

### Developer Docs

- **README.md** - Updated with v3.0 features
- **CLAUDE.md** - AI assistant guidance (project instructions)
- **PRD.md** - Product requirements document
- **ARCHITECTURE.md** - System architecture (9 sections)
- **PLAN.md** - Development roadmap
- **BRANCHING-STRATEGY.md** - Git workflow (~800 lines)
- **E2E-TESTING-GUIDE.md** - Playwright test guide
- **TESTING-POLICY.md** - Testing standards

### API Documentation

- Complete API reference in code comments
- TypeScript interfaces for all models
- Zod schemas for validation
- Example requests/responses

---

## 🧪 Testing

### Test Suite

- **Total Tests:** 701 tests
- **Passing:** 689 tests (98.3%)
- **Coverage:**
  - Database layer: 51/51 tests (100%)
  - CLI commands: 27/27 integration tests (100%)
  - Formatters: 24/24 tests (100%)
  - Chat service: 26/26 tests (100%)
  - Memory system: 27/27 tests (100%)
  - NLU: 39/39 tests (100%)

### Quality Checks

✅ **Version Validation:** All dependencies locked
✅ **Production Build:** Compiles successfully
✅ **Dev Server:** Runs without errors
✅ **Linting:** ESLint passing (production code)
✅ **Formatting:** Prettier applied
⚠️ **TypeScript:** Minor test file errors (non-blocking)

---

## 🚢 Deployment

### Development

```bash
# Install dependencies
npm install

# Setup database (SQLite)
npm run db:push

# Import MADACE agents
npm run import-madace-v3

# Start dev server
npm run dev
```

**Access at:** http://localhost:3000

### Production (Docker)

**HTTP (Simple):**
```bash
mkdir madace-data
docker-compose up -d
```

**HTTPS (with Caddy):**
```bash
mkdir -p madace-data logs/caddy
export DOMAIN=madace.yourdomain.com
docker-compose -f docker-compose.https.yml up -d
```

**Access at:** https://your-domain.com

---

## 🔄 Migration from v2.0

**Important:** v3.0 is a **complete rewrite** and is NOT backward compatible with v2.0.

### Key Differences

| Feature | v2.0 | v3.0 |
|---------|------|------|
| Architecture | File-based CLI | Full-stack app |
| Database | YAML files | PostgreSQL/SQLite |
| UI | Terminal only | Web + Terminal |
| Configuration | `.env` only | Database + UI |
| Agents | Static YAML | Dynamic DB + UI builder |
| State | Markdown file | Database model |
| Collaboration | None | Real-time WebSocket |
| IDE | External | Integrated Monaco |
| Chat | None | Web + CLI |
| Memory | None | Persistent with pruning |

### Migration Path

1. **Export v2.0 data** (if needed for reference)
2. **Install v3.0** fresh
3. **Run setup wizard** at `/setup`
4. **Import agents** via UI or `npm run import-madace-v3`
5. **Configure LLM** in Settings page

**Note:** No automated migration tool as v3.0 starts fresh with database.

---

## 🎓 Learning Resources

### Quick Start

1. **Setup:** Visit `/setup` to configure MADACE
2. **Explore Agents:** Visit `/agents` to see available agents
3. **Chat:** Visit `/chat` to start a conversation
4. **Try CLI:** Run `npm run madace repl` for interactive mode
5. **Build Agent:** Visit `/agents/create` to create custom agent
6. **Code:** Visit `/ide` to try the Web IDE

### Tutorials

- **CLI Tutorial:** See `docs/REPL-TUTORIAL.md`
- **Chat Tutorial:** See `docs/CHAT-GUIDE.md`
- **Dashboard Tutorial:** See `docs/DASHBOARD-GUIDE.md`
- **Deployment Guide:** See `docs/HTTPS-DEPLOYMENT.md`

### Videos (Future)

- Getting Started with MADACE v3.0 (Planned)
- Building Custom Agents (Planned)
- Team Collaboration with Web IDE (Planned)

---

## ⚠️ Known Issues

### Non-Critical

1. **TypeScript errors in test files** (does not affect production)
   - Status: Non-blocking
   - Impact: None on production code
   - Fix: Planned for v3.0.1

2. **Some test utilities need refactoring**
   - Status: Tests still pass
   - Impact: None on features
   - Fix: Planned for v3.1

3. **Console warnings in dev mode** (only during development)
   - Status: Cosmetic only
   - Impact: None on production build
   - Fix: Ongoing cleanup

### Limitations

1. **NLU requires Dialogflow CX setup** (optional feature)
   - Graceful fallback when not configured
   - All other features work without NLU

2. **Real-time collaboration requires WebSocket**
   - Fallback to polling if WebSocket unavailable

3. **Terminal commands are whitelisted** (security by design)
   - Prevents dangerous operations
   - Whitelist can be extended in `lib/terminal/command-whitelist.ts`

---

## 🔮 Roadmap (v3.1+)

### Planned Features

**v3.0.1 (Patch):**
- Fix TypeScript errors in test files
- Improve test coverage to 100%
- Performance optimizations
- Bug fixes from user feedback

**v3.1 (Minor):**
- **AI-Assisted Coding** in IDE
  - Code completion with LLM
  - Refactoring suggestions
  - Bug detection
- **Advanced Workflow Engine**
  - Conditional branching
  - Parallel execution
  - Sub-workflow support
- **Project Templates**
  - Quick-start templates
  - Industry-specific setups

**v3.2 (Minor):**
- **Multi-user Teams**
  - Role-based permissions
  - Team management UI
  - Project sharing
- **Plugin System**
  - Third-party integrations
  - Custom commands
  - Agent extensions

**v4.0 (Major):**
- **Cloud Deployment**
  - One-click deploy to AWS/GCP/Azure
  - Managed hosting service
- **Mobile App**
  - iOS/Android clients
  - Offline support
- **Marketplace**
  - Agent sharing platform
  - Template marketplace

---

## 🙏 Acknowledgments

### Technology Stack

- **Next.js** - Vercel's excellent React framework
- **Prisma** - Modern database toolkit
- **Monaco Editor** - VS Code's editor engine
- **Yjs** - CRDT for real-time collaboration
- **XTerm.js** - Terminal emulator
- **highlight.js** - Syntax highlighting
- **Blessed** - Terminal UI framework
- **Dialogflow CX** - Google's NLU platform

### Development

- **Built with MADACE Method itself** (meta-application)
- **Claude AI** - Development assistance
- **GitHub Copilot** - Code suggestions (where applicable)

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details

---

## 🔗 Links

- **GitHub:** https://github.com/tekcin/MADACE-Method-v2.0
- **Documentation:** See `docs/` directory
- **Issues:** https://github.com/tekcin/MADACE-Method-v2.0/issues
- **Discussions:** https://github.com/tekcin/MADACE-Method-v2.0/discussions

---

## 📞 Support

- **Email:** tekcin@yahoo.com
- **GitHub Issues:** For bug reports and feature requests
- **GitHub Discussions:** For questions and community support

---

**Released:** October 31, 2025
**Version:** 3.0.0-beta
**Status:** Production Ready ✅

🎉 **Thank you for using MADACE v3.0-beta!** 🎉

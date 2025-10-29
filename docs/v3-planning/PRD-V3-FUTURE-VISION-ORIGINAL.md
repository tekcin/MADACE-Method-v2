# Product Requirements Document (PRD) - MADACE v3.0

**Project:** MADACE-Method v3.0 - Next-Generation AI Collaboration Platform
**Version:** 3.0.0-planning
**Status:** 📋 Planning Phase
**Scale Level:** 4 (Enterprise)
**Last Updated:** 2025-10-24
**Document Owner:** MADACE Core Team

> **🎯 MADACE-Method Applied**: This PRD follows MAM (MADACE Agile Method) guidelines for Level 4 projects

---

## Executive Summary

MADACE v3.0 represents a major evolution from the current v2.0 file-based system to a comprehensive AI collaboration platform with database-backed agents, real-time collaboration, conversational interfaces, and an integrated web IDE.

### Key Transformation

**From (v2.0):**

- File-based agent definitions
- Single-user workflows
- Menu-driven commands
- Static configuration
- CLI + Web UI separation

**To (v3.0):**

- Database-backed dynamic agents
- Multi-user real-time collaboration
- Natural language interaction
- Persistent agent memory
- Unified CLI + Web IDE experience

### Vision

Create a **collaborative AI development environment** where teams can:

- Create and customize AI agents through natural conversation
- Work together in real-time with shared cursors and live editing
- Build software with AI assistance in a browser-based IDE
- Access powerful CLI tools with interactive dashboards
- Leverage agent memory for personalized, context-aware assistance

---

## 1. Strategic Context

### 1.1 Evolution from v2.0

MADACE v2.0 successfully validated the core concepts:

- ✅ Agent-based workflows
- ✅ Scale-adaptive planning
- ✅ Next.js full-stack architecture
- ✅ Multi-provider LLM integration
- ✅ State machine for story management

**v3.0 Builds On This Foundation:**

- Addresses v2.0 limitations (static agents, single-user)
- Introduces enterprise features (collaboration, memory, IDE)
- Prepares for commercial deployment
- Enables community-driven extensibility

### 1.2 Market Positioning

**Competitive Landscape:**

- **Cursor/GitHub Copilot**: Code completion, no workflow structure
- **Claude Code**: CLI-based, no collaboration
- **Replit/CodeSandbox**: IDE-focused, no AI agents
- **Linear/Jira**: Project management, no AI coding

**MADACE v3.0 Differentiation:**

- ✨ Structured AI workflows (unique to MADACE)
- 👥 Real-time team collaboration
- 🤖 Customizable AI agents with memory
- 🎯 End-to-end development lifecycle
- 🔧 Extensible module system

### 1.3 Target Users

**Primary Personas:**

1. **Remote Development Teams** (2-10 developers)
   - Need: Collaborative AI-assisted development
   - Pain: Context loss, async communication overhead
   - Value: Real-time shared workspace with AI agents

2. **AI-First Startups**
   - Need: Rapid iteration with AI tooling
   - Pain: Fragmented tools, no workflow structure
   - Value: Unified platform from planning to deployment

3. **Enterprise Innovation Labs**
   - Need: Compliant AI development environment
   - Pain: Shadow IT, ungoverned AI usage
   - Value: Auditable, secure AI collaboration

---

## 2. Product Features (Level 4 Breakdown)

### Epic 1: Dynamic Agent Management 🤖

**Problem:** v2.0 agents are static YAML files, difficult to customize

**Solution:** Database-backed agents with CRUD operations

**Features:**

- Create agents via web UI or CLI
- Edit agent personas, prompts, and menu items
- Delete and archive agents
- Agent versioning and rollback
- Import/export agent templates
- Agent marketplace (future)

**User Stories:**

1. As a developer, I want to create a custom agent from a template in < 2 minutes
2. As an AI engineer, I want to fine-tune agent prompts and test iterations quickly
3. As a project manager, I want to see all team agents and their usage stats

**Acceptance Criteria:**

- Agent CRUD operations complete in < 500ms
- Changes reflected in all user sessions within 2 seconds
- Agent definitions validate against schema before save
- Full audit trail of agent modifications

---

### Epic 2: Conversational Interaction 💬

**Problem:** Menu-driven commands are restrictive

**Solution:** Natural language understanding for flexible agent interaction

**Features:**

- NLU integration (Dialogflow/Rasa)
- Intent recognition for common workflows
- Entity extraction (story IDs, file paths, etc.)
- Multi-turn conversations with context
- Conversation history and search
- Voice input support (future)

**User Stories:**

1. As a developer, I want to ask "Create a new story for user authentication" and have the agent understand my intent
2. As a project manager, I want to query "What's the status of Sprint 3?" in natural language
3. As a team lead, I want agents to remember context from previous conversations

**Acceptance Criteria:**

- NLU intent accuracy > 85% for common commands
- Response latency < 2 seconds (NLU + LLM)
- Context maintained across conversation turns
- Fallback to guided prompts when intent unclear

---

### Epic 3: Persistent Agent Memory 🧠

**Problem:** Agents are stateless, no learning or personalization

**Solution:** Database-backed memory with user, project, and conversation context

**Features:**

- User preference storage (coding style, language, etc.)
- Project context memory (architecture decisions, patterns)
- Conversation history with semantic search
- Memory retrieval based on context similarity
- Memory pruning and summarization
- Privacy controls (personal vs shared memory)

**User Stories:**

1. As a developer, I want agents to remember my preferred code style
2. As a team, we want shared project knowledge accessible to all agents
3. As a privacy-conscious user, I want to control what agents remember

**Acceptance Criteria:**

- Memory retrieval < 100ms for typical queries
- Semantic search accuracy > 80%
- Memory size limits enforced per user/project
- GDPR-compliant data retention and deletion

---

### Epic 4: Interactive CLI with Dashboard 📊

**Problem:** v2.0 CLI is non-interactive, no system visibility

**Solution:** REPL + TUI dashboard with real-time monitoring

**Features:**

- Interactive command mode with inquirer.js
- REPL for exploratory interactions
- blessed/neo-blessed TUI dashboard
- Real-time agent, workflow, and state machine status
- Split-screen layout (dashboard + command)
- Keyboard shortcuts and navigation
- Terminal themes and customization

**User Stories:**

1. As a CLI power user, I want an interactive mode that guides me through commands
2. As a developer, I want a glanceable dashboard showing system state
3. As a DevOps engineer, I want to monitor MADACE from the terminal

**Acceptance Criteria:**

- Dashboard updates in real-time (< 1 second latency)
- REPL supports command history and autocomplete
- TUI works across all supported terminals
- Keyboard navigation 100% accessible

---

### Epic 5: Integrated Web IDE 💻

**Problem:** v2.0 Web UI is configuration-only, no code editing

**Solution:** Monaco Editor integration with file explorer and terminal

**Features:**

- Monaco Editor (VS Code engine) for code editing
- File explorer with tree view
- Integrated terminal for command execution
- Syntax highlighting for 100+ languages
- IntelliSense and code completion
- Git integration (future)
- Extension marketplace (future)

**User Stories:**

1. As a developer, I want to write code directly in the browser without switching tools
2. As a remote worker, I want a full IDE accessible from any device
3. As a code reviewer, I want to view and annotate code inline

**Acceptance Criteria:**

- Editor loads in < 3 seconds
- File operations (open, save, rename) < 500ms
- Terminal connects in < 1 second
- IntelliSense latency < 200ms

---

### Epic 6: Real-Time Collaboration 👥

**Problem:** v2.0 is single-user, no team features

**Solution:** WebSocket-based real-time collaboration with CRDTs

**Features:**

- Shared cursors with user avatars
- Live editing with conflict resolution (CRDTs)
- In-app chat and video (future)
- Presence indicators (online/offline/away)
- Activity feed (who changed what)
- Collaborative agent sessions
- Session recording and replay (future)

**User Stories:**

1. As a pair programming team, we want to edit the same file simultaneously
2. As a distributed team, we want to see who's online and what they're working on
3. As a mentor, I want to guide a junior developer in real-time

**Acceptance Criteria:**

- Cursor position updates < 100ms latency
- CRDT merge conflicts resolve automatically 99%+ of time
- Chat messages delivered < 500ms
- Supports 10+ concurrent users per project

---

### Epic 7: Unified Configuration & Database 💾

**Problem:** v2.0 config is fragmented (YAML, .env, localStorage)

**Solution:** Single database source of truth (SQLite/PostgreSQL)

**Features:**

- Database schema for all configuration
- Migration from v2.0 file-based system
- Configuration API for UI and CLI
- Real-time config synchronization
- Configuration versioning and rollback
- Export to YAML for backup
- Database backups and restore

**User Stories:**

1. As a user, I want all my settings in one place
2. As a team, we want configuration changes synced instantly
3. As an admin, I want to rollback to a previous config version

**Acceptance Criteria:**

- Config reads < 50ms, writes < 100ms
- Migration from v2.0 completes in < 5 minutes
- Zero data loss during migration
- Automatic backups before critical changes

---

## 3. Technical Architecture (Level 4 Requirements)

### 3.1 Database Schema Design

**Technology Choice:** PostgreSQL (primary) + SQLite (local dev)

**Core Tables:**

```sql
-- Agents (dynamic management)
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  icon VARCHAR(10),
  module VARCHAR(100),
  version VARCHAR(50),
  persona JSONB NOT NULL,
  menu JSONB NOT NULL,
  prompts JSONB,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  created_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Agent Memory (persistent context)
CREATE TABLE agent_memory (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  memory_type VARCHAR(50), -- user_pref, project_context, conversation
  content JSONB NOT NULL,
  embedding VECTOR(1536), -- for semantic search
  created_at TIMESTAMP NOT NULL
);

-- Conversations (NLU history)
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  messages JSONB NOT NULL,
  context JSONB,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP
);

-- Configuration (unified)
CREATE TABLE configuration (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL,
  UNIQUE(project_id, key)
);

-- Users (multi-user support)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  preferences JSONB,
  created_at TIMESTAMP NOT NULL,
  last_seen_at TIMESTAMP
);

-- Projects (workspace isolation)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  settings JSONB,
  created_at TIMESTAMP NOT NULL
);

-- Real-time Sessions (collaboration)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  cursor_position JSONB,
  active_file VARCHAR(500),
  connected_at TIMESTAMP NOT NULL,
  disconnected_at TIMESTAMP
);
```

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MADACE v3.0 Architecture                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│      Web Browser         │  │      CLI Terminal        │
│   (React + Monaco IDE)   │  │   (REPL + TUI Dashboard) │
└──────────┬───────────────┘  └──────────┬───────────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
                 ┌────────▼─────────┐
                 │   Next.js API    │ ◄──── WebSocket Server
                 │   (REST + WS)    │       (Real-time Collab)
                 └────────┬─────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
  ┌─────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
  │ Agent Svc  │  │ Workflow Svc │  │  NLU Svc    │
  │ (Dynamic)  │  │ (Execution)  │  │ (Dialogflow)│
  └─────┬──────┘  └──────┬───────┘  └──────┬──────┘
        │                │                 │
        └────────────────┼─────────────────┘
                         │
                  ┌──────▼──────┐
                  │  PostgreSQL  │
                  │  (Primary DB)│
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
  ┌─────▼────┐    ┌─────▼────┐    ┌─────▼────┐
  │ Agents   │    │  Memory  │    │  Config  │
  │ Table    │    │  Table   │    │  Table   │
  └──────────┘    └──────────┘    └──────────┘

                         │
                  ┌──────▼──────┐
                  │  LLM Proxy   │
                  │ (Multi-prov) │
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
  ┌─────▼────┐    ┌─────▼────┐    ┌─────▼────┐
  │ Gemini   │    │  Claude  │    │  OpenAI  │
  │   API    │    │   API    │    │   API    │
  └──────────┘    └──────────┘    └──────────┘
```

### 3.3 Technology Stack Updates

**New Dependencies:**

| Category     | Technology     | Purpose                    |
| ------------ | -------------- | -------------------------- |
| Database     | PostgreSQL 15+ | Primary data store         |
| Database ORM | Prisma 5+      | Type-safe database client  |
| Vector Store | pgvector       | Semantic search for memory |
| WebSocket    | Socket.io 4+   | Real-time collaboration    |
| CRDT         | Yjs            | Conflict-free editing      |
| NLU          | Dialogflow ES  | Intent recognition         |
| Code Editor  | Monaco Editor  | Browser IDE                |
| CLI          | inquirer.js    | Interactive prompts        |
| TUI          | blessed        | Terminal dashboard         |
| Auth         | NextAuth.js    | Multi-user authentication  |

### 3.4 Performance Requirements

| Metric           | v2.0 Target | v3.0 Target | Notes              |
| ---------------- | ----------- | ----------- | ------------------ |
| Agent Load       | < 1s        | < 500ms     | DB caching         |
| Config Read      | N/A         | < 50ms      | In-memory cache    |
| DB Write         | N/A         | < 100ms     | Connection pooling |
| WS Latency       | N/A         | < 100ms     | Cursor sync        |
| IDE Load         | N/A         | < 3s        | Monaco init        |
| NLU Response     | N/A         | < 2s        | Intent + LLM       |
| Concurrent Users | 1           | 10+         | Per project        |

---

## 4. Migration Strategy (v2.0 → v3.0)

### 4.1 Data Migration

**Phase 1: Schema Setup**

- Create PostgreSQL database
- Run Prisma migrations
- Initialize pgvector extension

**Phase 2: Agent Migration**

- Parse all v2.0 YAML agent files
- Convert to database records
- Preserve agent IDs and versions
- Validate schema compatibility

**Phase 3: Configuration Migration**

- Read v2.0 config.yaml
- Transform to database records
- Migrate .env variables
- Preserve module enablement

**Phase 4: State Migration**

- Convert mam-workflow-status.md to DB
- Populate stories table
- Preserve state machine rules

**Timeline:** 1-2 weeks for migration tooling + testing

### 4.2 Backward Compatibility

**Support v2.0 Export:**

- Export agents to YAML format
- Export config to config.yaml
- Export state to Markdown
- Allow "downgrade" path if needed

**Versioning:**

- Database schema versioning
- API versioning (/api/v2, /api/v3)
- Client-server compatibility checks

---

## 5. Success Metrics

### 5.1 Adoption Metrics

- v2.0 → v3.0 migration rate: > 80% within 6 months
- New v3.0 installations: > 500 within 12 months
- Multi-user projects: > 100 teams within 12 months

### 5.2 Engagement Metrics

- Average agents per user: > 10 (vs 5 in v2.0)
- Custom agent creation rate: > 20% of users
- Collaboration sessions per week: > 3 per active team
- NLU usage: > 50% of commands via natural language

### 5.3 Technical Metrics

- Database query p95: < 100ms
- WebSocket message latency p95: < 100ms
- IDE performance (Lighthouse): > 90 score
- System uptime: > 99.5%

---

## 6. Risks & Mitigations

### 6.1 Technical Risks

**R1: Database Performance**

- Risk: Slow queries with 10+ concurrent users
- Impact: High
- Mitigation: Connection pooling, query optimization, caching layer

**R2: WebSocket Scaling**

- Risk: Connection limits with many users
- Impact: High
- Mitigation: Redis adapter for Socket.io, horizontal scaling

**R3: CRDT Complexity**

- Risk: Merge conflicts in edge cases
- Impact: Medium
- Mitigation: Thorough testing, fallback to manual merge

**R4: NLU Accuracy**

- Risk: Poor intent recognition frustrates users
- Impact: Medium
- Mitigation: Extensive training data, graceful fallbacks

### 6.2 Product Risks

**R5: Feature Bloat**

- Risk: Too many features overwhelm users
- Impact: High
- Mitigation: Progressive disclosure, excellent onboarding

**R6: Migration Complexity**

- Risk: Users struggle to migrate from v2.0
- Impact: Medium
- Mitigation: Automated migration tool, clear documentation

---

## 7. Release Plan

### 7.1 Phase 1: Alpha (Q1 2026)

- **Duration:** 3 months
- **Goal:** Core infrastructure and database migration
- **Deliverables:**
  - PostgreSQL schema and Prisma setup
  - Dynamic agent management (CRUD)
  - Database-backed configuration
  - Migration tool from v2.0
  - Basic WebSocket server

### 7.2 Phase 2: Beta (Q2-Q3 2026)

- **Duration:** 6 months
- **Goal:** Feature completion and testing
- **Deliverables:**
  - NLU integration (Dialogflow)
  - Persistent agent memory
  - CLI REPL and TUI dashboard
  - Monaco Editor integration
  - Real-time collaboration (shared cursors)
  - Multi-user authentication

### 7.3 Phase 3: Stable (Q4 2026)

- **Duration:** 3 months
- **Goal:** Production readiness
- **Deliverables:**
  - Performance optimization
  - Security hardening
  - Comprehensive testing
  - Documentation and tutorials
  - Migration guides from v2.0

**Total Timeline:** 12 months (Q1-Q4 2026)

---

## 8. Open Questions

1. **Database Choice:** PostgreSQL vs MySQL? (Recommendation: PostgreSQL for pgvector)
2. **NLU Provider:** Dialogflow vs Rasa? (Recommendation: Dialogflow for faster setup)
3. **Deployment Model:** Self-hosted only or also offer cloud hosting?
4. **Pricing:** Remain open-source or introduce commercial tier for collaboration features?
5. **Mobile:** Support mobile browsers in v3.0 or defer to v3.1?

---

## 9. Appendix

### 9.1 Glossary

- **CRDT:** Conflict-free Replicated Data Type (enables real-time collaboration)
- **NLU:** Natural Language Understanding
- **pgvector:** PostgreSQL extension for vector similarity search
- **TUI:** Text-based User Interface (terminal dashboard)
- **REPL:** Read-Eval-Print Loop (interactive command shell)

### 9.2 References

- [ROADMAP-V3-FUTURE-VISION.md](../../ROADMAP-V3-FUTURE-VISION.md) - Original v3.0 vision
- [ARCHITECTURE-V3-FUTURE.md](../../ARCHITECTURE-V3-FUTURE.md) - Technical proposals
- [PRD.md](../../PRD.md) - v2.0 PRD (authoritative)
- [CLAUDE.md](../../CLAUDE.md) - Development guidelines

---

**Document Status:** Draft for Review
**Next Steps:** Review with team → Create Epics → Begin architecture design
**Review Date:** 2025-11-01

# Epics - MADACE v3.0

**Project:** MADACE-Method v3.0
**Version:** 3.0.0-planning
**Scale Level:** 4 (Enterprise)
**Last Updated:** 2025-10-24

> **🎯 MADACE-Method Applied**: Following MAM Epic structure for Level 4 projects

---

## Epic Overview

| Epic ID | Epic Name                        | Priority      | Effort   | Dependencies | Status     |
| ------- | -------------------------------- | ------------- | -------- | ------------ | ---------- |
| V3-E1   | Dynamic Agent Management         | P0 (Critical) | 8 weeks  | None         | 📋 Planned |
| V3-E2   | Database Infrastructure          | P0 (Critical) | 6 weeks  | None         | 📋 Planned |
| V3-E3   | Agent Memory System              | P1 (High)     | 5 weeks  | V3-E2        | 📋 Planned |
| V3-E4   | Conversational Interaction (NLU) | P1 (High)     | 6 weeks  | V3-E2        | 📋 Planned |
| V3-E5   | Interactive CLI & Dashboard      | P1 (High)     | 4 weeks  | V3-E2        | 📋 Planned |
| V3-E6   | Integrated Web IDE               | P2 (Medium)   | 8 weeks  | V3-E2        | 📋 Planned |
| V3-E7   | Real-Time Collaboration          | P2 (Medium)   | 10 weeks | V3-E2, V3-E6 | 📋 Planned |
| V3-E8   | Migration & Compatibility        | P0 (Critical) | 4 weeks  | V3-E2        | 📋 Planned |
| V3-E9   | Multi-User Authentication        | P1 (High)     | 3 weeks  | V3-E2        | 📋 Planned |
| V3-E10  | Performance & Optimization       | P1 (High)     | 6 weeks  | All          | 📋 Planned |

**Total Estimated Effort:** 60 weeks (12 months with 5-person team)

---

## V3-E1: Dynamic Agent Management 🤖

**Priority:** P0 (Critical)
**Effort:** 8 weeks
**Dependencies:** None
**Status:** 📋 Planned

### Problem Statement

Currently in v2.0, agents are static YAML files that require manual editing and file system access. This makes it difficult for users to:

- Create custom agents without technical expertise
- Modify agent behavior without redeploying
- Version and rollback agent changes
- Share and discover community agents

### Epic Goal

Enable users to create, edit, and manage agents dynamically through the web UI and CLI, with full CRUD operations backed by a database.

### User Stories

#### Core Functionality

- **V3-E1-S1:** As a developer, I want to create a new agent from a template in < 2 minutes so I can quickly customize AI assistance
- **V3-E1-S2:** As an AI engineer, I want to edit agent personas and prompts through a web form so I can iterate on agent behavior
- **V3-E1-S3:** As a project lead, I want to delete or archive unused agents to keep my workspace organized
- **V3-E1-S4:** As a user, I want to see a list of all available agents with their descriptions so I can choose the right one

#### Advanced Features

- **V3-E1-S5:** As an agent creator, I want to version my agents so I can rollback to previous configurations
- **V3-E1-S6:** As a team lead, I want to export agents as templates so I can share them with other projects
- **V3-E1-S7:** As a user, I want to import community agents from a marketplace so I can leverage expert configurations

### Acceptance Criteria

- [ ] Agent CRUD API endpoints: POST, GET, PUT, DELETE /api/v3/agents
- [ ] Web UI forms for agent creation and editing with live preview
- [ ] Agent validation against Zod schema before save
- [ ] Agent versioning with rollback capability
- [ ] Full audit trail of agent changes (who, what, when)
- [ ] Import/export to YAML format for compatibility
- [ ] Performance: Agent creation < 500ms, retrieval < 100ms

### Technical Notes

- Use Prisma for database operations
- Store persona, menu, and prompts as JSONB for flexibility
- Implement soft deletes (is_deleted flag) for safety
- Cache frequently accessed agents in Redis
- WebSocket event for agent updates (real-time sync across clients)

### Out of Scope

- Agent marketplace (deferred to v3.1)
- Agent permissions and access control (covered in V3-E9)
- Agent performance analytics (future feature)

---

## V3-E2: Database Infrastructure 💾

**Priority:** P0 (Critical)
**Effort:** 6 weeks
**Dependencies:** None
**Status:** 📋 Planned

### Problem Statement

v2.0 uses file-based storage (YAML, JSON, Markdown) which:

- Doesn't support concurrent multi-user access
- Makes querying and filtering difficult
- Lacks transactional integrity
- Can't leverage relational data
- Doesn't scale beyond single-user scenarios

### Epic Goal

Establish a robust database infrastructure using PostgreSQL with Prisma ORM, supporting all v3.0 features including agents, memory, configuration, users, and real-time sessions.

### User Stories

- **V3-E2-S1:** As a developer, I want database schema migrations automated so I don't risk data corruption during upgrades
- **V3-E2-S2:** As a system admin, I want database backups running automatically so I can recover from failures
- **V3-E2-S3:** As a user, I want my data queries to be fast (< 100ms) so the system feels responsive
- **V3-E2-S4:** As a team, we want concurrent database access without conflicts so multiple people can work simultaneously

### Acceptance Criteria

- [ ] PostgreSQL 15+ database setup with connection pooling
- [ ] Prisma schema covering all v3.0 entities (agents, memory, config, users, projects, sessions)
- [ ] Database migrations tested and documented
- [ ] pgvector extension for semantic search (agent memory)
- [ ] Indexes optimized for common queries
- [ ] Backup and restore procedures documented
- [ ] Performance: p95 query latency < 100ms
- [ ] Support for both PostgreSQL (production) and SQLite (local dev)

### Technical Notes

**Schema Tables:**

- agents (dynamic agent storage)
- agent_memory (persistent context)
- conversations (NLU history)
- configuration (unified settings)
- users (multi-user support)
- projects (workspace isolation)
- sessions (real-time collaboration)

**Performance Optimizations:**

- Connection pooling (pg-pool)
- Query result caching (Redis)
- Prepared statements
- Database indexes on frequent queries
- Batch operations where possible

### Out of Scope

- Database sharding (defer to v3.x when scaling needed)
- Multi-region replication (future enterprise feature)

---

## V3-E3: Agent Memory System 🧠

**Priority:** P1 (High)
**Effort:** 5 weeks
**Dependencies:** V3-E2 (Database Infrastructure)
**Status:** 📋 Planned

### Problem Statement

v2.0 agents are stateless - they don't remember:

- User preferences (coding style, language)
- Project context (architecture decisions, patterns)
- Previous conversations
- Learning from past interactions

This forces users to repeat context and prevents personalization.

### Epic Goal

Implement a persistent memory system that allows agents to remember user preferences, project context, and conversation history, with semantic search for context retrieval.

### User Stories

- **V3-E3-S1:** As a developer, I want agents to remember my preferred code style (tabs vs spaces, naming conventions) so I don't have to specify it every time
- **V3-E3-S2:** As a team, we want shared project knowledge (architecture decisions, patterns) accessible to all agents so we maintain consistency
- **V3-E3-S3:** As a user, I want agents to recall relevant past conversations when I ask follow-up questions so I get contextually aware responses
- **V3-E3-S4:** As a privacy-conscious user, I want to delete my agent memory data at any time so I control what's remembered

### Acceptance Criteria

- [ ] Agent memory storage in database with JSONB content
- [ ] Three memory types: user_preferences, project_context, conversation_history
- [ ] Vector embeddings (pgvector) for semantic search
- [ ] Memory retrieval based on context similarity (cosine distance)
- [ ] Memory size limits enforced (e.g., 10MB per user)
- [ ] Memory pruning based on age and relevance
- [ ] Privacy controls: view, edit, delete memory
- [ ] Performance: Memory retrieval < 100ms

### Technical Notes

**Memory Structure:**

```json
{
  "memory_type": "user_preferences",
  "content": {
    "coding_style": {
      "indentation": "2 spaces",
      "quotes": "single",
      "semicolons": false
    },
    "language_preferences": ["TypeScript", "Python"],
    "preferred_frameworks": ["Next.js", "FastAPI"]
  },
  "embedding": [0.123, 0.456, ...] // 1536-dim vector
}
```

**Semantic Search:**

- Use OpenAI text-embedding-ada-002 or similar for embeddings
- Store vectors in pgvector column
- Query with cosine similarity: `ORDER BY embedding <-> query_embedding LIMIT 5`

**Memory Lifecycle:**

- Create: On user preference set, project decision made, conversation end
- Retrieve: On agent request with context query
- Update: Merge new context with existing memory
- Delete: On user request or age-based pruning

### Out of Scope

- Cross-project memory (users can't share memory between projects in v3.0)
- Memory export/import (deferred to v3.1)
- Advanced memory summarization (simple pruning only)

---

## V3-E4: Conversational Interaction (NLU) 💬

**Priority:** P1 (High)
**Effort:** 6 weeks
**Dependencies:** V3-E2 (Database Infrastructure)
**Status:** 📋 Planned

### Problem Statement

v2.0 uses menu-driven commands which:

- Require users to learn exact command names
- Don't support natural language queries
- Can't handle variations in phrasing
- Limit flexibility and expressiveness

### Epic Goal

Integrate Natural Language Understanding (NLU) to allow users to interact with agents using natural language, with intent recognition, entity extraction, and multi-turn conversations.

### User Stories

- **V3-E4-S1:** As a developer, I want to type "Create a new story for user authentication" and have the system understand my intent without memorizing commands
- **V3-E4-S2:** As a project manager, I want to ask "What's the status of Sprint 3?" in natural language and get a meaningful response
- **V3-E4-S3:** As a user, I want the system to ask clarifying questions when my intent is unclear so I can refine my request
- **V3-E4-S4:** As a team lead, I want conversation context preserved across multiple messages so I don't have to repeat myself

### Acceptance Criteria

- [ ] NLU integration (Dialogflow ES recommended)
- [ ] Intent recognition for core workflows (create_story, workflow_status, plan_project, etc.)
- [ ] Entity extraction (story_id, epic_name, file_path, etc.)
- [ ] Intent accuracy > 85% for trained commands
- [ ] Fallback to guided prompts when confidence < 70%
- [ ] Multi-turn conversation support with context
- [ ] Conversation history stored in database
- [ ] Performance: NLU response < 1s, Total response (NLU + LLM) < 3s

### Technical Notes

**Dialogflow Integration:**

```typescript
// Intent definition
{
  "displayName": "create-story",
  "trainingPhrases": [
    "create a new story for {feature}",
    "add story about {feature}",
    "I want to build {feature}"
  ],
  "parameters": [
    {
      "name": "feature",
      "entityType": "@sys.any",
      "required": true
    }
  ],
  "action": "workflow.create_story"
}
```

**Conversation Flow:**

1. User input → NLU service
2. Intent detected + entities extracted
3. Check confidence score
4. If high: Execute workflow
5. If low: Ask clarifying question
6. Store conversation in DB
7. Return response to user

**Intents to Implement:**

- workflow.\* (create_story, workflow_status, plan_project, etc.)
- agent.\* (load_agent, list_agents, create_agent)
- config.\* (get_config, set_config, show_settings)
- query.\* (what_is, how_to, explain)

### Out of Scope

- Voice input/output (deferred to v3.1)
- Multi-language support beyond English (future)
- Custom intent training UI (use Dialogflow console)

---

## V3-E5: Interactive CLI & Dashboard 📊

**Priority:** P1 (High)
**Effort:** 4 weeks
**Dependencies:** V3-E2 (Database Infrastructure)
**Status:** 📋 Planned

### Problem Statement

v2.0 CLI is non-interactive:

- No guidance for command discovery
- No real-time system visibility
- No dashboard or monitoring
- Poor user experience for CLI power users

### Epic Goal

Transform the CLI into an interactive experience with REPL mode, guided prompts, and a real-time TUI dashboard for system monitoring.

### User Stories

- **V3-E5-S1:** As a CLI power user, I want an interactive mode that suggests commands and guides me through workflows so I can work efficiently
- **V3-E5-S2:** As a developer, I want a glanceable terminal dashboard showing agent status, workflows, and stories so I can monitor the system at a glance
- **V3-E5-S3:** As a DevOps engineer, I want keyboard shortcuts for common actions so I can navigate quickly without a mouse
- **V3-E5-S4:** As a new user, I want the CLI to teach me commands as I use it so I learn the system faster

### Acceptance Criteria

- [ ] REPL mode with inquirer.js for interactive prompts
- [ ] Command autocomplete and history
- [ ] TUI dashboard with blessed/neo-blessed
- [ ] Dashboard layout: Header (project info) + Main (agent/workflow/stories) + Footer (help)
- [ ] Real-time updates (< 1 second latency)
- [ ] Keyboard navigation (arrow keys, shortcuts)
- [ ] Terminal theme support (light/dark)
- [ ] Works in all major terminals (macOS Terminal, iTerm2, Windows Terminal, GNOME Terminal)

### Technical Notes

**TUI Dashboard Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ MADACE v3.0 - Project: MyApp                     [Connected] │
├──────────────────────────────────────────────────────────────┤
│ Agents (5)          │ Workflows (12)     │ Stories (23)      │
│ ✓ PM                │ ● plan-project     │ TODO: 1           │
│ ✓ Analyst           │ ✓ create-story     │ IN PROGRESS: 1    │
│ ✓ Architect         │   dev-story        │ DONE: 21          │
│ ✓ SM                │                    │                   │
│ ✓ DEV               │ Active Users: 3    │ Velocity: 8 pts   │
├──────────────────────────────────────────────────────────────┤
│ [F1] Help  [F2] Config  [F3] Agents  [F4] Workflows  [Q] Quit│
└──────────────────────────────────────────────────────────────┘
```

**REPL Commands:**

```bash
madace> create story
? What feature should this story implement? › User authentication
? Which epic does this belong to? › Epic 1: User Management
✓ Story created: STORY-024-user-authentication.md

madace> status
Current State:
  TODO: 0 stories
  IN PROGRESS: 1 story (STORY-024)
  DONE: 22 stories

madace> help
Available commands:
  create story     - Create a new story from TODO
  status          - Show workflow status
  load <agent>    - Load an agent
  ...
```

### Out of Scope

- Custom dashboard layouts (fixed layout in v3.0)
- Mouse support in TUI (keyboard-only)
- Terminal multiplexer integration (tmux, screen)

---

## V3-E6: Integrated Web IDE 💻

**Priority:** P2 (Medium)
**Effort:** 8 weeks
**Dependencies:** V3-E2 (Database Infrastructure)
**Status:** 📋 Planned

### Problem Statement

v2.0 Web UI is configuration-focused:

- No code editing capabilities
- Users must switch to external IDE
- Context loss when switching tools
- No in-browser development environment

### Epic Goal

Integrate Monaco Editor (VS Code's editor engine) with file explorer and terminal to create a full-featured web IDE within MADACE.

### User Stories

- **V3-E6-S1:** As a developer, I want to write code directly in the browser so I don't have to switch between MADACE and my IDE
- **V3-E6-S2:** As a remote worker, I want a full IDE accessible from any device so I can work from anywhere
- **V3-E6-S3:** As a code reviewer, I want to view and annotate code inline so I can provide feedback efficiently
- **V3-E6-S4:** As a user, I want syntax highlighting and IntelliSense so I can write code faster with fewer errors

### Acceptance Criteria

- [ ] Monaco Editor integration for code editing
- [ ] File explorer with tree view (left sidebar)
- [ ] Integrated terminal (bottom panel)
- [ ] Syntax highlighting for 100+ languages
- [ ] IntelliSense (autocomplete, hover tooltips)
- [ ] Multi-tab editing support
- [ ] File operations: create, open, save, rename, delete
- [ ] Search and replace (Ctrl+F, Ctrl+H)
- [ ] Keyboard shortcuts match VS Code
- [ ] Performance: Editor loads < 3s, file opens < 500ms

### Technical Notes

**Monaco Editor Setup:**

```typescript
import * as monaco from 'monaco-editor';

const editor = monaco.editor.create(document.getElementById('editor'), {
  value: fileContent,
  language: 'typescript',
  theme: 'vs-dark',
  automaticLayout: true,
  minimap: { enabled: true },
  fontSize: 14,
  wordWrap: 'on',
});
```

**File System:**

- Store files in database (optional) or mount project directory
- Use VS Code's file system provider API
- Support for read-only remote files
- Auto-save every 2 seconds

**Terminal:**

- Use xterm.js for terminal emulation
- WebSocket connection to backend shell
- Support for npm, git, madace CLI commands
- Multiple terminal instances

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ MADACE IDE - MyApp                         [User]  [?]  │
├───────────┬────────────────────────────────────────────┤
│ EXPLORER  │ src/app/page.tsx                     [x]   │
│           │                                             │
│ src/      │ export default function Home() {           │
│  ├ app/   │   return (                                 │
│  │ ├ page │     <div>                                 │
│  │ └ lay* │       <h1>Hello MADACE</h1>              │
│  ├ lib/   │     </div>                                │
│  └ comp*  │   );                                       │
│           │ }                                          │
│ [Files]   │                                            │
│ [Search]  │                                            │
│ [Git]     │                                            │
├───────────┴────────────────────────────────────────────┤
│ TERMINAL                                         [-][x] │
│ $ npm run dev                                          │
│ > madace@3.0.0 dev                                     │
│ > next dev                                             │
│ ✓ Ready on http://localhost:3000                      │
└────────────────────────────────────────────────────────┘
```

### Out of Scope

- Git UI integration (use terminal commands in v3.0)
- Debugger support (future)
- Extension marketplace (future)
- Live preview pane (future)

---

## V3-E7: Real-Time Collaboration 👥

**Priority:** P2 (Medium)
**Effort:** 10 weeks
**Dependencies:** V3-E2 (Database), V3-E6 (Web IDE)
**Status:** 📋 Planned

### Problem Statement

v2.0 is single-user:

- No team collaboration features
- No visibility into who's working on what
- No way to pair program or review code together
- Merge conflicts when multiple people work on same codebase

### Epic Goal

Enable real-time collaboration with shared cursors, live editing using CRDTs, presence indicators, and in-app chat.

### User Stories

- **V3-E7-S1:** As a pair programming team, we want to edit the same file simultaneously and see each other's cursors so we can collaborate effectively
- **V3-E7-S2:** As a distributed team, we want presence indicators showing who's online and what they're working on so we can coordinate better
- **V3-E7-S3:** As a mentor, I want to guide a junior developer in real-time by pointing to specific code lines so they learn faster
- **V3-E7-S4:** As a team, we want in-app chat so we can discuss code without switching to Slack

### Acceptance Criteria

- [ ] WebSocket server with Socket.io for real-time communication
- [ ] Shared cursors with user avatars and colors
- [ ] Live editing with Yjs CRDTs (conflict-free merge)
- [ ] Presence system (online/offline/away status)
- [ ] Activity feed (who changed what file)
- [ ] In-app text chat per project
- [ ] Collaborative agent sessions (all users see agent responses)
- [ ] Performance: Cursor updates < 100ms, message delivery < 500ms
- [ ] Supports 10+ concurrent users per project

### Technical Notes

**WebSocket Architecture:**

```
Client A ──┐
           ├──→ Socket.io Server ──→ Redis Adapter
Client B ──┤                             (Broadcasting)
           └──→ [Project Room]
Client C ──┘
```

**Yjs CRDT Integration:**

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const ytext = ydoc.getText('monaco');

// Bind Yjs to Monaco
const binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), provider.awareness);
```

**Cursor Sharing:**

```typescript
// Send cursor position
socket.emit('cursor:update', {
  userId: currentUser.id,
  position: { line: 10, column: 5 },
  selection: { start, end },
  color: userColor,
});

// Receive cursor updates
socket.on('cursor:update', (data) => {
  renderRemoteCursor(data);
});
```

**Presence:**

```typescript
{
  userId: "user-123",
  name: "Alice",
  avatar: "https://...",
  status: "online", // online, away, offline
  activeFile: "src/app/page.tsx",
  lastSeen: "2025-10-24T10:30:00Z"
}
```

### Out of Scope

- Video/voice chat (use external tools in v3.0)
- Screen sharing (future)
- Session recording/replay (future)
- Collaborative debugging (future)

---

## V3-E8: Migration & Compatibility 🔄

**Priority:** P0 (Critical)
**Effort:** 4 weeks
**Dependencies:** V3-E2 (Database Infrastructure)
**Status:** 📋 Planned

### Problem Statement

v2.0 users have existing projects with:

- YAML agent definitions
- File-based configuration
- Markdown state machine files
- Generated PRD/Epics/Stories

They need a smooth migration path to v3.0 without losing data.

### Epic Goal

Create an automated migration tool that converts v2.0 file-based data to v3.0 database format, with backward compatibility for exporting back to v2.0 format if needed.

### User Stories

- **V3-E8-S1:** As a v2.0 user, I want a one-click migration tool that converts my project to v3.0 so I can upgrade without manual work
- **V3-E8-S2:** As a cautious user, I want to export my v3.0 data back to v2.0 format so I can downgrade if something goes wrong
- **V3-E8-S3:** As a team lead, I want migration progress reports so I know if any data failed to migrate
- **V3-E8-S4:** As a user, I want my existing workflows to continue working in v3.0 so I don't lose productivity

### Acceptance Criteria

- [ ] Migration CLI command: `madace migrate v2-to-v3`
- [ ] Migrates: agents, configuration, state machine, stories
- [ ] Progress indicator with step-by-step feedback
- [ ] Validation report showing what was migrated
- [ ] Rollback capability if migration fails
- [ ] Export to v2.0 format: `madace export --format=v2`
- [ ] Documentation: Migration guide with troubleshooting
- [ ] Performance: Migration completes < 5 minutes for typical project

### Technical Notes

**Migration Steps:**

1. **Pre-flight checks**
   - Verify v2.0 installation valid
   - Check database connection
   - Create backup of v2.0 files

2. **Agent Migration**

   ```typescript
   // Read v2.0 agent YAMLs
   const agentFiles = glob('madace/*/agents/*.agent.yaml');
   for (const file of agentFiles) {
     const agent = yaml.parse(readFile(file));
     // Validate against v3 schema
     const validated = AgentSchema.parse(agent);
     // Insert into database
     await prisma.agent.create({ data: validated });
   }
   ```

3. **Config Migration**

   ```typescript
   // Read v2.0 config.yaml
   const config = yaml.parse(readFile('madace/core/config.yaml'));
   // Transform to v3 format
   for (const [key, value] of Object.entries(config)) {
     await prisma.configuration.create({
       data: { key, value: JSON.stringify(value) },
     });
   }
   ```

4. **State Machine Migration**

   ```typescript
   // Parse mam-workflow-status.md
   const statusFile = readFile('docs/mam-workflow-status.md');
   const stories = parseMarkdownStories(statusFile);
   // Insert into database
   for (const story of stories) {
     await prisma.story.create({ data: story });
   }
   ```

5. **Validation**
   - Count records in DB matches file count
   - Test loading agents
   - Test workflow execution
   - Generate migration report

**Export to v2.0:**

```bash
madace export --format=v2 --output=./madace-v2-backup
```

- Generates YAML agent files
- Generates config.yaml
- Generates mam-workflow-status.md
- Preserves all data for v2.0 compatibility

### Out of Scope

- Bi-directional sync (can't keep v2.0 and v3.0 in sync)
- Partial migration (must migrate entire project)
- Migration from v1.x (only v2.0 supported)

---

## V3-E9: Multi-User Authentication 🔐

**Priority:** P1 (High)
**Effort:** 3 weeks
**Dependencies:** V3-E2 (Database Infrastructure)
**Status:** 📋 Planned

### Problem Statement

v2.0 is single-user with no authentication:

- No user accounts or login
- No access control
- No audit trail of who did what
- Can't support team collaboration

### Epic Goal

Implement user authentication with NextAuth.js, supporting email/password and OAuth providers, with role-based access control.

### User Stories

- **V3-E9-S1:** As a new user, I want to create an account with email/password so I can access MADACE
- **V3-E9-S2:** As a user, I want to log in with Google/GitHub OAuth so I don't have to remember another password
- **V3-E9-S3:** As a project owner, I want to invite team members and assign roles (viewer, editor, admin) so I can control access
- **V3-E9-S4:** As an admin, I want to see an audit log of all actions so I can track who changed what

### Acceptance Criteria

- [ ] NextAuth.js integration with credential and OAuth providers
- [ ] User registration and login flows
- [ ] Password reset via email
- [ ] OAuth providers: Google, GitHub (minimum)
- [ ] Role-based access control (RBAC): Viewer, Editor, Admin
- [ ] Audit log for critical actions (agent create/delete, config changes)
- [ ] Session management with JWT tokens
- [ ] Security: Rate limiting, CSRF protection, password hashing (bcrypt)

### Technical Notes

**NextAuth.js Configuration:**

```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  providers: [
    CredentialsProvider({
      credentials: { email, password },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return user;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  database: process.env.DATABASE_URL,
  session: { strategy: 'jwt' },
});
```

**RBAC Roles:**

- **Viewer:** Read-only access to agents, workflows, stories
- **Editor:** Can create/edit agents, execute workflows, create stories
- **Admin:** Full access + user management + project settings

**Audit Log:**

```typescript
await prisma.auditLog.create({
  data: {
    userId: currentUser.id,
    action: 'agent.delete',
    resourceType: 'agent',
    resourceId: agentId,
    metadata: { agentName: 'PM' },
    timestamp: new Date(),
  },
});
```

### Out of Scope

- Two-factor authentication (2FA) - deferred to v3.1
- SAML/SSO integration - enterprise feature
- Fine-grained permissions (per-resource) - simple roles only

---

## V3-E10: Performance & Optimization ⚡

**Priority:** P1 (High)
**Effort:** 6 weeks
**Dependencies:** All other epics
**Status:** 📋 Planned

### Problem Statement

With database, real-time collaboration, and web IDE, v3.0 introduces performance challenges:

- Database queries can slow down with scale
- WebSocket connections consume resources
- Monaco Editor is heavy to load
- Concurrent users impact system performance

### Epic Goal

Optimize v3.0 for production performance, supporting 10+ concurrent users per project with sub-second response times.

### User Stories

- **V3-E10-S1:** As a user, I want the system to feel snappy (< 200ms responses) even with 10 people online so I stay productive
- **V3-E10-S2:** As a developer, I want the web IDE to load quickly (< 3s) so I don't wait
- **V3-E10-S3:** As a system admin, I want monitoring dashboards so I can identify bottlenecks
- **V3-E10-S4:** As a user, I want real-time updates without lag (< 100ms) so collaboration feels seamless

### Acceptance Criteria

- [ ] Database query p95 < 100ms
- [ ] API response time p95 < 200ms (excluding LLM)
- [ ] WebSocket message latency p95 < 100ms
- [ ] Monaco Editor load < 3s
- [ ] Supports 10+ concurrent users per project
- [ ] Memory usage < 2GB per instance
- [ ] CPU usage < 70% under load
- [ ] Monitoring: Prometheus + Grafana dashboard

### Optimization Strategies

**1. Database Optimization**

- Connection pooling (pg-pool with 20 connections)
- Query optimization (use EXPLAIN ANALYZE)
- Indexes on frequent queries
- Query result caching (Redis)
- Prepared statements for repeated queries

**2. Caching Layer**

```typescript
// Redis cache for agents
const cachedAgent = await redis.get(`agent:${agentId}`);
if (cachedAgent) return JSON.parse(cachedAgent);

const agent = await prisma.agent.findUnique({ where: { id: agentId } });
await redis.setex(`agent:${agentId}`, 3600, JSON.stringify(agent));
return agent;
```

**3. WebSocket Optimization**

- Redis adapter for Socket.io (multi-instance support)
- Throttle cursor updates (max 20 updates/second)
- Batch messages where possible
- Use binary protocol (WebSocket vs polling)

**4. Frontend Optimization**

- Code splitting (lazy load Monaco Editor)
- Tree shaking (reduce bundle size)
- CDN for static assets
- Service worker for offline caching

**5. Load Testing**

```bash
# Use k6 for load testing
k6 run --vus 50 --duration 5m load-test.js
```

### Technical Notes

**Monitoring Stack:**

- Prometheus: Metrics collection
- Grafana: Dashboards and alerting
- OpenTelemetry: Distributed tracing
- Winston: Application logging

**Key Metrics:**

- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Database query time
- WebSocket connection count
- Memory usage
- CPU usage

### Out of Scope

- Horizontal scaling (multiple instances) - defer to v3.x
- CDN integration - defer to v3.x
- Advanced caching strategies (CDN, edge caching)

---

## Appendix

### Epic Dependencies Graph

```
V3-E2 (Database)
  ├──→ V3-E1 (Dynamic Agents)
  ├──→ V3-E3 (Agent Memory)
  ├──→ V3-E4 (NLU)
  ├──→ V3-E5 (CLI Dashboard)
  ├──→ V3-E6 (Web IDE)
  │     └──→ V3-E7 (Real-Time Collab)
  ├──→ V3-E8 (Migration)
  └──→ V3-E9 (Authentication)

V3-E10 (Performance) ← [All Epics]
```

### Estimated Timeline (5-Person Team)

**Q1 2026 (Weeks 1-12):**

- V3-E2: Database Infrastructure (weeks 1-6)
- V3-E8: Migration & Compatibility (weeks 7-10)
- V3-E9: Multi-User Authentication (weeks 7-9)

**Q2 2026 (Weeks 13-24):**

- V3-E1: Dynamic Agent Management (weeks 13-20)
- V3-E5: Interactive CLI (weeks 13-16)
- V3-E3: Agent Memory (weeks 17-21)

**Q3 2026 (Weeks 25-36):**

- V3-E4: Conversational Interaction (weeks 25-30)
- V3-E6: Integrated Web IDE (weeks 25-32)

**Q4 2026 (Weeks 37-48):**

- V3-E7: Real-Time Collaboration (weeks 33-42)
- V3-E10: Performance & Optimization (weeks 43-48)

**Total: 48 weeks (12 months)**

---

**Document Status:** Draft for Review
**Next Steps:** Review epics → Prioritize → Create solution architecture

# Milestone 3.3: Conversational AI & NLU - Story Breakdown

**Milestone**: 3.3 - Conversational AI & NLU
**Priority**: P1 (High - UX Innovation)
**Timeline**: 4-6 weeks (Weeks 8-13)
**Total Points**: 55 points
**Status**: 📅 Planned

---

## Overview

This milestone transforms MADACE from a menu-driven system to a truly conversational AI platform. Users will be able to interact with agents using natural language, and agents will remember conversations and context across sessions.

**Key Innovation**: Natural language understanding (NLU) replaces rigid menu structures, enabling fluid conversation with AI agents.

**Target Users**: All users who prefer natural conversation over menu navigation

**Success Metrics**:

- 80% of interactions use conversational mode vs. menu mode
- NLU intent recognition accuracy > 85%
- Agent memory context retention > 80%
- Average conversation length increases by 3x

---

## Week 8-9: NLU Integration (23 points)

### [NLU-001] Integrate NLU Service and Intent Classification (13 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Integrate Dialogflow CX (Google) or Rasa Open Source for natural language understanding. Parse user input into actionable intents.

**Acceptance Criteria**:

- ✅ NLU service integrated (Dialogflow CX as primary, Rasa as fallback)
- ✅ Account setup and API keys configured
- ✅ Intent training data created (~20 core intents)
- ✅ Intent classification endpoint: `POST /api/v3/nlu/parse`
- ✅ Core intents recognized:
  - `create_agent` - "Create a new PM agent"
  - `run_workflow` - "Run the planning workflow"
  - `check_status` - "What's the project status?"
  - `list_agents` - "Show me all agents"
  - `edit_config` - "Change the API key"
  - `transition_story` - "Move story to IN PROGRESS"
  - `help` - "What can you do?"
  - `greeting` - "Hello", "Hi there"
  - `goodbye` - "Exit", "Bye"
  - And 11 more intents covering all MADACE actions
- ✅ Confidence threshold: Only act on intents with confidence > 70%
- ✅ Fallback to menu mode if confidence < 70%
- ✅ Context tracking across conversation turns

**Technical Details**:

- **NLU Service**: Dialogflow CX (Google Cloud)
  - Why: Enterprise-grade, good documentation, free tier (10K requests/month)
  - Alternative: Rasa Open Source (self-hosted, fully private)
- **Integration**: @google-cloud/dialogflow-cx npm package
- **Configuration**: Environment variables for project ID, location, agent ID
- **Training**: 5-10 example phrases per intent

**Intent Mapping**:

```typescript
// Core intent → MADACE action mapping
const INTENT_ACTIONS = {
  'create_agent': (params) => agentService.create(params),
  'run_workflow': (params) => workflowEngine.execute(params),
  'check_status': () => stateMachine.getStatus(),
  'list_agents': (params) => agentService.list(params),
  'edit_config': (params) => configService.set(params.key, params.value),
  // ... 15 more mappings
};
```

**Implementation Steps**:

1. Create Google Cloud project and enable Dialogflow CX API
2. Install @google-cloud/dialogflow-cx package
3. Create `lib/nlu/dialogflow-client.ts` - NLU client wrapper
4. Create `lib/nlu/intent-handler.ts` - Maps intents to actions
5. Create `app/api/v3/nlu/parse/route.ts` - Parse endpoint
6. Train Dialogflow agent with 20 intents (100+ training phrases total)
7. Implement confidence threshold logic
8. Implement fallback to menu mode
9. Write unit tests for intent parsing
10. Write integration tests with mock NLU responses

**Files to Create/Modify**:

- `lib/nlu/dialogflow-client.ts` (new) - Dialogflow CX client
- `lib/nlu/intent-handler.ts` (new) - Intent → Action mapper
- `lib/nlu/types.ts` (new) - NLU interfaces
- `app/api/v3/nlu/parse/route.ts` (new) - Parse API endpoint
- `.env.example` (modify) - Add Dialogflow credentials
- `__tests__/lib/nlu/dialogflow-client.test.ts` (new) - NLU tests

**Definition of Done**:

- Dialogflow CX configured and tested
- 20 intents recognized with > 85% accuracy
- Parse endpoint returns intent + confidence + parameters
- Fallback logic tested and working
- Documentation added to `docs/NLU-GUIDE.md`

---

### [NLU-002] Entity Extraction and Parameter Binding (10 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Extract entities from user input (agent names, story IDs, file paths, etc.) and bind them to intent parameters.

**Acceptance Criteria**:

- ✅ Entity types defined in Dialogflow:
  - `@agent` - Agent names (PM, Analyst, Architect, SM, DEV, custom)
  - `@workflow` - Workflow names (planning, assessment, etc.)
  - `@story` - Story IDs ([PLAN-001], [DB-005], etc.)
  - `@state` - State names (BACKLOG, TODO, IN_PROGRESS, DONE)
  - `@file_path` - File paths (relative or absolute)
  - `@config_key` - Configuration keys (project_name, llm.provider, etc.)
  - `@number` - Numbers for points, counts, etc.
  - `@date` - Dates for deadlines, timestamps
- ✅ Entity extraction works for all intents
- ✅ Parameters automatically bound to intent handler
- ✅ Validation: Entity values are valid (agent exists, story ID format correct)
- ✅ Fuzzy matching for agent names ("project manager" → "PM")
- ✅ Multiple entities per utterance ("Run planning workflow with PM agent")
- ✅ Entity synonyms configured (e.g., "analyst" = "business analyst")

**Technical Details**:

- **Entity Sources**:
  - Static entities defined in Dialogflow (states, known workflows)
  - Dynamic entities fetched from database (agent list, story IDs)
  - Fuzzy matching with fuse.js for typo tolerance
- **Parameter Validation**:
  - Check agent exists in database before creating task
  - Validate story ID format matches MADACE convention
  - Ensure file paths are within project boundaries

**Example Utterances with Entities**:

```
User: "Create a new architect agent"
Intent: create_agent
Entities: { agentType: "architect" }

User: "Move story DB-005 to IN PROGRESS"
Intent: transition_story
Entities: { storyId: "DB-005", newState: "IN_PROGRESS" }

User: "Run the planning workflow with PM agent on docs folder"
Intent: run_workflow
Entities: { workflow: "planning", agent: "PM", path: "docs" }
```

**Implementation Steps**:

1. Define all entity types in Dialogflow CX
2. Create entity synonym lists (architect = ["architect", "architecture agent", "tech lead"])
3. Implement dynamic entity fetching from database
4. Create `lib/nlu/entity-validator.ts` - Validation logic
5. Add fuzzy matching for entity resolution
6. Update intent handler to accept validated entities
7. Write tests for entity extraction
8. Write tests for validation logic

**Files to Create/Modify**:

- `lib/nlu/entity-validator.ts` (new) - Entity validation
- `lib/nlu/entity-resolver.ts` (new) - Fuzzy entity matching
- `lib/nlu/intent-handler.ts` (modify) - Add entity binding
- `__tests__/lib/nlu/entity-validator.test.ts` (new) - Validator tests

**Definition of Done**:

- 8 entity types defined and working
- Entity extraction accuracy > 90%
- Validation prevents invalid entities
- Fuzzy matching handles typos gracefully
- Tests cover all entity types

---

## Week 10-11: Chat Interface (18 points)

### [CHAT-001] Build Chat UI for Web and CLI (10 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Create conversational chat interface in both Web UI and CLI for natural agent interaction.

**Acceptance Criteria**:

**Web UI**:

- ✅ Chat component at `/chat` route
- ✅ Conversation layout: User messages (right), Agent messages (left)
- ✅ Message bubbles with avatars (user photo, agent icon)
- ✅ Message timestamps ("2 minutes ago")
- ✅ Typing indicator when agent is "thinking"
- ✅ Send button + Enter key to submit
- ✅ Auto-scroll to latest message
- ✅ Responsive design (mobile-friendly)

**CLI**:

- ✅ `madace chat <agent-name>` launches chat mode
- ✅ Chat prompt: `You → ` for user input
- ✅ Agent responses with formatted output
- ✅ Type `/exit` to leave chat mode
- ✅ Chat history visible (last 10 messages)
- ✅ Multi-line input support (same as REPL)

**Common Features**:

- ✅ Real-time message streaming (agent responses appear word-by-word)
- ✅ Message persistence (saved to database)
- ✅ Session management (each chat = new session)
- ✅ Agent selection (choose which agent to chat with)
- ✅ Context retention within session

**Technical Details**:

- **Web UI Stack**:
  - React component: `components/features/chat/ChatInterface.tsx`
  - Message component: `components/features/chat/Message.tsx`
  - Input component: `components/features/chat/ChatInput.tsx`
  - State management: React useState or Zustand
  - Streaming: Server-Sent Events (SSE) or WebSocket
- **CLI Stack**:
  - inquirer for chat input
  - chalk for colored output (user = blue, agent = green)
  - Stream response with loading spinner
- **Database**:
  - New table: `ChatMessage` (id, sessionId, role, content, timestamp)
  - New table: `ChatSession` (id, userId, agentId, startedAt, endedAt)

**Implementation Steps**:

1. Design Prisma schema for ChatMessage and ChatSession
2. Run migration: `npx prisma migrate dev --name add-chat-tables`
3. Create `lib/services/chat-service.ts` - Chat CRUD operations
4. Create Web UI chat components
5. Create CLI chat mode in `lib/cli/commands/chat.ts`
6. Implement message streaming (SSE)
7. Add agent selection UI/CLI
8. Write tests for chat service
9. Write tests for chat UI interactions

**Files to Create/Modify**:

- `prisma/schema.prisma` (modify) - Add ChatMessage, ChatSession models
- `lib/services/chat-service.ts` (new) - Chat operations
- `components/features/chat/ChatInterface.tsx` (new) - Web chat UI
- `components/features/chat/Message.tsx` (new) - Message component
- `components/features/chat/ChatInput.tsx` (new) - Input component
- `app/chat/page.tsx` (new) - Chat page
- `app/api/v3/chat/route.ts` (new) - Chat API endpoint
- `app/api/v3/chat/stream/route.ts` (new) - Streaming endpoint
- `lib/cli/commands/chat.ts` (new) - CLI chat mode
- `bin/madace.ts` (modify) - Add `chat` command
- `__tests__/lib/services/chat-service.test.ts` (new) - Chat service tests
- `__tests__/components/chat/ChatInterface.test.tsx` (new) - UI tests

**Definition of Done**:

- Chat UI functional in browser
- CLI chat mode working
- Message streaming implemented
- Messages persist to database
- Tests pass (> 80% coverage)
- Documentation added to `docs/CHAT-GUIDE.md`

---

### [CHAT-002] Add Message History and Threading (5 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Display full conversation history and support message threading (quote/reply).

**Acceptance Criteria**:

- ✅ **Message History**:
  - Web UI: Infinite scroll loads older messages (paginated)
  - CLI: `madace chat history` shows last 50 messages
  - Filter by agent: `madace chat history --agent=PM`
  - Filter by date: `madace chat history --since="2025-10-01"`
- ✅ **Message Threading**:
  - Quote message by clicking "Reply" button (Web UI)
  - Quote message with `/quote <message-id>` (CLI)
  - Threaded messages show indentation
  - Quote text appears above new message
- ✅ **Search**:
  - Search message history: `madace chat search "API error"`
  - Full-text search with keyword highlighting
- ✅ **Export**:
  - Export conversation as Markdown: `madace chat export --session=<id> --output=chat.md`
  - Include timestamps, agent names, message content

**Technical Details**:

- **Pagination**: Load 20 messages at a time (Web UI)
- **Threading**: Store `replyToId` field in ChatMessage model
- **Search**: Full-text search on `content` field (Prisma query or PostgreSQL FTS)
- **Export**: Handlebars template for Markdown generation

**Implementation Steps**:

1. Add pagination to chat service (offset/limit)
2. Add `replyToId` field to ChatMessage model
3. Implement infinite scroll in Web UI
4. Implement threading UI (reply button, indentation)
5. Create search endpoint: `GET /api/v3/chat/search?q=<query>`
6. Create export endpoint: `GET /api/v3/chat/export/:sessionId`
7. Add CLI commands: `history`, `search`, `export`
8. Write tests for pagination, threading, search

**Files to Create/Modify**:

- `prisma/schema.prisma` (modify) - Add `replyToId` to ChatMessage
- `lib/services/chat-service.ts` (modify) - Add pagination, search, export
- `components/features/chat/ChatInterface.tsx` (modify) - Add infinite scroll
- `components/features/chat/Message.tsx` (modify) - Add reply button
- `app/api/v3/chat/search/route.ts` (new) - Search endpoint
- `app/api/v3/chat/export/[sessionId]/route.ts` (new) - Export endpoint
- `lib/cli/commands/chat.ts` (modify) - Add history, search, export commands
- `lib/templates/chat-export.hbs` (new) - Markdown export template
- `__tests__/lib/services/chat-service.test.ts` (modify) - Test new features

**Definition of Done**:

- Message history loads with pagination
- Threading works (reply to specific messages)
- Search returns relevant messages
- Export generates Markdown file
- CLI commands functional
- Tests cover all new features

---

### [CHAT-003] Add Markdown Rendering and Code Highlighting (3 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Render Markdown formatting and syntax-highlighted code blocks in chat messages.

**Acceptance Criteria**:

- ✅ **Markdown Support**:
  - Bold, italic, strikethrough (`**bold**`, `*italic*`, `~~strike~~`)
  - Headers (`# H1`, `## H2`, etc.)
  - Lists (ordered, unordered)
  - Links (`[text](url)`)
  - Images (`![alt](url)`)
  - Blockquotes (`> quote`)
- ✅ **Code Highlighting**:
  - Inline code: `` `code` ``
  - Code blocks with language: ` ```typescript ... ``` `
  - Syntax highlighting for 20+ languages (TypeScript, Python, JavaScript, Rust, Go, etc.)
  - Line numbers for code blocks
  - Copy button for code blocks
- ✅ **Security**:
  - Sanitize HTML to prevent XSS attacks
  - Only allow safe Markdown tags
- ✅ **CLI**:
  - Markdown rendered with chalk colors (limited)
  - Code blocks with syntax highlighting (limited - no colors in most terminals)

**Technical Details**:

- **Web UI Libraries**:
  - Markdown: `react-markdown` or `marked`
  - Syntax highlighting: `highlight.js` or `prism.js`
  - Sanitization: `dompurify` or `sanitize-html`
- **CLI Libraries**:
  - Markdown: `marked-terminal` (renders Markdown in terminal)
  - Syntax highlighting: `chalk-syntax` or limited colors

**Implementation Steps**:

1. Install react-markdown and highlight.js
2. Create `components/features/chat/MarkdownMessage.tsx` - Markdown renderer
3. Add code block component with copy button
4. Configure sanitization rules (whitelist tags)
5. Add syntax highlighting for CLI with chalk
6. Write tests for Markdown rendering
7. Write tests for XSS prevention

**Files to Create/Modify**:

- `components/features/chat/MarkdownMessage.tsx` (new) - Markdown renderer
- `components/features/chat/CodeBlock.tsx` (new) - Code block with copy button
- `components/features/chat/Message.tsx` (modify) - Use MarkdownMessage
- `lib/cli/markdown-renderer.ts` (new) - CLI Markdown rendering
- `lib/cli/commands/chat.ts` (modify) - Use CLI Markdown renderer
- `__tests__/components/chat/MarkdownMessage.test.tsx` (new) - Markdown tests

**Definition of Done**:

- Markdown renders correctly in Web UI
- Code blocks have syntax highlighting
- Copy button works for code blocks
- XSS protection tested and working
- CLI shows basic Markdown formatting
- Tests pass

---

## Week 12-13: Agent Memory (14 points)

### [MEMORY-001] Implement Persistent Agent Memory (8 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Enable agents to remember user conversations, preferences, and project context across sessions.

**Acceptance Criteria**:

- ✅ Database table: `AgentMemory` (already exists in schema from Milestone 3.1)
- ✅ Memory types:
  - **Short-term**: Current session only (cleared on exit)
  - **Long-term**: Persistent across sessions (stored in DB)
- ✅ Memory storage:
  - User preferences (preferred language, communication style)
  - Project context (current story, active workflows)
  - Conversation summaries (key points from past chats)
  - User-specific facts ("My name is Alex", "I work on Next.js projects")
- ✅ Memory retrieval:
  - Agents automatically load memory before responding
  - Memory injected into LLM system prompt as context
  - Most recent memories prioritized (last 30 days)
- ✅ Memory pruning:
  - Old memories auto-deleted after 90 days
  - Low-importance memories deleted first
  - User can manually clear all memory

**Technical Details**:

- **Memory Structure** (JSON in `AgentMemory.context` field):
  ```json
  {
    "type": "long-term",
    "category": "user_preference",
    "key": "communication_style",
    "value": "concise",
    "importance": 8,
    "source": "inferred_from_chat",
    "createdAt": "2025-10-29T10:00:00Z",
    "lastAccessedAt": "2025-10-29T15:00:00Z"
  }
  ```
- **Importance Scoring**: 1-10 scale
  - 10 = Critical (user name, project name)
  - 7-9 = High (preferences, key decisions)
  - 4-6 = Medium (conversation context)
  - 1-3 = Low (trivial facts)
- **Pruning Strategy**:
  - Delete memories with importance < 5 after 30 days
  - Delete memories with importance < 7 after 90 days
  - Keep importance >= 7 indefinitely (or until user clears)

**Implementation Steps**:

1. Verify `AgentMemory` table exists (from Milestone 3.1)
2. Create `lib/services/memory-service.ts` - Memory CRUD operations
3. Implement memory storage: `saveMemory(agentId, userId, context)`
4. Implement memory retrieval: `getMemories(agentId, userId, limit)`
5. Implement memory injection into LLM prompts
6. Implement importance scoring algorithm
7. Implement pruning cron job (runs daily)
8. Create API endpoints: `POST /api/v3/agents/:id/memory`, `GET /api/v3/agents/:id/memory`
9. Write tests for memory service
10. Write tests for pruning logic

**Files to Create/Modify**:

- `lib/services/memory-service.ts` (new) - Memory operations
- `lib/services/memory-pruner.ts` (new) - Pruning logic
- `app/api/v3/agents/[id]/memory/route.ts` (new) - Memory API
- `lib/llm/prompt-builder.ts` (modify) - Inject memory into prompts
- `lib/cron/memory-pruner.ts` (new) - Daily pruning cron
- `__tests__/lib/services/memory-service.test.ts` (new) - Memory tests
- `__tests__/lib/services/memory-pruner.test.ts` (new) - Pruning tests

**Definition of Done**:

- Agents save memories during conversations
- Agents retrieve memories before responding
- Memory context injected into LLM prompts
- Pruning removes old/unimportant memories
- API endpoints functional
- Tests pass (> 80% coverage)

---

### [MEMORY-002] Add Memory Management UI (3 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Allow users to view, edit, and delete agent memories.

**Acceptance Criteria**:

- ✅ **Web UI: Memory Dashboard** (`/agents/:id/memory`):
  - List all memories for selected agent
  - Filter by type (short-term, long-term)
  - Filter by category (user_preference, project_context, conversation_summary, user_fact)
  - Sort by importance, date, last accessed
  - Search memories by keyword
  - Delete individual memories (trash icon)
  - Clear all memories (red button with confirmation)
- ✅ **Memory Viewer**:
  - Show memory details: key, value, importance, category, source, timestamps
  - Edit memory importance (1-10 slider)
  - View memory access history (when was it used?)
- ✅ **CLI Commands**:
  - `madace memory list --agent=PM` - List memories
  - `madace memory show <memory-id>` - Show memory details
  - `madace memory delete <memory-id>` - Delete memory
  - `madace memory clear --agent=PM` - Clear all agent memories (with confirmation)
- ✅ **Privacy**:
  - Users can only see/manage their own memories
  - Agents cannot access other users' memories

**Technical Details**:

- **UI Component**: `components/features/memory/MemoryDashboard.tsx`
- **API Endpoints**:
  - `GET /api/v3/agents/:id/memory` - List memories (already created in MEMORY-001)
  - `PUT /api/v3/agents/:id/memory/:memoryId` - Update memory
  - `DELETE /api/v3/agents/:id/memory/:memoryId` - Delete memory
  - `DELETE /api/v3/agents/:id/memory` - Clear all memories

**Implementation Steps**:

1. Create `components/features/memory/MemoryDashboard.tsx` - Memory list UI
2. Create `components/features/memory/MemoryCard.tsx` - Single memory card
3. Create `app/agents/[id]/memory/page.tsx` - Memory page route
4. Add update/delete endpoints
5. Create CLI commands in `lib/cli/commands/memory.ts`
6. Add confirmation dialogs for destructive actions
7. Write tests for memory UI
8. Write tests for CLI commands

**Files to Create/Modify**:

- `components/features/memory/MemoryDashboard.tsx` (new) - Memory dashboard
- `components/features/memory/MemoryCard.tsx` (new) - Memory card component
- `app/agents/[id]/memory/page.tsx` (new) - Memory page
- `app/api/v3/agents/[id]/memory/[memoryId]/route.ts` (new) - Update/delete endpoints
- `lib/cli/commands/memory.ts` (new) - CLI memory commands
- `bin/madace.ts` (modify) - Add `memory` command
- `__tests__/components/memory/MemoryDashboard.test.tsx` (new) - UI tests
- `__tests__/lib/cli/commands/memory.test.ts` (new) - CLI tests

**Definition of Done**:

- Memory dashboard displays all memories
- Users can filter, search, and sort memories
- Users can delete individual or all memories
- CLI commands work for memory management
- Tests pass
- Documentation added to `docs/MEMORY-GUIDE.md`

---

### [MEMORY-003] Memory-Aware Agent Responses (3 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Ensure agents use memory context to provide personalized, context-aware responses.

**Acceptance Criteria**:

- ✅ Memory automatically loaded when agent generates response
- ✅ Memory context added to LLM system prompt:
  ```
  You are the PM Agent. Here's what you remember about this user:
  - Name: Alex
  - Preferred communication style: Concise
  - Current project: E-commerce platform
  - Recent conversation: Discussed database schema yesterday
  - Tech stack preference: Next.js, PostgreSQL
  ```
- ✅ Agents reference memory in responses:
  - "As we discussed yesterday, the database schema..."
  - "I know you prefer concise responses, so..."
  - "Based on your Next.js background..."
- ✅ Memory updated during conversations:
  - New facts learned: "User is working on authentication"
  - Preferences inferred: "User prefers code examples over theory"
  - Project context updated: "Current focus: API design"
- ✅ Memory importance automatically adjusted:
  - Frequently accessed memories get higher importance
  - Unused memories get lower importance over time
- ✅ Memory usage tracked:
  - `lastAccessedAt` timestamp updated when memory is used
  - `accessCount` incremented

**Technical Details**:

- **Prompt Builder**: `lib/llm/prompt-builder.ts`
  - Loads memories before generating prompt
  - Formats memories as natural language context
  - Limits context to 1000 tokens (to avoid exceeding LLM limits)
- **Memory Extraction**: Parse agent responses to extract new facts
  - Example: User says "I'm building an e-commerce site" → Save as user_fact
- **Importance Adjustment**: Decay algorithm
  - `newImportance = oldImportance * (accessCount / daysSinceCreation)`

**Implementation Steps**:

1. Modify `lib/llm/prompt-builder.ts` to load memories
2. Format memories as natural language for LLM prompt
3. Implement memory extraction from user messages
4. Implement importance decay algorithm
5. Update memory service to track access count
6. Write tests for memory-aware responses
7. Write tests for memory extraction
8. Write tests for importance adjustment

**Files to Create/Modify**:

- `lib/llm/prompt-builder.ts` (modify) - Add memory loading
- `lib/services/memory-service.ts` (modify) - Add importance adjustment
- `lib/nlu/memory-extractor.ts` (new) - Extract facts from messages
- `__tests__/lib/llm/prompt-builder.test.ts` (modify) - Test memory injection
- `__tests__/lib/nlu/memory-extractor.test.ts` (new) - Test extraction

**Definition of Done**:

- Agents load memory before responding
- Memory context added to LLM prompts
- Agents reference past conversations
- New facts automatically saved to memory
- Memory importance adjusts based on usage
- Tests pass

---

## Summary

**Total Stories**: 9 stories
**Total Points**: 55 points

**Week 8-9 (NLU Integration)**: 23 points

- [NLU-001] Integrate NLU service and intent classification (13 points)
- [NLU-002] Entity extraction and parameter binding (10 points)

**Week 10-11 (Chat Interface)**: 18 points

- [CHAT-001] Build chat UI for Web and CLI (10 points)
- [CHAT-002] Add message history and threading (5 points)
- [CHAT-003] Add Markdown rendering and code highlighting (3 points)

**Week 12-13 (Agent Memory)**: 14 points

- [MEMORY-001] Implement persistent agent memory (8 points)
- [MEMORY-002] Add memory management UI (3 points)
- [MEMORY-003] Memory-aware agent responses (3 points)

**Estimated Timeline**: 4-6 weeks (28-42 days)

**Key Dependencies**:

- Milestone 3.1 complete (database with AgentMemory table)
- Milestone 3.2 complete (CLI with chat command foundation)
- Google Cloud account (for Dialogflow CX) OR self-hosted Rasa
- OpenAI/Gemini API keys for LLM responses

**Success Criteria**:

- NLU intent recognition accuracy > 85%
- Chat interface functional in Web and CLI
- Agents remember context across sessions
- 80% of users prefer conversational mode over menus
- Comprehensive test coverage (> 80%)
- Complete documentation with tutorials

---

**Technical Architecture Notes**:

**NLU Flow**:
```
User Input → NLU Service (Dialogflow) → Intent + Entities + Confidence
          ↓
[If confidence > 70%]
          ↓
Intent Handler → Action → Response
          ↓
[If confidence < 70%]
          ↓
Fallback to Menu Mode
```

**Memory Flow**:
```
User Message → Memory Extractor → New Facts
                               ↓
                         Save to Database
                               ↓
Agent Response ← LLM ← Prompt Builder ← Load Memories
```

**Chat Architecture**:
```
Web UI → ChatInput → POST /api/v3/chat → Chat Service → LLM
                                              ↓
                                        Save to Database
                                              ↓
CLI ← Format Response ← SSE Stream ← Response ← Web UI
```

---

**Next Steps**:

1. Update `docs/workflow-status.md` with these stories
2. Move [NLU-001] to TODO
3. Begin implementation of NLU integration
4. Set up Dialogflow CX account

**Release Target**: v3.3-alpha (Conversational AI & NLU)

---

**Last Updated**: 2025-10-29 by Claude Code (MADACE PM Agent)
**Status**: 📅 Ready for Implementation

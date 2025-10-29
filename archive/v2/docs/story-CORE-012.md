# Story: [CORE-012] Agent Runtime

**Status**: IN PROGRESS
**Points**: 8
**Module**: Core Infrastructure
**Dependencies**: Agent Loader (CORE-011), Template Engine (CORE-014), LLM Client (LLM-013)

---

## Overview

Implement the Agent Runtime system that executes MADACE agents with LLM integration. The runtime should handle agent initialization, context management, prompt rendering, menu action execution, and conversation management.

---

## Acceptance Criteria

### 1. Agent Runtime Core (lib/agents/runtime.ts)

- [ ] **AgentRuntime class** with execution capabilities
  - `initialize(agentName: string): Promise<void>` - Load and initialize agent
  - `execute(userInput: string): Promise<AgentResponse>` - Execute agent with user input
  - `executeAction(actionName: string, params?: Record<string, unknown>): Promise<AgentResponse>` - Execute menu action
  - `getContext(): AgentContext` - Get current execution context
  - `reset(): void` - Reset agent state

- [ ] **Conversation management**
  - Track conversation history
  - Maintain context across multiple interactions
  - Support context injection from files (load_always)

- [ ] **Prompt rendering**
  - Use template engine for dynamic prompts
  - Inject agent persona and context
  - Support standard MADACE variables

### 2. Agent Context (lib/agents/context.ts)

- [ ] **AgentContext interface**

  ```typescript
  interface AgentContext {
    // Agent metadata
    agent: Agent;
    agentName: string;

    // Configuration
    config: MADACEConfig;

    // Conversation state
    conversationHistory: ConversationMessage[];
    currentAction?: string;

    // Loaded files (from load_always)
    loadedFiles: Map<string, string>;

    // Runtime state
    state: Record<string, unknown>;
  }
  ```

- [ ] **Context builder**
  - Load configuration from config.yaml
  - Load always-required files
  - Build template context with all variables

### 3. Conversation Management (lib/agents/conversation.ts)

- [ ] **ConversationMessage interface**

  ```typescript
  interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    action?: string;
  }
  ```

- [ ] **ConversationManager class**
  - Add messages to history
  - Get formatted history for LLM
  - Limit history to token budget
  - Save/load conversation state

### 4. Action Handlers (lib/agents/actions.ts)

- [ ] **ActionHandler interface**

  ```typescript
  interface ActionHandler {
    name: string;
    description: string;
    execute(context: AgentContext, params?: Record<string, unknown>): Promise<ActionResult>;
  }
  ```

- [ ] **Built-in action types**
  - `workflow:{name}` - Execute workflow
  - `template:{name}` - Render template
  - `file:read:{path}` - Read file
  - `file:write:{path}` - Write file
  - Custom action handlers

### 5. Response Formatting (lib/agents/response.ts)

- [ ] **AgentResponse interface**

  ```typescript
  interface AgentResponse {
    success: boolean;
    message: string;
    data?: unknown;
    action?: string;
    suggestions?: string[];
    error?: Error;
  }
  ```

- [ ] **Response formatter**
  - Format LLM responses
  - Extract action suggestions
  - Handle errors gracefully

### 6. Integration

- [ ] **LLM integration**
  - Use LLMClient from lib/llm/
  - Build system prompt from agent persona
  - Pass conversation history
  - Stream responses (optional)

- [ ] **Template integration**
  - Use TemplateEngine for prompts
  - Render agent persona with context
  - Support dynamic variable injection

- [ ] **Configuration integration**
  - Load from lib/config/
  - Validate agent requirements
  - Support environment variables

### 7. Testing & Quality

- [ ] **All TypeScript checks pass**

  ```bash
  npm run type-check
  npm run lint
  npm run format:check
  npm run build
  ```

- [ ] **Manual testing**
  - Initialize agent
  - Execute simple prompts
  - Execute menu actions
  - Verify context persistence
  - Test error handling

---

## Technical Design

### Architecture

```
AgentRuntime
  ├── Agent (from loader)
  ├── AgentContext
  │   ├── Configuration
  │   ├── Loaded Files
  │   └── Conversation History
  ├── ConversationManager
  ├── ActionHandlers
  │   ├── WorkflowHandler
  │   ├── TemplateHandler
  │   └── FileHandler
  ├── TemplateEngine
  └── LLMClient
```

### Execution Flow

```
1. User Input
   ↓
2. AgentRuntime.execute()
   ↓
3. Build Context
   ↓
4. Render System Prompt (Template Engine)
   ↓
5. Add to Conversation History
   ↓
6. Call LLM (LLMClient)
   ↓
7. Process Response
   ↓
8. Extract Actions
   ↓
9. Execute Actions (ActionHandlers)
   ↓
10. Return AgentResponse
```

### Usage Examples

```typescript
// Initialize agent runtime
import { createAgentRuntime } from '@/lib/agents';

const runtime = createAgentRuntime();
await runtime.initialize('sm'); // Load Scrum Master agent

// Execute user input
const response = await runtime.execute('Show me the workflow status');
console.log(response.message);

// Execute menu action
const statusResponse = await runtime.executeAction('workflow-status');
console.log(statusResponse.data);

// Get current context
const context = runtime.getContext();
console.log(context.conversationHistory);

// Reset for new conversation
runtime.reset();
```

### File Structure

```
lib/agents/
├── index.ts              # Public exports ✅
├── loader.ts             # AgentLoader ✅
├── schema.ts             # Zod schemas ✅
├── runtime.ts            # AgentRuntime class (NEW)
├── context.ts            # AgentContext builder (NEW)
├── conversation.ts       # ConversationManager (NEW)
├── actions.ts            # ActionHandlers (NEW)
├── response.ts           # Response formatting (NEW)
├── types.ts              # Runtime types (NEW)
└── README.md             # Existing docs ✅
```

---

## Dependencies

- `lib/agents/loader.ts` - Load agent definitions ✅
- `lib/templates/` - Template rendering ✅
- `lib/llm/` - LLM client ✅
- `lib/config/` - Configuration loading ✅

---

## Implementation Plan

### Phase 1: Core Types & Context (25 min)

1. Create `types.ts` with runtime interfaces
2. Create `context.ts` with AgentContext builder
3. Implement file loading (load_always)
4. Build template context

### Phase 2: Conversation Management (20 min)

5. Create `conversation.ts` with ConversationManager
6. Implement message history tracking
7. Add conversation formatting for LLM
8. Implement token budget limiting

### Phase 3: Response & Actions (25 min)

9. Create `response.ts` with response formatting
10. Create `actions.ts` with ActionHandler interface
11. Implement basic action handlers (workflow, template, file)
12. Add action extraction from responses

### Phase 4: Agent Runtime (30 min)

13. Create `runtime.ts` with AgentRuntime class
14. Implement initialize() and execute()
15. Integrate LLM client
16. Add error handling

### Phase 5: Testing & Integration (20 min)

17. Update `index.ts` with public exports
18. Test with real agent (SM)
19. Run all quality checks
20. Update documentation

**Total Estimated Time**: ~120 minutes

---

## Testing Strategy

### Unit Tests (Future)

- Agent initialization
- Context building
- Conversation management
- Action execution
- Response formatting

### Integration Tests (Manual)

- Load SM agent
- Execute workflow-status action
- Verify context persistence
- Test error scenarios

### Edge Cases

- Agent not found
- Invalid action
- LLM timeout
- Missing configuration
- File loading errors

---

## Risks & Mitigations

| Risk                         | Impact | Mitigation                              |
| ---------------------------- | ------ | --------------------------------------- |
| LLM integration complexity   | High   | Start with simple prompts, iterate      |
| Context size limits          | Medium | Implement conversation history trimming |
| Action handler extensibility | Medium | Use plugin pattern for custom actions   |
| File loading performance     | Low    | Cache loaded files in context           |

---

## Success Metrics

- ✅ All quality checks pass (type-check, lint, format, build)
- ✅ Can initialize and execute agent
- ✅ LLM integration works correctly
- ✅ Conversation history maintained
- ✅ Menu actions execute successfully
- ✅ Error handling robust

---

## Related Stories

- **[CORE-011] Agent Loader** - Provides agent definitions ✅
- **[CORE-014] Template Engine** - Renders prompts ✅
- **[LLM-013] Multi-provider LLM client** - LLM integration ✅
- **[CORE-013] Workflow Engine** - Will use agent runtime
- **[CORE-015] State Machine** - Will use agent runtime

---

## Notes

- Agent runtime is the foundation for all agent interactions
- Conversation management crucial for multi-turn dialogs
- Action handlers enable workflow execution
- Consider adding telemetry/logging for debugging

---

**Story created**: 2025-10-22
**Story started**: 2025-10-22
**Story completed**: _In Progress_

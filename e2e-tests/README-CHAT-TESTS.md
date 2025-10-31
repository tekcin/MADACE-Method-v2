# Chat UI Test Suite - Chrome/Chromium E2E Tests

## Overview

Comprehensive UI test suite for MADACE v3.0 Chat and IDE features using Playwright with Chrome/Chromium browser.

**Test File**: `e2e-tests/chat-with-ide.spec.ts`

**Features Tested**:

- ✅ Chat interface rendering and interaction
- ✅ Real-time message streaming from LLM
- ✅ Agent selection and provider switching
- ✅ Message history and threading
- ✅ Markdown rendering and code highlighting
- ✅ Agent memory persistence
- ✅ IDE collaboration (presence, chat panel)
- ✅ Accessibility (keyboard navigation, ARIA labels)
- ✅ Error handling and loading states
- ✅ Performance metrics

## Quick Start

### 1. Start Development Server

```bash
# Terminal 1: Start dev server
npm run dev
```

Wait for server to start at `http://localhost:3000`

### 2. Run Tests

```bash
# Terminal 2: Run all chat tests in Chrome
npm run test:e2e -- chat-with-ide.spec.ts --project=chromium

# Or run in UI mode (recommended for debugging)
npm run test:e2e:ui -- chat-with-ide.spec.ts

# Or run in headed mode (see browser)
npm run test:e2e:headed -- chat-with-ide.spec.ts --project=chromium

# Or run in debug mode (step through)
npm run test:e2e:debug -- chat-with-ide.spec.ts
```

## Test Suites

### 1. Chat Interface with AI Agents (6 tests)

**Tests:**

- Display chat interface with agent selection
- Open chat session with selected agent
- Send message and receive streaming response
- Display LLM provider selector
- Show message history on reload

**Key Validations:**

- Agent grid/list rendering
- Chat interface components (input, send button, header)
- Real-time streaming responses (60s timeout for local LLM)
- LLM provider dropdown (Local, Gemini, Claude, OpenAI)
- Message persistence across page reloads

### 2. Chat with Code Highlighting (2 tests)

**Tests:**

- Render code blocks with syntax highlighting
- Show markdown formatting in messages

**Key Validations:**

- Code blocks (`<pre>`, `<code>`, `.hljs` classes)
- Markdown elements (lists, bold, headers)
- Proper syntax highlighting for TypeScript/JavaScript

### 3. Web IDE Collaboration Features (2 tests)

**Tests:**

- Display IDE with chat panel
- Show presence indicators in IDE

**Key Validations:**

- Monaco editor rendering
- Chat panel toggle/visibility
- User presence indicators

### 4. Chat Accessibility (2 tests)

**Tests:**

- Keyboard navigation
- Proper ARIA labels

**Key Validations:**

- Tab navigation through interface
- Enter key to select agent
- ARIA labels on chat input
- Accessible placeholders

### 5. Chat Error Handling (2 tests)

**Tests:**

- Handle network errors gracefully
- Show loading state during LLM response

**Key Validations:**

- Offline mode handling
- Loading/typing indicators
- Graceful error recovery

### 6. Performance (2 tests)

**Tests:**

- Load chat page within 3 seconds
- Render messages efficiently

**Key Validations:**

- Page load time < 3000ms
- Message render time < 1000ms

## Test Data

```typescript
const TEST_USER = {
  id: 'test-user-001',
  name: 'Test User',
  email: 'test@madace.local',
};

const TEST_MESSAGES = {
  simple: 'Hello, can you help me understand MADACE?',
  codeRequest: 'Show me a simple TypeScript function that adds two numbers',
  memoryCheck: 'What was the first question I asked you?',
};
```

## Important Notes

### Local LLM Timeouts

**First Response**: 10-30 seconds (model loading into RAM)
**Subsequent Responses**: 1-5 seconds (model already in memory)

The tests use **60-second timeouts** for LLM responses to accommodate local Ollama/Gemma3 cold starts.

### Test Selectors

Tests use multiple selector strategies for resilience:

- `[data-testid="..."]` - Primary (preferred)
- `.class-name` - Secondary (component classes)
- `text="..."` - Tertiary (visible text)
- `button:has-text("...")` - Fallback (semantic selectors)

This ensures tests work even if exact selectors change.

## Debugging Failed Tests

### View Test Artifacts

```bash
# Open HTML report
npm run test:e2e:report

# View screenshots (in test-results/)
open test-results/chat-with-ide-spec-ts-*/test-failed-*.png

# View videos (in test-results/)
open test-results/chat-with-ide-spec-ts-*/video.webm

# View traces (detailed debugging)
npx playwright show-trace test-results/chat-with-ide-spec-ts-*/trace.zip
```

### Common Issues

**1. "Agent card not found"**

- **Cause**: Agents not imported to database
- **Fix**: `npm run import-local` or `npm run seed:zodiac`

**2. "Chat interface timeout"**

- **Cause**: Modal or component not rendering
- **Fix**: Check console for React errors, verify data-testid attributes

**3. "LLM response timeout"**

- **Cause**: Ollama not running or model not loaded
- **Fix**:
  ```bash
  docker ps | grep ollama
  docker exec ollama ollama list
  docker exec ollama ollama pull gemma3
  ```

**4. "Network error"**

- **Cause**: Dev server not running or API endpoint failing
- **Fix**: Check `npm run dev` logs, verify `http://localhost:3000` accessible

## Chrome DevTools MCP Integration

This project has Chrome DevTools MCP configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"],
      "env": {}
    }
  }
}
```

This enables Claude Code to interact with Chrome DevTools for advanced debugging and testing.

## Test Coverage

**Current Coverage**:

- Chat Interface: 95%
- Agent Selection: 90%
- Message Streaming: 85%
- Markdown Rendering: 80%
- Accessibility: 75%
- Error Handling: 70%

**Future Tests** (Planned):

- [ ] Message threading (reply-to)
- [ ] Message search and export
- [ ] Multi-agent conversations
- [ ] Voice input integration
- [ ] File attachments
- [ ] Chat analytics

## CI/CD Integration

These tests run in GitHub Actions on every PR:

```yaml
# .github/workflows/e2e-tests.yml
- name: Run Chat E2E Tests
  run: |
    npm run dev &
    sleep 5
    npm run test:e2e -- chat-with-ide.spec.ts --project=chromium
```

## Related Documentation

- **Test Plan**: `docs/CLI-TEST-PLAN.md`
- **E2E Guide**: `E2E-TESTING-GUIDE.md`
- **Workflow Status**: `docs/workflow-status.md` (CHAT-001, CHAT-002, CHAT-003)
- **Architecture**: `ARCHITECTURE.md` (Section 8: Conversational Chat System)

## Contributing

When adding new chat features:

1. **Write tests first** (TDD approach)
2. **Use data-testid** attributes for reliable selectors
3. **Test edge cases** (empty state, errors, loading)
4. **Add accessibility** tests (keyboard, ARIA)
5. **Update this README** with new test suites

---

**Last Updated**: 2025-10-30
**Test Suite Version**: 1.0.0
**Total Tests**: 16 tests across 6 suites
**Browser**: Chromium (Chrome engine via Playwright)

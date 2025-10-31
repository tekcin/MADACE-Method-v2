# MADACE Chat Guide

**Conversational AI Chat System for MADACE v3.0**

## Overview

MADACE Chat provides conversational interfaces for interacting with AI agents in both Web UI and CLI environments. Chat with agents using natural language, get real-time streaming responses, and maintain conversation history across sessions.

## Quick Start

### Web UI

1. Navigate to http://localhost:3000/chat
2. Select an agent from the grid
3. Start chatting!

### CLI

```bash
# Interactive agent selection
npm run madace chat

# Direct agent selection
npm run madace chat PM
npm run madace chat Analyst
```

## Features

### ✅ Implemented (CHAT-001)

- **Real-time Streaming**: Agent responses stream word-by-word using Server-Sent Events
- **Message Persistence**: All messages saved to database (ChatMessage table)
- **Session Management**: Create, list, end, and delete chat sessions
- **Agent Selection**: Choose from available agents in Web UI or CLI
- **Conversation Context**: Last 10 messages sent to LLM for context retention
- **Typing Indicators**: Visual feedback when agent is responding
- **Auto-scroll**: Chat view auto-scrolls to latest message
- **Responsive Design**: Mobile-friendly Web UI with dark mode
- **Multi-line Input**: Support for multi-line messages in CLI
- **Message Timestamps**: Relative time display ("2 minutes ago")
- **Chat History**: View last 10 messages with `/history` command (CLI)

### 🚧 Coming Soon (CHAT-002 & CHAT-003)

- Message threading (reply to specific messages)
- Infinite scroll pagination
- Full-text message search
- Conversation export to Markdown
- Markdown rendering in messages
- Code block syntax highlighting
- Copy button for code blocks

## Web UI Usage

### Starting a Chat

1. **Agent Selection Screen**:
   - Displays grid of available agents
   - Shows agent avatar, name, and title
   - Click any agent card to start chatting

2. **Chat Interface**:
   - Header: Agent name and online status
   - Messages: User messages on right (blue), agent on left (green)
   - Input: Auto-resizing textarea with character count
   - Send: Click button or press Enter

### Message Features

**Sending Messages**:

- Type in the textarea at the bottom
- Press **Enter** to send
- Press **Shift+Enter** for new line without sending
- Character limit: 4,000 characters

**Message Display**:

- User messages: Blue bubbles on right side
- Agent messages: Green bubbles on left side
- System messages: Gray bubbles on left side
- Avatars with initials
- Relative timestamps ("Just now", "5m ago")

**Real-time Streaming**:

- Agent responses appear word-by-word
- Typing indicator with animated pulse dot
- Automatic scroll to latest message

### Ending a Chat

- Click the **X** button in the header
- Session is ended in database
- Returns to agent selection screen

## CLI Usage

### Commands

```bash
# Start chat with interactive agent selection
madace chat

# Start chat with specific agent
madace chat PM
madace chat Analyst
madace chat Architect
```

### Chat Mode Commands

Once in chat mode, you have access to these commands:

| Command    | Description                                   |
| ---------- | --------------------------------------------- |
| `/exit`    | End chat session and return to terminal       |
| `/history` | Show last 10 messages in current session      |
| `/multi`   | Enter multi-line mode (type `/end` to finish) |
| `\`        | Line continuation (add \ at end of line)      |

### Examples

**Simple Chat**:

```
You → Hello! Can you help me plan a project?
Agent: Of course! I'd be happy to help you plan your project...
```

**Multi-line Input with `\`**:

```
You → I need help with:
... → 1. Database design \
... → 2. API architecture \
... → 3. Testing strategy
[Sending message...]
Agent: Let me help you with all three aspects...
```

**Multi-line Mode with `/multi`**:

```
You → /multi
Multi-line mode (type /end to finish):

1: CREATE TABLE users (
2:   id UUID PRIMARY KEY,
3:   name TEXT NOT NULL
4: );
5: /end

[Sending message...]
Agent: This is a good start for your users table...
```

**View History**:

```
You → /history

─────────────────────────────────────────────
Chat History:
─────────────────────────────────────────────

You: [5m ago]
Hello! Can you help me plan a project?

Agent: [4m ago]
Of course! I'd be happy to help you plan your project...

You → /exit
👋 Ending chat session...
✓ Chat ended. 12 messages exchanged.
```

## Database Schema

### ChatSession Model

```prisma
model ChatSession {
  id          String   @id @default(cuid())
  userId      String
  agentId     String
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  projectId   String?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent       Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  project     Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  messages    ChatMessage[]
}
```

### ChatMessage Model

```prisma
model ChatMessage {
  id          String   @id @default(cuid())
  sessionId   String
  role        String   // "user" | "agent" | "system"
  content     String
  timestamp   DateTime @default(now())
  replyToId   String?  // For threading (CHAT-002)

  session     ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  replyTo     ChatMessage? @relation("MessageReplies", fields: [replyToId], references: [id])
  replies     ChatMessage[] @relation("MessageReplies")
}
```

## API Reference

### Chat Sessions

**Create Session**:

```http
POST /api/v3/chat/sessions
Content-Type: application/json

{
  "userId": "user-123",
  "agentId": "agent-456",
  "projectId": "project-789"  // Optional
}

Response: 201 Created
{
  "success": true,
  "session": {
    "id": "session-abc",
    "userId": "user-123",
    "agentId": "agent-456",
    "startedAt": "2025-10-29T12:00:00Z",
    "endedAt": null,
    "projectId": "project-789"
  }
}
```

**List User Sessions**:

```http
GET /api/v3/chat/sessions?userId=user-123&limit=20&offset=0

Response: 200 OK
{
  "success": true,
  "sessions": [
    {
      "id": "session-abc",
      "userId": "user-123",
      "agentId": "agent-456",
      "startedAt": "2025-10-29T12:00:00Z",
      "endedAt": null,
      "messages": [/* Last 5 messages */],
      "user": { "id": "user-123", "name": "John Doe" },
      "agent": { "id": "agent-456", "name": "PM", "title": "Project Manager" }
    }
  ],
  "count": 1
}
```

### Chat Messages

**List Messages**:

```http
GET /api/v3/chat/sessions/{sessionId}/messages?limit=50&offset=0

Response: 200 OK
{
  "success": true,
  "messages": [
    {
      "id": "msg-1",
      "sessionId": "session-abc",
      "role": "user",
      "content": "Hello!",
      "timestamp": "2025-10-29T12:01:00Z",
      "replyToId": null
    },
    {
      "id": "msg-2",
      "sessionId": "session-abc",
      "role": "agent",
      "content": "Hi there! How can I help?",
      "timestamp": "2025-10-29T12:01:05Z",
      "replyToId": null
    }
  ],
  "count": 2
}
```

**Send Message**:

```http
POST /api/v3/chat/sessions/{sessionId}/messages
Content-Type: application/json

{
  "role": "user",
  "content": "Can you help me?",
  "replyToId": "msg-1"  // Optional
}

Response: 201 Created
{
  "success": true,
  "message": {
    "id": "msg-3",
    "sessionId": "session-abc",
    "role": "user",
    "content": "Can you help me?",
    "timestamp": "2025-10-29T12:02:00Z",
    "replyToId": "msg-1"
  }
}
```

### Streaming

**Stream Agent Response**:

```http
POST /api/v3/chat/stream
Content-Type: application/json

{
  "sessionId": "session-abc",
  "agentId": "agent-456",
  "replyToId": "msg-3"  // Optional
}

Response: 200 OK
Content-Type: text/event-stream

data: {"content":"Hello"}

data: {"content":" there"}

data: {"content":"!"}

data: [DONE]
```

## Chat Service API

### TypeScript Functions

```typescript
import {
  createSession,
  getSession,
  listSessionsByUser,
  endSession,
  deleteSession,
  createMessage,
  getMessage,
  listMessages,
  countMessages,
  deleteMessage,
  searchMessages,
  getSessionStats,
  getUserChatStats,
} from '@/lib/services/chat-service';

// Create new session
const session = await createSession({
  userId: 'user-123',
  agentId: 'agent-456',
  projectId: 'project-789', // Optional
});

// Get session with messages
const sessionWithMessages = await getSession('session-abc', {
  limit: 50,
  offset: 0,
  before: new Date(), // Optional: for infinite scroll
});

// List user's sessions
const sessions = await listSessionsByUser('user-123', {
  agentId: 'agent-456', // Optional filter
  limit: 20,
  offset: 0,
});

// End session
const endedSession = await endSession('session-abc');

// Delete session (cascade deletes messages)
await deleteSession('session-abc');

// Create message
const message = await createMessage({
  sessionId: 'session-abc',
  role: 'user',
  content: 'Hello, agent!',
  replyToId: 'msg-1', // Optional
});

// Get message with replies
const messageWithReplies = await getMessage('msg-1');

// List messages
const messages = await listMessages('session-abc', {
  limit: 50,
  offset: 0,
  before: new Date(), // Optional
});

// Count messages
const count = await countMessages('session-abc');

// Search messages
const results = await searchMessages('API error', {
  userId: 'user-123',
  agentId: 'agent-456',
  limit: 50,
});

// Session statistics
const stats = await getSessionStats('session-abc');
// Returns: { messageCount, userMessageCount, agentMessageCount, duration, isActive }

// User statistics
const userStats = await getUserChatStats('user-123');
// Returns: { sessionCount, activeSessionCount, totalMessages }
```

## Architecture

### Component Flow (Web UI)

```
ChatPage (agent selection)
    ↓ Select agent
    ↓ Create session
ChatInterface
    ↓ User types message
ChatInput
    ↓ Send message
API: POST /api/v3/chat/sessions/[id]/messages
    ↓ Save to database
    ↓ Get agent response
API: POST /api/v3/chat/stream
    ↓ Stream from LLM
    ↓ Save complete response
ChatInterface (streaming display)
    ↓ Update ChatMessage components
Message (display bubble)
```

### CLI Flow

```
madace chat [agent-name]
    ↓ Load agents
    ↓ Select agent (interactive or argument)
    ↓ Create session
Chat Loop
    ↓ User types message
    ↓ Send to database
    ↓ Get LLM response
    ↓ Save agent message
    ↓ Display in terminal
    ↓ Repeat
/exit command
    ↓ End session
    ↓ Show stats
```

### Streaming Architecture

```
User sends message
    ↓
API saves user message to database
    ↓
API loads conversation history (last 10 messages)
    ↓
API builds system prompt from agent persona
    ↓
API calls LLM with messages
    ↓
LLM streams response chunks
    ↓
API forwards chunks as Server-Sent Events
    ↓
Client receives chunks and displays progressively
    ↓
API saves complete response to database
    ↓
Client replaces streaming message with final message
```

## Configuration

### Environment Variables

```bash
# LLM Configuration (for agent responses)
PLANNING_LLM=gemini                    # Options: gemini, claude, openai, local
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.0-flash-exp

# Claude (if using Claude)
CLAUDE_API_KEY=your-key
CLAUDE_MODEL=claude-3-sonnet-20240229

# OpenAI (if using OpenAI)
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4

# Local (if using Ollama)
LOCAL_MODEL=llama2
LOCAL_API_URL=http://localhost:11434
```

### Agent Persona (affects chat personality)

Agents defined in `madace/mam/agents/*.agent.yaml`:

```yaml
agent:
  metadata:
    name: PM
    title: Project Manager
    version: 1.0.0
  persona:
    role: 'Project Manager responsible for planning and coordination'
    identity: 'I am detail-oriented and focused on successful project delivery'
    communication_style: 'Professional, clear, and action-oriented'
    principles:
      - 'Always clarify requirements before starting'
      - 'Keep stakeholders informed'
      - 'Focus on delivering value'
```

The chat system uses `persona.role` and `persona.identity` to build the LLM system prompt.

## Troubleshooting

### Web UI Issues

**Chat page shows "No Agents Available"**:

- Create agents at http://localhost:3000/agents
- Or use the agent loader to load MAM agents

**Messages not streaming**:

- Check browser console for errors
- Verify LLM API key is configured in `.env`
- Check `/api/v3/chat/stream` endpoint returns SSE

**Session creation fails**:

- Check database is running (`prisma/dev.db`)
- Verify user ID is valid
- Check agent ID exists

### CLI Issues

**`madace chat` command not found**:

```bash
# Rebuild CLI
npm run build

# Or use npm run
npm run madace chat
```

**Agent not found error**:

```bash
# List available agents
npm run madace agents list

# Use exact agent name
npm run madace chat PM  # Correct
npm run madace chat pm  # Also works (case-insensitive)
```

**LLM connection error**:

- Verify API key in `.env`
- Test LLM at http://localhost:3000/llm-test
- Check internet connection for cloud APIs

## Best Practices

### Web UI

1. **Keep messages concise**: Aim for 1-3 paragraphs per message
2. **Use Enter wisely**: Remember Enter sends, Shift+Enter adds new line
3. **End sessions**: Always click X to properly close sessions
4. **Monitor character count**: Stay under 4,000 characters

### CLI

1. **Use `/multi` for code**: Better formatting for multi-line code blocks
2. **Check `/history`**: Review context before continuing conversation
3. **Exit cleanly**: Always use `/exit` to end sessions properly
4. **Agent selection**: Use agent name argument for faster startup

### Agent Design

1. **Clear persona**: Define role, identity, and principles
2. **Communication style**: Match your team's preferences
3. **Conversation starters**: Add common questions to agent menu
4. **Context limits**: Remember only last 10 messages sent to LLM

## Performance

### Database

- **Indexes**: sessionId, timestamp, userId, agentId for fast queries
- **Cascade deletes**: Deleting session removes all messages
- **Pagination**: Use limit/offset for large message lists

### Streaming

- **Chunk size**: LLM provider determines chunk size
- **Buffer**: Client buffers chunks for smooth display
- **Timeout**: 2-minute timeout for LLM responses

### Caching

- **Agent data**: Cached during session
- **Conversation history**: Loaded once per response
- **Message list**: No caching (always fresh from DB)

## Security

### Input Validation

- **Message content**: Max 4,000 characters
- **Role validation**: Only "user", "agent", "system" allowed
- **Session validation**: Verify session exists and user has access
- **XSS prevention**: Content sanitization in Web UI (coming in CHAT-003)

### API Security

- **User authentication**: Required for production (not implemented in alpha)
- **Rate limiting**: Recommended for production
- **CORS**: Configured for same-origin in Next.js
- **SQL injection**: Prevented by Prisma ORM

### Data Privacy

- **Message encryption**: Not implemented in alpha (consider for production)
- **Session isolation**: Users can only access their own sessions
- **Message deletion**: Cascade deletes maintain consistency
- **Agent isolation**: Each agent's conversations are separate

## Migration from v2.0

MADACE v2.0 did not have a chat system. This is a new feature in v3.0.

If migrating agents from v2.0:

1. Export agents from v2.0 (if you have custom agents)
2. Import to v3.0 using `/agents` page or API
3. Start chatting with your agents immediately!

## Roadmap

### CHAT-002: Message History and Threading (5 points)

- [ ] Infinite scroll for message history
- [ ] Message threading (reply to specific messages)
- [ ] Full-text search across messages
- [ ] Conversation export to Markdown
- [ ] Filter by date range

### CHAT-003: Markdown Rendering (3 points)

- [ ] Markdown formatting (bold, italic, lists, links)
- [ ] Code block syntax highlighting
- [ ] Copy button for code blocks
- [ ] Image rendering
- [ ] XSS protection with sanitization

### Future (v3.1+)

- [ ] Voice input/output
- [ ] File attachments
- [ ] Conversation branching
- [ ] Multi-agent conversations
- [ ] Conversation templates
- [ ] Suggested responses
- [ ] Message reactions
- [ ] Read receipts
- [ ] User mentions
- [ ] Agent switching mid-conversation

## Support

- **Documentation**: https://github.com/tekcin/MADACE-Method-v2.0/docs
- **Issues**: https://github.com/tekcin/MADACE-Method-v2.0/issues
- **Discussions**: https://github.com/tekcin/MADACE-Method-v2.0/discussions

---

**Version**: v3.0-alpha
**Story**: [CHAT-001] Build Chat UI for Web and CLI
**Status**: ✅ Complete
**Last Updated**: 2025-10-29

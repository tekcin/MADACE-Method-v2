# MADACE API Documentation

**Version:** 3.0.0-alpha
**Base URL:** `http://localhost:3000/api`
**Last Updated:** 2025-10-30

This document provides comprehensive documentation for all REST API endpoints in the MADACE v2.0 application.

---

## Table of Contents

- [Authentication](#authentication)
- [Agents API](#agents-api)
- [Workflows API](#workflows-api)
- [State Machine API](#state-machine-api)
- [Configuration API](#configuration-api)
- [LLM API](#llm-api)
- [Chat API (v3)](#chat-api-v3)
- [Sync Service API](#sync-service-api)
- [Health Check API](#health-check-api)
- [Error Handling](#error-handling)

---

## Authentication

**Current Version:** No authentication required (development mode)

**Future Versions:** Will support API key authentication via `Authorization` header.

---

## Agents API

### List All Agents

Retrieve all available MADACE agents from the `madace/mam/agents/` directory.

**Endpoint:** `GET /api/agents`

**Response:**

```json
{
  "agents": [
    {
      "name": "pm",
      "version": "1.0.0",
      "title": "MADACE Product Manager",
      "module": "mam",
      "description": "Planning and scale assessment agent"
    },
    {
      "name": "analyst",
      "version": "1.0.0",
      "title": "MADACE Requirements Analyst",
      "module": "mam",
      "description": "Requirements gathering and research agent"
    }
    // ... more agents
  ]
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Failed to load agents

**Example:**

```bash
curl http://localhost:3000/api/agents
```

---

### Get Single Agent

Retrieve a specific agent by name.

**Endpoint:** `GET /api/agents/[name]`

**Path Parameters:**

- `name` (string, required) - Agent name (e.g., "pm", "analyst", "architect", "sm", "dev")

**Response:**

```json
{
  "name": "pm",
  "version": "1.0.0",
  "title": "MADACE Product Manager",
  "module": "mam",
  "persona": {
    "icon": "📋",
    "role": "Product Manager & Project Planner",
    "identity": "I am the MADACE Product Manager...",
    "communication_style": "Professional, strategic, and concise",
    "core_principles": [
      "Scale-appropriate planning is essential",
      "Clear requirements prevent wasted effort"
    ],
    "critical_actions": ["Assess project scale before proposing solutions"]
  },
  "menu": [
    {
      "trigger": "*plan-project",
      "title": "Plan New Project",
      "description": "Scale assessment and initial planning"
    }
  ],
  "prompts": {
    "default": "...",
    "planning": "..."
  },
  "auto_load": ["docs/project-overview.md", "docs/requirements.md"]
}
```

**Status Codes:**

- `200 OK` - Agent found
- `404 Not Found` - Agent does not exist
- `500 Internal Server Error` - Failed to load agent

**Example:**

```bash
curl http://localhost:3000/api/agents/pm
```

---

## Workflows API

### List All Workflows

Retrieve all available workflow definitions.

**Endpoint:** `GET /api/workflows`

**Response:**

```json
{
  "workflows": [
    {
      "name": "plan-project",
      "agent": "pm",
      "phase": "planning",
      "steps": 5
    },
    {
      "name": "create-story",
      "agent": "sm",
      "phase": "execution",
      "steps": 3
    }
    // ... more workflows
  ]
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Failed to load workflows

---

### Get Workflow Definition

Retrieve a specific workflow definition by name.

**Endpoint:** `GET /api/workflows/[name]`

**Path Parameters:**

- `name` (string, required) - Workflow name (e.g., "plan-project", "create-story")

**Response:**

```json
{
  "name": "plan-project",
  "description": "Initial project planning and scale assessment",
  "agent": "pm",
  "phase": "planning",
  "steps": [
    {
      "name": "Assess scale",
      "action": "elicit",
      "prompt": "What is the scope of this project?"
    },
    {
      "name": "Define requirements",
      "action": "reflect",
      "prompt": "Based on the scale, what are the key requirements?"
    }
  ]
}
```

**Status Codes:**

- `200 OK` - Workflow found
- `404 Not Found` - Workflow does not exist
- `500 Internal Server Error` - Failed to load workflow

---

### Get Workflow State

Retrieve the current execution state of a workflow.

**Endpoint:** `GET /api/workflows/[name]/state`

**Path Parameters:**

- `name` (string, required) - Workflow name

**Response:**

```json
{
  "workflowName": "plan-project",
  "currentStep": 2,
  "totalSteps": 5,
  "completed": false,
  "startedAt": 1729612800000,
  "variables": {
    "project_name": "MADACE v2.0",
    "scale": "medium"
  }
}
```

**Status Codes:**

- `200 OK` - State found
- `404 Not Found` - Workflow state does not exist
- `500 Internal Server Error` - Failed to load state

---

### Execute Workflow Step

Execute the next step in a workflow.

**Endpoint:** `POST /api/workflows/[name]/execute`

**Path Parameters:**

- `name` (string, required) - Workflow name

**Request Body:**

```json
{
  "userInput": "This is a medium-scale web application project"
}
```

**Response:**

```json
{
  "success": true,
  "currentStep": 3,
  "totalSteps": 5,
  "completed": false,
  "agentResponse": "Based on your input, I assess this as a medium-scale project...",
  "nextPrompt": "What are the key features you want to implement?"
}
```

**Status Codes:**

- `200 OK` - Step executed successfully
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Workflow does not exist
- `500 Internal Server Error` - Execution failed

**Example:**

```bash
curl -X POST http://localhost:3000/api/workflows/plan-project/execute \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Medium-scale web app"}'
```

---

## State Machine API

### Get Workflow Status

Retrieve the current state of all stories in the workflow status file.

**Endpoint:** `GET /api/state`

**Response:**

```json
{
  "backlog": [
    {
      "id": "TEST-009",
      "title": "Unit tests for core modules",
      "points": 8,
      "milestone": "1.8"
    }
  ],
  "todo": [],
  "in_progress": [],
  "done": [
    {
      "id": "CLI-004",
      "title": "WebSocket real-time updates",
      "points": 8,
      "milestone": "1.7",
      "completedAt": "2025-10-22"
    }
  ],
  "statistics": {
    "totalStories": 35,
    "totalPoints": 170,
    "backlogCount": 6,
    "todoCount": 0,
    "inProgressCount": 0,
    "doneCount": 35
  }
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Failed to parse status file

**Example:**

```bash
curl http://localhost:3000/api/state
```

---

## Configuration API

### Get Configuration

Retrieve the current MADACE configuration.

**Endpoint:** `GET /api/config`

**Response:**

```json
{
  "project_name": "MADACE-Method-v2.0",
  "output_folder": "docs",
  "user_name": "Developer",
  "communication_language": "English",
  "modules": {
    "mam": {
      "enabled": true
    },
    "mab": {
      "enabled": false
    },
    "cis": {
      "enabled": false
    }
  },
  "llm": {
    "provider": "gemini",
    "model": "gemini-2.0-flash-exp"
  }
}
```

**Status Codes:**

- `200 OK` - Configuration found
- `404 Not Found` - Configuration file does not exist
- `500 Internal Server Error` - Failed to load configuration

---

### Save Configuration

Save or update MADACE configuration.

**Endpoint:** `POST /api/config`

**Request Body:**

```json
{
  "project_name": "My Project",
  "output_folder": "output",
  "user_name": "John Doe",
  "communication_language": "English",
  "modules": {
    "mam": { "enabled": true },
    "mab": { "enabled": false },
    "cis": { "enabled": false }
  },
  "llm": {
    "provider": "gemini",
    "api_key": "your-api-key-here",
    "model": "gemini-2.0-flash-exp"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Configuration saved successfully",
  "configPath": "madace-data/config/config.yaml",
  "envPath": "madace-data/config/.env"
}
```

**Status Codes:**

- `200 OK` - Configuration saved
- `400 Bad Request` - Validation failed
- `500 Internal Server Error` - Failed to save configuration

**Example:**

```bash
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d @config.json
```

---

## LLM API

### Test LLM Connection

Test connectivity to an LLM provider.

**Endpoint:** `POST /api/llm/test`

**Request Body:**

```json
{
  "provider": "gemini",
  "apiKey": "your-api-key-here",
  "model": "gemini-2.0-flash-exp",
  "testPrompt": "Say hello!"
}
```

**Supported Providers:**

- `gemini` - Google Gemini
- `claude` - Anthropic Claude
- `openai` - OpenAI GPT
- `local` - Local/Ollama models

**Response:**

```json
{
  "success": true,
  "provider": "gemini",
  "model": "gemini-2.0-flash-exp",
  "message": "Hello! How can I help you today?",
  "usage": {
    "promptTokens": 3,
    "completionTokens": 8,
    "totalTokens": 11
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "provider": "gemini",
  "error": "INVALID_API_KEY",
  "message": "The API key provided is invalid. Please check your credentials."
}
```

**Status Codes:**

- `200 OK` - Connection test successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Invalid API key
- `500 Internal Server Error` - Connection failed

**Example:**

```bash
curl -X POST http://localhost:3000/api/llm/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "apiKey": "your-key",
    "model": "gemini-2.0-flash-exp",
    "testPrompt": "Hello"
  }'
```

---

## Chat API (v3)

The Chat API provides conversational interfaces for interacting with AI agents, with support for real-time streaming, message history, threading, and persistent memory.

### Database Schema

The chat system uses the following Prisma models:

- **User** - Chat participants
- **ChatSession** - Conversation sessions between users and agents
- **ChatMessage** - Individual messages in conversations
- **AgentMemory** - Persistent agent memory for context-aware responses

---

### Create Chat Session

Create a new conversation session with an AI agent.

**Endpoint:** `POST /api/v3/chat/sessions`

**Request Body:**

```json
{
  "userId": "default-user",
  "agentId": "chat-assistant-001",
  "metadata": {
    "source": "web-ui",
    "context": "product planning"
  }
}
```

**Parameters:**

- `userId` (string, required) - User ID from User table
- `agentId` (string, required) - Agent ID from Agent table
- `metadata` (object, optional) - Additional session context

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "cmhe21vm00007rzdx62sik85m",
    "userId": "default-user",
    "agentId": "chat-assistant-001",
    "startedAt": "2025-10-30T23:28:09.848Z",
    "endedAt": null,
    "metadata": {
      "source": "web-ui",
      "context": "product planning"
    },
    "createdAt": "2025-10-30T23:28:09.848Z",
    "updatedAt": "2025-10-30T23:28:09.848Z"
  }
}
```

**Status Codes:**

- `201 Created` - Session created successfully
- `400 Bad Request` - Invalid user or agent ID
- `404 Not Found` - User or agent does not exist
- `500 Internal Server Error` - Database error

**Example:**

```bash
curl -X POST http://localhost:3000/api/v3/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "default-user",
    "agentId": "chat-assistant-001"
  }'
```

---

### List Chat Sessions

Retrieve all chat sessions for a user.

**Endpoint:** `GET /api/v3/chat/sessions?userId={userId}`

**Query Parameters:**

- `userId` (string, required) - Filter by user ID
- `agentId` (string, optional) - Filter by agent ID
- `active` (boolean, optional) - Filter active sessions (endedAt is null)
- `limit` (number, optional) - Max sessions to return (default: 50)
- `offset` (number, optional) - Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "sessions": [
    {
      "id": "cmhe21vm00007rzdx62sik85m",
      "userId": "default-user",
      "agentId": "chat-assistant-001",
      "startedAt": "2025-10-30T23:28:09.848Z",
      "endedAt": null,
      "messageCount": 5,
      "lastMessageAt": "2025-10-30T23:35:42.123Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Status Codes:**

- `200 OK` - Success
- `400 Bad Request` - Invalid query parameters
- `500 Internal Server Error` - Database error

**Example:**

```bash
# List all sessions for a user
curl "http://localhost:3000/api/v3/chat/sessions?userId=default-user"

# List active sessions with an agent
curl "http://localhost:3000/api/v3/chat/sessions?userId=default-user&agentId=chat-assistant-001&active=true"
```

---

### Get Session Details

Retrieve details of a specific chat session.

**Endpoint:** `GET /api/v3/chat/sessions/[id]`

**Path Parameters:**

- `id` (string, required) - Session ID

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "cmhe21vm00007rzdx62sik85m",
    "userId": "default-user",
    "agentId": "chat-assistant-001",
    "startedAt": "2025-10-30T23:28:09.848Z",
    "endedAt": null,
    "metadata": {
      "source": "web-ui"
    },
    "agent": {
      "id": "chat-assistant-001",
      "name": "chat-assistant",
      "title": "AI Chat Assistant",
      "icon": "💬"
    },
    "messageCount": 5,
    "lastMessageAt": "2025-10-30T23:35:42.123Z"
  }
}
```

**Status Codes:**

- `200 OK` - Session found
- `404 Not Found` - Session does not exist
- `500 Internal Server Error` - Database error

---

### Send Message

Send a message in a chat session.

**Endpoint:** `POST /api/v3/chat/sessions/[id]/messages`

**Path Parameters:**

- `id` (string, required) - Session ID

**Request Body:**

```json
{
  "role": "user",
  "content": "Tell me a joke about programming",
  "replyToId": "optional-message-id"
}
```

**Parameters:**

- `role` (string, required) - Message role: "user" or "agent"
- `content` (string, required) - Message content (max 10,000 characters)
- `replyToId` (string, optional) - ID of message being replied to (for threading)

**Response:**

```json
{
  "success": true,
  "message": {
    "id": "cmhe2xxx00008rzdxyyyzzz",
    "sessionId": "cmhe21vm00007rzdx62sik85m",
    "role": "user",
    "content": "Tell me a joke about programming",
    "replyToId": null,
    "timestamp": "2025-10-30T23:36:15.456Z",
    "metadata": null
  }
}
```

**Status Codes:**

- `201 Created` - Message sent successfully
- `400 Bad Request` - Invalid message content or role
- `404 Not Found` - Session does not exist
- `413 Payload Too Large` - Message exceeds 10,000 characters
- `500 Internal Server Error` - Database error

**Example:**

```bash
curl -X POST http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m/messages \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "Tell me about MADACE methodology"
  }'
```

---

### Get Messages

Retrieve messages from a chat session with pagination and threading support.

**Endpoint:** `GET /api/v3/chat/sessions/[id]/messages`

**Path Parameters:**

- `id` (string, required) - Session ID

**Query Parameters:**

- `limit` (number, optional) - Max messages to return (default: 50, max: 200)
- `offset` (number, optional) - Pagination offset (default: 0)
- `before` (string, optional) - Get messages before this timestamp (ISO 8601)
- `after` (string, optional) - Get messages after this timestamp (ISO 8601)
- `threadId` (string, optional) - Filter by thread (replyToId)

**Response:**

```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-001",
      "sessionId": "cmhe21vm00007rzdx62sik85m",
      "role": "user",
      "content": "Tell me a joke about programming",
      "replyToId": null,
      "timestamp": "2025-10-30T23:36:15.456Z",
      "metadata": null
    },
    {
      "id": "msg-002",
      "sessionId": "cmhe21vm00007rzdx62sik85m",
      "role": "agent",
      "content": "Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛💡",
      "replyToId": "msg-001",
      "timestamp": "2025-10-30T23:36:18.789Z",
      "metadata": {
        "model": "gemma3:latest",
        "tokens": 25
      }
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0,
  "hasMore": false
}
```

**Status Codes:**

- `200 OK` - Success
- `400 Bad Request` - Invalid query parameters
- `404 Not Found` - Session does not exist
- `500 Internal Server Error` - Database error

**Example:**

```bash
# Get all messages
curl http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m/messages

# Get recent messages with pagination
curl "http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m/messages?limit=20&offset=0"

# Get messages in a thread
curl "http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m/messages?threadId=msg-001"
```

---

### Stream Agent Response

Stream real-time agent responses using Server-Sent Events (SSE).

**Endpoint:** `POST /api/v3/chat/stream`

**Request Body:**

```json
{
  "sessionId": "cmhe21vm00007rzdx62sik85m",
  "agentId": "chat-assistant-001",
  "replyToId": "optional-message-id"
}
```

**Parameters:**

- `sessionId` (string, required) - Chat session ID
- `agentId` (string, required) - Agent ID
- `replyToId` (string, optional) - Message ID being replied to

**Response Format:**

Server-Sent Events (SSE) stream with `Content-Type: text/event-stream`

**Event Types:**

1. **Content Chunk** - Streamed text from LLM
   ```
   data: {"type":"chunk","content":"Hello"}

   data: {"type":"chunk","content":" there!"}
   ```

2. **Memory Update** - Agent memory extracted during response
   ```
   data: {"type":"memory","category":"user_preferences","key":"language","value":"English"}
   ```

3. **Completion** - Stream finished
   ```
   data: [DONE]
   ```

4. **Error** - Stream error
   ```
   data: {"type":"error","error":"Model timeout","retryable":true}
   ```

**Status Codes:**

- `200 OK` - Stream started successfully
- `400 Bad Request` - Invalid session or agent
- `404 Not Found` - Session or agent does not exist
- `500 Internal Server Error` - Stream error
- `503 Service Unavailable` - LLM service unavailable

**Example:**

```bash
# Stream response using curl
curl -N -X POST http://localhost:3000/api/v3/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "cmhe21vm00007rzdx62sik85m",
    "agentId": "chat-assistant-001"
  }'

# Output:
# data: {"type":"chunk","content":"Why"}
# data: {"type":"chunk","content":" do"}
# data: {"type":"chunk","content":" programmers"}
# data: {"type":"chunk","content":"..."}
# data: [DONE]
```

**JavaScript Client Example:**

```javascript
const response = await fetch('http://localhost:3000/api/v3/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'cmhe21vm00007rzdx62sik85m',
    agentId: 'chat-assistant-001'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        console.log('Stream complete');
        break;
      }

      const event = JSON.parse(data);
      if (event.type === 'chunk') {
        process.stdout.write(event.content);
      }
    }
  }
}
```

---

### Delete Session

Delete a chat session and all associated messages.

**Endpoint:** `DELETE /api/v3/chat/sessions/[id]`

**Path Parameters:**

- `id` (string, required) - Session ID

**Response:**

```json
{
  "success": true,
  "message": "Session deleted successfully",
  "deletedMessages": 12
}
```

**Status Codes:**

- `200 OK` - Session deleted
- `404 Not Found` - Session does not exist
- `500 Internal Server Error` - Database error

**Note:** Deletion cascades to all messages and memory entries for this session.

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m
```

---

### Get Agent Memory

Retrieve agent memory for a session or globally for an agent.

**Endpoint:** `GET /api/v3/chat/sessions/[id]/memory`

**Path Parameters:**

- `id` (string, required) - Session ID

**Query Parameters:**

- `category` (string, optional) - Filter by category (user_preferences, facts, conversation_context, tasks)
- `limit` (number, optional) - Max entries to return (default: 100)

**Response:**

```json
{
  "success": true,
  "memory": [
    {
      "id": "mem-001",
      "agentId": "chat-assistant-001",
      "sessionId": "cmhe21vm00007rzdx62sik85m",
      "category": "user_preferences",
      "key": "programming_language",
      "value": "TypeScript",
      "context": "User mentioned working with TypeScript",
      "importance": 0.8,
      "lastAccessedAt": "2025-10-30T23:40:15.123Z",
      "expiresAt": null,
      "createdAt": "2025-10-30T23:35:42.456Z"
    }
  ],
  "total": 1
}
```

**Memory Categories:**

- `user_preferences` - User's stated preferences and settings
- `facts` - Important facts about the user or context
- `conversation_context` - Key points from conversation
- `tasks` - Pending or completed tasks

**Status Codes:**

- `200 OK` - Success
- `404 Not Found` - Session does not exist
- `500 Internal Server Error` - Database error

**Example:**

```bash
# Get all memory for a session
curl http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m/memory

# Get user preferences only
curl "http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m/memory?category=user_preferences"
```

---

### Save Agent Memory

Manually save or update agent memory entries.

**Endpoint:** `POST /api/v3/chat/sessions/[id]/memory`

**Path Parameters:**

- `id` (string, required) - Session ID

**Request Body:**

```json
{
  "category": "user_preferences",
  "key": "timezone",
  "value": "America/Los_Angeles",
  "context": "User mentioned Pacific time",
  "importance": 0.7,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Parameters:**

- `category` (string, required) - Memory category
- `key` (string, required) - Memory key
- `value` (any, required) - Memory value (string, number, boolean, object)
- `context` (string, optional) - Context about this memory
- `importance` (number, optional) - Importance score 0.0-1.0 (default: 0.5)
- `expiresAt` (string, optional) - ISO 8601 expiration timestamp

**Response:**

```json
{
  "success": true,
  "memory": {
    "id": "mem-002",
    "agentId": "chat-assistant-001",
    "sessionId": "cmhe21vm00007rzdx62sik85m",
    "category": "user_preferences",
    "key": "timezone",
    "value": "America/Los_Angeles",
    "context": "User mentioned Pacific time",
    "importance": 0.7,
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-10-30T23:45:12.789Z"
  }
}
```

**Status Codes:**

- `201 Created` - Memory saved
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Session does not exist
- `500 Internal Server Error` - Database error

---

### Prune Agent Memory

Delete expired or low-importance memory entries.

**Endpoint:** `DELETE /api/v3/chat/sessions/[id]/memory`

**Path Parameters:**

- `id` (string, required) - Session ID

**Query Parameters:**

- `olderThan` (string, optional) - Delete entries older than this timestamp (ISO 8601)
- `importanceLessThan` (number, optional) - Delete entries with importance < this value
- `category` (string, optional) - Only prune specific category

**Response:**

```json
{
  "success": true,
  "message": "Memory pruned successfully",
  "deletedCount": 15
}
```

**Status Codes:**

- `200 OK` - Memory pruned
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Database error

**Example:**

```bash
# Delete low-importance entries
curl -X DELETE "http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m/memory?importanceLessThan=0.3"

# Delete old conversation context
curl -X DELETE "http://localhost:3000/api/v3/chat/sessions/cmhe21vm00007rzdx62sik85m/memory?category=conversation_context&olderThan=2025-10-25T00:00:00Z"
```

---

### Chat Error Codes

In addition to common error codes, the Chat API includes specific error responses:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SESSION_NOT_FOUND` | 404 | Chat session does not exist |
| `MESSAGE_TOO_LONG` | 413 | Message exceeds 10,000 characters |
| `INVALID_ROLE` | 400 | Role must be "user" or "agent" |
| `USER_NOT_FOUND` | 404 | User ID does not exist |
| `AGENT_NOT_FOUND` | 404 | Agent ID does not exist |
| `STREAM_ERROR` | 500 | Error during SSE streaming |
| `LLM_UNAVAILABLE` | 503 | LLM service is not available |
| `MODEL_NOT_READY` | 503 | Local model is loading (retry in 10s) |
| `CONTEXT_WINDOW_EXCEEDED` | 413 | Conversation exceeds model context limit |
| `MEMORY_QUOTA_EXCEEDED` | 413 | Agent memory limit reached |

---

### Performance Considerations

**Pagination:**

Always use `limit` and `offset` for large conversations:

```bash
# Efficient: Get recent 20 messages
curl "http://localhost:3000/api/v3/chat/sessions/{id}/messages?limit=20&offset=0"

# Inefficient: Get all messages in large conversation
curl "http://localhost:3000/api/v3/chat/sessions/{id}/messages"
```

**Streaming:**

For real-time responses, use the streaming endpoint (`/api/v3/chat/stream`) instead of polling for messages.

**Memory Management:**

Implement periodic memory pruning to prevent database bloat:

```bash
# Weekly cron job to prune old low-importance memory
curl -X DELETE "http://localhost:3000/api/v3/chat/sessions/{id}/memory?importanceLessThan=0.3&olderThan=$(date -d '30 days ago' -Iseconds)"
```

**Local LLM:**

- **First inference**: 10-30 seconds (model loading)
- **Subsequent inferences**: 1-5 seconds
- **Cold start optimization**: Keep Ollama container running

---

### Complete Chat Flow Example

```bash
# 1. Create chat session
SESSION=$(curl -s -X POST http://localhost:3000/api/v3/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId":"default-user","agentId":"chat-assistant-001"}' \
  | jq -r '.session.id')

echo "Session ID: $SESSION"

# 2. Send user message
curl -X POST "http://localhost:3000/api/v3/chat/sessions/$SESSION/messages" \
  -H "Content-Type: application/json" \
  -d '{"role":"user","content":"Tell me about MADACE methodology"}' \
  | jq .

# 3. Stream agent response
curl -N -X POST http://localhost:3000/api/v3/chat/stream \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION\",\"agentId\":\"chat-assistant-001\"}"

# 4. Get conversation history
curl "http://localhost:3000/api/v3/chat/sessions/$SESSION/messages" | jq .

# 5. Check agent memory
curl "http://localhost:3000/api/v3/chat/sessions/$SESSION/memory" | jq .

# 6. Clean up (optional)
curl -X DELETE "http://localhost:3000/api/v3/chat/sessions/$SESSION"
```

---

## Sync Service API

### Get Sync Service Status

Retrieve the current status of the WebSocket sync service.

**Endpoint:** `GET /api/sync`

**Response:**

```json
{
  "running": true,
  "clients": [
    {
      "id": "abc123",
      "connectedAt": 1729612800000,
      "lastPing": 1729612850000,
      "metadata": {
        "source": "web-ui",
        "userAgent": "Mozilla/5.0..."
      }
    }
  ],
  "clientCount": 1,
  "uptime": 1729612800000
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Failed to get status

---

### Start/Stop Sync Service

Start or stop the WebSocket sync service.

**Endpoint:** `POST /api/sync`

**Request Body:**

```json
{
  "action": "start",
  "wsPort": 3001,
  "statePaths": ["madace-data/workflow-states"],
  "configPath": "madace-data/config/config.yaml"
}
```

**Actions:**

- `start` - Start the sync service
- `stop` - Stop the sync service

**Response (Start):**

```json
{
  "success": true,
  "message": "Sync service started successfully",
  "running": true,
  "wsPort": 3001,
  "clientCount": 0
}
```

**Response (Stop):**

```json
{
  "success": true,
  "message": "Sync service stopped successfully",
  "running": false
}
```

**Status Codes:**

- `200 OK` - Action successful
- `400 Bad Request` - Invalid action
- `500 Internal Server Error` - Action failed

**Example:**

```bash
# Start service
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# Stop service
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

---

## Health Check API

### Get System Health

Check the overall health of the MADACE system.

**Endpoint:** `GET /api/health`

**Response:**

```json
{
  "status": "healthy",
  "timestamp": 1729612800000,
  "services": {
    "api": "up",
    "database": "n/a",
    "sync": "up",
    "filesystem": "healthy"
  },
  "version": "2.0.0-alpha"
}
```

**Status Codes:**

- `200 OK` - System is healthy
- `503 Service Unavailable` - System has issues

**Example:**

```bash
curl http://localhost:3000/api/health
```

---

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": "Additional error details (optional)",
  "timestamp": 1729612800000
}
```

### Common Error Codes

| Code                 | HTTP Status | Description                |
| -------------------- | ----------- | -------------------------- |
| `VALIDATION_ERROR`   | 400         | Request validation failed  |
| `NOT_FOUND`          | 404         | Resource not found         |
| `INVALID_API_KEY`    | 401         | LLM API key is invalid     |
| `INSUFFICIENT_QUOTA` | 429         | LLM quota exceeded         |
| `INTERNAL_ERROR`     | 500         | Internal server error      |
| `CONFIG_NOT_FOUND`   | 404         | Configuration file missing |
| `AGENT_NOT_FOUND`    | 404         | Agent file not found       |
| `WORKFLOW_NOT_FOUND` | 404         | Workflow not found         |

### Error Response Example

```json
{
  "error": "AGENT_NOT_FOUND",
  "message": "Agent 'invalid-name' does not exist",
  "details": "Available agents: pm, analyst, architect, sm, dev",
  "timestamp": 1729612800000
}
```

---

## Rate Limiting

**Current Version:** No rate limiting (development mode)

**Future Versions:** Will implement rate limiting per IP address:

- Free tier: 100 requests per minute
- Authenticated: 1000 requests per minute

---

## Versioning

The API follows semantic versioning (SemVer):

- Current version: `2.0.0-alpha`
- Version is included in response headers: `X-API-Version: 2.0.0-alpha`

**Future Versions:** Will support version-specific endpoints (e.g., `/api/v2/agents`)

---

## WebSocket API

The WebSocket server provides real-time updates for workflow state changes.

**Endpoint:** `ws://localhost:3001`

**Client Connection:**

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('Connected to sync service');
});

ws.on('message', (data) => {
  const update = JSON.parse(data);
  console.log('State update:', update);
});
```

**Message Format:**

```json
{
  "type": "state_update",
  "workflowName": "plan-project",
  "state": {
    "currentStep": 3,
    "totalSteps": 5,
    "status": "running"
  },
  "timestamp": 1729612800000
}
```

**Supported Message Types:**

- `state_update` - Workflow state changed
- `config_update` - Configuration changed
- `ping` - Keepalive ping
- `pong` - Keepalive response

---

## Best Practices

1. **Always validate responses** - Check HTTP status codes before parsing JSON
2. **Handle errors gracefully** - All endpoints can return errors
3. **Use appropriate timeouts** - Long-running operations (workflow execution) may take time
4. **Cache agent/workflow definitions** - These rarely change
5. **Monitor WebSocket health** - Implement reconnection logic for sync clients
6. **Secure API keys** - Never commit API keys to version control

---

## Examples

### Complete Workflow Execution

```bash
# 1. Get agent info
curl http://localhost:3000/api/agents/pm

# 2. Get workflow definition
curl http://localhost:3000/api/workflows/plan-project

# 3. Execute first step
curl -X POST http://localhost:3000/api/workflows/plan-project/execute \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Medium-scale web application"}'

# 4. Check workflow state
curl http://localhost:3000/api/workflows/plan-project/state

# 5. Continue execution...
```

### Real-time Sync Setup

```bash
# 1. Start sync service
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# 2. Check status
curl http://localhost:3000/api/sync

# 3. Connect WebSocket client (in separate terminal)
wscat -c ws://localhost:3001

# 4. Make a state file change
echo '{"status": "running"}' > madace-data/workflow-states/.test.state.json

# 5. Observe real-time broadcast in WebSocket client
```

---

## Support

For issues or questions:

- GitHub Issues: https://github.com/tekcin/MADACE-METHOD/issues
- Documentation: http://localhost:3000/docs
- Status Page: http://localhost:3000/sync-status

---

**Last Updated:** 2025-10-30
**Version:** 3.0.0-alpha

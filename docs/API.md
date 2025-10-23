# MADACE API Documentation

**Version:** 2.0.0-alpha
**Base URL:** `http://localhost:3000/api`
**Last Updated:** 2025-10-22

This document provides comprehensive documentation for all REST API endpoints in the MADACE v2.0 application.

---

## Table of Contents

- [Authentication](#authentication)
- [Agents API](#agents-api)
- [Workflows API](#workflows-api)
- [State Machine API](#state-machine-api)
- [Configuration API](#configuration-api)
- [LLM API](#llm-api)
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

**Last Updated:** 2025-10-22
**Version:** 2.0.0-alpha

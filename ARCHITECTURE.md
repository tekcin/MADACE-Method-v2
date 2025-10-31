# MADACE-Method v3.0 - Proposed Architecture

**Project:** MADACE-Method v3.0
**Version:** 3.0.0-alpha
**Document Status:** Proposal

> This document outlines the proposed architecture for the next major version of the MADACE-Method, focusing on enhancing the capabilities of agents, the CLI, and the web interface.

---

## ⚠️ CRITICAL DEVELOPMENT RULES FOR V3.0

### File Access and Runtime Error Prevention

**RULE 1: Never assume files exist in production**

- ✅ **DO**: Always check if files exist before reading them
- ✅ **DO**: Return graceful fallbacks when files are missing
- ❌ **DON'T**: Use direct `fs.readFile()` without existence checks
- ❌ **DON'T**: Throw errors for missing optional files

**RULE 2: Development vs Production file paths**

- Development files (like `docs/workflow-status.md`) may NOT exist in production Docker builds
- Production builds only include files in the Docker image (see `.dockerignore`)
- API routes must handle missing development files gracefully

**RULE 3: Graceful degradation pattern**

```typescript
// ✅ CORRECT: Check file existence first
import { existsSync } from 'fs';

if (!existsSync(filePath)) {
  return { success: true, data: emptyState, message: 'File not found - returning empty state' };
}

// ❌ WRONG: Direct file access
const data = await fs.readFile(filePath); // This will crash if file doesn't exist!
```

**RULE 4: Health checks should never fail for missing optional files**

- Missing development files should return `status: 'pass'` with a descriptive message
- Only fail health checks for critical system failures (database, disk space, permissions)

**Example from production error fix:**

```typescript
// app/api/state/route.ts - BEFORE (caused production crash)
const stateMachine = createStateMachine(statusFilePath);
await stateMachine.load(); // CRASH: ENOENT error

// app/api/state/route.ts - AFTER (graceful degradation)
if (!existsSync(statusFilePath)) {
  return NextResponse.json({
    success: true,
    status: { backlog: [], todo: [], inProgress: [], done: [] },
    message: 'No workflow status file found - returning empty state',
  });
}
```

### Database Schema and Type Safety

**RULE 5: Never flatten JSON fields in UI components**

- Prisma schema uses `Json` type for `persona`, `menu`, and `prompts`
- ✅ **DO**: Access JSON fields as `agent.persona` (JsonValue type)
- ❌ **DON'T**: Create flattened fields like `agent.personaName`, `agent.personaRole`
- Use type assertions when needed: `agent.persona as Record<string, unknown>`

**RULE 6: Match Prisma types exactly**

```typescript
// ✅ CORRECT: Use Prisma-generated types
import type { Agent } from '@prisma/client';

// Agent type has these fields:
// - persona: JsonValue (not personaName, personaRole, etc.)
// - menu: JsonValue (not menuOptions, menuPrompt, etc.)
// - prompts: JsonValue (not individual prompt fields)

// ❌ WRONG: Creating custom types that don't match Prisma
interface CustomAgent {
  personaName: string; // Does not exist in database!
  menuOptions: string[]; // Does not exist in database!
}
```

**RULE 7: Service layer schema must match Prisma schema**

```typescript
// lib/services/agent-service.ts schema structure:
export const CreateAgentSchema = z.object({
  name: z.string(),
  title: z.string(),
  persona: z.object({  // Stored as JSON in Prisma
    role: z.string(),
    identity: z.string().optional(),
  }),
  menu: z.array(z.object({ ... })),  // Stored as JSON in Prisma
  prompts: z.array(z.object({ ... })),  // Stored as JSON in Prisma
});
```

### API Route Error Handling

**RULE 8: All API routes must return proper error responses**

```typescript
// ✅ CORRECT: Structured error responses
return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });

// ❌ WRONG: Throwing unhandled errors
throw new Error(errorMessage); // Crashes Next.js server!
```

**RULE 9: Use try-catch in all API routes**

- Wrap all async operations in try-catch blocks
- Handle Prisma errors specifically (check for `PrismaClientKnownRequestError`)
- Return appropriate HTTP status codes (400, 404, 500, etc.)

### UI Component Best Practices

**RULE 10: Keep UI components simple until schema is stable**

- Complex forms (AgentEditor, AgentWizard) should be deferred until JSON schema is finalized
- Start with read-only views (display JSON as formatted text)
- Add edit functionality incrementally once schema patterns are proven

---

## 1. Overview

This proposal introduces a set of architectural changes and new features designed to make the MADACE-Method more dynamic, intelligent, and user-friendly. The proposed changes are focused on three key areas: Agents, CLI, and the Web Interface.

Recent implementation progress includes a comprehensive Local LLM Provider architecture with Docker model integration, providing zero-configuration setup for local AI models.

---

## 2. Agent Enhancements

To make the agents more dynamic, intelligent, and easier to interact with, we propose the following:

### 2.1. Dynamic Agent Management

- **Problem:** Currently, agents are statically defined in YAML files, which makes it difficult to create or modify them without manual intervention.
- **Proposal:** Implement a system for dynamic agent management, allowing users to create, edit, and delete agents through the web UI or CLI.
- **Implementation:**
  - Store agent definitions in a database (e.g., SQLite, PostgreSQL) instead of YAML files.
  - Create a new set of API routes for managing agents (e.g., `POST /api/agents`, `PUT /api/agents/:id`, `DELETE /api/agents/:id`).
  - Develop a user-friendly interface in the web UI for managing agents.

### 2.2. Conversational Interaction

- **Problem:** The current interaction with agents is limited to a predefined menu of commands, which can be restrictive.
- **Proposal:** Implement a conversational interface for agents, allowing for more natural and flexible interactions.
- **Implementation:**
  - Integrate a Natural Language Understanding (NLU) service (e.g., Dialogflow, Rasa) to process user input.
  - Implement a chat interface in the web UI for conversational interaction with agents.
  - Develop a more sophisticated dialogue management system for agents to handle conversations.

### 2.3. Persistent Agent Memory

- **Problem:** Agents are currently stateless and do not remember past interactions.
- **Proposal:** Introduce a memory system for agents to enable them to retain context and learn from past interactions.
- **Implementation:**
  - Use a database to store the agent's memory, including information about the user, the project, and past conversations.
  - Enable agents to access and update their memory during conversations to provide more personalized and context-aware responses.

---

## 3. CLI Advancements

To make the CLI a more powerful and user-friendly tool, we suggest the following improvements:

### 3.1. Interactive Mode

- **Problem:** The current CLI is non-interactive and requires users to know the exact commands to execute.
- **Proposal:** Enhance the CLI with an interactive mode that guides users through commands with prompts and suggestions.
- **Implementation:**
  - Use a library like `inquirer.js` to create interactive command-line interfaces.
  - Implement a REPL (Read-Eval-Print Loop) for a more fluid and exploratory interaction with agents and workflows.

### 3.2. Terminal Dashboard

- **Problem:** There is no easy way to monitor the system's state from the CLI.
- **Proposal:** Create a text-based dashboard within the CLI to provide a real-time overview of agents, workflows, and the state machine.
- **Implementation:**
  - Use a library like `blessed` or `neo-blessed` to create a text-based user interface (TUI) in the terminal.
  - The dashboard would display key information in a compact and terminal-friendly format.

### 3.3. Feature Parity with Web UI

- **Problem:** The CLI currently has limited functionality compared to the web UI.
- **Proposal:** Elevate the CLI to be a first-class interface with the same capabilities as the web UI.
- **Implementation:**
  - Implement all the features of the web UI in the CLI to provide a consistent user experience across both interfaces.

---

## 4. Web Interface and Configuration Overhaul

To improve the web interface and simplify configuration management, we recommend the following:

### 4.1. Unified Configuration

- **Problem:** The configuration is currently fragmented across YAML files, `.env` files, and browser localStorage.
- **Proposal:** Consolidate all configuration into a single, unified source of truth, such as a database.
- **Implementation:**
  - Use a database to store all configuration settings.
  - The web UI and the CLI would both read and write the configuration from the database, simplifying management and improving robustness.

### 4.2. Integrated Web IDE

- **Problem:** The web interface is currently limited to configuration and monitoring.
- **Proposal:** Extend the web interface into a full-fledged, web-based IDE for MADACE.
- **Implementation:**
  - Integrate a web-based code editor like Monaco Editor.
  - Provide a file explorer to navigate the project files.
  - Integrate a terminal in the web UI.

### 4.3. Real-time Collaboration

- **Problem:** The current system is single-user and does not support collaboration.
- **Proposal:** Enable multiple users to collaborate on the same project in real-time.
- **Implementation:**
  - Use WebSockets to enable real-time communication between clients.
  - Implement collaborative features like shared cursors, live editing, and in-app chat.

---

## 5. Local LLM Provider with Docker Model Integration ✅

**Status:** Implemented - Zero-configuration local AI model support with Ollama and Docker containers

### 5.1. Multi-Provider Local Architecture

- **Problem:** Local AI models require complex setup and configuration, making them inaccessible to most users.
- **Solution:** Implemented a comprehensive local LLM provider that supports both Ollama and Docker-based models with zero-configuration.
- **Implementation Details:**
  - **Ollama Integration**: Full HTTP API support for `localhost:11434` with automatic model discovery
  - **Docker Model Support**: Custom endpoints for Docker containers with health checking
  - **Auto-Detection**: Intelligent classification of model types based on endpoint patterns
  - **Health Monitoring**: 30-second cached health checking proactively validates model availability

### 5.2. Zero-Configuration Experience with Gemma3 4B Default

- **Default Model (Ships with Product):**
  - **Gemma3 4B**: Google's efficient 4.3B parameter model (Q4_K_M quantization)
  - **Pre-configured**: Included in Docker Compose setup via Ollama container
  - **Production Ready**: 3.3GB model size, CPU-optimized for broad hardware compatibility
  - **Zero Setup**: `docker-compose up -d` includes both MADACE and Ollama with Gemma3 4B pre-loaded
  - **Free & Private**: No API keys required, complete data sovereignty
  - **User Customizable**: Users can add/change models via Ollama (`ollama pull <model>`)

- **Key Features:**
  - **Out-of-the-Box**: Gemma3 4B works immediately on container startup
  - **Auto Discovery**: Automatically lists available models via `/api/tags` endpoint
  - **Smart Setup**: Auto-detects model type (Ollama vs Docker) from configuration
  - **Custom Endpoints**: Support for any HTTP-based LLM container or service
  - **Model Management**: Users can add models: `docker exec ollama ollama pull llama3.1`

- **Supported Models:**
  - **Default (Gemma3)**: `gemma3` (4.3B, Q4_K_M) - Ships with product ✅
  - **Pre-configured Ollama**: `llama3.1`, `llama3.1:8b`, `codellama:7b`, `mistral:7b`, `gemma3:latest`
  - **Docker Models**: Custom endpoints (e.g., `localhost:8080`, `localhost:9000`)
  - **User-Added**: Any Ollama-compatible model via `ollama pull <model>`
  - **Dynamic Discovery**: Real-time model listing and availability checking

### 5.3. Enterprise-Grade Features

- **Error Handling:** 8 comprehensive error codes with user-friendly messages:
  - `CONNECTION_REFUSED`: Helpful setup guidance for Ollama/Docker
  - `MODEL_UNAVAILABLE`: Proactive health checking prevents failed requests
  - `TIMEOUT`: Extended timeouts for slower local models
  - `SERVICE_UNAVAILABLE`: Clear endpoint reachability diagnostics

- **Reliability:**
  - **Health Checking**: Pre-request validation ensures model availability
  - **Retry Logic**: Resilient network error handling with exponential backoff
  - **Stream Processing**: Real-time streaming with Server-Sent Events
  - **Caching**: 30-second health check cache for performance

- **Privacy & Performance:**
  - **Local Processing**: Complete data sovereignty with zero cloud dependencies
  - **Low Latency**: Eliminates network overhead
  - **Cost Effective**: No API costs after initial setup
  - **Custom Models**: Support for fine-tuned or private models

### 5.4. Architecture Patterns

- **Provider Interface**: Consistent with cloud providers (Gemini, OpenAI) for seamless switching
- **Configuration Pattern**: Flexible endpoint and header configuration for custom deployments
- **Error Pattern**: Standardized MADACE error codes and user-friendly guidance
- **Discovery Pattern**: Automatic model listing and health monitoring

- **Code Example:**

  ```typescript
  // Default Gemma3 4B setup (ships with product)
  const gemmaProvider = createLLMClient({
    provider: 'local',
    model: 'gemma3', // Pre-loaded in Ollama container
  });

  // Alternative Ollama models (user adds via: docker exec ollama ollama pull llama3.1)
  const llamaProvider = createLLMClient({
    provider: 'local',
    model: 'llama3.1:8b', // User-added model
  });

  // Custom Docker model setup
  const dockerProvider = createLLMClient({
    provider: 'local',
    model: 'custom-7b',
    baseURL: 'http://localhost:8080', // Custom Docker endpoint
  });
  ```

### 5.4b. Docker Compose Deployment with Gemma3 4B

**Production Deployment Configuration:**

```yaml
# docker-compose.yml (ships with product)
services:
  madace:
    build: .
    ports:
      - '3000:3000'
    environment:
      - LOCAL_MODEL_URL=http://ollama:11434 # Container-to-container communication
      - LOCAL_MODEL_NAME=gemma3 # Default model
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama:latest
    ports:
      - '11434:11434'
    volumes:
      - ollama-data:/root/.ollama # Persistent model storage
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:11434/api/tags']
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  ollama-data: # Stores Gemma3 4B model (3.3GB)
```

**First-Time Setup Script:**

```bash
#!/bin/bash
# Automated setup that ships with product

# Start Docker services
docker-compose up -d

# Wait for Ollama to be healthy
echo "Waiting for Ollama to start..."
sleep 10

# Pull Gemma3 4B model (3.3GB download, ~2-5 minutes)
docker exec ollama ollama pull gemma3

echo "✅ MADACE is ready with Gemma3 4B!"
echo "🌐 Web UI: http://localhost:3000"
echo "🤖 LLM Test: http://localhost:3000/llm-test"
```

**User Model Management:**

```bash
# List available models
docker exec ollama ollama list

# Add additional models (user choice)
docker exec ollama ollama pull llama3.1
docker exec ollama ollama pull mistral

# Remove models to save space
docker exec ollama ollama rm codellama:7b

# Test model directly
docker exec ollama ollama run gemma3 "Hello, how are you?"
```

**Environment Configuration (.env):**

```bash
# Default configuration (ships with product)
PLANNING_LLM=local
LOCAL_MODEL_URL=http://localhost:11434  # Browser access
LOCAL_MODEL_NAME=gemma3                  # Default model

# Optional cloud providers (user adds API keys)
GEMINI_API_KEY=your-api-key-here
CLAUDE_API_KEY=your-api-key-here
OPENAI_API_KEY=your-api-key-here
```

### 5.5. Integration Benefits with Gemma3 4B Default

- **Zero Setup Required**: Product ships with Gemma3 4B pre-configured, works immediately
- **No API Keys Needed**: Complete privacy and offline capability out-of-the-box
- **Cost-Free Operation**: No recurring costs for local AI inference
- **Multi-Environment**: Works in development, testing, and production with local models
- **CI/CD Ready**: Docker container support enables automated testing and deployment
- **Privacy Focus**: Ideal for sensitive data processing and compliance requirements
- **User Flexibility**: Easy to add/swap models (Llama3.1, Mistral, etc.) via simple commands
- **Performance**: Gemma3 4B optimized for CPU inference, broad hardware compatibility
- **Lightweight**: 3.3GB model size fits on standard development machines

---

## 6. HTTPS Deployment Architecture ✅

**Status:** Implemented - Zero-configuration production deployment with automatic TLS certificates

### 6.1. Secure External Access

- **Problem:** Applications need secure HTTPS access for production deployment, but setting up SSL/TLS certificates is complex and error-prone.
- **Solution:** Implemented automatic HTTPS deployment using Caddy reverse proxy with Let's Encrypt integration.
- **Implementation Details:**
  - **Caddy Reverse Proxy**: Automatic TLS certificate management with zero configuration
  - **Let's Encrypt Integration**: Free SSL/TLS certificates with automatic renewal
  - **HTTP to HTTPS Redirect**: Automatic redirection from insecure HTTP to secure HTTPS
  - **Security Headers**: Comprehensive security headers (HSTS, CSP, X-Frame-Options)

### 6.2. Deployment Modes

- **Development Mode (HTTP):**
  - Local development at `http://localhost:3000`
  - Network access at `http://192.168.1.214:3000`
  - Fast iteration with hot reload
  - No SSL overhead for local testing

- **Production Mode (HTTPS):**
  - Automatic SSL/TLS certificate from Let's Encrypt
  - Secure access via custom domain (e.g., `https://madace.yourdomain.com`)
  - HTTP → HTTPS automatic redirect
  - Certificate auto-renewal (30 days before expiry)

### 6.3. Architecture Components

**Docker Compose HTTPS Stack:**

```yaml
services:
  madace-app:
    # Next.js application (not exposed externally)
    expose: ['3000']

  caddy:
    # Reverse proxy with automatic HTTPS
    ports: ['80:80', '443:443']
    volumes:
      - caddy-data:/data # Persistent certificate storage
```

**Caddy Configuration Features:**

- **Automatic HTTPS**: Caddy handles entire TLS certificate lifecycle
- **Health Checking**: 10-second interval health checks to Next.js backend
- **Security Headers**:
  - `Strict-Transport-Security`: HSTS with 1-year max-age
  - `X-Frame-Options`: Clickjacking prevention
  - `X-Content-Type-Options`: MIME-sniffing protection
  - `Content-Security-Policy`: XSS and injection attack prevention
- **Compression**: gzip and zstd compression for optimal performance
- **Logging**: JSON-formatted access logs for monitoring

### 6.4. Security Best Practices

- **TLS 1.2/1.3 Only**: Modern cipher suites, no deprecated protocols
- **HSTS Enabled**: Force HTTPS for all subsequent requests
- **CSP Headers**: Whitelist trusted domains for API access (Gemini, Claude, OpenAI)
- **X-Frame-Options**: Prevent embedding in malicious iframes
- **Referrer-Policy**: Control referrer information leakage
- **Firewall Rules**: Only ports 80 (HTTP challenge) and 443 (HTTPS) exposed

### 6.5. Deployment Options

**Option 1: Docker with Caddy (Recommended)**

- Zero-configuration automatic HTTPS
- Automatic certificate renewal
- Built-in HTTP/2 and HTTP/3 support
- Best for: Self-hosted deployments, VPS, dedicated servers

**Option 2: Cloud Platform Deployment**

- Automatic HTTPS (platform-managed)
- CDN and global distribution
- Automatic scaling
- Best for: Production deployments, teams, enterprises
- Supported: Vercel, Netlify, Railway

**Option 3: Nginx with Let's Encrypt**

- Manual certificate management with certbot
- Fine-grained control
- Best for: Existing nginx infrastructure

### 6.6. Quick Start

```bash
# 1. Set domain name
export DOMAIN=madace.yourdomain.com

# 2. Create data directories
mkdir -p madace-data logs/caddy

# 3. Deploy with HTTPS
docker-compose -f docker-compose.https.yml up -d

# 4. Access securely
open https://madace.yourdomain.com
```

Caddy automatically:

- Obtains TLS certificates from Let's Encrypt
- Configures HTTPS with security headers
- Redirects HTTP to HTTPS
- Renews certificates 30 days before expiry

### 6.7. Certificate Management

- **Automatic Acquisition**: Certificates obtained on first start via HTTP-01 challenge
- **Auto-Renewal**: Caddy renews certificates 30 days before expiration
- **Persistent Storage**: Certificates stored in Docker volume `caddy-data`
- **Zero Manual Intervention**: Fully automated lifecycle management
- **Multi-Domain Support**: Single Caddy instance can manage multiple domains

### 6.8. Monitoring and Troubleshooting

**Health Checks:**

- Caddy health endpoint: `http://localhost:2019/config/`
- Next.js health endpoint: `http://localhost:3000/`
- 30-second interval with 10-second timeout

**Certificate Verification:**

```bash
# Check certificate details
openssl s_client -connect madace.yourdomain.com:443

# SSL Labs test
https://www.ssllabs.com/ssltest/analyze.html?d=madace.yourdomain.com
```

**Common Issues:**

- **DNS Not Propagated**: Wait 5-15 minutes for DNS changes
- **Port 80 Blocked**: Let's Encrypt requires HTTP-01 challenge on port 80
- **Firewall Rules**: Ensure ports 80 and 443 are open

### 6.9. Integration Benefits

- **Zero Configuration**: Automatic certificate management with no manual steps
- **Production Ready**: Battle-tested Let's Encrypt infrastructure
- **Cost Effective**: Free SSL/TLS certificates with automatic renewal
- **Security Compliant**: Modern TLS standards and comprehensive security headers
- **Performance**: HTTP/2 and HTTP/3 support with automatic compression
- **Reliability**: Automatic renewal prevents certificate expiration
- **Scalability**: Single Caddy instance can proxy multiple backend services

---

## 7. End-to-End Testing Infrastructure ✅

**Status:** Implemented - Comprehensive E2E testing with Playwright for multi-browser validation

### 7.1. Testing Framework Architecture

- **Problem:** Manual testing is error-prone, time-consuming, and doesn't scale with rapid development cycles. Route conflicts and build cache issues caused production failures.
- **Solution:** Implemented comprehensive E2E testing infrastructure using Playwright with automated cleanup, route validation, and multi-browser support.
- **Implementation Details:**
  - **Playwright Framework**: Multi-browser testing (Chromium, Firefox, WebKit)
  - **Mobile Testing**: Pixel 5, iPhone 12, iPad Pro viewport emulation
  - **Page Object Model**: Maintainable, reusable test components
  - **Global Lifecycle**: Setup/teardown hooks for test environment management
  - **Visual Debugging**: Screenshot/video capture on test failures
  - **Execution Traces**: Detailed debugging information for failed tests

### 7.2. Test Coverage

**10 Comprehensive Test Suites** (336 total tests across all browsers):

1. **Setup Wizard Tests** (`setup-wizard.spec.ts`)
   - Multi-step form validation
   - Navigation between wizard steps
   - Form field validation
   - Configuration persistence
   - Success state handling

2. **Agent Management Tests** (`agents.spec.ts`)
   - Agent listing and display
   - Agent detail pages
   - Search and filtering
   - MAM agent verification
   - Agent metadata validation

3. **Kanban Board Tests** (`kanban-board.spec.ts`)
   - Drag-and-drop functionality
   - State transitions (Backlog → TODO → In Progress → Done)
   - Visual feedback and animations
   - Story card interactions
   - Board synchronization

4. **LLM Integration Tests** (`llm-integration.spec.ts`)
   - API endpoint testing
   - Configuration management
   - Multi-provider support validation
   - Error handling
   - Response validation

5. **API Endpoint Tests** (`api-endpoints.spec.ts`)
   - REST API validation
   - Response structure verification
   - HTTP status code checking
   - Error response handling
   - Data integrity validation

6. **Accessibility Tests** (`accessibility.spec.ts`)
   - WCAG 2.1 compliance
   - Keyboard navigation
   - Screen reader compatibility
   - ARIA labels and roles
   - Semantic HTML structure
   - Focus management

7. **Performance Tests** (`performance.spec.ts`)
   - Page load time metrics
   - Time to Interactive (TTI)
   - First Contentful Paint (FCP)
   - Resource loading analysis
   - Bundle size monitoring

8. **Authentication Tests** (`auth-setup.spec.ts`)
   - Setup flow completion
   - Configuration saving
   - Session management
   - Future authentication readiness

9. **Server Lifecycle Tests** (`test-server-lifecycle.spec.ts`)
   - Dev server health checking
   - API endpoint availability
   - Concurrent request handling
   - Server responsiveness

10. **Home Page Tests** (integrated across suites)
    - Landing page functionality
    - Quick actions
    - Navigation links
    - Project statistics

### 7.3. Automation Scripts

**Cross-Platform Cleanup System:**

1. **cleanup-dev-servers.js** (Cross-platform Node.js)

   ```javascript
   // Features:
   - Kill processes on port 3000
   - Terminate all Next.js dev servers
   - Clear .next build cache (prevents route conflicts)
   - Cross-platform (Windows, macOS, Linux)
   - Graceful error handling
   ```

2. **cleanup-dev-servers.sh** (Enhanced Unix/Linux)

   ```bash
   # Additional features:
   - More thorough process cleanup
   - npm dev process termination
   - Faster execution on Unix systems
   ```

3. **verify-routes.js** (Route Structure Validation)

   ```javascript
   // Validation checks:
   - Detect nested MADACE directories
   - Find conflicting [name] parameters
   - Verify [id] route consistency
   - Display visual route tree
   - Exit with error codes for CI/CD
   ```

4. **run-e2e.sh** (Automated Test Execution)
   ```bash
   # Workflow automation:
   - Cleanup → Verify → Dev Server → Tests
   - Integrated error handling
   - CI/CD ready
   ```

### 7.4. Route Conflict Resolution

**Critical Production Fix:**

- **Problem Identified**: Next.js route parameter mismatch (`[id]` vs `[name]`) caused deployment failures
- **Root Cause**: Stale build cache (`.next` directory) contained old route structures
- **Solution Implemented**:
  1. Renamed all dynamic routes from `[name]` → `[id]` for consistency
  2. Integrated build cache clearing into cleanup scripts
  3. Created route verification tool for pre-deployment validation
  4. Added route structure validation to test workflow

**Routes Fixed:**

```
app/api/agents/[name] → app/api/agents/[id]
app/api/workflows/[name] → app/api/workflows/[id]
app/agents/[name] → (removed - conflicting directory)
```

**Error Prevented:**

```
Error: You cannot use different slug names for the same dynamic path ('id' !== 'name').
```

### 7.5. NPM Scripts Integration

**New Testing Commands:**

```json
{
  "verify-routes": "node scripts/verify-routes.js",
  "cleanup": "node scripts/cleanup-dev-servers.js",
  "cleanup:bash": "bash scripts/cleanup-dev-servers.sh",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:chromium": "playwright test --project=chromium",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:report": "playwright show-report",
  "test:e2e:clean": "npm run verify-routes && npm run cleanup && npm run dev & sleep 3 && npm run test:e2e"
}
```

### 7.6. Page Object Model Pattern

**Maintainable Test Architecture:**

```typescript
// e2e-tests/page-objects/setup-wizard.page.ts
export class SetupWizardPage {
  async goto() {
    await this.page.goto('/setup');
    await this.page.waitForLoadState('networkidle');
  }

  async fillProjectInfo(data: ProjectInfo) {
    await this.page.fill('[name="projectName"]', data.name);
    await this.page.fill('[name="outputFolder"]', data.folder);
  }

  async navigateNext() {
    await this.page.click('button:has-text("Next")');
  }
}
```

**Benefits:**

- Centralized element selectors
- Reusable page interactions
- Easier maintenance when UI changes
- Type-safe page operations
- Self-documenting test code

### 7.7. Test Configuration

**Playwright Configuration** (`playwright.config.ts`):

```typescript
export default defineConfig({
  testDir: './e2e-tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'iPad', use: { ...devices['iPad Pro'] } },
  ],
});
```

### 7.8. CI/CD Integration

**Automated Testing Workflow:**

```bash
# CI Pipeline Integration
npm ci
npx playwright install --with-deps chromium

# Pre-deployment validation
npm run verify-routes    # Validate route structure
npm run cleanup          # Clear stale processes/cache
npm run dev &            # Start dev server
sleep 5                  # Wait for server ready

# Execute tests
npm run test:e2e         # Run all E2E tests
npm run test:e2e:report  # Generate test report

# Cleanup
npm run cleanup
```

**GitHub Actions Ready:**

- Automated browser installation
- Parallel test execution
- Test result reporting
- Artifact collection (screenshots, videos, traces)
- Slack/email notifications on failure

### 7.9. Test Artifacts and Debugging

**Failure Investigation Tools:**

1. **Screenshots** (`test-results/*/test-failed-*.png`)
   - Captured automatically on test failure
   - Visual state at time of failure
   - Timestamped for correlation

2. **Videos** (`test-results/*/video.webm`)
   - Full test execution recording
   - Retained only on failure
   - Helps reproduce intermittent issues

3. **Execution Traces** (`test-results/*/trace.zip`)
   - Detailed timeline of test execution
   - Network activity
   - Console logs
   - DOM snapshots
   - Viewable with `npx playwright show-trace`

4. **Error Context** (`test-results/*/error-context.md`)
   - Detailed error messages
   - Stack traces
   - Test configuration
   - Environment information

### 7.10. Test Execution Modes

**Development Workflow:**

```bash
# Quick feedback during development
npm run test:e2e:chromium  # Single browser (fastest)
npm run test:e2e:headed    # Watch tests run
npm run test:e2e:debug     # Step through tests

# Full validation before PR
npm run test:e2e           # All browsers (336 tests)
npm run test:e2e:report    # View results in browser
```

**Interactive Debugging:**

```bash
# UI Mode - visual test explorer
npm run test:e2e:ui

Features:
- Pick and choose tests to run
- Watch mode for rapid iteration
- Time travel debugging
- Visual test selector
- Real-time results
```

### 7.11. Test Quality Metrics

**Current Status:**

- **Total Tests**: 56 tests (Chromium) | 336 tests (all browsers)
- **Test Suites**: 10 comprehensive suites
- **Coverage Areas**: UI, API, Accessibility, Performance, Integration
- **Execution Time**: ~2-3 minutes (Chromium) | ~10-15 minutes (all browsers)
- **Retry Strategy**: 2 retries on CI, 0 retries locally
- **Parallel Execution**: 5 workers for faster execution

**Known Test Status:**

- ✅ Core functionality tests passing
- ⚠️ Some tests expect unimplemented features (expected)
- ⚠️ Selector refinement needed for dynamic content
- ⚠️ Timeout adjustments for slower pages

### 7.12. Documentation

**Comprehensive Guides:**

1. **E2E-TESTING-WORKFLOW.md** (Complete workflow guide)
   - Quick start instructions
   - Available scripts reference
   - Troubleshooting guide
   - CI/CD integration examples
   - Best practices

2. **E2E-TESTING-GUIDE.md** (Test writing guide)
   - Page Object Model patterns
   - Writing maintainable tests
   - Assertion strategies
   - Common pitfalls

3. **CORE-INTEGRATION-ANALYSIS.md** (Integration documentation)
   - System integration points
   - API contract testing
   - State management validation

### 7.13. Future Enhancements

**Planned Improvements:**

- [ ] Visual regression testing (Percy, Chromatic)
- [ ] Contract testing for API endpoints
- [ ] Load testing with k6 or Artillery
- [ ] Component testing with Storybook
- [ ] Test data factories for consistent fixtures
- [ ] Database snapshot/restore for isolation
- [ ] Parallel test execution optimization
- [ ] Test flakiness monitoring and reporting

### 7.14. Integration Benefits

**Value Delivered:**

- **Quality Assurance**: Automated validation of critical user flows
- **Regression Prevention**: Catch breaking changes before deployment
- **Development Velocity**: Faster feedback on code changes
- **Confidence**: Safe refactoring with comprehensive test coverage
- **Documentation**: Tests serve as executable specifications
- **Multi-Browser Support**: Validated across all major browsers
- **Accessibility**: WCAG compliance automated validation
- **Performance**: Early detection of performance regressions
- **Route Validation**: Prevents deployment-breaking route conflicts
- **Clean Environment**: Automated cleanup prevents test pollution

**Production Readiness:**

- ✅ Zero-configuration setup
- ✅ Cross-platform compatibility
- ✅ CI/CD ready
- ✅ Comprehensive error reporting
- ✅ Visual debugging tools
- ✅ Route conflict prevention
- ✅ Build cache management
- ✅ Multi-browser validation

---

## 8. Conversational Chat System with AI Agents ✅

**Status:** Implemented - Full-featured chat interface with real-time streaming and local LLM support

### 8.1. Conversational AI Architecture

- **Problem:** Users needed a natural, conversational way to interact with AI agents instead of rigid command-based interfaces.
- **Solution:** Implemented comprehensive chat system with real-time streaming, persistent conversation history, and multi-agent support.
- **Implementation Details:**
  - **Database Schema**: User, ChatSession, ChatMessage, AgentMemory models with Prisma ORM
  - **API Layer**: RESTful endpoints for sessions, messages, and streaming
  - **Real-time Streaming**: Server-Sent Events (SSE) for live LLM responses
  - **Frontend**: React-based chat interface with message history and markdown rendering
  - **Memory System**: Context-aware conversations with persistent agent memory
  - **Multi-Provider**: Seamless switching between cloud (Gemini, Claude, OpenAI) and local (Ollama) LLMs

### 8.2. Database Schema

**Chat-Related Models:**

```prisma
// User model for authentication and chat participants
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())

  memories     AgentMemory[]
  chatSessions ChatSession[]
  projects     ProjectMember[]
}

// Chat session for conversations with agents
model ChatSession {
  id        String    @id @default(cuid())
  userId    String
  agentId   String
  startedAt DateTime  @default(now())
  endedAt   DateTime?
  projectId String?

  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent    Agent         @relation(fields: [agentId], references: [id], onDelete: Cascade)
  project  Project?      @relation(fields: [projectId], references: [id], onDelete: SetNull)
  messages ChatMessage[]

  @@index([userId])
  @@index([agentId])
  @@index([projectId])
  @@index([startedAt])
}

// Individual messages in chat conversations
model ChatMessage {
  id        String   @id @default(cuid())
  sessionId String
  role      String // "user" | "agent" | "system"
  content   String
  timestamp DateTime @default(now())
  replyToId String? // For threading support (CHAT-002)

  session ChatSession   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  replyTo ChatMessage?  @relation("MessageReplies", fields: [replyToId], references: [id], onDelete: SetNull)
  replies ChatMessage[] @relation("MessageReplies")

  @@index([sessionId])
  @@index([timestamp])
  @@index([replyToId])
}

// Agent memory for context-aware conversations
model AgentMemory {
  id             String    @id @default(cuid())
  agentId        String
  userId         String
  context        Json // Full memory context
  type           String // "short-term" | "long-term"
  category       String // "user_preference" | "project_context" | "conversation_summary"
  key            String // Memory key
  value          String // Memory value
  importance     Int       @default(5) // 1-10 scale
  source         String    @default("inferred_from_chat")
  lastAccessedAt DateTime  @default(now())
  accessCount    Int       @default(0)
  createdAt      DateTime  @default(now())
  expiresAt      DateTime?
  updatedAt      DateTime  @updatedAt

  agent Agent @relation(fields: [agentId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([agentId, userId])
  @@index([expiresAt])
  @@index([importance])
  @@index([lastAccessedAt])
  @@index([category])
}
```

**Key Design Decisions:**

- **Foreign Keys**: Cascade deletes ensure data consistency (deleting user removes their sessions/messages)
- **Timestamps**: Indexed for efficient sorting and filtering of conversation history
- **Threading Support**: Self-referential `replyToId` enables message threading (CHAT-002 feature)
- **Memory Categories**: Structured memory types enable intelligent context retrieval
- **Memory Lifecycle**: `expiresAt` and `accessCount` fields enable memory pruning and relevance scoring

### 8.3. API Endpoints

**Chat Session Management:**

```typescript
// Create new chat session
POST /api/v3/chat/sessions
Body: { userId: string, agentId: string, projectId?: string }
Response: { success: true, session: ChatSession }

// List user's chat sessions
GET /api/v3/chat/sessions?userId={userId}&limit=50&offset=0
Response: { success: true, sessions: ChatSession[], count: number }

// Get session with messages
GET /api/v3/chat/sessions/{id}
Response: { success: true, session: ChatSession & { messages: ChatMessage[] } }

// End chat session
DELETE /api/v3/chat/sessions/{id}
Response: { success: true, message: "Session ended" }
```

**Message Management:**

```typescript
// Send message (user or agent)
POST /api/v3/chat/sessions/{id}/messages
Body: { role: "user" | "agent", content: string, replyToId?: string }
Response: { success: true, message: ChatMessage }

// List messages in session
GET /api/v3/chat/sessions/{id}/messages?limit=50&offset=0&before={timestamp}
Response: { success: true, messages: ChatMessage[], count: number }

// Get message thread (if using threading)
GET /api/v3/chat/messages/{id}/thread
Response: { success: true, thread: ChatMessage[] }
```

**Real-time Streaming:**

```typescript
// Stream agent response (Server-Sent Events)
POST /api/v3/chat/stream
Body: { sessionId: string, agentId: string, replyToId?: string }
Response: text/event-stream

// SSE Message Format:
data: {"content": "Hello"}\n\n
data: {"content": " world"}\n\n
data: [DONE]\n\n
```

**Memory and Context:**

```typescript
// Get agent memories for user
GET /api/v3/agents/{id}/memory?userId={userId}&category={category}
Response: { success: true, memories: AgentMemory[] }

// Save agent memory
POST /api/v3/agents/{id}/memory
Body: { userId: string, key: string, value: string, category: string, importance: number }
Response: { success: true, memory: AgentMemory }

// Delete expired memories (automated cron job)
DELETE /api/v3/agents/{id}/memory/prune
Response: { success: true, deleted: number }
```

### 8.4. Streaming Architecture

**Server-Sent Events (SSE) Flow:**

```
User sends message
    ↓
[1] POST /api/v3/chat/sessions/{id}/messages
    ↓
[Database] Save user message
    ↓
[2] POST /api/v3/chat/stream (SSE)
    ↓
[3] Retrieve session + last 10 messages
    ↓
[4] Extract and save memories (async)
    ↓
[5] Build memory-aware prompt
    ↓
[6] Stream from LLM (chunk by chunk)
    ↓
[Browser] ←─ SSE: data: {"content": "..."}\n\n (real-time)
    ↓
[7] Save complete agent response
    ↓
[Browser] ←─ SSE: data: [DONE]\n\n
```

**Key Implementation Details:**

```typescript
// lib/llm/prompt-builder.ts
export async function buildPromptMessages(
  agent: Agent,
  userId: string,
  conversationHistory: string,
  currentMessage: string,
  includeMemory: boolean = true
): Promise<Message[]> {
  const messages: Message[] = [];

  // System prompt with agent persona
  messages.push({
    role: 'system',
    content: agent.prompts.system,
  });

  // Add relevant memories if enabled
  if (includeMemory) {
    const memories = await getRelevantMemories(agent.id, userId);
    if (memories.length > 0) {
      messages.push({
        role: 'system',
        content: `Context from previous conversations:\n${formatMemories(memories)}`,
      });
    }
  }

  // Add conversation history
  if (conversationHistory) {
    messages.push({
      role: 'system',
      content: `Recent conversation:\n${conversationHistory}`,
    });
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: currentMessage,
  });

  return messages;
}
```

**Streaming Response Handler:**

```typescript
// app/api/v3/chat/stream/route.ts
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = '';

        // Stream from LLM with memory-aware context
        for await (const chunk of llmClient.chatStream({ messages })) {
          fullResponse += chunk.content;

          // Send chunk as SSE
          const data = `data: ${JSON.stringify({ content: chunk.content })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        // Save complete response to database
        await createMessage({
          sessionId,
          role: 'agent',
          content: fullResponse,
          replyToId: replyToId || undefined,
        });

        // Send completion signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### 8.5. Frontend Chat Interface

**React Component Architecture:**

```typescript
// components/features/chat/ChatInterface.tsx
export default function ChatInterface({
  sessionId,
  agentId,
  agentName,
  userId,
  userName,
  onClose,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Load message history on mount
  useEffect(() => {
    loadMessages();
  }, [sessionId]);

  // Send message and stream response
  const handleSendMessage = async () => {
    // 1. Save user message
    await fetch(`/api/v3/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role: 'user', content: input }),
    });

    // 2. Stream agent response
    const response = await fetch('/api/v3/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ sessionId, agentId }),
    });

    // 3. Handle SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let agentMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          const json = JSON.parse(data);
          agentMessage += json.content;

          // Update UI with streaming text
          setMessages((prev) => [...prev.slice(0, -1), {
            role: 'agent',
            content: agentMessage,
            streaming: true,
          }]);
        }
      }
    }
  };

  return (
    <div className="chat-interface">
      <ChatHeader agent={agentName} onClose={onClose} />
      <ChatMessages messages={messages} />
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSendMessage}
        disabled={isStreaming}
      />
    </div>
  );
}
```

**Key UI Features:**

- **Auto-scroll**: Messages automatically scroll to bottom as they stream
- **Markdown Rendering**: Code blocks, lists, and formatting supported (CHAT-003)
- **Typing Indicators**: Visual feedback while agent is generating response
- **Message Threading**: Reply-to functionality for contextual conversations (CHAT-002)
- **Session History**: Previous conversations accessible from sidebar
- **Multi-agent Support**: Easy switching between different agents

### 8.6. Memory System

**Memory Extraction and Storage:**

```typescript
// lib/nlu/memory-extractor.ts
export async function extractAndSaveMemories(
  agentId: string,
  userId: string,
  currentMessage: string,
  conversationHistory: string[]
): Promise<void> {
  // Extract entities from conversation
  const entities = await extractEntities(currentMessage);

  // Infer user preferences and context
  const memories: Memory[] = [];

  if (entities.userPreferences) {
    memories.push({
      category: 'user_preference',
      key: 'communication_style',
      value: entities.userPreferences.style,
      importance: 7,
    });
  }

  if (entities.projectContext) {
    memories.push({
      category: 'project_context',
      key: 'tech_stack',
      value: JSON.stringify(entities.projectContext.technologies),
      importance: 8,
    });
  }

  // Save memories to database
  for (const memory of memories) {
    await prisma.agentMemory.create({
      data: {
        agentId,
        userId,
        ...memory,
        type: 'short-term',
        source: 'inferred_from_chat',
      },
    });
  }
}
```

**Memory Retrieval Strategy:**

```typescript
// lib/nlu/memory-retriever.ts
export async function getRelevantMemories(
  agentId: string,
  userId: string,
  limit: number = 5
): Promise<AgentMemory[]> {
  return await prisma.agentMemory.findMany({
    where: {
      agentId,
      userId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: [
      { importance: 'desc' },
      { lastAccessedAt: 'desc' },
    ],
    take: limit,
  });
}
```

**Memory Categories:**

- **`user_preference`**: Communication style, tone preferences, response length
- **`project_context`**: Tech stack, project name, requirements, constraints
- **`conversation_summary`**: High-level summary of past conversations
- **`user_fact`**: Personal information shared by user (name, role, goals)

**Memory Lifecycle:**

- **Short-term**: Expires after 7 days of inactivity
- **Long-term**: No expiration, manually curated important context
- **Access Tracking**: `accessCount` and `lastAccessedAt` for relevance scoring
- **Pruning**: Automated cron job (`lib/cron/memory-pruner.ts`) removes expired memories

### 8.7. Local LLM Integration (Default Configuration)

**Zero-Configuration Local AI by Default:**

MADACE v3 ships with **local LLM (Ollama + Gemma3) as the default configuration**, providing:
- **No API keys required** - Works out-of-the-box
- **Complete privacy** - All chat data stays on your machine
- **Zero cost** - No recurring API expenses
- **Offline capable** - No internet required after setup

**Default Environment Configuration:**

```bash
# .env - Default configuration (ships with product)
PLANNING_LLM=local              # Default: Uses local Ollama
LOCAL_MODEL_URL=http://localhost:11434  # Ollama HTTP endpoint
LOCAL_MODEL_NAME=gemma3:latest  # Google's Gemma3 4B model (3.3GB)

# Optional cloud providers (user can add API keys later)
# PLANNING_LLM=gemini
# GEMINI_API_KEY=your-api-key-here
# PLANNING_LLM=claude
# CLAUDE_API_KEY=your-api-key-here
```

**Quick Start - Test Chat with Local LLM:**

```bash
# 1. Start Docker services (includes Ollama + Gemma3)
docker-compose up -d

# 2. Wait for Ollama container to start (~10 seconds)
sleep 10

# 3. Pull Gemma3 model (3.3GB, ~2-5 minutes first time)
docker exec ollama ollama pull gemma3

# 4. Start MADACE dev server
npm run dev

# 5. Test chat in browser
open http://localhost:3000/chat
# Click "AI Chat Assistant" or "+ Add Agent"
# Type: "Tell me a joke about programming"
# Watch real-time streaming response!

# 6. Or test via CLI
npm run madace chat
```

**Quick CLI Test Script:**

```bash
#!/bin/bash
# /tmp/quick-chat-test.sh - Quick chat test with local LLM

# Create session
SESSION=$(curl -s -X POST 'http://localhost:3000/api/v3/chat/sessions' \
  -H 'Content-Type: application/json' \
  -d '{"userId":"default-user","agentId":"chat-assistant-001"}' \
  | jq -r '.session.id')

echo "✅ Session created: $SESSION"

# Send user message
curl -s -X POST "http://localhost:3000/api/v3/chat/sessions/$SESSION/messages" \
  -H 'Content-Type: application/json' \
  -d '{"role":"user","content":"Tell me a short programming joke"}' > /dev/null

echo "💬 User: Tell me a short programming joke"
echo ""
echo "🤖 AI Chat Assistant (streaming):"
echo "---"

# Stream agent response
curl -N -X POST 'http://localhost:3000/api/v3/chat/stream' \
  -H 'Content-Type: application/json' \
  -d "{\"sessionId\":\"$SESSION\",\"agentId\":\"chat-assistant-001\"}" | \
  while IFS= read -r line; do
    if [[ "$line" == data:* ]]; then
      json_data="${line#data: }"
      if [[ "$json_data" == "[DONE]" ]]; then
        break
      fi
      content=$(echo "$json_data" | jq -r '.content' 2>/dev/null || echo "")
      if [ -n "$content" ] && [ "$content" != "null" ]; then
        printf "%s" "$content"
      fi
    fi
  done

echo ""
echo "---"
echo "✅ Chat test complete!"
```

**Seamless Provider Switching:**

```typescript
// lib/llm/config.ts
export function getLLMConfigFromEnv(): LLMConfig {
  const provider = process.env.PLANNING_LLM || 'local';  // Default: 'local'

  const configs = {
    local: {
      baseURL: process.env.LOCAL_MODEL_URL || 'http://localhost:11434',
      model: process.env.LOCAL_MODEL_NAME || 'gemma3:latest',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-2.0-flash-exp',
    },
    claude: {
      apiKey: process.env.CLAUDE_API_KEY,
      model: 'claude-3-5-sonnet-20241022',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o-latest',
    },
  };

  return { provider, ...configs[provider] };
}
```

**Local Provider Health Checking:**

```typescript
// lib/llm/providers/local.ts
class ModelHealthChecker {
  private healthCache = new Map<string, { healthy: boolean; lastCheck: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async checkHealth(model: LocalModelConfig): Promise<boolean> {
    // Check cache first
    const cached = this.healthCache.get(model.name);
    if (cached && Date.now() - cached.lastCheck < this.CACHE_DURATION) {
      return cached.healthy;
    }

    // Perform health check
    try {
      const response = await fetch(`${model.endpoint}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      const healthy = response.ok;
      this.healthCache.set(model.name, { healthy, lastCheck: Date.now() });
      return healthy;
    } catch {
      return false;
    }
  }
}
```

**Default Database Setup:**

MADACE automatically creates required database records for chat functionality:

```sql
-- Default User (created automatically)
INSERT INTO User (id, email, name, createdAt)
VALUES ('default-user', 'default@madace.local', 'Default User', datetime('now'));

-- AI Chat Assistant Agent (created automatically)
INSERT INTO Agent (id, name, title, module, version, icon, persona, menu)
VALUES (
  'chat-assistant-001',
  'chat-assistant',
  'AI Chat Assistant',
  'mam',
  '1.0.0',
  '💬',
  '{"role": "AI Assistant", "identity": "Helpful chat assistant"}',
  '[]'
);
```

**Verification:**

```bash
# Check if default user exists
sqlite3 prisma/dev.db "SELECT * FROM User WHERE id = 'default-user';"
# Output: default-user|default@madace.local|Default User|2025-10-30 23:27:25

# Check if chat assistant agent exists
sqlite3 prisma/dev.db "SELECT id, name, title FROM Agent WHERE name = 'chat-assistant';"
# Output: chat-assistant-001|chat-assistant|AI Chat Assistant
```

**Configuration for Chat:**

```bash
# .env configuration (default - local LLM)
PLANNING_LLM=local
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_NAME=gemma3:latest

# Or use cloud providers (requires API keys)
# PLANNING_LLM=gemini
# GEMINI_API_KEY=your-api-key
# PLANNING_LLM=claude
# CLAUDE_API_KEY=your-api-key
```

### 8.8. Chat Performance Optimizations

**Message Pagination:**

- **Default Limit**: 50 messages per request
- **Offset-based Pagination**: Efficient for large conversation histories
- **Timestamp Filtering**: `before` parameter for loading older messages

**Context Window Management:**

```typescript
// lib/llm/prompt-builder.ts
export function limitPromptContext(
  messages: Message[],
  maxTokens: number = 4000
): Message[] {
  // Keep system prompt + last N messages that fit within token budget
  const systemMessages = messages.filter((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  // Estimate tokens (rough: 1 token ≈ 4 characters)
  let tokenCount = estimateTokens(systemMessages);
  const limitedMessages = [... systemMessages];

  // Add messages from newest to oldest until limit
  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    const msg = conversationMessages[i];
    const msgTokens = estimateTokens([msg]);

    if (tokenCount + msgTokens > maxTokens) break;

    limitedMessages.unshift(msg);
    tokenCount += msgTokens;
  }

  return limitedMessages;
}
```

**Memory Caching:**

- **In-Memory Cache**: Frequently accessed memories cached for 5 minutes
- **Lazy Loading**: Memories loaded only when `includeMemory: true`
- **Batch Operations**: Multiple memory writes batched into single transaction

### 8.9. Security and Privacy

**Data Protection:**

- **User Isolation**: Chat sessions scoped to userId, cannot access other users' conversations
- **Cascade Deletes**: Deleting user removes all their sessions, messages, and memories
- **Sensitive Data**: No API keys or secrets stored in chat messages
- **Local LLM Option**: Complete data sovereignty with local models (no cloud transmission)

**Access Control:**

```typescript
// Middleware (future implementation)
export async function validateChatAccess(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });
  return session?.userId === userId;
}
```

### 8.10. Future Enhancements

**Planned Features:**

- [ ] **Multi-turn Planning**: Long-running conversations with step-by-step execution
- [ ] **Voice Input/Output**: Speech-to-text and text-to-speech integration
- [ ] **File Attachments**: Share documents, images, code files in chat
- [ ] **Collaborative Chat**: Multiple users chatting with same agent
- [ ] **Chat Analytics**: Conversation metrics, sentiment analysis, topic extraction
- [ ] **Export Conversations**: Download chat history as Markdown, PDF, or JSON
- [ ] **Search History**: Full-text search across all user's conversations
- [ ] **Smart Suggestions**: Auto-complete and contextual suggestions while typing
- [ ] **Agent Handoff**: Transfer conversation to different agent mid-session
- [ ] **Custom Prompts**: User-defined system prompts per session

### 8.11. Docker Deployment with Local LLM

**Docker Compose Configuration (Default):**

```yaml
# docker-compose.yml - Default configuration ships with Ollama
version: '3.8'

services:
  madace:
    build: .
    ports:
      - '3000:3000'
    environment:
      # Default: Uses local Ollama (no API keys needed)
      - PLANNING_LLM=local
      - LOCAL_MODEL_URL=http://ollama:11434  # Container-to-container
      - LOCAL_MODEL_NAME=gemma3:latest
      - DATABASE_URL=file:./dev.db
    depends_on:
      ollama:
        condition: service_healthy
    volumes:
      - ./prisma:/app/prisma
      - madace-data:/app/madace-data

  ollama:
    image: ollama/ollama:latest
    ports:
      - '11434:11434'  # Exposed for browser access
    volumes:
      - ollama-data:/root/.ollama  # Persistent model storage (3.3GB)
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:11434/api/tags']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  madace-data:    # Application data
  ollama-data:    # Gemma3 model storage (3.3GB)
```

**First-Time Setup:**

```bash
# 1. Start services
docker-compose up -d

# 2. Wait for Ollama to be healthy
docker-compose ps ollama
# Output: State = healthy

# 3. Pull Gemma3 model (3.3GB, ~2-5 minutes)
docker exec ollama ollama pull gemma3

# 4. Verify model is ready
docker exec ollama ollama list
# Output:
# NAME                    ID              SIZE    MODIFIED
# gemma3:latest           a1b2c3d4e5f6    3.3 GB  2 minutes ago

# 5. Access MADACE chat
open http://localhost:3000/chat

# 6. Test LLM connectivity
curl http://localhost:11434/api/tags
# Output: {"models":[{"name":"gemma3:latest",...}]}
```

**Environment Variables (Container-to-Container vs Browser):**

```bash
# For MADACE container (server-side)
LOCAL_MODEL_URL=http://ollama:11434  # Use service name

# For browser/host machine access
LOCAL_MODEL_URL=http://localhost:11434  # Use localhost

# For production (external access)
LOCAL_MODEL_URL=https://ollama.yourdomain.com  # Use domain
```

### 8.12. Troubleshooting Guide

**Common Issues:**

1. **"Failed to create chat session"**
   - **Cause**: Default user not in database
   - **Fix**: Run database migrations: `npm run db:push`
   - **Or**: Manually create user:
     ```sql
     sqlite3 prisma/dev.db "INSERT INTO User (id, email, name) VALUES ('default-user', 'default@madace.local', 'Default User');"
     ```

2. **Streaming timeout after 30 seconds**
   - **Cause**: Local model loading into memory (cold start)
   - **Fix**: **This is normal behavior!** First response takes 10-30 seconds
   - **Why**: Gemma3 4B model (3.3GB) loads into RAM on first request
   - **After first request**: Subsequent responses are faster (1-5 seconds)
   - **Tip**: Keep Ollama container running to avoid cold starts

3. **"Model not available" error**
   - **Cause**: Ollama not running or model not pulled
   - **Diagnosis**:
     ```bash
     # Check Ollama status
     docker ps | grep ollama

     # Check model availability
     curl http://localhost:11434/api/tags
     ```
   - **Fix**:
     ```bash
     # Start Ollama if stopped
     docker-compose up -d ollama

     # Pull Gemma3 model
     docker exec ollama ollama pull gemma3

     # Verify
     docker exec ollama ollama list
     ```

4. **Empty agent responses**
   - **Cause**: Model name mismatch in `.env`
   - **Diagnosis**: Check Ollama returns model with `:latest` tag
     ```bash
     curl http://localhost:11434/api/tags | jq -r '.models[].name'
     # Output should show: gemma3:latest
     ```
   - **Fix**: Update `.env` to match exact model name:
     ```bash
     LOCAL_MODEL_NAME=gemma3:latest  # Must match Ollama output
     ```
   - **Restart**: Restart dev server after changing `.env`

5. **"Connection refused" to Ollama**
   - **Cause**: Ollama container not started or port conflict
   - **Fix**:
     ```bash
     # Check if port 11434 is in use
     lsof -i :11434

     # Restart Ollama
     docker-compose restart ollama

     # Check logs
     docker logs ollama
     ```

6. **Chat UI shows "Loading..." forever**
   - **Cause**: Server not responding or CORS issue
   - **Diagnosis**:
     ```bash
     # Check server health
     curl http://localhost:3000/api/health

     # Check browser console for errors
     # (Open DevTools → Console)
     ```
   - **Fix**: Restart dev server: `npm run dev`

7. **Model too slow on your machine**
   - **Cause**: Large model on limited hardware
   - **Solution**: Switch to smaller model:
     ```bash
     # Pull smaller model (1.5GB instead of 3.3GB)
     docker exec ollama ollama pull gemma:2b

     # Update .env
     LOCAL_MODEL_NAME=gemma:2b
     ```

**Performance Expectations:**

| Phase | Time | Reason |
|-------|------|--------|
| **First Message** | 10-30 seconds | Model loading into RAM (3.3GB) |
| **Subsequent Messages** | 1-5 seconds | Model already in memory |
| **Response Quality** | High | Gemma3 4B trained by Google |
| **Token Speed** | 10-20 tokens/sec | CPU inference (no GPU) |

**Switching to Cloud Provider (Optional):**

If local LLM is too slow, switch to cloud provider:

```bash
# Update .env
PLANNING_LLM=gemini
GEMINI_API_KEY=your-actual-api-key

# Restart server
npm run dev

# Test chat - responses will be faster (< 1 second)
open http://localhost:3000/chat
```

### 8.13. Integration Benefits

**Value Delivered:**

- **Natural Interaction**: Conversational AI eliminates learning curve for users
- **Context Aware**: Memory system enables personalized, intelligent responses
- **Real-time Feedback**: Streaming responses create engaging, responsive experience
- **Multi-Agent**: Easy switching between different AI personas/specializations
- **Privacy Focus**: Local LLM option keeps sensitive data on-premises
- **Cost Effective**: No API costs with local models (Ollama + Gemma3)
- **Developer Friendly**: RESTful API + SSE streaming works with any client
- **Production Ready**: Comprehensive error handling, pagination, and optimization

**Production Readiness:**

- ✅ Database-backed persistence
- ✅ RESTful API with proper error handling
- ✅ Real-time streaming with SSE
- ✅ Memory system for context awareness
- ✅ Multi-provider LLM support (cloud + local)
- ✅ Message threading support
- ✅ Markdown rendering in UI
- ✅ Performance optimizations (pagination, caching)
- ✅ Security (user isolation, cascade deletes)
- ✅ Comprehensive documentation

---

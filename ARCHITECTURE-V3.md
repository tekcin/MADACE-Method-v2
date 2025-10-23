# MADACE-Method v3.0 - Proposed Architecture

**Project:** MADACE-Method v3.0
**Version:** 3.0.0-alpha
**Document Status:** Proposal

> This document outlines the proposed architecture for the next major version of the MADACE-Method, focusing on enhancing the capabilities of agents, the CLI, and the web interface.

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

### 5.2. Zero-Configuration Experience

- **Key Features:**
  - **Out-of-the-Box**: Works immediately with Ollama running at default port
  - **Auto Discovery**: Automatically lists available models via `/api/tags` endpoint
  - **Smart Setup**: Auto-detects model type (Ollama vs Docker) from configuration
  - **Custom Endpoints**: Support for any HTTP-based LLM container or service

- **Supported Models:**
  - **Pre-configured Ollama**: `llama3.1`, `llama3.1:8b`, `codellama:7b`, `mistral:7b`
  - **Docker Models**: Custom endpoints (e.g., `localhost:8080`, `localhost:9000`)
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
  // Zero-configuration Ollama setup
  const ollamaProvider = createLLMClient({
    provider: 'local',
    model: 'llama3.1:8b', // Auto-detected as Ollama
  });

  // Custom Docker model setup
  const dockerProvider = createLLMClient({
    provider: 'local',
    model: 'custom-7b',
    baseURL: 'http://localhost:8080', // Custom Docker endpoint
  });
  ```

### 5.5. Integration Benefits

- **Multi-Environment**: Works in development, testing, and production with local models
- **CI/CD Ready**: Docker container support enables automated testing and deployment
- **Privacy Focus**: Ideal for sensitive data processing and compliance requirements
- **Cost Control**: Eliminates recurring API costs for high-volume usage
- **Performance**: Substantially reduced latency for repetitive or batch processing

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

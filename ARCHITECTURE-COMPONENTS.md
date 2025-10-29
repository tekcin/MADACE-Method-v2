# MADACE-Method v3.0 - Component Breakdown

> This document breaks down the proposed architecture for MADACE-Method v3.0 into smaller, more manageable modules and components.

---

## 1. Core Modules

### 1.1. Database Module

- **Description:** This module will be responsible for all database interactions, providing a clean and consistent API for accessing and manipulating data.
- **Sub-modules:**
  - **Agent Model:** Manages the storage and retrieval of agent definitions.
  - **Config Model:** Manages the storage and retrieval of all configuration settings.
  - **Memory Model:** Manages the storage and retrieval of agent memory.
- **Technology:** Prisma ORM with a choice of database (e.g., SQLite for simplicity, PostgreSQL for production).

### 1.2. API Module

- **Description:** This module will expose the public-facing API for the web UI and CLI. It will be a RESTful API built with Next.js API Routes.
- **Sub-modules:**
  - **Agents API:** Provides endpoints for managing agents (CRUD operations).
  - **Workflows API:** Provides endpoints for executing and managing workflows.
  - **Config API:** Provides endpoints for managing configuration settings.
- **Technology:** Next.js API Routes, Zod for validation.

### 1.3. Local LLM Provider Module ✅

- **Description:** This module provides comprehensive local AI model support with zero-configuration setup for both Ollama and Docker-based models.
- **Status:** Fully implemented with enterprise-grade features and health monitoring.
- **Components:**
  - **Local Provider Interface:** Unified interface for all local model providers (Ollama, Docker).
  - **Ollama Provider:** Implements the local provider interface for Ollama HTTP API.
  - **Docker Provider:** Extends local provider for custom Docker container models.
  - **Model Discovery:** Automatic model listing and health checking system.
  - **Health Checker:** Cached health monitoring with 30-second TTL for performance.
- **Technology:** TypeScript, HTTP APIs, Server-Sent Events (SSE), Docker networking.
- **Sub-modules:**
  - **Health Check Components:** Pre-request validation and model availability monitoring.
  - **Model Auto-Discovery:** Ollama `/api/tags` integration and Docker endpoint scanning.
  - **Error Handler:** Comprehensive error mapping and user-friendly guidance.
  - **Configuration Parser** : Flexible endpoint and header configuration system.
  - **Stream Processor:** Server-Sent Events parser with flexible format handling.

### 1.4. NLU Module

- **Description:** This module will be responsible for Natural Language Understanding, providing an abstraction layer over different NLU providers.
- **Sub-modules:**
  - **NLU Provider Interface:** Defines a common interface for all NLU providers.
  - **Dialogflow Provider:** Implements the NLU provider interface for Google Dialogflow.
  - **Rasa Provider:** Implements the NLU provider interface for Rasa.
- **Technology:** TypeScript, with libraries for interacting with NLU providers.

---

## 2. Agent Modules

### 2.1. Agent Manager

- **Description:** This module will be responsible for the lifecycle of agents, including creation, reading, updating, and deleting.
- **Components:**
  - **Agent Form (Web UI):** A form in the web UI for creating and editing agents.
  - **Agent CLI Commands:** A set of CLI commands for managing agents.
- **Dependencies:** Database Module, API Module.

### 2.2. Agent RAG and Memory

- **Description:** This module will provide agents with a memory and the ability to use Retrieval-Augmented Generation (RAG).
- **Components:**
  - **Memory Store:** A component for storing and retrieving agent memory from the database.
  - **RAG Pipeline:** A component for implementing the RAG pipeline, which involves retrieving relevant information from a knowledge base and using it to generate responses.
- **Dependencies:** Database Module, NLU Module.

### 2.3. Conversational Engine

- **Description:** This module will be responsible for handling conversations with agents.
- **Components:**
  - **Dialogue Manager:** A component for managing the flow of conversations.
  - **Intent Recognizer:** A component for recognizing the user's intent from their input.
  - **Response Generator:** A component for generating responses to the user.
- **Dependencies:** NLU Module, Agent RAG and Memory.

---

## 3. CLI Modules

### 3.1. Interactive CLI

- **Description:** This module will provide an interactive and user-friendly command-line interface.
- **Components:**
  - **Command Parser:** A component for parsing user commands.
  - **Interactive Prompts:** A set of interactive prompts for guiding the user.
  - **REPL:** A Read-Eval-Print Loop for interactive sessions.
- **Technology:** `inquirer.js`, `commander.js`.

### 3.2. CLI Dashboard

- **Description:** This module will display a text-based dashboard in the terminal.
- **Components:**
  - **Dashboard Layout:** A component for defining the layout of the dashboard.
  - **Dashboard Widgets:** A set of widgets for displaying information about agents, workflows, and the state machine.
- **Technology:** `blessed`, `neo-blessed`.

---

## 4. Web UI Modules

### 4.1. Web IDE

- **Description:** This module will provide a full-fledged web-based IDE for MADACE.
- **Components:**
  - **Code Editor:** A web-based code editor (e.g., Monaco Editor).
  - **File Explorer:** A file explorer for navigating the project files.
  - **Terminal:** An integrated terminal in the web UI.
- **Technology:** React, Monaco Editor, xterm.js.

### 4.2. Real-time Collaboration

- **Description:** This module will enable real-time collaboration between multiple users.
- **Components:**
  - **WebSocket Server:** A WebSocket server for real-time communication.
  - **Collaborative Editor:** A collaborative code editor that supports shared cursors and live editing.
  - **Chat:** A chat component for real-time communication between users.
- **Technology:** WebSockets, Y.js for collaborative editing.

### 4.3. Chat Interface

- **Description:** This module will provide a chat interface for conversational interaction with agents.
- **Components:**
  - **Chat Window:** A chat window for displaying the conversation.
  - **Message Input:** A message input field for sending messages to the agent.
- **Technology:** React, with a state management library like Zustand or Redux.

---

## 5. Deployment and Infrastructure Modules

### 5.1. HTTPS Deployment Module ✅

- **Description:** This module provides zero-configuration production deployment with automatic TLS certificate management for secure external access.
- **Status:** Fully implemented with Caddy reverse proxy and Let's Encrypt integration.
- **Components:**
  - **Caddy Reverse Proxy:** Automatic HTTPS with Let's Encrypt certificates
  - **Certificate Manager:** Zero-configuration TLS certificate lifecycle management
  - **Security Headers:** Comprehensive security headers (HSTS, CSP, X-Frame-Options)
  - **HTTP to HTTPS Redirect:** Automatic redirection for secure access
- **Technology:** Caddy 2.7, Docker Compose, Let's Encrypt.
- **Sub-modules:**
  - **Certificate Acquisition:** HTTP-01 challenge with automatic DNS verification
  - **Auto-Renewal:** 30-day pre-expiration automatic certificate renewal
  - **Health Monitoring:** Backend health checking with 10-second intervals
  - **Access Logging:** JSON-formatted access logs for monitoring
  - **Compression:** gzip and zstd compression for optimal performance

### 5.2. Docker Deployment Module ✅

- **Description:** This module provides containerized deployment for both development and production environments.
- **Status:** Fully implemented with multi-stage builds and volume persistence.
- **Components:**
  - **Production Container:** Optimized Next.js production build
  - **Development Container:** VSCode Server and Cursor IDE integration
  - **Data Persistence:** Named volumes for configuration and user data
  - **Network Isolation:** Internal Docker network for service communication
- **Technology:** Docker, Docker Compose, multi-stage builds.
- **Sub-modules:**
  - **Multi-Stage Build:** Separate dependency, build, and runtime stages
  - **Volume Management:** Persistent storage for config, agents, workflows
  - **Health Checks:** Application and reverse proxy health monitoring
  - **Network Configuration:** Bridge network with service discovery

### 5.3. Security Module ✅

- **Description:** This module implements comprehensive security best practices for production deployments.
- **Status:** Fully implemented with multiple security layers.
- **Components:**
  - **TLS Configuration:** TLS 1.2/1.3 only with modern cipher suites
  - **Security Headers:** HSTS, CSP, X-Frame-Options, X-Content-Type-Options
  - **Firewall Rules:** Port access control (80, 443 only)
  - **API Key Protection:** Environment variable management with git-ignore
- **Technology:** Caddy security headers, Docker secrets, environment variables.
- **Sub-modules:**
  - **HSTS Enforcement:** Strict-Transport-Security with 1-year max-age
  - **Content Security Policy:** Whitelist for trusted LLM API domains
  - **Clickjacking Prevention:** X-Frame-Options SAMEORIGIN
  - **MIME Sniffing Protection:** X-Content-Type-Options nosniff
  - **Referrer Policy:** strict-origin-when-cross-origin

---

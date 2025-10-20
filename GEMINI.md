# GEMINI.md

## Project Overview

This project is MADACE-Method v2.0, a next-generation human-AI collaboration framework. It features a dual interface (Web UI and CLI) and is built with a modern technology stack.

The architecture is designed to be modular, scalable, and high-performance, leveraging the strengths of each technology.

- **Frontend:** A Next.js (React) application running on Node.js. It provides the user interface.
- **Backend:** A Python application (using a framework like FastAPI) that serves a REST API. It orchestrates the business logic.

**Key Technologies:** Next.js 15, React 19, TypeScript 5, Node.js 20+, Tailwind CSS 4, Zod.

## Building and Running

### Prerequisites

- **For Production Deployment (Docker):** Docker 20.10+ and Docker Compose.
- **For Development (Docker with IDEs):** Docker 20.10+ and Docker Compose.
- **For Local Development (No Docker):** Node.js 20+, npm 9+ or pnpm.

### Quick Start (Local Development)

1.  **Clone and install dependencies:**
    ```bash
    git clone https://github.com/tekcin/MADACE-Method-v2.git
    cd MADACE-Method-v2
    npm install
    ```
2.  **Start development server:**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`

### Quick Start (Development Container - Recommended for Development)

1.  **Clone repository:**
    ```bash
    git clone https://github.com/tekcin/MADACE-Method-v2.git
    cd MADACE-Method-v2
    ```
2.  **Create data folder:**
    ```bash
    mkdir madace-data
    ```
3.  **Start development container:**
    ```bash
    docker-compose -f docker-compose.dev.yml up -d
    ```
    Access:
    - VSCode Server: `http://localhost:8080` (password: `madace123`)
    - Next.js: `http://localhost:3000`
    - Cursor: `http://localhost:8081`

### Production Deployment (Docker)

1.  **Create data folder:**
    ```bash
    mkdir madace-data
    ```
2.  **Build and run production container:**
    ```bash
    docker-compose up -d
    ```
    Access web UI at `http://localhost:3000`

## Development Conventions

- **Language:** TypeScript with strict mode.
- **Validation:** Zod for all validation.
- **Code Quality:** ESLint and Prettier for linting and formatting.
  - `npm run lint` - Check for linting errors
  - `npm run lint:fix` - Auto-fix linting errors
  - `npm run format` - Format all code with Prettier
  - `npm run format:check` - Check if code is formatted
  - `npm run check-all` - Run type checking, linting, and format check
- **Documentation:** JSDoc comments for public APIs. Update documentation when adding features.
- **Testing:** Test on both development and production Docker containers.
- **API Communication:** The Next.js frontend should communicate with the Python backend via a well-defined REST API.
- **Modularity:** Each tier (frontend, backend, core) should be as independent as possible.
- **Testing:** Each tier should have its own set of tests:
  - **Frontend:** Unit and component tests with a framework like Jest and React Testing Library.
  - **Backend:** Unit and integration tests with a framework like Pytest.
  - **Core:** Unit and integration tests with `cargo test`.

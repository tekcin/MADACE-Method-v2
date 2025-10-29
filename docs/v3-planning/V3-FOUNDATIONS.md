# MADACE v3.0 - Foundation Requirements (Inherited from v2.0)

**Version:** 3.0.0
**Status:** MANDATORY - All v3.0 Development MUST Maintain These Foundations
**Created:** 2025-10-29
**Source:** v2.0 Alpha MVP (43 stories, 249 points)

> **⚠️ CRITICAL: NON-NEGOTIABLE REQUIREMENTS**
>
> This document defines the **immutable foundation** that v3.0 is built upon.
> All v3.0 features MUST maintain these standards, policies, and implementations.
> Deviations require Architecture Decision Record (ADR) justification.

---

## Executive Summary

MADACE v3.0 inherits a **battle-tested foundation** from v2.0 Alpha MVP:

- ✅ **43 stories completed, 249 points delivered** (124.5 points/week velocity)
- ✅ **100% reproducible builds** (4-layer version locking)
- ✅ **Immutable testing policy** (tests = contract, 75+ tests passing)
- ✅ **Production-ready** (Docker, TypeScript strict mode, comprehensive docs)
- ✅ **Enterprise-grade quality** (type-check, lint, format, build automation)

**v3.0 Development Mandate:**

- MAINTAIN all v2.0 foundations
- EXTEND capabilities with new features
- NEVER break existing quality standards
- ALWAYS follow established patterns

---

## 1. Version Locking Enforcement (4-Layer Architecture)

**Policy:** [ADR-004-version-locking-enforcement.md](../adrs/ADR-004-version-locking-enforcement.md)
**Documentation:** [VERSION-LOCK.md](../../VERSION-LOCK.md)
**Validation:** `scripts/validate-versions.js`

### 1.1 Core Principle

**All dependencies MUST use exact versions (no ^ or ~)**

```json
// ✅ CORRECT
"next": "15.5.6"

// ❌ FORBIDDEN
"next": "^15.5.6"
"react": "~19.2.0"
```

### 1.2 Enforcement Layers

**Layer 1: Pre-install Prevention**

```ini
# .npmrc (IMMUTABLE)
save-exact=true
engine-strict=true
```

**Layer 2: Post-install Validation**

```bash
npm install  # Triggers validate-versions.js automatically
```

**Layer 3: Pre-commit Gates** (Future - CI/CD)

- Validate package.json before commit
- Reject commits with version ranges

**Layer 4: CI/CD Validation** (Future)

- Build fails if versions don't match lock file
- Automated dependency updates with review

### 1.3 Node.js Version Pinning

```bash
# .nvmrc (IMMUTABLE)
24.10.0
```

**All developers MUST use Node.js 24.10.0** (enforced via .nvmrc + engine-strict)

### 1.4 Current Locked Dependencies (v2.0.0-alpha)

**Core Framework:**

- next: `15.5.6`
- react: `19.2.0`
- react-dom: `19.2.0`
- typescript: `5.8.3`

**Build Tools:**

- eslint: `9.19.0`
- prettier: `3.5.2`
- tailwindcss: `4.1.15`

**Runtime:**

- zod: `3.24.1`
- js-yaml: `4.1.0`
- handlebars: `4.7.8`
- ws: `8.18.0`

**Testing:**

- jest: `30.2.0`
- @playwright/test: `1.50.1`

**Full list:** See `package.json` (24 exact dependencies)

### 1.5 v3.0 Requirements

✅ **MUST:** Maintain exact versions for all v2.0 dependencies
✅ **MUST:** Add NEW dependencies with exact versions only
✅ **MUST:** Run `npm run validate-versions` before every commit
✅ **MUST:** Update dependencies via explicit ADR process
❌ **NEVER:** Use ^ or ~ in package.json
❌ **NEVER:** Manually edit package-lock.json

---

## 2. Immutable Testing Policy

**Policy:** [TESTING-POLICY.md](../../TESTING-POLICY.md)
**Philosophy:** Tests = Requirements = Contract

### 2.1 Core Principle

**Tests are IMMUTABLE. When tests fail, fix the implementation, NOT the tests.**

```typescript
// ❌ FORBIDDEN: Changing test to match broken implementation
it('should return 5', () => {
  expect(add(2, 2)).toBe(5); // Changed from 4 to 5 to make test pass
});

// ✅ CORRECT: Fix implementation to match test contract
function add(a: number, b: number): number {
  return a + b; // Fixed implementation
}
```

### 2.2 Test Modification Rules

**Tests can ONLY be modified when:**

1. **Requirements changed** (with ADR justification)
2. **Test had a bug** (not testing what it claims to test)
3. **Refactoring** (same behavior, clearer test)
4. **Coverage expansion** (adding new test cases, not changing existing)

**Every test modification REQUIRES:**

- ADR documenting reason
- Code review approval
- Confirmation that implementation change is not the right fix

### 2.3 Current Test Coverage (v2.0 Alpha)

**75+ tests across 5 test suites:**

| Module                | Tests | Status            |
| --------------------- | ----- | ----------------- |
| Complexity Assessment | 75    | ✅ 100% pass      |
| Agent Loader          | 15+   | ✅ 85.7% coverage |
| LLM Client            | 10+   | ✅ 90% coverage   |
| State Machine         | 12+   | ✅ 78.5% coverage |
| API Routes            | 8+    | ✅ 100% coverage  |

**Test Infrastructure:**

- Jest 30.2.0 with ts-jest
- Playwright 1.50.1 for E2E
- Coverage reporting enabled
- Mocking strategies documented

### 2.4 v3.0 Requirements

✅ **MUST:** Maintain 100% pass rate for all v2.0 tests
✅ **MUST:** Add NEW tests for NEW features (95%+ coverage target)
✅ **MUST:** Follow immutable testing policy for all test changes
✅ **MUST:** Document test changes via ADR
❌ **NEVER:** Change existing tests to make implementation pass
❌ **NEVER:** Reduce test coverage below v2.0 baseline

---

## 3. Architecture Foundations (Next.js 15 Full-Stack TypeScript)

**Decision:** [ADR-003-architecture-simplification.md](../adrs/ADR-003-architecture-simplification.md)
**Documentation:** [ARCHITECTURE.md](../../ARCHITECTURE.md)

### 3.1 Core Architecture

**Single Runtime, Single Language:**

- Runtime: Node.js 24.10.0
- Language: TypeScript 5.8.3 (strict mode)
- Framework: Next.js 15.5.6 (App Router)
- UI: React 19.2.0
- Styling: Tailwind CSS 4.1.15

### 3.2 Project Structure (IMMUTABLE)

```
/Users/nimda/MADACE-Method-v2.0/
├── app/                    # Next.js App Router (pages, layouts, API routes)
├── lib/                    # Business logic (TypeScript modules)
│   ├── agents/            # Agent system (loader, runtime, types)
│   ├── workflows/         # Workflow engine (executor, types, schemas)
│   ├── state/             # State machine (lifecycle, transitions)
│   ├── templates/         # Template engine (Handlebars)
│   ├── config/            # Configuration manager
│   ├── llm/               # Multi-provider LLM client
│   ├── cli/               # CLI integration
│   ├── sync/              # WebSocket sync service
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── components/            # React components
│   ├── features/          # Feature components
│   └── ui/                # UI primitives
├── madace/                # MADACE agents/workflows (built-in)
│   └── mam/
│       ├── agents/        # 5 MAM agents (PM, Analyst, Architect, SM, DEV)
│       └── workflows/     # Example workflows
├── madace-data/           # User data (Docker volume mount)
├── __tests__/             # Unit/integration tests
├── e2e-tests/             # End-to-end tests (Playwright)
└── docs/                  # Documentation
```

### 3.3 TypeScript Strict Mode (MANDATORY)

```json
// tsconfig.json (IMMUTABLE SETTINGS)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 3.4 v3.0 Requirements

✅ **MUST:** Maintain Next.js 15 App Router architecture
✅ **MUST:** Use TypeScript strict mode for ALL new code
✅ **MUST:** Follow established directory structure
✅ **MUST:** Place business logic in `lib/`, not `app/`
❌ **NEVER:** Add `any` types without explicit justification
❌ **NEVER:** Disable TypeScript strict mode checks

---

## 4. Quality Standards & Automation

### 4.1 Code Quality Tools (MANDATORY)

**ESLint 9.19.0:**

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
```

**Prettier 3.5.2:**

```bash
npm run format        # Format all files
npm run format:check  # Check formatting (CI)
```

**TypeScript Compiler:**

```bash
npm run type-check    # Type-check without emit
```

**Combined Quality Check:**

```bash
npm run check-all     # type-check + lint + format:check (MUST pass before commit)
```

### 4.2 Pre-Commit Requirements

**All commits MUST pass:**

1. ✅ TypeScript type-check (0 errors)
2. ✅ ESLint (0 errors, warnings allowed)
3. ✅ Prettier formatting
4. ✅ Production build succeeds
5. ✅ All tests pass (Jest + Playwright)

### 4.3 Build Validation

```bash
npm run build         # Production build (MUST succeed)
```

**Build output MUST be:**

- < 500 KB per route (initial load)
- < 2 MB total JavaScript
- All pages successfully compiled
- Zero TypeScript errors
- Zero build warnings (critical level)

### 4.4 v3.0 Requirements

✅ **MUST:** Run `npm run check-all` before every commit
✅ **MUST:** Fix all TypeScript errors (no `@ts-ignore` without ADR)
✅ **MUST:** Maintain production build success
✅ **MUST:** Keep bundle sizes under v2.0 thresholds
❌ **NEVER:** Commit code that fails `npm run check-all`
❌ **NEVER:** Disable ESLint rules without justification

---

## 5. Core Module Implementations (IMMUTABLE CONTRACTS)

### 5.1 Agent System

**Implementation:** `lib/agents/`

**Components:**

- `loader.ts` - YAML loading with Zod validation and caching
- `schema.ts` - Zod schemas for runtime validation
- `runtime.ts` - Agent execution with LLM integration
- `types.ts` - TypeScript interfaces

**Contracts:**

- 5 MAM agents MUST load successfully
- Zod validation MUST catch invalid YAML
- Caching MUST prevent redundant file reads
- Custom `AgentLoadError` with file path and cause

**API Routes:**

- `GET /api/agents` - List all agents
- `GET /api/agents/[name]` - Get single agent

### 5.2 Workflow Engine

**Implementation:** `lib/workflows/`

**Components:**

- `executor.ts` - Step-by-step execution with state persistence
- `loader.ts` - YAML loading and validation
- `types.ts` - Workflow interfaces (now includes complexity assessment types)
- `schema.ts` - Zod schemas
- `complexity-assessment.ts` - ✅ NEW in v3.0 (STORY-V3-001)

**Contracts:**

- Sequential step execution with state tracking
- Sub-workflow support (unlimited nesting, circular detection)
- State files: `.{workflow-name}.state.json`
- Actions: elicit, reflect, guide, template, validate, sub-workflow
- Resume support (LIFO for nested workflows)

**API Routes:**

- `GET /api/workflows` - List all workflows
- `GET /api/workflows/[name]` - Get workflow details
- `POST /api/workflows/[name]/execute` - Execute next step
- `GET /api/workflows/[name]/state` - Get execution state
- `GET /api/workflows/[name]/hierarchy` - Get workflow hierarchy tree

### 5.3 State Machine

**Implementation:** `lib/state/`

**Components:**

- `machine.ts` - Story lifecycle management
- `types.ts` - State machine interfaces

**Contracts:**

- Single source of truth: `docs/mam-workflow-status.md`
- ONLY ONE story in TODO at a time
- ONLY ONE story in IN_PROGRESS at a time
- Valid transitions: BACKLOG → TODO → IN_PROGRESS → DONE
- Atomic state transitions
- Custom `StateMachineError` for violations

**API Routes:**

- `GET /api/state` - Get current state machine state

### 5.4 Template Engine

**Implementation:** `lib/templates/`

**Components:**

- `engine.ts` - Handlebars template rendering
- `helpers.ts` - 40+ standard helpers
- `cache.ts` - LRU cache for compiled templates
- `legacy.ts` - Legacy pattern support ({var}, ${var}, %VAR%)

**Contracts:**

- Handlebars {{variable}} syntax (primary)
- Legacy pattern support for migration
- Template validation before rendering
- Caching with content hash and file path
- Performance metrics tracking

### 5.5 Configuration Manager

**Implementation:** `lib/config/`

**Components:**

- `manager.ts` - Configuration loading and saving
- `schema.ts` - Zod validation schemas
- `loader.ts` - Configuration file loader

**Contracts:**

- Auto-detection: ./madace/core/config.yaml, ./madace/config.yaml, ./config.yaml
- Cross-platform path resolution
- Atomic file operations with backup
- Environment variable override support
- MADACE error codes: CONFIG_NOT_FOUND, VALIDATION_FAILED, etc.

**API Routes:**

- `GET /api/config` - Load configuration
- `POST /api/config` - Save configuration

### 5.6 LLM Client (Multi-Provider)

**Implementation:** `lib/llm/`

**Components:**

- `client.ts` - Factory pattern for provider creation
- `providers/` - Strategy pattern implementations (Gemini, Claude, OpenAI, Local)
- `types.ts` - LLM interfaces
- `config.ts` - Environment config loader

**Contracts:**

- 4 providers: Gemini, Claude, OpenAI, Local/Ollama
- Factory pattern: `createLLMClient(config)`
- Strategy pattern: `ILLMProvider` interface
- Both blocking and streaming support
- Rate limiting and retry logic
- Comprehensive error codes

**API Routes:**

- `POST /api/llm/test` - Test LLM connection

### 5.7 WebSocket Sync Service

**Implementation:** `lib/sync/`

**Components:**

- `websocket-server.ts` - WebSocket server with client management
- `file-watcher.ts` - File watcher with debouncing
- `sync-service.ts` - Service coordinator

**Contracts:**

- Real-time bidirectional communication (port 3001)
- Client tracking (Web UI, Claude CLI, Gemini CLI)
- File watching (`.*.state.json` files, config changes)
- Ping/pong heartbeat for connection health
- Auto-broadcast on file changes

**API Routes:**

- `GET /api/sync` - Get service status
- `POST /api/sync` - Start/stop service

### 5.8 v3.0 Requirements

✅ **MUST:** Maintain all v2.0 module contracts
✅ **MUST:** Extend modules with new features (not replace)
✅ **MUST:** Preserve existing API routes
✅ **MUST:** Add NEW API routes for NEW features
❌ **NEVER:** Break existing module interfaces
❌ **NEVER:** Remove existing functionality

---

## 6. Docker Deployment (Production-Ready)

**Configuration:** `Dockerfile`, `docker-compose.yml`, `docker-compose.dev.yml`
**Documentation:** [DEVELOPMENT.md](../../DEVELOPMENT.md), [HTTPS-DEPLOYMENT.md](../HTTPS-DEPLOYMENT.md)

### 6.1 Production Deployment

**Image:** Alpine-based, optimized (~200MB)

```bash
# ALWAYS use Docker Compose (not standalone docker commands)
docker-compose up -d          # Start production container
docker-compose down           # Stop containers
docker-compose logs -f        # View logs
docker-compose up -d --build  # Rebuild after changes
```

**Features:**

- Multi-stage build (builder + runner)
- Volume mount: `./madace-data/` → `/app/data`
- Port: 3000 (HTTP)
- Environment: .env file support
- Data persistence across container restarts

### 6.2 Development Container

**Image:** With VSCode Server + Cursor IDE (~2-3GB)

```bash
docker-compose -f docker-compose.dev.yml up -d  # Start dev environment
```

**Features:**

- VSCode Server at http://localhost:8080 (password: madace123)
- Cursor IDE at http://localhost:8081
- Next.js Dev Server at http://localhost:3000
- Hot reload enabled
- All dev tools pre-installed (TypeScript, ESLint, Prettier, Jest)
- Claude CLI integrated

### 6.3 HTTPS Deployment (Production with Domain)

**Configuration:** `docker-compose.https.yml`, `Caddyfile`

```bash
export DOMAIN=madace.yourdomain.com
docker-compose -f docker-compose.https.yml up -d
```

**Features:**

- Automatic HTTPS with Let's Encrypt
- Caddy reverse proxy
- Auto-renewal of certificates
- HTTP → HTTPS redirect

### 6.4 v3.0 Requirements

✅ **MUST:** Maintain Docker Compose configurations
✅ **MUST:** Ensure production image builds successfully
✅ **MUST:** Preserve data volume mounting
✅ **MUST:** Support both HTTP and HTTPS deployment
❌ **NEVER:** Use standalone `docker` commands (use Compose)
❌ **NEVER:** Break existing deployment workflows

---

## 7. Frontend Components (React 19 + Tailwind CSS 4)

### 7.1 Implemented Pages (v2.0)

**Core Pages:**

- `/` - Home dashboard with live statistics
- `/setup` - 4-step setup wizard
- `/settings` - Configuration editor
- `/agents` - Agent selection and management
- `/agents/[name]` - Agent detail view
- `/workflows` - Workflow execution interface
- `/kanban` - Visual Kanban board (state machine)
- `/llm-test` - LLM connection testing
- `/sync-status` - WebSocket sync status dashboard

### 7.2 Component Architecture

**Feature Components** (`components/features/`):

- Navigation, Footer
- AgentCard, AgentSelector, AgentPersona
- WorkflowCard, WorkflowExecutionPanel
- Setup wizard steps (StepIndicator, ProjectInfoStep, LLMConfigStep, ModuleConfigStep, SummaryStep)
- AssessmentWidget (for complexity assessment)

**Design System:**

- Tailwind CSS 4.1.15 utility-first
- Dark mode support (system preference)
- Responsive design (mobile-first)
- Heroicons for icons
- Accessibility (ARIA labels, keyboard navigation, semantic HTML)

### 7.3 v3.0 Requirements

✅ **MUST:** Maintain existing pages and components
✅ **MUST:** Follow established design patterns
✅ **MUST:** Support dark mode for NEW components
✅ **MUST:** Ensure responsive design (mobile, tablet, desktop)
✅ **MUST:** Add accessibility features (ARIA, keyboard nav)
❌ **NEVER:** Break existing UI components
❌ **NEVER:** Remove dark mode support

---

## 8. Documentation Standards

### 8.1 Required Documentation (v2.0)

**Project Documentation:**

- README.md - Project overview
- PRD.md - Product requirements (v2.0 - AUTHORITATIVE)
- ARCHITECTURE.md - Technical architecture (400+ lines)
- PLAN.md - Development roadmap
- CLAUDE.md - AI assistant guidance (comprehensive)
- VERSION-LOCK.md - Version locking guide (500+ lines)
- TESTING-POLICY.md - Immutable testing policy (600+ lines)

**Technical Documentation:**

- API.md - REST API reference (650+ lines, 47 endpoints)
- COMPONENTS.md - React component guide (900+ lines)
- TESTING.md - Testing guide (600+ lines)
- DEPLOYMENT.md - Deployment guide (800+ lines)
- DEVELOPMENT.md - Development container guide
- HTTPS-DEPLOYMENT.md - HTTPS deployment guide
- FEASIBILITY-REPORT.md - Feasibility validation

**ADRs (Architecture Decision Records):**

- ADR-001: Multi-Tier Architecture (Superseded)
- ADR-002: FFI Strategy (Superseded)
- ADR-003: Architecture Simplification (ACTIVE)
- ADR-004: Version Locking Enforcement (ACTIVE)

### 8.2 Story Documentation

**All completed stories documented in:**

- `docs/mam-workflow-status.md` (single source of truth)
- Individual story files: `docs/story-{ID}.md` (for major features)

**Story Template:**

```markdown
# [STORY-ID] Story Title

**Status:** COMPLETED
**Developer:** Name | **Duration:** Time
**Points:** X | **Epic:** EPIC-ID

**Implementation Details:** [...]
**Files Created:** [...]
**Files Modified:** [...]
**Features:** [...]
**Quality Assurance:** [...]
**MADACE Compliance:** [...]
```

### 8.3 v3.0 Requirements

✅ **MUST:** Update documentation for NEW features
✅ **MUST:** Create story files for completed work
✅ **MUST:** Update API.md for NEW endpoints
✅ **MUST:** Create ADRs for major decisions
❌ **NEVER:** Leave features undocumented
❌ **NEVER:** Make architectural changes without ADR

---

## 9. Development Workflow (Git + GitHub)

### 9.1 Branch Strategy

**Main Branches:**

- `main` - Stable releases only
- `task/XXX` - Feature branches (e.g., task/036)

**Workflow:**

1. Create feature branch from main
2. Implement feature + tests
3. Run `npm run check-all` (MUST pass)
4. Commit with detailed message
5. Push to GitHub
6. Create pull request
7. Merge after review

### 9.2 Commit Message Format

**Structure:**

```
[STORY-ID] Short Title

Detailed description of changes.

Implementation Details:
- Feature 1
- Feature 2

Files Created:
- path/to/file.ts

Files Modified:
- path/to/file.ts

Quality Assurance:
- TypeScript type-check: PASS
- Production build: SUCCESS
- Tests: X/X PASS

Points: X | Actual Time: X

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 9.3 Release Tagging

**Semantic Versioning:** MAJOR.MINOR.PATCH

```bash
# Annotated tags with detailed release notes
git tag -a v2.0.0-alpha -m "v2.0.0-alpha: 43 stories, 249 points"
git push origin v2.0.0-alpha
```

### 9.4 v3.0 Requirements

✅ **MUST:** Use feature branches for all development
✅ **MUST:** Write detailed commit messages
✅ **MUST:** Tag releases with semantic versioning
✅ **MUST:** Include story ID in commit messages
❌ **NEVER:** Commit directly to main
❌ **NEVER:** Force push to main/master

---

## 10. CLI Integration (Claude CLI + Gemini CLI)

### 10.1 CLI Adapters

**Implementation:** `lib/cli/`

**Supported CLIs:**

- Claude CLI (Anthropic)
- Gemini CLI (Google)

**Integration:**

- Same TypeScript business logic as Web UI
- Generate `.claude.json` and `.gemini.json` config files
- WebSocket sync for real-time updates
- Demo script: `scripts/demo-cli-integration.sh`

### 10.2 WebSocket Synchronization

**Features:**

- Real-time bidirectional communication
- Client detection (Web UI, Claude CLI, Gemini CLI)
- File watcher integration (auto-broadcast changes)
- Ping/pong heartbeat for connection health

### 10.3 v3.0 Requirements

✅ **MUST:** Maintain CLI adapter compatibility
✅ **MUST:** Support WebSocket sync for NEW features
✅ **MUST:** Keep business logic shared between Web UI and CLI
❌ **NEVER:** Duplicate business logic in CLI adapters
❌ **NEVER:** Break WebSocket message contracts

---

## 11. Security & Best Practices

### 11.1 Security Standards

**API Security:**

- ✅ HTTPS for all external connections (MANDATORY)
- ✅ No executable code in YAML files
- ✅ Path traversal protection
- ✅ Template injection prevention (Handlebars auto-escapes)
- ✅ .env files git-ignored (secrets never committed)
- ✅ Zod validation on all untrusted input

**Docker Security:**

- ✅ Non-root user in containers
- ✅ Read-only file system where possible
- ✅ Minimal attack surface (Alpine base)
- ✅ No secrets in images

### 11.2 Code Quality Standards

**TypeScript:**

- Strict mode ALWAYS enabled
- No `any` without justification
- Comprehensive type coverage
- Proper null/undefined handling

**Error Handling:**

- Custom error classes with detailed messages
- Try-catch for all I/O operations
- Proper HTTP status codes in API routes
- User-friendly error messages

**Performance:**

- Caching where appropriate (agents, templates)
- Lazy loading for large data
- Efficient database queries (future)
- Bundle size optimization

### 11.3 v3.0 Requirements

✅ **MUST:** Maintain all security standards
✅ **MUST:** Use HTTPS for all external APIs
✅ **MUST:** Validate all user input with Zod
✅ **MUST:** Handle errors gracefully
❌ **NEVER:** Commit secrets to git
❌ **NEVER:** Execute user-provided code

---

## 12. Complexity Assessment System (NEW in v3.0)

**Implementation:** STORY-V3-001 (Completed 2025-10-29)
**Files:** `lib/workflows/complexity-assessment.ts`, `lib/workflows/complexity-types.ts`

### 12.1 Overview

Complexity assessment algorithm for scale-adaptive workflow router.

**Features:**

- 8 criterion scoring functions (0-5 points each)
- Enum-based type system for maximum type safety
- 5 complexity levels (MINIMAL to ENTERPRISE)
- Configuration support (disabled criteria, custom thresholds)
- 75 comprehensive tests (100% pass rate)

### 12.2 Contracts (IMMUTABLE)

**Scoring Functions:**

```typescript
scoreProjectSize(size: ProjectSize): number
scoreTeamSize(size: TeamSize): number
scoreCodebase(complexity: CodebaseComplexity): number
scoreIntegrations(count: IntegrationsCount): number
scoreUserBase(base: UserBase): number
scoreSecurity(level: SecurityLevel): number
scoreDuration(duration: ProjectDuration): number
scoreExistingCode(existingCode: ExistingCodebase): number
```

**Main Function:**

```typescript
assessComplexity(input: ProjectInput, config?: ComplexityAssessmentConfig): ComplexityResult
```

**Result Structure:**

```typescript
interface ComplexityResult {
  totalScore: number; // 0-40 points
  level: ComplexityLevel; // 0-4 (MINIMAL to ENTERPRISE)
  breakdown: ComplexityBreakdown;
  levelName: string; // Human-readable name
  scoreRange: string; // e.g., "13-20"
  recommendedWorkflow: string; // e.g., "standard-workflow.yaml"
  assessedAt: Date;
}
```

### 12.3 Level Mapping (IMMUTABLE)

| Level | Name          | Score Range | Recommended Workflows       |
| ----- | ------------- | ----------- | --------------------------- |
| 0     | MINIMAL       | 0-5         | minimal-workflow.yaml       |
| 1     | BASIC         | 6-12        | basic-workflow.yaml         |
| 2     | STANDARD      | 13-20       | standard-workflow.yaml      |
| 3     | COMPREHENSIVE | 21-30       | comprehensive-workflow.yaml |
| 4     | ENTERPRISE    | 31-40       | enterprise-workflow.yaml    |

### 12.4 v3.0 Requirements

✅ **MUST:** Maintain all 75 existing tests (100% pass rate)
✅ **MUST:** Preserve enum-based scoring system
✅ **MUST:** Keep level thresholds as defined
✅ **MUST:** Extend with NEW features (not replace)
❌ **NEVER:** Change level thresholds without ADR
❌ **NEVER:** Modify existing scoring functions

---

## 13. Performance Benchmarks (v2.0 Baseline)

### 13.1 Build Performance

**Production Build:**

- Total time: < 3 minutes
- Bundle size per route: < 500 KB
- Total JavaScript: < 2 MB
- Zero errors, minimal warnings

**Development Server:**

- Startup time: < 5 seconds
- Hot reload: < 1 second
- Type-check: < 10 seconds

### 13.2 Runtime Performance

**API Response Times (95th percentile):**

- Agent loading: < 50ms
- Workflow state retrieval: < 100ms
- Configuration loading: < 50ms
- LLM test connection: < 5 seconds

**Database Queries (Future):**

- Simple queries: < 50ms
- Complex joins: < 200ms
- Full-text search: < 500ms

### 13.3 Test Performance

**Jest Tests:**

- 75 tests: < 1 second
- Coverage report: < 5 seconds

**Playwright E2E Tests:**

- Per test: < 10 seconds
- Full suite (future): < 5 minutes

### 13.4 v3.0 Requirements

✅ **MUST:** Maintain or improve performance benchmarks
✅ **MUST:** Keep build time < 3 minutes
✅ **MUST:** Keep bundle sizes under v2.0 thresholds
✅ **MUST:** Profile and optimize NEW features
❌ **NEVER:** Introduce performance regressions
❌ **NEVER:** Ship features that fail performance benchmarks

---

## 14. Migration Path (v2.0 → v3.0)

### 14.1 Backward Compatibility

**GUARANTEED Compatible:**

- ✅ All v2.0 agent YAML files
- ✅ All v2.0 workflow YAML files
- ✅ All v2.0 configuration files
- ✅ All v2.0 state machine files
- ✅ All v2.0 API routes
- ✅ All v2.0 Docker deployments

**Breaking Changes:** NONE planned for v3.0

### 14.2 Upgrade Process

**Automatic Upgrades:**

1. Pull latest v3.0 code
2. Run `npm install` (exact versions maintained)
3. Run `npm run check-all` (verify compatibility)
4. Run `npm run build` (verify build success)
5. Deploy via Docker Compose (same commands)

**Manual Steps:** NONE required (unless using experimental features)

### 14.3 Rollback Strategy

**If v3.0 has issues:**

1. Checkout v2.0.0-alpha tag
2. Run `npm install`
3. Deploy via Docker Compose

**Data Compatibility:**

- State files: Forward compatible
- Configuration: Forward compatible
- Agent YAML: Forward compatible

### 14.4 v3.0 Requirements

✅ **MUST:** Maintain 100% backward compatibility with v2.0
✅ **MUST:** Support seamless upgrades
✅ **MUST:** Provide rollback instructions
✅ **MUST:** Test migration with real v2.0 data
❌ **NEVER:** Break v2.0 file formats
❌ **NEVER:** Require manual data migration

---

## 15. Velocity & Capacity Planning

### 15.1 v2.0 Velocity (Baseline)

**Delivered:**

- 43 stories completed
- 249 points delivered
- 2 weeks duration

**Velocity:** 124.5 points/week (6.2x target of 20 points/week)

### 15.2 v3.0 Capacity

**Timeline:** 12 months (Q2 2026 - Q1 2027)

**Total Effort:** 207 points across 8 epics

**Planned Velocity:** 17 points/week

**Milestones:**

- Milestone 2.1 (Q2 2026): 55 points (5 weeks dev + 3 weeks test)
- Milestone 2.2 (Q2-Q3 2026): 55 points (5 weeks)
- Milestone 2.3 (Q3 2026): 76 points (7 weeks)
- Milestone 2.4 (Q4 2026): 21 points (2 weeks)
- Milestone 3.0 (Q1 2027): Beta + integration (8 weeks)

### 15.3 Risk Mitigation

**Known Risks:**

- Complexity creep (new features exceed estimates)
- Integration challenges (BMAD features + MADACE architecture)
- Performance regression (new features impact v2.0 baseline)
- Scope creep (feature requests from users)

**Mitigation Strategies:**

- Strict point estimation and velocity tracking
- Continuous integration with v2.0 foundation
- Performance benchmarking for all new features
- Scope freeze after Q2 2026 planning

### 15.4 v3.0 Requirements

✅ **MUST:** Track velocity weekly (actual vs planned)
✅ **MUST:** Adjust timeline if velocity drops
✅ **MUST:** Prioritize P0 features first
✅ **MUST:** Defer features if timeline at risk
❌ **NEVER:** Sacrifice quality for velocity
❌ **NEVER:** Skip testing to meet deadlines

---

## 16. Acceptance Criteria (v3.0 Definition of Done)

### 16.1 Feature Completion Checklist

**Every v3.0 feature MUST:**

- [ ] ✅ All acceptance criteria met (from story)
- [ ] ✅ TypeScript type-check passes (0 errors)
- [ ] ✅ Production build succeeds
- [ ] ✅ All tests pass (95%+ coverage for new code)
- [ ] ✅ ESLint passes (0 errors)
- [ ] ✅ Prettier formatted
- [ ] ✅ Documentation updated (API.md, component docs, etc.)
- [ ] ✅ Story file created (docs/story-{ID}.md)
- [ ] ✅ Workflow status updated (TODO → DONE)
- [ ] ✅ Git commit with detailed message
- [ ] ✅ Pushed to GitHub
- [ ] ✅ No performance regressions
- [ ] ✅ Backward compatible with v2.0

### 16.2 Epic Completion Checklist

**Every v3.0 epic MUST:**

- [ ] ✅ All stories completed (100%)
- [ ] ✅ Integration tests pass
- [ ] ✅ E2E tests pass (Playwright)
- [ ] ✅ Performance benchmarks met
- [ ] ✅ Security review passed
- [ ] ✅ Documentation complete
- [ ] ✅ User acceptance testing passed
- [ ] ✅ Demo prepared
- [ ] ✅ Release notes written

### 16.3 Release Checklist (v3.0 Beta)

**v3.0 Beta release MUST:**

- [ ] ✅ All P0 + P1 + P2 epics complete
- [ ] ✅ All tests passing (100%)
- [ ] ✅ Production build succeeds
- [ ] ✅ Docker images built and tested
- [ ] ✅ HTTPS deployment validated
- [ ] ✅ Migration from v2.0 tested
- [ ] ✅ Rollback tested
- [ ] ✅ Documentation complete
- [ ] ✅ Release notes published
- [ ] ✅ Git tag created (v3.0.0-beta)
- [ ] ✅ User acceptance testing passed

---

## 17. Contact & Governance

### 17.1 Foundation Ownership

**Owner:** MADACE Core Team
**Approvers:** Architecture Review Board

**Changes to this document require:**

- ADR justification
- Architecture review
- Team consensus
- Version bump (semantic versioning)

### 17.2 Exceptions Process

**If v3.0 feature requires deviation:**

1. Create ADR documenting:
   - Reason for deviation
   - Alternative considered
   - Risk assessment
   - Mitigation strategy
2. Get architecture review approval
3. Update this document with new requirement
4. Communicate to team

### 17.3 Version History

| Version | Date       | Changes                          | Author |
| ------- | ---------- | -------------------------------- | ------ |
| 1.0.0   | 2025-10-29 | Initial v3.0 foundation document | Claude |

---

## 18. Quick Reference

### 18.1 Pre-Commit Checklist

```bash
# Run before EVERY commit
npm run check-all   # Type-check + lint + format
npm run build       # Verify production build
npm test            # Run all tests
git status          # Check what's being committed
```

### 18.2 Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run check-all              # Quality checks
npm run build                  # Production build

# Testing
npm test                       # Run Jest tests
npm run test:e2e              # Run Playwright E2E tests

# Docker
docker-compose up -d          # Start production
docker-compose down           # Stop containers
docker-compose logs -f        # View logs

# Git
git status                    # Check status
git add .                     # Stage changes
git commit -m "message"       # Commit with message
git push                      # Push to GitHub
```

### 18.3 Key Files

**Configuration:**

- `package.json` - Dependencies (exact versions)
- `tsconfig.json` - TypeScript config (strict mode)
- `.nvmrc` - Node.js version (24.10.0)
- `.npmrc` - npm config (save-exact=true)

**Quality:**

- `eslint.config.mjs` - ESLint config
- `prettier.config.js` - Prettier config
- `jest.config.mjs` - Jest config

**Documentation:**

- `docs/v3-planning/V3-FOUNDATIONS.md` - This document
- `docs/mam-workflow-status.md` - Story tracking
- `CLAUDE.md` - AI assistant guidance

---

## 19. Summary

**MADACE v3.0 = v2.0 Foundation + 8 BMAD-Inspired Features**

**v2.0 Foundation (IMMUTABLE):**

1. ✅ Version locking (4-layer enforcement)
2. ✅ Immutable testing policy (75+ tests)
3. ✅ Next.js 15 full-stack TypeScript
4. ✅ Quality automation (type-check, lint, format, build)
5. ✅ Core modules (agents, workflows, state, templates, config, LLM)
6. ✅ Docker deployment (production + development)
7. ✅ Frontend components (React 19 + Tailwind CSS 4)
8. ✅ Documentation standards (comprehensive)
9. ✅ Git workflow (branches, commits, tags)
10. ✅ CLI integration (Claude CLI, Gemini CLI, WebSocket sync)
11. ✅ Security standards (HTTPS, Zod validation, no secrets)
12. ✅ Performance benchmarks (build, runtime, tests)

**v3.0 Enhancements (NEW):**

1. ✅ Complexity assessment (STORY-V3-001 complete)
2. 🔄 Scale-adaptive workflow router (EPIC-V3-001)
3. 🔄 Universal status checker (EPIC-V3-002)
4. 🔄 JIT tech specs (EPIC-V3-003)
5. 🔄 Story-context workflow (EPIC-V3-004)
6. 🔄 Brownfield analysis (EPIC-V3-005)
7. 🔄 Agent sidecar customization (EPIC-V3-006)
8. 🔄 Enhanced setup wizard (EPIC-V3-007)
9. 🔄 Story lifecycle enhancements (EPIC-V3-008)

**Total:** 207 points over 12 months (Q2 2026 - Q1 2027)

---

**Status:** ✅ ACTIVE - All v3.0 Development Must Follow This Foundation
**Last Updated:** 2025-10-29
**Next Review:** Q2 2026 (before Milestone 2.1)

**Questions?** See [CLAUDE.md](../../CLAUDE.md) or contact MADACE Core Team.

---

🚀 **Let's build MADACE v3.0 on a solid foundation!**

# Autonomous Task Breakdown for Sub-Agents

**Purpose:** Decompose v3.0 Priority 0 + E2E Testing into atomic tasks for parallel sub-agent execution.

**Execution Mode:** Each task is fully autonomous - sub-agents execute without reporting back.

**Quality Gate:** All tasks must pass `npm run check-all` and `npm run build` before completion.

---

## 🎯 Phase 1: Priority 0 - Scale-Adaptive Router (EPIC-V3-001)

### Batch 1A: Complexity Assessment Core (3 tasks, can run in parallel)

**TASK-001: Create Complexity Assessment Types**

- **File**: `lib/workflows/complexity-types.ts`
- **Work**: Define TypeScript interfaces for complexity assessment
- **Interfaces**: `ComplexityAssessment`, `ComplexityResult`, `ComplexityLevel`, `ProjectInput`
- **Acceptance**: TypeScript compiles, exports all types, JSDoc comments
- **Estimated**: 30 minutes
- **Dependencies**: None

**TASK-002: Implement Scoring Algorithm**

- **File**: `lib/workflows/complexity-assessment.ts`
- **Work**: Create `assessComplexity()` function with 8-criteria scoring
- **Logic**: Project size (0-5), team size (0-5), codebase (0-5), integrations (0-5), users (0-5), security (0-5), duration (0-5), existing code (0-5)
- **Output**: Total score (0-40), level (0-4), breakdown object
- **Acceptance**: Function works, returns correct levels, unit tests pass
- **Estimated**: 2 hours
- **Dependencies**: TASK-001

**TASK-003: Create Assessment Unit Tests**

- **File**: `__tests__/lib/workflows/complexity-assessment.test.ts`
- **Work**: 10+ test cases covering all boundary conditions
- **Tests**: Level 0 (0-5), Level 1 (6-12), Level 2 (13-20), Level 3 (21-30), Level 4 (31-40)
- **Coverage**: >95% code coverage
- **Acceptance**: All tests pass, coverage threshold met
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-002

---

### Batch 1B: Assessment Report Generation (2 tasks, can run in parallel after 1A)

**TASK-004: Create Assessment Report Template**

- **File**: `lib/templates/assessment-report.hbs`
- **Work**: Handlebars template for `docs/scale-assessment.md`
- **Sections**: Summary, criteria breakdown, level determination, workflow routing
- **Variables**: `{{score}}`, `{{level}}`, `{{projectSize}}`, etc.
- **Acceptance**: Template compiles, renders correctly with sample data
- **Estimated**: 1 hour
- **Dependencies**: TASK-001

**TASK-005: Create Report Generator Function**

- **File**: `lib/workflows/assessment-report.ts`
- **Work**: `generateAssessmentReport()` function using template engine
- **Input**: ComplexityResult object
- **Output**: Markdown string for `docs/scale-assessment.md`
- **Acceptance**: Generates valid markdown, saves file correctly
- **Estimated**: 1 hour
- **Dependencies**: TASK-002, TASK-004

---

### Batch 1C: Interactive Assessment CLI (3 tasks, sequential)

**TASK-006: Create CLI Prompt Definitions**

- **File**: `lib/cli/assessment-prompts.ts`
- **Work**: Define inquirer.js prompts for 8 assessment criteria
- **Prompts**: List selections, number inputs, confirmation prompts
- **Validation**: Input validation for each prompt
- **Acceptance**: Prompts array exports correctly, validation works
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-001

**TASK-007: Implement Interactive Assessment**

- **File**: `lib/cli/assess-scale.ts`
- **Work**: CLI command handler using inquirer prompts + assessment function
- **Flow**: Prompt user → Calculate score → Generate report → Save file
- **Output**: Console summary + file saved to `docs/scale-assessment.md`
- **Acceptance**: CLI runs, saves file, displays results
- **Estimated**: 2 hours
- **Dependencies**: TASK-002, TASK-005, TASK-006

**TASK-008: Add CLI Command Registration**

- **File**: Update existing CLI entry point (find with grep)
- **Work**: Register `madace assess-scale` command
- **Integration**: Wire up TASK-007 handler
- **Help text**: Command description, usage examples
- **Acceptance**: `madace assess-scale --help` works, command executes
- **Estimated**: 30 minutes
- **Dependencies**: TASK-007

---

### Batch 1D: Workflow Routing Logic (3 tasks, can run in parallel after 1A)

**TASK-009: Create Route-Workflow YAML**

- **File**: `madace/mam/workflows/route-workflow.yaml`
- **Work**: Conditional routing workflow with 5 levels
- **Logic**: If level 0 → minimal, level 1 → basic, level 2 → standard, level 3 → comprehensive, level 4 → enterprise
- **Actions**: Route to different workflow files based on level
- **Acceptance**: YAML valid, schema passes, loader accepts
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-001

**TASK-010: Implement Routing Action**

- **File**: `lib/workflows/actions/route.ts`
- **Work**: New workflow action type `action: route`
- **Logic**: Evaluate condition, determine target workflow, pass context
- **Integration**: Enhance workflow executor to support routing
- **Acceptance**: Routing works, context passed correctly
- **Estimated**: 2 hours
- **Dependencies**: TASK-009

**TASK-011: Create Routing Unit Tests**

- **File**: `__tests__/lib/workflows/actions/route.test.ts`
- **Work**: Test all 5 routing paths
- **Tests**: Correct workflow selected per level, context inheritance
- **Acceptance**: All tests pass, >90% coverage
- **Estimated**: 1 hour
- **Dependencies**: TASK-010

---

### Batch 1E: User Override System (2 tasks, sequential)

**TASK-012: Add Override to Assessment**

- **File**: Update `lib/workflows/complexity-assessment.ts`
- **Work**: Add `overrideLevel(assessment, newLevel, reason)` function
- **Logic**: Allow manual level override with reason tracking
- **Storage**: Save override to assessment result metadata
- **Acceptance**: Override works, reason captured, audit trail
- **Estimated**: 1 hour
- **Dependencies**: TASK-002

**TASK-013: Add Override to CLI**

- **File**: Update `lib/cli/assess-scale.ts`
- **Work**: Add `--override <level>` flag and `--reason <text>` flag
- **Prompt**: If flags present, confirm override with reason prompt
- **Output**: Include override in report with justification
- **Acceptance**: CLI override works, reason required, saved to report
- **Estimated**: 1 hour
- **Dependencies**: TASK-007, TASK-012

---

### Batch 1F: Web UI Integration (3 tasks, can run in parallel after 1D)

**TASK-014: Create Assessment Form Component**

- **File**: `components/features/AssessmentForm.tsx`
- **Work**: React form with 8 assessment criteria inputs
- **UI**: Dropdowns, sliders, number inputs per criterion
- **State**: React useState for form data
- **Acceptance**: Form renders, state updates, validates input
- **Estimated**: 2 hours
- **Dependencies**: TASK-001

**TASK-015: Create Assessment Dashboard Page**

- **File**: `app/assess-scale/page.tsx`
- **Work**: Page with form + results display
- **Flow**: Fill form → Calculate → Show results → Download report
- **API**: Call backend assessment function
- **Acceptance**: Page works, API integration, results display
- **Estimated**: 2 hours
- **Dependencies**: TASK-002, TASK-014

**TASK-016: Add Assessment API Route**

- **File**: `app/api/assess-scale/route.ts`
- **Work**: POST endpoint accepting assessment input
- **Logic**: Call `assessComplexity()`, return result JSON
- **Response**: ComplexityResult with score, level, breakdown
- **Acceptance**: API works, validation, error handling
- **Estimated**: 1 hour
- **Dependencies**: TASK-002

---

### Batch 1G: Setup Wizard Integration (1 task)

**TASK-017: Integrate Assessment into Setup Wizard**

- **File**: Update `app/setup/page.tsx`
- **Work**: Add assessment as optional step 1.5 (between project info and LLM)
- **UI**: "Calculate Recommended Level" button
- **Logic**: Auto-calculate based on project info, suggest workflow
- **Acceptance**: Button works, level calculated, UI updates
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-002, TASK-016

---

### Batch 1H: E2E Testing for Scale Router (1 task)

**TASK-018: Create Scale Router E2E Tests**

- **File**: `e2e-tests/scale-router.spec.ts`
- **Work**: Playwright tests for all 5 routing levels
- **Tests**: CLI assessment, API assessment, UI assessment, override, setup wizard
- **Acceptance**: All flows tested, screenshots captured, tests pass
- **Estimated**: 2 hours
- **Dependencies**: TASK-007, TASK-015, TASK-017

---

## 🔍 Phase 2: Priority 0 - Universal Status Checker (EPIC-V3-002)

### Batch 2A: Status Provider System (4 tasks, can run in parallel)

**TASK-019: Create IStatusProvider Interface**

- **File**: `lib/status/types.ts`
- **Work**: Define status provider interface and result types
- **Interfaces**: `IStatusProvider`, `StatusResult`, `EntityType`, `StatusFormat`
- **Methods**: `detectEntity()`, `getStatus()`, `formatOutput()`
- **Acceptance**: Interface compiles, JSDoc complete
- **Estimated**: 30 minutes
- **Dependencies**: None

**TASK-020: Implement StoryStatusProvider**

- **File**: `lib/status/providers/story.ts`
- **Work**: Provider for story status from `mam-workflow-status.md`
- **Logic**: Parse file, find story by ID, return state + metadata
- **Detection**: Regex for story IDs (e.g., `STORY-V3-001`)
- **Acceptance**: Detects stories, returns correct status, tested
- **Estimated**: 2 hours
- **Dependencies**: TASK-019

**TASK-021: Implement EpicStatusProvider**

- **File**: `lib/status/providers/epic.ts`
- **Work**: Provider for epic status from epic files
- **Logic**: Read epic markdown, parse status, count stories
- **Detection**: Regex for epic IDs (e.g., `EPIC-V3-001`)
- **Acceptance**: Detects epics, returns stories count, progress %
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-019

**TASK-022: Implement WorkflowStatusProvider**

- **File**: `lib/status/providers/workflow.ts`
- **Work**: Provider for workflow execution status
- **Logic**: Read `.{workflow}.state.json`, return current step
- **Detection**: Workflow names (e.g., `plan-project`)
- **Acceptance**: Detects workflows, returns step/progress
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-019

---

### Batch 2B: Status Provider Implementation (2 tasks, can run in parallel after 2A)

**TASK-023: Implement StateMachineStatusProvider**

- **File**: `lib/status/providers/state-machine.ts`
- **Work**: Provider for overall state machine status
- **Logic**: Parse `mam-workflow-status.md`, return counts per state
- **Detection**: No input needed (always matches)
- **Acceptance**: Returns BACKLOG, TODO, IN_PROGRESS, DONE counts
- **Estimated**: 1 hour
- **Dependencies**: TASK-019

**TASK-024: Create Status Provider Registry**

- **File**: `lib/status/registry.ts`
- **Work**: Registry pattern to manage all providers
- **Methods**: `registerProvider()`, `detectEntityType()`, `getStatus()`
- **Logic**: Loop through providers, call `detectEntity()`, use first match
- **Acceptance**: Registry works, auto-detection works
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-020, TASK-021, TASK-022, TASK-023

---

### Batch 2C: CLI Status Command (3 tasks, sequential)

**TASK-025: Create Status CLI Handler**

- **File**: `lib/cli/status.ts`
- **Work**: CLI command handler for `madace status [entity]`
- **Logic**: Optional entity ID, use registry to detect/fetch
- **Output**: Format and display status (table by default)
- **Acceptance**: CLI works, detects entities, displays status
- **Estimated**: 2 hours
- **Dependencies**: TASK-024

**TASK-026: Implement Multiple Output Formats**

- **File**: `lib/status/formatters.ts`
- **Work**: Status output formatters (table, json, markdown)
- **Formats**: Table (cli-table3), JSON (pretty), Markdown (GitHub)
- **Flags**: `--format=<table|json|markdown>`
- **Acceptance**: All 3 formats work, look good
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-025

**TASK-027: Add Watch Mode**

- **File**: Update `lib/cli/status.ts`
- **Work**: Add `--watch` flag for real-time updates
- **Logic**: Poll every 2 seconds, clear console, re-display
- **Integration**: Use existing WebSocket if available
- **Acceptance**: Watch mode works, updates live, Ctrl+C exits
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-025

---

### Batch 2D: API Integration (2 tasks, can run in parallel after 2B)

**TASK-028: Create Status API Route**

- **File**: `app/api/status/route.ts`
- **Work**: GET endpoint for status queries
- **Query**: `?entity=<id>&format=<format>`
- **Logic**: Use registry, return formatted result
- **Acceptance**: API works, query params work, error handling
- **Estimated**: 1 hour
- **Dependencies**: TASK-024

**TASK-029: Add WebSocket Status Updates**

- **File**: Update `lib/sync/websocket-server.ts`
- **Work**: Broadcast status changes on entity updates
- **Events**: `status:story`, `status:epic`, `status:workflow`, `status:state`
- **Integration**: Hook into file watcher, detect changes, broadcast
- **Acceptance**: WebSocket broadcasts on changes, clients receive
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-024, TASK-028

---

### Batch 2E: Web UI Dashboard (2 tasks, sequential)

**TASK-030: Create Status Dashboard Component**

- **File**: `components/features/StatusDashboard.tsx`
- **Work**: Component displaying all entity statuses
- **Layout**: Grid with story/epic/workflow cards
- **Real-time**: WebSocket subscription for live updates
- **Acceptance**: Component renders, updates live, looks good
- **Estimated**: 2 hours
- **Dependencies**: TASK-028, TASK-029

**TASK-031: Create Status Dashboard Page**

- **File**: `app/status/page.tsx`
- **Work**: Page with search + dashboard component
- **UI**: Search bar, filter dropdown, status cards
- **Features**: Search entity ID, filter by type, refresh button
- **Acceptance**: Page works, search works, real-time updates
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-030

---

### Batch 2F: E2E Testing for Status Checker (1 task)

**TASK-032: Create Status Checker E2E Tests**

- **File**: `e2e-tests/status-checker.spec.ts`
- **Work**: Playwright tests for all status providers
- **Tests**: CLI status, API status, Web UI status, watch mode, real-time
- **Acceptance**: All flows tested, auto-detection verified
- **Estimated**: 2 hours
- **Dependencies**: TASK-027, TASK-031

---

## 🧪 Phase 3: E2E Testing Infrastructure (Option 4)

### Batch 3A: E2E Test Setup (2 tasks, sequential)

**TASK-033: Enhance Playwright Configuration**

- **File**: `playwright.config.ts`
- **Work**: Add projects for chromium, firefox, webkit
- **Config**: Screenshots, videos, trace on failure
- **Reporters**: HTML, JSON, GitHub Actions
- **Acceptance**: Config complete, all browsers work
- **Estimated**: 1 hour
- **Dependencies**: None

**TASK-034: Create E2E Test Helpers**

- **File**: `e2e-tests/utils/test-helpers.ts`
- **Work**: Reusable helpers for common E2E patterns
- **Helpers**: Login, navigation, wait for element, screenshot compare
- **Acceptance**: Helpers work, reduce test boilerplate
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-033

---

### Batch 3B: Core User Journey Tests (5 tasks, can run in parallel after 3A)

**TASK-035: Setup Wizard E2E Test**

- **File**: `e2e-tests/setup-wizard.spec.ts`
- **Work**: Complete setup wizard flow test
- **Steps**: Fill all 4 steps, save config, verify files
- **Assertions**: Config saved, .env created, redirects to home
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-034

**TASK-036: Kanban Board E2E Test**

- **File**: `e2e-tests/kanban.spec.ts`
- **Work**: Test Kanban board functionality
- **Tests**: Load board, verify columns, check story counts, refresh
- **Assertions**: 4 columns, stories in correct state, no errors
- **Estimated**: 1 hour
- **Dependencies**: TASK-034

**TASK-037: Agent Management E2E Test**

- **File**: `e2e-tests/agents.spec.ts`
- **Work**: Test agent listing and detail pages
- **Tests**: List agents, click agent, view detail, back navigation
- **Assertions**: 5 agents load, details display, navigation works
- **Estimated**: 1 hour
- **Dependencies**: TASK-034

**TASK-038: LLM Test Page E2E Test**

- **File**: `e2e-tests/llm-test.spec.ts`
- **Work**: Test LLM connection testing flow
- **Tests**: Select provider, enter key, test connection (mock)
- **Assertions**: Form works, validation, success/error display
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-034

**TASK-039: Settings Page E2E Test**

- **File**: `e2e-tests/settings.spec.ts`
- **Work**: Test settings update flow
- **Tests**: Load settings, modify fields, save, verify persistence
- **Assertions**: Form loads, saves correctly, shows success
- **Estimated**: 1 hour
- **Dependencies**: TASK-034

---

### Batch 3C: Visual Regression Testing (2 tasks, can run in parallel after 3B)

**TASK-040: Setup Visual Regression**

- **File**: `e2e-tests/utils/visual-regression.ts`
- **Work**: Helper for screenshot comparison testing
- **Library**: Use Playwright's built-in screenshot comparison
- **Config**: Thresholds, diff images, update baseline
- **Acceptance**: Helper works, diffs generated
- **Estimated**: 1 hour
- **Dependencies**: TASK-034

**TASK-041: Add Visual Tests for All Pages**

- **File**: `e2e-tests/visual-regression.spec.ts`
- **Work**: Screenshot tests for all pages (light + dark mode)
- **Pages**: Home, Kanban, Agents, Workflows, Settings, LLM Test, Status
- **Assertions**: No visual regressions, <1% diff threshold
- **Estimated**: 2 hours
- **Dependencies**: TASK-040

---

### Batch 3D: CI/CD Integration (1 task)

**TASK-042: Add GitHub Actions E2E Workflow**

- **File**: `.github/workflows/e2e-tests.yml`
- **Work**: CI workflow running E2E tests on PR
- **Jobs**: Install deps, build, run Playwright, upload artifacts
- **Triggers**: Pull request, push to main/develop
- **Acceptance**: Workflow runs, tests pass, artifacts uploaded
- **Estimated**: 1.5 hours
- **Dependencies**: TASK-033, TASK-041

---

## 📊 Execution Plan

### Total Tasks: 42 autonomous tasks

- **Phase 1 (Scale Router)**: 18 tasks | ~25 hours
- **Phase 2 (Status Checker)**: 14 tasks | ~20 hours
- **Phase 3 (E2E Testing)**: 10 tasks | ~14 hours
- **Total Effort**: ~59 hours of work

### Parallel Execution Strategy

**Wave 1** (7 parallel tasks, 0 dependencies):

- TASK-001, TASK-019, TASK-033

**Wave 2** (12 parallel tasks, depends on Wave 1):

- TASK-002, TASK-004, TASK-006, TASK-009, TASK-020, TASK-021, TASK-022, TASK-034

**Wave 3** (10 parallel tasks, depends on Wave 2):

- TASK-003, TASK-005, TASK-007, TASK-010, TASK-014, TASK-023, TASK-024, TASK-035, TASK-036, TASK-037

**Wave 4** (8 parallel tasks, depends on Wave 3):

- TASK-008, TASK-011, TASK-015, TASK-016, TASK-025, TASK-038, TASK-039, TASK-040

**Wave 5** (5 parallel tasks, depends on Wave 4):

- TASK-012, TASK-017, TASK-026, TASK-028, TASK-041

**Wave 6** (5 parallel tasks, depends on Wave 5):

- TASK-013, TASK-018, TASK-027, TASK-029, TASK-042

**Wave 7** (3 parallel tasks, depends on Wave 6):

- TASK-030, TASK-032

**Wave 8** (1 task, depends on Wave 7):

- TASK-031

### Execution Time Estimate

With **10 parallel sub-agents**:

- Sequential execution: ~59 hours
- Parallel execution (10 agents): ~12-15 hours
- **Speedup**: ~4x faster

---

## 🎯 Sub-Agent Instructions

Each sub-agent should:

1. ✅ **Read task description** - Understand file, work, acceptance criteria
2. ✅ **Check dependencies** - Verify prerequisite tasks completed
3. ✅ **Implement solution** - Write code per specification
4. ✅ **Run quality checks** - `npm run check-all && npm run build`
5. ✅ **Commit changes** - Single commit with task ID in message
6. ✅ **Push to branch** - `git push origin task/<TASK-ID>`
7. ✅ **Exit** - No reporting back, task complete

### Commit Message Format

```
feat(task-<ID>): <Task title>

Implements TASK-<ID> from autonomous task breakdown.

Changes:
- Created/Updated <file>
- <Key change 1>
- <Key change 2>

Acceptance criteria met:
- [x] <Criterion 1>
- [x] <Criterion 2>

Quality checks: PASSED (check-all + build)
```

---

## 🔥 Ready for Parallel Execution!

All tasks are atomic, self-contained, and ready for autonomous sub-agent execution.

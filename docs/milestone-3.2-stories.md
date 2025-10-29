# Milestone 3.2: CLI Enhancements - Story Breakdown

**Milestone**: 3.2 - CLI Enhancements
**Priority**: P1 (High - Power Users)
**Timeline**: 2-3 weeks (Weeks 5-7)
**Total Points**: 35 points
**Status**: 📅 Planned

---

## Overview

This milestone focuses on enhancing the CLI experience for power users who prefer terminal-based workflows. Key features include an interactive REPL mode, a real-time terminal dashboard (TUI), and full feature parity with the Web UI.

**Target Users**: Developers and power users who prefer CLI over Web UI

**Success Metrics**:

- REPL launches successfully with tab completion
- Dashboard provides real-time project status in terminal
- All Web UI features accessible via CLI commands

---

## Week 5: Interactive REPL Mode (12 points)

### [CLI-001] Implement Interactive REPL with Basic Commands (5 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Create an interactive Read-Eval-Print Loop (REPL) mode that allows users to execute MADACE commands in a conversational manner.

**Acceptance Criteria**:

- ✅ `npm run madace repl` launches interactive mode
- ✅ Displays welcome banner with available commands
- ✅ Prompts user for input: `madace>`
- ✅ Supports basic commands: `agents`, `workflows`, `status`, `help`, `exit`
- ✅ Executes commands and displays results in-terminal
- ✅ Handles errors gracefully with helpful messages
- ✅ Exits cleanly with Ctrl+C or `/exit` command
- ✅ Maintains session state (selected agent, current workflow)

**Technical Details**:

- Library: `inquirer` v9.x or `@inquirer/prompts` v5.x
- Architecture: Command parser → Business logic layer → Output formatter
- Session state: In-memory object tracking current context

**Implementation Steps**:

1. Install inquirer or @inquirer/prompts
2. Create `lib/cli/repl.ts` with REPL class
3. Implement command parser (regex-based or simple split)
4. Create command registry (map command strings to handlers)
5. Implement basic commands: `agents`, `workflows`, `status`, `help`, `exit`
6. Add error handling and validation
7. Write unit tests for command parsing
8. Write integration tests for REPL session

**Files to Create/Modify**:

- `lib/cli/repl.ts` (new) - REPL engine
- `lib/cli/commands/repl-commands.ts` (new) - Command handlers
- `bin/madace.ts` (modify) - Add `repl` command
- `__tests__/lib/cli/repl.test.ts` (new) - REPL tests

**Definition of Done**:

- REPL launches and accepts commands
- All basic commands work correctly
- Unit tests pass (coverage > 80%)
- Integration tests pass
- User documentation added to README.md

---

### [CLI-002] Add Command Auto-completion (4 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Implement tab completion for commands and agent names to improve user experience.

**Acceptance Criteria**:

- ✅ Tab key triggers auto-completion
- ✅ Completes command names (`ag<TAB>` → `agents`)
- ✅ Completes agent names (`run pm<TAB>` → `run pm-agent`)
- ✅ Shows multiple matches if ambiguous (`a<TAB>` shows `agents`, `assess-scale`)
- ✅ Works for subcommands (`workflow <TAB>` shows `list`, `run`, `status`)
- ✅ Fuzzy matching for typos (`aget<TAB>` suggests `agents`)

**Technical Details**:

- Inquirer's `autocomplete` prompt type
- Command registry provides completion candidates
- Agent list fetched from database dynamically
- Fuzzy matching with `fuse.js` or similar

**Implementation Steps**:

1. Replace basic inquirer prompt with autocomplete prompt
2. Build completion source from command registry
3. Fetch agent list from database for agent completion
4. Implement fuzzy matching algorithm
5. Add completion for workflow names
6. Write tests for completion logic

**Files to Create/Modify**:

- `lib/cli/repl.ts` (modify) - Add autocomplete support
- `lib/cli/completion.ts` (new) - Completion engine
- `__tests__/lib/cli/completion.test.ts` (new) - Completion tests

**Definition of Done**:

- Tab completion works for commands and agents
- Fuzzy matching handles typos gracefully
- Tests cover all completion scenarios

---

### [CLI-003] Add Command History and Multi-line Input (3 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Support command history (up/down arrows) and multi-line input for complex commands.

**Acceptance Criteria**:

- ✅ Up arrow recalls previous command
- ✅ Down arrow moves forward in history
- ✅ Command history persists across sessions (saved to `~/.madace_history`)
- ✅ Multi-line input with `\` continuation character
- ✅ Multi-line input with explicit mode (`/multi` command)
- ✅ Syntax highlighting for YAML/JSON in multi-line mode

**Technical Details**:

- Node.js `readline` module provides history support
- History file: `~/.madace_history` (max 1000 commands)
- Multi-line: Detect `\` at end or `/multi` command
- Syntax highlighting: `chalk` for colors

**Implementation Steps**:

1. Configure inquirer to use readline with history
2. Implement history file persistence
3. Add multi-line input detection
4. Implement syntax highlighting with chalk
5. Add tests for history persistence
6. Add tests for multi-line parsing

**Files to Create/Modify**:

- `lib/cli/repl.ts` (modify) - Add history and multi-line support
- `lib/cli/history.ts` (new) - History persistence
- `lib/cli/syntax-highlight.ts` (new) - Syntax highlighting
- `__tests__/lib/cli/history.test.ts` (new) - History tests

**Definition of Done**:

- Command history works (up/down arrows)
- History persists across sessions
- Multi-line input works with `\` or `/multi`
- Syntax highlighting applied to code blocks

---

## Week 6: Terminal Dashboard (13 points)

### [CLI-004] Build Terminal Dashboard with Blessed (8 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Create a real-time terminal dashboard (TUI) showing project status, agents, workflows, and logs.

**Acceptance Criteria**:

- ✅ `npm run madace dashboard` launches TUI
- ✅ 4-pane split layout:
  - Top-left: Agent list with status indicators
  - Top-right: Workflow list with progress
  - Bottom-left: State machine (BACKLOG/TODO/IN PROGRESS/DONE counts)
  - Bottom-right: Live logs (last 20 lines)
- ✅ Real-time updates (refreshes every 5 seconds)
- ✅ Color-coded status: Green (running), Yellow (pending), Red (error), Gray (idle)
- ✅ Responsive to terminal resize
- ✅ Exit with `q` or Ctrl+C

**Technical Details**:

- Library: `blessed` v0.1.81 (mature, stable)
- Layout: Box elements with borders
- Data source: Database queries (agents, workflows, state)
- Refresh: `setInterval()` every 5 seconds
- Responsive: Listen to `resize` event

**Implementation Steps**:

1. Install blessed and @types/blessed
2. Create `lib/cli/dashboard/index.ts` - Dashboard main class
3. Create 4 pane components:
   - `lib/cli/dashboard/agents-pane.ts`
   - `lib/cli/dashboard/workflows-pane.ts`
   - `lib/cli/dashboard/state-pane.ts`
   - `lib/cli/dashboard/logs-pane.ts`
4. Implement data fetching from database
5. Implement auto-refresh logic
6. Add keyboard event handlers
7. Write integration tests (mock blessed screen)

**Files to Create/Modify**:

- `lib/cli/dashboard/index.ts` (new) - Main dashboard class
- `lib/cli/dashboard/agents-pane.ts` (new) - Agents pane
- `lib/cli/dashboard/workflows-pane.ts` (new) - Workflows pane
- `lib/cli/dashboard/state-pane.ts` (new) - State machine pane
- `lib/cli/dashboard/logs-pane.ts` (new) - Logs pane
- `bin/madace.ts` (modify) - Add `dashboard` command
- `__tests__/lib/cli/dashboard/dashboard.test.ts` (new) - Dashboard tests

**Definition of Done**:

- Dashboard launches and displays all 4 panes
- Real-time data updates every 5 seconds
- Color-coded status indicators work
- Responsive to terminal resize
- Tests pass with mocked blessed screen

---

### [CLI-005] Add Keyboard Navigation to Dashboard (5 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Enable keyboard-only navigation in the terminal dashboard for power users.

**Acceptance Criteria**:

- ✅ Arrow keys navigate between panes
- ✅ Tab key cycles through panes (clockwise)
- ✅ Enter key selects/drills into item (e.g., view agent details)
- ✅ Escape key returns to main view
- ✅ `r` key manually refreshes all panes
- ✅ `q` key quits dashboard
- ✅ Visual indicator shows focused pane (highlighted border)

**Technical Details**:

- Blessed's focus management system
- Keyboard event listeners per pane
- Focus state tracked in dashboard state

**Implementation Steps**:

1. Implement focus management in dashboard class
2. Add keyboard event listeners (arrow, tab, enter, escape, r, q)
3. Add visual focus indicator (change border color)
4. Implement drill-down views (agent details, workflow details)
5. Implement navigation breadcrumbs
6. Write tests for keyboard navigation

**Files to Create/Modify**:

- `lib/cli/dashboard/index.ts` (modify) - Add keyboard navigation
- `lib/cli/dashboard/focus-manager.ts` (new) - Focus state management
- `lib/cli/dashboard/detail-views.ts` (new) - Drill-down views
- `__tests__/lib/cli/dashboard/navigation.test.ts` (new) - Navigation tests

**Definition of Done**:

- Arrow keys and Tab navigate between panes
- Enter drills into details, Escape returns
- Visual focus indicator shows active pane
- All keyboard shortcuts work
- Tests cover all navigation scenarios

---

## Week 7: CLI Feature Parity & Testing (10 points)

### [CLI-006] Implement Full CLI Feature Parity (6 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Ensure CLI has all features available in Web UI, including agent management, workflow execution, and configuration.

**Acceptance Criteria**:

**Agent Management**:

- ✅ `madace agents list` - List all agents
- ✅ `madace agents show <name>` - Show agent details
- ✅ `madace agents create <file>` - Create agent from YAML
- ✅ `madace agents update <name> <file>` - Update agent
- ✅ `madace agents delete <name>` - Delete agent
- ✅ `madace agents export <name>` - Export agent to JSON
- ✅ `madace agents import <file>` - Import agent from JSON

**Workflow Management**:

- ✅ `madace workflows list` - List all workflows
- ✅ `madace workflows show <name>` - Show workflow details
- ✅ `madace workflows run <name>` - Run workflow
- ✅ `madace workflows status <name>` - Show workflow status
- ✅ `madace workflows pause <name>` - Pause workflow
- ✅ `madace workflows resume <name>` - Resume workflow
- ✅ `madace workflows reset <name>` - Reset workflow state

**State Machine**:

- ✅ `madace state show` - Show state machine status
- ✅ `madace state transition <story-id> <new-state>` - Transition story
- ✅ `madace state stats` - Show statistics (counts by state)

**Configuration**:

- ✅ `madace config get <key>` - Get config value
- ✅ `madace config set <key> <value>` - Set config value
- ✅ `madace config list` - List all config
- ✅ `madace config validate` - Validate config

**Project**:

- ✅ `madace project init` - Initialize new project
- ✅ `madace project status` - Show project status
- ✅ `madace project stats` - Show project statistics

**Technical Details**:

- Commander.js command structure (already in use)
- Reuse existing API endpoints and service layers
- Output formatting: Table (cli-table3) or JSON (--json flag)
- Interactive confirmations for destructive actions

**Implementation Steps**:

1. Create command files in `lib/cli/commands/`:
   - `agents.ts` (agent management commands)
   - `workflows.ts` (workflow commands)
   - `state.ts` (state machine commands)
   - `config.ts` (configuration commands)
   - `project.ts` (project commands)
2. Implement output formatters (table, JSON, YAML)
3. Add interactive confirmations (inquirer)
4. Add --json flag for machine-readable output
5. Write unit tests for each command
6. Write integration tests for command flows

**Files to Create/Modify**:

- `lib/cli/commands/agents.ts` (new) - Agent commands
- `lib/cli/commands/workflows.ts` (new) - Workflow commands
- `lib/cli/commands/state.ts` (new) - State commands
- `lib/cli/commands/config.ts` (new) - Config commands
- `lib/cli/commands/project.ts` (new) - Project commands
- `lib/cli/formatters/table.ts` (new) - Table output formatter
- `lib/cli/formatters/json.ts` (new) - JSON output formatter
- `bin/madace.ts` (modify) - Register all new commands
- `__tests__/lib/cli/commands/**/*.test.ts` (new) - Command tests

**Definition of Done**:

- All 30+ commands implemented and working
- Output formatting works (table and JSON)
- Interactive confirmations work for destructive actions
- Unit tests pass (coverage > 80%)
- Integration tests pass
- CLI documentation updated

---

### [CLI-007] CLI Testing and Documentation (4 points)

**Priority**: P1
**Status**: 📅 Planned

**Description**: Write comprehensive tests for CLI functionality and update documentation.

**Acceptance Criteria**:

**Testing**:

- ✅ Unit tests for all CLI commands (coverage > 80%)
- ✅ Integration tests for REPL session flows
- ✅ Integration tests for dashboard rendering
- ✅ E2E tests for common CLI workflows
- ✅ Mock tests for blessed screen rendering
- ✅ All tests pass in CI/CD

**Documentation**:

- ✅ CLI reference guide (`docs/CLI-REFERENCE.md`)
- ✅ REPL tutorial (`docs/REPL-TUTORIAL.md`)
- ✅ Dashboard guide (`docs/DASHBOARD-GUIDE.md`)
- ✅ README.md updated with CLI examples
- ✅ Video demo or GIF for README

**Technical Details**:

- Jest for unit/integration tests
- Mock blessed screen for TUI tests
- Playwright or similar for E2E tests (if needed)
- Markdown documentation with code examples

**Implementation Steps**:

1. Write unit tests for all command modules
2. Write integration tests for REPL flows
3. Write integration tests for dashboard
4. Create CLI reference guide (all commands, flags, examples)
5. Create REPL tutorial (step-by-step guide)
6. Create dashboard guide (keyboard shortcuts, navigation)
7. Update README.md with CLI quickstart
8. Record GIF demo using asciinema or terminalizer

**Files to Create/Modify**:

- `__tests__/lib/cli/**/*.test.ts` (new) - Comprehensive CLI tests
- `docs/CLI-REFERENCE.md` (new) - CLI reference guide
- `docs/REPL-TUTORIAL.md` (new) - REPL tutorial
- `docs/DASHBOARD-GUIDE.md` (new) - Dashboard guide
- `README.md` (modify) - Add CLI quickstart
- `docs/assets/cli-demo.gif` (new) - CLI demo recording

**Definition of Done**:

- All CLI tests pass (> 80% coverage)
- All documentation complete
- README.md has CLI quickstart with demo GIF
- Tests run successfully in CI/CD

---

## Summary

**Total Stories**: 7 stories
**Total Points**: 35 points

**Week 5 (REPL)**: 12 points

- [CLI-001] Interactive REPL (5 points)
- [CLI-002] Auto-completion (4 points)
- [CLI-003] Command history (3 points)

**Week 6 (Dashboard)**: 13 points

- [CLI-004] Terminal dashboard (8 points)
- [CLI-005] Keyboard navigation (5 points)

**Week 7 (Feature Parity)**: 10 points

- [CLI-006] Full CLI feature parity (6 points)
- [CLI-007] CLI testing and documentation (4 points)

**Estimated Timeline**: 2-3 weeks (15-21 days)

**Key Dependencies**:

- Milestone 3.1 complete (database and APIs must be functional)
- Node.js v20+ (for modern readline features)
- Terminal with 256 color support (for dashboard)

**Success Criteria**:

- REPL launches and provides interactive experience
- Dashboard shows real-time project status
- All Web UI features accessible via CLI
- Comprehensive test coverage (> 80%)
- Complete documentation with tutorials

---

**Next Steps**:

1. Update `docs/workflow-status.md` with these stories
2. Move [CLI-001] to TODO
3. Begin implementation of Interactive REPL

**Release Target**: v3.2-alpha (CLI Enhancements)

---

**Last Updated**: 2025-10-29 by Claude Code (MADACE PM Agent)

# MADACE CLI Reference

**Version**: 3.0.0-alpha
**Last Updated**: 2025-10-29

Complete reference for all MADACE CLI commands and options.

---

## Table of Contents

- [Installation](#installation)
- [Global Options](#global-options)
- [Agent Management](#agent-management)
- [Configuration](#configuration)
- [Project Management](#project-management)
- [State Machine](#state-machine)
- [Workflows](#workflows)
- [Interactive Modes](#interactive-modes)
- [Output Formats](#output-formats)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/tekcin/MADACE-Method-v3.0.git
cd MADACE-Method-v3.0

# Install dependencies
npm install

# Build CLI
npm run build

# Run CLI
npm run madace <command>
```

---

## Global Options

All commands support these global flags:

| Flag        | Description                              | Example                     |
| ----------- | ---------------------------------------- | --------------------------- |
| `--json`    | Output in JSON format (machine-readable) | `madace agents list --json` |
| `--help`    | Show command help                        | `madace agents --help`      |
| `--version` | Show MADACE version                      | `madace --version`          |

---

## Agent Management

Manage MADACE agents (create, read, update, delete, import/export).

### `madace agents list`

List all agents with optional filtering.

**Usage**:

```bash
madace agents list [options]
```

**Options**:

- `--module <module>` - Filter by module (mam, mab, cis, core)
- `--json` - Output as JSON

**Examples**:

```bash
# List all agents
madace agents list

# List MAM agents only
madace agents list --module mam

# List as JSON
madace agents list --json
```

**Output (Table)**:

```
Agents

┌──────┬───────────────┬──────────────────────────────┬──────────┬─────────┐
│ Icon │ Name          │ Title                        │ Module   │ Version │
├──────┼───────────────┼──────────────────────────────┼──────────┼─────────┤
│ 🎯   │ pm            │ Project Manager              │ MAM      │ 1.0.0   │
│ 📊   │ analyst       │ Business Analyst             │ MAM      │ 1.0.0   │
│ 🏗️   │ architect     │ Technical Architect          │ MAM      │ 1.0.0   │
│ 📋   │ sm            │ Scrum Master                 │ MAM      │ 1.0.0   │
│ 💻   │ dev           │ Developer                    │ MAM      │ 1.0.0   │
└──────┴───────────────┴──────────────────────────────┴──────────┴─────────┘

Total: 5 items
```

---

### `madace agents show <name>`

Show detailed information about a specific agent.

**Usage**:

```bash
madace agents show <name> [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Show PM agent
madace agents show pm

# Show as JSON
madace agents show pm --json
```

**Output (Table)**:

```
Agent: pm

┌─────────────┬──────────────────────────────────────────────────────────┐
│ ID          │ clxxxxx123                                                │
│ Name        │ pm                                                        │
│ Title       │ Project Manager                                           │
│ Icon        │ 🎯                                                        │
│ Module      │ MAM                                                       │
│ Version     │ 1.0.0                                                     │
│ Role        │ Lead strategic planning and project coordination         │
│ Created At  │ 2025-10-29T00:00:00.000Z                                 │
│ Updated At  │ 2025-10-29T00:00:00.000Z                                 │
└─────────────┴──────────────────────────────────────────────────────────┘
```

---

### `madace agents create <file>`

Create a new agent from a YAML file.

**Usage**:

```bash
madace agents create <file> [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Create agent from YAML
madace agents create new-agent.yaml

# Create with JSON output
madace agents create new-agent.yaml --json
```

**YAML Format**:

```yaml
agent:
  metadata:
    name: my-agent
    title: My Custom Agent
    icon: 🤖
    module: custom
    version: 1.0.0
  persona:
    role: Custom role description
    identity: Agent identity
    communication_style: Communication style
    principles:
      - Principle 1
      - Principle 2
```

**Output**:

```
✅ Agent 'my-agent' created successfully!
   ID: clxxxxx456
   Title: My Custom Agent
```

---

### `madace agents update <name> <file>`

Update an existing agent from a YAML file.

**Usage**:

```bash
madace agents update <name> <file> [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Update agent
madace agents update pm updated-pm.yaml

# Update with JSON output
madace agents update pm updated-pm.yaml --json
```

**Output**:

```
✅ Agent 'pm' updated successfully!
   Title: Project Manager
   Version: 1.1.0
```

---

### `madace agents delete <name>`

Delete an agent (with confirmation prompt).

**Usage**:

```bash
madace agents delete <name> [options]
```

**Options**:

- `--yes` - Skip confirmation prompt
- `--json` - Output as JSON

**Examples**:

```bash
# Delete with confirmation
madace agents delete old-agent

# Delete without confirmation
madace agents delete old-agent --yes

# Delete with JSON output
madace agents delete old-agent --yes --json
```

**Output**:

```
? Are you sure you want to delete agent 'old-agent'? (y/N) y

✅ Agent 'old-agent' deleted successfully!
```

---

### `madace agents export <name>`

Export an agent to JSON format.

**Usage**:

```bash
madace agents export <name> [options]
```

**Options**:

- `-o, --output <file>` - Save to file (default: stdout)

**Examples**:

```bash
# Export to stdout
madace agents export pm

# Export to file
madace agents export pm -o pm-backup.json
```

**Output (to file)**:

```
✅ Agent 'pm' exported to pm-backup.json
```

---

### `madace agents import <file>`

Import an agent from JSON file.

**Usage**:

```bash
madace agents import <file> [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Import agent
madace agents import pm-backup.json

# Import with JSON output
madace agents import pm-backup.json --json
```

**Output**:

```
✅ Agent 'pm' imported successfully!
   ID: clxxxxx789
   Title: Project Manager
```

---

## Configuration

Manage MADACE configuration (project settings, LLM config, modules).

### `madace config get <key>`

Get a configuration value (supports nested keys with dot notation).

**Usage**:

```bash
madace config get <key> [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Get project name
madace config get project_name

# Get nested value
madace config get modules.mam.enabled

# Get with JSON output
madace config get project_name --json
```

**Output**:

```
Configuration Value

┌──────────────┬────────────────────┐
│ project_name │ MADACE-Method v3.0 │
└──────────────┴────────────────────┘
```

---

### `madace config set <key> <value>`

Set a configuration value (supports JSON values).

**Usage**:

```bash
madace config set <key> <value> [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Set string value
madace config set project_name "My Project"

# Set boolean value (JSON)
madace config set modules.mam.enabled true

# Set nested value
madace config set llm.provider gemini

# Set with JSON output
madace config set project_name "My Project" --json
```

**Output**:

```
✅ Configuration 'project_name' updated successfully!
   New value: "My Project"
```

---

### `madace config list`

List all configuration values.

**Usage**:

```bash
madace config list [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# List all config
madace config list

# List as JSON
madace config list --json
```

**Output**:

```
MADACE Configuration

┌────────────────────────────────┬────────────────────┐
│ project_name                   │ MADACE-Method v3.0 │
│ output_folder                  │ docs               │
│ user_name                      │ John Doe           │
│ communication_language         │ English            │
│ modules.mam.enabled            │ true               │
│ modules.mab.enabled            │ false              │
│ modules.cis.enabled            │ false              │
└────────────────────────────────┴────────────────────┘
```

---

### `madace config validate`

Validate configuration file.

**Usage**:

```bash
madace config validate [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Validate config
madace config validate

# Validate with JSON output
madace config validate --json
```

**Output (valid)**:

```
✅ Configuration is valid!

⚠️  Warnings:
   - LLM provider not configured
```

**Output (invalid)**:

```
❌ Configuration is invalid!

Errors:
   - project_name is required
   - output_folder is required
```

---

## Project Management

Manage MADACE projects.

### `madace project init`

Initialize a new MADACE project (interactive).

**Usage**:

```bash
madace project init [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Initialize project
madace project init
```

**Interactive Prompts**:

```
? Project name: My MADACE Project
? Output folder: docs
? Your name: John Doe
? Communication language: English
? Enable MAM (MADACE Agile Method)? Yes
? Enable MAB (MADACE Builder)? No
? Enable CIS (Creative Intelligence Suite)? No

✅ Project initialized successfully!

   Project: My MADACE Project
   Output folder: docs
   User: John Doe

Next steps:
   1. Configure LLM provider (if not using local)
   2. Run: madace project status
   3. Start development!
```

---

### `madace project status`

Show project status.

**Usage**:

```bash
madace project status [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Show project status
madace project status

# Show as JSON
madace project status --json
```

**Output**:

```
MADACE Project Status

┌───────────────────┬────────────────────┐
│ Project Name      │ MADACE-Method v3.0 │
│ Output Folder     │ docs               │
│ User              │ John Doe           │
│ Language          │ English            │
│ Enabled Modules   │ MAM                │
│ LLM Provider      │ gemini (...)       │
│ Workflow Status   │ Active             │
│ Total Stories     │ 22                 │
│ Completed         │ 21                 │
│ In Progress       │ 1                  │
│ To Do             │ 0                  │
│ Backlog           │ 0                  │
└───────────────────┴────────────────────┘
```

---

### `madace project stats`

Show project statistics.

**Usage**:

```bash
madace project stats [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Show project stats
madace project stats

# Show as JSON
madace project stats --json
```

**Output**:

```
MADACE Project Statistics

┌─────────────────────┬────────────────────┐
│ Project Name        │ MADACE-Method v3.0 │
│ Total Stories       │ 22                 │
│ Completed Stories   │ 21                 │
│ In Progress         │ 1                  │
│ Backlog/To Do       │ 0                  │
│ Total Points        │ 92                 │
│ Completed Points    │ 88                 │
│ Remaining Points    │ 4                  │
│ Completion Rate     │ 95.7%              │
└─────────────────────┴────────────────────┘

Top Stories by Points:

┌────────────┬──────────────────────────────────────────┬────────┬──────────────┐
│ ID         │ Title                                    │ Points │ Status       │
├────────────┼──────────────────────────────────────────┼────────┼──────────────┤
│ CLI-007    │ CLI Testing and Documentation            │      4 │ IN PROGRESS  │
└────────────┴──────────────────────────────────────────┴────────┴──────────────┘

Total: 1 items
```

---

## State Machine

Manage MADACE state machine (story lifecycle).

### `madace state show`

Show state machine status.

**Usage**:

```bash
madace state show [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Show state machine
madace state show

# Show as JSON
madace state show --json
```

**Output**:

```
State Machine Status

┌────────────────────┬──────────────────────────────────┐
│ Current TODO       │ None                              │
│ Current IN PROGRESS│ [CLI-007] CLI Testing and Docs   │
│ Backlog Count      │ 0                                 │
│ TODO Count         │ 0                                 │
│ In Progress Count  │ 1                                 │
│ Done Count         │ 21                                │
│ Validation         │ ✅ Valid                          │
└────────────────────┴──────────────────────────────────┘

IN PROGRESS:

┌────────────┬──────────────────────────────────────────┬────────┐
│ ID         │ Title                                    │ Points │
├────────────┼──────────────────────────────────────────┼────────┤
│ CLI-007    │ CLI Testing and Documentation            │      4 │
└────────────┴──────────────────────────────────────────┴────────┘

Total: 1 items
```

---

### `madace state transition <story-id> <new-state>`

Transition a story to a new state (validates MADACE rules).

**Usage**:

```bash
madace state transition <story-id> <new-state> [options]
```

**Valid States**:

- `BACKLOG`
- `TODO`
- `IN_PROGRESS`
- `DONE`

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Move story from BACKLOG to TODO
madace state transition CLI-008 TODO

# Move story from TODO to IN_PROGRESS
madace state transition CLI-008 IN_PROGRESS

# Move story from IN_PROGRESS to DONE
madace state transition CLI-007 DONE

# Transition with JSON output
madace state transition CLI-008 TODO --json
```

**Valid Transitions**:

```
BACKLOG → TODO
TODO → IN_PROGRESS or BACKLOG
IN_PROGRESS → DONE or TODO
DONE → (no transitions)
```

**Output**:

```
✅ Story 'CLI-007' transitioned to DONE!
```

**Error (invalid transition)**:

```
❌ Transition failed: Cannot move to TODO: already has 1 story

Valid transitions:
   BACKLOG → TODO
   TODO → IN_PROGRESS or BACKLOG
   IN_PROGRESS → DONE or TODO
   DONE → (no transitions)
```

---

### `madace state stats`

Show state machine statistics.

**Usage**:

```bash
madace state stats [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Show stats
madace state stats

# Show as JSON
madace state stats --json
```

**Output**:

```
State Machine Statistics

┌──────────────────────────┬────────┐
│ Total Stories            │ 22     │
│ Total Points             │ 92     │
│ Completed Stories        │ 21     │
│ Completed Points         │ 88     │
│ In Progress Stories      │ 1      │
│ In Progress Points       │ 4      │
│ TODO Stories             │ 0      │
│ TODO Points              │ 0      │
│ Backlog Stories          │ 0      │
│ Backlog Points           │ 0      │
│ Completion Rate          │ 95.7%  │
│ Avg Points per Story     │ 4.2    │
│ State Machine Valid      │ Yes    │
└──────────────────────────┴────────┘

Completed Stories by Points:

┌────────────┬──────────────────────────────────────────┬────────┐
│ ID         │ Title                                    │ Points │
├────────────┼──────────────────────────────────────────┼────────┤
│ DB-002     │ Design and implement core database schema│      8 │
│ CLI-004    │ Build Terminal Dashboard with Blessed    │      8 │
│ CLI-006    │ Implement Full CLI Feature Parity       │      6 │
└────────────┴──────────────────────────────────────────┴────────┘

Total: 3 items
```

---

## Workflows

Manage and execute MADACE workflows.

### `madace workflows list`

List all available workflows.

**Usage**:

```bash
madace workflows list [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# List workflows
madace workflows list

# List as JSON
madace workflows list --json
```

**Output**:

```
Available Workflows

┌─────────────────────────┬────────┬─────────────────────────────────────┐
│ Name                    │ Module │ Description                         │
├─────────────────────────┼────────┼─────────────────────────────────────┤
│ create-prd              │ MAM    │ Create Product Requirements Doc     │
│ create-stories          │ MAM    │ Break down epics into stories       │
│ workflow-assessment     │ CORE   │ Assess project complexity           │
└─────────────────────────┴────────┴─────────────────────────────────────┘

Total: 3 items
```

---

### `madace workflows show <name>`

Show workflow details.

**Usage**:

```bash
madace workflows show <name> [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Show workflow
madace workflows show create-prd

# Show as JSON
madace workflows show create-prd --json
```

**Output**:

```
Workflow: create-prd

┌─────────────┬──────────────────────────────────────────┐
│ Name        │ create-prd                                │
│ Description │ Create Product Requirements Document     │
│ Total Steps │ 5                                         │
│ File        │ madace/mam/workflows/create-prd.yaml     │
└─────────────┴──────────────────────────────────────────┘

Steps:

┌───┬─────────────────────┬──────────┬─────────────────────────────────┐
│ # │ Name                │ Action   │ Description                     │
├───┼─────────────────────┼──────────┼─────────────────────────────────┤
│ 1 │ Elicit Requirements │ elicit   │ Gather project requirements     │
│ 2 │ Define Scope        │ guide    │ Define project scope            │
│ 3 │ Create Epics        │ template │ Generate epic breakdown         │
│ 4 │ Validate PRD        │ validate │ Review and validate PRD         │
│ 5 │ Save PRD            │ template │ Save final PRD document         │
└───┴─────────────────────┴──────────┴─────────────────────────────────┘

Total: 5 items
```

---

### `madace workflows run <file>`

Run a workflow to completion.

**Usage**:

```bash
madace workflows run <file> [options]
```

**Options**:

- `--json` - Output as JSON
- `--state-dir <dir>` - State directory (default: `madace-data/workflow-states`)

**Examples**:

```bash
# Run workflow
madace workflows run madace/mam/workflows/create-prd.yaml

# Run with custom state directory
madace workflows run create-prd.yaml --state-dir /tmp/states

# Run with JSON output
madace workflows run create-prd.yaml --json
```

**Output**:

```
🚀 Running workflow: create-prd
   State directory: madace-data/workflow-states

🔄 Step: Elicit Requirements
   Action: elicit
   ✅ Completed

🔄 Step: Define Scope
   Action: guide
   ✅ Completed

🔄 Step: Create Epics
   Action: template
   ✅ Completed

🔄 Step: Validate PRD
   Action: validate
   ✅ Completed

🔄 Step: Save PRD
   Action: template
   ✅ Completed

✅ Workflow completed successfully!
```

---

### `madace workflows status <name>`

Get workflow execution status.

**Usage**:

```bash
madace workflows status <name> [options]
```

**Options**:

- `--json` - Output as JSON
- `--state-dir <dir>` - State directory (default: `madace-data/workflow-states`)

**Examples**:

```bash
# Show workflow status
madace workflows status create-prd

# Show with JSON output
madace workflows status create-prd --json
```

**Output**:

```
Workflow Status: create-prd

┌──────────────────┬─────────────────────────────────┐
│ Workflow Name    │ create-prd                      │
│ Current Step     │ 3                               │
│ Completed        │ No                              │
│ Started At       │ 2025-10-29T10:30:00.000Z        │
│ Updated At       │ 2025-10-29T10:35:00.000Z        │
└──────────────────┴─────────────────────────────────┘

Variables:

┌────────────────┬─────────────────────────────────┐
│ project_name   │ My Project                      │
│ output_folder  │ docs                            │
│ current_epic   │ Epic 1: User Authentication     │
└────────────────┴─────────────────────────────────┘
```

---

### `madace workflows pause <name>`

Pause workflow execution (placeholder - not yet implemented).

**Usage**:

```bash
madace workflows pause <name> [options]
```

**Options**:

- `--json` - Output as JSON

**Examples**:

```bash
# Pause workflow
madace workflows pause create-prd
```

**Output**:

```
⚠️  Workflow pausing not yet implemented
   This feature is planned for a future release.
```

---

### `madace workflows resume <name>`

Resume paused workflow from last step.

**Usage**:

```bash
madace workflows resume <name> [options]
```

**Options**:

- `--json` - Output as JSON
- `--state-dir <dir>` - State directory (default: `madace-data/workflow-states`)

**Examples**:

```bash
# Resume workflow
madace workflows resume create-prd

# Resume with JSON output
madace workflows resume create-prd --json
```

**Output**:

```
🔄 Resuming workflow: create-prd

🔄 Step: Create Epics
   Action: template
   ✅ Completed

🔄 Step: Validate PRD
   Action: validate
   ✅ Completed

🔄 Step: Save PRD
   Action: template
   ✅ Completed

✅ Workflow resumed and completed successfully!
```

---

### `madace workflows reset <name>`

Reset workflow state (with confirmation).

**Usage**:

```bash
madace workflows reset <name> [options]
```

**Options**:

- `--yes` - Skip confirmation prompt
- `--json` - Output as JSON
- `--state-dir <dir>` - State directory (default: `madace-data/workflow-states`)

**Examples**:

```bash
# Reset workflow with confirmation
madace workflows reset create-prd

# Reset without confirmation
madace workflows reset create-prd --yes

# Reset with JSON output
madace workflows reset create-prd --yes --json
```

**Output**:

```
? Are you sure you want to reset workflow 'create-prd'? This will delete all progress. (y/N) y

✅ Workflow 'create-prd' state reset successfully!
```

---

## Interactive Modes

### `madace repl`

Start interactive REPL mode.

**Usage**:

```bash
madace repl
```

**Features**:

- Tab completion for commands and agent names
- Command history (up/down arrows)
- Multi-line input with `\` continuation
- Session state tracking
- Syntax highlighting

**Example Session**:

```bash
$ npm run madace repl

╔════════════════════════════════════════════════════════════════╗
║                   MADACE Interactive REPL                       ║
║                                                                 ║
║  Type 'help' for available commands                            ║
║  Press Ctrl+C or type '/exit' to quit                          ║
╚════════════════════════════════════════════════════════════════╝

madace> agents
Listing all agents...
(shows agent table)

madace> workflows
Listing all workflows...
(shows workflow table)

madace> /exit
Goodbye!
```

See [REPL-TUTORIAL.md](./REPL-TUTORIAL.md) for detailed tutorial.

---

### `madace dashboard`

Launch terminal dashboard (TUI).

**Usage**:

```bash
madace dashboard
```

**Features**:

- Real-time project status (refreshes every 5 seconds)
- 4-pane layout (agents, workflows, state machine, logs)
- Keyboard navigation (arrow keys, tab)
- Drill-down views (press Enter on items)
- Color-coded status indicators

**Keyboard Shortcuts**:

- **Arrow keys** - Navigate between panes
- **Tab** - Cycle through panes clockwise
- **Enter** - Drill down into details
- **Escape** - Return to main view
- **r** - Manual refresh
- **q** or **Ctrl+C** - Quit

See [DASHBOARD-GUIDE.md](./DASHBOARD-GUIDE.md) for detailed guide.

---

## Output Formats

MADACE CLI supports two output formats for all commands.

### Table Format (Default)

Human-readable ASCII table with colors and borders.

**Example**:

```bash
$ madace agents list

Agents

┌──────┬───────────────┬──────────────────────────────┬──────────┬─────────┐
│ Icon │ Name          │ Title                        │ Module   │ Version │
├──────┼───────────────┼──────────────────────────────┼──────────┼─────────┤
│ 🎯   │ pm            │ Project Manager              │ MAM      │ 1.0.0   │
└──────┴───────────────┴──────────────────────────────┴──────────┴─────────┘

Total: 1 items
```

### JSON Format (--json flag)

Machine-readable JSON for scripting and automation.

**Example**:

```bash
$ madace agents list --json

[
  {
    "name": "pm",
    "title": "Project Manager",
    "icon": "🎯",
    "module": "MAM",
    "version": "1.0.0"
  }
]
```

---

## Tips and Best Practices

### 1. Use Tab Completion

Press Tab to autocomplete commands and agent names in REPL mode:

```bash
madace> ag<TAB>
madace> agents
```

### 2. Use --json for Scripting

Pipe JSON output to `jq` for advanced filtering:

```bash
madace agents list --json | jq '.[] | select(.module == "MAM")'
```

### 3. Use --yes for Automation

Skip interactive confirmations in scripts:

```bash
madace agents delete old-agent --yes
```

### 4. Save and Restore Agents

Backup agents before making changes:

```bash
madace agents export pm -o pm-backup.json
# Make changes...
madace agents import pm-backup.json
```

### 5. Monitor Project Progress

Use the dashboard for real-time monitoring:

```bash
madace dashboard
```

### 6. Check State Machine First

Always check state before starting new work:

```bash
madace state show
madace state transition STORY-123 IN_PROGRESS
```

---

## Troubleshooting

### Configuration Not Found

```bash
$ madace config get project_name
Configuration not found. Run setup wizard first.
```

**Solution**: Initialize project first:

```bash
madace project init
```

### Agent Not Found

```bash
$ madace agents show unknown-agent
Agent 'unknown-agent' not found
```

**Solution**: List available agents:

```bash
madace agents list
```

### Invalid State Transition

```bash
$ madace state transition CLI-007 TODO
Invalid transition: IN_PROGRESS → TODO for story CLI-007
```

**Solution**: Check valid transitions:

```
BACKLOG → TODO
TODO → IN_PROGRESS or BACKLOG
IN_PROGRESS → DONE or TODO
DONE → (no transitions)
```

### Workflow State Not Found

```bash
$ madace workflows status create-prd
No state found for workflow 'create-prd'
```

**Solution**: Workflow has not been started yet. Run it first:

```bash
madace workflows run madace/mam/workflows/create-prd.yaml
```

---

## See Also

- [REPL Tutorial](./REPL-TUTORIAL.md) - Interactive REPL guide
- [Dashboard Guide](./DASHBOARD-GUIDE.md) - Terminal dashboard guide
- [README.md](../README.md) - Project overview
- [PRD.md](../PRD.md) - Product requirements

---

**Generated by**: Claude Code (MADACE Documentation Agent)
**Last Updated**: 2025-10-29

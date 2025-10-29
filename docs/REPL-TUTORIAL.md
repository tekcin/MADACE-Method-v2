# MADACE REPL Tutorial

**Interactive Read-Eval-Print Loop for MADACE Commands**

---

## Table of Contents

- [What is REPL?](#what-is-repl)
- [Getting Started](#getting-started)
- [Basic Commands](#basic-commands)
- [Tab Completion](#tab-completion)
- [Command History](#command-history)
- [Multi-line Input](#multi-line-input)
- [Session State](#session-state)
- [Advanced Usage](#advanced-usage)
- [Tips and Tricks](#tips-and-tricks)

---

## What is REPL?

REPL (Read-Eval-Print Loop) is an interactive programming environment that:

- **Reads** your command
- **Evaluates** it (executes)
- **Prints** the result
- **Loops** back for the next command

MADACE REPL provides a conversational interface to execute MADACE commands without typing `madace` prefix every time.

**Benefits**:
- Faster workflow (no `madace` prefix needed)
- Tab completion for commands and agents
- Command history across sessions
- Multi-line input for complex commands
- Session state tracking (selected agent, current workflow)

---

## Getting Started

### 1. Launch REPL

```bash
npm run madace repl
```

### 2. Welcome Screen

```
╔════════════════════════════════════════════════════════════════╗
║                   MADACE Interactive REPL                       ║
║                                                                 ║
║  Type 'help' for available commands                            ║
║  Press Ctrl+C or type '/exit' to quit                          ║
╚════════════════════════════════════════════════════════════════╝

madace>
```

### 3. Your First Command

```bash
madace> help
```

**Output**:
```
Available Commands:

  /help               Show this help message
  /agents             List all agents
  /workflows          List all workflows
  /status             Show project status
  /version            Show MADACE version
  /clear              Clear screen
  /exit               Exit REPL

Session Commands:

  select <agent>      Select an agent
  run <workflow>      Run a workflow
  show <agent>        Show agent details

Type any command without the 'madace' prefix.
Examples:
  agents list
  config get project_name
  state show
```

---

## Basic Commands

### Listing Agents

```bash
madace> agents list
```

**Output**:
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

### Showing Agent Details

```bash
madace> agents show pm
```

**Output**:
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

### Checking Project Status

```bash
madace> project status
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

### Showing State Machine

```bash
madace> state show
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
```

---

## Tab Completion

REPL supports smart tab completion for commands and parameters.

### Completing Commands

Type the first few letters and press **Tab**:

```bash
madace> ag<TAB>
madace> agents
```

```bash
madace> co<TAB>
madace> config
```

### Completing Agent Names

After typing a command, press **Tab** to see agent names:

```bash
madace> agents show <TAB>

Suggestions:
  pm
  analyst
  architect
  sm
  dev
```

### Fuzzy Matching

Typos? No problem! REPL uses fuzzy matching:

```bash
madace> aget<TAB>
madace> agents   (corrected from "aget")
```

### Multiple Matches

If multiple matches exist, REPL shows all options:

```bash
madace> a<TAB>

Suggestions:
  agents
  assess-scale
```

Use arrow keys (↑↓) to select from suggestions.

---

## Command History

REPL remembers your commands across sessions.

### Using History

- **Up arrow (↑)**: Recall previous command
- **Down arrow (↓)**: Move forward in history

**Example**:
```bash
madace> agents list
(output shown)

madace> project status
(output shown)

# Press ↑ to recall "project status"
madace> project status

# Press ↑ again to recall "agents list"
madace> agents list
```

### History File

Commands are saved to `~/.madace_history` (max 1000 commands).

**View history**:
```bash
$ cat ~/.madace_history
agents list
project status
state show
config get project_name
```

### Searching History

In REPL, start typing and press **Tab** to see recent matching commands:

```bash
madace> agents<TAB>

Recent history:
  agents list
  agents show pm
  agents show analyst
```

---

## Multi-line Input

REPL supports multi-line input for complex commands (YAML, JSON, etc.).

### Method 1: Backslash Continuation

Use `\` at the end of a line to continue:

```bash
madace> agents create \
... agent.yaml

(command executed with "agents create agent.yaml")
```

### Method 2: Explicit Multi-line Mode

Use `/multi` to enter multi-line mode:

```bash
madace> /multi
Entering multi-line mode. Type '/end' to finish.

multi> agents create
multi> agent.yaml
multi> /end

(command executed with "agents create agent.yaml")
```

### Syntax Highlighting

YAML and JSON input is syntax-highlighted:

```bash
madace> /multi
Entering multi-line mode. Type '/end' to finish.

multi> config set project
multi> {
multi>   "name": "My Project",
multi>   "version": "1.0.0"
multi> }
multi> /end

(JSON is highlighted with colors: keys in cyan, strings in green, numbers in yellow)
```

---

## Session State

REPL tracks session state across commands.

### Selecting an Agent

```bash
madace> select pm
Selected agent: pm (Project Manager)

madace [pm]> show
(shows PM agent details)
```

Notice the prompt changes to `madace [pm]>` showing the selected agent.

### Running a Workflow

```bash
madace> run create-prd
Running workflow: create-prd...
(workflow executes)

Current workflow: create-prd

madace [create-prd]> status
(shows workflow status)
```

Prompt changes to `madace [create-prd]>` showing the current workflow.

### Clearing Session State

```bash
madace [pm]> clear
Screen cleared.

madace> (back to default prompt)
```

---

## Advanced Usage

### Chaining Commands

Execute multiple commands in sequence:

```bash
madace> agents list && project status

(executes both commands)
```

### Using Variables

Reference session variables:

```bash
madace> select pm
Selected agent: pm

madace [pm]> agents show ${selected_agent}
(shows PM agent details using session variable)
```

### Piping Output

Pipe REPL commands to external tools:

```bash
madace> agents list --json | jq '.[] | select(.module == "MAM")'

(filters agents using jq)
```

### Environment Variables

Access environment variables:

```bash
madace> config get ${PROJECT_NAME}
(retrieves value from environment variable)
```

---

## Tips and Tricks

### 1. Use Help for Quick Reference

```bash
madace> help
(shows all available commands)

madace> agents --help
(shows agent command help)
```

### 2. Use --json for Scripting

```bash
madace> agents list --json > agents.json
(saves agents to file)
```

### 3. Use Tab Completion Extensively

Press **Tab** early and often to:
- Autocomplete commands
- Discover available options
- Avoid typos

### 4. Use History for Repetitive Tasks

Recall previous commands with **↑** instead of retyping.

### 5. Use Multi-line for Complex Input

For YAML/JSON configuration, use `/multi` mode with syntax highlighting.

### 6. Keep REPL Running

Leave REPL open while working - it's faster than running individual `madace` commands.

### 7. Use Clear to Reset Screen

```bash
madace> clear
```

### 8. Exit Gracefully

```bash
madace> /exit
Goodbye!
```

Or press **Ctrl+C** twice.

---

## Common Workflows

### Workflow 1: Starting a New Story

```bash
$ npm run madace repl

madace> state show
(check current state)

madace> state transition STORY-123 TODO
✅ Story 'STORY-123' transitioned to TODO!

madace> state transition STORY-123 IN_PROGRESS
✅ Story 'STORY-123' transitioned to IN_PROGRESS!

madace> project status
(verify story is in progress)

madace> /exit
```

### Workflow 2: Inspecting Agents

```bash
$ npm run madace repl

madace> agents list
(see all agents)

madace> agents show pm
(detailed view of PM agent)

madace> select pm
Selected agent: pm

madace [pm]> show
(shows PM details using session state)

madace [pm]> /exit
```

### Workflow 3: Running and Monitoring Workflows

```bash
$ npm run madace repl

madace> workflows list
(see available workflows)

madace> workflows show create-prd
(view workflow details)

madace> workflows run madace/mam/workflows/create-prd.yaml
(run workflow)

madace> workflows status create-prd
(check progress)

madace> workflows resume create-prd
(resume if paused)

madace> /exit
```

### Workflow 4: Configuration Management

```bash
$ npm run madace repl

madace> config list
(see all configuration)

madace> config get modules.mam.enabled
(check specific value)

madace> config set modules.mab.enabled true
✅ Configuration updated!

madace> config validate
✅ Configuration is valid!

madace> /exit
```

---

## Troubleshooting

### Issue: Tab completion not working

**Cause**: inquirer-autocomplete-prompt not installed

**Solution**:
```bash
npm install inquirer-autocomplete-prompt@3.0.1
```

### Issue: Command history not saving

**Cause**: Permission issue with `~/.madace_history`

**Solution**:
```bash
touch ~/.madace_history
chmod 644 ~/.madace_history
```

### Issue: REPL freezes

**Cause**: Long-running command

**Solution**: Press **Ctrl+C** to interrupt

### Issue: Multi-line mode stuck

**Cause**: Forgot to type `/end`

**Solution**:
```bash
multi> /end
(exits multi-line mode)
```

Or press **Ctrl+C** to cancel.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Tab** | Autocomplete command/parameter |
| **↑** (Up arrow) | Previous command in history |
| **↓** (Down arrow) | Next command in history |
| **Ctrl+C** | Interrupt current command / Exit REPL (press twice) |
| **Ctrl+L** | Clear screen (same as `/clear`) |
| **Ctrl+A** | Move cursor to start of line |
| **Ctrl+E** | Move cursor to end of line |
| **Ctrl+U** | Delete from cursor to start |
| **Ctrl+K** | Delete from cursor to end |
| **Ctrl+W** | Delete previous word |

---

## Comparison: REPL vs Standard CLI

| Feature | Standard CLI | REPL |
|---------|-------------|------|
| Prefix | `madace` required | No prefix needed |
| Tab completion | Limited | Full support |
| Command history | Bash history | MADACE history + recent suggestions |
| Multi-line | Not supported | `/multi` mode with syntax highlighting |
| Session state | None | Tracks selected agent, workflow |
| Speed | Slower (new process per command) | Faster (persistent session) |

---

## See Also

- [CLI Reference](./CLI-REFERENCE.md) - Complete command reference
- [Dashboard Guide](./DASHBOARD-GUIDE.md) - Terminal dashboard guide
- [README.md](../README.md) - Project overview

---

**Generated by**: Claude Code (MADACE Documentation Agent)
**Last Updated**: 2025-10-29

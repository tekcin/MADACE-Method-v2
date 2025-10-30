# MADACE Dashboard Guide

**Real-time Terminal Dashboard (TUI) for Project Monitoring**

---

## Table of Contents

- [What is the Dashboard?](#what-is-the-dashboard)
- [Getting Started](#getting-started)
- [Dashboard Layout](#dashboard-layout)
- [Keyboard Navigation](#keyboard-navigation)
- [Drill-down Views](#drill-down-views)
- [Color Indicators](#color-indicators)
- [Real-time Updates](#real-time-updates)
- [Use Cases](#use-cases)
- [Troubleshooting](#troubleshooting)

---

## What is the Dashboard?

The MADACE Dashboard is a real-time terminal user interface (TUI) that provides:

- **Live project status** (refreshes every 5 seconds)
- **4-pane split layout** (agents, workflows, state machine, logs)
- **Keyboard-only navigation** (arrow keys, tab)
- **Drill-down views** (press Enter for details)
- **Color-coded indicators** (Green/Yellow/Red/Gray)

**Benefits**:

- Monitor project health at a glance
- No need to run multiple `madace` commands
- Track agent status and workflow progress
- See state machine validation in real-time
- Review recent logs without leaving terminal

---

## Getting Started

### Launch Dashboard

```bash
npm run madace dashboard
```

### First Time Experience

```
╔═══════════════════════════════════════════════════════════════════╗
║                    MADACE Project Dashboard                       ║
╚═══════════════════════════════════════════════════════════════════╝

┌─ Agents (5) ──────────────────┐  ┌─ Workflows (3) ───────────────┐
│ 🎯 pm          ● ACTIVE        │  │ create-prd     ○ IDLE         │
│ 📊 analyst     ● ACTIVE        │  │ create-stories ○ IDLE         │
│ 🏗️ architect   ● ACTIVE        │  │ assess-scale   ○ IDLE         │
│ 📋 sm          ● ACTIVE        │  │                                │
│ 💻 dev         ● ACTIVE        │  │ Press ENTER for details       │
└────────────────────────────────┘  └────────────────────────────────┘

┌─ State Machine ───────────────┐  ┌─ Logs ─────────────────────────┐
│ BACKLOG:     0                │  │ [10:30:15] INFO: Dashboard     │
│ TODO:        0                │  │            started             │
│ IN PROGRESS: 1                │  │ [10:30:20] INFO: Agents loaded │
│ DONE:        21               │  │ [10:30:20] INFO: Auto-refresh  │
│                               │  │            enabled (5s)        │
│ ✅ State valid (0 errors)     │  │                                │
└────────────────────────────────┘  └────────────────────────────────┘

Keyboard: ← → ↑ ↓ TAB (navigate) | ENTER (details) | R (refresh) | Q (quit)
Last refresh: 2025-10-29 10:30:20
```

### Keyboard Shortcuts Quick Reference

| Key         | Action                          |
| ----------- | ------------------------------- |
| **← → ↑ ↓** | Navigate between panes          |
| **Tab**     | Cycle through panes (clockwise) |
| **Enter**   | Drill down into item details    |
| **Escape**  | Return to main view             |
| **r**       | Manual refresh                  |
| **q**       | Quit dashboard                  |
| **Ctrl+C**  | Force quit                      |

---

## Dashboard Layout

The dashboard consists of **4 panes** arranged in a 2x2 grid:

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│   TOP-LEFT              │   TOP-RIGHT             │
│   Agents                │   Workflows             │
│                         │                         │
├─────────────────────────┼─────────────────────────┤
│                         │                         │
│   BOTTOM-LEFT           │   BOTTOM-RIGHT          │
│   State Machine         │   Logs                  │
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

### Top-Left: Agents Pane

Shows all agents with status indicators.

**Columns**:

- **Icon + Name**: Agent icon and identifier
- **Status**: Current agent status (● ACTIVE, ○ IDLE, ✗ ERROR)

**Example**:

```
┌─ Agents (5) ──────────────────┐
│ 🎯 pm          ● ACTIVE        │
│ 📊 analyst     ● ACTIVE        │
│ 🏗️ architect   ● ACTIVE        │
│ 📋 sm          ○ IDLE          │
│ 💻 dev         ○ IDLE          │
│                                │
│ Press ENTER for agent details │
└────────────────────────────────┘
```

**Status Indicators**:

- **● ACTIVE** (Green) - Agent is running
- **○ IDLE** (Gray) - Agent is available but not running
- **⚠ PENDING** (Yellow) - Agent is queued
- **✗ ERROR** (Red) - Agent encountered an error

### Top-Right: Workflows Pane

Shows all workflows with progress indicators.

**Columns**:

- **Workflow Name**: Workflow identifier
- **Status**: Current workflow status

**Example**:

```
┌─ Workflows (3) ───────────────┐
│ create-prd     ● RUNNING  60% │
│ create-stories ○ IDLE          │
│ assess-scale   ✓ COMPLETED     │
│                                │
│ Press ENTER for workflow info │
└────────────────────────────────┘
```

**Status Indicators**:

- **● RUNNING** (Green) - Workflow is executing
- **○ IDLE** (Gray) - Workflow is available
- **⚠ PAUSED** (Yellow) - Workflow is paused
- **✓ COMPLETED** (Green) - Workflow finished
- **✗ ERROR** (Red) - Workflow failed

### Bottom-Left: State Machine Pane

Shows story counts and validation status.

**Sections**:

- **Story Counts**: By state (BACKLOG, TODO, IN PROGRESS, DONE)
- **Validation**: MADACE rule compliance

**Example**:

```
┌─ State Machine ───────────────┐
│ BACKLOG:     0                │
│ TODO:        0                │
│ IN PROGRESS: 1                │
│ DONE:        21               │
│                               │
│ Total Points:    92           │
│ Completed:       88 (95.7%)   │
│                               │
│ ✅ State valid (0 errors)     │
│                               │
│ Press ENTER for story list    │
└────────────────────────────────┘
```

**Validation States**:

- **✅ State valid** (Green) - All MADACE rules obeyed
- **⚠ Warnings** (Yellow) - Minor issues detected
- **❌ Invalid** (Red) - MADACE rules violated

**MADACE Rules**:

- Only ONE story in TODO at a time
- Only ONE story in IN PROGRESS at a time

### Bottom-Right: Logs Pane

Shows recent log messages (last 20 lines).

**Log Format**: `[HH:MM:SS] LEVEL: Message`

**Example**:

```
┌─ Logs ─────────────────────────┐
│ [10:30:15] INFO: Dashboard     │
│            started             │
│ [10:30:16] INFO: Loading agents│
│ [10:30:17] INFO: 5 agents found│
│ [10:30:18] INFO: Loading       │
│            workflows           │
│ [10:30:19] INFO: 3 workflows   │
│            found               │
│ [10:30:20] INFO: State machine │
│            loaded              │
│ [10:30:20] INFO: Auto-refresh  │
│            enabled (5s)        │
│                                │
│ Scroll: ↑↓  Clear: C           │
└────────────────────────────────┘
```

**Log Levels**:

- **INFO** (White) - Informational messages
- **WARN** (Yellow) - Warning messages
- **ERROR** (Red) - Error messages

---

## Keyboard Navigation

### Basic Navigation

#### Arrow Keys

Move focus between panes:

- **←** (Left): Move to left pane
- **→** (Right): Move to right pane
- **↑** (Up): Move to top pane
- **↓** (Down): Move to bottom pane

**Example**:

```
Start at Agents (top-left)
Press → : Move to Workflows (top-right)
Press ↓ : Move to Logs (bottom-right)
Press ← : Move to State Machine (bottom-left)
Press ↑ : Back to Agents (top-left)
```

#### Tab Key

Cycle through panes clockwise:

```
Agents → Workflows → Logs → State Machine → Agents → ...
```

Press **Shift+Tab** to cycle counter-clockwise.

### Focus Indicator

The focused pane has a **yellow border**:

```
┌─ Agents (5) ──────────────────┐  (yellow border = focused)
│ 🎯 pm          ● ACTIVE        │
└────────────────────────────────┘

┌─ Workflows (3) ───────────────┐  (cyan border = unfocused)
│ create-prd     ○ IDLE          │
└────────────────────────────────┘
```

---

## Drill-down Views

Press **Enter** on a focused pane to view detailed information.

### Agent Details View

Focus on Agents pane and press **Enter**:

```
╔═══════════════════════════════════════════════════════════════════╗
║                         Agent Details: pm                         ║
╚═══════════════════════════════════════════════════════════════════╝

ID:            clxxxxx123
Name:          pm
Title:         Project Manager
Icon:          🎯
Module:        MAM
Version:       1.0.0

Persona:
  Role:        Lead strategic planning and project coordination
  Identity:    Experienced project manager with 10+ years
  Style:       Direct, clear, results-oriented
  Principles:
    - Deliver on time
    - Communicate proactively
    - Manage stakeholder expectations

Memory:
  Short-term:  3 conversations
  Long-term:   15 decisions

Project:       MADACE-Method v3.0

Created:       2025-10-23T10:00:00.000Z
Updated:       2025-10-29T10:30:00.000Z

Press ESC to return | ↑↓ to scroll
```

### Workflow Details View

Focus on Workflows pane and press **Enter**:

```
╔═══════════════════════════════════════════════════════════════════╗
║                    Workflow Details: create-prd                   ║
╚═══════════════════════════════════════════════════════════════════╝

Name:          create-prd
Description:   Create Product Requirements Document
Module:        MAM
Status:        ● RUNNING (Step 3 of 5)
Progress:      60%

Steps:
  ✓ 1. Elicit Requirements       (COMPLETED)
  ✓ 2. Define Scope               (COMPLETED)
  ● 3. Create Epics               (IN PROGRESS)
  ○ 4. Validate PRD               (PENDING)
  ○ 5. Save PRD                   (PENDING)

Variables:
  project_name:    My Project
  output_folder:   docs
  user_name:       John Doe

Started:         2025-10-29T10:25:00.000Z
Updated:         2025-10-29T10:30:00.000Z

Press ESC to return | ↑↓ to scroll
```

### State Machine Details View

Focus on State Machine pane and press **Enter**:

```
╔═══════════════════════════════════════════════════════════════════╗
║                      State Machine Details                        ║
╚═══════════════════════════════════════════════════════════════════╝

IN PROGRESS (1 story):

  [CLI-007] CLI Testing and Documentation
    Points:  4
    Status:  IN PROGRESS
    Started: 2025-10-29
    File:    docs/milestone-3.2-stories.md

DONE (21 stories):

  [CLI-006] Implement Full CLI Feature Parity
    Points:  6
    Status:  DONE
    Completed: 2025-10-29

  [CLI-005] Add Keyboard Navigation to Dashboard
    Points:  5
    Status:  DONE
    Completed: 2025-10-29

  [CLI-004] Build Terminal Dashboard with Blessed
    Points:  8
    Status:  DONE
    Completed: 2025-10-29

  ... (18 more stories)

Press ESC to return | ↑↓ to scroll
```

### Returning to Main View

Press **Escape** to return to the main 4-pane view.

---

## Color Indicators

### Status Colors

| Color      | Meaning                    | Example                |
| ---------- | -------------------------- | ---------------------- |
| **Green**  | Active / Running / Success | ● ACTIVE, ✓ COMPLETED  |
| **Yellow** | Pending / Warning / Paused | ⚠ PENDING, ⚠ PAUSED  |
| **Red**    | Error / Failed / Critical  | ✗ ERROR, ❌ FAILED     |
| **Gray**   | Idle / Inactive / Disabled | ○ IDLE, ○ AVAILABLE    |
| **Cyan**   | Information / Neutral      | Unfocused pane borders |

### Border Colors

| Color      | Meaning                       |
| ---------- | ----------------------------- |
| **Yellow** | Focused pane (keyboard focus) |
| **Cyan**   | Unfocused panes               |

---

## Real-time Updates

### Auto-refresh

Dashboard automatically refreshes **every 5 seconds**.

**What gets updated**:

- Agent status (checks database)
- Workflow progress (checks state files)
- State machine counts (parses workflow-status.md)
- Logs (appends new log entries)

### Manual Refresh

Press **r** to refresh immediately without waiting for the 5-second interval.

```
Press 'r'
│
└─ All panes refresh instantly
   │
   └─ Timestamp updated: "Last refresh: 2025-10-29 10:30:25"
```

### Refresh Indicator

The footer shows the last refresh time:

```
Last refresh: 2025-10-29 10:30:20
```

This updates every 5 seconds or when you press **r**.

---

## Use Cases

### Use Case 1: Monitoring Long-running Workflows

**Scenario**: You started a workflow that takes 10 minutes. You want to monitor progress without repeatedly running `madace workflows status`.

**Solution**: Launch dashboard and watch the Workflows pane update in real-time.

**Steps**:

1. Run workflow: `madace workflows run create-prd.yaml`
2. Launch dashboard: `npm run madace dashboard`
3. Focus on Workflows pane (press Tab)
4. Watch progress update every 5 seconds
5. Press Enter to see detailed step status
6. Press q to quit when done

---

### Use Case 2: Validating State Machine

**Scenario**: You're working on multiple stories and want to ensure you're following MADACE rules (only 1 in TODO, 1 in IN PROGRESS).

**Solution**: Keep dashboard open while transitioning stories.

**Steps**:

1. Launch dashboard: `npm run madace dashboard`
2. Focus on State Machine pane (press Tab twice)
3. Check validation status: ✅ or ❌
4. In another terminal: `madace state transition STORY-123 TODO`
5. Dashboard auto-refreshes and shows updated counts
6. Verify validation remains: ✅

---

### Use Case 3: Debugging Agent Issues

**Scenario**: An agent is failing but you're not sure which one or why.

**Solution**: Use dashboard to identify failing agent and view logs.

**Steps**:

1. Launch dashboard: `npm run madace dashboard`
2. Scan Agents pane for ✗ ERROR indicators
3. Focus on Agents pane and press Enter on failing agent
4. Review error message in agent details
5. Focus on Logs pane (press Tab + arrow keys)
6. Review ERROR logs for more context
7. Press q to quit

---

### Use Case 4: Daily Stand-up Quick Review

**Scenario**: Team lead needs to quickly review project status before stand-up meeting.

**Solution**: Launch dashboard for at-a-glance project health.

**Steps**:

1. Launch dashboard: `npm run madace dashboard`
2. Scan all 4 panes:
   - Agents: All active? (green indicators)
   - Workflows: Any stuck? (yellow/red)
   - State Machine: Valid? (✅)
   - Logs: Any errors? (red ERROR logs)
3. Press Enter on any pane for details if needed
4. Press q to quit

**Result**: 30-second overview of entire project health.

---

## Troubleshooting

### Issue: Dashboard doesn't launch

**Error**: `npm run madace dashboard` shows error

**Possible Causes**:

1. blessed not installed
2. Terminal doesn't support 256 colors
3. Node.js < v20

**Solutions**:

```bash
# 1. Install blessed
npm install blessed@0.1.81 @types/blessed@0.1.25

# 2. Check terminal colors
echo $TERM
# Should be: xterm-256color or similar

# 3. Check Node version
node --version
# Should be: v20.0.0 or higher
```

---

### Issue: Dashboard looks garbled

**Cause**: Terminal size too small

**Solution**: Resize terminal to at least 100x30 characters

```bash
# Check current size
echo $COLUMNS x $LINES

# Minimum recommended: 100 columns x 30 lines
```

---

### Issue: Keyboard navigation not working

**Cause**: Terminal doesn't support key events

**Solution**: Try a different terminal emulator:

- macOS: iTerm2 (recommended), Terminal.app
- Linux: gnome-terminal, konsole, alacritty
- Windows: Windows Terminal, WSL2

---

### Issue: Colors not showing

**Cause**: Terminal doesn't support colors

**Solution**: Set TERM environment variable:

```bash
export TERM=xterm-256color
npm run madace dashboard
```

---

### Issue: Auto-refresh not working

**Cause**: File watchers not supported

**Solution**: Use manual refresh (press **r**) instead of auto-refresh.

---

### Issue: Dashboard freezes

**Cause**: Long-running operation blocking UI

**Solution**: Press **Ctrl+C** to force quit, then restart dashboard.

---

## Advanced Tips

### Tip 1: Keep Dashboard Running

Leave dashboard open in a dedicated terminal while working in another.

**Setup**:

- Terminal 1: `npm run madace dashboard` (monitoring)
- Terminal 2: `npm run madace repl` (commands)

**Benefit**: Real-time feedback on all commands.

---

### Tip 2: Use tmux/screen for Persistent Dashboard

Keep dashboard running even when disconnected.

**With tmux**:

```bash
# Create session
tmux new -s madace-dashboard

# Inside tmux
npm run madace dashboard

# Detach: Ctrl+B, then D
# Reattach: tmux attach -t madace-dashboard
```

---

### Tip 3: Combine with REPL

Use both dashboard and REPL simultaneously:

**Terminal 1** (top half):

```bash
npm run madace dashboard
```

**Terminal 2** (bottom half):

```bash
npm run madace repl
```

**Benefit**: Execute commands in REPL while monitoring real-time updates in dashboard.

---

### Tip 4: Screenshot Dashboard for Reports

Capture dashboard for documentation:

**Using asciinema** (recommended):

```bash
# Install asciinema
brew install asciinema  # macOS
apt install asciinema   # Ubuntu

# Record dashboard
asciinema rec dashboard-demo.cast
npm run madace dashboard
# Press q to quit
# Press Ctrl+D to stop recording

# Play recording
asciinema play dashboard-demo.cast

# Share online
asciinema upload dashboard-demo.cast
```

**Using screenshot tool**:

- macOS: Cmd+Shift+4
- Linux: Flameshot, Spectacle
- Windows: Snipping Tool

---

## See Also

- [CLI Reference](./CLI-REFERENCE.md) - Complete command reference
- [REPL Tutorial](./REPL-TUTORIAL.md) - Interactive REPL guide
- [README.md](../README.md) - Project overview

---

**Generated by**: Claude Code (MADACE Documentation Agent)
**Last Updated**: 2025-10-29

# Using Official MADACE-METHOD to Build MADACE-Method v2.0

**Meta Approach**: Using MADACE to build MADACE (experimental Next.js full-stack version)

This guide shows you how to use the official MADACE-METHOD framework to plan, manage, and implement the MADACE-Method v2.0 experimental project.

> **Note**: This project was originally planned as Rust+Python+Next.js but has been simplified to **Next.js 14 Full-Stack TypeScript**. See [ADR-003](./docs/adrs/ADR-003-architecture-simplification.md) for details.

> **Development Environment**: A development container with VSCode Server and Cursor is available for browser-based development. See [DEVELOPMENT.md](./DEVELOPMENT.md) for setup instructions:
>
> ```bash
> docker-compose -f docker-compose.dev.yml up -d
> # Access VSCode at http://localhost:8080 (password: madace123)
> ```

---

## 🎯 Why This Approach?

**The Paradox**: We have an empty experimental MADACE implementation, but the official MADACE-METHOD is production-ready!

**The Solution**: Use official MADACE-METHOD to:

1. Plan the MADACE-Method v2.0 project (PRD, Epics, Stories)
2. Manage implementation workflow (BACKLOG → TODO → IN PROGRESS → DONE)
3. Guide development with AI agents (PM, Architect, SM, DEV)
4. Validate the experimental architecture through real use

---

## 📦 Setup: Copy MADACE to This Project

Since MADACE-METHOD is already installed at `/Users/nimda/MADACE-METHOD`, we need to copy the framework into this project:

### Option 1: Manual Copy (Recommended for now)

```bash
# Copy the entire MADACE framework to this project
cp -r /Users/nimda/MADACE-METHOD/modules ./madace-modules

# Copy specific agents we need
cp /Users/nimda/MADACE-METHOD/modules/mam/agents/*.agent.yaml ./madace/mam/agents/
cp /Users/nimda/MADACE-METHOD/modules/core/agents/*.agent.yaml ./madace/core/agents/

# Copy workflows
cp -r /Users/nimda/MADACE-METHOD/modules/mam/workflows ./madace/mam/
cp -r /Users/nimda/MADACE-METHOD/modules/mab/workflows ./madace/mab/
cp -r /Users/nimda/MADACE-METHOD/modules/cis/workflows ./madace/cis/
```

### Option 2: Symlink (Alternative)

```bash
# Create symlink to use MADACE-METHOD directly
ln -s /Users/nimda/MADACE-METHOD/modules ./madace-live
```

---

## 🚀 Using MADACE Agents (Manual Process)

Since the CLI is still in development, we'll use the agents manually through Claude Code or your IDE:

### Step 1: Initialize Project Status

**Manual Process** (until CLI is ready):

1. Read the PM agent definition: `/Users/nimda/MADACE-METHOD/modules/mam/agents/pm.agent.yaml`
2. Load the agent persona in your AI assistant
3. Execute the `*init-status` workflow to create `docs/mam-workflow-status.md`

**What it creates**:

```markdown
# MAM Workflow Status

**Current Phase:** Phase 1 - Planning

## BACKLOG

- [CORE-001] Rust Agent Loader
- [CORE-002] Rust Workflow Engine
- [CORE-003] Rust State Machine
  ...

## TODO

(empty)

## IN PROGRESS

(empty)

## DONE

(empty)
```

### Step 2: Run Scale Assessment

**Agent**: PM (Product Manager)
**Workflow**: `*assess-scale`

**Purpose**: Determine if MADACE-Method v2.0 is Level 0, 1, 2, 3, or 4

**Expected Outcome**:

- **Level 2-3** (Medium/Large project)
- Reason: Full-stack web application with agent system, state machine, and workflow engine
- Simplified from original Level 3-4 (multi-tier with FFI)
- Requires: PRD + Epics + Solution Architecture

### Step 3: Plan Project

**Agent**: PM
**Workflow**: `*plan-project`

**What it does**:

1. Guides you through project vision and goals
2. Generates PRD appropriate for scale level
3. Creates Epics breakdown
4. Initializes project structure

**Outputs**:

- `docs/PRD.md` (update existing with MADACE-guided version)
- `docs/Epics.md` (update existing with proper epic breakdown)

### Step 4: Solution Architecture (Level 3-4 only)

**Agent**: Architect
**Workflow**: `*solution-architecture`

**What it does**:

1. Reviews PRD and Epics
2. Guides through architectural decisions
3. Documents key patterns and technologies
4. Creates Architecture Decision Records (ADRs)

**Outputs**:

- `docs/solution-architecture.md`
- `docs/adrs/` (Architecture Decision Records)

### Step 5: Initialize Backlog

**Agent**: SM (Scrum Master)
**Workflow**: `*init-backlog`

**What it does**:

1. Reads `docs/Epics.md`
2. Extracts all stories
3. Populates BACKLOG in `docs/mam-workflow-status.md`

**Before**:

```markdown
## BACKLOG

(empty)
```

**After**:

```markdown
## BACKLOG

- [CORE-001] Agent Loader - YAML parsing
- [CORE-002] Agent Runtime - Execution context
- [CORE-003] Workflow Engine - Step execution
  ...
```

### Step 6: Story Development Loop

**The MADACE Workflow**:

```
1. SM: *create-story (BACKLOG → TODO)
   ↓
2. SM: *story-ready (TODO → IN PROGRESS)
   ↓
3. DEV: *dev-story (implement)
   ↓
4. DEV: *story-approved (IN PROGRESS → DONE)
   ↓
5. Repeat until BACKLOG is empty
```

**Detailed Steps**:

#### 6a. Create Story (SM Agent)

```bash
# Workflow: *create-story
# Reads: First story from BACKLOG
# Creates: docs/story-CORE-001.md
# Updates: Moves story from BACKLOG to TODO
```

**Story File** (`docs/story-CORE-001.md`):

```markdown
# [CORE-001] Agent Loader - YAML Parsing

**Status**: Draft
**Points**: 5
**Epic**: Rust Core Engine

## Description

Implement YAML parsing and validation for agent definition files...

## Acceptance Criteria

- [ ] Load agent YAML from disk
- [ ] Validate against schema
- [ ] Parse metadata, persona, menu
      ...

## Implementation Notes

- Use serde_yaml crate
- Define Agent struct
- Implement error handling
  ...
```

#### 6b. Story Ready (SM Agent)

```bash
# Workflow: *story-ready
# Action: Review and approve story
# Updates: TODO → IN PROGRESS
# Side effect: Next BACKLOG → TODO (automatic)
```

#### 6c. Develop Story (DEV Agent)

```bash
# Workflow: *dev-story
# Provides: Implementation guidance
# Generates: Story context (relevant architecture, patterns)
# Assists: Code implementation
```

**DEV Agent Helps With**:

- Breaking down implementation steps
- Suggesting TypeScript patterns
- Reviewing code quality
- Running tests
- Handling errors

#### 6d. Story Approved (DEV Agent)

```bash
# Workflow: *story-approved
# Validates: All acceptance criteria met
# Updates: IN PROGRESS → DONE
# Records: Completion date and actual points
```

---

## 📋 Current State of MADACE-Method v2.0

### What Exists (To Reference)

- ✅ `docs/PRD.md` - Comprehensive (can be refined with PM agent)
- ✅ `docs/Epics.md` - Basic (should be expanded with PM agent)
- ✅ `PLAN.md` - Detailed roadmap with 100+ stories
- ✅ `ARCHITECTURE.md` - Full technical architecture

### What to Generate with MADACE

1. **MADACE-guided PRD** - Let PM agent refine existing PRD
2. **Proper Epic breakdown** - Use scale-adaptive approach
3. **Story files** - One markdown file per story
4. **Workflow status tracking** - Live BACKLOG → DONE tracking
5. **Tech specs per epic** - Just-In-Time documentation

---

## 🎭 Agent Assignments

### PM (Product Manager)

**File**: `/Users/nimda/MADACE-METHOD/modules/mam/agents/pm.agent.yaml`

**Use for**:

- `*workflow-status` - Check current phase
- `*plan-project` - Generate PRD and Epics
- `*assess-scale` - Determine Level 0-4
- `*detect-type` - Identify project type

### Analyst

**File**: `/Users/nimda/MADACE-METHOD/modules/mam/agents/analyst.agent.yaml`

**Use for**:

- Requirements discovery
- Research tasks
- User needs analysis

### Architect

**File**: `/Users/nimda/MADACE-METHOD/modules/mam/agents/architect.agent.yaml`

**Use for**:

- `*solution-architecture` - Overall system design
- `*jit-tech-spec` - Per-epic technical specs
- Architecture Decision Records (ADRs)

### SM (Scrum Master)

**File**: `/Users/nimda/MADACE-METHOD/modules/mam/agents/sm.agent.yaml`

**Use for**:

- `*init-backlog` - Populate from Epics
- `*create-story` - Draft story from TODO
- `*story-ready` - Approve story (TODO → IN PROGRESS)
- `*story-context` - Generate implementation context

### DEV (Developer)

**File**: `/Users/nimda/MADACE-METHOD/modules/mam/agents/dev.agent.yaml`

**Use for**:

- `*dev-story` - Implementation guidance
- `*story-approved` - Mark complete (IN PROGRESS → DONE)
- Code reviews
- Testing guidance

---

## 🛠️ Practical Example: First Story

Let's walk through implementing **[CORE-001] TypeScript Agent Loader** using MADACE:

### 1. Load PM Agent and Check Status

```
You: Load PM agent from /Users/nimda/MADACE-METHOD/modules/mam/agents/pm.agent.yaml
PM: *workflow-status
Result: Current Phase: Phase 1 - Planning
        BACKLOG has 0 stories (need to initialize)
```

### 2. Initialize from Existing Plan

```
You: Load SM agent
SM: *init-backlog
Action: Read docs/PLAN.md, extract all stories (updated for Next.js architecture)
Result: BACKLOG now has 30+ stories (simplified from 100+)
```

### 3. Create First Story

```
SM: *create-story
Action: Read first story from BACKLOG: [CORE-001] TypeScript Agent Loader
Output: docs/story-CORE-001.md created
Status: BACKLOG → TODO
```

### 4. Review and Approve

```
SM: *story-ready
Action: Review story-CORE-001.md
Output: Story looks good, moving forward
Status: TODO → IN PROGRESS
Side Effect: [CORE-002] automatically moves BACKLOG → TODO
```

### 5. Implement with DEV Agent

```
You: Load DEV agent
DEV: *dev-story
DEV: Let me help implement the Agent Loader...

1. First, let's create the Agent type in lib/agents/loader.ts
2. Use Zod for schema validation
3. Use js-yaml for YAML parsing
4. Implement error handling with Result pattern

[DEV provides code snippets and guidance]
```

### 6. Complete Story

```
DEV: *story-approved
Action: Review implementation against acceptance criteria
Result: All criteria met ✓
Status: IN PROGRESS → DONE
Date: 2025-10-19
Points: 5
```

---

## 📊 Tracking Progress

### Workflow Status File

**Location**: `docs/mam-workflow-status.md`

**Structure**:

```markdown
# MAM Workflow Status

**Current Phase:** Phase 4 - Implementation
**Last Updated:** 2025-10-19

---

## BACKLOG (45 stories)

- [CORE-003] Workflow Engine
- [CORE-004] State Machine
  ...

## TODO (1 story)

- [CORE-002] Agent Runtime

## IN PROGRESS (1 story)

- [CORE-001] Agent Loader [Status: Ready] [Started: 2025-10-19]

## DONE (0 stories)

(empty)
```

### Progress Metrics

- **Total Stories**: 50
- **Completed**: 0
- **In Progress**: 1
- **Ready for Dev**: 1
- **Backlog**: 48
- **Velocity**: TBD (after first sprint)

---

## 🎯 Recommended Workflow

### Week 1: Planning Phase

1. ✅ Load PM agent
2. ✅ Run `*assess-scale` → Expect Level 3-4
3. ✅ Run `*plan-project` → Refine PRD and Epics
4. ✅ Load Architect agent
5. ✅ Run `*solution-architecture` → Validate architecture

### Week 2-3: Setup & First Epic

1. ✅ Load SM agent
2. ✅ Run `*init-backlog` → Populate from Epics
3. ✅ Run `*create-story` → Draft CORE-001
4. ✅ Run `*story-ready` → Move to IN PROGRESS
5. ✅ Load DEV agent
6. ✅ Run `*dev-story` → Implement CORE-001
7. ✅ Run `*story-approved` → Complete CORE-001
8. 🔁 Repeat for CORE-002, CORE-003, etc.

### Ongoing: Story Development Loop

```
For each story:
  SM: create-story
  SM: story-ready
  DEV: dev-story (with Architect guidance for complex stories)
  DEV: story-approved
  Repeat
```

---

## 💡 Pro Tips

### 1. Use Story Context for Complex Stories

```
SM: *story-context
Purpose: Generate targeted implementation guidance
Includes:
  - Relevant architecture sections
  - Related completed stories
  - Technical patterns to use
  - Dependencies and gotchas
```

### 2. Just-In-Time Tech Specs

```
Architect: *jit-tech-spec
When: Before starting a new epic
Creates: Detailed technical specification for that epic only
Benefit: Specs stay current, reflect learnings
```

### 3. Regular Retrospectives

```
SM: *retrospective
When: After completing each epic
Captures:
  - What went well
  - What to improve
  - Architectural learnings
  - Process adjustments
```

### 4. Combine Agents for Complex Tasks

```
Example: Implementing LLM client abstraction

1. Architect: Review multi-provider LLM strategy
2. SM: Create story with Architect input
3. DEV: Implement with Architect available for questions
4. DEV: Code review with Architect validation
```

---

## 🔄 State Machine Rules (Enforced by MADACE)

### Critical Rules

1. **Only ONE story in TODO at a time**
2. **Only ONE story in IN PROGRESS at a time**
3. **Single source of truth**: `mam-workflow-status.md`
4. **No searching**: Always read exact story from status file
5. **Atomic transitions**: Cannot skip states

### Valid Transitions

```
BACKLOG → TODO (via create-story)
TODO → IN PROGRESS (via story-ready)
  └─ Automatically: Next BACKLOG → TODO
IN PROGRESS → DONE (via story-approved)
```

### Invalid Transitions

```
❌ BACKLOG → IN PROGRESS (must go through TODO)
❌ TODO → DONE (must go through IN PROGRESS)
❌ Multiple stories in TODO
❌ Multiple stories in IN PROGRESS
```

---

## 📚 Reference Files

### MADACE-METHOD Agent Files

```
PM:        /Users/nimda/MADACE-METHOD/modules/mam/agents/pm.agent.yaml
Analyst:   /Users/nimda/MADACE-METHOD/modules/mam/agents/analyst.agent.yaml
Architect: /Users/nimda/MADACE-METHOD/modules/mam/agents/architect.agent.yaml
SM:        /Users/nimda/MADACE-METHOD/modules/mam/agents/sm.agent.yaml
DEV:       /Users/nimda/MADACE-METHOD/modules/mam/agents/dev.agent.yaml
```

### MADACE-METHOD Workflow Files

```
Workflows: /Users/nimda/MADACE-METHOD/modules/mam/workflows/
Key workflows:
  - plan-project/
  - init-backlog/
  - create-story/
  - dev-story/
  - story-approved/
  - solution-architecture/
  - jit-tech-spec/
```

### This Project Files

```
Status:  docs/mam-workflow-status.md
PRD:     docs/PRD.md
Epics:   docs/Epics.md
Stories: docs/story-*.md
Plan:    PLAN.md (reference for story list)
```

---

## 🚀 Next Steps

1. **Initialize Status File**
   - Manually create `docs/mam-workflow-status.md` with template
   - Or use SM agent to generate it

2. **Populate Backlog**
   - Extract stories from `PLAN.md`
   - Add to BACKLOG section in status file

3. **Start First Story**
   - Load SM agent
   - Run create-story workflow
   - Begin implementation with DEV agent

4. **Track Progress**
   - Update status file after each state transition
   - Record completion dates and points
   - Monitor velocity

---

## 📝 Summary

**What We're Doing**: Using production-ready MADACE-METHOD to build experimental MADACE-Method v2.0

**Benefits**:

- ✅ Validated workflow system
- ✅ AI agent guidance at each step
- ✅ Proper planning and tracking
- ✅ Scale-adaptive documentation
- ✅ Real-world testing of MADACE concepts

**The Meta Win**: If MADACE can successfully build itself in a different tech stack, that proves the methodology is truly universal!

---

**Ready to start?** Load the PM agent and run `*workflow-status` to begin!

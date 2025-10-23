# BMAD-METHOD Integration Guide

**Status**: ✅ Complete - 30 BMAD Agents Imported (10 v4 + 20 v6-Alpha)

This document describes the integration of BMAD-METHOD agents into MADACE-Method v2.0.

---

## Overview

[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) (BMad Core - Collaboration Optimized Reflection Engine) is a universal AI agent framework that provides specialized agents for software development and beyond. We've successfully integrated agents from both BMAD v4 (main branch) and v6-alpha branches into MADACE.

### BMAD Versions

**BMAD v4** (Main Branch):

- 10 core agents
- Markdown + YAML format
- Stable production release
- Module: `bmad`

**BMAD v6-Alpha** (Alpha Branch):

- 20 production agents across 5 modules
- Pure YAML format
- Complete ground-up rewrite
- Advanced features: critical_actions, sidecar files, scale-adaptive workflows
- Modules: `bmad-v6-core`, `bmad-v6-bmm`, `bmad-v6-bmb`, `bmad-v6-cis`, `bmad-v6-bmd`

### What is BMAD-METHOD?

BMAD-METHOD provides:

- **Agentic Planning**: Dedicated agents (Analyst, PM, Architect) collaborate to create detailed PRDs and Architecture documents
- **Context-Engineered Development**: Scrum Master agent transforms plans into hyper-detailed development stories
- **Universal Framework**: Works in any domain (software, creative writing, business strategy, education, wellness)

---

## Imported Agents

### ✅ BMAD v4 Agents (10/10)

| Icon | Agent ID            | Title                            | Module | When to Use                                                                                    |
| ---- | ------------------- | -------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| 📊   | `analyst`           | Business Analyst                 | bmad   | Market research, brainstorming, competitive analysis, project briefs, brownfield documentation |
| 🏗️   | `architect`         | Architect                        | bmad   | System architecture, technical design, API specifications, data modeling, deployment planning  |
| 🧙   | `bmad-master`       | BMad Master Task Executor        | bmad   | Executing specific tasks from the BMAD workflow system                                         |
| 🎭   | `bmad-orchestrator` | BMad Master Orchestrator         | bmad   | Workflow coordination, multi-agent tasks, role switching guidance                              |
| 💻   | `dev`               | Full Stack Developer             | bmad   | Feature implementation, bug fixes, code reviews, technical debt reduction                      |
| 📋   | `pm`                | Product Manager                  | bmad   | PRDs, product strategy, feature prioritization, roadmap planning, stakeholder communication    |
| 📝   | `po`                | Product Owner                    | bmad   | User story refinement, backlog management, acceptance criteria, sprint planning                |
| 🧪   | `qa`                | Test Architect & Quality Advisor | bmad   | Test strategies, test automation, quality gates, acceptance testing                            |
| 🏃   | `sm`                | Scrum Master                     | bmad   | Story decomposition, sprint facilitation, team coordination, removing blockers                 |
| 🎨   | `ux-expert`         | UX Expert                        | bmad   | UX research, wireframes, prototyping, user flows, design systems                               |

### ✅ BMAD v6-Alpha Agents (20/20)

**Core Module** (`bmad-v6-core`):
| Icon | Agent ID | Title | When to Use |
| ---- | ------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| 🧙 | `bmad-master` | BMad Master Executor, Knowledge Custodian, and Workflow Orchestrator | Workflow coordination, task execution, orchestration |

**BMM Module** (`bmad-v6-bmm`) - BMad Method for Software Development:
| Icon | Agent ID | Title | When to Use |
| ---- | ----------------- | -------------------- | ------------------------------------------------------- |
| 📊 | `analyst` | Business Analyst | Market research, project briefs, requirement gathering |
| 🏗️ | `architect` | Architect | System architecture, technical design, API specs |
| 💻 | `dev-impl` | Developer Agent | Feature implementation, coding, technical work |
| 🏛️ | `game-architect` | Game Architect | Game system architecture, technical game design |
| 🎲 | `game-designer` | Game Designer | Game concept, mechanics, GDD creation |
| 🕹️ | `game-dev` | Game Developer | Game feature implementation, game-specific coding |
| 📋 | `pm` | Product Manager | PRDs, product strategy, feature planning |
| 🏃 | `sm` | Scrum Master | Story creation, sprint management, workflow guidance |
| 🧪 | `tea` | Master Test Architect| Test strategies, quality assurance, test automation |
| 🎨 | `ux-expert` | UX Expert | UX research, wireframes, user flows, design systems |

**BMB Module** (`bmad-v6-bmb`) - BMad Builder for Creating Custom Agents:
| Icon | Agent ID | Title | When to Use |
| ---- | --------------- | ------------ | -------------------------------------------------------- |
| 🧙 | `bmad-builder` | BMad Builder | Creating custom agents, workflows, and modules |

**CIS Module** (`bmad-v6-cis`) - Creative Intelligence Suite:
| Icon | Agent ID | Title | When to Use |
| ---- | -------------------------- | -------------------------------- | ---------------------------------------------- |
| 🧠 | `brainstorming-coach` | Elite Brainstorming Specialist | Brainstorming sessions, idea generation |
| 🔬 | `creative-problem-solver` | Master Problem Solver | Creative problem-solving, innovative solutions |
| 🎨 | `design-thinking-coach` | Design Thinking Maestro | Design thinking workshops, user-centered design|
| ⚡ | `innovation-strategist` | Disruptive Innovation Oracle | Innovation strategy, breakthrough thinking |
| 📖 | `storyteller` | Master Storyteller | Narrative creation, storytelling, communication|

**BMD Module** (`bmad-v6-bmd`) - BMad Development (Internal BMAD Tools):
| Icon | Agent ID | Title | When to Use |
| ---- | ---------------- | ------------------------------- | ---------------------------------------------- |
| 🔧 | `cli-chief` | Chief CLI Tooling Officer | CLI tools, installer systems, build tooling |
| 📚 | `doc-keeper` | Chief Documentation Keeper | Documentation maintenance, technical writing |
| 🚀 | `release-chief` | Chief Release Officer | Release management, version control, deployment|

---

## Integration Architecture

### Conversion Process

BMAD agents come in two formats depending on version. We convert both to MADACE's unified database format:

#### BMAD v4 Format (Markdown + YAML)

BMAD v4 agents are stored in Markdown files with embedded YAML blocks:

**BMAD v4 Format** (Markdown + YAML):

````markdown
# agent-name

```yaml
agent:
  name: John
  id: pm
  title: Product Manager
  icon: 📋
persona:
  role: Investigative Product Strategist
  style: Analytical, inquisitive, data-driven
  identity: Product Manager specialized in document creation
  focus: Creating PRDs and other product documentation
  core_principles:
    - Deeply understand "Why"
    - Champion the user
commands:
  - help: Show command list
  - create-prd: Create PRD document
dependencies:
  tasks:
    - create-doc.md
  templates:
    - prd-tmpl.yaml
```
````

#### BMAD v6-Alpha Format (Pure YAML)

BMAD v6-alpha agents use a pure YAML format with new advanced features:

**BMAD v6-Alpha Format** (Pure YAML):

```yaml
agent:
  metadata:
    id: bmad/bmm/agents/pm.md
    name: John
    title: Product Manager
    icon: 📋
    module: bmm

  persona:
    role: Investigative Product Strategist + Market-Savvy PM
    identity: Product management veteran with 8+ years experience...
    communication_style: Direct and analytical with stakeholders...
    principles:
      - I operate with an investigative mindset...
      - My decision-making blends data-driven insights...

  critical_actions:
    - Load COMPLETE file {project-root}/bmad/bmm/sidecar/pm-instructions.md
    - Load COMPLETE file {project-root}/bmad/bmm/sidecar/pm-memories.md

  menu:
    - trigger: prd
      workflow: '{project-root}/bmad/bmm/workflows/2-plan-workflows/prd/workflow.yaml'
      description: Create Product Requirements Document (PRD)

    - trigger: validate
      exec: '{project-root}/bmad/core/tasks/validate-workflow.xml'
      description: Validate any document against its workflow checklist
```

#### Unified MADACE Format (Prisma Database)

Both v4 and v6-alpha agents are converted to a unified database format:

**MADACE Format** (Prisma Database):

```typescript
{
  name: "pm",
  title: "Product Manager",
  icon: "📋",
  module: "bmad",  // BMAD module
  version: "1.0.0",
  persona: {
    role: "Investigative Product Strategist",
    identity: "Product Manager specialized in document creation",
    communication_style: "Analytical, inquisitive, data-driven",
    principles: ["Deeply understand 'Why'", "Champion the user"],
    focus: "Creating PRDs and other product documentation"
  },
  menu: [
    { label: "Help", value: "help", description: "Show command list" },
    { label: "Create-prd", value: "create-prd", description: "Create PRD document" }
  ],
  prompts: [
    { name: "system", content: "You are John, a Product Manager..." },
    { name: "bmad-metadata", content: "{\"dependencies\": {...}}" }
  ]
}
```

### Database Storage

All BMAD agents are stored in the `Agent` table with module-based filtering:

**BMAD v4 Agents**:

- `module = "bmad"` for easy filtering
- All 10 agents from main branch

**BMAD v6-Alpha Agents**:

- `module = "bmad-v6-core"` (1 agent)
- `module = "bmad-v6-bmm"` (10 agents)
- `module = "bmad-v6-bmb"` (1 agent)
- `module = "bmad-v6-cis"` (5 agents)
- `module = "bmad-v6-bmd"` (3 agents)

**Common Fields**:

- `persona` as JSON containing role, identity, style, principles
- `menu` as JSON array of command/trigger options
- `prompts` as JSON array including version-specific metadata

---

## Using BMAD Agents in MADACE

### Via Web UI

1. **Browse Agents**: Navigate to http://localhost:3000/agents
2. **Filter by Module**: Select "BMAD" from the module filter dropdown
3. **View Agent**: Click on any BMAD agent to see details
4. **Agent Commands**: Each agent's menu shows available commands with descriptions

### Via API

**List all BMAD agents:**

```bash
curl http://localhost:3000/api/v3/agents?module=bmad
```

**Get specific agent:**

```bash
curl http://localhost:3000/api/v3/agents/pm
```

**Search agents:**

```bash
curl http://localhost:3000/api/v3/agents/search?q=product
```

---

## BMAD Workflow in MADACE

### Planning Phase

1. **Ideation** → Use **Analyst** (📊) for brainstorming, market research, project briefs
2. **Requirements** → Use **PM** (📋) to create detailed PRD documents
3. **Architecture** → Use **Architect** (🏗️) for system design and technical specs
4. **UX Design** → Use **UX Expert** (🎨) for wireframes and user flows

### Development Phase

5. **Story Creation** → Use **PO** (📝) or **SM** (🏃) to decompose work into stories
6. **Implementation** → Use **Dev** (💻) for coding and technical implementation
7. **Quality Assurance** → Use **QA** (🧪) for testing strategies and quality gates

### Orchestration

8. **Workflow Coordination** → Use **BMad Orchestrator** (🎭) to coordinate multiple agents
9. **Task Execution** → Use **BMad Master** (🧙) for specific workflow tasks

---

## Re-Importing or Updating Agents

### BMAD v4 (Main Branch)

To re-import BMAD v4 agents:

```bash
# Clone or update BMAD-METHOD v4
cd /tmp
git clone https://github.com/bmad-code-org/BMAD-METHOD.git

# Run v4 import script
cd /Users/nimda/MADACE-Method-v2.0
npm run import-bmad /tmp/BMAD-METHOD
```

### BMAD v6-Alpha

To import or update BMAD v6-alpha agents:

```bash
# Clone v6-alpha branch
cd /tmp
git clone --branch v6-alpha https://github.com/bmad-code-org/BMAD-METHOD.git BMAD-METHOD-v6

# Or update existing clone
cd /tmp/BMAD-METHOD-v6
git pull origin v6-alpha

# Run v6-alpha import script
cd /Users/nimda/MADACE-Method-v2.0
npm run import-bmad-v6 /tmp/BMAD-METHOD-v6
```

### Import Behavior

Both importers will:

- ✅ Update existing agents with new data
- ✅ Add any new agents
- ✅ Preserve agent IDs and database relationships
- ✅ Handle version-specific metadata correctly

---

## Implementation Details

### Import Scripts

#### BMAD v4 Importer

**Location**: `scripts/import-bmad-agents.ts`

**Features:**

- Extracts YAML from Markdown files
- Converts BMAD v4 structure to MADACE format
- Handles both array and object command formats
- Stores BMAD-specific metadata in prompts
- Updates existing agents or creates new ones

**Running:**

```bash
npm run import-bmad [path-to-BMAD-METHOD]
```

#### BMAD v6-Alpha Importer

**Location**: `scripts/import-bmad-v6-agents.ts`

**Features:**

- Parses pure YAML format (no Markdown extraction)
- Handles v6-alpha structure: metadata, critical_actions, menu triggers
- Converts workflow/exec paths to MADACE menu format
- Stores v6-specific metadata (critical_actions, module, type)
- Module-aware naming: `bmad-v6-{module}`
- Organizes agents by module (core, bmm, bmb, cis, bmd)

**Running:**

```bash
npm run import-bmad-v6 [path-to-BMAD-METHOD-v6]
```

### Database Schema

BMAD agents use the existing `Agent` model:

```prisma
model Agent {
  id          String   @id @default(cuid())
  name        String   @unique
  title       String
  icon        String
  module      String   // "bmad" for BMAD agents
  version     String
  persona     Json     // Role, identity, style, principles, focus
  menu        Json     // Array of commands
  prompts     Json     // System prompt + BMAD metadata
  createdBy   String?  // "bmad-importer"
  // ... other fields
}
```

---

## Future Enhancements

### Planned Features

- [ ] **BMAD Workflows**: Import BMAD workflow definitions
- [ ] **BMAD Templates**: Import document templates (PRD, Architecture, etc.)
- [ ] **BMAD Tasks**: Import task definitions for agent execution
- [ ] **BMAD Checklists**: Import quality gates and checklists
- [ ] **Agent Commands**: Make commands executable in MADACE UI
- [ ] **Multi-Agent Orchestration**: Enable agent-to-agent communication
- [ ] **BMAD Expansion Packs**: Support game dev, DevOps, infrastructure packs

### Compatibility

BMAD agents are fully compatible with MADACE's:

- ✅ Agent memory system
- ✅ LLM client (Gemini, Claude, OpenAI, Local)
- ✅ Workflow engine (once agent commands are executable)
- ✅ State machine integration
- ✅ Web UI and REST API

---

## Troubleshooting

### Import Errors

**Error**: `commands is not iterable`

- **Cause**: BMAD agent uses object format for commands (e.g., bmad-orchestrator)
- **Fix**: Import script handles both array and object formats automatically

**Error**: `No YAML block found`

- **Cause**: Agent file doesn't contain YAML block
- **Fix**: Ensure agent files have ````yaml` blocks

### Database Issues

**Duplicate agents**:

```bash
# Remove all BMAD agents
npx prisma studio  # Delete agents with module="bmad"

# Re-import
npm run import-bmad /tmp/BMAD-METHOD
```

---

## References

- **BMAD-METHOD GitHub**: https://github.com/bmad-code-org/BMAD-METHOD
- **BMAD Documentation**: https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/user-guide.md
- **BMAD Discord**: https://discord.gg/gk8jAdXWmj
- **MADACE v3 Architecture**: [ARCHITECTURE-V3.md](../ARCHITECTURE-V3.md)
- **MADACE Agent System**: [ARCHITECTURE-V3-COMPONENTS.md](../ARCHITECTURE-V3-COMPONENTS.md)

---

## License

BMAD-METHOD™ is a trademark of BMad Code, LLC (MIT License).
MADACE-Method v2.0 is licensed under MIT License.

Integration code is part of MADACE-Method v2.0 and follows the MIT License.

---

**Last Updated**: 2025-10-23
**Import Status**:

- ✅ BMAD v4: 10/10 agents successfully imported
- ✅ BMAD v6-Alpha: 20/20 agents successfully imported
- ✅ Total: 30 BMAD agents in database

**MADACE Version**: v2.0.0-alpha
**BMAD Versions**:

- v4 (main branch) - 10 agents
- v6-alpha (alpha branch) - 20 agents across 5 modules

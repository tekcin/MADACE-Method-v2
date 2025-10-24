# MADACE-METHOD Integration Guide

**Status**: ✅ Complete - 30 MADACE Agents Imported (10 v4 + 20 v6-Alpha)

This document describes the integration of MADACE-METHOD agents into MADACE-Method v2.0.

---

## Overview

[MADACE-METHOD](https://github.com/bmad-code-org/MADACE-METHOD) (BMad Core - Collaboration Optimized Reflection Engine) is a universal AI agent framework that provides specialized agents for software development and beyond. We've successfully integrated agents from both MADACE v4 (main branch) and v6-alpha branches into MADACE.

### MADACE Versions

**MADACE v4** (Main Branch):

- 10 core agents
- Markdown + YAML format
- Stable production release
- Module: `madace`

**MADACE v6-Alpha** (Alpha Branch):

- 20 production agents across 5 modules
- Pure YAML format
- Complete ground-up rewrite
- Advanced features: critical_actions, sidecar files, scale-adaptive workflows
- Modules: `madace-v3-core`, `madace-v3-bmm`, `madace-v3-bmb`, `madace-v3-cis`, `madace-v3-bmd`

### What is MADACE-METHOD?

MADACE-METHOD provides:

- **Agentic Planning**: Dedicated agents (Analyst, PM, Architect) collaborate to create detailed PRDs and Architecture documents
- **Context-Engineered Development**: Scrum Master agent transforms plans into hyper-detailed development stories
- **Universal Framework**: Works in any domain (software, creative writing, business strategy, education, wellness)

---

## Imported Agents

### ✅ MADACE v4 Agents (10/10)

| Icon | Agent ID            | Title                            | Module  | When to Use                                                                                    |
| ---- | ------------------- | -------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| 📊   | `analyst`           | Business Analyst                 | madace  | Market research, brainstorming, competitive analysis, project briefs, brownfield documentation |
| 🏗️   | `architect`         | Architect                        | madace  | System architecture, technical design, API specifications, data modeling, deployment planning  |
| 🧙   | `madace-master`       | MADACE Master Task Executor      | madace  | Executing specific tasks from the MADACE workflow system                                       |
| 🎭   | `madace-orchestrator` | MADACE Master Orchestrator       | madace  | Workflow coordination, multi-agent tasks, role switching guidance                              |
| 💻   | `dev`               | Full Stack Developer             | madace  | Feature implementation, bug fixes, code reviews, technical debt reduction                      |
| 📋   | `pm`                | Product Manager                  | madace  | PRDs, product strategy, feature prioritization, roadmap planning, stakeholder communication    |
| 📝   | `po`                | Product Owner                    | madace  | User story refinement, backlog management, acceptance criteria, sprint planning                |
| 🧪   | `qa`                | Test Architect & Quality Advisor | madace  | Test strategies, test automation, quality gates, acceptance testing                            |
| 🏃   | `sm`                | Scrum Master                     | madace  | Story decomposition, sprint facilitation, team coordination, removing blockers                 |
| 🎨   | `ux-expert`         | UX Expert                        | madace  | UX research, wireframes, prototyping, user flows, design systems                               |

### ✅ MADACE v6-Alpha Agents (20/20)

**Core Module** (`madace-v3-core`):
| Icon | Agent ID | Title | When to Use |
| ---- | ------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| 🧙 | `madace-master` | MADACE Master Executor, Knowledge Custodian, and Workflow Orchestrator | Workflow coordination, task execution, orchestration |

**BMM Module** (`madace-v3-bmm`) - MADACE Method for Software Development:
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

**BMB Module** (`madace-v3-bmb`) - MADACE Builder for Creating Custom Agents:
| Icon | Agent ID | Title | When to Use |
| ---- | --------------- | -------------- | -------------------------------------------------------- |
| 🧙 | `madace-builder` | MADACE Builder | Creating custom agents, workflows, and modules |

**CIS Module** (`madace-v3-cis`) - Creative Intelligence Suite:
| Icon | Agent ID | Title | When to Use |
| ---- | -------------------------- | -------------------------------- | ---------------------------------------------- |
| 🧠 | `brainstorming-coach` | Elite Brainstorming Specialist | Brainstorming sessions, idea generation |
| 🔬 | `creative-problem-solver` | Master Problem Solver | Creative problem-solving, innovative solutions |
| 🎨 | `design-thinking-coach` | Design Thinking Maestro | Design thinking workshops, user-centered design|
| ⚡ | `innovation-strategist` | Disruptive Innovation Oracle | Innovation strategy, breakthrough thinking |
| 📖 | `storyteller` | Master Storyteller | Narrative creation, storytelling, communication|

**BMD Module** (`madace-v3-bmd`) - MADACE Development (Internal MADACE Tools):
| Icon | Agent ID | Title | When to Use |
| ---- | ---------------- | ------------------------------- | ---------------------------------------------- |
| 🔧 | `cli-chief` | Chief CLI Tooling Officer | CLI tools, installer systems, build tooling |
| 📚 | `doc-keeper` | Chief Documentation Keeper | Documentation maintenance, technical writing |
| 🚀 | `release-chief` | Chief Release Officer | Release management, version control, deployment|

---

## Integration Architecture

### Conversion Process

MADACE agents come in two formats depending on version. We convert both to MADACE's unified database format:

#### MADACE v4 Format (Markdown + YAML)

MADACE v4 agents are stored in Markdown files with embedded YAML blocks:

**MADACE v4 Format** (Markdown + YAML):

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

#### MADACE v6-Alpha Format (Pure YAML)

MADACE v6-alpha agents use a pure YAML format with new advanced features:

**MADACE v6-Alpha Format** (Pure YAML):

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
  module: "madace",  // MADACE module
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
    { name: "madace-metadata", content: "{\"dependencies\": {...}}" }
  ]
}
```

### Database Storage

All MADACE agents are stored in the `Agent` table with module-based filtering:

**MADACE v4 Agents**:

- `module = "madace"` for easy filtering
- All 10 agents from main branch

**MADACE v6-Alpha Agents**:

- `module = "madace-v3-core"` (1 agent)
- `module = "madace-v3-bmm"` (10 agents)
- `module = "madace-v3-bmb"` (1 agent)
- `module = "madace-v3-cis"` (5 agents)
- `module = "madace-v3-bmd"` (3 agents)

**Common Fields**:

- `persona` as JSON containing role, identity, style, principles
- `menu` as JSON array of command/trigger options
- `prompts` as JSON array including version-specific metadata

---

## Using MADACE Agents in MADACE

### Via Web UI

1. **Browse Agents**: Navigate to http://localhost:3000/agents
2. **Filter by Module**: Select "MADACE" from the module filter dropdown
3. **View Agent**: Click on any MADACE agent to see details
4. **Agent Commands**: Each agent's menu shows available commands with descriptions

### Via API

**List all MADACE agents:**

```bash
curl http://localhost:3000/api/v3/agents?module=madace
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

## MADACE Workflow in MADACE

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

8. **Workflow Coordination** → Use **MADACE Orchestrator** (🎭) to coordinate multiple agents
9. **Task Execution** → Use **MADACE Master** (🧙) for specific workflow tasks

---

## Re-Importing or Updating Agents

### MADACE v4 (Main Branch)

To re-import MADACE v4 agents:

```bash
# Clone or update MADACE-METHOD v4
cd /tmp
git clone https://github.com/bmad-code-org/MADACE-METHOD.git

# Run v4 import script
cd /Users/nimda/MADACE-Method-v2.0
npm run import-madace /tmp/MADACE-METHOD
```

### MADACE v6-Alpha

To import or update MADACE v6-alpha agents:

```bash
# Clone v6-alpha branch
cd /tmp
git clone --branch v6-alpha https://github.com/bmad-code-org/MADACE-METHOD.git MADACE-METHOD-v3

# Or update existing clone
cd /tmp/MADACE-METHOD-v3
git pull origin v6-alpha

# Run v6-alpha import script
cd /Users/nimda/MADACE-Method-v2.0
npm run import-madace-v3 /tmp/MADACE-METHOD-v3
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

#### MADACE v4 Importer

**Location**: `scripts/import-madace-agents.ts`

**Features:**

- Extracts YAML from Markdown files
- Converts MADACE v4 structure to MADACE format
- Handles both array and object command formats
- Stores MADACE-specific metadata in prompts
- Updates existing agents or creates new ones

**Running:**

```bash
npm run import-madace [path-to-MADACE-METHOD]
```

#### MADACE v6-Alpha Importer

**Location**: `scripts/import-madace-v3-agents.ts`

**Features:**

- Parses pure YAML format (no Markdown extraction)
- Handles v6-alpha structure: metadata, critical_actions, menu triggers
- Converts workflow/exec paths to MADACE menu format
- Stores v6-specific metadata (critical_actions, module, type)
- Module-aware naming: `madace-v3-{module}`
- Organizes agents by module (core, bmm, bmb, cis, bmd)

**Running:**

```bash
npm run import-madace-v3 [path-to-MADACE-METHOD-v3]
```

### Database Schema

MADACE agents use the existing `Agent` model:

```prisma
model Agent {
  id          String   @id @default(cuid())
  name        String   @unique
  title       String
  icon        String
  module      String   // "madace" for MADACE agents
  version     String
  persona     Json     // Role, identity, style, principles, focus
  menu        Json     // Array of commands
  prompts     Json     // System prompt + MADACE metadata
  createdBy   String?  // "madace-importer"
  // ... other fields
}
```

---

## Future Enhancements

### Planned Features

- [ ] **MADACE Workflows**: Import MADACE workflow definitions
- [ ] **MADACE Templates**: Import document templates (PRD, Architecture, etc.)
- [ ] **MADACE Tasks**: Import task definitions for agent execution
- [ ] **MADACE Checklists**: Import quality gates and checklists
- [ ] **Agent Commands**: Make commands executable in MADACE UI
- [ ] **Multi-Agent Orchestration**: Enable agent-to-agent communication
- [ ] **MADACE Expansion Packs**: Support game dev, DevOps, infrastructure packs

### Compatibility

MADACE agents are fully compatible with MADACE's:

- ✅ Agent memory system
- ✅ LLM client (Gemini, Claude, OpenAI, Local)
- ✅ Workflow engine (once agent commands are executable)
- ✅ State machine integration
- ✅ Web UI and REST API

---

## Troubleshooting

### Import Errors

**Error**: `commands is not iterable`

- **Cause**: MADACE agent uses object format for commands (e.g., madace-orchestrator)
- **Fix**: Import script handles both array and object formats automatically

**Error**: `No YAML block found`

- **Cause**: Agent file doesn't contain YAML block
- **Fix**: Ensure agent files have ````yaml` blocks

### Database Issues

**Duplicate agents**:

```bash
# Remove all MADACE agents
npx prisma studio  # Delete agents with module="madace"

# Re-import
npm run import-madace /tmp/MADACE-METHOD
```

---

## References

- **MADACE-METHOD GitHub**: https://github.com/bmad-code-org/MADACE-METHOD
- **MADACE Documentation**: https://github.com/bmad-code-org/MADACE-METHOD/blob/main/docs/user-guide.md
- **MADACE Discord**: https://discord.gg/gk8jAdXWmj
- **MADACE v3 Architecture**: [ARCHITECTURE-V3.md](../ARCHITECTURE-V3.md)
- **MADACE Agent System**: [ARCHITECTURE-V3-COMPONENTS.md](../ARCHITECTURE-V3-COMPONENTS.md)

---

## License

MADACE-METHOD™ is a trademark of BMad Code, LLC (MIT License).
MADACE-Method v2.0 is licensed under MIT License.

Integration code is part of MADACE-Method v2.0 and follows the MIT License.

---

**Last Updated**: 2025-10-23
**Import Status**:

- ✅ MADACE v4: 10/10 agents successfully imported
- ✅ MADACE v6-Alpha: 20/20 agents successfully imported
- ✅ Total: 30 MADACE agents in database

**MADACE Version**: v2.0.0-alpha
**MADACE Versions**:

- v4 (main branch) - 10 agents
- v6-alpha (alpha branch) - 20 agents across 5 modules

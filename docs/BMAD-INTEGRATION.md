# BMAD-METHOD Integration Guide

**Status**: ✅ Complete - 10 BMAD Agents Imported

This document describes the integration of BMAD-METHOD agents into MADACE-Method v2.0.

---

## Overview

[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) (Breakthrough Method of Agile AI-Driven Development) is a universal AI agent framework that provides specialized agents for software development and beyond. We've successfully integrated all 10 core BMAD agents into MADACE.

### What is BMAD-METHOD?

BMAD-METHOD provides:

- **Agentic Planning**: Dedicated agents (Analyst, PM, Architect) collaborate to create detailed PRDs and Architecture documents
- **Context-Engineered Development**: Scrum Master agent transforms plans into hyper-detailed development stories
- **Universal Framework**: Works in any domain (software, creative writing, business strategy, education, wellness)

---

## Imported Agents

### ✅ Successfully Imported (10/10)

| Icon | Agent ID            | Title                            | When to Use                                                                                    |
| ---- | ------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| 📊   | `analyst`           | Business Analyst                 | Market research, brainstorming, competitive analysis, project briefs, brownfield documentation |
| 🏗️   | `architect`         | Architect                        | System architecture, technical design, API specifications, data modeling, deployment planning  |
| 🧙   | `bmad-master`       | BMad Master Task Executor        | Executing specific tasks from the BMAD workflow system                                         |
| 🎭   | `bmad-orchestrator` | BMad Master Orchestrator         | Workflow coordination, multi-agent tasks, role switching guidance                              |
| 💻   | `dev`               | Full Stack Developer             | Feature implementation, bug fixes, code reviews, technical debt reduction                      |
| 📋   | `pm`                | Product Manager                  | PRDs, product strategy, feature prioritization, roadmap planning, stakeholder communication    |
| 📝   | `po`                | Product Owner                    | User story refinement, backlog management, acceptance criteria, sprint planning                |
| 🧪   | `qa`                | Test Architect & Quality Advisor | Test strategies, test automation, quality gates, acceptance testing                            |
| 🏃   | `sm`                | Scrum Master                     | Story decomposition, sprint facilitation, team coordination, removing blockers                 |
| 🎨   | `ux-expert`         | UX Expert                        | UX research, wireframes, prototyping, user flows, design systems                               |

---

## Integration Architecture

### Conversion Process

BMAD agents are stored in Markdown files with embedded YAML. We convert them to MADACE's database format:

**BMAD Format** (Markdown + YAML):

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

````

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
````

### Database Storage

All BMAD agents are stored in the `Agent` table with:

- `module = "bmad"` for easy filtering
- `persona` as JSON containing role, identity, style, principles
- `menu` as JSON array of command options
- `prompts` as JSON array including BMAD-specific metadata

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

To re-import BMAD agents (e.g., after BMAD-METHOD updates):

```bash
# Clone or update BMAD-METHOD
cd /tmp
git clone https://github.com/bmad-code-org/BMAD-METHOD.git

# Run import script
cd /Users/nimda/MADACE-Method-v2.0
npm run import-bmad /tmp/BMAD-METHOD
```

The importer will:

- ✅ Update existing agents with new data
- ✅ Add any new agents
- ✅ Preserve agent IDs and database relationships

---

## Implementation Details

### Import Script

Location: `scripts/import-bmad-agents.ts`

**Features:**

- Extracts YAML from Markdown files
- Converts BMAD structure to MADACE format
- Handles both array and object command formats
- Stores BMAD-specific metadata in prompts
- Updates existing agents or creates new ones

**Running:**

```bash
npm run import-bmad [path-to-BMAD-METHOD]
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
**Import Status**: ✅ 10/10 agents successfully imported
**MADACE Version**: v2.0.0-alpha
**BMAD Version**: v4.x (main branch)

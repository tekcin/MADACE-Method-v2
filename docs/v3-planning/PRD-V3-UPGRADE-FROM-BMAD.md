# MADACE v3.0 Upgrade PRD: Learning from BMAD-METHOD v6

**Project:** MADACE-Method v3.0 Enhancement
**Source Analysis:** BMAD-METHOD v6-alpha (October 2024)
**Purpose:** Identify and integrate key innovations from BMAD-METHOD v6 into MADACE v3.0
**Status:** Planning Document
**Created:** 2025-10-24
**Priority:** P0 (Critical for v3.0 design phase)

---

## Executive Summary

BMAD-METHOD v6-alpha represents a mature evolution of AI-driven software development methodology with several breakthrough innovations that should inform MADACE v3.0 design. This document analyzes key improvements and proposes selective integration to enhance MADACE while maintaining its unique vision.

**Key Finding**: BMAD v6 has solved many challenges MADACE will face in v3.0, particularly around scale-adaptive workflows, just-in-time design, and brownfield project handling.

---

## 1. Core Innovation Analysis

### 1.1 Scale-Adaptive Workflow Engine™

**BMAD Implementation:**
- Dynamic routing based on project complexity (Levels 0-4)
- Automatic artifact selection (tech-spec only vs PRD + Epics)
- Phase skipping for simple projects (L0-1 skip solutioning)
- Workflow orchestration based on context

**MADACE v2.0 Current State:**
- Static scale assessment (Levels 0-4 defined but not adaptive)
- Manual workflow selection
- No automatic phase routing

**Recommendation for MADACE v3.0:**
```
INTEGRATE: Scale-Adaptive Workflow Router
Priority: P0 (Critical)
Complexity: High

Features to Adopt:
✅ Automatic scale assessment on project load
✅ Dynamic workflow routing based on scale level
✅ Phase skipping for simple projects (L0-1)
✅ Artifact generation matched to scale

Implementation:
- lib/workflows/scale-router.ts
- Integrate with workflow executor
- Add scale detection algorithm
- Create routing decision tree
```

---

### 1.2 Just-In-Time (JIT) Technical Specifications

**BMAD Innovation:**
- Tech specs created ONE epic at a time during implementation
- Prevents over-engineering and analysis paralysis
- Incorporates learning from previous epics
- Reduces upfront planning overhead

**MADACE v2.0 Current State:**
- No tech spec concept yet
- All planning done upfront
- No epic-specific technical guidance

**Recommendation for MADACE v3.0:**
```
INTEGRATE: Just-In-Time Epic Tech Specs
Priority: P1 (High)
Complexity: Medium

Features to Adopt:
✅ Epic-specific tech spec workflow
✅ Generated on-demand before epic implementation
✅ Incorporates learnings from completed work
✅ Stored as tech-spec-epic-N.md

Implementation:
- New workflow: generate-tech-spec
- Triggered automatically when epic starts
- Reads PRD + Epics + previous work
- Outputs focused technical guidance

Benefits:
- Reduces wasted planning effort
- More accurate specs with real context
- Faster time to first story
```

---

### 1.3 Story-Context Workflow (Dynamic Expertise Injection)

**BMAD Innovation:**
- `story-context` workflow generates targeted technical guidance per story
- Replaces static documentation with contextual expertise
- Provides codebase-specific implementation hints
- XML-based context injection for LLM agents

**MADACE v2.0 Current State:**
- No story-level context generation
- Agents work from static PRD/Epics
- No dynamic expertise injection

**Recommendation for MADACE v3.0:**
```
INTEGRATE: Story-Context Workflow
Priority: P1 (High)
Complexity: Medium

Features to Adopt:
✅ Pre-development story context generation
✅ Codebase analysis for implementation hints
✅ Relevant file identification
✅ Pattern detection and reuse suggestions
✅ XML context format for agent consumption

Implementation:
- New workflow: generate-story-context
- Run after story approval, before development
- Outputs: story-{id}-context.xml
- Consumed by DEV agent during implementation

Example Output:
<story-context>
  <implementation-hints>
    <relevant-files>
      <file path="src/api/users.ts" relevance="high">
        Contains authentication pattern to reuse
      </file>
    </relevant-files>
    <patterns>
      <pattern name="API error handling">
        Use try-catch with ApiError class (see api-utils.ts)
      </pattern>
    </patterns>
  </implementation-hints>
</story-context>
```

---

### 1.4 Universal Workflow Status Checker

**BMAD Innovation:**
- `workflow-status` as universal entry point for all workflows
- Checks for existing status file, displays progress
- Guides new users to appropriate workflow
- Handles brownfield project detection
- Provides next-action recommendations

**MADACE v2.0 Current State:**
- mam-workflow-status.md as single source of truth ✅
- No universal status checker workflow
- Manual status determination

**Recommendation for MADACE v3.0:**
```
INTEGRATE: Universal Status Checker
Priority: P0 (Critical)
Complexity: Low

Features to Adopt:
✅ workflow-status as first command for all agents
✅ Automatic status file detection and parsing
✅ Next-action recommendations
✅ Greenfield vs brownfield routing
✅ Progress visualization

Implementation:
- New workflow: check-workflow-status
- All agents check status on load
- Display: Current phase, progress, next action
- If no status: Guide workflow planning
- If status exists: Show recommendations

CLI Command:
madace pm workflow-status
madace sm workflow-status
madace dev workflow-status

Benefits:
- Clear entry point for all users
- Reduces confusion about next steps
- Automatic brownfield detection
```

---

### 1.5 Brownfield Project Analysis

**BMAD Innovation:**
- Explicit brownfield handling in plan-project
- Halts planning if codebase not documented
- Requires `brownfield-analysis` workflow first
- Documents existing architecture before changes

**MADACE v2.0 Current State:**
- No brownfield-specific workflows
- No codebase analysis tooling
- Assumes greenfield or manually documented projects

**Recommendation for MADACE v3.0:**
```
INTEGRATE: Brownfield Analysis Workflow
Priority: P1 (High)
Complexity: High

Features to Adopt:
✅ Automatic brownfield project detection
✅ Codebase analysis and documentation
✅ Architecture mapping
✅ Technical debt identification
✅ Integration point documentation
✅ Baseline documentation generation

Implementation:
- New workflow: analyze-brownfield
- Triggered before planning phase if needed
- Outputs:
  - architecture-baseline.md
  - technical-debt-inventory.md
  - integration-points.md
- Uses code analysis tools:
  - AST parsing
  - Dependency graphing
  - Pattern detection

Benefits:
- Prevents uninformed planning decisions
- Documents existing system state
- Identifies risks before starting work
- Creates baseline for change impact
```

---

### 1.6 Four-State Story Lifecycle

**BMAD Innovation:**
```
BACKLOG → TODO → IN PROGRESS → DONE
```
- Explicit state machine with transition rules
- Only 1 story in TODO at a time
- Only 1 story in IN PROGRESS at a time
- Stories never searched - always read from status file
- Story file Status field mirrors state machine

**MADACE v2.0 Current State:**
- Similar 4-state model already implemented ✅
- TODO and IN_PROGRESS limited to 1 story ✅
- Single source of truth (mam-workflow-status.md) ✅

**Recommendation for MADACE v3.0:**
```
ENHANCE: Story Lifecycle (Minor improvements)
Priority: P2 (Medium)
Complexity: Low

Features to Adopt from BMAD:
✅ Story Status field in markdown (Draft, Ready, In Review, Done)
✅ story-ready workflow for approval transition
✅ story-done workflow for completion transition
✅ Explicit state transition workflows

Current MADACE implementation is solid, just needs:
- Add Status: field to story files
- Create story-ready and story-done workflows
- Document transition rules more clearly

MADACE Advantage:
- Web UI with visual Kanban board (BMAD doesn't have this!)
- Real-time WebSocket sync (BMAD doesn't have this!)
```

---

### 1.7 Agent Customization System (Sidecar Files)

**BMAD Innovation:**
- Sidecar files in `bmad/_cfg/agents/` for customization
- Update-safe customizations (persist through upgrades)
- Full agent modification without editing originals
- Multi-language communication support
- Technical level adaptation (beginner to advanced)

**MADACE v2.0 Current State:**
- Static agent YAML files
- No customization without editing originals
- Single language (English)

**Recommendation for MADACE v3.0:**
```
INTEGRATE: Agent Sidecar Customization
Priority: P1 (High)
Complexity: Medium

Features to Adopt:
✅ Sidecar files for agent customization
✅ Update-safe override mechanism
✅ Multi-language persona support
✅ Technical level adaptation
✅ Custom communication styles

Implementation:
- Directory: madace/_cfg/agents/
- Sidecar format: agent-name.sidecar.yaml
- Merge logic: Original + Sidecar = Final Agent
- User preferences: madace/_cfg/user-preferences.yaml

Example Sidecar:
# madace/_cfg/agents/pm.sidecar.yaml
persona:
  communication_style: "Japanese, formal, respectful"
  technical_level: "beginner" # beginner, intermediate, advanced
  custom_greeting: "こんにちは！プロジェクトマネージャーです。"

Benefits:
- User-specific agent behavior
- Persists through updates
- No need to fork agents
- Easy language/style switching
```

---

### 1.8 Intelligent Installer

**BMAD Innovation:**
- Interactive installer with guided prompts
- User name configuration (how agents address you)
- Communication language preference
- Technical level selection
- Module-specific customization
- IDE-specific enhancements (e.g., Claude Code sub-agents)

**MADACE v2.0 Current State:**
- Basic setup wizard (4 steps) ✅
- Project configuration ✅
- LLM selection ✅
- Module toggles ✅
- No user-specific preferences
- No language selection
- No technical level

**Recommendation for MADACE v3.0:**
```
ENHANCE: Setup Wizard with User Preferences
Priority: P1 (High)
Complexity: Medium

Features to Add:
✅ User name input (for agent personalization)
✅ Communication language selection
✅ Technical expertise level (beginner/intermediate/advanced)
✅ Preferred communication style
✅ IDE integration selection (Claude Code, Cursor, etc.)
✅ Module-specific configuration

Enhanced Setup Flow:
1. Project Information (existing)
2. User Preferences (NEW)
   - Your name: _________
   - Communication language: English / Japanese / Spanish / etc.
   - Technical level: Beginner / Intermediate / Advanced
   - Communication style: Formal / Casual / Direct / etc.
3. LLM Configuration (existing)
4. Module Configuration (existing)
5. IDE Integration (NEW)
6. Summary (existing)

Storage:
- madace/_cfg/user-preferences.yaml
- Used by all agents for personalization
```

---

### 1.9 Unified Installation Directory

**BMAD Innovation:**
- Single `bmad/` folder for all modules
- Clean, organized structure
- No scattered root folders
- Shared resources in central location

**MADACE v2.0 Current State:**
- `madace/` folder structure ✅
- Module organization (mam, mab, cis) ✅
- Already clean and organized ✅

**Recommendation for MADACE v3.0:**
```
MAINTAIN: Current Structure (Already Good)
Priority: N/A
Complexity: N/A

MADACE v2.0 structure is already clean:
madace/
├── core/         # Core agents
├── mam/          # MADACE Agile Method
├── mab/          # MADACE Builder
├── cis/          # Creative Intelligence Suite
└── _cfg/         # Configuration

This matches BMAD's vision. Keep it.
```

---

### 1.10 Party Mode & Agent Consolidation

**BMAD Innovation:**
- Unified agent party when modules installed
- Party-mode in IDEs for multi-agent simulation
- Efficient agent switching
- Cross-module agent collaboration

**MADACE v2.0 Current State:**
- Individual agent files
- No party mode concept
- No cross-module agent awareness

**Recommendation for MADACE v3.0:**
```
CONSIDER: Agent Party Mode (Future)
Priority: P3 (Nice-to-have)
Complexity: High

Features from BMAD:
- Unified agent manifest for IDE party mode
- Cross-module agent discovery
- Multi-agent simulation interface

Implementation:
- madace/_cfg/agent-party.json
- Lists all available agents
- Used by IDE extensions
- Enables Claude Code party mode

Note: This is advanced feature, defer to v3.1 or later
Focus on core v3.0 features first
```

---

## 2. BMAD Features NOT to Adopt

### 2.1 Game Development Focus

**BMAD:** Heavy investment in game development workflows (GDD, game types, narrative design)

**MADACE Decision:** ❌ Do not adopt
- MADACE focuses on general software development
- Game development is niche
- Resources better spent on core features

### 2.2 Web Bundle Compilation

**BMAD:** Compiles agents for ChatGPT, Gemini Gems, web deployment

**MADACE Decision:** ❌ Do not adopt initially
- MADACE v3.0 focuses on local/CLI integration
- Web bundle is v3.1+ feature
- Complexity outweighs benefits for alpha

### 2.3 BMad Builder Module

**BMAD:** Separate module (BMB) for creating agents/workflows/modules

**MADACE Decision:** ✅ Adopt concept as MAB
- MADACE already has MAB (MADACE Builder) planned
- Similar vision, different implementation
- Keep as core v3.0 feature

---

## 3. Proposed MADACE v3.0 Feature Integration

### Priority Matrix

| Feature                          | Priority | Complexity | Impact | Adopt? |
| -------------------------------- | -------- | ---------- | ------ | ------ |
| Scale-Adaptive Workflow Router   | P0       | High       | High   | ✅ Yes |
| Universal Workflow Status        | P0       | Low        | High   | ✅ Yes |
| Just-In-Time Tech Specs          | P1       | Medium     | High   | ✅ Yes |
| Story-Context Workflow           | P1       | Medium     | High   | ✅ Yes |
| Brownfield Analysis              | P1       | High       | High   | ✅ Yes |
| Agent Sidecar Customization      | P1       | Medium     | Medium | ✅ Yes |
| Enhanced Setup Wizard            | P1       | Medium     | Medium | ✅ Yes |
| Story Lifecycle Enhancements     | P2       | Low        | Low    | ✅ Yes |
| Agent Party Mode                 | P3       | High       | Low    | ⏭️ v3.1+ |
| Game Development Workflows       | P3       | High       | Low    | ❌ No  |
| Web Bundle Compilation           | P3       | High       | Medium | ⏭️ v3.1+ |

---

## 4. Implementation Roadmap for v3.0

### Phase 1: Foundation (Weeks 1-12)

**Q1 2026: Database + Core Infrastructure**
- V3-E2: Database Infrastructure (6 weeks)
- V3-E8: Migration & Compatibility (4 weeks)
- V3-E9: Multi-User Authentication (3 weeks)

**BMAD Integration: None yet** (infrastructure first)

---

### Phase 2: Workflow Intelligence (Weeks 13-24)

**Q2 2026: Scale-Adaptive Workflows + Agent System**
- V3-E1: Dynamic Agent Management (8 weeks)
  - **+ Agent Sidecar Customization** (from BMAD)
  - **+ Enhanced Setup Wizard** (from BMAD)

- V3-E5: Interactive CLI & Dashboard (4 weeks)
  - **+ Universal Workflow Status** (from BMAD)

- V3-E3: Agent Memory System (5 weeks)

**BMAD Integrations:**
1. **Week 13-14**: Agent Sidecar System
   - Implement sidecar file loading
   - Merge logic (original + sidecar)
   - User preferences storage

2. **Week 15-16**: Enhanced Setup Wizard
   - Add user preferences step
   - Language selection
   - Technical level configuration

3. **Week 17**: Universal Workflow Status
   - Implement workflow-status checker
   - Status file parsing
   - Next-action recommendations

---

### Phase 3: Adaptive Workflows (Weeks 25-36)

**Q3 2026: Scale-Adaptive Engine + Brownfield**
- V3-E4: Conversational Interaction (NLU) (6 weeks)
- V3-E6: Integrated Web IDE (8 weeks)

**BMAD Integrations:**
4. **Week 25-26**: Scale-Adaptive Workflow Router
   - Implement scale detection algorithm
   - Dynamic routing based on Levels 0-4
   - Phase skipping logic
   - Artifact generation matching

5. **Week 27-28**: Just-In-Time Tech Specs
   - Epic-specific tech spec workflow
   - On-demand generation
   - Learning incorporation

6. **Week 29-30**: Story-Context Workflow
   - Codebase analysis for context
   - XML context generation
   - Relevant file identification

7. **Week 31-32**: Brownfield Analysis
   - Codebase scanning and analysis
   - Architecture baseline generation
   - Technical debt inventory
   - Integration point mapping

---

### Phase 4: Polish & Optimization (Weeks 37-48)

**Q4 2026: Collaboration + Performance**
- V3-E7: Real-Time Collaboration (10 weeks)
- V3-E10: Performance & Optimization (6 weeks)

**BMAD Integrations:**
8. **Week 43-44**: Story Lifecycle Enhancements
   - Add Status field to story files
   - Implement story-ready workflow
   - Implement story-done workflow
   - Explicit state transitions

**All BMAD features integrated by end of Q4 2026!**

---

## 5. Technical Specifications for BMAD-Inspired Features

### 5.1 Scale-Adaptive Workflow Router

**Location:** `lib/workflows/scale-router.ts`

**Interface:**
```typescript
interface ScaleAssessment {
  level: 0 | 1 | 2 | 3 | 4;
  factors: {
    storyCount: number;
    epicCount: number;
    teamSize: number;
    complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
    isGreenfield: boolean;
  };
  reasoning: string;
}

interface WorkflowRoute {
  phase1: string[]; // Analysis workflows
  phase2: string[];  // Planning workflows
  phase3: string[];  // Solutioning workflows (may be empty for L0-1)
  phase4: string[];  // Implementation workflows
  artifacts: string[]; // Expected outputs
}

class ScaleAdaptiveRouter {
  async assessProjectScale(project: Project): Promise<ScaleAssessment>;
  async determineWorkflowRoute(scale: ScaleAssessment): Promise<WorkflowRoute>;
  async shouldSkipSolutioning(scale: ScaleAssessment): Promise<boolean>;
}
```

**Scale Detection Algorithm:**
```typescript
function assessScale(project: Project): number {
  let level = 0;

  // Story count factor
  if (project.estimatedStories === 1) level = 0;
  else if (project.estimatedStories <= 10) level = 1;
  else if (project.estimatedStories <= 15) level = 2;
  else if (project.estimatedStories <= 40) level = 3;
  else level = 4;

  // Complexity adjustments
  if (project.hasMicroservices) level = Math.max(level, 3);
  if (project.hasDatabase) level = Math.max(level, 2);
  if (project.teamSize > 3) level = Math.max(level, 3);
  if (project.isGreenfield === false) level = Math.max(level, 2);

  return Math.min(level, 4); // Cap at 4
}
```

---

### 5.2 Just-In-Time Tech Spec Workflow

**Location:** `lib/workflows/jit-tech-spec.ts`

**Workflow Definition:**
```yaml
workflow:
  name: "generate-tech-spec"
  description: "Generate epic-specific technical specification"
  trigger: "epic_ready_for_implementation"

  inputs:
    - epic_id: string
    - prd_path: string
    - epics_path: string
    - completed_work_path: string # Previous epics for learning

  outputs:
    - tech-spec-epic-${epic_id}.md

  steps:
    - name: "Load Context"
      action: "gather"
      sources:
        - PRD.md
        - Epics.md (specific epic section)
        - Completed epics (tech specs + retrospectives)
        - Architecture.md (if exists)

    - name: "Generate Tech Spec"
      action: "elicit"
      agent: "architect"
      prompt: |
        Generate technical specification for Epic ${epic_id}.

        Context:
        - PRD: ${prd}
        - Epic Details: ${epic}
        - Learnings from Previous Epics: ${learnings}
        - Architecture: ${architecture}

        Focus on:
        - Implementation approach
        - Technology choices
        - Integration points
        - Testing strategy
        - Risks and mitigation

    - name: "Save Tech Spec"
      action: "template"
      template: "tech-spec-template.md"
      output: "tech-spec-epic-${epic_id}.md"
```

**Benefits:**
- Reduces wasted upfront planning
- Incorporates real learning
- More accurate specifications
- Faster time to first story

---

### 5.3 Story-Context Workflow

**Location:** `lib/workflows/story-context.ts`

**XML Context Format:**
```xml
<story-context story-id="${story_id}">
  <implementation-hints>
    <relevant-files>
      <file path="src/api/users.ts" relevance="high">
        Contains authentication pattern to reuse.
        See `authenticateUser()` function.
      </file>
      <file path="src/utils/api-error.ts" relevance="medium">
        Use ApiError class for consistent error handling.
      </file>
    </relevant-files>

    <patterns>
      <pattern name="API Error Handling">
        Wrap async API calls in try-catch.
        Use ApiError for all errors.
        Return { success, data, error } format.
      </pattern>
      <pattern name="Authentication">
        Use middleware: authenticateRequest(req, res, next)
        Attach user to req.user
        Handle 401/403 with ApiError
      </pattern>
    </patterns>

    <dependencies>
      <dependency name="express" version="^4.18.0" />
      <dependency name="jsonwebtoken" version="^9.0.0" />
    </dependencies>

    <technical-notes>
      <note priority="high">
        This story depends on user authentication being complete.
        Verify JWT middleware is installed.
      </note>
      <note priority="medium">
        Consider rate limiting for this endpoint.
        See rate-limit-middleware.ts.
      </note>
    </technical-notes>
  </implementation-hints>
</story-context>
```

**Generation Logic:**
```typescript
async function generateStoryContext(story: Story): Promise<string> {
  // 1. Analyze story requirements
  const requirements = parseStoryRequirements(story);

  // 2. Search codebase for relevant files
  const relevantFiles = await searchCodebase(requirements);

  // 3. Detect patterns in existing code
  const patterns = await detectPatterns(relevantFiles);

  // 4. Identify dependencies
  const dependencies = await analyzeDependencies(story, relevantFiles);

  // 5. Generate technical notes
  const notes = await generateTechnicalNotes(story, relevantFiles);

  // 6. Render XML context
  return renderContextXML({
    storyId: story.id,
    relevantFiles,
    patterns,
    dependencies,
    notes
  });
}
```

---

### 5.4 Universal Workflow Status Checker

**Location:** `lib/workflows/workflow-status.ts`

**CLI Command:**
```bash
madace pm workflow-status
madace sm workflow-status
madace dev workflow-status
```

**Status Display:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MADACE Workflow Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: MyApp
Scale Level: 3 (Large - 25 stories, 3 epics)
Type: Greenfield Software Project

Current Phase: Phase 4 - Implementation
Progress: Epic 1 of 3 (33%)

Story State:
  BACKLOG:     15 stories
  TODO:         1 story  (STORY-016-user-dashboard)
  IN PROGRESS:  1 story  (STORY-015-api-endpoints)
  DONE:         8 stories (42 points)

Next Action:
  → Complete STORY-015 (in progress)
  → Review and move to DONE with: madace dev story-done
  → SM will draft STORY-016 with: madace sm create-story

Would you like to:
  [1] Continue current workflow
  [2] Change to different workflow
  [3] Display agent menu
  [4] Exit
```

---

### 5.5 Brownfield Analysis Workflow

**Location:** `lib/workflows/brownfield-analysis.ts`

**Workflow Steps:**
1. **Code Discovery**
   - Scan directory structure
   - Identify technology stack
   - Find entry points

2. **Architecture Mapping**
   - Component identification
   - Dependency graph
   - Data flow analysis

3. **Pattern Detection**
   - Design patterns used
   - Architectural patterns
   - Code conventions

4. **Technical Debt Assessment**
   - Code quality metrics
   - Test coverage
   - Documentation gaps
   - Security issues

5. **Integration Point Mapping**
   - External dependencies
   - API endpoints
   - Database schemas
   - Third-party services

6. **Documentation Generation**
   - architecture-baseline.md
   - technical-debt-inventory.md
   - integration-points.md
   - refactoring-opportunities.md

**Tools to Use:**
- TypeScript AST parser (ts-morph)
- Dependency graph generator (madge)
- Code complexity analyzer (jscpd, complexity-report)
- Security scanner (npm audit, snyk)

---

### 5.6 Agent Sidecar Customization

**Location:** `madace/_cfg/agents/`

**Sidecar File Format:**
```yaml
# madace/_cfg/agents/pm.sidecar.yaml
version: "1.0"
agent_name: "pm"
customizations:
  persona:
    communication_style: |
      Communicate in Japanese with formal, respectful tone.
      Use business-appropriate keigo (敬語).
    technical_level: "beginner"
    greeting: "こんにちは！プロジェクトマネージャーの山田です。"

  menu:
    custom_commands:
      - trigger: "status-ja"
        action: "workflow-status"
        description: "ワークフローの状態を表示"

  prompts:
    override:
      - name: "plan-project"
        content: |
          プロジェクト計画を作成します。
          スケールレベル: ${scale_level}
          プロジェクトタイプ: ${project_type}
```

**Merge Logic:**
```typescript
function mergeAgentWithSidecar(
  originalAgent: Agent,
  sidecar: AgentSidecar
): Agent {
  return {
    ...originalAgent,
    persona: {
      ...originalAgent.persona,
      ...sidecar.customizations.persona
    },
    menu: [
      ...originalAgent.menu,
      ...sidecar.customizations.menu.custom_commands
    ],
    prompts: originalAgent.prompts.map(prompt => {
      const override = sidecar.customizations.prompts.override.find(
        o => o.name === prompt.name
      );
      return override ? { ...prompt, content: override.content } : prompt;
    })
  };
}
```

---

## 6. Migration Strategy from BMAD Learnings

### 6.1 Compatibility

**MADACE v3.0 should maintain compatibility with:**
- MADACE v2.0 file structure ✅
- Existing workflow definitions ✅
- Agent YAML format ✅

**New features from BMAD should be:**
- Optional (don't break existing setups)
- Backward compatible
- Gradual adoption

### 6.2 User Migration Path

**For existing MADACE v2.0 users:**
```
v2.0.0-alpha (current)
  ↓
  Migration Tool (V3-E8)
  ↓
v3.0.0-beta (BMAD features integrated)
  ↓
  Optional: Enable BMAD-inspired features
  - Scale-adaptive routing
  - Agent sidecar customization
  - Story-context generation
  - Brownfield analysis
```

---

## 7. Success Metrics

### 7.1 Adoption Metrics

**Scale-Adaptive Routing:**
- 80%+ of projects correctly routed to appropriate workflows
- 50% reduction in wasted planning for simple projects
- 30% improvement in planning accuracy for complex projects

**Story-Context Generation:**
- 40% reduction in developer questions during implementation
- 25% faster story completion time
- 60% of stories have relevant context identified

**Brownfield Analysis:**
- 90% of brownfield projects documented before planning
- 50% reduction in unexpected technical debt discovery
- 70% more accurate effort estimates

### 7.2 User Satisfaction

**Target Scores (1-5):**
- Ease of workflow navigation: 4.5+
- Appropriateness of generated artifacts: 4.3+
- Agent personalization: 4.0+
- Brownfield project handling: 4.2+

---

## 8. Risks and Mitigation

### 8.1 Risks

| Risk                            | Probability | Impact | Mitigation                          |
| ------------------------------- | ----------- | ------ | ----------------------------------- |
| Over-engineering from BMAD      | Medium      | High   | Adopt selectively, prioritize       |
| User confusion with new options | Medium      | Medium | Clear documentation, gradual rollout |
| Breaking v2.0 compatibility     | Low         | High   | Strict backward compatibility tests |
| Implementation complexity       | High        | Medium | Phased rollout, extensive testing   |

### 8.2 Mitigation Strategies

1. **Selective Adoption**: Only adopt BMAD features with clear ROI
2. **Phased Rollout**: Introduce features gradually across v3.0 timeline
3. **Extensive Testing**: Unit tests, integration tests, user acceptance tests
4. **User Education**: Documentation, tutorials, migration guides
5. **Feedback Loops**: Beta testing, user surveys, iteration

---

## 9. Open Questions

1. **Agent Sidecar Storage**: Database vs file system in v3.0?
   - Recommendation: Start with file system (like BMAD), migrate to database in v3.1

2. **Scale Detection**: Automatic vs user-selected?
   - Recommendation: Automatic with override option

3. **Story-Context Format**: XML vs JSON vs YAML?
   - Recommendation: XML (matches BMAD, better for LLM consumption)

4. **Brownfield Analysis**: Which tools to use?
   - Recommendation: ts-morph (AST), madge (dependencies), jscpd (duplication)

5. **Agent Customization**: How much user control?
   - Recommendation: Full control via sidecar, but sane defaults

---

## 10. Conclusion

**BMAD-METHOD v6-alpha represents a mature, battle-tested implementation of many features MADACE v3.0 will need.**

**Recommended Action Plan:**
1. ✅ **Adopt** scale-adaptive routing, JIT tech specs, story-context, brownfield analysis, agent sidecars, universal status checker
2. ❌ **Skip** game development focus, web bundle compilation (defer to v3.1+)
3. 📋 **Plan** phased integration across Q2-Q4 2026
4. 🧪 **Test** extensively with backward compatibility
5. 📚 **Document** new features comprehensively
6. 👥 **Engage** community for feedback during beta

**By integrating BMAD's proven innovations, MADACE v3.0 will be significantly more powerful while maintaining its unique vision of a full-featured collaboration platform.**

---

**Next Steps:**
1. Review this PRD with MADACE core team
2. Prioritize features for v3.0 vs v3.1+
3. Update v3.0 epics with BMAD-inspired features
4. Create detailed technical specifications
5. Begin implementation in Q2 2026

---

**Document Status:** Draft for Review
**Reviewers:** MADACE Core Team
**Next Review:** 2025-11-01
**Maintainer:** MADACE Core Team

**🎯 MADACE v3.0 + BMAD learnings = Revolutionary AI collaboration platform!**

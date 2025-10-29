# MADACE v3.0 - Priority 0 Stories (Q2 2026)

**Target Quarter:** Q2 2026  
**Total Effort:** 55 points (21 stories across 2 epics)  
**Timeline:** 5 weeks development + 3 weeks testing  
**Status:** 📋 Planning - Ready for Implementation

---

## EPIC-V3-001: Scale-Adaptive Workflow Router (34 points, 10 stories)

### Phase 1: Assessment Algorithm (Week 1)

#### STORY-V3-001: Implement Complexity Scoring Algorithm

**Points:** 5 | **Priority:** P0 | **Type:** Core Feature

**Description:**
Create the complexity assessment algorithm that scores projects on 8 criteria (0-40 points) and maps to Levels 0-4.

**Acceptance Criteria:**

- [ ] Create `ComplexityAssessment` TypeScript interface with 8 fields
- [ ] Implement scoring functions for each criterion
- [ ] Implement `assessComplexity()` that returns level (0-4)
- [ ] Support all 8 criteria: projectSize, teamSize, existingCodebase, codebaseSize, integrationCount, userBase, securityRequirements, estimatedDuration
- [ ] Unit tests: 95%+ coverage, test all boundary cases
- [ ] Documentation: Algorithm explanation with examples

**Technical Notes:**

```typescript
// lib/workflows/complexity-assessment.ts
interface ComplexityAssessment {
  projectSize: 'small' | 'medium' | 'large' | 'enterprise';
  teamSize: number;
  existingCodebase: boolean;
  codebaseSize?: number;
  integrationCount: number;
  userBase: 'internal' | 'small' | 'medium' | 'large';
  securityRequirements: 'basic' | 'standard' | 'high' | 'critical';
  estimatedDuration: number;
}

function assessComplexity(input: ProjectInput): ComplexityResult {
  let score = 0;
  // Scoring logic for each criterion
  return { level: determineLevel(score), score, breakdown };
}
```

**Files:**

- Create: `lib/workflows/complexity-assessment.ts`
- Create: `lib/workflows/types.ts` (assessment interfaces)
- Create: `__tests__/lib/workflows/complexity-assessment.test.ts`

---

#### STORY-V3-002: Create Assessment Report Template

**Points:** 3 | **Priority:** P0 | **Type:** Template

**Description:**
Create Handlebars template for scale assessment reports that explains scoring and recommendations.

**Acceptance Criteria:**

- [ ] Create `scale-assessment.hbs` template
- [ ] Template sections: Executive Summary, Criteria Scores, Level Determination, Recommendations, Risks
- [ ] Variables: assessment, level, score, breakdown, recommendations, risks
- [ ] Markdown formatting with tables and badges
- [ ] Example output for all 5 levels (0-4)

**Technical Notes:**

```handlebars
{{! templates/scale-assessment.hbs }}
# Project Complexity Assessment **Assessment Date:**
{{formatDate date}}
**Recommended Level:** Level
{{level}}
({{levelName level}}) **Total Score:**
{{score}}/40 points ## Criteria Breakdown | Criterion | Score | Max | Details |
|-----------|-------|-----|---------|
{{#each breakdown}}
  |
  {{name}}
  |
  {{score}}
  |
  {{max}}
  |
  {{details}}
  |
{{/each}}

## Recommended Documentation
{{#if (eq level 0)}}
  - Direct to story creation (no documentation needed)
{{/if}}
{{#if (gte level 1)}}
  - Lightweight PRD - Story breakdown
{{/if}}
...
```

**Files:**

- Create: `templates/scale-assessment.hbs`
- Update: `lib/templates/helpers.ts` (add assessment helpers)

---

#### STORY-V3-003: Add Unit Tests for Scoring Logic

**Points:** 3 | **Priority:** P0 | **Type:** Testing

**Description:**
Comprehensive test suite for complexity scoring with boundary cases and all level transitions.

**Acceptance Criteria:**

- [ ] Test all 8 criteria scoring functions
- [ ] Test level determination (boundary cases: 5/6, 12/13, 20/21, 30/31)
- [ ] Test score calculation with various inputs
- [ ] Test edge cases: minimum values, maximum values, missing optional fields
- [ ] Mock data for 10 realistic projects (2 per level)
- [ ] 95%+ code coverage

**Test Cases:**

```typescript
describe('Complexity Assessment', () => {
  it('Level 0: Simple script project', () => {
    const result = assessComplexity({
      projectSize: 'small',
      teamSize: 1,
      existingCodebase: false,
      integrationCount: 0,
      userBase: 'internal',
      securityRequirements: 'basic',
      estimatedDuration: 1,
    });
    expect(result.level).toBe(0);
    expect(result.score).toBeLessThanOrEqual(5);
  });

  it('Level 4: Enterprise distributed system', () => {
    const result = assessComplexity({
      projectSize: 'enterprise',
      teamSize: 15,
      existingCodebase: true,
      codebaseSize: 100000,
      integrationCount: 10,
      userBase: 'large',
      securityRequirements: 'critical',
      estimatedDuration: 52,
    });
    expect(result.level).toBe(4);
    expect(result.score).toBeGreaterThanOrEqual(31);
  });
});
```

---

### Phase 2: Workflow Routing (Week 2)

#### STORY-V3-004: Create Route-Workflow YAML

**Points:** 5 | **Priority:** P0 | **Type:** Workflow

**Description:**
Create the main routing workflow that elicits project info, assesses complexity, and routes to appropriate planning workflows.

**Acceptance Criteria:**

- [ ] Create `workflows/route-workflow.yaml`
- [ ] Step 1: Elicit project information (8 questions)
- [ ] Step 2: Assess complexity (call assessment algorithm)
- [ ] Step 3: Generate assessment report
- [ ] Step 4: Confirm planning level (with override option)
- [ ] Step 5: Route to appropriate workflow(s) based on level
- [ ] 5 routing paths (one per level 0-4)
- [ ] Validate YAML with WorkflowSchema (Zod)

**Workflow Structure:**

```yaml
workflow:
  name: 'Scale-Adaptive Workflow Router'
  description: 'Routes to appropriate planning workflow based on project complexity'
  version: '1.0.0'

  steps:
    - name: 'Gather Project Information'
      action: elicit
      prompts:
        - 'What type of project are you building?'
        - 'How many people are on your team?'
        # ... 6 more questions
      output_var: 'PROJECT_INFO'

    - name: 'Assess Project Complexity'
      action: assess_complexity
      input: '${PROJECT_INFO}'
      output_var: 'COMPLEXITY_ASSESSMENT'

    - name: 'Generate Assessment Report'
      action: render_template
      template: 'scale-assessment.hbs'
      output: '${PROJECT_OUTPUT}/scale-assessment.md'
      vars:
        assessment: '${COMPLEXITY_ASSESSMENT}'

    - name: 'Confirm Planning Level'
      action: elicit
      prompt: 'Recommended Level ${COMPLEXITY_LEVEL}. Proceed? (yes/override)'
      output_var: 'CONFIRMED_LEVEL'

    - name: 'Route to Appropriate Workflow'
      action: route
      condition: '${CONFIRMED_LEVEL}'
      routing:
        level_0: ['create-stories']
        level_1: ['plan-project-light', 'create-stories']
        level_2: ['plan-project', 'create-architecture-basic', 'create-epics', 'create-stories']
        level_3:
          [
            'plan-project',
            'create-tech-specs',
            'create-architecture',
            'create-epics',
            'create-stories',
          ]
        level_4:
          [
            'plan-project',
            'create-tech-specs',
            'create-architecture',
            'create-security-spec',
            'create-devops-spec',
            'create-epics',
            'create-stories',
          ]
```

**Files:**

- Create: `workflows/route-workflow.yaml`

---

#### STORY-V3-005: Implement Routing Action in Workflow Executor

**Points:** 8 | **Priority:** P0 | **Type:** Core Feature

**Description:**
Enhance workflow executor to support conditional routing action that executes different workflows based on complexity level.

**Acceptance Criteria:**

- [ ] Add `action: route` support to workflow executor
- [ ] Implement conditional routing based on level variable
- [ ] Support sequential workflow execution per level
- [ ] Track parent-child workflow relationships
- [ ] Update workflow state with routing information
- [ ] Error handling for invalid routes
- [ ] Integration tests for all 5 routing paths

**Technical Notes:**

```typescript
// lib/workflows/executor.ts - Enhanced
class WorkflowExecutor {
  async executeStep(step: WorkflowStep): Promise<StepResult> {
    if (step.action === 'route') {
      return await this.executeRouteAction(step);
    }
    // ... existing actions
  }

  private async executeRouteAction(step: WorkflowStep): Promise<StepResult> {
    const level = this.getVariable(step.condition);
    const workflows = step.routing[`level_${level}`];

    for (const workflowPath of workflows) {
      await this.executeChildWorkflow(workflowPath);
    }

    return { success: true, message: `Routed to ${workflows.length} workflows` };
  }
}
```

**Files:**

- Update: `lib/workflows/executor.ts`
- Update: `lib/workflows/types.ts` (add routing types)
- Create: `__tests__/lib/workflows/routing.test.ts`

---

#### STORY-V3-006: Add Conditional Workflow Execution

**Points:** 5 | **Priority:** P0 | **Type:** Enhancement

**Description:**
Support for executing workflows conditionally based on variables and routing decisions.

**Acceptance Criteria:**

- [ ] Add conditional execution logic to workflow executor
- [ ] Support variable substitution in conditions
- [ ] Support comparison operators (eq, gt, lt, gte, lte)
- [ ] Support boolean expressions (and, or, not)
- [ ] Error handling for invalid conditions
- [ ] Unit tests for all conditional expressions

**Technical Notes:**

```typescript
// lib/workflows/conditions.ts
function evaluateCondition(condition: string, variables: Record<string, any>): boolean {
  // Variable substitution
  const resolved = substituteVariables(condition, variables);

  // Parse and evaluate expression
  // Examples:
  // - "${LEVEL} === 0"
  // - "${TEAM_SIZE} > 5 && ${SECURITY} === 'high'"
  // - "${EXISTING_CODEBASE} === true"

  return evaluate(resolved);
}
```

**Files:**

- Create: `lib/workflows/conditions.ts`
- Update: `lib/workflows/executor.ts` (use conditions)
- Create: `__tests__/lib/workflows/conditions.test.ts`

---

### Phase 3: UI Integration (Week 3)

#### STORY-V3-007: Add CLI Command `madace assess-scale`

**Points:** 3 | **Priority:** P0 | **Type:** CLI

**Description:**
Create CLI command for project complexity assessment with multiple output formats.

**Acceptance Criteria:**

- [ ] Command: `madace assess-scale`
- [ ] Interactive prompts for 8 criteria (using inquirer.js)
- [ ] Displays assessment result with level and score
- [ ] Flags: `--format=table|json|markdown`, `--output=file`
- [ ] Saves assessment report to docs/scale-assessment.md
- [ ] CLI integration tests

**CLI Usage:**

```bash
# Interactive assessment
$ madace assess-scale
? What type of project? (Web Application)
? Team size? (5)
...
✅ Assessment Complete: Level 3 (Complex System)
📄 Report saved to: docs/scale-assessment.md

# Non-interactive with JSON output
$ madace assess-scale --json '{"projectSize":"large","teamSize":10,...}' --format=json
{"level":3,"score":25,"breakdown":{...}}

# Save to custom location
$ madace assess-scale --output=custom/assessment.md
```

**Files:**

- Create: `lib/cli/commands/assess-scale.ts`
- Update: `lib/cli/index.ts` (register command)

---

#### STORY-V3-008: Integrate Assessment into Setup Wizard

**Points:** 3 | **Priority:** P0 | **Type:** Web UI

**Description:**
Add auto-assessment to setup wizard (Step 3: Project Configuration) with manual override option.

**Acceptance Criteria:**

- [ ] Add assessment widget to Project Configuration step
- [ ] Auto-calculate level based on project inputs
- [ ] Display recommended level with badge (Level 0-4)
- [ ] Show assessment summary (score, top factors)
- [ ] Manual override dropdown ("Use different level")
- [ ] Link to view full assessment report
- [ ] Responsive design and dark mode

**UI Component:**

```tsx
// components/features/setup/ProjectConfigStep.tsx - Enhanced
export default function ProjectConfigStep() {
  const [assessment, setAssessment] = useState<ComplexityResult | null>(null);
  const [manualLevel, setManualLevel] = useState<number | null>(null);

  useEffect(() => {
    // Auto-assess when project inputs change
    const result = assessComplexity(projectInputs);
    setAssessment(result);
  }, [projectInputs]);

  return (
    <div>
      {/* ... existing project inputs ... */}

      {assessment && (
        <div className="mt-6 rounded-lg border bg-blue-50 p-4 dark:bg-blue-900">
          <h3>Recommended Planning Level</h3>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">Level {assessment.level}</span>
            <span className="text-sm text-gray-600">Score: {assessment.score}/40 points</span>
          </div>

          {/* Manual override */}
          <select onChange={(e) => setManualLevel(Number(e.target.value))}>
            <option>Use recommended level</option>
            <option value="0">Level 0 (Simple Script)</option>
            ...
          </select>

          {/* View full report */}
          <button onClick={viewAssessmentReport}>View Assessment Details</button>
        </div>
      )}
    </div>
  );
}
```

**Files:**

- Update: `components/features/setup/ProjectConfigStep.tsx`
- Create: `components/features/AssessmentWidget.tsx`

---

#### STORY-V3-009: Create Web UI Assessment Page

**Points:** 5 | **Priority:** P0 | **Type:** Web UI

**Description:**
Standalone assessment page at `/assess` for running complexity assessments anytime.

**Acceptance Criteria:**

- [ ] Create page: `app/assess/page.tsx`
- [ ] Form with 8 assessment criteria inputs
- [ ] Real-time assessment calculation
- [ ] Visual display: level badge, score progress bar, criteria breakdown
- [ ] Export buttons (Download Markdown, Copy JSON)
- [ ] Save to project (creates scale-assessment.md)
- [ ] Responsive design and dark mode

**Page Layout:**

```
┌─────────────────────────────────────────────┐
│  Project Complexity Assessment               │
├─────────────────────────────────────────────┤
│  [Input Form: 8 criteria]                   │
│                                              │
│  ┌───────────────────────────────┐          │
│  │  Level 3  (Complex System)    │          │
│  │  Score: 25/40  [====------]   │          │
│  └───────────────────────────────┘          │
│                                              │
│  Criteria Breakdown:                         │
│  ├─ Project Size: 5/5    ████████           │
│  ├─ Team Size: 4/5       ███████░           │
│  ├─ Integrations: 3/5    █████░░░           │
│  └─ ...                                      │
│                                              │
│  [Download Report] [Copy JSON] [Save]       │
└─────────────────────────────────────────────┘
```

**Files:**

- Create: `app/assess/page.tsx`
- Create: `components/features/AssessmentForm.tsx`
- Create: `components/features/AssessmentResult.tsx`

---

#### STORY-V3-010: Add Manual Override Functionality

**Points:** 2 | **Priority:** P0 | **Type:** Enhancement

**Description:**
Allow users to manually select planning level with reason capture.

**Acceptance Criteria:**

- [ ] Override option in workflow (Step 4: Confirm Planning Level)
- [ ] Override option in Web UI (assessment widget, assessment page)
- [ ] Override reason input (textarea, optional)
- [ ] Save override to assessment report
- [ ] CLI flag: `madace plan --level=2 --reason="Team preference"`
- [ ] Track override metrics (% of assessments overridden)

**Override Flow:**

```yaml
# In route-workflow.yaml
- name: 'Confirm Planning Level'
  action: elicit
  prompt: |
    Recommended Level ${COMPLEXITY_LEVEL} based on your project characteristics.

    This includes:
    ${LEVEL_DOCS_LIST}

    Options:
    1. Proceed with Level ${COMPLEXITY_LEVEL} (recommended)
    2. Choose a different level manually
    3. View detailed assessment report

    Your choice?
  output_var: 'USER_CHOICE'

- name: 'Handle Manual Override'
  action: elicit
  condition: "${USER_CHOICE} === '2'"
  prompts:
    - 'Select level (0-4):'
    - 'Reason for override (optional):'
  output_var: 'MANUAL_OVERRIDE'
```

**Files:**

- Update: `workflows/route-workflow.yaml`
- Update: `lib/workflows/complexity-assessment.ts` (save override)
- Update: `templates/scale-assessment.hbs` (show override info)

---

## EPIC-V3-002: Universal Workflow Status Checker (21 points, 11 stories)

### Phase 1: Status Provider System (Week 4)

#### STORY-V3-011: Create IStatusProvider Interface

**Points:** 2 | **Priority:** P0 | **Type:** Core Feature

**Description:**
Define status provider interface and base implementation for unified status checking.

**Acceptance Criteria:**

- [ ] Create `IStatusProvider` interface
- [ ] Create `BaseStatusProvider` abstract class
- [ ] Create `StatusResult` interface
- [ ] Create status provider registry
- [ ] Documentation: Provider architecture and extension guide

**Technical Notes:**

```typescript
// lib/status/provider-interface.ts
export interface IStatusProvider {
  entityType: 'epic' | 'story' | 'workflow' | 'state-machine';
  name: string;
  detectEntity(input: string): boolean;
  getStatus(entityId?: string): Promise<StatusResult>;
}

export interface StatusResult {
  entityType: string;
  entityId?: string;
  status: 'active' | 'completed' | 'blocked' | 'pending' | 'error';
  details: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export abstract class BaseStatusProvider implements IStatusProvider {
  abstract entityType: string;
  abstract name: string;

  abstract detectEntity(input: string): boolean;
  abstract getStatus(entityId?: string): Promise<StatusResult>;

  protected formatStatus(data: any): StatusResult {
    // Common formatting logic
  }
}

// lib/status/registry.ts
class StatusProviderRegistry {
  private providers: IStatusProvider[] = [];

  register(provider: IStatusProvider): void {
    this.providers.push(provider);
  }

  async getStatus(input: string): Promise<StatusResult> {
    const provider = this.providers.find((p) => p.detectEntity(input));
    if (!provider) throw new Error(`No provider for: ${input}`);
    return await provider.getStatus(input);
  }
}
```

**Files:**

- Create: `lib/status/provider-interface.ts`
- Create: `lib/status/base-provider.ts`
- Create: `lib/status/registry.ts`
- Create: `lib/status/types.ts`

---

#### STORY-V3-012: Implement StoryStatusProvider

**Points:** 3 | **Priority:** P0 | **Type:** Core Feature

**Description:**
Status provider for checking story state from mam-workflow-status.md.

**Acceptance Criteria:**

- [ ] Extend BaseStatusProvider
- [ ] Parse mam-workflow-status.md
- [ ] Find story by ID (support patterns: F11, STORY-F11, F11-SUB-WORKFLOWS)
- [ ] Return: state, title, points, milestone, assigned agent, dates
- [ ] Handle story not found error
- [ ] Unit tests: 90%+ coverage

**Implementation:**

```typescript
// lib/status/providers/story-status-provider.ts
export class StoryStatusProvider extends BaseStatusProvider {
  entityType = 'story';
  name = 'Story Status Provider';

  detectEntity(input: string): boolean {
    // Match patterns: F11, STORY-F11, F11-SUB-WORKFLOWS
    return /^(STORY-)?[A-Z]+\d+(-[\w-]+)?$/i.test(input);
  }

  async getStatus(storyId: string): Promise<StatusResult> {
    const statusFile = await this.loadStatusFile();
    const story = this.findStory(statusFile, storyId);

    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    return {
      entityType: 'story',
      entityId: story.id,
      status: this.mapState(story.state),
      details: {
        title: story.title,
        points: story.points,
        state: story.state,
        milestone: story.milestone,
        assignedTo: story.assignedTo,
        startedAt: story.startedAt,
        completedAt: story.completedAt,
      },
      timestamp: new Date(),
    };
  }

  private mapState(state: string): StatusResult['status'] {
    const mapping = {
      BACKLOG: 'pending',
      TODO: 'pending',
      IN_PROGRESS: 'active',
      DONE: 'completed',
    };
    return mapping[state] || 'pending';
  }
}
```

**Files:**

- Create: `lib/status/providers/story-status-provider.ts`
- Create: `__tests__/lib/status/providers/story-status-provider.test.ts`

---

#### STORY-V3-013: Implement EpicStatusProvider

**Points:** 3 | **Priority:** P0 | **Type:** Core Feature

**Description:**
Status provider for epic completion tracking.

**Acceptance Criteria:**

- [ ] Extend BaseStatusProvider
- [ ] Parse epic files from docs/v3-planning/epics/
- [ ] Calculate completion: (completed stories / total stories) × 100
- [ ] Return: epic title, description, story breakdown, tech spec status, completion %
- [ ] Support epic ID patterns: epic-001, EPIC-V3-001
- [ ] Unit tests: 90%+ coverage

**Implementation:**

```typescript
// lib/status/providers/epic-status-provider.ts
export class EpicStatusProvider extends BaseStatusProvider {
  entityType = 'epic';
  name = 'Epic Status Provider';

  detectEntity(input: string): boolean {
    return /^(EPIC-)?V?\d+-\d+$/i.test(input);
  }

  async getStatus(epicId: string): Promise<StatusResult> {
    const epicFile = await this.loadEpicFile(epicId);
    const stories = await this.getEpicStories(epicId);

    const totalStories = stories.length;
    const completedStories = stories.filter((s) => s.state === 'DONE').length;
    const completionPercent = Math.round((completedStories / totalStories) * 100);

    return {
      entityType: 'epic',
      entityId: epicId,
      status: completionPercent === 100 ? 'completed' : 'active',
      details: {
        title: epicFile.title,
        description: epicFile.description,
        totalStories,
        completedStories,
        completionPercent,
        stories: stories.map((s) => ({
          id: s.id,
          title: s.title,
          state: s.state,
          points: s.points,
        })),
        techSpecStatus: await this.checkTechSpec(epicId),
      },
      timestamp: new Date(),
    };
  }
}
```

**Files:**

- Create: `lib/status/providers/epic-status-provider.ts`
- Create: `__tests__/lib/status/providers/epic-status-provider.test.ts`

---

#### STORY-V3-014: Implement WorkflowStatusProvider

**Points:** 3 | **Priority:** P0 | **Type:** Core Feature

**Description:**
Status provider for workflow execution state.

**Acceptance Criteria:**

- [ ] Extend BaseStatusProvider
- [ ] Read workflow state files (`.*.state.json`)
- [ ] Return: current step, completed steps, pending steps, variables, last execution time
- [ ] Support workflow patterns: plan-project, create-story, route-workflow
- [ ] Handle workflow not found and not started errors
- [ ] Unit tests: 90%+ coverage

---

#### STORY-V3-015: Implement StateMachineStatusProvider

**Points:** 2 | **Priority:** P0 | **Type:** Core Feature

**Description:**
Status provider for overall state machine summary (Kanban view).

**Acceptance Criteria:**

- [ ] Extend BaseStatusProvider
- [ ] Parse mam-workflow-status.md
- [ ] Aggregate story counts by state (BACKLOG, TODO, IN_PROGRESS, DONE)
- [ ] Calculate total points per state
- [ ] Return: state breakdown, milestone summary, velocity metrics
- [ ] No entity ID needed (overview mode)
- [ ] Unit tests: 90%+ coverage

---

### Phase 2: CLI & API Integration (Week 5)

#### STORY-V3-016: Create `madace status` CLI Command

**Points:** 3 | **Priority:** P0 | **Type:** CLI

**Description:**
Main CLI command for status checking with context-aware entity detection.

**Acceptance Criteria:**

- [ ] Command: `madace status [entity]`
- [ ] Auto-detect entity type from input
- [ ] Display formatted output (default: table)
- [ ] Flags: `--format=table|json|markdown`, `--watch`
- [ ] Error handling for entity not found
- [ ] CLI integration tests

**CLI Usage:**

```bash
# Check story status
$ madace status F11-SUB-WORKFLOWS
┌─────────────────────────────────────────┐
│  Story: F11-SUB-WORKFLOWS               │
├─────────────────────────────────────────┤
│  State: IN_PROGRESS                     │
│  Points: 13                             │
│  Milestone: 2.0                         │
│  Started: 2025-10-22                    │
└─────────────────────────────────────────┘

# Check epic status
$ madace status EPIC-V3-001
Epic: Scale-Adaptive Workflow Router
Progress: 3/10 stories completed (30%)
Tech Spec: ✅ Generated

# State machine overview
$ madace status
┌──────────┬────────┬────────┐
│  State   │ Count  │ Points │
├──────────┼────────┼────────┤
│ BACKLOG  │   45   │  187   │
│ TODO     │    1   │   13   │
│ IN_PROG  │    1   │   13   │
│ DONE     │   40   │  218   │
└──────────┴────────┴────────┘
```

**Files:**

- Create: `lib/cli/commands/status.ts`
- Update: `lib/cli/index.ts`

---

#### STORY-V3-017: Add Context-Aware Entity Detection

**Points:** 2 | **Priority:** P0 | **Type:** Enhancement

**Description:**
Smart entity type detection from user input patterns.

**Acceptance Criteria:**

- [ ] Detect story IDs: F11, STORY-F11, F11-NAME
- [ ] Detect epic IDs: epic-001, EPIC-V3-001
- [ ] Detect workflows: plan-project, create-story
- [ ] Fallback to state machine if no entity ID provided
- [ ] Unit tests for all patterns

---

#### STORY-V3-018: Implement Watch Mode with Polling

**Points:** 3 | **Priority:** P0 | **Type:** CLI

**Description:**
Real-time status updates in terminal with 2-second polling.

**Acceptance Criteria:**

- [ ] Flag: `--watch` or `-w`
- [ ] Poll every 2 seconds
- [ ] Update display inline (clear + reprint)
- [ ] Show timestamp of last update
- [ ] Press 'q' to exit
- [ ] Handle Ctrl+C gracefully

---

#### STORY-V3-019: Create API Route GET /api/status/:type/:id

**Points:** 2 | **Priority:** P0 | **Type:** API

**Description:**
REST API endpoint for status checking from Web UI.

**Acceptance Criteria:**

- [ ] Route: `GET /api/status/:type/:id`
- [ ] Types: epic, story, workflow, state-machine
- [ ] Use status provider registry
- [ ] Return JSON StatusResult
- [ ] Error handling (404, 500)
- [ ] API integration tests

---

#### STORY-V3-020: Integrate WebSocket for Real-time Updates

**Points:** 3 | **Priority:** P0 | **Type:** Real-time

**Description:**
WebSocket integration for live status updates without polling.

**Acceptance Criteria:**

- [ ] WebSocket message type: `status_update`
- [ ] Broadcast on state transitions (story moved, workflow step completed)
- [ ] CLI watch mode uses WebSocket (no polling)
- [ ] Web UI status page auto-refreshes
- [ ] Connection health monitoring

---

#### STORY-V3-021: Create Web UI Status Dashboard Page

**Points:** 5 | **Priority:** P0 | **Type:** Web UI

**Description:**
Status dashboard at `/status` showing real-time project status.

**Acceptance Criteria:**

- [ ] Page: `app/status/page.tsx`
- [ ] State machine overview (Kanban summary)
- [ ] Recent activity feed (last 10 state changes)
- [ ] Quick status lookup (search input)
- [ ] Real-time updates via WebSocket
- [ ] Refresh button
- [ ] Responsive design and dark mode

---

## Summary

**Total Stories:** 21 stories  
**Total Effort:** 55 points  
**EPIC-V3-001:** 10 stories, 34 points  
**EPIC-V3-002:** 11 stories, 21 points

**Implementation Timeline:**

- Week 1: STORY-V3-001 to V3-003 (11 points)
- Week 2: STORY-V3-004 to V3-006 (18 points)
- Week 3: STORY-V3-007 to V3-010 (13 points)
- Week 4: STORY-V3-011 to V3-015 (13 points)
- Week 5: STORY-V3-016 to V3-021 (18 points)

**Total:** 5 weeks development + 3 weeks testing = 8 weeks for Priority 0

---

**Status:** 📋 Planning Complete - Ready for Implementation  
**Next Step:** Update mam-workflow-status.md with v3.0 milestones  
**Last Updated:** 2025-10-24

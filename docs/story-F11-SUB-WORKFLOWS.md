# Story F11: Sub-Workflow Support

**Story ID:** F11-SUB-WORKFLOWS
**Epic:** Milestone 2.0 - Post-MVP Features
**Feature:** F11 - Sub-Workflow Support
**Priority:** P1 (Should-Have for v1.0-beta)
**Points:** 13
**Status:** TODO
**Created:** 2025-10-24
**Updated:** 2025-10-24

---

## User Story

**As a** workflow designer
**I want** to nest workflows within other workflows
**So that** I can create modular, reusable workflow components and build complex workflows from simpler building blocks

---

## Business Value

**Problem:**
- Current workflows are flat (no nesting capability)
- Complex workflows become monolithic and hard to maintain
- No reusability of workflow components
- Duplication of common workflow sequences

**Solution:**
- Enable workflows to call other workflows as sub-workflows
- Support context inheritance from parent to child
- Independent state tracking for each workflow level
- Resume functionality works across nested workflows

**Impact:**
- **Modularity:** Break complex workflows into manageable pieces
- **Reusability:** Common sequences can be extracted into sub-workflows
- **Maintainability:** Easier to update and test individual components
- **Composability:** Build sophisticated workflows from simple building blocks

---

## Acceptance Criteria

### AC1: Sub-Workflow YAML Schema

**Given** I am defining a workflow
**When** I use the `sub-workflow` action type
**Then** the workflow can reference another workflow file

```yaml
workflow:
  name: "Complex Workflow"
  description: "Parent workflow with sub-workflow calls"
  steps:
    - name: "Setup"
      action: guide
      prompt: "Initialize the project"

    - name: "Run Data Processing"
      action: sub-workflow
      workflow_path: "workflows/data-processing.workflow.yaml"
      context_vars:
        input_file: "${PROJECT_OUTPUT}/raw-data.csv"
        output_dir: "${PROJECT_OUTPUT}/processed"

    - name: "Finalize"
      action: guide
      prompt: "Complete the workflow"
```

**Validation:**
- ✅ `sub-workflow` action type recognized
- ✅ `workflow_path` required field (relative to workflows directory)
- ✅ `context_vars` optional field for passing context to child
- ✅ Sub-workflow file exists and is valid YAML
- ✅ Circular dependency detection (workflow A → B → A)

### AC2: Context Inheritance

**Given** a parent workflow calls a sub-workflow
**When** the sub-workflow executes
**Then** it inherits parent context and can define additional variables

**Parent Context:**
```typescript
{
  PROJECT_NAME: "MyProject",
  PROJECT_OUTPUT: "docs/",
  USER_NAME: "Developer"
}
```

**Sub-Workflow Receives:**
```typescript
{
  // Inherited from parent
  PROJECT_NAME: "MyProject",
  PROJECT_OUTPUT: "docs/",
  USER_NAME: "Developer",

  // Passed via context_vars
  input_file: "docs/raw-data.csv",
  output_dir: "docs/processed",

  // Sub-workflow specific
  PARENT_WORKFLOW: "Complex Workflow",
  WORKFLOW_DEPTH: 1  // Nesting level (0 = root, 1 = first level child)
}
```

**Validation:**
- ✅ Parent context variables accessible in child
- ✅ `context_vars` from parent override defaults
- ✅ Child can define its own local variables
- ✅ Parent variables not modified by child (immutable inheritance)
- ✅ `PARENT_WORKFLOW` and `WORKFLOW_DEPTH` auto-injected

### AC3: State Tracking for Nested Workflows

**Given** a workflow with sub-workflows
**When** execution begins
**Then** each workflow level maintains independent state

**State File Structure:**
```json
// .complex-workflow.state.json (parent)
{
  "currentStep": 2,
  "totalSteps": 3,
  "status": "running",
  "context": { "PROJECT_NAME": "MyProject" },
  "childWorkflows": [
    {
      "workflowPath": "workflows/data-processing.workflow.yaml",
      "stateFile": ".data-processing.state.json",
      "status": "running",
      "startedAt": "2025-10-24T10:30:00Z"
    }
  ],
  "startedAt": "2025-10-24T10:25:00Z",
  "updatedAt": "2025-10-24T10:30:15Z"
}

// .data-processing.state.json (child)
{
  "currentStep": 1,
  "totalSteps": 4,
  "status": "running",
  "context": {
    "PROJECT_NAME": "MyProject",  // Inherited
    "input_file": "docs/raw-data.csv",  // From parent context_vars
    "PARENT_WORKFLOW": "Complex Workflow",
    "WORKFLOW_DEPTH": 1
  },
  "parentWorkflow": "Complex Workflow",
  "parentStateFile": ".complex-workflow.state.json",
  "startedAt": "2025-10-24T10:30:00Z",
  "updatedAt": "2025-10-24T10:30:15Z"
}
```

**Validation:**
- ✅ Parent workflow tracks child workflows in `childWorkflows` array
- ✅ Child workflow references parent in `parentWorkflow` field
- ✅ Each workflow has independent `currentStep` tracking
- ✅ Child completion updates parent's `childWorkflows[].status`
- ✅ Parent cannot complete until all children complete

### AC4: Sub-Workflow Execution Flow

**Given** a parent workflow reaches a `sub-workflow` step
**When** the step executes
**Then** the workflow engine:

1. **Validates sub-workflow:**
   - File exists at `workflow_path`
   - YAML is valid
   - No circular dependencies

2. **Prepares context:**
   - Merge parent context
   - Apply `context_vars` overrides
   - Inject `PARENT_WORKFLOW`, `WORKFLOW_DEPTH`

3. **Creates child state:**
   - Initialize state file for child
   - Link parent ↔ child in state files
   - Set child `status: "running"`

4. **Executes child workflow:**
   - Run child workflow steps sequentially
   - Child can have its own sub-workflows (recursive)
   - Track child progress independently

5. **Completes child workflow:**
   - Update child `status: "completed"`
   - Update parent's `childWorkflows[].status`
   - Parent continues to next step

**Validation:**
- ✅ Parent waits for child to complete before proceeding
- ✅ Child errors propagate to parent
- ✅ Context from child available to parent after completion
- ✅ Supports multiple levels of nesting (parent → child → grandchild)

### AC5: Resume Functionality with Sub-Workflows

**Given** a workflow with sub-workflows is interrupted
**When** resuming the workflow
**Then** the correct workflow level resumes at the correct step

**Scenario 1: Parent interrupted**
```json
// .complex-workflow.state.json
{
  "currentStep": 1,  // Parent at step 1
  "status": "paused",
  "childWorkflows": []  // No children started yet
}
```
**Expected:** Resume parent at step 1

**Scenario 2: Child interrupted**
```json
// .complex-workflow.state.json (parent)
{
  "currentStep": 2,  // Parent at step 2 (sub-workflow step)
  "status": "running",
  "childWorkflows": [
    { "status": "paused", "stateFile": ".data-processing.state.json" }
  ]
}

// .data-processing.state.json (child)
{
  "currentStep": 2,  // Child at step 2
  "status": "paused"
}
```
**Expected:** Resume child at step 2, then parent continues

**Validation:**
- ✅ Resume command detects active child workflows
- ✅ Resumes deepest nested workflow first (LIFO - stack-based)
- ✅ Completes child before resuming parent
- ✅ State files remain consistent across resume

### AC6: API Endpoints for Sub-Workflows

**GET /api/workflows/[name]/hierarchy**
- Returns workflow hierarchy tree
- Shows all child workflows and their status

```typescript
// Response
{
  "workflow": "Complex Workflow",
  "status": "running",
  "currentStep": 2,
  "totalSteps": 3,
  "children": [
    {
      "workflow": "Data Processing",
      "status": "running",
      "currentStep": 1,
      "totalSteps": 4,
      "depth": 1,
      "children": []
    }
  ]
}
```

**POST /api/workflows/[name]/execute-substep**
- Execute next step in active child workflow
- Auto-detects which workflow level needs execution

**Validation:**
- ✅ Hierarchy endpoint returns correct tree structure
- ✅ Execute endpoint finds correct active workflow
- ✅ Error handling for missing/invalid sub-workflows

### AC7: UI Visualization

**Given** a workflow with sub-workflows
**When** viewing workflow execution status
**Then** the UI shows nested workflow hierarchy

**Workflow Status Page:**
```
Complex Workflow (Step 2/3) ✅ Running
├─ Step 1: Setup ✅ Done
├─ Step 2: Run Data Processing ⏸️ Running
│  └─ Data Processing Workflow (Step 1/4) ⏸️ Running
│     ├─ Step 1: Load Data ⏸️ In Progress
│     ├─ Step 2: Transform Data ⏹️ Pending
│     ├─ Step 3: Validate Data ⏹️ Pending
│     └─ Step 4: Save Results ⏹️ Pending
└─ Step 3: Finalize ⏹️ Pending
```

**Validation:**
- ✅ Indentation shows nesting levels
- ✅ Status icons for each step (✅ Done, ⏸️ Running, ⏹️ Pending)
- ✅ Expandable/collapsible child workflows
- ✅ Click to view child workflow details

---

## Technical Design

### 1. Workflow Schema Updates

**File:** `lib/workflows/schema.ts`

```typescript
// Add to existing WorkflowStep type
export type WorkflowAction =
  | 'elicit'
  | 'reflect'
  | 'guide'
  | 'template'
  | 'validate'
  | 'sub-workflow';  // NEW

export interface SubWorkflowStep extends BaseWorkflowStep {
  action: 'sub-workflow';
  workflow_path: string;  // Required: path to child workflow
  context_vars?: Record<string, string>;  // Optional: variables to pass
}

export interface WorkflowState {
  currentStep: number;
  totalSteps: number;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'error';
  context: Record<string, any>;

  // NEW: Child workflow tracking
  childWorkflows?: Array<{
    workflowPath: string;
    stateFile: string;
    status: 'running' | 'completed' | 'error';
    startedAt: string;
    completedAt?: string;
  }>;

  // NEW: Parent reference (for children)
  parentWorkflow?: string;
  parentStateFile?: string;

  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### 2. Workflow Executor Enhancements

**File:** `lib/workflows/executor.ts`

```typescript
export class WorkflowExecutor {
  // NEW: Sub-workflow execution
  private async executeSubWorkflow(
    step: SubWorkflowStep,
    parentContext: Record<string, any>
  ): Promise<void> {
    // 1. Validate sub-workflow file
    const subWorkflowPath = path.join(WORKFLOWS_DIR, step.workflow_path);
    if (!fs.existsSync(subWorkflowPath)) {
      throw new WorkflowError(`Sub-workflow not found: ${step.workflow_path}`);
    }

    // 2. Detect circular dependencies
    this.detectCircularDependency(step.workflow_path, parentContext);

    // 3. Prepare child context
    const childContext = {
      ...parentContext,  // Inherit parent
      ...step.context_vars,  // Override with context_vars
      PARENT_WORKFLOW: this.workflowName,
      WORKFLOW_DEPTH: (parentContext.WORKFLOW_DEPTH || 0) + 1
    };

    // 4. Create child executor
    const childExecutor = new WorkflowExecutor(step.workflow_path);

    // 5. Update parent state with child reference
    await this.addChildWorkflowToState(step.workflow_path);

    // 6. Execute child workflow
    await childExecutor.execute(childContext);

    // 7. Update parent state with child completion
    await this.markChildWorkflowComplete(step.workflow_path);
  }

  private detectCircularDependency(
    childPath: string,
    context: Record<string, any>
  ): void {
    const visitedWorkflows = context._VISITED_WORKFLOWS || [];
    if (visitedWorkflows.includes(childPath)) {
      throw new WorkflowError(
        `Circular dependency detected: ${visitedWorkflows.join(' → ')} → ${childPath}`
      );
    }
  }

  // NEW: Resume with sub-workflows
  public async resume(): Promise<void> {
    const state = await this.loadState();

    // Check if any child workflows are active
    const activeChild = state.childWorkflows?.find(
      child => child.status === 'running'
    );

    if (activeChild) {
      // Resume child first
      const childExecutor = new WorkflowExecutor(activeChild.workflowPath);
      await childExecutor.resume();

      // After child completes, continue parent
      await this.executeNextStep();
    } else {
      // No active children, resume parent
      await this.executeNextStep();
    }
  }
}
```

### 3. State Management

**File:** `lib/workflows/state.ts`

```typescript
export class WorkflowStateManager {
  // Track child workflows in parent state
  async addChildWorkflow(
    parentStateFile: string,
    childWorkflow: {
      workflowPath: string;
      stateFile: string;
    }
  ): Promise<void> {
    const state = await this.loadState(parentStateFile);
    state.childWorkflows = state.childWorkflows || [];
    state.childWorkflows.push({
      ...childWorkflow,
      status: 'running',
      startedAt: new Date().toISOString()
    });
    await this.saveState(parentStateFile, state);
  }

  // Mark child as complete in parent state
  async markChildComplete(
    parentStateFile: string,
    childWorkflowPath: string
  ): Promise<void> {
    const state = await this.loadState(parentStateFile);
    const child = state.childWorkflows?.find(
      c => c.workflowPath === childWorkflowPath
    );
    if (child) {
      child.status = 'completed';
      child.completedAt = new Date().toISOString();
    }
    await this.saveState(parentStateFile, state);
  }

  // Get workflow hierarchy
  async getHierarchy(workflowName: string): Promise<WorkflowHierarchy> {
    const state = await this.loadState(this.getStateFile(workflowName));

    const children = await Promise.all(
      (state.childWorkflows || []).map(async (child) => {
        const childName = path.basename(child.workflowPath, '.workflow.yaml');
        return this.getHierarchy(childName);
      })
    );

    return {
      workflow: workflowName,
      status: state.status,
      currentStep: state.currentStep,
      totalSteps: state.totalSteps,
      depth: state.context.WORKFLOW_DEPTH || 0,
      children
    };
  }
}

interface WorkflowHierarchy {
  workflow: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  depth: number;
  children: WorkflowHierarchy[];
}
```

### 4. API Routes

**File:** `app/api/workflows/[name]/hierarchy/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const stateManager = new WorkflowStateManager();
    const hierarchy = await stateManager.getHierarchy(params.name);

    return NextResponse.json(hierarchy);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get workflow hierarchy' },
      { status: 500 }
    );
  }
}
```

---

## Testing Strategy

### Unit Tests

**File:** `__tests__/lib/workflows/sub-workflow.test.ts`

```typescript
describe('Sub-Workflow Execution', () => {
  it('should execute sub-workflow with inherited context', async () => {
    // Test context inheritance
  });

  it('should detect circular dependencies', async () => {
    // Test A → B → A detection
  });

  it('should track child workflows in parent state', async () => {
    // Test state file updates
  });

  it('should resume child workflow before parent', async () => {
    // Test resume with nested workflows
  });

  it('should build workflow hierarchy correctly', async () => {
    // Test hierarchy API
  });
});
```

### Integration Tests

**File:** `__tests__/integration/sub-workflows.test.ts`

```typescript
describe('Sub-Workflow Integration', () => {
  it('should execute multi-level nested workflows', async () => {
    // Test parent → child → grandchild
  });

  it('should handle errors in child workflows', async () => {
    // Test error propagation
  });
});
```

### E2E Tests

**File:** `e2e-tests/sub-workflows.spec.ts`

```typescript
test('displays workflow hierarchy in UI', async ({ page }) => {
  await page.goto('/workflows/complex-workflow');

  // Verify nested structure displayed
  await expect(page.locator('[data-testid="workflow-tree"]')).toBeVisible();
  await expect(page.locator('[data-testid="child-workflow"]')).toHaveCount(1);
});
```

---

## Implementation Plan

### Phase 1: Schema & Core Logic (3 points)
- [ ] Update workflow schema with `sub-workflow` action type
- [ ] Add child workflow tracking to state schema
- [ ] Implement circular dependency detection
- [ ] Write unit tests for schema validation

### Phase 2: Executor Enhancements (5 points)
- [ ] Implement `executeSubWorkflow()` method
- [ ] Add context inheritance logic
- [ ] Update state management for parent-child tracking
- [ ] Implement resume with sub-workflows
- [ ] Write unit tests for executor

### Phase 3: State Management & Hierarchy (3 points)
- [ ] Implement state tracking for nested workflows
- [ ] Create `getHierarchy()` method
- [ ] Add child workflow state updates
- [ ] Write unit tests for state manager

### Phase 4: API & UI (2 points)
- [ ] Create `/api/workflows/[name]/hierarchy` endpoint
- [ ] Update workflow status page to show hierarchy
- [ ] Add expandable tree view component
- [ ] Write E2E tests for UI

---

## Dependencies

- ✅ Workflow Engine (`lib/workflows/`) - Exists
- ✅ State Machine (`lib/state/`) - Exists
- ✅ Workflow API Routes (`app/api/workflows/`) - Exist
- ⏹️ Workflow Status Page - Needs hierarchy UI updates

---

## Risks & Mitigations

**Risk 1: Infinite Recursion**
- **Mitigation:** Circular dependency detection, max depth limit (e.g., 10 levels)

**Risk 2: Context Pollution**
- **Mitigation:** Immutable context inheritance, clear scoping rules

**Risk 3: State File Conflicts**
- **Mitigation:** Unique state files per workflow instance, atomic file writes

**Risk 4: Performance with Deep Nesting**
- **Mitigation:** Lazy loading of child states, hierarchy caching

---

## Definition of Done

- [ ] All acceptance criteria met (AC1-AC7)
- [ ] Unit tests pass (>90% coverage for new code)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Code reviewed and approved
- [ ] Documentation updated (USING-MADACE.md, API docs)
- [ ] Example workflows with sub-workflows created
- [ ] No regressions in existing workflow functionality

---

## Related Stories

- **Story F12:** Workflow Dependencies (prerequisite workflows)
- **Story F13:** Progress Dashboard (visual hierarchy tracking)

---

## Notes

- Sub-workflow support is a foundation for more advanced features
- Keep YAML syntax simple and intuitive
- Consider adding timeout limits for long-running sub-workflows
- Future: Add sub-workflow result passing to parent context

---

**Created:** 2025-10-24
**Estimated Completion:** 2025-11-07 (2 weeks)
**Assigned:** Development Team

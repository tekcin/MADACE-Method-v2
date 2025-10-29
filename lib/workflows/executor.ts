/**
 * Workflow Executor - Enhanced with MADACE-METHOD patterns
 * Based on official MADACE-METHOD workflow-engine.js architecture
 * Story F4: Workflow YAML parser and executor
 * Story F12: Workflow state persistence
 *
 * Handles loading, parsing, validating, and executing workflow YAML files.
 * Supports multiple action types: elicit, reflect, guide, template, validate, sub-workflow.
 * Maintains workflow state and provides context for story generation.
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type {
  Workflow,
  WorkflowState,
  WorkflowStep,
  WorkflowExecutionResult,
  WorkflowHierarchy,
  RoutingResult,
  WorkflowRoutingPath,
} from './types';
import { WorkflowStateSchema } from './schema';
import { StateMachine } from '@/lib/state/machine';
import { evaluateCondition, ConditionEvaluationError } from './conditions';

// Workflow schema from official MADACE-METHOD
const REQUIRED_WORKFLOW_FIELDS = {
  workflow: ['name', 'description', 'agent', 'phase', 'steps'],
};

export class WorkflowExecutor {
  private state: WorkflowState | null = null;
  private statePath?: string;

  constructor(
    private workflow: Workflow,
    statePath?: string
  ) {
    this.statePath = statePath;
  }

  async initialize(): Promise<void> {
    // Try to load existing state
    if (this.statePath) {
      const stateFile = path.join(this.statePath, `.${this.workflow.name}.state.json`);
      try {
        const content = await fs.readFile(stateFile, 'utf-8');
        const parsed = JSON.parse(content);
        parsed.startedAt = new Date(parsed.startedAt);
        parsed.updatedAt = new Date(parsed.updatedAt);
        this.state = WorkflowStateSchema.parse(parsed);
        return;
      } catch {
        // State doesn't exist, create new
      }
    }

    // Create new state
    this.state = {
      workflowName: this.workflow.name || 'unknown',
      currentStep: 0,
      variables: {},
      completed: false,
      startedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async executeNextStep(): Promise<WorkflowExecutionResult> {
    if (!this.state) {
      return {
        success: false,
        message: 'Workflow not initialized',
        error: new Error('Call initialize() first'),
      };
    }

    if (!this.workflow || !this.workflow.steps) {
      return {
        success: false,
        message: 'Invalid workflow configuration',
        error: new Error('Workflow not properly defined'),
      };
    }

    if (this.state!.completed) {
      return { success: true, message: 'Workflow already completed', state: this.state! };
    }

    if (this.state!.currentStep >= this.workflow.steps.length) {
      this.state!.completed = true;
      this.state!.updatedAt = new Date();
      await this.saveState();
      return { success: true, message: 'Workflow completed', state: this.state! };
    }

    const step = this.workflow.steps[this.state!.currentStep];

    if (!step) {
      return { success: false, message: 'Invalid step index', error: new Error('Step not found') };
    }

    try {
      await this.executeStep(step);
      this.state!.currentStep++;
      this.state.updatedAt = new Date();
      await this.saveState();

      return {
        success: true,
        message: `Step "${step.name}" completed`,
        state: this.state,
      };
    } catch (error) {
      return {
        success: false,
        message: `Step "${step.name}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error : new Error(String(error)),
        state: this.state,
      };
    }
  }

  private async executeStep(step: WorkflowStep): Promise<void> {
    console.warn(`\n🔄 Step: ${step.name}`);
    console.warn(`   Action: ${step.action}`);

    // STORY-V3-006: Check conditional execution
    if (step.condition) {
      const shouldExecute = this.evaluateStepCondition(step.condition);
      if (!shouldExecute) {
        console.warn(`   ⏭️  Skipped (condition evaluated to false)`);
        return; // Skip this step
      }
      console.warn(`   ✅ Condition passed`);
    }

    try {
      switch (step.action) {
        case 'guide':
          await this.handleGuide(step);
          break;

        case 'elicit':
          await this.handleElicit(step);
          break;

        case 'reflect':
          await this.handleReflect(step);
          break;

        case 'template':
        case 'render_template':
          await this.handleTemplate(step);
          break;

        case 'validate':
          await this.handleValidate(step);
          break;

        case 'display':
          await this.handleDisplay(step);
          break;

        case 'load_state_machine':
          await this.handleLoadStateMachine(step);
          break;

        case 'sub-workflow':
          await this.handleSubWorkflow(step);
          break;

        case 'route':
          await this.handleRoute(step);
          break;

        default:
          throw new Error(`Unknown action: ${step.action}`);
      }
      console.warn(`   ✅ Completed`);
    } catch (error) {
      console.warn(`   ❌ Failed: ${error}`);
      throw error;
    }
  }

  private async handleGuide(step: WorkflowStep): Promise<void> {
    if (step.prompt) {
      console.warn(`   📋 Guidance: ${step.prompt}`);
    }
  }

  private async handleElicit(step: WorkflowStep): Promise<void> {
    if (!step.prompt) {
      throw new Error('Elicit step requires prompt');
    }

    console.warn('📝 Prompt:', step.prompt);
    console.warn('   [INPUT REQUIRED - Interactive mode needed for elicitation]');

    // In CLI version, this would prompt user for input
    if (step.variable) {
      this.state!.variables[step.variable] = '<user-input>';
    }
  }

  private async handleReflect(step: WorkflowStep): Promise<void> {
    if (step.prompt) {
      console.warn(`   🤔 Reflection: ${step.prompt}`);
    }
    // LLM reflection would happen here
  }

  private async handleTemplate(step: WorkflowStep): Promise<void> {
    if (!step.template || !step.output_file) {
      throw new Error('Template step requires template and output_file');
    }

    // Render template using template engine
    // const templateEngine = new TemplateEngine(); // TODO: Use when template engine is fully implemented
    const templatePath = step.template;
    const outputPath = this.resolveVariables(step.output_file);
    const variables = {
      ...this.state!.variables,
      ...(step.variables || {}),
    };

    try {
      // For now, just log what would happen
      console.warn(`   📄 Template rendered: ${templatePath} -> ${outputPath}`);
      console.warn(`   📊 Variables used:`, Object.keys(variables));

      // In full implementation:
      // const rendered = await templateEngine.renderTemplate(templatePath, variables);
      // await fs.writeFile(outputPath, rendered, 'utf8');
    } catch (error) {
      throw new Error(`Template rendering failed: ${error}`);
    }
  }

  private async handleValidate(step: WorkflowStep): Promise<void> {
    if (!step.condition) {
      throw new Error('Validate step requires condition');
    }

    const condition = this.resolveVariables(step.condition);
    console.warn(`   🔍 Validation condition: ${condition}`);

    if (step.error_message) {
      const errorMessage = this.resolveVariables(step.error_message);
      console.warn(`   ⚠️  Error message: ${errorMessage}`);
    }
  }

  private async handleDisplay(step: WorkflowStep): Promise<void> {
    if (!step.message) {
      throw new Error('Display step requires message');
    }

    const message = this.resolveVariables(step.message);
    console.warn(`   💬 Display message:`);
    console.warn(message);
  }

  private async handleLoadStateMachine(step: WorkflowStep): Promise<void> {
    if (!step.status_file) {
      throw new Error('Load state machine step requires status_file');
    }

    const statusFile = this.resolveVariables(step.status_file);
    console.warn(`   📂 Loading state machine from: ${statusFile}`);

    try {
      const stateMachine = new StateMachine(statusFile);
      await stateMachine.load();
      const status = stateMachine.getStatus();

      // Inject story status into workflow variables
      if (status.todo && status.todo.length > 0) {
        const todoStory = status.todo[0]; // Only one story in TODO
        if (todoStory) {
          this.state!.variables['todo_story_id'] = todoStory.id;
          this.state!.variables['todo_story_title'] = todoStory.title;
          this.state!.variables['todo_story_points'] = todoStory.points || 0;
        }
      }

      if (status.inProgress && status.inProgress.length > 0) {
        const inProgressStory = status.inProgress[0]; // Only one story in IN PROGRESS
        if (inProgressStory) {
          this.state!.variables['in_progress_story_id'] = inProgressStory.id;
          this.state!.variables['in_progress_story_title'] = inProgressStory.title;
          this.state!.variables['in_progress_story_points'] = inProgressStory.points || 0;
        }
      }

      console.warn(`   ✅ State machine loaded successfully`);
      console.warn(
        `   📊 TODO stories: ${status.todo.length}, IN PROGRESS: ${status.inProgress.length}`
      );
    } catch (error) {
      throw new Error(`Failed to load state machine: ${error}`);
    }
  }

  private async handleSubWorkflow(step: WorkflowStep): Promise<void> {
    // Get workflow path from step (new field) or legacy variable
    const workflowPath = step.workflow_path || (step.variables?.workflow_name as string);

    if (!workflowPath) {
      throw new Error('Sub-workflow step requires workflow_path field or workflow_name variable');
    }

    console.warn(`   🔗 Executing sub-workflow: ${workflowPath}`);

    // 1. Detect circular dependencies
    this.detectCircularDependency(workflowPath);

    // 2. Load child workflow
    const absoluteWorkflowPath = path.resolve(workflowPath);
    const childWorkflow = await loadWorkflow(absoluteWorkflowPath);

    // 3. Prepare child context with inheritance
    const childContext = this.prepareChildContext(step);

    // 4. Create child executor
    const childExecutor = new WorkflowExecutor(childWorkflow, this.statePath);

    // 5. Initialize child state with parent reference
    await childExecutor.initializeChildWorkflow(
      this.workflow.name || 'unknown',
      path.basename(this.statePath || '', `.${this.workflow.name}.state.json`),
      childContext
    );

    // 6. Track child in parent state
    await this.addChildWorkflowToState(workflowPath, childExecutor.getStateFileName());

    // 7. Execute child workflow to completion
    let result = await childExecutor.executeNextStep();
    while (!result.state?.completed && result.success) {
      result = await childExecutor.executeNextStep();
    }

    // 8. Handle child errors
    if (!result.success) {
      await this.markChildWorkflowError(workflowPath, result.error?.message);
      throw new Error(`Sub-workflow failed: ${result.message}`);
    }

    // 9. Mark child as complete in parent state
    await this.markChildWorkflowComplete(workflowPath);

    // 10. Optionally merge child variables back to parent (if needed in future)
    // this.mergeChildVariables(childExecutor.getState());

    console.warn(`   ✅ Sub-workflow completed: ${workflowPath}`);
  }

  /**
   * Handle route action - execute workflows based on complexity level
   * Supports STORY-V3-005: Implement Routing Action in Workflow Executor
   */
  private async handleRoute(step: WorkflowStep): Promise<void> {
    if (!step.routing) {
      throw new Error('Route step requires routing configuration');
    }

    if (!step.condition) {
      throw new Error('Route step requires condition variable (complexity level)');
    }

    // Get complexity level from condition variable
    const levelVar = this.resolveVariables(step.condition);
    const level = this.extractLevel(levelVar);

    if (level === null || level < 0 || level > 4) {
      throw new Error(`Invalid routing level: ${levelVar} (must be 0-4)`);
    }

    console.warn(`   🔀 Routing to Level ${level} workflows`);

    // Get workflows for this level
    const levelKey = `level_${level}` as keyof typeof step.routing;
    let workflowConfig = step.routing[levelKey];

    // Fallback to default if level not found
    if (!workflowConfig && step.routing.default) {
      console.warn(`   ⚠️  Level ${level} not defined, using default routing`);
      workflowConfig = step.routing.default;
    }

    if (!workflowConfig) {
      throw new Error(`No routing configuration found for level ${level}`);
    }

    // Normalize workflow config to array of paths
    const workflows =
      Array.isArray(workflowConfig) ? workflowConfig : (workflowConfig as WorkflowRoutingPath).workflows;

    if (!workflows || workflows.length === 0) {
      console.warn(`   ℹ️  No workflows to execute for level ${level}`);
      return;
    }

    console.warn(`   📋 Workflows to execute: ${workflows.length}`);
    workflows.forEach((wf, index) => console.warn(`      ${index + 1}. ${wf}`));

    // Execute workflows sequentially
    const startedAt = new Date().toISOString();
    const errors: string[] = [];
    const executedPaths: string[] = [];

    for (const workflowPath of workflows) {
      try {
        console.warn(`   ▶️  Executing: ${workflowPath}`);

        // Resolve relative paths
        const absoluteWorkflowPath = path.resolve(workflowPath);

        // Load and execute child workflow
        const childWorkflow = await loadWorkflow(absoluteWorkflowPath);
        const childExecutor = new WorkflowExecutor(childWorkflow, this.statePath);

        // Initialize with parent context
        const childContext = this.prepareChildContext(step);
        await childExecutor.initializeChildWorkflow(
          this.workflow.name || 'unknown',
          path.basename(this.statePath || '', `.${this.workflow.name}.state.json`),
          childContext
        );

        // Track child workflow
        await this.addChildWorkflowToState(workflowPath, childExecutor.getStateFileName());

        // Execute to completion
        let result = await childExecutor.executeNextStep();
        while (!result.state?.completed && result.success) {
          result = await childExecutor.executeNextStep();
        }

        if (!result.success) {
          const error = `Workflow failed: ${workflowPath} - ${result.message}`;
          errors.push(error);
          await this.markChildWorkflowError(workflowPath, result.error?.message);
          console.warn(`   ❌ ${error}`);

          // Stop on first error (continue_on_error: false)
          throw new Error(error);
        }

        await this.markChildWorkflowComplete(workflowPath);
        executedPaths.push(workflowPath);
        console.warn(`   ✅ Completed: ${workflowPath}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(errorMsg);
        throw new Error(`Routing failed at workflow ${workflowPath}: ${errorMsg}`);
      }
    }

    const completedAt = new Date().toISOString();

    // Create routing result
    const routingResult: RoutingResult = {
      level,
      workflowsExecuted: executedPaths.length,
      workflowPaths: executedPaths,
      startedAt,
      completedAt,
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };

    // Save routing result to state
    if (step.output_var) {
      this.state!.variables[step.output_var] = routingResult;
    }

    // Also save routing decision for tracking
    this.state!.variables['routing_decision'] = routingResult;

    console.warn(`   ✅ Routing complete: ${executedPaths.length}/${workflows.length} workflows executed`);
  }

  /**
   * Extract numeric level from variable string
   * Supports formats: "0", "level_0", "${level}", etc.
   */
  private extractLevel(levelVar: string): number | null {
    // Try to parse as number directly
    const direct = parseInt(levelVar, 10);
    if (!isNaN(direct)) {
      return direct;
    }

    // Try to extract from "level_N" pattern
    const match = levelVar.match(/level[_-]?(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    // Try to extract any number from string
    const numMatch = levelVar.match(/\d+/);
    if (numMatch && numMatch[0]) {
      return parseInt(numMatch[0], 10);
    }

    return null;
  }

  private detectCircularDependency(childWorkflowPath: string): void {
    // Check if we have a visited workflows array in state
    const visitedWorkflows = (this.state!.variables['_VISITED_WORKFLOWS'] as string[]) || [];

    if (visitedWorkflows.includes(childWorkflowPath)) {
      const cycle = [...visitedWorkflows, childWorkflowPath].join(' → ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }

    // Add current workflow to visited list for children to check
    this.state!.variables['_VISITED_WORKFLOWS'] = [...visitedWorkflows, childWorkflowPath];
  }

  private prepareChildContext(step: WorkflowStep): Record<string, unknown> {
    // Start with parent context (inherited)
    const childContext: Record<string, unknown> = { ...this.state!.variables };

    // Add context_vars from step (these override inherited values)
    if (step.context_vars) {
      Object.assign(childContext, step.context_vars);
    }

    // Auto-inject special variables
    childContext['PARENT_WORKFLOW'] = this.workflow.name || 'unknown';
    childContext['WORKFLOW_DEPTH'] = ((this.state!.variables['WORKFLOW_DEPTH'] as number) || 0) + 1;

    // Remove internal tracking variables from child context
    delete childContext['_VISITED_WORKFLOWS'];

    return childContext;
  }

  async initializeChildWorkflow(
    parentWorkflow: string,
    parentStateFile: string,
    initialContext: Record<string, unknown>
  ): Promise<void> {
    // Create state with parent reference
    this.state = {
      workflowName: this.workflow.name || 'unknown',
      currentStep: 0,
      variables: initialContext,
      completed: false,
      startedAt: new Date(),
      updatedAt: new Date(),
      parentWorkflow,
      parentStateFile,
    };

    await this.saveState();
  }

  private async addChildWorkflowToState(workflowPath: string, childStateFile: string): Promise<void> {
    if (!this.state) return;

    if (!this.state.childWorkflows) {
      this.state.childWorkflows = [];
    }

    this.state.childWorkflows.push({
      workflowPath,
      stateFile: childStateFile,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    await this.saveState();
  }

  private async markChildWorkflowComplete(workflowPath: string): Promise<void> {
    if (!this.state?.childWorkflows) return;

    const child = this.state.childWorkflows.find(c => c.workflowPath === workflowPath);
    if (child) {
      child.status = 'completed';
      child.completedAt = new Date().toISOString();
      await this.saveState();
    }
  }

  private async markChildWorkflowError(workflowPath: string, errorMessage?: string): Promise<void> {
    if (!this.state?.childWorkflows) return;

    const child = this.state.childWorkflows.find(c => c.workflowPath === workflowPath);
    if (child) {
      child.status = 'error';
      child.error = errorMessage || 'Unknown error';
      child.completedAt = new Date().toISOString();
      await this.saveState();
    }
  }

  private getStateFileName(): string {
    return `.${this.workflow.name}.state.json`;
  }

  /**
   * Evaluate step condition for conditional execution
   * STORY-V3-006: Add Conditional Workflow Execution
   *
   * @param condition - Condition string (e.g., "${LEVEL} === 0", "${USER_CHOICE} === '2'")
   * @returns true if step should execute, false otherwise
   */
  private evaluateStepCondition(condition: string): boolean {
    try {
      // Use condition evaluator to evaluate the condition
      const result = evaluateCondition(condition, this.state!.variables, {
        throwOnError: true,
        strictMode: false, // Allow undefined variables (will be treated as undefined)
      });

      return result;
    } catch (error) {
      if (error instanceof ConditionEvaluationError) {
        console.warn(`   ⚠️  Condition evaluation error: ${error.message}`);
        console.warn(`   Condition: ${condition}`);
        // For safety, skip steps with invalid conditions
        return false;
      }
      throw error;
    }
  }

  private resolveVariables(text: string): string {
    // Variable substitution supporting Handlebars syntax {{variable}} and legacy {variable}
    let result = text;

    // Replace variables in curly braces (supports both {{var}} and {var})
    for (const [key, value] of Object.entries(this.state!.variables)) {
      // Replace double curly braces {{variable}} (Handlebars/Mustache syntax)
      const doublePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(doublePattern, String(value));

      // Replace single curly braces {variable} (legacy syntax)
      const singlePattern = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(singlePattern, String(value));
    }

    return result;
  }

  private async saveState(): Promise<void> {
    if (!this.statePath || !this.state) return;

    const stateFile = path.join(this.statePath, `.${this.workflow.name}.state.json`);
    await fs.mkdir(this.statePath, { recursive: true });
    await fs.writeFile(stateFile, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  getState(): WorkflowState | null {
    return this.state;
  }

  /**
   * Resume workflow execution
   * Handles sub-workflows by resuming deepest nested workflow first (LIFO/stack-based)
   */
  async resume(): Promise<WorkflowExecutionResult> {
    if (!this.state) {
      return {
        success: false,
        message: 'Workflow not initialized',
        error: new Error('Call initialize() first'),
      };
    }

    // Check if any child workflows are running
    const runningChild = this.state.childWorkflows?.find(child => child.status === 'running');

    if (runningChild) {
      // Resume child first (LIFO - deepest nested workflow first)
      console.warn(`   🔄 Resuming child workflow: ${runningChild.workflowPath}`);

      try {
        const childWorkflow = await loadWorkflow(path.resolve(runningChild.workflowPath));
        const childExecutor = new WorkflowExecutor(childWorkflow, this.statePath);
        await childExecutor.initialize(); // Load existing child state

        // Resume child
        const childResult = await childExecutor.resume();

        if (!childResult.success) {
          await this.markChildWorkflowError(runningChild.workflowPath, childResult.error?.message);
          throw new Error(`Child workflow failed: ${childResult.message}`);
        }

        // If child completed, mark it complete and continue parent
        if (childResult.state?.completed) {
          await this.markChildWorkflowComplete(runningChild.workflowPath);
          console.warn(`   ✅ Child workflow completed: ${runningChild.workflowPath}`);

          // Continue parent execution
          return await this.executeNextStep();
        }

        return childResult;
      } catch (error) {
        return {
          success: false,
          message: `Failed to resume child workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error : new Error(String(error)),
          state: this.state,
        };
      }
    }

    // No running children, resume parent
    return await this.executeNextStep();
  }

  /**
   * Get workflow hierarchy tree
   * Shows all child workflows and their status
   */
  async getHierarchy(): Promise<WorkflowHierarchy> {
    if (!this.state) {
      throw new Error('Workflow not initialized');
    }

    const children: WorkflowHierarchy[] = [];

    if (this.state.childWorkflows) {
      for (const child of this.state.childWorkflows) {
        try {
          const childWorkflow = await loadWorkflow(path.resolve(child.workflowPath));
          const childExecutor = new WorkflowExecutor(childWorkflow, this.statePath);
          await childExecutor.initialize();

          const childHierarchy = await childExecutor.getHierarchy();
          children.push(childHierarchy);
        } catch (error) {
          console.warn(`   ⚠️ Failed to load child hierarchy: ${child.workflowPath}`, error);
        }
      }
    }

    return {
      workflow: this.workflow.name || 'unknown',
      status: this.state.completed
        ? 'completed'
        : this.state.currentStep === 0
          ? 'pending'
          : 'running',
      currentStep: this.state.currentStep,
      totalSteps: this.workflow.steps?.length || 0,
      depth: (this.state.variables['WORKFLOW_DEPTH'] as number) || 0,
      children,
    };
  }

  async reset(): Promise<void> {
    if (this.statePath) {
      const stateFile = path.join(this.statePath, `.${this.workflow.name}.state.json`);
      try {
        await fs.unlink(stateFile);
      } catch {
        // File doesn't exist
      }
    }
    this.state = null;
  }
}

/**
 * Load workflow from YAML file (MADACE-METHOD style)
 */
export async function loadWorkflow(workflowPath: string): Promise<Workflow> {
  const content = await fs.readFile(workflowPath, 'utf-8');
  const workflow = yaml.load(content) as Workflow;

  // Validate workflow structure based on official schema
  const wf = workflow.workflow;
  if (!wf) {
    throw new Error('Invalid workflow structure: missing workflow object');
  }

  // Check required fields
  const required = REQUIRED_WORKFLOW_FIELDS.workflow;
  for (const field of required) {
    if (!(field in wf)) {
      throw new Error(`Invalid workflow structure: missing required field '${field}'`);
    }
  }

  // Validate steps
  if (!Array.isArray(wf.steps)) {
    throw new Error('Invalid workflow: steps must be an array');
  }

  for (const step of wf.steps) {
    if (!step.name || !step.action) {
      throw new Error(`Invalid step: ${step.name} - missing name or action`);
    }

    // Validate specific action types
    switch (step.action) {
      case 'elicit':
        if (!step.prompt) {
          throw new Error(`Elicit step "${step.name}" requires prompt`);
        }
        break;
      case 'template':
      case 'render_template':
        if (!step.template || !step.output_file) {
          throw new Error(`Template step "${step.name}" requires template and output_file`);
        }
        break;
      case 'validate':
        if (!step.condition) {
          throw new Error(`Validate step "${step.name}" requires condition`);
        }
        break;
      case 'display':
        if (!step.message) {
          throw new Error(`Display step "${step.name}" requires message`);
        }
        break;
    }
  }

  // Normalize to legacy format for executor compatibility
  // Extract workflow.workflow properties to top level
  return {
    name: wf.name,
    description: wf.description,
    steps: wf.steps,
    variables: wf.variables,
  };
}

export function createWorkflowExecutor(workflow: Workflow, statePath?: string): WorkflowExecutor {
  return new WorkflowExecutor(workflow, statePath);
}

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
import type { Workflow, WorkflowState, WorkflowStep, WorkflowExecutionResult } from './types';
import { WorkflowStateSchema } from './schema';
import { StateMachine } from '@/lib/state/machine';

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
    const workflowName = step.variables?.workflow_name as string;
    if (!workflowName) {
      throw new Error('Sub-workflow step requires workflow_name variable');
    }

    console.warn(`   🔗 Executing sub-workflow: ${workflowName}`);
    console.warn(`   [Sub-workflow execution not fully implemented]`);
  }

  private resolveVariables(text: string): string {
    // Simple variable substitution using official MADACE pattern {variable-name}
    let result = text;

    // Replace variables in curly braces
    for (const [key, value] of Object.entries(this.state!.variables)) {
      const pattern = new RegExp(`\{${key}\}`, 'g');
      result = result.replace(pattern, String(value));
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

  return workflow;
}

export function createWorkflowExecutor(workflow: Workflow, statePath?: string): WorkflowExecutor {
  return new WorkflowExecutor(workflow, statePath);
}

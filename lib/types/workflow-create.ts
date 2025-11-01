/**
 * Workflow Creation Types
 *
 * Type definitions for the workflow creation wizard
 */

export type WorkflowActionType =
  | 'display'
  | 'reflect'
  | 'elicit'
  | 'template'
  | 'workflow'
  | 'sub-workflow'
  | 'route';

export interface WorkflowStepData {
  id: string; // Unique ID for React keys
  name: string;
  action: WorkflowActionType;

  // Action-specific fields
  message?: string; // For display
  prompt?: string; // For reflect/elicit
  variable?: string; // For elicit
  validation?: string; // For elicit (regex)
  model?: string; // For reflect
  max_tokens?: number; // For reflect
  temperature?: number; // For reflect
  store_as?: string; // For reflect
  template?: string; // For template
  output_file?: string; // For template
  workflow_name?: string; // For workflow/sub-workflow
  workflow_file?: string; // For sub-workflow
  condition?: string; // For conditional steps
  routes?: Record<string, string>; // For route action
  variables?: Record<string, unknown>; // For template/workflow
}

export interface WorkflowVariableData {
  id: string; // Unique ID for React keys
  name: string;
  value: string | number | boolean;
  description?: string;
}

export interface CreateWorkflowData {
  // Step 1: Basic Information
  name: string;
  description: string;
  agent: string;
  phase: number;

  // Step 2: Steps
  steps: WorkflowStepData[];

  // Step 3: Variables
  variables: WorkflowVariableData[];
}

export type CreateWorkflowStep = 'basic' | 'steps' | 'variables' | 'preview';

/**
 * Action type templates for quick step creation
 */
export const ACTION_TEMPLATES: Record<WorkflowActionType, Partial<WorkflowStepData>> = {
  display: {
    action: 'display',
    message: 'Enter your message here...',
  },
  reflect: {
    action: 'reflect',
    prompt: 'Enter your reflection prompt...',
    model: 'gemma3:latest',
    max_tokens: 500,
    temperature: 0.7,
    store_as: 'last_reflection',
  },
  elicit: {
    action: 'elicit',
    prompt: 'Enter the input prompt...',
    variable: 'user_input',
  },
  template: {
    action: 'template',
    template: 'templates/example.hbs',
    output_file: 'output/{{filename}}.md',
  },
  workflow: {
    action: 'workflow',
    workflow_name: 'example-workflow',
  },
  'sub-workflow': {
    action: 'sub-workflow',
    workflow_file: 'workflows/sub-workflow.yaml',
  },
  route: {
    action: 'route',
    routes: {
      'small': 'small-workflow',
      'medium': 'medium-workflow',
      'large': 'large-workflow',
    },
  },
};

/**
 * Action type descriptions for UI
 */
export const ACTION_DESCRIPTIONS: Record<WorkflowActionType, string> = {
  display: 'Show a message to the user',
  reflect: 'Get AI-generated response using LLM',
  elicit: 'Collect user input with optional validation',
  template: 'Render a Handlebars template to a file',
  workflow: 'Execute another workflow by name',
  'sub-workflow': 'Execute a workflow from a YAML file',
  route: 'Route to different workflows based on conditions',
};

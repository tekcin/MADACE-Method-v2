/**
 * Workflow Types
 */

export type WorkflowStepAction =
  | 'elicit'
  | 'reflect'
  | 'guide'
  | 'template'
  | 'render_template'
  | 'validate'
  | 'display'
  | 'load_state_machine'
  | 'sub-workflow'
  | 'api_call';

export interface WorkflowStep {
  name: string;
  action: WorkflowStepAction;
  content?: string;
  prompt?: string;
  variable?: string;
  template?: string;
  output_file?: string;
  condition?: string;
  error_message?: string;
  message?: string;
  status_file?: string;
  variables?: Record<string, unknown>;
  validation?: string;

  // Sub-workflow support
  subworkflow?: string; // Legacy field (deprecated, use workflow_path instead)
  workflow_path?: string; // Path to child workflow YAML file (required for sub-workflow action)
  context_vars?: Record<string, string>; // Variables to pass to child workflow
}

export interface Workflow {
  workflow?: {
    name: string;
    description: string;
    agent?: string;
    phase?: number;
    steps: WorkflowStep[];
    variables?: Record<string, unknown>;
  };

  // Legacy support
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
}

export interface WorkflowFile {
  workflow: Workflow;
}

export interface ChildWorkflowState {
  workflowPath: string; // Path to child workflow file
  stateFile: string; // State file name for child
  status: 'running' | 'completed' | 'error';
  startedAt: string; // ISO 8601 timestamp
  completedAt?: string; // ISO 8601 timestamp
  error?: string; // Error message if failed
}

export interface WorkflowState {
  workflowName: string;
  currentStep: number;
  variables: Record<string, unknown>;
  completed: boolean;
  startedAt: Date;
  updatedAt: Date;

  // Sub-workflow support
  childWorkflows?: ChildWorkflowState[]; // Child workflows tracked by parent
  parentWorkflow?: string; // Name of parent workflow (if this is a child)
  parentStateFile?: string; // State file of parent workflow (if this is a child)
}

export interface WorkflowExecutionResult {
  success: boolean;
  message: string;
  state?: WorkflowState;
  error?: Error;
}

export interface WorkflowHierarchy {
  workflow: string; // Workflow name
  status: 'pending' | 'running' | 'paused' | 'completed' | 'error';
  currentStep: number;
  totalSteps: number;
  depth: number; // Nesting level (0 = root, 1 = first-level child, etc.)
  children: WorkflowHierarchy[]; // Child workflows
}

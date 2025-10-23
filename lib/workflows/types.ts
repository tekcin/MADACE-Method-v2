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
  subworkflow?: string;
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

export interface WorkflowState {
  workflowName: string;
  currentStep: number;
  variables: Record<string, unknown>;
  completed: boolean;
  startedAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecutionResult {
  success: boolean;
  message: string;
  state?: WorkflowState;
  error?: Error;
}

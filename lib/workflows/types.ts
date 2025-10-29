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

/**
 * Complexity Assessment Types (v3.0 - Scale-Adaptive Workflow Router)
 */

export type ProjectSize = 'small' | 'medium' | 'large' | 'enterprise';
export type UserBase = 'internal' | 'small' | 'medium' | 'large';
export type SecurityRequirements = 'basic' | 'standard' | 'high' | 'critical';

export interface ComplexityAssessment {
  projectSize: ProjectSize; // Scale of project (small = single feature, enterprise = platform)
  teamSize: number; // Number of developers on the team
  existingCodebase: boolean; // Is this a greenfield or brownfield project?
  codebaseSize?: number; // Lines of code (optional, required if existingCodebase=true)
  integrationCount: number; // Number of external integrations (APIs, services, databases)
  userBase: UserBase; // Expected user base size
  securityRequirements: SecurityRequirements; // Security/compliance requirements
  estimatedDuration: number; // Project duration in weeks
}

export interface CriterionScore {
  criterion: string; // Name of the criterion
  score: number; // Points awarded (0-5)
  maxScore: number; // Maximum possible points (usually 5)
  details: string; // Human-readable explanation
}

export interface ComplexityResult {
  level: number; // Complexity level (0-4)
  levelName: string; // Human-readable level name
  score: number; // Total score (0-40)
  maxScore: number; // Maximum possible score (40)
  breakdown: CriterionScore[]; // Individual criterion scores
  recommendations: string[]; // Recommended workflows/documentation
  risks: string[]; // Identified risks
}

/**
 * Project input is an alias for ComplexityAssessment
 * Kept for API clarity - input vs internal assessment representation
 */
export type ProjectInput = ComplexityAssessment;

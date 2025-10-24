/**
 * Workflow Validation Schemas
 */

import { z } from 'zod';

export const WorkflowStepSchema = z.object({
  name: z.string().min(1),
  action: z.enum([
    'elicit',
    'reflect',
    'guide',
    'template',
    'render_template',
    'validate',
    'display',
    'load_state_machine',
    'sub-workflow',
    'api_call',
  ]),
  content: z.string().optional(),
  prompt: z.string().optional(),
  variable: z.string().optional(),
  template: z.string().optional(),
  output_file: z.string().optional(),
  condition: z.string().optional(),
  error_message: z.string().optional(),
  message: z.string().optional(),
  status_file: z.string().optional(),
  variables: z.record(z.string(), z.unknown()).optional(),
  validation: z.string().optional(),

  // Sub-workflow support
  subworkflow: z.string().optional(), // Legacy field (deprecated, use workflow_path)
  workflow_path: z.string().optional(), // Required for sub-workflow action
  context_vars: z.record(z.string(), z.string()).optional(), // Variables to pass to child
});

export const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  steps: z.array(WorkflowStepSchema),
});

export const WorkflowFileSchema = z.object({
  workflow: WorkflowSchema,
});

export const ChildWorkflowStateSchema = z.object({
  workflowPath: z.string(),
  stateFile: z.string(),
  status: z.enum(['running', 'completed', 'error']),
  startedAt: z.string(), // ISO 8601 timestamp
  completedAt: z.string().optional(),
  error: z.string().optional(),
});

export const WorkflowStateSchema = z.object({
  workflowName: z.string(),
  currentStep: z.number().int().nonnegative(),
  variables: z.record(z.string(), z.unknown()),
  completed: z.boolean(),
  startedAt: z.date(),
  updatedAt: z.date(),

  // Sub-workflow support
  childWorkflows: z.array(ChildWorkflowStateSchema).optional(),
  parentWorkflow: z.string().optional(),
  parentStateFile: z.string().optional(),
});

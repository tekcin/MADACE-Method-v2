/**
 * Workflow Validation Schemas
 */

import { z } from 'zod';

export const WorkflowStepSchema = z.object({
  name: z.string().min(1),
  action: z.enum(['elicit', 'reflect', 'guide', 'template', 'validate', 'sub-workflow']),
  content: z.string().optional(),
  prompt: z.string().optional(),
  variable: z.string().optional(),
  template: z.string().optional(),
  validation: z.string().optional(),
  subworkflow: z.string().optional(),
});

export const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  steps: z.array(WorkflowStepSchema),
});

export const WorkflowFileSchema = z.object({
  workflow: WorkflowSchema,
});

export const WorkflowStateSchema = z.object({
  workflowName: z.string(),
  currentStep: z.number().int().nonnegative(),
  variables: z.record(z.string(), z.unknown()),
  completed: z.boolean(),
  startedAt: z.date(),
  updatedAt: z.date(),
});

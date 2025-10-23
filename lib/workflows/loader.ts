/**
 * Workflow Loader
 */

import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';
import type { Workflow } from './types';
import { WorkflowFileSchema } from './schema';

export class WorkflowLoadError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'WorkflowLoadError';
  }
}

export async function loadWorkflow(filePath: string): Promise<Workflow> {
  try {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const parsed = yaml.load(content) as unknown;
    const validated = WorkflowFileSchema.parse(parsed);
    return validated.workflow;
  } catch (error) {
    throw new WorkflowLoadError(
      `Failed to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      filePath,
      error instanceof Error ? error : undefined
    );
  }
}

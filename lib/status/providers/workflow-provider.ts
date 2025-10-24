/**
 * MADACE Workflow Status Provider
 *
 * Provides status information for workflow execution.
 * Reads workflow state files from madace-data/workflow-states/.*.state.json
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { IStatusProvider, StatusResult, StatusFormat } from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Workflow State Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Workflow execution status
 */
export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Workflow step execution state
 */
export interface WorkflowStep {
  id: string;
  status: WorkflowStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

/**
 * Workflow state file structure
 */
export interface WorkflowState {
  workflow: string;
  currentStep: number;
  totalSteps: number;
  status: WorkflowStatus;
  startedAt: string;
  lastUpdated: string;
  steps: WorkflowStep[];
  context: Record<string, unknown>;
}

/**
 * Parsed workflow data for status display
 */
export interface WorkflowData {
  workflow: string;
  status: WorkflowStatus;
  currentStep: number;
  totalSteps: number;
  progress: number;
  currentStepName: string;
  startedAt: string;
  lastUpdated: string;
  context: Record<string, unknown>;
  steps: WorkflowStep[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Workflow Status Provider
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Status provider for workflow execution state
 *
 * Reads workflow state files from the file system and provides
 * status information about workflow execution progress.
 *
 * @example
 * ```typescript
 * const provider = new WorkflowStatusProvider();
 *
 * // Check if input is a workflow name
 * const isWorkflow = provider.detectEntity('pm-planning'); // true
 * const notWorkflow = provider.detectEntity('STORY-001'); // false
 *
 * // Get status for a specific workflow
 * const status = await provider.getStatus('pm-planning');
 * console.log(status.data.progress); // 60
 *
 * // Get status for all workflows
 * const allStatus = await provider.getStatus();
 * console.log(allStatus.data.workflows); // Array of workflows
 *
 * // Format output
 * const table = provider.formatOutput(status, 'table');
 * const json = provider.formatOutput(status, 'json');
 * const markdown = provider.formatOutput(status, 'markdown');
 * ```
 */
export class WorkflowStatusProvider implements IStatusProvider {
  private stateDirectory: string;

  /**
   * Create a new workflow status provider
   *
   * @param stateDirectory - Path to workflow state files directory
   *                        (default: madace-data/workflow-states)
   */
  constructor(stateDirectory = 'madace-data/workflow-states') {
    this.stateDirectory = stateDirectory;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IStatusProvider Implementation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Detect if input is a workflow name
   *
   * Workflow names follow kebab-case pattern: lowercase letters
   * separated by hyphens, no numbers or special characters.
   *
   * Valid: pm-planning, create-prd, epic-breakdown
   * Invalid: STORY-001, MAM-001, camelCase
   *
   * @param input - Input string to check
   * @returns true if input matches workflow name pattern
   */
  detectEntity(input: string): boolean {
    // Workflow names are kebab-case: lowercase letters + hyphens only
    // Examples: pm-planning, create-prd, epic-breakdown
    return /^[a-z]+(-[a-z]+)*$/.test(input);
  }

  /**
   * Get workflow execution status
   *
   * If entityId is provided, returns status for that specific workflow.
   * If entityId is omitted, returns status for all active workflows.
   *
   * @param entityId - Optional workflow name (e.g., 'pm-planning')
   * @returns Promise resolving to status result
   * @throws Error if workflow not found or directory access fails
   */
  async getStatus(entityId?: string): Promise<StatusResult> {
    const timestamp = new Date().toISOString();

    try {
      // Check if state directory exists
      try {
        await fs.access(this.stateDirectory);
      } catch {
        // Directory doesn't exist - return empty state
        return {
          entityType: 'workflow',
          entityId,
          data: entityId
            ? { error: 'Workflow state directory not found' }
            : { workflows: [], totalWorkflows: 0 },
          timestamp,
          metadata: {
            warnings: [`Workflow state directory not found: ${this.stateDirectory}`],
          },
        };
      }

      if (entityId) {
        // Get status for specific workflow
        const workflowData = await this.readWorkflowState(entityId);
        return {
          entityType: 'workflow',
          entityId,
          data: workflowData as unknown as Record<string, unknown>,
          timestamp,
        };
      } else {
        // Get status for all workflows
        const workflows = await this.listAllWorkflows();
        return {
          entityType: 'workflow',
          data: {
            workflows,
            totalWorkflows: workflows.length,
          } as Record<string, unknown>,
          timestamp,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        entityType: 'workflow',
        entityId,
        data: { error: errorMessage },
        timestamp,
        metadata: {
          errors: [errorMessage],
        },
      };
    }
  }

  /**
   * Format status result for display
   *
   * @param result - Status result to format
   * @param format - Desired output format
   * @returns Formatted string
   */
  formatOutput(result: StatusResult, format: StatusFormat): string {
    switch (format) {
      case 'table':
        return this.formatTable(result);
      case 'json':
        return this.formatJson(result);
      case 'markdown':
        return this.formatMarkdown(result);
      default:
        return this.formatJson(result);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Private Helpers
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Read and parse workflow state file
   *
   * @param workflowName - Name of workflow (e.g., 'pm-planning')
   * @returns Parsed workflow data
   * @throws Error if file not found or invalid JSON
   */
  private async readWorkflowState(workflowName: string): Promise<WorkflowData> {
    const stateFilePath = path.resolve(this.stateDirectory, `.${workflowName}.state.json`);

    try {
      const fileContent = await fs.readFile(stateFilePath, 'utf-8');
      const state: WorkflowState = JSON.parse(fileContent);

      // Calculate progress percentage
      const completedSteps = state.steps.filter((step) => step.status === 'completed').length;
      const progress = Math.round((completedSteps / state.totalSteps) * 100);

      // Get current step name
      const currentStepIndex = state.currentStep - 1; // 1-indexed to 0-indexed
      const currentStepName = state.steps[currentStepIndex]?.id || 'unknown';

      return {
        workflow: state.workflow,
        status: state.status,
        currentStep: state.currentStep,
        totalSteps: state.totalSteps,
        progress,
        currentStepName,
        startedAt: state.startedAt,
        lastUpdated: state.lastUpdated,
        context: state.context,
        steps: state.steps,
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`Workflow not found: ${workflowName}`);
      }
      throw error;
    }
  }

  /**
   * List all active workflows
   *
   * Reads all .*.state.json files from the state directory.
   *
   * @returns Array of workflow data
   */
  private async listAllWorkflows(): Promise<WorkflowData[]> {
    try {
      const files = await fs.readdir(this.stateDirectory);

      // Filter for state files: .*.state.json
      const stateFiles = files.filter(
        (file) => file.startsWith('.') && file.endsWith('.state.json')
      );

      // Read and parse each state file
      const workflows: WorkflowData[] = [];
      for (const file of stateFiles) {
        // Extract workflow name: .pm-planning.state.json -> pm-planning
        const workflowName = file.replace(/^\.(.+)\.state\.json$/, '$1');
        try {
          const workflowData = await this.readWorkflowState(workflowName);
          workflows.push(workflowData);
        } catch (error) {
          // Skip files that can't be parsed
          console.error(`Failed to parse ${file}:`, error);
        }
      }

      return workflows;
    } catch {
      // Directory doesn't exist or can't be read
      return [];
    }
  }

  /**
   * Format as ASCII table
   *
   * @param result - Status result
   * @returns Formatted table string
   */
  private formatTable(result: StatusResult): string {
    const { data } = result;

    if ('error' in data) {
      return `Error: ${data.error}`;
    }

    if ('workflows' in data) {
      // Multiple workflows
      const workflows = data.workflows as WorkflowData[];
      if (workflows.length === 0) {
        return 'No active workflows found.';
      }

      const lines: string[] = [];
      lines.push(
        '┌─────────────────────────┬──────────────┬──────────┬──────────┬────────────────────┐'
      );
      lines.push(
        '│ Workflow                │ Status       │ Step     │ Progress │ Last Updated       │'
      );
      lines.push(
        '├─────────────────────────┼──────────────┼──────────┼──────────┼────────────────────┤'
      );

      for (const workflow of workflows) {
        const name = workflow.workflow.padEnd(23);
        const status = workflow.status.padEnd(12);
        const step = `${workflow.currentStep}/${workflow.totalSteps}`.padEnd(8);
        const progress = `${workflow.progress}%`.padEnd(8);
        const updated = new Date(workflow.lastUpdated).toLocaleString().padEnd(18);

        lines.push(`│ ${name} │ ${status} │ ${step} │ ${progress} │ ${updated} │`);
      }

      lines.push(
        '└─────────────────────────┴──────────────┴──────────┴──────────┴────────────────────┘'
      );

      return lines.join('\n');
    } else {
      // Single workflow
      const workflow = data as unknown as WorkflowData;
      const lines: string[] = [];
      lines.push('┌─────────────────┬────────────────────────────────────────┐');
      lines.push(`│ Workflow        │ ${workflow.workflow.padEnd(38)} │`);
      lines.push(`│ Status          │ ${workflow.status.padEnd(38)} │`);
      lines.push(`│ Current Step    │ ${workflow.currentStepName.padEnd(38)} │`);
      lines.push(
        `│ Progress        │ ${`${workflow.currentStep}/${workflow.totalSteps} (${workflow.progress}%)`.padEnd(38)} │`
      );
      lines.push(
        `│ Started At      │ ${new Date(workflow.startedAt).toLocaleString().padEnd(38)} │`
      );
      lines.push(
        `│ Last Updated    │ ${new Date(workflow.lastUpdated).toLocaleString().padEnd(38)} │`
      );
      lines.push('└─────────────────┴────────────────────────────────────────┘');

      // Add steps table
      if (workflow.steps && workflow.steps.length > 0) {
        lines.push('');
        lines.push('Steps:');
        lines.push('┌────┬─────────────────────────┬──────────────┬────────────────────┐');
        lines.push('│ #  │ Step ID                 │ Status       │ Completed At       │');
        lines.push('├────┼─────────────────────────┼──────────────┼────────────────────┤');

        workflow.steps.forEach((step, index) => {
          const num = `${index + 1}`.padStart(2);
          const id = step.id.padEnd(23);
          const status = step.status.padEnd(12);
          const completed = step.completedAt
            ? new Date(step.completedAt).toLocaleString().padEnd(18)
            : '-'.padEnd(18);

          lines.push(`│ ${num} │ ${id} │ ${status} │ ${completed} │`);
        });

        lines.push('└────┴─────────────────────────┴──────────────┴────────────────────┘');
      }

      return lines.join('\n');
    }
  }

  /**
   * Format as JSON
   *
   * @param result - Status result
   * @returns JSON string
   */
  private formatJson(result: StatusResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Format as Markdown
   *
   * @param result - Status result
   * @returns Markdown string
   */
  private formatMarkdown(result: StatusResult): string {
    const { data } = result;

    if ('error' in data) {
      return `**Error:** ${data.error}`;
    }

    if ('workflows' in data) {
      // Multiple workflows
      const workflows = data.workflows as WorkflowData[];
      if (workflows.length === 0) {
        return '_No active workflows found._';
      }

      const lines: string[] = [];
      lines.push('## Active Workflows\n');

      for (const workflow of workflows) {
        const progressBar = this.createProgressBar(workflow.progress);
        lines.push(`### ${workflow.workflow}`);
        lines.push('');
        lines.push(`**Status:** ${workflow.status}`);
        lines.push(
          `**Progress:** ${workflow.currentStep}/${workflow.totalSteps} (${workflow.progress}%)`
        );
        lines.push(`${progressBar}`);
        lines.push(`**Current Step:** ${workflow.currentStepName}`);
        lines.push(`**Last Updated:** ${new Date(workflow.lastUpdated).toLocaleString()}`);
        lines.push('');
      }

      return lines.join('\n');
    } else {
      // Single workflow
      const workflow = data as unknown as WorkflowData;
      const progressBar = this.createProgressBar(workflow.progress);

      const lines: string[] = [];
      lines.push(`## Workflow: ${workflow.workflow}\n`);
      lines.push(`**Status:** ${workflow.status}`);
      lines.push(
        `**Progress:** ${workflow.currentStep}/${workflow.totalSteps} (${workflow.progress}%)`
      );
      lines.push(`${progressBar}`);
      lines.push(`**Current Step:** ${workflow.currentStepName}`);
      lines.push(`**Started At:** ${new Date(workflow.startedAt).toLocaleString()}`);
      lines.push(`**Last Updated:** ${new Date(workflow.lastUpdated).toLocaleString()}`);
      lines.push('');

      // Add steps list
      if (workflow.steps && workflow.steps.length > 0) {
        lines.push('### Steps\n');
        workflow.steps.forEach((step, index) => {
          const emoji =
            step.status === 'completed'
              ? '✅'
              : step.status === 'in_progress'
                ? '🔄'
                : step.status === 'failed'
                  ? '❌'
                  : '⏳';
          const completed = step.completedAt
            ? ` (completed ${new Date(step.completedAt).toLocaleString()})`
            : '';
          lines.push(`${index + 1}. ${emoji} **${step.id}** - ${step.status}${completed}`);
        });
        lines.push('');
      }

      // Add context if present
      if (workflow.context && Object.keys(workflow.context).length > 0) {
        lines.push('### Context\n');
        for (const [key, value] of Object.entries(workflow.context)) {
          lines.push(`- **${key}:** ${JSON.stringify(value)}`);
        }
        lines.push('');
      }

      return lines.join('\n');
    }
  }

  /**
   * Create ASCII progress bar
   *
   * @param progress - Progress percentage (0-100)
   * @returns Progress bar string
   */
  private createProgressBar(progress: number): string {
    const barLength = 20;
    const filledLength = Math.round((progress / 100) * barLength);
    const emptyLength = barLength - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `[${filled}${empty}] ${progress}%`;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Factory Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Create a workflow status provider instance
 *
 * @param stateDirectory - Optional path to workflow state files directory
 * @returns WorkflowStatusProvider instance
 *
 * @example
 * ```typescript
 * const provider = createWorkflowStatusProvider();
 * const status = await provider.getStatus('pm-planning');
 * console.log(provider.formatOutput(status, 'table'));
 * ```
 */
export function createWorkflowStatusProvider(
  stateDirectory?: string
): WorkflowStatusProvider {
  return new WorkflowStatusProvider(stateDirectory);
}

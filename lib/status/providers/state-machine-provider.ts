/**
 * State Machine Status Provider
 *
 * Provides status information for the overall state machine by parsing
 * the mam-workflow-status.md file and counting stories per state.
 *
 * Features:
 * - Parses status file to extract story counts
 * - Returns counts for all 4 states (BACKLOG, TODO, IN_PROGRESS, DONE)
 * - Tracks TODO and IN_PROGRESS limits (both MAX 1)
 * - Flags violations in metadata
 * - Supports multiple output formats (table, json, markdown)
 */

import { readFile } from 'fs/promises';
import type { IStatusProvider, StatusResult, StatusFormat } from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * State Machine Status Data
 *
 * Contains counts for each state and limit tracking.
 * Extends Record<string, unknown> for compatibility with StatusResult.data
 */
interface StateMachineStatus extends Record<string, unknown> {
  /**
   * Number of stories in BACKLOG
   */
  backlog: number;

  /**
   * Number of stories in TODO (LIMIT: 1)
   */
  todo: number;

  /**
   * Number of stories in IN PROGRESS (LIMIT: 1)
   */
  inProgress: number;

  /**
   * Number of stories in DONE
   */
  done: number;

  /**
   * Total number of stories across all states
   */
  total: number;

  /**
   * Maximum allowed stories in TODO (always 1)
   */
  todoLimit: number;

  /**
   * Maximum allowed stories in IN_PROGRESS (always 1)
   */
  inProgressLimit: number;

  /**
   * Optional velocity metrics (stories/week, average points, etc.)
   */
  velocity?: {
    storiesPerWeek: number;
    averagePoints: number;
    projectedCompletion?: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State Machine Status Provider
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Status provider for the overall state machine
 *
 * Parses the mam-workflow-status.md file to extract counts for each state.
 * Tracks limit violations for TODO and IN_PROGRESS states.
 *
 * @example
 * ```typescript
 * const provider = new StateMachineStatusProvider();
 * const status = await provider.getStatus();
 * const output = provider.formatOutput(status, 'table');
 * console.log(output);
 * ```
 */
export class StateMachineStatusProvider implements IStatusProvider {
  private statusFilePath: string;

  /**
   * Create a new StateMachineStatusProvider
   *
   * @param statusFilePath - Path to the status file (default: docs/mam-workflow-status.md)
   */
  constructor(statusFilePath: string = 'docs/mam-workflow-status.md') {
    this.statusFilePath = statusFilePath;
  }

  /**
   * Detect if input matches state machine query
   *
   * State machine always matches when no specific entity requested.
   * Keywords: "state", "machine", "status", "overview", "summary"
   *
   * @param input - Query string (empty = state machine default)
   * @returns true if this provider should handle the query
   */
  detectEntity(input: string): boolean {
    if (!input || input.trim() === '') return true; // Empty = state machine default

    const keywords = [
      'state',
      'machine',
      'status',
      'overview',
      'summary',
      'all',
    ];
    return keywords.some((keyword) => input.toLowerCase().includes(keyword));
  }

  /**
   * Get state machine status - parse status file and count stories
   *
   * @param entityId - Unused (state machine is global)
   * @returns Promise resolving to status result
   */
  async getStatus(_entityId?: string): Promise<StatusResult> {
    try {
      const content = await readFile(this.statusFilePath, 'utf-8');
      const status = this.parseStatusFile(content);

      return {
        entityType: 'state',
        entityId: 'state-machine',
        data: status,
        timestamp: new Date().toISOString(),
        metadata: {
          source: this.statusFilePath,
          todoViolation: status.todo > status.todoLimit,
          inProgressViolation: status.inProgress > status.inProgressLimit,
        },
      };
    } catch (error) {
      return {
        entityType: 'state',
        entityId: 'state-machine',
        data: {},
        timestamp: new Date().toISOString(),
        metadata: {
          errors: [
            `Failed to read status file: ${error instanceof Error ? error.message : String(error)}`,
          ],
        },
      };
    }
  }

  /**
   * Format output for state machine status
   *
   * @param result - Status result to format
   * @param format - Output format (table, json, markdown)
   * @returns Formatted string
   */
  formatOutput(result: StatusResult, format: StatusFormat): string {
    const status = result.data as unknown as StateMachineStatus;

    if (format === 'json') {
      return JSON.stringify(status, null, 2);
    }

    if (format === 'table') {
      const lines: string[] = [];
      lines.push('┌───────────────┬───────┬───────┐');
      lines.push('│ State         │ Count │ Limit │');
      lines.push('├───────────────┼───────┼───────┤');
      lines.push(
        `│ BACKLOG       │ ${String(status.backlog).padEnd(5)} │ ∞     │`,
      );
      lines.push(
        `│ TODO          │ ${String(status.todo).padEnd(5)} │ ${status.todoLimit}     │${status.todo > status.todoLimit ? ' ⚠️' : ''}`,
      );
      lines.push(
        `│ IN PROGRESS   │ ${String(status.inProgress).padEnd(5)} │ ${status.inProgressLimit}     │${status.inProgress > status.inProgressLimit ? ' ⚠️' : ''}`,
      );
      lines.push(
        `│ DONE          │ ${String(status.done).padEnd(5)} │ ∞     │`,
      );
      lines.push('├───────────────┼───────┼───────┤');
      lines.push(
        `│ TOTAL         │ ${String(status.total).padEnd(5)} │       │`,
      );
      lines.push('└───────────────┴───────┴───────┘');

      if (status.velocity) {
        lines.push('');
        lines.push('Velocity Metrics:');
        lines.push(
          `  Stories/Week: ${status.velocity.storiesPerWeek.toFixed(1)}`,
        );
        lines.push(
          `  Avg Points: ${status.velocity.averagePoints.toFixed(1)}`,
        );
        if (status.velocity.projectedCompletion) {
          lines.push(
            `  Projected Completion: ${status.velocity.projectedCompletion}`,
          );
        }
      }

      return lines.join('\n');
    }

    // Markdown format
    const lines: string[] = [];
    lines.push('# State Machine Status\n');
    lines.push('| State | Count | Limit |');
    lines.push('|-------|-------|-------|');
    lines.push(`| BACKLOG | ${status.backlog} | ∞ |`);
    lines.push(
      `| TODO | ${status.todo} | ${status.todoLimit} |${status.todo > status.todoLimit ? ' ⚠️' : ''}`,
    );
    lines.push(
      `| IN PROGRESS | ${status.inProgress} | ${status.inProgressLimit} |${status.inProgress > status.inProgressLimit ? ' ⚠️' : ''}`,
    );
    lines.push(`| DONE | ${status.done} | ∞ |`);
    lines.push(`| **TOTAL** | **${status.total}** | |`);

    if (status.velocity) {
      lines.push('\n## Velocity Metrics\n');
      lines.push(
        `- Stories/Week: ${status.velocity.storiesPerWeek.toFixed(1)}`,
      );
      lines.push(
        `- Average Points: ${status.velocity.averagePoints.toFixed(1)}`,
      );
      if (status.velocity.projectedCompletion) {
        lines.push(
          `- Projected Completion: ${status.velocity.projectedCompletion}`,
        );
      }
    }

    return lines.join('\n');
  }

  /**
   * Parse status file and count stories per state
   *
   * @param content - Status file content
   * @returns Parsed status with counts
   * @private
   */
  private parseStatusFile(content: string): StateMachineStatus {
    const lines = content.split('\n');
    let currentState: keyof Pick<
      StateMachineStatus,
      'backlog' | 'todo' | 'inProgress' | 'done'
    > | null = null;

    const counts = {
      backlog: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
    };

    for (const line of lines) {
      // Detect state sections
      if (line.match(/^##\s+BACKLOG/i)) {
        currentState = 'backlog';
        continue;
      }
      if (line.match(/^##\s+TODO/i)) {
        currentState = 'todo';
        continue;
      }
      if (line.match(/^##\s+IN\s+PROGRESS/i)) {
        currentState = 'inProgress';
        continue;
      }
      if (line.match(/^##\s+DONE/i)) {
        currentState = 'done';
        continue;
      }

      // Count stories in current state
      // Story format: - **[STORY-ID]** Story Title (Points: X) [Status: ...]
      if (currentState && line.match(/^-\s+\*\*\[/)) {
        counts[currentState]++;
      }
    }

    const total = counts.backlog + counts.todo + counts.inProgress + counts.done;

    return {
      ...counts,
      total,
      todoLimit: 1,
      inProgressLimit: 1,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Factory Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Factory function to create StateMachineStatusProvider
 *
 * @param statusFilePath - Optional path to status file
 * @returns New provider instance
 *
 * @example
 * ```typescript
 * const provider = createStateMachineStatusProvider();
 * const status = await provider.getStatus();
 * ```
 */
export function createStateMachineStatusProvider(
  statusFilePath?: string,
): StateMachineStatusProvider {
  return new StateMachineStatusProvider(statusFilePath);
}

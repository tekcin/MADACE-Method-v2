/**
 * MADACE Story Status Provider
 *
 * Parses docs/mam-workflow-status.md to extract and query story status information.
 * Implements the IStatusProvider interface for unified status checking.
 */

import fs from 'fs/promises';
import path from 'path';
import type { IStatusProvider, StatusResult, StatusFormat } from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Story states matching the workflow status file
 */
export type StoryState = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

/**
 * Story metadata extracted from status file
 */
export interface Story {
  id: string;
  title: string;
  status: StoryState;
  points?: number;
  assignee?: string;
  dueDate?: Date;
  startedDate?: Date;
  completedDate?: Date;
  milestone?: string;
  completed: boolean;
}

/**
 * Parsing result for status file
 */
interface ParseResult {
  stories: Story[];
  errors: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Story Status Provider Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Story status provider implementation
 *
 * Parses docs/mam-workflow-status.md to extract story information.
 * Supports querying individual stories or listing all stories.
 *
 * @example
 * ```typescript
 * const provider = new StoryStatusProvider();
 *
 * // Check if input is a story ID
 * if (provider.detectEntity('STORY-001')) {
 *   // Get single story status
 *   const result = await provider.getStatus('STORY-001');
 *   console.log(provider.formatOutput(result, 'table'));
 * }
 *
 * // Get all stories
 * const allStories = await provider.getStatus();
 * console.log(provider.formatOutput(allStories, 'markdown'));
 * ```
 */
export class StoryStatusProvider implements IStatusProvider {
  private statusFilePath: string;

  /**
   * Create a new story status provider
   *
   * @param statusFilePath - Path to mam-workflow-status.md file
   */
  constructor(statusFilePath: string = 'docs/mam-workflow-status.md') {
    this.statusFilePath = path.resolve(statusFilePath);
  }

  /**
   * Detect if input matches a story ID pattern
   *
   * Supported patterns:
   * - STORY-001, STORY-123
   * - US-001, US-123 (User Story)
   * - TASK-001, TASK-123
   *
   * @param input - Entity identifier to test
   * @returns true if input matches a story ID pattern
   */
  detectEntity(input: string): boolean {
    return /^(STORY|US|TASK)-\d+$/i.test(input);
  }

  /**
   * Get story status
   *
   * If entityId is provided, returns status for a specific story.
   * If entityId is omitted, returns all stories.
   *
   * @param entityId - Optional story ID (STORY-001, US-001, etc.)
   * @returns Promise resolving to status result
   * @throws Error if file not found or story not found
   */
  async getStatus(entityId?: string): Promise<StatusResult> {
    const timestamp = new Date().toISOString();

    try {
      // Parse status file
      const parseResult = await this.parseStatusFile();

      // If entity ID provided, find specific story
      if (entityId) {
        const story = parseResult.stories.find(
          (s) => s.id.toLowerCase() === entityId.toLowerCase()
        );

        if (!story) {
          return {
            entityType: 'story',
            entityId,
            data: {
              found: false,
              error: `Story '${entityId}' not found in status file`,
              availableStories: parseResult.stories.map((s) => s.id),
            },
            timestamp,
            metadata: {
              errors: [`Story '${entityId}' not found`],
            },
          };
        }

        // Return single story result
        return {
          entityType: 'story',
          entityId: story.id,
          data: {
            id: story.id,
            title: story.title,
            status: story.status,
            points: story.points,
            assignee: story.assignee,
            dueDate: story.dueDate?.toISOString(),
            startedDate: story.startedDate?.toISOString(),
            completedDate: story.completedDate?.toISOString(),
            milestone: story.milestone,
            completed: story.completed,
          },
          timestamp,
          metadata: parseResult.errors.length > 0 ? { warnings: parseResult.errors } : undefined,
        };
      }

      // Return all stories
      return {
        entityType: 'story',
        data: {
          stories: parseResult.stories.map((s) => ({
            id: s.id,
            title: s.title,
            status: s.status,
            points: s.points,
            assignee: s.assignee,
            dueDate: s.dueDate?.toISOString(),
            startedDate: s.startedDate?.toISOString(),
            completedDate: s.completedDate?.toISOString(),
            milestone: s.milestone,
            completed: s.completed,
          })),
          totalCount: parseResult.stories.length,
          byStatus: this.groupByStatus(parseResult.stories),
        },
        timestamp,
        metadata: parseResult.errors.length > 0 ? { warnings: parseResult.errors } : undefined,
      };
    } catch (error) {
      // File not found or other error
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        entityType: 'story',
        entityId,
        data: {
          found: false,
          error: errorMessage,
        },
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
   * Supports three output formats:
   * - table: ASCII table with columns (ID, Title, Status, Points, Assignee)
   * - json: Pretty-printed JSON with full details
   * - markdown: Formatted markdown list
   *
   * @param result - Status result to format
   * @param format - Desired output format
   * @returns Formatted string ready for display
   */
  formatOutput(result: StatusResult, format: StatusFormat): string {
    switch (format) {
      case 'json':
        return this.formatJSON(result);
      case 'table':
        return this.formatTable(result);
      case 'markdown':
        return this.formatMarkdown(result);
      default:
        return this.formatJSON(result);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Private Methods
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Parse the mam-workflow-status.md file
   *
   * Extracts stories from all sections (BACKLOG, TODO, IN_PROGRESS, DONE).
   * Parses metadata like points, assignee, and dates.
   *
   * @returns Parsing result with stories and errors
   * @throws Error if file cannot be read
   */
  private async parseStatusFile(): Promise<ParseResult> {
    const content = await fs.readFile(this.statusFilePath, 'utf-8');
    const lines = content.split('\n');

    const stories: Story[] = [];
    const errors: string[] = [];
    let currentSection: StoryState | null = null;
    let currentMilestone: string | undefined = undefined;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const trimmed = line.trim();

      // Detect section headers
      if (trimmed.startsWith('## BACKLOG')) {
        currentSection = 'BACKLOG';
        currentMilestone = undefined;
        continue;
      } else if (trimmed.startsWith('## TODO')) {
        currentSection = 'TODO';
        currentMilestone = undefined;
        continue;
      } else if (trimmed.startsWith('## IN PROGRESS')) {
        currentSection = 'IN_PROGRESS';
        currentMilestone = undefined;
        continue;
      } else if (trimmed.startsWith('## DONE')) {
        currentSection = 'DONE';
        currentMilestone = undefined;
        continue;
      }

      // Detect milestone headers (### Milestone X.Y: Name)
      if (trimmed.startsWith('### Milestone')) {
        const milestoneMatch = trimmed.match(/### (Milestone[\s\d.]+):/);
        if (milestoneMatch?.[1]) {
          currentMilestone = milestoneMatch[1].trim();
        }
        continue;
      }

      // Skip non-story lines
      if (!currentSection) continue;
      if (!trimmed.startsWith('-')) continue;

      // Parse story line
      try {
        const story = this.parseStoryLine(trimmed, currentSection, currentMilestone);
        if (story) {
          stories.push(story);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Line ${i + 1}: ${errorMsg}`);
      }
    }

    return { stories, errors };
  }

  /**
   * Parse a single story line
   *
   * Expected formats:
   * - [ ] **[STORY-001]** Title | 5 points
   * - [ ] **[STORY-002]** Title | 3 points | @assignee
   * - [ ] **[STORY-003]** Title | 8 points | Started: 2025-10-20
   * - [x] **[STORY-004]** Title | 2 points | Completed: 2025-10-20
   *
   * @param line - Story line from status file
   * @param status - Current section status
   * @param milestone - Current milestone (if in BACKLOG)
   * @returns Parsed story or null if not a valid story line
   */
  private parseStoryLine(line: string, status: StoryState, milestone?: string): Story | null {
    // Extract checkbox status
    const completedMatch = line.match(/^-\s+\[([x ])\]/i);
    if (!completedMatch?.[1]) return null;
    const completed = completedMatch[1].toLowerCase() === 'x';

    // Extract story ID
    const idMatch = line.match(/\[([A-Z]+-\d+)\]/);
    if (!idMatch?.[1]) return null;
    const id = idMatch[1];

    // Extract title (text between ] and |)
    const titleMatch = line.match(/\]\*\*\s+([^|]+?)(?:\s+\||\s*$)/);
    if (!titleMatch || !titleMatch[1]) return null;
    const title = titleMatch[1].trim();

    // Extract metadata (everything after first |)
    const metadataMatch = line.match(/\|\s+(.+)$/);
    const metadata = metadataMatch?.[1] || '';

    // Parse points
    const pointsMatch = metadata.match(/(\d+)\s+points?/i);
    const points = pointsMatch?.[1] ? parseInt(pointsMatch[1], 10) : undefined;

    // Parse assignee
    const assigneeMatch = metadata.match(/@(\w+)/);
    const assignee = assigneeMatch?.[1];

    // Parse dates
    const dueDateMatch = metadata.match(/Due:\s+(\d{4}-\d{2}-\d{2})/);
    const dueDate = dueDateMatch?.[1] ? new Date(dueDateMatch[1]) : undefined;

    const startedDateMatch = metadata.match(/Started:\s+(\d{4}-\d{2}-\d{2})/);
    const startedDate = startedDateMatch?.[1] ? new Date(startedDateMatch[1]) : undefined;

    const completedDateMatch = metadata.match(/Completed:\s+(\d{4}-\d{2}-\d{2})/);
    const completedDate = completedDateMatch?.[1] ? new Date(completedDateMatch[1]) : undefined;

    return {
      id,
      title,
      status,
      points,
      assignee,
      dueDate,
      startedDate,
      completedDate,
      milestone,
      completed,
    };
  }

  /**
   * Group stories by status
   *
   * @param stories - Array of stories to group
   * @returns Object with stories grouped by status
   */
  private groupByStatus(stories: Story[]): Record<StoryState, number> {
    return {
      BACKLOG: stories.filter((s) => s.status === 'BACKLOG').length,
      TODO: stories.filter((s) => s.status === 'TODO').length,
      IN_PROGRESS: stories.filter((s) => s.status === 'IN_PROGRESS').length,
      DONE: stories.filter((s) => s.status === 'DONE').length,
    };
  }

  /**
   * Format result as JSON
   */
  private formatJSON(result: StatusResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Format result as ASCII table
   */
  private formatTable(result: StatusResult): string {
    // Single story result
    if (result.entityId && typeof result.data.id === 'string') {
      const lines: string[] = [];
      lines.push('┌─────────────────┬────────────────────────────────────────┐');
      lines.push(`│ Story ID        │ ${this.padRight(String(result.data.id), 38)} │`);
      lines.push(`│ Title           │ ${this.padRight(String(result.data.title || ''), 38)} │`);
      lines.push(`│ Status          │ ${this.padRight(String(result.data.status || ''), 38)} │`);
      lines.push(`│ Points          │ ${this.padRight(String(result.data.points || 'N/A'), 38)} │`);
      lines.push(
        `│ Assignee        │ ${this.padRight(String(result.data.assignee || 'N/A'), 38)} │`
      );
      lines.push(
        `│ Milestone       │ ${this.padRight(String(result.data.milestone || 'N/A'), 38)} │`
      );
      lines.push(
        `│ Completed       │ ${this.padRight(String(result.data.completed ?? false), 38)} │`
      );
      lines.push('└─────────────────┴────────────────────────────────────────┘');
      return lines.join('\n');
    }

    // All stories result
    if (Array.isArray(result.data.stories)) {
      const stories = result.data.stories as Array<{
        id: string;
        title: string;
        status: string;
        points?: number;
        assignee?: string;
      }>;

      const lines: string[] = [];
      lines.push(
        '┌─────────────┬──────────────────────────────┬──────────────┬────────┬───────────┐'
      );
      lines.push(
        '│ ID          │ Title                        │ Status       │ Points │ Assignee  │'
      );
      lines.push(
        '├─────────────┼──────────────────────────────┼──────────────┼────────┼───────────┤'
      );

      for (const story of stories) {
        lines.push(
          `│ ${this.padRight(story.id, 11)} │ ${this.padRight(this.truncate(story.title, 28), 28)} │ ${this.padRight(story.status, 12)} │ ${this.padRight(String(story.points || 'N/A'), 6)} │ ${this.padRight(story.assignee || 'N/A', 9)} │`
        );
      }

      lines.push(
        '└─────────────┴──────────────────────────────┴──────────────┴────────┴───────────┘'
      );
      lines.push(`\nTotal: ${stories.length} stories`);

      return lines.join('\n');
    }

    // Error case
    return 'No story data available';
  }

  /**
   * Format result as markdown
   */
  private formatMarkdown(result: StatusResult): string {
    // Single story result
    if (result.entityId && typeof result.data.id === 'string') {
      const lines: string[] = [];
      lines.push(`## Story: ${result.data.id}`);
      lines.push('');
      lines.push(`**Title:** ${result.data.title}`);
      lines.push(`**Status:** ${result.data.status}`);
      lines.push(`**Points:** ${result.data.points || 'N/A'}`);
      lines.push(`**Assignee:** ${result.data.assignee || 'N/A'}`);
      lines.push(`**Milestone:** ${result.data.milestone || 'N/A'}`);
      lines.push(`**Completed:** ${result.data.completed ? 'Yes' : 'No'}`);
      lines.push('');
      if (result.data.startedDate) {
        lines.push(`**Started:** ${result.data.startedDate}`);
      }
      if (result.data.completedDate) {
        lines.push(`**Completed:** ${result.data.completedDate}`);
      }
      return lines.join('\n');
    }

    // All stories result
    if (Array.isArray(result.data.stories)) {
      const stories = result.data.stories as Array<{
        id: string;
        title: string;
        status: string;
        points?: number;
        assignee?: string;
      }>;

      const lines: string[] = [];
      lines.push('## All Stories');
      lines.push('');

      // Group by status
      const grouped: Record<string, typeof stories> = {};
      for (const story of stories) {
        if (!grouped[story.status]) {
          grouped[story.status] = [];
        }
        grouped[story.status]!.push(story);
      }

      // Output each group
      for (const [status, statusStories] of Object.entries(grouped)) {
        lines.push(`### ${status} (${statusStories.length})`);
        lines.push('');
        for (const story of statusStories) {
          lines.push(
            `- **[${story.id}]** ${story.title} | ${story.points || 'N/A'} points${story.assignee ? ` | @${story.assignee}` : ''}`
          );
        }
        lines.push('');
      }

      lines.push(`**Total:** ${stories.length} stories`);
      return lines.join('\n');
    }

    // Error case
    return 'No story data available';
  }

  /**
   * Pad string to right with spaces
   */
  private padRight(str: string, length: number): string {
    return str.padEnd(length, ' ');
  }

  /**
   * Truncate string to maximum length
   */
  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Factory Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Create a story status provider instance
 *
 * @param statusFilePath - Optional path to status file
 * @returns StoryStatusProvider instance
 *
 * @example
 * ```typescript
 * const provider = createStoryStatusProvider();
 * const status = await provider.getStatus('STORY-001');
 * console.log(provider.formatOutput(status, 'table'));
 * ```
 */
export function createStoryStatusProvider(statusFilePath?: string): StoryStatusProvider {
  return new StoryStatusProvider(statusFilePath);
}

/**
 * MADACE Epic Status Provider
 *
 * Reads and parses epic files from docs/v3-planning/epics/
 * Implements IStatusProvider for epic-related queries.
 */

import fs from 'fs/promises';
import path from 'path';
import type { IStatusProvider, StatusResult, StatusFormat } from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Epic Data Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Epic extends Record<string, unknown> {
  id: string;
  name: string;
  priority: string;
  effort: number;
  quarter: string;
  owner: string;
  status: string;
  storyCount: number;
  lastUpdated: string;
  summary: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Epic Status Provider Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * EpicStatusProvider - Reads epic files and provides status information
 *
 * @example
 * ```typescript
 * const provider = new EpicStatusProvider();
 * const status = await provider.getStatus('EPIC-V3-001');
 * console.log(status.data.name); // "Scale-Adaptive Workflow Router"
 * ```
 */
export class EpicStatusProvider implements IStatusProvider {
  private epicsDirectory: string;

  /**
   * Create a new EpicStatusProvider
   *
   * @param epicsDirectory - Path to directory containing epic markdown files
   */
  constructor(epicsDirectory: string = 'docs/v3-planning/epics') {
    this.epicsDirectory = path.resolve(epicsDirectory);
  }

  /**
   * Detect if input matches epic ID pattern
   *
   * Supported formats:
   * - EPIC-V3-001
   * - EPIC-001
   * - epic-v3-001 (case-insensitive)
   *
   * @param input - Entity identifier to check
   * @returns true if input matches epic pattern
   */
  detectEntity(input: string): boolean {
    return /^EPIC(-V\d+)?-\d+$/i.test(input);
  }

  /**
   * Get status for specific epic or all epics
   *
   * @param entityId - Optional epic ID (e.g., "EPIC-V3-001")
   * @returns Promise resolving to status result
   * @throws Error if epic not found or directory inaccessible
   */
  async getStatus(entityId?: string): Promise<StatusResult> {
    try {
      // Check if directory exists
      await fs.access(this.epicsDirectory);
    } catch {
      return {
        entityType: 'epic',
        entityId,
        data: {},
        timestamp: new Date().toISOString(),
        metadata: {
          errors: [`Epic directory not found: ${this.epicsDirectory}`],
        },
      };
    }

    if (entityId) {
      // Get single epic
      return this.getSingleEpic(entityId);
    } else {
      // Get all epics
      return this.getAllEpics();
    }
  }

  /**
   * Format status result for display
   *
   * @param result - Status result to format
   * @param format - Output format (table/json/markdown)
   * @returns Formatted string
   */
  formatOutput(result: StatusResult, format: StatusFormat): string {
    if (format === 'json') {
      return JSON.stringify(result, null, 2);
    }

    if (format === 'markdown') {
      return this.formatMarkdown(result);
    }

    // Default: table format
    return this.formatTable(result);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Private Helper Methods
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get status for a single epic
   */
  private async getSingleEpic(entityId: string): Promise<StatusResult> {
    const normalizedId = entityId.toUpperCase();

    try {
      const files = await fs.readdir(this.epicsDirectory);
      const epicFiles = files.filter((f) => /^EPIC-V\d+-\d+.*\.md$/i.test(f));

      // Find matching file
      const matchingFile = epicFiles.find((f) => {
        const fileId = this.extractEpicIdFromFilename(f);
        return fileId === normalizedId;
      });

      if (!matchingFile) {
        return {
          entityType: 'epic',
          entityId: normalizedId,
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {
            errors: [`Epic not found: ${normalizedId}`],
          },
        };
      }

      // Parse epic file
      const filePath = path.join(this.epicsDirectory, matchingFile);
      const epic = await this.parseEpicFile(filePath);

      return {
        entityType: 'epic',
        entityId: epic.id,
        data: epic,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        entityType: 'epic',
        entityId: normalizedId,
        data: {},
        timestamp: new Date().toISOString(),
        metadata: {
          errors: [
            `Failed to read epic: ${error instanceof Error ? error.message : String(error)}`,
          ],
        },
      };
    }
  }

  /**
   * Get status for all epics
   */
  private async getAllEpics(): Promise<StatusResult> {
    try {
      const files = await fs.readdir(this.epicsDirectory);
      const epicFiles = files.filter((f) => /^EPIC-V\d+-\d+.*\.md$/i.test(f));

      if (epicFiles.length === 0) {
        return {
          entityType: 'epic',
          data: {
            epics: [],
            totalCount: 0,
          },
          timestamp: new Date().toISOString(),
          metadata: {
            warnings: ['No epic files found in directory'],
          },
        };
      }

      // Parse all epic files
      const epics: Epic[] = [];
      const errors: string[] = [];

      for (const file of epicFiles) {
        try {
          const filePath = path.join(this.epicsDirectory, file);
          const epic = await this.parseEpicFile(filePath);
          epics.push(epic);
        } catch (error) {
          errors.push(
            `Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      // Sort by epic ID
      epics.sort((a, b) => a.id.localeCompare(b.id));

      return {
        entityType: 'epic',
        data: {
          epics,
          totalCount: epics.length,
        },
        timestamp: new Date().toISOString(),
        metadata: errors.length > 0 ? { errors } : undefined,
      };
    } catch (error) {
      return {
        entityType: 'epic',
        data: {},
        timestamp: new Date().toISOString(),
        metadata: {
          errors: [
            `Failed to read epics directory: ${error instanceof Error ? error.message : String(error)}`,
          ],
        },
      };
    }
  }

  /**
   * Parse epic file and extract metadata
   */
  private async parseEpicFile(filePath: string): Promise<Epic> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Initialize epic data with defaults
    const epic: Epic = {
      id: this.extractEpicIdFromFilename(path.basename(filePath)),
      name: '',
      priority: 'Unknown',
      effort: 0,
      quarter: 'Unknown',
      owner: 'Unknown',
      status: 'Unknown',
      storyCount: 0,
      lastUpdated: 'Unknown',
      summary: '',
    };

    // Parse header section (lines 0-10)
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i];
      if (!line) continue;
      const trimmedLine = line.trim();

      // Epic name from first heading
      if (trimmedLine.startsWith('# EPIC-') && !epic.name) {
        const parts = trimmedLine.split(':');
        if (parts.length > 1) {
          epic.name = parts.slice(1).join(':').trim();
        }
      }

      // Extract metadata from bold fields
      if (trimmedLine.includes('**Epic ID:**')) {
        const match = trimmedLine.match(/\*\*Epic ID:\*\*\s+(\S+)/);
        if (match && match[1]) epic.id = match[1];
      }

      if (trimmedLine.includes('**Priority:**')) {
        const match = trimmedLine.match(/\*\*Priority:\*\*\s+(\S+)/);
        if (match && match[1]) epic.priority = match[1];
      }

      if (trimmedLine.includes('**Effort Estimate:**') || trimmedLine.includes('**Effort:**')) {
        const match = trimmedLine.match(/(\d+)\s+points/);
        if (match && match[1]) epic.effort = parseInt(match[1], 10);
      }

      if (trimmedLine.includes('**Target Quarter:**') || trimmedLine.includes('**Quarter:**')) {
        const match = trimmedLine.match(/\*\*(?:Target )?Quarter:\*\*\s+(\S+)/);
        if (match && match[1]) epic.quarter = match[1];
      }

      if (trimmedLine.includes('**Owner:**')) {
        const match = trimmedLine.match(/\*\*Owner:\*\*\s+(.+?)(?:\s+\*\*|$)/);
        if (match && match[1]) epic.owner = match[1].trim();
      }

      if (trimmedLine.includes('**Status:**')) {
        const match = trimmedLine.match(/\*\*Status:\*\*\s+(.+?)(?:\s+\*\*|$)/);
        if (match && match[1]) {
          // Remove emoji and clean status
          epic.status = match[1].replace(/[📋✅⏭️🔄]/g, '').trim();
        }
      }
    }

    // Count user stories (lines starting with number + **US-)
    epic.storyCount = this.countUserStories(content);

    // Extract summary from Epic Summary section
    epic.summary = this.extractSummary(content);

    // Extract last updated from footer
    const lastUpdatedMatch = content.match(/\*\*Last Updated:\*\*\s+(\d{4}-\d{2}-\d{2})/);
    if (lastUpdatedMatch && lastUpdatedMatch[1]) {
      epic.lastUpdated = lastUpdatedMatch[1];
    }

    return epic;
  }

  /**
   * Extract epic ID from filename
   */
  private extractEpicIdFromFilename(filename: string): string {
    const match = filename.match(/^(EPIC-V\d+-\d+)/i);
    return match && match[1] ? match[1].toUpperCase() : filename.replace('.md', '');
  }

  /**
   * Count user stories in epic content
   */
  private countUserStories(content: string): number {
    const lines = content.split('\n');
    let count = 0;

    for (const line of lines) {
      // Match patterns like:
      // 1. **US-001:** Story description
      // ### US-001: Story Title
      if (/^\d+\.\s+\*\*US-\d+:/i.test(line.trim()) || /^###\s+US-\d+:/i.test(line.trim())) {
        count++;
      }
    }

    return count;
  }

  /**
   * Extract summary from Epic Summary section
   */
  private extractSummary(content: string): string {
    // Find the Summary section
    const lines = content.split('\n');
    let inSummary = false;
    const summaryLines: string[] = [];

    for (const line of lines) {
      if (/^##\s+(?:Epic\s+)?Summary/i.test(line)) {
        inSummary = true;
        continue;
      }

      if (inSummary) {
        // Stop at next section or separator
        if (line.startsWith('##') || line.startsWith('---')) {
          break;
        }
        // Skip empty lines at start
        if (summaryLines.length === 0 && line.trim() === '') {
          continue;
        }
        summaryLines.push(line);
      }
    }

    return summaryLines.join('\n').trim();
  }

  /**
   * Format result as table
   */
  private formatTable(result: StatusResult): string {
    const data = result.data;

    if (data.epics && Array.isArray(data.epics)) {
      // Multiple epics - show table
      const epics = data.epics as Epic[];

      if (epics.length === 0) {
        return 'No epics found.';
      }

      const rows: string[] = [];
      rows.push(
        '┌──────────────┬──────────────────────────────────┬──────────┬────────┬─────────┬────────────┐'
      );
      rows.push(
        '│ Epic ID      │ Name                             │ Priority │ Points │ Stories │ Status     │'
      );
      rows.push(
        '├──────────────┼──────────────────────────────────┼──────────┼────────┼─────────┼────────────┤'
      );

      for (const epic of epics) {
        const id = epic.id.padEnd(12);
        const name = this.truncate(epic.name, 32).padEnd(32);
        const priority = epic.priority.padEnd(8);
        const points = String(epic.effort).padEnd(6);
        const stories = String(epic.storyCount).padEnd(7);
        const status = this.truncate(epic.status, 10).padEnd(10);

        rows.push(`│ ${id} │ ${name} │ ${priority} │ ${points} │ ${stories} │ ${status} │`);
      }

      rows.push(
        '└──────────────┴──────────────────────────────────┴──────────┴────────┴─────────┴────────────┘'
      );
      rows.push('');
      rows.push(`Total: ${epics.length} epics`);

      return rows.join('\n');
    } else if (typeof data.id === 'string') {
      // Single epic - show details
      const epic = data as unknown as Epic;

      const rows: string[] = [];
      rows.push('┌─────────────────┬────────────────────────────────────────────────┐');
      rows.push(`│ Epic ID         │ ${epic.id.padEnd(46)} │`);
      rows.push(`│ Name            │ ${this.truncate(epic.name, 46).padEnd(46)} │`);
      rows.push(`│ Priority        │ ${epic.priority.padEnd(46)} │`);
      rows.push(
        `│ Effort          │ ${epic.effort} points${' '.repeat(46 - String(epic.effort).length - 7)} │`
      );
      rows.push(`│ Quarter         │ ${epic.quarter.padEnd(46)} │`);
      rows.push(`│ Owner           │ ${epic.owner.padEnd(46)} │`);
      rows.push(`│ Status          │ ${epic.status.padEnd(46)} │`);
      rows.push(`│ Story Count     │ ${String(epic.storyCount).padEnd(46)} │`);
      rows.push(`│ Last Updated    │ ${epic.lastUpdated.padEnd(46)} │`);
      rows.push('└─────────────────┴────────────────────────────────────────────────┘');

      if (epic.summary) {
        rows.push('');
        rows.push('Summary:');
        rows.push(this.wrapText(epic.summary, 76));
      }

      return rows.join('\n');
    } else {
      return 'No epic data available.';
    }
  }

  /**
   * Format result as markdown
   */
  private formatMarkdown(result: StatusResult): string {
    const data = result.data;

    if (data.epics && Array.isArray(data.epics)) {
      // Multiple epics - show list
      const epics = data.epics as Epic[];

      if (epics.length === 0) {
        return '**No epics found.**';
      }

      const rows: string[] = [];
      rows.push('# MADACE Epics\n');

      for (const epic of epics) {
        const statusEmoji = this.getStatusEmoji(epic.status);
        rows.push(`## ${statusEmoji} ${epic.id}: ${epic.name}\n`);
        rows.push(`- **Priority:** ${epic.priority}`);
        rows.push(`- **Effort:** ${epic.effort} points`);
        rows.push(`- **Quarter:** ${epic.quarter}`);
        rows.push(`- **Stories:** ${epic.storyCount}`);
        rows.push(`- **Status:** ${epic.status}`);
        rows.push(`- **Last Updated:** ${epic.lastUpdated}\n`);
      }

      rows.push(`---\n**Total:** ${epics.length} epics`);

      return rows.join('\n');
    } else if (typeof data.id === 'string') {
      // Single epic - show details
      const epic = data as unknown as Epic;
      const statusEmoji = this.getStatusEmoji(epic.status);

      const rows: string[] = [];
      rows.push(`# ${statusEmoji} ${epic.id}: ${epic.name}\n`);
      rows.push(
        `**Priority:** ${epic.priority} | **Effort:** ${epic.effort} points | **Quarter:** ${epic.quarter}\n`
      );
      rows.push(`## Details\n`);
      rows.push(`- **Owner:** ${epic.owner}`);
      rows.push(`- **Status:** ${epic.status}`);
      rows.push(`- **Story Count:** ${epic.storyCount}`);
      rows.push(`- **Last Updated:** ${epic.lastUpdated}\n`);

      if (epic.summary) {
        rows.push(`## Summary\n`);
        rows.push(epic.summary);
      }

      return rows.join('\n');
    } else {
      return '**No epic data available.**';
    }
  }

  /**
   * Get status emoji based on status text
   */
  private getStatusEmoji(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('planning')) return '📋';
    if (statusLower.includes('progress')) return '🔄';
    if (statusLower.includes('done') || statusLower.includes('complete')) return '✅';
    if (statusLower.includes('blocked')) return '🚫';
    return '⏭️';
  }

  /**
   * Truncate text to max length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Wrap text to specified width
   */
  private wrapText(text: string, width: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);

    return lines.join('\n');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Factory Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Create an epic status provider instance
 *
 * @param epicsDirectory - Optional path to epics directory
 * @returns EpicStatusProvider instance
 *
 * @example
 * ```typescript
 * const provider = createEpicStatusProvider();
 * const status = await provider.getStatus('EPIC-V3-001');
 * console.log(provider.formatOutput(status, 'table'));
 * ```
 */
export function createEpicStatusProvider(epicsDirectory?: string): EpicStatusProvider {
  return new EpicStatusProvider(epicsDirectory);
}

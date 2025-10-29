/**
 * State Machine Pane - Bottom-left quadrant
 *
 * Displays state machine status with story counts
 */

import blessed from 'blessed';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { FocusablePane, PanePosition } from './focus-manager';

export class StatePane implements FocusablePane {
  readonly position: PanePosition = 'bottom-left';
  private box: blessed.Widgets.BoxElement;

  constructor(screen: blessed.Widgets.Screen) {
    this.box = blessed.box({
      top: '50%',
      left: 0,
      width: '50%',
      height: '50%',
      label: ' 📊 State Machine ',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'cyan',
        },
        label: {
          fg: 'cyan',
          bold: true,
        },
      },
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
    });

    screen.append(this.box);
  }

  /**
   * Refresh state machine data
   */
  async refresh(): Promise<void> {
    try {
      // Read workflow status from file
      const statusFile = resolve(process.cwd(), 'docs/workflow-status.md');
      const content = readFileSync(statusFile, 'utf-8');

      // Extract current phase
      const phaseMatch = content.match(/\*\*Current Phase:\*\*\s*(.+)/);
      const phase = phaseMatch ? phaseMatch[1]?.trim() : 'Unknown';

      // Extract milestone stats
      const completedMatch = content.match(
        /Total Completed:\s*(\d+)\s*stories\s*\|\s*(\d+)\s*points/
      );
      const remainingMatch = content.match(
        /Total Remaining:\s*(\d+)\s*stories\s*\|\s*(\d+)\s*points/
      );

      const completedStories = completedMatch ? completedMatch[1] : '0';
      const completedPoints = completedMatch ? completedMatch[2] : '0';
      const remainingStories = remainingMatch ? remainingMatch[1] : '0';
      const remainingPoints = remainingMatch ? remainingMatch[2] : '0';

      // Count stories in each state
      const backlogCount = this.countStories(content, 'BACKLOG');
      const todoCount = this.countStories(content, 'TODO');
      const inProgressCount = this.countStories(content, 'IN PROGRESS');
      const doneCount = this.countStories(content, 'DONE');

      const lines: string[] = [];
      lines.push('{cyan-fg}{bold}Project Status{/bold}{/cyan-fg}');
      lines.push('');
      lines.push(`{white-fg}Phase:{/white-fg} ${phase}`);
      lines.push('');
      lines.push('{cyan-fg}{bold}Story Counts:{/bold}{/cyan-fg}');
      lines.push(
        `{gray-fg}  📋 BACKLOG:     {/gray-fg}{white-fg}${backlogCount.toString().padStart(2)} stories{/white-fg}`
      );
      lines.push(
        `{gray-fg}  📝 TODO:        {/gray-fg}{yellow-fg}${todoCount.toString().padStart(2)} stories{/yellow-fg}`
      );
      lines.push(
        `{gray-fg}  🔄 IN PROGRESS: {/gray-fg}{blue-fg}${inProgressCount.toString().padStart(2)} stories{/blue-fg}`
      );
      lines.push(
        `{gray-fg}  ✅ DONE:        {/gray-fg}{green-fg}${doneCount.toString().padStart(2)} stories{/green-fg}`
      );
      lines.push('');
      lines.push('{cyan-fg}{bold}Points:{/bold}{/cyan-fg}');
      lines.push(
        `{gray-fg}  Completed:  {/gray-fg}{green-fg}${completedStories} stories | ${completedPoints} points{/green-fg}`
      );
      lines.push(
        `{gray-fg}  Remaining:  {/gray-fg}{yellow-fg}${remainingStories} stories | ${remainingPoints} points{/yellow-fg}`
      );

      this.box.setContent(lines.join('\n'));
    } catch {
      this.box.setContent('{red-fg}Error loading state{/red-fg}');
    }
  }

  /**
   * Count stories in a specific section
   */
  private countStories(content: string, section: string): number {
    const sectionRegex = new RegExp(`## ${section}([\\s\\S]*?)(?=##|$)`, 'i');
    const match = content.match(sectionRegex);

    if (!match || !match[1]) {
      return 0;
    }

    const sectionContent = match[1];

    // Count story markers: - [ ] or - ✅ or - 🔄 followed by [STORY-ID]
    const storyMatches = sectionContent.match(/- (?:\[[ x✓]\]|[✅🔄]) \[[\w-]+\]/g);

    return storyMatches ? storyMatches.length : 0;
  }

  /**
   * Focus this pane
   */
  focus(): void {
    this.box.focus();
    this.box.style.border = { fg: 'yellow' };
  }

  /**
   * Unfocus this pane
   */
  unfocus(): void {
    this.box.style.border = { fg: 'cyan' };
  }
}

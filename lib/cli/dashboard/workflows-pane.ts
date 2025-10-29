/**
 * Workflows Pane - Top-right quadrant
 *
 * Displays list of workflows with progress indicators
 */

import blessed from 'blessed';
import type { FocusablePane, PanePosition } from './focus-manager';

export class WorkflowsPane implements FocusablePane {
  readonly position: PanePosition = 'top-right';
  private box: blessed.Widgets.BoxElement;

  constructor(screen: blessed.Widgets.Screen) {
    this.box = blessed.box({
      top: 0,
      left: '50%',
      width: '50%',
      height: '50%',
      label: ' 🔄 Workflows ',
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
   * Refresh workflows data
   */
  async refresh(): Promise<void> {
    try {
      // TODO: Fetch workflows from database when Milestone 3.3 is implemented
      const lines: string[] = [];
      lines.push('{cyan-fg}{bold}Workflow System{/bold}{/cyan-fg}');
      lines.push('');
      lines.push('{yellow-fg}⚠️  Workflow system not yet implemented{/yellow-fg}');
      lines.push('');
      lines.push('{gray-fg}This feature will be available in Milestone 3.3{/gray-fg}');
      lines.push('');
      lines.push('{gray-fg}Planned workflows:{/gray-fg}');
      lines.push('  • scale-adaptive-route.workflow.yaml');
      lines.push('  • data-processing.workflow.yaml');
      lines.push('  • nested-workflow.workflow.yaml');

      this.box.setContent(lines.join('\n'));
    } catch {
      this.box.setContent('{red-fg}Error loading workflows{/red-fg}');
    }
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

/**
 * Logs Pane - Bottom-right quadrant
 *
 * Displays last 20 lines of system logs
 */

import blessed from 'blessed';
import type { FocusablePane, PanePosition } from './focus-manager';

export class LogsPane implements FocusablePane {
  readonly position: PanePosition = 'bottom-right';
  private box: blessed.Widgets.BoxElement;
  private logs: string[] = [];
  private readonly MAX_LOGS = 20;

  constructor(screen: blessed.Widgets.Screen) {
    this.box = blessed.box({
      top: '50%',
      left: '50%',
      width: '50%',
      height: '50%',
      label: ' 📝 Logs ',
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

    // Add initial log
    this.addLog('Dashboard started', 'info');
  }

  /**
   * Add a log entry
   */
  addLog(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const color = this.getLevelColor(level);
    const levelLabel = level.toUpperCase().padEnd(5);

    this.logs.push(
      `{gray-fg}${timestamp}{/gray-fg} {${color}}[${levelLabel}]{/${color}} ${message}`
    );

    // Keep only last MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    this.render();
  }

  /**
   * Get color for log level
   */
  private getLevelColor(level: string): string {
    switch (level) {
      case 'error':
        return 'red-fg';
      case 'warn':
        return 'yellow-fg';
      case 'info':
      default:
        return 'cyan-fg';
    }
  }

  /**
   * Render logs to box
   */
  private render(): void {
    if (this.logs.length === 0) {
      this.box.setContent('{gray-fg}No logs yet...{/gray-fg}');
      return;
    }

    const lines: string[] = [];
    lines.push('{cyan-fg}{bold}Recent Activity{/bold}{/cyan-fg}');
    lines.push('');
    lines.push(...this.logs);

    this.box.setContent(lines.join('\n'));
  }

  /**
   * Refresh logs data
   */
  async refresh(): Promise<void> {
    // Add a refresh log entry
    const now = new Date();
    if (now.getSeconds() % 15 === 0) {
      // Only log every 15 seconds during refresh
      this.addLog('Dashboard refreshed', 'info');
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

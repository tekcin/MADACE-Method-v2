/**
 * Agents Pane - Top-left quadrant
 *
 * Displays list of agents with status indicators
 */

import blessed from 'blessed';
import { listAgents, getAgent } from '@/lib/services/agent-service';
import type { FocusablePane, PanePosition } from './focus-manager';

export class AgentsPane implements FocusablePane {
  readonly position: PanePosition = 'top-left';
  private box: blessed.Widgets.BoxElement;
  private detailBox: blessed.Widgets.BoxElement | null = null;
  private agentIds: string[] = [];
  private selectedIndex = 0;

  constructor(screen: blessed.Widgets.Screen) {
    this.box = blessed.box({
      top: 0,
      left: 0,
      width: '50%',
      height: '50%',
      label: ' 🤖 Agents ',
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
   * Refresh agents data
   */
  async refresh(): Promise<void> {
    try {
      const agents = await listAgents({ limit: 100 });

      if (agents.length === 0) {
        this.box.setContent('{yellow-fg}No agents found{/yellow-fg}');
        this.agentIds = [];
        return;
      }

      // Store agent IDs for detail view
      this.agentIds = agents.map((a) => a.id);

      const lines: string[] = [];
      lines.push('{cyan-fg}{bold}Total: ' + agents.length + ' agents{/bold}{/cyan-fg}');
      lines.push('');

      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        if (!agent) continue;
        const icon = agent.icon || '🤖';
        const statusColor = this.getStatusColor('idle'); // All idle for now
        const name = agent.name.padEnd(15);
        const moduleName = `[${agent.module}]`.padEnd(6);
        const prefix = i === this.selectedIndex ? '▶ ' : '  ';

        lines.push(
          `${prefix}${statusColor}●{/${statusColor}}  ${icon} ${name} ${moduleName} ${agent.title}`
        );
      }

      this.box.setContent(lines.join('\n'));
    } catch {
      this.box.setContent('{red-fg}Error loading agents{/red-fg}');
      this.agentIds = [];
    }
  }

  /**
   * Get color for status indicator
   */
  private getStatusColor(status: string): string {
    switch (status) {
      case 'running':
        return 'green-fg';
      case 'pending':
        return 'yellow-fg';
      case 'error':
        return 'red-fg';
      case 'idle':
      default:
        return 'gray-fg';
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

  /**
   * Check if drill-down is available
   */
  canDrillDown(): boolean {
    return this.agentIds.length > 0;
  }

  /**
   * Show agent detail view
   */
  async showDetail(): Promise<void> {
    if (this.agentIds.length === 0) {
      return;
    }

    try {
      const agentId = this.agentIds[this.selectedIndex];
      if (!agentId) return;

      const agent = await getAgent(agentId);
      if (!agent) return;

      // Create detail box if not exists
      if (!this.detailBox) {
        this.detailBox = blessed.box({
          parent: this.box.screen,
          top: 'center',
          left: 'center',
          width: '80%',
          height: '80%',
          label: ' Agent Details (Press ESC to close) ',
          border: {
            type: 'line',
          },
          style: {
            border: {
              fg: 'yellow',
            },
            label: {
              fg: 'yellow',
              bold: true,
            },
          },
          tags: true,
          scrollable: true,
          alwaysScroll: true,
          mouse: true,
          keys: true,
        });
      }

      // Build detail content
      const lines: string[] = [];
      lines.push(`{cyan-fg}{bold}${agent.icon || '🤖'} ${agent.title}{/bold}{/cyan-fg}`);
      lines.push('');
      lines.push(`{gray-fg}ID:{/gray-fg} ${agent.id}`);
      lines.push(`{gray-fg}Name:{/gray-fg} ${agent.name}`);
      lines.push(`{gray-fg}Module:{/gray-fg} ${agent.module}`);
      lines.push(`{gray-fg}Version:{/gray-fg} ${agent.version}`);

      // Parse persona if it exists
      if (agent.persona) {
        const persona =
          typeof agent.persona === 'string'
            ? JSON.parse(agent.persona)
            : (agent.persona as Record<string, unknown>);

        if (persona.role) {
          lines.push('');
          lines.push(`{cyan-fg}{bold}Role:{/bold}{/cyan-fg}`);
          lines.push(String(persona.role));
        }

        if (persona.identity) {
          lines.push('');
          lines.push(`{cyan-fg}{bold}Identity:{/bold}{/cyan-fg}`);
          lines.push(String(persona.identity));
        }

        if (persona.communication_style) {
          lines.push('');
          lines.push(`{cyan-fg}{bold}Communication Style:{/bold}{/cyan-fg}`);
          lines.push(String(persona.communication_style));
        }

        if (Array.isArray(persona.principles) && persona.principles.length > 0) {
          lines.push('');
          lines.push(`{cyan-fg}{bold}Principles:{/bold}{/cyan-fg}`);
          for (const principle of persona.principles) {
            lines.push(`  • ${String(principle)}`);
          }
        }
      }

      // Show memory count
      if (agent.memories && agent.memories.length > 0) {
        lines.push('');
        lines.push(
          `{cyan-fg}{bold}Memories:{/bold}{/cyan-fg} ${agent.memories.length} recent memories`
        );
      }

      // Show project
      if (agent.project) {
        lines.push('');
        lines.push(`{cyan-fg}{bold}Project:{/bold}{/cyan-fg} ${agent.project.name}`);
      }

      this.detailBox.setContent(lines.join('\n'));
      this.detailBox.show();
      this.detailBox.focus();
      this.box.screen.render();
    } catch {
      // Silently fail - detail view won't show
    }
  }

  /**
   * Hide agent detail view
   */
  hideDetail(): void {
    if (this.detailBox) {
      this.detailBox.hide();
      this.box.focus();
      this.box.screen.render();
    }
  }
}

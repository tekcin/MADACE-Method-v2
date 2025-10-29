/**
 * MADACE Terminal Dashboard
 *
 * Real-time terminal UI (TUI) showing project status, agents, workflows, and logs
 */

import blessed from 'blessed';
import { AgentsPane } from './agents-pane';
import { WorkflowsPane } from './workflows-pane';
import { StatePane } from './state-pane';
import { LogsPane } from './logs-pane';
import { FocusManager } from './focus-manager';

/**
 * Dashboard Main Class
 */
export class Dashboard {
  private screen: blessed.Widgets.Screen;
  private agentsPane: AgentsPane;
  private workflowsPane: WorkflowsPane;
  private statePane: StatePane;
  private logsPane: LogsPane;
  private focusManager: FocusManager;
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_RATE = 5000; // 5 seconds

  constructor() {
    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'MADACE Dashboard',
      fullUnicode: true,
    });

    // Create panes
    this.agentsPane = new AgentsPane(this.screen);
    this.workflowsPane = new WorkflowsPane(this.screen);
    this.statePane = new StatePane(this.screen);
    this.logsPane = new LogsPane(this.screen);

    // Create focus manager and register panes
    this.focusManager = new FocusManager();
    this.focusManager.registerPane(this.agentsPane);
    this.focusManager.registerPane(this.workflowsPane);
    this.focusManager.registerPane(this.statePane);
    this.focusManager.registerPane(this.logsPane);

    // Setup keyboard handlers
    this.setupKeyHandlers();
  }

  /**
   * Setup keyboard event handlers
   */
  private setupKeyHandlers(): void {
    // Quit on 'q' or 'Ctrl+C'
    this.screen.key(['q', 'C-c'], () => {
      this.stop();
    });

    // Manual refresh on 'r'
    this.screen.key(['r'], async () => {
      await this.refreshData();
      this.screen.render();
    });

    // Arrow key navigation
    this.screen.key(['up'], () => {
      this.focusManager.navigateWithArrow('up');
      this.screen.render();
    });

    this.screen.key(['down'], () => {
      this.focusManager.navigateWithArrow('down');
      this.screen.render();
    });

    this.screen.key(['left'], () => {
      this.focusManager.navigateWithArrow('left');
      this.screen.render();
    });

    this.screen.key(['right'], () => {
      this.focusManager.navigateWithArrow('right');
      this.screen.render();
    });

    // Tab to cycle through panes (clockwise)
    this.screen.key(['tab'], () => {
      this.focusManager.cycleNext();
      this.screen.render();
    });

    // Enter to show detail view
    this.screen.key(['enter'], () => {
      this.focusManager.enterDetailView();
      this.screen.render();
    });

    // Escape to exit detail view
    this.screen.key(['escape'], () => {
      this.focusManager.exitDetailView();
      this.screen.render();
    });
  }

  /**
   * Refresh all panes with latest data
   */
  private async refreshData(): Promise<void> {
    try {
      await Promise.all([
        this.agentsPane.refresh(),
        this.workflowsPane.refresh(),
        this.statePane.refresh(),
        this.logsPane.refresh(),
      ]);
    } catch {
      // Silently handle errors - they'll be logged by individual panes
    }
  }

  /**
   * Start the dashboard
   */
  async start(): Promise<void> {
    // Initial data load
    await this.refreshData();

    // Render screen
    this.screen.render();

    // Start auto-refresh
    this.refreshInterval = setInterval(async () => {
      await this.refreshData();
      this.screen.render();
    }, this.REFRESH_RATE);

    // Focus on agents pane by default (top-left)
    this.focusManager.focusPane('top-left');
  }

  /**
   * Stop the dashboard and cleanup
   */
  stop(): void {
    // Clear refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    // Destroy screen
    this.screen.destroy();

    // Exit process
    process.exit(0);
  }
}

/**
 * Create and start dashboard
 */
export async function startDashboard(): Promise<void> {
  const dashboard = new Dashboard();
  await dashboard.start();
}

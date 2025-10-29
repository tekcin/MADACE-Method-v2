/**
 * Focus Manager - Handles keyboard navigation between dashboard panes
 *
 * Supports:
 * - Arrow key navigation (up, down, left, right)
 * - Tab key cycling (clockwise)
 * - Enter key for drill-down views
 * - Escape key to return to main view
 */

export type PanePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface FocusablePane {
  position: PanePosition;
  focus(): void;
  unfocus(): void;
  canDrillDown?(): boolean;
  showDetail?(): void;
  hideDetail?(): void;
}

/**
 * FocusManager coordinates keyboard navigation between panes
 */
export class FocusManager {
  private panes: Map<PanePosition, FocusablePane> = new Map();
  private currentPosition: PanePosition = 'top-left';
  private isDetailView = false;

  /**
   * Register a pane for focus management
   */
  registerPane(pane: FocusablePane): void {
    this.panes.set(pane.position, pane);
  }

  /**
   * Get current focused position
   */
  getCurrentPosition(): PanePosition {
    return this.currentPosition;
  }

  /**
   * Check if in detail view mode
   */
  isInDetailView(): boolean {
    return this.isDetailView;
  }

  /**
   * Focus a specific pane
   */
  focusPane(position: PanePosition): void {
    // Unfocus current pane
    const currentPane = this.panes.get(this.currentPosition);
    if (currentPane) {
      currentPane.unfocus();
    }

    // Focus new pane
    this.currentPosition = position;
    const newPane = this.panes.get(position);
    if (newPane) {
      newPane.focus();
    }
  }

  /**
   * Navigate with arrow keys
   */
  navigateWithArrow(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.isDetailView) {
      // In detail view, arrow keys scroll within the view
      return;
    }

    let newPosition: PanePosition | null = null;

    switch (direction) {
      case 'up':
        if (this.currentPosition === 'bottom-left') {
          newPosition = 'top-left';
        } else if (this.currentPosition === 'bottom-right') {
          newPosition = 'top-right';
        }
        break;

      case 'down':
        if (this.currentPosition === 'top-left') {
          newPosition = 'bottom-left';
        } else if (this.currentPosition === 'top-right') {
          newPosition = 'bottom-right';
        }
        break;

      case 'left':
        if (this.currentPosition === 'top-right') {
          newPosition = 'top-left';
        } else if (this.currentPosition === 'bottom-right') {
          newPosition = 'bottom-left';
        }
        break;

      case 'right':
        if (this.currentPosition === 'top-left') {
          newPosition = 'top-right';
        } else if (this.currentPosition === 'bottom-left') {
          newPosition = 'bottom-right';
        }
        break;
    }

    if (newPosition) {
      this.focusPane(newPosition);
    }
  }

  /**
   * Cycle through panes with Tab (clockwise)
   */
  cycleNext(): void {
    if (this.isDetailView) {
      return;
    }

    const cycle: PanePosition[] = [
      'top-left',
      'top-right',
      'bottom-right',
      'bottom-left',
    ];

    const currentIndex = cycle.indexOf(this.currentPosition);
    const nextIndex = (currentIndex + 1) % cycle.length;
    this.focusPane(cycle[nextIndex] as PanePosition);
  }

  /**
   * Enter drill-down view
   */
  enterDetailView(): void {
    if (this.isDetailView) {
      return;
    }

    const pane = this.panes.get(this.currentPosition);
    if (pane?.canDrillDown && pane.canDrillDown()) {
      this.isDetailView = true;
      pane.showDetail?.();
    }
  }

  /**
   * Exit drill-down view
   */
  exitDetailView(): void {
    if (!this.isDetailView) {
      return;
    }

    const pane = this.panes.get(this.currentPosition);
    if (pane?.hideDetail) {
      pane.hideDetail();
    }
    this.isDetailView = false;
  }

  /**
   * Reset focus to top-left pane
   */
  reset(): void {
    this.isDetailView = false;
    this.focusPane('top-left');
  }
}

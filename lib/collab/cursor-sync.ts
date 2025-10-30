/**
 * Cursor Synchronization Module
 *
 * Synchronizes cursor positions between users in real-time.
 * Uses Monaco Editor decorations to render remote cursors.
 */

import type { editor as MonacoEditor } from 'monaco-editor';
import { getPresenceManager, type CursorPosition, type UserPresence } from './presence-manager';

/**
 * Monaco cursor decoration with user info
 */
export interface CursorDecoration {
  userId: string;
  decorationIds: string[]; // Monaco decoration IDs (cursor + label)
  position: CursorPosition;
  color: string;
  userName: string;
}

/**
 * Cursor Sync Manager
 *
 * Manages cursor synchronization between Monaco Editor and Yjs Awareness.
 */
export class CursorSyncManager {
  private editor: MonacoEditor.IStandaloneCodeEditor | null = null;
  private presenceManager = getPresenceManager();
  private decorations: Map<string, CursorDecoration> = new Map();
  private throttleTimer: NodeJS.Timeout | null = null;
  private lastCursorUpdate = 0;
  private readonly THROTTLE_MS = 50; // 50ms throttle for cursor updates

  /**
   * Initialize cursor sync with Monaco Editor
   *
   * @param editor - Monaco Editor instance
   */
  initialize(editor: MonacoEditor.IStandaloneCodeEditor): void {
    this.editor = editor;

    // Listen to local cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      this.handleLocalCursorChange(e.position);
    });

    // Listen to local selection changes
    editor.onDidChangeCursorSelection((e) => {
      this.handleLocalSelectionChange(e.selection);
    });

    // Listen to presence changes (remote users' cursors)
    this.presenceManager.onPresenceChange((users) => {
      this.updateRemoteCursors(users);
    });

    console.log('[CursorSync] Initialized with Monaco Editor');
  }

  /**
   * Handle local cursor position change
   *
   * Throttles updates to 50ms to avoid performance issues.
   */
  private handleLocalCursorChange(position: { lineNumber: number; column: number }): void {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastCursorUpdate;

    // Clear existing throttle timer
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
    }

    // If enough time has passed, update immediately
    if (timeSinceLastUpdate >= this.THROTTLE_MS) {
      this.updateLocalCursor(position);
      this.lastCursorUpdate = now;
    } else {
      // Otherwise, schedule update after remaining time
      const remaining = this.THROTTLE_MS - timeSinceLastUpdate;
      this.throttleTimer = setTimeout(() => {
        this.updateLocalCursor(position);
        this.lastCursorUpdate = Date.now();
      }, remaining);
    }
  }

  /**
   * Update local cursor position in presence manager
   */
  private updateLocalCursor(position: { lineNumber: number; column: number }): void {
    const cursorPos: CursorPosition = {
      line: position.lineNumber,
      column: position.column,
    };

    this.presenceManager.updateCursor(cursorPos);
  }

  /**
   * Handle local selection change
   */
  private handleLocalSelectionChange(selection: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  }): void {
    // Only update if there's an actual selection (not just cursor)
    if (
      selection.startLineNumber === selection.endLineNumber &&
      selection.startColumn === selection.endColumn
    ) {
      // No selection, just cursor
      this.presenceManager.updateSelection(null);
    } else {
      // There's a selection
      this.presenceManager.updateSelection({
        start: {
          line: selection.startLineNumber,
          column: selection.startColumn,
        },
        end: {
          line: selection.endLineNumber,
          column: selection.endColumn,
        },
      });
    }
  }

  /**
   * Update remote cursors in Monaco Editor
   */
  private updateRemoteCursors(users: UserPresence[]): void {
    if (!this.editor) return;

    const model = this.editor.getModel();
    if (!model) return;

    // Get users with cursor positions
    const usersWithCursors = users.filter((user) => user.cursor !== undefined);

    // Remove decorations for users who left or have no cursor
    const currentUserIds = new Set(usersWithCursors.map((u) => u.id));
    this.decorations.forEach((decoration, userId) => {
      if (!currentUserIds.has(userId)) {
        // Remove decoration
        model.deltaDecorations(decoration.decorationIds, []);
        this.decorations.delete(userId);
      }
    });

    // Add/update decorations for users with cursors
    usersWithCursors.forEach((user) => {
      if (!user.cursor) return;

      const { line, column } = user.cursor;

      // Create cursor decoration
      const cursorDecoration: MonacoEditor.IModelDeltaDecoration = {
        range: {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column,
        },
        options: {
          className: `remote-cursor remote-cursor-${user.id}`,
          stickiness: 1, // NeverGrowsWhenTypingAtEdges
          beforeContentClassName: 'remote-cursor-line',
        },
      };

      // Create label decoration (user name above cursor)
      const labelDecoration: MonacoEditor.IModelDeltaDecoration = {
        range: {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column,
        },
        options: {
          className: `remote-cursor-label remote-cursor-label-${user.id}`,
          glyphMarginClassName: 'remote-cursor-glyph',
          stickiness: 1,
          after: {
            content: ` ${user.name} `,
            inlineClassName: `remote-cursor-name remote-cursor-name-${user.id}`,
          },
        },
      };

      // Handle selection decoration if user has selection
      let selectionDecoration: MonacoEditor.IModelDeltaDecoration | null = null;
      if (user.selection) {
        selectionDecoration = {
          range: {
            startLineNumber: user.selection.start.line,
            startColumn: user.selection.start.column,
            endLineNumber: user.selection.end.line,
            endColumn: user.selection.end.column,
          },
          options: {
            className: `remote-selection remote-selection-${user.id}`,
            stickiness: 1,
          },
        };
      }

      // Get existing decoration for this user
      const existingDecoration = this.decorations.get(user.id);

      // Update or create decorations
      const newDecorationIds = model.deltaDecorations(
        existingDecoration?.decorationIds || [],
        selectionDecoration
          ? [cursorDecoration, labelDecoration, selectionDecoration]
          : [cursorDecoration, labelDecoration]
      );

      // Store decoration info
      this.decorations.set(user.id, {
        userId: user.id,
        decorationIds: newDecorationIds,
        position: user.cursor,
        color: user.color,
        userName: user.name,
      });

      // Inject CSS for this user's cursor color (if not already injected)
      this.injectCursorStyles(user.id, user.color);
    });
  }

  /**
   * Inject CSS styles for remote cursor color
   */
  private injectCursorStyles(userId: string, color: string): void {
    // Check if style already exists
    if (document.getElementById(`cursor-style-${userId}`)) {
      return;
    }

    // Create style element
    const style = document.createElement('style');
    style.id = `cursor-style-${userId}`;
    style.textContent = `
      .remote-cursor-${userId} {
        border-left: 2px solid ${color};
        position: relative;
      }

      .remote-cursor-name-${userId} {
        background-color: ${color};
        color: white;
        padding: 2px 6px;
        border-radius: 4px 4px 4px 0;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        position: absolute;
        top: -20px;
        left: -2px;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

      .remote-selection-${userId} {
        background-color: ${color}33; /* 20% opacity */
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Clear all remote cursors
   */
  clearRemoteCursors(): void {
    if (!this.editor) return;

    const model = this.editor.getModel();
    if (!model) return;

    // Remove all decorations
    this.decorations.forEach((decoration) => {
      model.deltaDecorations(decoration.decorationIds, []);
    });

    this.decorations.clear();
  }

  /**
   * Destroy cursor sync manager
   */
  destroy(): void {
    // Clear throttle timer
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }

    // Clear decorations
    this.clearRemoteCursors();

    // Remove injected styles
    this.decorations.forEach((decoration) => {
      const style = document.getElementById(`cursor-style-${decoration.userId}`);
      if (style) {
        style.remove();
      }
    });

    this.decorations.clear();
    this.editor = null;

    console.log('[CursorSync] Destroyed');
  }
}

// Singleton instance
let cursorSyncInstance: CursorSyncManager | null = null;

/**
 * Get cursor sync manager singleton
 */
export function getCursorSyncManager(): CursorSyncManager {
  if (!cursorSyncInstance) {
    cursorSyncInstance = new CursorSyncManager();
  }
  return cursorSyncInstance;
}

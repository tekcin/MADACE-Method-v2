/**
 * Presence Manager for Real-time Collaboration
 *
 * Tracks online users using Yjs Awareness API.
 * Manages user presence, colors, and status for collaborative sessions.
 */

import type * as Y from 'yjs';
import type { Awareness } from 'y-protocols/awareness';

/**
 * User presence information
 */
export interface UserPresence {
  id: string;
  name: string;
  email?: string;
  avatar?: string; // URL or base64 image
  color: string; // Hex color for cursor/selection
  cursor?: CursorPosition; // Current cursor position in editor
  selection?: SelectionRange; // Current selection range
  status: 'online' | 'idle' | 'away';
  lastSeen: number; // Timestamp
}

/**
 * Cursor position in editor
 */
export interface CursorPosition {
  line: number;
  column: number;
}

/**
 * Selection range in editor
 */
export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
}

/**
 * Predefined color palette for user cursors
 * 10 distinct colors that are easily distinguishable
 */
export const COLOR_PALETTE: string[] = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Orange
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#EF4444', // Red
  '#F59E0B', // Yellow
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
];

/**
 * Presence change callback
 */
export type PresenceChangeCallback = (users: UserPresence[]) => void;

/**
 * User join callback
 */
export type UserJoinCallback = (user: UserPresence) => void;

/**
 * User leave callback
 */
export type UserLeaveCallback = (userId: string) => void;

/**
 * Presence Manager
 *
 * Manages user presence using Yjs Awareness API.
 */
export class PresenceManager {
  private awareness: Awareness | null = null;
  private localUserId: string | null = null;
  private assignedColors: Map<string, string> = new Map();
  private nextColorIndex = 0;

  // Callbacks
  private presenceCallbacks: Set<PresenceChangeCallback> = new Set();
  private joinCallbacks: Set<UserJoinCallback> = new Set();
  private leaveCallbacks: Set<UserLeaveCallback> = new Set();

  /**
   * Initialize presence manager with Yjs Awareness
   *
   * @param awareness - Yjs Awareness instance
   * @param userId - Local user ID
   * @param userName - Local user name
   * @param userEmail - Local user email (optional)
   * @param userAvatar - Local user avatar URL (optional)
   */
  initialize(
    awareness: Awareness,
    userId: string,
    userName: string,
    userEmail?: string,
    userAvatar?: string
  ): void {
    this.awareness = awareness;
    this.localUserId = userId;

    // Assign color to local user
    const color = this.assignColor(userId);

    // Set local user presence
    const localPresence: UserPresence = {
      id: userId,
      name: userName,
      email: userEmail,
      avatar: userAvatar,
      color,
      status: 'online',
      lastSeen: Date.now(),
    };

    awareness.setLocalStateField('user', localPresence);

    // Listen to awareness changes
    awareness.on('change', this.handleAwarenessChange.bind(this));

    console.log(`[PresenceManager] Initialized for user: ${userName} (${userId})`);
  }

  /**
   * Handle awareness changes (users joining/leaving)
   */
  private handleAwarenessChange(
    changes: {
      added: number[];
      updated: number[];
      removed: number[];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    origin: any
  ): void {
    if (!this.awareness) return;

    const states = this.awareness.getStates();

    // Handle added users (joins)
    changes.added.forEach((clientId) => {
      const state = states.get(clientId);
      if (state?.user) {
        const user = state.user as UserPresence;
        console.log(`[PresenceManager] User joined: ${user.name} (${user.id})`);

        // Notify join callbacks
        this.joinCallbacks.forEach((callback) => callback(user));
      }
    });

    // Handle removed users (leaves)
    changes.removed.forEach((clientId) => {
      // We can't get the user info anymore since they're removed
      // The awareness state will have been cleared
      console.log(`[PresenceManager] User left: clientId ${clientId}`);

      // Extract userId from awareness meta if available
      const userId = this.getUserIdByClientId(clientId);
      if (userId) {
        // Notify leave callbacks
        this.leaveCallbacks.forEach((callback) => callback(userId));
      }
    });

    // Notify presence change callbacks with current users
    const users = this.getOnlineUsers();
    this.presenceCallbacks.forEach((callback) => callback(users));
  }

  /**
   * Get user ID by client ID (from removed states)
   * This is a fallback for when we can't access the user state anymore
   */
  private getUserIdByClientId(clientId: number): string | null {
    // Try to find userId in assigned colors map
    // This assumes we tracked clientId → userId mapping somewhere
    // For simplicity, we'll just return clientId as string
    return clientId.toString();
  }

  /**
   * Assign a unique color to a user
   */
  private assignColor(userId: string): string {
    // Check if user already has a color
    if (this.assignedColors.has(userId)) {
      return this.assignedColors.get(userId)!;
    }

    // Assign next color from palette
    const color = COLOR_PALETTE[this.nextColorIndex % COLOR_PALETTE.length];
    this.nextColorIndex++;

    // Ensure color is defined (should always be due to modulo operation)
    if (!color) {
      throw new Error('Failed to assign color from palette');
    }

    this.assignedColors.set(userId, color);
    return color;
  }

  /**
   * Get all online users (excluding local user if specified)
   */
  getOnlineUsers(excludeLocal = false): UserPresence[] {
    if (!this.awareness) return [];

    const states = this.awareness.getStates();
    const users: UserPresence[] = [];

    states.forEach((state) => {
      if (state?.user) {
        const user = state.user as UserPresence;

        // Exclude local user if requested
        if (excludeLocal && user.id === this.localUserId) {
          return;
        }

        users.push(user);
      }
    });

    return users;
  }

  /**
   * Get user count (excluding local user)
   */
  getUserCount(excludeLocal = true): number {
    return this.getOnlineUsers(excludeLocal).length;
  }

  /**
   * Update local user cursor position
   */
  updateCursor(position: CursorPosition): void {
    if (!this.awareness) return;

    const currentState = this.awareness.getLocalState();
    const user = currentState?.user as UserPresence | undefined;

    if (user) {
      this.awareness.setLocalStateField('user', {
        ...user,
        cursor: position,
        lastSeen: Date.now(),
      });
    }
  }

  /**
   * Update local user selection range
   */
  updateSelection(range: SelectionRange | null): void {
    if (!this.awareness) return;

    const currentState = this.awareness.getLocalState();
    const user = currentState?.user as UserPresence | undefined;

    if (user) {
      this.awareness.setLocalStateField('user', {
        ...user,
        selection: range || undefined,
        lastSeen: Date.now(),
      });
    }
  }

  /**
   * Update local user status
   */
  updateStatus(status: 'online' | 'idle' | 'away'): void {
    if (!this.awareness) return;

    const currentState = this.awareness.getLocalState();
    const user = currentState?.user as UserPresence | undefined;

    if (user) {
      this.awareness.setLocalStateField('user', {
        ...user,
        status,
        lastSeen: Date.now(),
      });
    }
  }

  /**
   * Get remote user cursors (excluding local user)
   */
  getRemoteCursors(): Array<UserPresence & { cursor: CursorPosition }> {
    const users = this.getOnlineUsers(true); // Exclude local user
    return users.filter((user) => user.cursor !== undefined) as Array<
      UserPresence & { cursor: CursorPosition }
    >;
  }

  /**
   * Register callback for presence changes
   */
  onPresenceChange(callback: PresenceChangeCallback): () => void {
    this.presenceCallbacks.add(callback);
    return () => this.presenceCallbacks.delete(callback);
  }

  /**
   * Register callback for user join
   */
  onUserJoin(callback: UserJoinCallback): () => void {
    this.joinCallbacks.add(callback);
    return () => this.joinCallbacks.delete(callback);
  }

  /**
   * Register callback for user leave
   */
  onUserLeave(callback: UserLeaveCallback): () => void {
    this.leaveCallbacks.add(callback);
    return () => this.leaveCallbacks.delete(callback);
  }

  /**
   * Destroy presence manager
   */
  destroy(): void {
    if (this.awareness) {
      this.awareness.off('change', this.handleAwarenessChange.bind(this));
      this.awareness = null;
    }

    this.presenceCallbacks.clear();
    this.joinCallbacks.clear();
    this.leaveCallbacks.clear();
    this.assignedColors.clear();

    console.log('[PresenceManager] Destroyed');
  }
}

// Singleton instance
let presenceManagerInstance: PresenceManager | null = null;

/**
 * Get presence manager singleton
 */
export function getPresenceManager(): PresenceManager {
  if (!presenceManagerInstance) {
    presenceManagerInstance = new PresenceManager();
  }
  return presenceManagerInstance;
}

/**
 * Shared Collaboration Types
 *
 * This file contains types and enums that are shared between
 * client and server collab code, without importing Node.js-only modules.
 */

/**
 * Collaboration Events
 *
 * Events emitted by the WebSocket server for collaboration features
 */
export enum CollabEvent {
  // Connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',

  // Presence events
  PRESENCE_JOIN = 'presence:join',
  PRESENCE_LEAVE = 'presence:leave',
  PRESENCE_UPDATE = 'presence:update',
  PRESENCE_LIST = 'presence:list',

  // Cursor events
  CURSOR_MOVE = 'cursor:move',
  CURSOR_UPDATE = 'cursor:update',

  // Document sync events
  SYNC_UPDATE = 'sync:update',
  SYNC_REQUEST = 'sync:request',
  SYNC_RESPONSE = 'sync:response',

  // Chat events
  CHAT_MESSAGE = 'chat:message',
  CHAT_HISTORY = 'chat:history',
  CHAT_REQUEST = 'chat:request',
}

/**
 * User Presence Status
 */
export type PresenceStatus = 'online' | 'idle' | 'offline';

/**
 * User Presence Information
 */
export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  status: PresenceStatus;
  lastSeen: number;
  cursor?: {
    x: number;
    y: number;
    color?: string;
  };
}

/**
 * Cursor Position
 */
export interface CursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color?: string;
}

/**
 * Chat Message
 */
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
}

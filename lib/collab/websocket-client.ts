/**
 * WebSocket Client for Real-time Collaboration
 *
 * Client-side WebSocket connection manager using Socket.IO client.
 * Handles connection lifecycle, room joining, and file sync events.
 */

'use client';

import { io, Socket } from 'socket.io-client';
import type { CollabUser, FileOperationPayload } from './websocket-server';

/**
 * WebSocket connection status
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * Event callback types
 */
export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type RoomUsersCallback = (users: CollabUser[]) => void;
export type FileOperationCallback = (payload: FileOperationPayload) => void;

/**
 * WebSocket Client Manager
 *
 * Manages client-side WebSocket connection and provides methods
 * for joining rooms and sending/receiving collaboration events.
 */
export class WebSocketClient {
  private socket: Socket | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private currentRoomId: string | null = null;
  private currentUser: CollabUser | null = null;

  // Event callbacks
  private statusCallbacks: Set<ConnectionStatusCallback> = new Set();
  private roomUsersCallbacks: Set<RoomUsersCallback> = new Set();
  private fileOpenCallbacks: Set<FileOperationCallback> = new Set();
  private fileEditCallbacks: Set<FileOperationCallback> = new Set();
  private fileCloseCallbacks: Set<FileOperationCallback> = new Set();
  private fileSaveCallbacks: Set<FileOperationCallback> = new Set();

  /**
   * Connect to WebSocket server
   *
   * @param serverUrl - WebSocket server URL (default: current origin)
   * @param options - Socket.IO client options
   */
  connect(
    serverUrl?: string,
    options?: {
      path?: string;
      transports?: string[];
      reconnection?: boolean;
      reconnectionDelay?: number;
      reconnectionAttempts?: number;
    }
  ): void {
    if (this.socket?.connected) {
      console.warn('[WebSocketClient] Already connected');
      return;
    }

    const url = serverUrl || window.location.origin;

    this.socket = io(url, {
      path: options?.path || '/api/v3/collab/ws',
      transports: options?.transports || ['websocket', 'polling'],
      reconnection: options?.reconnection !== false,
      reconnectionDelay: options?.reconnectionDelay || 1000,
      reconnectionAttempts: options?.reconnectionAttempts || 5,
    });

    this.setupEventListeners();
    this.updateStatus(ConnectionStatus.CONNECTING);

    console.log('[WebSocketClient] Connecting to:', url);
  }

  /**
   * Set up Socket.IO event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) {
      return;
    }

    // Connection events
    this.socket.on('connect', () => {
      console.log('[WebSocketClient] Connected:', this.socket?.id);
      this.updateStatus(ConnectionStatus.CONNECTED);

      // Rejoin room if we were in one before disconnect
      if (this.currentRoomId && this.currentUser) {
        this.joinRoom(this.currentRoomId, this.currentUser);
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('[WebSocketClient] Disconnected:', reason);
      this.updateStatus(ConnectionStatus.DISCONNECTED);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[WebSocketClient] Connection error:', error);
      this.updateStatus(ConnectionStatus.ERROR);
    });

    this.socket.on('reconnect_attempt', () => {
      console.log('[WebSocketClient] Reconnecting...');
      this.updateStatus(ConnectionStatus.RECONNECTING);
    });

    // Room events
    this.socket.on('room:users', (users: CollabUser[]) => {
      console.log('[WebSocketClient] Room users updated:', users.length);
      this.notifyRoomUsers(users);
    });

    // File sync events
    this.socket.on('file:open', (payload: FileOperationPayload) => {
      this.notifyFileOpen(payload);
    });

    this.socket.on('file:edit', (payload: FileOperationPayload) => {
      this.notifyFileEdit(payload);
    });

    this.socket.on('file:close', (payload: FileOperationPayload) => {
      this.notifyFileClose(payload);
    });

    this.socket.on('file:save', (payload: FileOperationPayload) => {
      this.notifyFileSave(payload);
    });
  }

  /**
   * Join a collaboration room
   *
   * @param roomId - Room ID (typically project ID)
   * @param user - User information
   */
  joinRoom(roomId: string, user: CollabUser): void {
    if (!this.socket?.connected) {
      console.error('[WebSocketClient] Cannot join room: not connected');
      return;
    }

    this.currentRoomId = roomId;
    this.currentUser = user;

    this.socket.emit('room:join', { roomId, user });

    console.log(`[WebSocketClient] Joined room: ${roomId} as ${user.name}`);
  }

  /**
   * Leave current room
   */
  leaveRoom(): void {
    if (!this.socket?.connected || !this.currentRoomId) {
      return;
    }

    this.socket.emit('room:leave', this.currentRoomId);

    console.log(`[WebSocketClient] Left room: ${this.currentRoomId}`);

    this.currentRoomId = null;
    this.currentUser = null;
  }

  /**
   * Send file open event
   */
  sendFileOpen(filePath: string, data?: unknown): void {
    this.sendFileOperation('file:open', filePath, data);
  }

  /**
   * Send file edit event
   */
  sendFileEdit(filePath: string, data?: unknown): void {
    this.sendFileOperation('file:edit', filePath, data);
  }

  /**
   * Send file close event
   */
  sendFileClose(filePath: string): void {
    this.sendFileOperation('file:close', filePath);
  }

  /**
   * Send file save event
   */
  sendFileSave(filePath: string, data?: unknown): void {
    this.sendFileOperation('file:save', filePath, data);
  }

  /**
   * Send file operation event
   */
  private sendFileOperation(
    event: string,
    filePath: string,
    data?: unknown
  ): void {
    if (!this.socket?.connected || !this.currentRoomId || !this.currentUser) {
      return;
    }

    const payload: FileOperationPayload = {
      roomId: this.currentRoomId,
      filePath,
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data,
    };

    this.socket.emit(event, payload);
  }

  /**
   * Register connection status callback
   */
  onStatusChange(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Register room users callback
   */
  onRoomUsersChange(callback: RoomUsersCallback): () => void {
    this.roomUsersCallbacks.add(callback);

    return () => {
      this.roomUsersCallbacks.delete(callback);
    };
  }

  /**
   * Register file operation callbacks
   */
  onFileOpen(callback: FileOperationCallback): () => void {
    this.fileOpenCallbacks.add(callback);
    return () => this.fileOpenCallbacks.delete(callback);
  }

  onFileEdit(callback: FileOperationCallback): () => void {
    this.fileEditCallbacks.add(callback);
    return () => this.fileEditCallbacks.delete(callback);
  }

  onFileClose(callback: FileOperationCallback): () => void {
    this.fileCloseCallbacks.add(callback);
    return () => this.fileCloseCallbacks.delete(callback);
  }

  onFileSave(callback: FileOperationCallback): () => void {
    this.fileSaveCallbacks.add(callback);
    return () => this.fileSaveCallbacks.delete(callback);
  }

  /**
   * Update connection status and notify listeners
   */
  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusCallbacks.forEach((callback) => callback(status));
  }

  /**
   * Notify room users change
   */
  private notifyRoomUsers(users: CollabUser[]): void {
    this.roomUsersCallbacks.forEach((callback) => callback(users));
  }

  /**
   * Notify file operation callbacks
   */
  private notifyFileOpen(payload: FileOperationPayload): void {
    this.fileOpenCallbacks.forEach((callback) => callback(payload));
  }

  private notifyFileEdit(payload: FileOperationPayload): void {
    this.fileEditCallbacks.forEach((callback) => callback(payload));
  }

  private notifyFileClose(payload: FileOperationPayload): void {
    this.fileCloseCallbacks.forEach((callback) => callback(payload));
  }

  private notifyFileSave(payload: FileOperationPayload): void {
    this.fileSaveCallbacks.forEach((callback) => callback(payload));
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected === true;
  }

  /**
   * Get current room ID
   */
  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  /**
   * Get current user
   */
  getCurrentUser(): CollabUser | null {
    return this.currentUser;
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.leaveRoom();
      this.socket.disconnect();
      this.socket = null;
      this.updateStatus(ConnectionStatus.DISCONNECTED);

      console.log('[WebSocketClient] Disconnected');
    }
  }

  /**
   * Clean up all callbacks
   */
  cleanup(): void {
    this.statusCallbacks.clear();
    this.roomUsersCallbacks.clear();
    this.fileOpenCallbacks.clear();
    this.fileEditCallbacks.clear();
    this.fileCloseCallbacks.clear();
    this.fileSaveCallbacks.clear();
  }
}

// Singleton instance for client-side use
let clientInstance: WebSocketClient | null = null;

/**
 * Get WebSocket client singleton instance
 */
export function getWebSocketClient(): WebSocketClient {
  if (!clientInstance) {
    clientInstance = new WebSocketClient();
  }
  return clientInstance;
}

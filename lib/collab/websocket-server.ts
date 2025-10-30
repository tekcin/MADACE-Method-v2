/**
 * WebSocket Server for Real-time Collaboration
 *
 * Provides WebSocket connectivity using Socket.IO for real-time
 * collaboration features including document sync, presence awareness,
 * and shared cursors.
 *
 * Architecture:
 * - Socket.IO for WebSocket connections with fallbacks
 * - Room-based architecture (one room per project)
 * - Event-driven communication for file operations
 * - Integration with Yjs CRDT for conflict-free synchronization
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import type { Socket } from 'socket.io';
import { RoomManager } from './room-manager';

/**
 * Collaboration event types
 */
export enum CollabEvent {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Room events
  JOIN_ROOM = 'room:join',
  LEAVE_ROOM = 'room:leave',
  ROOM_USERS = 'room:users',

  // File sync events
  FILE_OPEN = 'file:open',
  FILE_EDIT = 'file:edit',
  FILE_CLOSE = 'file:close',
  FILE_SAVE = 'file:save',

  // Yjs sync events (handled by y-websocket)
  YJS_SYNC = 'yjs:sync',
  YJS_AWARENESS = 'yjs:awareness',
}

/**
 * User information for collaboration session
 */
export interface CollabUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string; // Assigned color for cursor/presence
}

/**
 * Room join payload
 */
export interface JoinRoomPayload {
  roomId: string; // Typically project ID
  user: CollabUser;
}

/**
 * File operation payload
 */
export interface FileOperationPayload {
  roomId: string;
  filePath: string;
  userId: string;
  timestamp: number;
  data?: unknown; // For file content or delta
}

/**
 * WebSocket Server Manager
 *
 * Manages Socket.IO server instance and handles connection lifecycle.
 */
export class WebSocketServer {
  private io: SocketIOServer | null = null;
  private roomManager: RoomManager;
  private connectedUsers: Map<string, CollabUser> = new Map();

  constructor() {
    this.roomManager = new RoomManager();
  }

  /**
   * Initialize WebSocket server
   *
   * @param httpServer - HTTP server instance to attach Socket.IO
   * @param cors - CORS configuration for WebSocket
   */
  initialize(
    httpServer: HTTPServer,
    cors?: {
      origin: string | string[];
      methods: string[];
      credentials?: boolean;
    }
  ): void {
    this.io = new SocketIOServer(httpServer, {
      cors: cors || {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/api/v3/collab/ws',
      transports: ['websocket', 'polling'], // Websocket preferred, polling fallback
    });

    this.setupEventHandlers();

    console.log('[WebSocketServer] Initialized on /api/v3/collab/ws');
  }

  /**
   * Set up Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) {
      throw new Error('Socket.IO server not initialized');
    }

    this.io.on(CollabEvent.CONNECT, (socket: Socket) => {
      console.log(`[WebSocketServer] Client connected: ${socket.id}`);

      // Handle room join
      socket.on(CollabEvent.JOIN_ROOM, (payload: JoinRoomPayload) => {
        this.handleJoinRoom(socket, payload);
      });

      // Handle room leave
      socket.on(CollabEvent.LEAVE_ROOM, (roomId: string) => {
        this.handleLeaveRoom(socket, roomId);
      });

      // Handle file operations
      socket.on(CollabEvent.FILE_OPEN, (payload: FileOperationPayload) => {
        this.handleFileOperation(socket, CollabEvent.FILE_OPEN, payload);
      });

      socket.on(CollabEvent.FILE_EDIT, (payload: FileOperationPayload) => {
        this.handleFileOperation(socket, CollabEvent.FILE_EDIT, payload);
      });

      socket.on(CollabEvent.FILE_CLOSE, (payload: FileOperationPayload) => {
        this.handleFileOperation(socket, CollabEvent.FILE_CLOSE, payload);
      });

      socket.on(CollabEvent.FILE_SAVE, (payload: FileOperationPayload) => {
        this.handleFileOperation(socket, CollabEvent.FILE_SAVE, payload);
      });

      // Handle disconnection
      socket.on(CollabEvent.DISCONNECT, () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle user joining a room
   */
  private handleJoinRoom(socket: Socket, payload: JoinRoomPayload): void {
    const { roomId, user } = payload;

    // Join Socket.IO room
    socket.join(roomId);

    // Add user to room in room manager
    this.roomManager.addUser(roomId, socket.id, user);
    this.connectedUsers.set(socket.id, user);

    // Notify all users in room about updated user list
    const roomUsers = this.roomManager.getRoomUsers(roomId);
    this.io?.to(roomId).emit(CollabEvent.ROOM_USERS, roomUsers);

    console.log(
      `[WebSocketServer] User ${user.name} (${socket.id}) joined room ${roomId}. Total users: ${roomUsers.length}`
    );
  }

  /**
   * Handle user leaving a room
   */
  private handleLeaveRoom(socket: Socket, roomId: string): void {
    socket.leave(roomId);

    this.roomManager.removeUser(roomId, socket.id);

    // Notify remaining users
    const roomUsers = this.roomManager.getRoomUsers(roomId);
    this.io?.to(roomId).emit(CollabEvent.ROOM_USERS, roomUsers);

    console.log(`[WebSocketServer] User ${socket.id} left room ${roomId}`);
  }

  /**
   * Handle file operations
   */
  private handleFileOperation(
    socket: Socket,
    event: CollabEvent,
    payload: FileOperationPayload
  ): void {
    const { roomId } = payload;

    // Broadcast to all other users in room
    socket.to(roomId).emit(event, payload);

    console.log(
      `[WebSocketServer] ${event} from ${socket.id} in room ${roomId}: ${payload.filePath}`
    );
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnect(socket: Socket): void {
    // Find all rooms this socket was in and remove from room manager
    const rooms = Array.from(socket.rooms);
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        // Skip socket's own room
        this.roomManager.removeUser(roomId, socket.id);

        // Notify remaining users
        const roomUsers = this.roomManager.getRoomUsers(roomId);
        this.io?.to(roomId).emit(CollabEvent.ROOM_USERS, roomUsers);
      }
    });

    this.connectedUsers.delete(socket.id);

    console.log(`[WebSocketServer] Client disconnected: ${socket.id}`);
  }

  /**
   * Get Socket.IO server instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Get room manager instance
   */
  getRoomManager(): RoomManager {
    return this.roomManager;
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Shutdown server
   */
  shutdown(): void {
    if (this.io) {
      this.io.close();
      console.log('[WebSocketServer] Server shut down');
    }
  }
}

// Singleton instance
let serverInstance: WebSocketServer | null = null;

/**
 * Get WebSocket server singleton instance
 */
export function getWebSocketServer(): WebSocketServer {
  if (!serverInstance) {
    serverInstance = new WebSocketServer();
  }
  return serverInstance;
}

/**
 * Initialize WebSocket server (call this from Next.js server setup)
 */
export function initializeWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  const server = getWebSocketServer();
  server.initialize(httpServer);
  return server;
}

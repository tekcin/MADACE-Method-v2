/**
 * Room Manager for Collaboration
 *
 * Manages collaboration rooms (projects) and tracks users in each room.
 * Each room corresponds to a project, and users can join/leave rooms
 * to collaborate on files within that project.
 */

import type { CollabUser } from './websocket-server';

/**
 * Room information
 */
export interface RoomInfo {
  id: string; // Room ID (typically project ID)
  users: Map<string, CollabUser>; // Socket ID -> User
  createdAt: Date;
  lastActivity: Date;
}

/**
 * Room statistics
 */
export interface RoomStats {
  totalRooms: number;
  totalUsers: number;
  activeRooms: number; // Rooms with at least one user
  emptyRooms: number; // Rooms with no users
}

/**
 * Room Manager
 *
 * Manages all collaboration rooms and user membership.
 */
export class RoomManager {
  private rooms: Map<string, RoomInfo> = new Map();

  /**
   * Create a new room
   *
   * @param roomId - Unique room identifier (typically project ID)
   * @returns Room information
   */
  createRoom(roomId: string): RoomInfo {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId)!;
    }

    const room: RoomInfo = {
      id: roomId,
      users: new Map(),
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.rooms.set(roomId, room);

    console.log(`[RoomManager] Created room: ${roomId}`);

    return room;
  }

  /**
   * Get room by ID
   *
   * @param roomId - Room identifier
   * @returns Room information or undefined
   */
  getRoom(roomId: string): RoomInfo | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Add user to room
   *
   * @param roomId - Room identifier
   * @param socketId - Socket ID of the user
   * @param user - User information
   */
  addUser(roomId: string, socketId: string, user: CollabUser): void {
    let room = this.getRoom(roomId);

    if (!room) {
      room = this.createRoom(roomId);
    }

    room.users.set(socketId, user);
    room.lastActivity = new Date();

    console.log(
      `[RoomManager] Added user ${user.name} (${socketId}) to room ${roomId}. Total: ${room.users.size}`
    );
  }

  /**
   * Remove user from room
   *
   * @param roomId - Room identifier
   * @param socketId - Socket ID of the user
   */
  removeUser(roomId: string, socketId: string): void {
    const room = this.getRoom(roomId);

    if (!room) {
      return;
    }

    const user = room.users.get(socketId);
    room.users.delete(socketId);
    room.lastActivity = new Date();

    console.log(
      `[RoomManager] Removed user ${user?.name || socketId} from room ${roomId}. Remaining: ${room.users.size}`
    );

    // Clean up empty rooms after 5 minutes of inactivity
    if (room.users.size === 0) {
      setTimeout(() => {
        this.cleanupEmptyRoom(roomId);
      }, 5 * 60 * 1000); // 5 minutes
    }
  }

  /**
   * Get all users in a room
   *
   * @param roomId - Room identifier
   * @returns Array of users in the room
   */
  getRoomUsers(roomId: string): CollabUser[] {
    const room = this.getRoom(roomId);

    if (!room) {
      return [];
    }

    return Array.from(room.users.values());
  }

  /**
   * Get user count in room
   *
   * @param roomId - Room identifier
   * @returns Number of users in room
   */
  getRoomUserCount(roomId: string): number {
    const room = this.getRoom(roomId);
    return room ? room.users.size : 0;
  }

  /**
   * Check if user is in room
   *
   * @param roomId - Room identifier
   * @param socketId - Socket ID of the user
   * @returns True if user is in room
   */
  isUserInRoom(roomId: string, socketId: string): boolean {
    const room = this.getRoom(roomId);
    return room ? room.users.has(socketId) : false;
  }

  /**
   * Get all rooms
   *
   * @returns Array of all rooms
   */
  getAllRooms(): RoomInfo[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Get active rooms (with at least one user)
   *
   * @returns Array of active rooms
   */
  getActiveRooms(): RoomInfo[] {
    return this.getAllRooms().filter((room) => room.users.size > 0);
  }

  /**
   * Get empty rooms (no users)
   *
   * @returns Array of empty rooms
   */
  getEmptyRooms(): RoomInfo[] {
    return this.getAllRooms().filter((room) => room.users.size === 0);
  }

  /**
   * Get room statistics
   *
   * @returns Room statistics
   */
  getStats(): RoomStats {
    const totalRooms = this.rooms.size;
    const activeRooms = this.getActiveRooms().length;
    const emptyRooms = this.getEmptyRooms().length;

    let totalUsers = 0;
    this.rooms.forEach((room) => {
      totalUsers += room.users.size;
    });

    return {
      totalRooms,
      totalUsers,
      activeRooms,
      emptyRooms,
    };
  }

  /**
   * Clean up empty room
   *
   * @param roomId - Room identifier
   */
  private cleanupEmptyRoom(roomId: string): void {
    const room = this.getRoom(roomId);

    if (!room || room.users.size > 0) {
      return; // Room has users now, don't delete
    }

    this.rooms.delete(roomId);
    console.log(`[RoomManager] Cleaned up empty room: ${roomId}`);
  }

  /**
   * Clean up all empty rooms
   */
  cleanupEmptyRooms(): void {
    const emptyRooms = this.getEmptyRooms();

    emptyRooms.forEach((room) => {
      this.rooms.delete(room.id);
    });

    console.log(`[RoomManager] Cleaned up ${emptyRooms.length} empty rooms`);
  }

  /**
   * Clean up inactive rooms (no activity for > 1 hour, no users)
   */
  cleanupInactiveRooms(maxInactiveMinutes: number = 60): void {
    const now = new Date();
    const threshold = maxInactiveMinutes * 60 * 1000;

    const inactiveRooms = this.getAllRooms().filter((room) => {
      const inactiveTime = now.getTime() - room.lastActivity.getTime();
      return room.users.size === 0 && inactiveTime > threshold;
    });

    inactiveRooms.forEach((room) => {
      this.rooms.delete(room.id);
    });

    console.log(
      `[RoomManager] Cleaned up ${inactiveRooms.length} inactive rooms (> ${maxInactiveMinutes} min)`
    );
  }

  /**
   * Get user's current rooms
   *
   * @param socketId - Socket ID of the user
   * @returns Array of room IDs the user is in
   */
  getUserRooms(socketId: string): string[] {
    const userRooms: string[] = [];

    this.rooms.forEach((room, roomId) => {
      if (room.users.has(socketId)) {
        userRooms.push(roomId);
      }
    });

    return userRooms;
  }

  /**
   * Remove user from all rooms
   *
   * @param socketId - Socket ID of the user
   */
  removeUserFromAllRooms(socketId: string): void {
    const userRooms = this.getUserRooms(socketId);

    userRooms.forEach((roomId) => {
      this.removeUser(roomId, socketId);
    });

    console.log(
      `[RoomManager] Removed user ${socketId} from ${userRooms.length} rooms`
    );
  }

  /**
   * Get total room count
   */
  getRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Clear all rooms (for testing)
   */
  clearAllRooms(): void {
    this.rooms.clear();
    console.log('[RoomManager] Cleared all rooms');
  }
}

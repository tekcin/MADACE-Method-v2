/**
 * Synchronization Service
 *
 * Coordinates WebSocket server and file watchers for real-time sync
 */

import path from 'path';
import { startWebSocketServer, stopWebSocketServer } from './websocket-server';
import { startFileWatcher, stopFileWatcher } from './file-watcher';

/**
 * Sync service configuration
 */
export interface SyncServiceConfig {
  /**
   * WebSocket server port
   */
  wsPort?: number;

  /**
   * Paths to watch for workflow state files
   */
  statePaths?: string[];

  /**
   * Path to configuration file
   */
  configPath?: string;
}

/**
 * Sync Service
 *
 * Manages WebSocket server and file watchers
 */
class SyncService {
  private running = false;

  /**
   * Start sync service
   */
  async start(config?: SyncServiceConfig): Promise<void> {
    if (this.running) {
      console.log('[SyncService] Already running');
      return;
    }

    const wsPort = config?.wsPort || 3001;
    const statePaths = config?.statePaths || [
      path.join(process.cwd(), 'madace-data', 'workflow-states'),
    ];
    const configPath =
      config?.configPath || path.join(process.cwd(), 'madace-data', 'config', 'config.yaml');

    try {
      // Start WebSocket server
      console.log('[SyncService] Starting WebSocket server...');
      await startWebSocketServer(wsPort);

      // Start file watchers
      console.log('[SyncService] Starting file watchers...');
      startFileWatcher(statePaths, configPath);

      this.running = true;
      console.log('[SyncService] Sync service started successfully');
    } catch (error) {
      console.error('[SyncService] Failed to start sync service:', error);
      throw error;
    }
  }

  /**
   * Stop sync service
   */
  async stop(): Promise<void> {
    if (!this.running) {
      console.log('[SyncService] Not running');
      return;
    }

    try {
      // Stop file watchers
      console.log('[SyncService] Stopping file watchers...');
      stopFileWatcher();

      // Stop WebSocket server
      console.log('[SyncService] Stopping WebSocket server...');
      await stopWebSocketServer();

      this.running = false;
      console.log('[SyncService] Sync service stopped successfully');
    } catch (error) {
      console.error('[SyncService] Failed to stop sync service:', error);
      throw error;
    }
  }

  /**
   * Check if service is running
   */
  isRunning(): boolean {
    return this.running;
  }
}

// Singleton instance
const syncService = new SyncService();

/**
 * Start sync service
 */
export async function startSyncService(config?: SyncServiceConfig): Promise<void> {
  await syncService.start(config);
}

/**
 * Stop sync service
 */
export async function stopSyncService(): Promise<void> {
  await syncService.stop();
}

/**
 * Get sync service status
 */
export function isSyncServiceRunning(): boolean {
  return syncService.isRunning();
}

/**
 * Get singleton sync service instance
 */
export function getSyncService(): SyncService {
  return syncService;
}

/**
 * File Watcher for State Synchronization
 *
 * Monitors workflow state files and configuration for changes,
 * then broadcasts updates via WebSocket
 */

import fs from 'fs';
import path from 'path';
import { getWebSocketServer } from './websocket-server';
import type { StateUpdateMessage } from './types';

/**
 * File watcher configuration
 */
export interface FileWatcherConfig {
  /**
   * Paths to watch for state files
   */
  statePaths: string[];

  /**
   * Path to watch for configuration changes
   */
  configPath?: string;

  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number;
}

/**
 * File Watcher
 *
 * Watches state files and configuration for changes and broadcasts updates
 */
export class FileWatcher {
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: FileWatcherConfig;

  constructor(config: FileWatcherConfig) {
    this.config = {
      debounceMs: 300, // Default 300ms debounce
      ...config,
    };
  }

  /**
   * Start watching files
   */
  start(): void {
    // Watch state directories
    for (const statePath of this.config.statePaths) {
      this.watchDirectory(statePath, 'state');
    }

    // Watch config file
    if (this.config.configPath) {
      this.watchFile(this.config.configPath, 'config');
    }

    console.log('[FileWatcher] Started watching files');
  }

  /**
   * Stop watching files
   */
  stop(): void {
    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Close all watchers
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      console.log(`[FileWatcher] Stopped watching: ${path}`);
    }
    this.watchers.clear();

    console.log('[FileWatcher] Stopped watching files');
  }

  /**
   * Watch a directory for changes
   */
  private watchDirectory(dirPath: string, type: 'state' | 'config'): void {
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const watcher = fs.watch(dirPath, { recursive: false }, (eventType, filename) => {
        if (!filename) return;

        const fullPath = path.join(dirPath, filename);

        // Only watch .state.json files
        if (type === 'state' && !filename.endsWith('.state.json')) {
          return;
        }

        this.handleFileChange(fullPath, type, eventType);
      });

      this.watchers.set(dirPath, watcher);
      console.log(`[FileWatcher] Watching directory: ${dirPath}`);
    } catch (error) {
      console.error(`[FileWatcher] Failed to watch directory ${dirPath}:`, error);
    }
  }

  /**
   * Watch a specific file for changes
   */
  private watchFile(filePath: string, type: 'state' | 'config'): void {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`[FileWatcher] File does not exist: ${filePath}`);
        return;
      }

      const watcher = fs.watch(filePath, (eventType) => {
        this.handleFileChange(filePath, type, eventType);
      });

      this.watchers.set(filePath, watcher);
      console.log(`[FileWatcher] Watching file: ${filePath}`);
    } catch (error) {
      console.error(`[FileWatcher] Failed to watch file ${filePath}:`, error);
    }
  }

  /**
   * Handle file change event with debouncing
   */
  private handleFileChange(filePath: string, type: 'state' | 'config', eventType: string): void {
    // Clear existing debounce timer
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      this.processFileChange(filePath, type, eventType);
      this.debounceTimers.delete(filePath);
    }, this.config.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Process file change (after debounce)
   */
  private async processFileChange(
    filePath: string,
    type: 'state' | 'config',
    eventType: string
  ): Promise<void> {
    console.log(`[FileWatcher] File changed: ${filePath} (${eventType})`);

    try {
      if (type === 'state') {
        await this.handleStateFileChange(filePath);
      } else if (type === 'config') {
        await this.handleConfigFileChange(filePath);
      }
    } catch (error) {
      console.error(`[FileWatcher] Error processing file change:`, error);
    }
  }

  /**
   * Handle state file change
   */
  private async handleStateFileChange(filePath: string): Promise<void> {
    try {
      // Check if file still exists (might have been deleted)
      if (!fs.existsSync(filePath)) {
        console.log(`[FileWatcher] State file deleted: ${filePath}`);
        return;
      }

      // Read and parse state file
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const state = JSON.parse(content);

      // Extract workflow name from filename (.workflow-name.state.json)
      const filename = path.basename(filePath);
      const match = filename.match(/^\.(.+)\.state\.json$/);
      if (!match || !match[1]) {
        console.warn(`[FileWatcher] Invalid state filename: ${filename}`);
        return;
      }

      const workflowName = match[1];

      // Broadcast state update via WebSocket
      const wsServer = getWebSocketServer();
      const stateUpdate: StateUpdateMessage['data']['state'] = {
        currentStep: state.currentStep || 0,
        totalSteps: state.totalSteps || 0,
        status: state.status || 'pending',
        ...(state.variables && { variables: state.variables }),
        ...(state.error && { error: state.error as string }),
      };

      const sent = wsServer.broadcastStateUpdate(workflowName, stateUpdate);

      console.log(
        `[FileWatcher] Broadcasted state update for '${workflowName}' to ${sent} clients`
      );
    } catch (error) {
      console.error(`[FileWatcher] Failed to process state file ${filePath}:`, error);
    }
  }

  /**
   * Handle config file change
   */
  private async handleConfigFileChange(filePath: string): Promise<void> {
    try {
      // Check if file still exists
      if (!fs.existsSync(filePath)) {
        console.log(`[FileWatcher] Config file deleted: ${filePath}`);
        return;
      }

      // Read and parse config file
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const config = JSON.parse(content);

      // Broadcast config update via WebSocket
      const wsServer = getWebSocketServer();
      const sent = wsServer.broadcastConfigUpdate('project', config);

      console.log(`[FileWatcher] Broadcasted config update to ${sent} clients`);
    } catch (error) {
      console.error(`[FileWatcher] Failed to process config file ${filePath}:`, error);
    }
  }

  /**
   * Check if watcher is running
   */
  isRunning(): boolean {
    return this.watchers.size > 0;
  }

  /**
   * Get watched paths
   */
  getWatchedPaths(): string[] {
    return Array.from(this.watchers.keys());
  }
}

// Singleton instance
let instance: FileWatcher | null = null;

/**
 * Create file watcher instance
 */
export function createFileWatcher(config: FileWatcherConfig): FileWatcher {
  if (instance) {
    instance.stop();
  }

  instance = new FileWatcher(config);
  return instance;
}

/**
 * Get file watcher instance
 */
export function getFileWatcher(): FileWatcher | null {
  return instance;
}

/**
 * Start file watcher with default configuration
 */
export function startFileWatcher(statePaths: string[], configPath?: string): FileWatcher {
  const config: FileWatcherConfig = {
    statePaths,
    debounceMs: 300,
  };

  if (configPath) {
    config.configPath = configPath;
  }

  const watcher = createFileWatcher(config);

  watcher.start();
  return watcher;
}

/**
 * Stop file watcher
 */
export function stopFileWatcher(): void {
  if (instance) {
    instance.stop();
    instance = null;
  }
}

/**
 * REPL Command History Manager
 *
 * Manages persistent command history for MADACE REPL
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Default history file location: ~/.madace_history
 */
const DEFAULT_HISTORY_FILE = join(homedir(), '.madace_history');

/**
 * Maximum number of commands to keep in history
 */
const MAX_HISTORY_SIZE = 1000;

/**
 * History Manager Class
 */
export class HistoryManager {
  private historyFile: string;
  private history: string[] = [];
  private maxSize: number;

  constructor(historyFile: string = DEFAULT_HISTORY_FILE, maxSize: number = MAX_HISTORY_SIZE) {
    this.historyFile = historyFile;
    this.maxSize = maxSize;
  }

  /**
   * Load history from file
   */
  async load(): Promise<string[]> {
    try {
      if (!existsSync(this.historyFile)) {
        // Create empty history file
        await fs.writeFile(this.historyFile, '', 'utf-8');
        this.history = [];
        return this.history;
      }

      const content = await fs.readFile(this.historyFile, 'utf-8');
      const lines = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // Keep only last maxSize entries
      this.history = lines.slice(-this.maxSize);
      return this.history;
    } catch (error) {
      console.error('Failed to load command history:', error);
      this.history = [];
      return this.history;
    }
  }

  /**
   * Save history to file
   */
  async save(): Promise<void> {
    try {
      const content = this.history.join('\n') + '\n';
      await fs.writeFile(this.historyFile, content, 'utf-8');
    } catch (error) {
      console.error('Failed to save command history:', error);
    }
  }

  /**
   * Add command to history
   */
  async add(command: string): Promise<void> {
    const trimmed = command.trim();

    // Don't add empty commands
    if (!trimmed) {
      return;
    }

    // Don't add duplicate consecutive commands
    if (this.history.length > 0 && this.history[this.history.length - 1] === trimmed) {
      return;
    }

    // Add to history
    this.history.push(trimmed);

    // Trim to max size (FIFO)
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(-this.maxSize);
    }

    // Save to file
    await this.save();
  }

  /**
   * Get all history entries
   */
  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  async clear(): Promise<void> {
    this.history = [];
    await this.save();
  }

  /**
   * Get history file path
   */
  getHistoryFilePath(): string {
    return this.historyFile;
  }
}

/**
 * Create default history manager instance
 */
export function createHistoryManager(): HistoryManager {
  return new HistoryManager();
}

/**
 * REPL Autocomplete Engine
 *
 * Provides intelligent command and parameter completion with fuzzy matching
 */

import Fuse from 'fuse.js';
import { CommandRegistry } from './commands/repl-commands';
import { listAgents } from '@/lib/services/agent-service';

/**
 * Completion result
 */
export interface CompletionResult {
  value: string;
  description?: string;
}

/**
 * Autocomplete Engine
 */
export class CompletionEngine {
  private commandRegistry: CommandRegistry;
  private agentCache: Array<{ name: string; title: string }> = [];
  private lastAgentFetch: number = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds
  private commandHistory: string[] = [];

  constructor(commandRegistry: CommandRegistry) {
    this.commandRegistry = commandRegistry;
  }

  /**
   * Set command history for completion
   */
  setHistory(history: string[]): void {
    this.commandHistory = history;
  }

  /**
   * Get command completions
   */
  private getCommandCompletions(): CompletionResult[] {
    const commands = this.commandRegistry.getAllCommands();

    // Remove duplicates (aliases)
    const uniqueCommands = Array.from(new Map(commands.map((cmd) => [cmd.name, cmd])).values());

    return uniqueCommands.map((cmd) => ({
      value: cmd.name,
      description: cmd.description,
    }));
  }

  /**
   * Get agent names for completion
   */
  private async getAgentCompletions(): Promise<CompletionResult[]> {
    // Use cache if recent
    const now = Date.now();
    if (this.agentCache.length > 0 && now - this.lastAgentFetch < this.CACHE_TTL) {
      return this.agentCache.map((agent) => ({
        value: agent.name,
        description: agent.title,
      }));
    }

    // Fetch from database
    try {
      const agents = await listAgents({ limit: 100 });
      this.agentCache = agents.map((agent) => ({
        name: agent.name,
        title: agent.title,
      }));
      this.lastAgentFetch = now;

      return this.agentCache.map((agent) => ({
        value: agent.name,
        description: agent.title,
      }));
    } catch (error) {
      console.error('Failed to fetch agents for completion:', error);
      return [];
    }
  }

  /**
   * Get completions for a given input
   */
  async getCompletions(input: string): Promise<CompletionResult[]> {
    const trimmed = input.trim();

    // Empty input - show recent history + commands
    if (!trimmed) {
      const commands = this.getCommandCompletions();
      const recentHistory = this.commandHistory
        .slice(-10) // Last 10 commands
        .reverse() // Most recent first
        .map((cmd) => ({
          value: cmd,
          description: '(recent)',
        }));

      // Combine: recent history first, then commands
      return [...recentHistory, ...commands];
    }

    // Parse input
    const parts = trimmed.split(/\s+/);
    const firstWord = parts[0]!.toLowerCase();

    // Completing first word (command)
    if (parts.length === 1) {
      const commands = this.getCommandCompletions();

      // Exact match - no completion needed
      if (commands.some((cmd) => cmd.value === firstWord)) {
        return [];
      }

      // Fuzzy search commands
      const fuse = new Fuse(commands, {
        keys: ['value'],
        threshold: 0.4, // 0 = exact, 1 = very fuzzy
        includeScore: true,
      });

      const results = fuse.search(firstWord);

      // If results found, return them
      if (results.length > 0) {
        return results.map((result) => result.item);
      }

      // Fallback: prefix match
      return commands.filter((cmd) => cmd.value.startsWith(firstWord));
    }

    // Completing second word (parameters)
    const command = firstWord;

    // Agent-related commands: complete with agent names
    if (command === 'run' || command === 'select' || command === 'agent') {
      const agentCompletions = await this.getAgentCompletions();
      const searchTerm = parts.slice(1).join(' ').toLowerCase();

      if (!searchTerm) {
        return agentCompletions;
      }

      // Fuzzy search agents
      const fuse = new Fuse(agentCompletions, {
        keys: ['value', 'description'],
        threshold: 0.4,
        includeScore: true,
      });

      const results = fuse.search(searchTerm);

      if (results.length > 0) {
        return results.map((result) => result.item);
      }

      // Fallback: prefix match
      return agentCompletions.filter(
        (agent) =>
          agent.value.toLowerCase().startsWith(searchTerm) ||
          agent.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Help command: complete with command names
    if (command === 'help') {
      const commands = this.getCommandCompletions();
      const searchTerm = parts[1]?.toLowerCase() || '';

      if (!searchTerm) {
        return commands;
      }

      return commands.filter((cmd) => cmd.value.toLowerCase().startsWith(searchTerm));
    }

    // No completions for other commands
    return [];
  }

  /**
   * Format completion for display
   */
  formatCompletion(completion: CompletionResult): string {
    if (completion.description) {
      return `${completion.value} - ${completion.description}`;
    }
    return completion.value;
  }
}

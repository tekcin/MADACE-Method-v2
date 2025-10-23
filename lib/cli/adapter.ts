/**
 * CLI Adapter Base Interface
 *
 * Provides a unified interface for interacting with different CLI tools (Claude, Gemini)
 * while using the same TypeScript business logic underneath.
 */

import type {
  CLIConfig,
  CLIProvider,
  AgentCommandResult,
  WorkflowCommandResult,
  StateCommandResult,
} from './types';

/**
 * Base CLI Adapter Interface
 *
 * All CLI adapters (Claude, Gemini) must implement this interface
 */
export interface ICLIAdapter {
  /**
   * Get the provider name
   */
  readonly provider: CLIProvider;

  /**
   * Initialize the CLI adapter with configuration
   */
  initialize(config: CLIConfig): Promise<void>;

  /**
   * Load an agent by ID
   * @param agentId - Agent identifier (e.g., 'pm', 'analyst', 'architect')
   */
  loadAgent(agentId: string): Promise<AgentCommandResult>;

  /**
   * Execute a workflow
   * @param workflowName - Workflow name (e.g., 'plan-project', 'create-story')
   */
  executeWorkflow(workflowName: string): Promise<WorkflowCommandResult>;

  /**
   * Get current workflow status
   */
  getStatus(): Promise<StateCommandResult>;

  /**
   * Check if CLI tool is installed and available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get CLI tool version
   */
  getVersion(): Promise<string>;
}

/**
 * Base CLI Adapter Class
 *
 * Provides common functionality for all CLI adapters
 */
export abstract class BaseCLIAdapter implements ICLIAdapter {
  protected config?: CLIConfig;
  abstract readonly provider: CLIProvider;

  async initialize(config: CLIConfig): Promise<void> {
    this.config = config;
    await this.validateConfig(config);
  }

  abstract loadAgent(agentId: string): Promise<AgentCommandResult>;
  abstract executeWorkflow(workflowName: string): Promise<WorkflowCommandResult>;
  abstract getStatus(): Promise<StateCommandResult>;
  abstract isAvailable(): Promise<boolean>;
  abstract getVersion(): Promise<string>;

  /**
   * Validate CLI configuration
   */
  protected async validateConfig(config: CLIConfig): Promise<void> {
    if (!config.project) {
      throw new Error('CLI config missing project name');
    }

    if (!config.context.agentsPath) {
      throw new Error('CLI config missing agents path');
    }

    if (!config.context.workflowsPath) {
      throw new Error('CLI config missing workflows path');
    }

    if (!config.context.statusFile) {
      throw new Error('CLI config missing status file');
    }

    if (!config.llm.model) {
      throw new Error('CLI config missing LLM model');
    }
  }

  /**
   * Execute shell command
   */
  protected async execCommand(command: string, args: string[]): Promise<string> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execPromise = promisify(exec);

    try {
      const { stdout, stderr } = await execPromise(`${command} ${args.join(' ')}`);

      if (stderr) {
        console.warn(`CLI stderr: ${stderr}`);
      }

      return stdout.trim();
    } catch (error) {
      throw new Error(
        `Failed to execute CLI command: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if command exists
   */
  protected async commandExists(command: string): Promise<boolean> {
    try {
      await this.execCommand('which', [command]);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * CLI Adapter Factory
 */
export async function createCLIAdapter(provider: CLIProvider): Promise<ICLIAdapter> {
  switch (provider) {
    case 'claude': {
      // Dynamic import to avoid circular dependencies
      const { ClaudeCLIAdapter } = await import('./claude');
      return new ClaudeCLIAdapter();
    }
    case 'gemini': {
      // Dynamic import to avoid circular dependencies
      const { GeminiCLIAdapter } = await import('./gemini');
      return new GeminiCLIAdapter();
    }
    default:
      throw new Error(`Unknown CLI provider: ${provider}`);
  }
}

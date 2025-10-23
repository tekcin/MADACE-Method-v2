/**
 * Gemini CLI Adapter
 *
 * Integrates with Google's Gemini CLI tool
 */

import { BaseCLIAdapter } from './adapter';
import type {
  CLIProvider,
  AgentCommandResult,
  WorkflowCommandResult,
  StateCommandResult,
} from './types';
import { loadAgent as loadAgentFile } from '@/lib/agents/loader';
import { loadWorkflow } from '@/lib/workflows/loader';
import { createWorkflowExecutor } from '@/lib/workflows/executor';
import { StateMachine } from '@/lib/state/machine';
import path from 'path';

export class GeminiCLIAdapter extends BaseCLIAdapter {
  readonly provider: CLIProvider = 'gemini';
  private readonly cliCommand = 'gemini';

  async isAvailable(): Promise<boolean> {
    return await this.commandExists(this.cliCommand);
  }

  async getVersion(): Promise<string> {
    try {
      const output = await this.execCommand(this.cliCommand, ['--version']);
      return output.trim();
    } catch (error) {
      throw new Error(
        `Failed to get Gemini CLI version: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async loadAgent(agentId: string): Promise<AgentCommandResult> {
    if (!this.config) {
      return {
        success: false,
        message: 'CLI adapter not initialized',
        error: new Error('Call initialize() first'),
      };
    }

    try {
      // Use the TypeScript business logic to load agent
      const agentPath = path.join(
        process.cwd(),
        this.config.context.agentsPath,
        `${agentId}.agent.yaml`
      );

      const agent = await loadAgentFile(agentPath);

      return {
        success: true,
        message: `Agent '${agent.metadata.name}' loaded successfully`,
        data: {
          agent,
          loaded: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to load agent '${agentId}'`,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async executeWorkflow(workflowName: string): Promise<WorkflowCommandResult> {
    if (!this.config) {
      return {
        success: false,
        message: 'CLI adapter not initialized',
        error: new Error('Call initialize() first'),
      };
    }

    try {
      // Load workflow
      const workflowPath = path.join(
        process.cwd(),
        this.config.context.workflowsPath,
        `${workflowName}.workflow.yaml`
      );

      const workflow = await loadWorkflow(workflowPath);

      // Create executor
      const statePath = path.join(process.cwd(), 'madace-data', 'workflow-states');
      const executor = createWorkflowExecutor(workflow, statePath);

      // Initialize and execute first step
      await executor.initialize();
      const result = await executor.executeNextStep();

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          error: result.error,
        };
      }

      return {
        success: true,
        message: `Workflow '${workflowName}' executed successfully`,
        data: {
          workflow,
          state: executor.getState()!,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to execute workflow '${workflowName}'`,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async getStatus(): Promise<StateCommandResult> {
    if (!this.config) {
      return {
        success: false,
        message: 'CLI adapter not initialized',
        error: new Error('Call initialize() first'),
      };
    }

    try {
      // Load state machine
      const statusFile = path.join(process.cwd(), this.config.context.statusFile);
      const stateMachine = new StateMachine(statusFile);
      await stateMachine.load();

      const status = stateMachine.getStatus();

      return {
        success: true,
        message: 'Status retrieved successfully',
        data: {
          status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get status',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

/**
 * Create a Gemini CLI adapter instance
 */
export function createGeminiCLIAdapter(): GeminiCLIAdapter {
  return new GeminiCLIAdapter();
}

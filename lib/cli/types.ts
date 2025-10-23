/**
 * CLI Integration Types
 */

import type { Agent } from '@/lib/types/agent';
import type { Workflow, WorkflowState } from '@/lib/workflows/types';
import type { WorkflowStatus } from '@/lib/state/types';

/**
 * CLI Provider types
 */
export type CLIProvider = 'claude' | 'gemini';

/**
 * CLI Configuration
 */
export interface CLIConfig {
  provider: CLIProvider;
  project: string;
  context: {
    agentsPath: string;
    workflowsPath: string;
    statusFile: string;
  };
  llm: {
    model: string;
    apiKey?: string;
  };
}

/**
 * CLI Command types
 */
export type CLICommand = 'agent' | 'workflow' | 'state' | 'config';

/**
 * CLI Command execution result
 */
export interface CLICommandResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: Error;
}

/**
 * Agent command result
 */
export interface AgentCommandResult extends CLICommandResult {
  data?: {
    agent: Agent;
    loaded: boolean;
  };
}

/**
 * Workflow command result
 */
export interface WorkflowCommandResult extends CLICommandResult {
  data?: {
    workflow: Workflow;
    state: WorkflowState;
  };
}

/**
 * State command result
 */
export interface StateCommandResult extends CLICommandResult {
  data?: {
    status: WorkflowStatus;
  };
}

/**
 * CLI Configuration file structure (for .claude.json, .gemini.json)
 */
export interface CLIConfigFile {
  project: string;
  context: {
    agents_path: string;
    workflows_path: string;
    status_file: string;
  };
  llm: {
    provider: string;
    model: string;
    apiKey: string;
  };
}

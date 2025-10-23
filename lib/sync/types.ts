/**
 * Synchronization Types
 *
 * Types for real-time synchronization between Web UI and CLI tools
 */

/**
 * Sync message types
 */
export type SyncMessageType =
  | 'state_updated'
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'agent_loaded'
  | 'config_updated'
  | 'ping'
  | 'pong';

/**
 * Sync message payload
 */
export interface SyncMessage {
  type: SyncMessageType;
  timestamp: number;
  data?: unknown;
}

/**
 * State update message
 */
export interface StateUpdateMessage extends SyncMessage {
  type: 'state_updated';
  data: {
    workflowName: string;
    state: {
      currentStep: number;
      totalSteps: number;
      status: 'pending' | 'running' | 'completed' | 'failed';
      variables?: Record<string, unknown>;
      error?: string;
    };
  };
}

/**
 * Workflow event message
 */
export interface WorkflowEventMessage extends SyncMessage {
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed';
  data: {
    workflowName: string;
    message?: string;
    error?: string;
  };
}

/**
 * Agent event message
 */
export interface AgentEventMessage extends SyncMessage {
  type: 'agent_loaded';
  data: {
    agentId: string;
    agentName: string;
  };
}

/**
 * Config update message
 */
export interface ConfigUpdateMessage extends SyncMessage {
  type: 'config_updated';
  data: {
    section: 'project' | 'llm' | 'modules';
    changes: Record<string, unknown>;
  };
}

/**
 * WebSocket client info
 */
export interface ClientInfo {
  id: string;
  connectedAt: number;
  lastPing?: number;
  metadata?: {
    source?: 'web-ui' | 'cli-claude' | 'cli-gemini';
    userAgent?: string;
  };
}

/**
 * Broadcast options
 */
export interface BroadcastOptions {
  excludeClient?: string;
  filter?: (client: ClientInfo) => boolean;
}

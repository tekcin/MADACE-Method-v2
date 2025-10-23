/**
 * Agent Runtime Types
 *
 * TypeScript interfaces for agent execution and runtime management.
 */

import type { Agent } from '@/lib/types/agent';
import type { Config } from '@/lib/config/schema';

/**
 * Conversation message roles
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Single conversation message
 */
export interface ConversationMessage {
  /**
   * Message role (user, assistant, or system)
   */
  role: MessageRole;

  /**
   * Message content
   */
  content: string;

  /**
   * Timestamp when message was created
   */
  timestamp: Date;

  /**
   * Associated action (if any)
   */
  action?: string;

  /**
   * Message metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Agent execution context
 *
 * Contains all state and data needed for agent execution.
 */
export interface AgentContext {
  /**
   * Loaded agent definition
   */
  agent: Agent;

  /**
   * Agent name (for reference)
   */
  agentName: string;

  /**
   * MADACE configuration
   */
  config: Config;

  /**
   * Conversation history
   */
  conversationHistory: ConversationMessage[];

  /**
   * Current action being executed
   */
  currentAction?: string;

  /**
   * Files loaded from load_always
   */
  loadedFiles: Map<string, string>;

  /**
   * Runtime state (arbitrary data)
   */
  state: Record<string, unknown>;

  /**
   * Timestamp when context was created
   */
  createdAt: Date;

  /**
   * Last updated timestamp
   */
  updatedAt: Date;
}

/**
 * Agent response
 */
export interface AgentResponse {
  /**
   * Whether execution was successful
   */
  success: boolean;

  /**
   * Response message
   */
  message: string;

  /**
   * Response data (optional)
   */
  data?: unknown;

  /**
   * Executed action (if any)
   */
  action?: string;

  /**
   * Suggested next actions
   */
  suggestions?: string[];

  /**
   * Error (if failed)
   */
  error?: Error;

  /**
   * Execution metadata
   */
  metadata?: {
    duration?: number;
    tokensUsed?: number;
    model?: string;
  };
}

/**
 * Action execution result
 */
export interface ActionResult {
  /**
   * Whether action succeeded
   */
  success: boolean;

  /**
   * Result message
   */
  message: string;

  /**
   * Result data
   */
  data?: unknown;

  /**
   * Error (if failed)
   */
  error?: Error;
}

/**
 * Action handler interface
 */
export interface ActionHandler {
  /**
   * Action name (e.g., "workflow:status")
   */
  name: string;

  /**
   * Action description
   */
  description: string;

  /**
   * Execute the action
   */
  execute(context: AgentContext, params?: Record<string, unknown>): Promise<ActionResult>;
}

/**
 * Agent runtime options
 */
export interface AgentRuntimeOptions {
  /**
   * Maximum conversation history length
   * @default 50
   */
  maxHistoryLength?: number;

  /**
   * Enable conversation persistence
   * @default false
   */
  persistConversation?: boolean;

  /**
   * Conversation save path
   */
  conversationPath?: string;

  /**
   * Enable streaming responses
   * @default false
   */
  enableStreaming?: boolean;

  /**
   * Custom action handlers
   */
  customActions?: ActionHandler[];
}

/**
 * Conversation state for persistence
 */
export interface ConversationState {
  /**
   * Agent name
   */
  agentName: string;

  /**
   * Conversation messages
   */
  messages: ConversationMessage[];

  /**
   * Runtime state
   */
  state: Record<string, unknown>;

  /**
   * Created timestamp
   */
  createdAt: Date;

  /**
   * Last updated timestamp
   */
  updatedAt: Date;
}

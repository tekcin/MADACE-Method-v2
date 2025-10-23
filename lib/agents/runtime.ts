/**
 * Agent Runtime
 *
 * Executes MADACE agents with LLM integration.
 */

import type { AgentContext, AgentResponse, AgentRuntimeOptions } from './types';
import { loadAgent } from './loader';
import { buildContext } from './context';
import { createConversationManager } from './conversation';
import { createActionRegistry, parseAction } from './actions';
import { formatSuccess, formatError, formatLLMResponse } from './response';
import { createLLMClient } from '@/lib/llm/client';
import { getLLMConfigFromEnv } from '@/lib/llm/config';
import { getAgentSystemPrompt } from '@/lib/templates/llm-system-prompt';

/**
 * Agent Runtime
 *
 * Main class for executing MADACE agents.
 */
export class AgentRuntime {
  private context: AgentContext | null = null;
  private conversation = createConversationManager();
  private actions = createActionRegistry();
  private options: AgentRuntimeOptions;

  constructor(options: AgentRuntimeOptions = {}) {
    this.options = {
      maxHistoryLength: options.maxHistoryLength ?? 50,
      persistConversation: options.persistConversation ?? false,
      conversationPath: options.conversationPath,
      enableStreaming: options.enableStreaming ?? false,
      customActions: options.customActions ?? [],
    };

    // Register custom actions
    if (this.options.customActions) {
      for (const handler of this.options.customActions) {
        this.actions.register(handler);
      }
    }
  }

  /**
   * Initialize agent
   */
  async initialize(agentName: string): Promise<void> {
    // Load agent definition
    const agentPath = `madace/mam/agents/${agentName}.agent.yaml`;
    const agent = await loadAgent(agentPath);

    // Build context
    this.context = await buildContext(agent, agentName);

    // Add system message with agent persona
    const systemPrompt = getAgentSystemPrompt(agent.persona.role);
    this.conversation.addSystemMessage(systemPrompt);

    // Load conversation if persistence enabled
    if (this.options.persistConversation && this.options.conversationPath) {
      const savedState = await this.conversation.load(agentName);
      if (savedState) {
        this.context.state = savedState;
      }
    }
  }

  /**
   * Execute user input
   */
  async execute(userInput: string): Promise<AgentResponse> {
    if (!this.context) {
      return formatError('Agent not initialized', new Error('Call initialize() first'));
    }

    try {
      // Add user message to history
      this.conversation.addUserMessage(userInput);

      // Get LLM client
      const llmConfig = getLLMConfigFromEnv();
      const llmClient = createLLMClient(llmConfig);

      // Get formatted messages
      const messages = this.conversation.getFormattedMessages();

      // Call LLM
      const llmResponse = await llmClient.chat({ messages });

      // Add assistant response
      this.conversation.addAssistantMessage(llmResponse.content);

      // Update context
      this.context.conversationHistory = this.conversation.getMessages();
      this.context.updatedAt = new Date();

      // Save conversation if enabled
      if (this.options.persistConversation && this.options.conversationPath) {
        await this.conversation.save(this.context.agentName, this.context.state);
      }

      return formatLLMResponse(llmResponse);
    } catch (error) {
      return formatError(
        'Execution failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Execute menu action
   */
  async executeAction(
    actionName: string,
    params?: Record<string, unknown>
  ): Promise<AgentResponse> {
    if (!this.context) {
      return formatError('Agent not initialized');
    }

    try {
      // Parse action
      const parsedAction = parseAction(actionName);
      const handler = this.actions.get(parsedAction.type);

      if (!handler) {
        return formatError(`Unknown action type: ${parsedAction.type}`);
      }

      // Execute action
      const result = await handler.execute(this.context, {
        ...params,
        name: parsedAction.name,
        params: parsedAction.params,
      });

      if (result.success) {
        return formatSuccess(result.message, result.data, actionName);
      } else {
        return formatError(result.message, result.error, actionName);
      }
    } catch (error) {
      return formatError(
        'Action execution failed',
        error instanceof Error ? error : new Error(String(error)),
        actionName
      );
    }
  }

  /**
   * Get current context
   */
  getContext(): AgentContext | null {
    return this.context;
  }

  /**
   * Reset agent state
   */
  reset(): void {
    this.conversation.clear();
    if (this.context) {
      this.context.conversationHistory = [];
      this.context.state = {};
      this.context.updatedAt = new Date();
    }
  }
}

/**
 * Create agent runtime
 */
export function createAgentRuntime(options?: AgentRuntimeOptions): AgentRuntime {
  return new AgentRuntime(options);
}

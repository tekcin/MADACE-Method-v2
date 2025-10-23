/**
 * Conversation Manager
 *
 * Manages conversation history and message formatting for agent interactions.
 */

import fs from 'fs/promises';
import path from 'path';
import type { ConversationMessage, MessageRole, ConversationState } from './types';
import type { LLMMessage } from '@/lib/llm/types';

/**
 * Conversation Manager
 *
 * Handles conversation history, persistence, and formatting.
 */
export class ConversationManager {
  private messages: ConversationMessage[] = [];
  private maxLength: number;
  private persistPath?: string;

  constructor(maxLength = 50, persistPath?: string) {
    this.maxLength = maxLength;
    this.persistPath = persistPath;
  }

  /**
   * Add message to conversation history
   */
  addMessage(
    role: MessageRole,
    content: string,
    action?: string,
    metadata?: Record<string, unknown>
  ): void {
    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date(),
      action,
      metadata,
    };

    this.messages.push(message);

    // Trim if exceeds max length (keep system messages)
    if (this.messages.length > this.maxLength) {
      this.trimHistory();
    }
  }

  /**
   * Add user message
   */
  addUserMessage(content: string, action?: string): void {
    this.addMessage('user', content, action);
  }

  /**
   * Add assistant message
   */
  addAssistantMessage(content: string, action?: string): void {
    this.addMessage('assistant', content, action);
  }

  /**
   * Add system message
   */
  addSystemMessage(content: string): void {
    this.addMessage('system', content);
  }

  /**
   * Get all messages
   */
  getMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  /**
   * Get messages formatted for LLM
   */
  getFormattedMessages(): LLMMessage[] {
    return this.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Get recent messages (last N)
   */
  getRecentMessages(count: number): ConversationMessage[] {
    return this.messages.slice(-count);
  }

  /**
   * Clear conversation history
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Get conversation length
   */
  length(): number {
    return this.messages.length;
  }

  /**
   * Trim history to max length, preserving system messages
   */
  private trimHistory(): void {
    // Separate system messages from others
    const systemMessages = this.messages.filter((msg) => msg.role === 'system');
    const otherMessages = this.messages.filter((msg) => msg.role !== 'system');

    // Keep most recent messages
    const maxOtherMessages = this.maxLength - systemMessages.length;
    const trimmedOthers = otherMessages.slice(-maxOtherMessages);

    // Rebuild array with system messages first
    this.messages = [...systemMessages, ...trimmedOthers];
  }

  /**
   * Save conversation state to file
   */
  async save(agentName: string, state: Record<string, unknown>): Promise<void> {
    if (!this.persistPath) {
      return;
    }

    const conversationState: ConversationState = {
      agentName,
      messages: this.messages,
      state,
      createdAt: this.messages[0]?.timestamp || new Date(),
      updatedAt: new Date(),
    };

    const filePath = path.join(this.persistPath, `${agentName}-conversation.json`);

    // Ensure directory exists
    await fs.mkdir(this.persistPath, { recursive: true });

    // Write file
    await fs.writeFile(filePath, JSON.stringify(conversationState, null, 2), 'utf-8');
  }

  /**
   * Load conversation state from file
   */
  async load(agentName: string): Promise<Record<string, unknown> | null> {
    if (!this.persistPath) {
      return null;
    }

    const filePath = path.join(this.persistPath, `${agentName}-conversation.json`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const conversationState: ConversationState = JSON.parse(content);

      // Restore messages (convert timestamp strings back to Date)
      this.messages = conversationState.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return conversationState.state;
    } catch {
      // File doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Get conversation summary
   */
  getSummary(): {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    systemMessages: number;
    firstMessage?: Date;
    lastMessage?: Date;
  } {
    const userMessages = this.messages.filter((msg) => msg.role === 'user').length;
    const assistantMessages = this.messages.filter((msg) => msg.role === 'assistant').length;
    const systemMessages = this.messages.filter((msg) => msg.role === 'system').length;

    return {
      totalMessages: this.messages.length,
      userMessages,
      assistantMessages,
      systemMessages,
      firstMessage: this.messages[0]?.timestamp,
      lastMessage: this.messages[this.messages.length - 1]?.timestamp,
    };
  }
}

/**
 * Create conversation manager
 */
export function createConversationManager(
  maxLength = 50,
  persistPath?: string
): ConversationManager {
  return new ConversationManager(maxLength, persistPath);
}

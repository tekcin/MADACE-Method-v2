/**
 * Prompt Builder
 *
 * Constructs LLM prompts with agent persona, memory context, and conversation history
 */

import type { Agent } from '@prisma/client';
import {
  getMemories,
  formatMemoriesForPrompt,
  trackMemoryAccesses,
} from '@/lib/services/memory-service';

/**
 * Message for LLM
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Build system prompt for an agent with memory context
 */
export async function buildSystemPrompt(
  agent: Agent,
  userId: string,
  includeMemory = true
): Promise<string> {
  const persona = agent.persona as { role?: string; identity?: string; style?: string };

  let prompt = `You are ${agent.title}.`;

  if (persona.role) {
    prompt += `\n\nRole: ${persona.role}`;
  }

  if (persona.identity) {
    prompt += `\n\nIdentity: ${persona.identity}`;
  }

  if (persona.style) {
    prompt += `\n\nCommunication Style: ${persona.style}`;
  }

  // Add memory context if requested
  if (includeMemory) {
    try {
      const memories = await getMemories(agent.id, userId, {
        minImportance: 5, // Only include important memories
        limit: 20,
        orderBy: 'importance',
        order: 'desc',
      });

      if (memories.length > 0) {
        const memoryContext = formatMemoriesForPrompt(memories);
        prompt += `\n\n--- Memory Context ---\nHere's what you remember about this user:\n\n${memoryContext}`;

        // Track memory access
        await trackMemoryAccesses(memories.map((m) => m.id));
      }
    } catch (error) {
      console.error('[PromptBuilder] Error loading memories:', error);
      // Continue without memory if there's an error
    }
  }

  return prompt;
}

/**
 * Build full prompt messages for LLM including system prompt, conversation history, and current message
 */
export async function buildPromptMessages(
  agent: Agent,
  userId: string,
  conversationHistory: LLMMessage[],
  currentMessage: string,
  includeMemory = true
): Promise<LLMMessage[]> {
  const systemPrompt = await buildSystemPrompt(agent, userId, includeMemory);

  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...conversationHistory,
    {
      role: 'user',
      content: currentMessage,
    },
  ];

  return messages;
}

/**
 * Limit prompt context to avoid exceeding LLM token limits
 * Keeps most recent messages within token budget
 */
export function limitPromptContext(messages: LLMMessage[], maxTokens = 4000): LLMMessage[] {
  // Rough estimate: 1 token ≈ 4 characters
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  // Always keep system message
  const systemMessage = messages.find((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const limitedMessages: LLMMessage[] = [];
  let currentTokens = systemMessage ? estimateTokens(systemMessage.content) : 0;

  // Add messages from most recent first
  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    const message = conversationMessages[i];
    if (!message) continue; // Skip if undefined

    const messageTokens = estimateTokens(message.content);

    if (currentTokens + messageTokens > maxTokens) {
      break;
    }

    limitedMessages.unshift(message);
    currentTokens += messageTokens;
  }

  // Prepend system message
  if (systemMessage) {
    limitedMessages.unshift(systemMessage);
  }

  return limitedMessages;
}

/**
 * Format conversation history from database messages
 */
export function formatConversationHistory(
  messages: Array<{ role: string; content: string }>
): LLMMessage[] {
  return messages.map((msg) => ({
    role: msg.role === 'agent' ? 'assistant' : (msg.role as 'user' | 'system'),
    content: msg.content,
  }));
}

/**
 * Agent Response Formatter
 *
 * Formats and processes agent responses from LLM interactions.
 */

import type { AgentResponse } from './types';
import type { LLMResponse } from '@/lib/llm/types';

/**
 * Format successful agent response
 */
export function formatSuccess(
  message: string,
  data?: unknown,
  action?: string,
  suggestions?: string[]
): AgentResponse {
  return {
    success: true,
    message,
    data,
    action,
    suggestions,
  };
}

/**
 * Format error response
 */
export function formatError(message: string, error?: Error, action?: string): AgentResponse {
  return {
    success: false,
    message,
    error,
    action,
  };
}

/**
 * Format LLM response as agent response
 */
export function formatLLMResponse(llmResponse: LLMResponse, action?: string): AgentResponse {
  // Extract suggestions from response (look for markdown lists)
  const suggestions = extractSuggestions(llmResponse.content);

  return {
    success: true,
    message: llmResponse.content,
    action,
    suggestions,
    metadata: {
      tokensUsed: llmResponse.usage?.totalTokens,
      model: llmResponse.model,
    },
  };
}

/**
 * Extract action suggestions from text
 *
 * Looks for patterns like:
 * - Next steps:
 * - You can:
 * - Available actions:
 */
export function extractSuggestions(text: string): string[] | undefined {
  const suggestions: string[] = [];

  // Match bullet lists after trigger phrases
  const triggerPatterns = [
    /(?:next steps?|you can|available actions?|suggestions?):\s*\n((?:[-*]\s+.+\n?)+)/gi,
  ];

  for (const pattern of triggerPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        // Extract individual bullet points
        const bullets = match[1].match(/[-*]\s+(.+)/g);
        if (bullets) {
          suggestions.push(...bullets.map((b) => b.replace(/^[-*]\s+/, '').trim()));
        }
      }
    }
  }

  return suggestions.length > 0 ? suggestions : undefined;
}

/**
 * Extract action name from trigger
 *
 * Converts "*workflow-status" to "workflow-status"
 */
export function extractActionName(trigger: string): string {
  return trigger.replace(/^\*/, '');
}

/**
 * Format action name for display
 *
 * Converts "workflow-status" to "Workflow Status"
 */
export function formatActionName(actionName: string): string {
  return actionName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if text contains an action trigger
 */
export function containsActionTrigger(text: string): boolean {
  return /\*[a-z-]+/.test(text);
}

/**
 * Extract all action triggers from text
 */
export function extractActionTriggers(text: string): string[] {
  const matches = text.matchAll(/\*([a-z-]+)/g);
  return Array.from(matches, (m) => m[1]).filter((x): x is string => x !== undefined);
}

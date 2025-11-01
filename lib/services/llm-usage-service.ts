/**
 * LLM Usage Tracking Service
 *
 * Tracks all LLM API calls for:
 * - Token usage monitoring
 * - Cost estimation
 * - Performance analytics
 * - Error tracking
 */

import { prisma } from '@/lib/database/client';
import type { LLMProvider } from '@/lib/llm/types';

export interface LogLLMUsageParams {
  provider: LLMProvider;
  model: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  agentId?: string;
  messageId?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  finishReason?: string;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
}

export interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  averageResponseTime: number;
}

export interface ProviderStats extends UsageStats {
  provider: string;
}

/**
 * Log LLM usage to database
 */
export async function logLLMUsage(params: LogLLMUsageParams): Promise<void> {
  try {
    const estimatedCost = calculateCost(
      params.provider,
      params.promptTokens,
      params.completionTokens
    );

    await prisma.lLMUsage.create({
      data: {
        provider: params.provider,
        model: params.model,
        requestId: params.requestId,
        userId: params.userId,
        sessionId: params.sessionId,
        agentId: params.agentId,
        messageId: params.messageId,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.totalTokens,
        finishReason: params.finishReason,
        responseTime: params.responseTime,
        success: params.success,
        errorMessage: params.errorMessage,
        estimatedCost,
      },
    });
  } catch (error) {
    console.error('[LLM Usage Tracking] Failed to log usage:', error);
    // Don't throw - we don't want to break the main flow if logging fails
  }
}

/**
 * Get usage statistics for a session
 */
export async function getSessionUsageStats(sessionId: string): Promise<UsageStats> {
  const usage = await prisma.lLMUsage.findMany({
    where: { sessionId },
  });

  if (usage.length === 0) {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedCost: 0,
      averageResponseTime: 0,
    };
  }

  const totalRequests = usage.length;
  const successfulRequests = usage.filter((u) => u.success).length;
  const failedRequests = totalRequests - successfulRequests;
  const totalTokens = usage.reduce((sum, u) => sum + u.totalTokens, 0);
  const promptTokens = usage.reduce((sum, u) => sum + u.promptTokens, 0);
  const completionTokens = usage.reduce((sum, u) => sum + u.completionTokens, 0);
  const estimatedCost = usage.reduce((sum, u) => sum + (u.estimatedCost || 0), 0);
  const averageResponseTime =
    usage.reduce((sum, u) => sum + u.responseTime, 0) / totalRequests;

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    totalTokens,
    promptTokens,
    completionTokens,
    estimatedCost,
    averageResponseTime,
  };
}

/**
 * Get usage statistics by provider for a session
 */
export async function getSessionProviderStats(sessionId: string): Promise<ProviderStats[]> {
  const usage = await prisma.lLMUsage.findMany({
    where: { sessionId },
  });

  const byProvider = usage.reduce(
    (acc, record) => {
      if (!acc[record.provider]) {
        acc[record.provider] = [];
      }
      acc[record.provider]!.push(record);
      return acc;
    },
    {} as Record<string, typeof usage>
  );

  return Object.entries(byProvider).map(([provider, records]) => {
    const totalRequests = records.length;
    const successfulRequests = records.filter((r) => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const promptTokens = records.reduce((sum, r) => sum + r.promptTokens, 0);
    const completionTokens = records.reduce((sum, r) => sum + r.completionTokens, 0);
    const estimatedCost = records.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    const averageResponseTime =
      records.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests;

    return {
      provider,
      totalRequests,
      successfulRequests,
      failedRequests,
      totalTokens,
      promptTokens,
      completionTokens,
      estimatedCost,
      averageResponseTime,
    };
  });
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ total: UsageStats; byProvider: ProviderStats[] }> {
  const where = {
    userId,
    ...(startDate && endDate
      ? {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {}),
  };

  const usage = await prisma.lLMUsage.findMany({ where });

  if (usage.length === 0) {
    return {
      total: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        estimatedCost: 0,
        averageResponseTime: 0,
      },
      byProvider: [],
    };
  }

  // Calculate total stats
  const totalRequests = usage.length;
  const successfulRequests = usage.filter((u) => u.success).length;
  const failedRequests = totalRequests - successfulRequests;
  const totalTokens = usage.reduce((sum, u) => sum + u.totalTokens, 0);
  const promptTokens = usage.reduce((sum, u) => sum + u.promptTokens, 0);
  const completionTokens = usage.reduce((sum, u) => sum + u.completionTokens, 0);
  const estimatedCost = usage.reduce((sum, u) => sum + (u.estimatedCost || 0), 0);
  const averageResponseTime =
    usage.reduce((sum, u) => sum + u.responseTime, 0) / totalRequests;

  // Calculate by provider
  const byProvider = usage.reduce(
    (acc, record) => {
      if (!acc[record.provider]) {
        acc[record.provider] = [];
      }
      acc[record.provider]!.push(record);
      return acc;
    },
    {} as Record<string, typeof usage>
  );

  const providerStats = Object.entries(byProvider).map(([provider, records]) => {
    const totalRequests = records.length;
    const successfulRequests = records.filter((r) => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const promptTokens = records.reduce((sum, r) => sum + r.promptTokens, 0);
    const completionTokens = records.reduce((sum, r) => sum + r.completionTokens, 0);
    const estimatedCost = records.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    const averageResponseTime =
      records.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests;

    return {
      provider,
      totalRequests,
      successfulRequests,
      failedRequests,
      totalTokens,
      promptTokens,
      completionTokens,
      estimatedCost,
      averageResponseTime,
    };
  });

  return {
    total: {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalTokens,
      promptTokens,
      completionTokens,
      estimatedCost,
      averageResponseTime,
    },
    byProvider: providerStats,
  };
}

/**
 * Calculate estimated cost based on provider pricing
 * Prices as of January 2025 (approximate)
 */
function calculateCost(
  provider: LLMProvider,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = {
    gemini: {
      prompt: 0.00015 / 1000, // $0.15 per 1M tokens (Gemini 2.0 Flash)
      completion: 0.0006 / 1000, // $0.60 per 1M tokens
    },
    claude: {
      prompt: 0.003 / 1000, // $3 per 1M tokens (Claude 3.5 Sonnet)
      completion: 0.015 / 1000, // $15 per 1M tokens
    },
    openai: {
      prompt: 0.0025 / 1000, // $2.50 per 1M tokens (GPT-4o)
      completion: 0.01 / 1000, // $10 per 1M tokens
    },
    local: {
      prompt: 0, // Free
      completion: 0,
    },
  };

  const rates = pricing[provider];
  return promptTokens * rates.prompt + completionTokens * rates.completion;
}

/**
 * Format cost as USD string
 */
export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

/**
 * Format token count with commas
 */
export function formatTokens(tokens: number): string {
  return tokens.toLocaleString();
}

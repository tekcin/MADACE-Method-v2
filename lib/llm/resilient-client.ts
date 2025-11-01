/**
 * Resilient LLM Client
 *
 * Provides automatic fallback and retry logic for LLM API calls.
 * Implements exponential backoff and multi-provider failover.
 *
 * Based on RULES.md:
 * - RULE 3.6: LLM Provider Resilience
 * - RULE 5.4: Forgiving Errors, Clear Recovery
 */

import { createLLMClient } from './client';
import type { LLMProvider, LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk } from './types';

export interface ResilientClientOptions {
  preferredProvider?: LLMProvider;
  maxRetries?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  enableFallback?: boolean;
  fallbackProviders?: LLMProvider[];
}

export interface ResilientLLMClient {
  chat(request: LLMRequest): Promise<LLMResponse>;
  chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk>;
  provider: LLMProvider;
  config: LLMConfig;
}

export interface ProviderAttempt {
  provider: LLMProvider;
  attempt: number;
  error?: Error;
  timestamp: number;
}

export class ResilientLLMError extends Error {
  constructor(
    message: string,
    public attempts: ProviderAttempt[],
    public allProvidersFailed: boolean = false
  ) {
    super(message);
    this.name = 'ResilientLLMError';
  }
}

/**
 * Default fallback chain for each provider
 */
const DEFAULT_FALLBACK_CHAIN: Record<LLMProvider, LLMProvider[]> = {
  claude: ['gemini', 'local'],
  gemini: ['claude', 'local'],
  openai: ['gemini', 'local'],
  local: [], // No fallback for local
};

/**
 * Determines if an error is retryable (temporary failure)
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('overloaded') ||
    message.includes('rate limit') ||
    message.includes('timeout') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('econnreset') ||
    message.includes('enotfound')
  );
}

/**
 * Determines if an error warrants trying a different provider
 */
function shouldFallbackToNextProvider(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('overloaded') ||
    message.includes('rate limit') ||
    message.includes('unavailable') ||
    message.includes('invalid api key') ||
    message.includes('authentication failed')
  );
}

/**
 * Sleep utility for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt: number, initialMs: number, maxMs: number): number {
  const delay = initialMs * Math.pow(2, attempt);
  return Math.min(delay, maxMs);
}

/**
 * Get provider-specific configuration
 */
function getProviderConfig(provider: LLMProvider): LLMConfig {
  const configs: Record<LLMProvider, LLMConfig> = {
    gemini: {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    },
    claude: {
      provider: 'claude',
      apiKey: process.env.CLAUDE_API_KEY,
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    },
    openai: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-latest',
    },
    local: {
      provider: 'local',
      baseURL: process.env.LOCAL_MODEL_URL || 'http://localhost:11434',
      model: process.env.LOCAL_MODEL_NAME || 'gemma2:2b',
    },
  };

  return configs[provider];
}

/**
 * Create a resilient LLM client with automatic fallback and retry logic
 */
export async function createResilientLLMClient(
  options: ResilientClientOptions = {}
): Promise<ResilientLLMClient> {
  const {
    preferredProvider = 'gemini',
    maxRetries = 2,
    initialBackoffMs = 1000,
    maxBackoffMs = 10000,
    enableFallback = true,
    fallbackProviders,
  } = options;

  const attempts: ProviderAttempt[] = [];

  /**
   * Attempt a request with a specific provider
   */
  async function attemptRequest(
    provider: LLMProvider,
    request: LLMRequest
  ): Promise<LLMResponse> {
    const config = getProviderConfig(provider);
    const client = createLLMClient(config);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const attemptRecord: ProviderAttempt = {
        provider,
        attempt,
        timestamp: Date.now(),
      };

      try {
        const response = await client.chat(request);
        attempts.push(attemptRecord);
        return response;
      } catch (error) {
        attemptRecord.error = error as Error;
        attempts.push(attemptRecord);

        // If this is not the last retry and error is retryable, wait and retry
        if (attempt < maxRetries - 1 && isRetryableError(error as Error)) {
          const backoffMs = calculateBackoff(attempt, initialBackoffMs, maxBackoffMs);
          console.warn(
            `[ResilientLLM] ${provider} attempt ${attempt + 1}/${maxRetries} failed: ${(error as Error).message}. Retrying in ${backoffMs}ms...`
          );
          await sleep(backoffMs);
          continue;
        }

        // Last retry or non-retryable error
        throw error;
      }
    }

    throw new Error(`All ${maxRetries} retries exhausted for provider: ${provider}`);
  }

  /**
   * Wrapped chat method with resilience
   */
  async function chat(request: LLMRequest): Promise<LLMResponse> {
    // Try preferred provider first
    try {
      return await attemptRequest(preferredProvider, request);
    } catch (error) {
      const err = error as Error;
      console.warn(`[ResilientLLM] Preferred provider ${preferredProvider} failed: ${err.message}`);

      // If fallback is disabled, throw immediately
      if (!enableFallback) {
        throw new ResilientLLMError(
          `Primary provider ${preferredProvider} failed and fallback is disabled`,
          attempts,
          false
        );
      }

      // Check if we should try fallback providers
      if (!shouldFallbackToNextProvider(err)) {
        throw new ResilientLLMError(
          `Provider ${preferredProvider} failed with non-recoverable error: ${err.message}`,
          attempts,
          false
        );
      }

      // Try fallback providers
      const fallbacks = fallbackProviders || DEFAULT_FALLBACK_CHAIN[preferredProvider] || [];

      for (const fallbackProvider of fallbacks) {
        try {
          console.warn(`[ResilientLLM] Attempting fallback provider: ${fallbackProvider}`);
          return await attemptRequest(fallbackProvider, request);
        } catch (fallbackError) {
          console.warn(
            `[ResilientLLM] Fallback provider ${fallbackProvider} failed: ${(fallbackError as Error).message}`
          );
          // Continue to next fallback
          continue;
        }
      }

      // All providers failed
      throw new ResilientLLMError(
        `All LLM providers failed. Tried: ${preferredProvider}, ${fallbacks.join(', ')}`,
        attempts,
        true
      );
    }
  }

  /**
   * Wrapped chatStream method with resilience
   */
  async function* chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    // Similar logic to chat, but for streaming
    try {
      const config = getProviderConfig(preferredProvider);
      const client = createLLMClient(config);

      yield* client.chatStream(request);
    } catch (error) {
      const err = error as Error;
      console.warn(`[ResilientLLM] Streaming failed with ${preferredProvider}: ${err.message}`);

      if (!enableFallback || !shouldFallbackToNextProvider(err)) {
        throw new ResilientLLMError(`Streaming failed with ${preferredProvider}`, attempts, false);
      }

      // Try fallback providers for streaming
      const fallbacks = fallbackProviders || DEFAULT_FALLBACK_CHAIN[preferredProvider] || [];

      for (const fallbackProvider of fallbacks) {
        try {
          console.warn(
            `[ResilientLLM] Attempting streaming with fallback provider: ${fallbackProvider}`
          );
          const fallbackConfig = getProviderConfig(fallbackProvider);
          const fallbackClient = createLLMClient(fallbackConfig);

          yield* fallbackClient.chatStream(request);
          return; // Success
        } catch (fallbackError) {
          console.warn(
            `[ResilientLLM] Fallback streaming provider ${fallbackProvider} failed: ${(fallbackError as Error).message}`
          );
          continue;
        }
      }

      throw new ResilientLLMError(
        `All streaming providers failed. Tried: ${preferredProvider}, ${fallbacks.join(', ')}`,
        attempts,
        true
      );
    }
  }

  // Return client interface
  return {
    chat,
    chatStream,
    provider: preferredProvider,
    config: {
      provider: preferredProvider,
      model: '',
      maxTokens: 2048,
      temperature: 0.7,
    },
  };
}

/**
 * Get diagnostic information about failed attempts
 */
export function getDiagnostics(error: ResilientLLMError): string {
  const lines = [`LLM Request Failed - ${error.message}`, '', 'Attempt History:'];

  error.attempts.forEach((attempt, index) => {
    lines.push(`  ${index + 1}. Provider: ${attempt.provider}, Attempt: ${attempt.attempt + 1}`);
    if (attempt.error) {
      lines.push(`     Error: ${attempt.error.message}`);
    }
    lines.push(`     Time: ${new Date(attempt.timestamp).toISOString()}`);
  });

  if (error.allProvidersFailed) {
    lines.push('');
    lines.push('⚠️  All providers failed. Possible solutions:');
    lines.push('  1. Check API keys in .env file');
    lines.push('  2. Verify internet connection');
    lines.push('  3. Check provider status pages:');
    lines.push('     - Claude: https://status.anthropic.com');
    lines.push('     - Gemini: https://status.cloud.google.com');
    lines.push('  4. Try again in a few minutes');
  }

  return lines.join('\n');
}

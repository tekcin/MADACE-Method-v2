/**
 * OpenAI Provider - Real OpenAI API Integration
 * Story LLM-016: OpenAI provider implementation
 *
 * Provides actual integration with OpenAI's GPT models:
 * - gpt-4o-latest (most capable)
 * - gpt-4o-mini (fast, efficient)
 * - gpt-3.5-turbo-latest (cost-effective)
 *
 * Features: Real API calls, streaming, rate limiting, error handling
 */

import { BaseLLMProvider } from './base';
import type { LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

/**
 * OpenAI-specific error codes from OpenAI API
 */
export const OPENAI_ERROR_CODES = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  INSUFFICIENT_QUOTA: 'INSUFFICIENT_QUOTA',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  CONTENT_FILTERED: 'CONTENT_FILTERED',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  SERVER_OVERLOADED: 'SERVER_OVERLOADED',
  TIMEOUT: 'TIMEOUT',
} as const;

/**
 * OpenAI-specific error class
 */
export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly code: keyof typeof OPENAI_ERROR_CODES,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

/**
 * OpenAI model configuration and capabilities
 */
export const OPENAI_MODELS = {
  'gpt-4o-latest': {
    maxTokens: 128000,
    contextWindow: 128000,
    supportedFeatures: ['chat', 'streaming', 'function_calling'],
    pricing: { input: 0.000015, output: 0.00006 },
  },
  'gpt-4o-mini': {
    maxTokens: 128000,
    contextWindow: 128000,
    supportedFeatures: ['chat', 'streaming'],
    pricing: { input: 0.0000006, output: 0.0000024 },
  },
  'gpt-3.5-turbo-latest': {
    maxTokens: 16384,
    contextWindow: 16384,
    supportedFeatures: ['chat', 'streaming'],
    pricing: { input: 0.0000015, output: 0.000002 },
  },
} as const;

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000], // Exponential backoff with jitter
} as const;

/**
 * Request tracker for rate limiting
 */
class RequestTracker {
  private readonly requests: number[] = [];

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  async waitForSlot(): Promise<void> {
    const now = Date.now();

    // Remove expired requests
    this.requests.splice(
      0,
      this.requests.findIndex((r) => r > now - this.windowMs)
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      if (!oldestRequest) return;
      const waitTime = Math.max(0, oldestRequest + this.windowMs - now);
      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    this.requests.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class OpenAIProvider extends BaseLLMProvider {
  private readonly baseURL: string;
  private readonly requestTracker: RequestTracker;

  constructor(config: LLMConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('OpenAI provider requires API key');
    }

    this.baseURL = 'https://api.openai.com/v1';

    // Initialize rate limiting for this model
    const rateLimit = 3000; // Conservative rate limit for most OpenAI models
    this.requestTracker = new RequestTracker(rateLimit, 60000); // 1 minute window

    this.validateConfig();
  }

  /**
   * Enhanced config validation for OpenAI
   */
  validateConfig(): boolean {
    if (!this.config.apiKey) {
      throw new OpenAIError('API key is required for OpenAI provider', 'INVALID_API_KEY');
    }

    if (!OPENAI_MODELS[this.config.model as keyof typeof OPENAI_MODELS]) {
      throw new OpenAIError(
        `Unsupported model: ${this.config.model}. Supported models: ${Object.keys(OPENAI_MODELS).join(', ')}`,
        'MODEL_NOT_FOUND'
      );
    }

    return true;
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    await this.requestTracker.waitForSlot();

    const data = this.formatRequest(request);

    try {
      const response = await this.callAPI('chat/completions', data);
      return this.formatResponse(response);
    } catch (error) {
      throw this.handleError(error, 'openai');
    }
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    await this.requestTracker.waitForSlot();

    const data = {
      ...this.formatRequest(request),
      stream: true,
    };

    try {
      yield* this.streamAPI('chat/completions', data);
    } catch (error) {
      throw this.handleError(error, 'openai');
    }
  }

  /**
   * Format request for OpenAI API
   */
  private formatRequest(request: LLMRequest) {
    return {
      model: this.config.model,
      messages: request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature || 0.7,
      top_p: request.topP || 1,
      max_tokens: Math.min(request.maxTokens || 1024, 4096),
      stream: false,
    };
  }

  /**
   * Format response from OpenAI API
   */
  private formatResponse(response: {
    choices?: { message?: { content: string }; finish_reason?: string }[];
    model: string;
    usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  }): LLMResponse {
    const choice = response.choices?.[0];

    return {
      content: choice?.message?.content || '',
      provider: 'openai',
      model: response.model,
      usage: this.formatUsage(response.usage),
      finishReason: this.mapFinishReason(choice?.finish_reason),
    };
  }

  /**
   * Format usage data
   */
  private formatUsage(usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  }) {
    return {
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
    };
  }

  /**
   * Map OpenAI finish reason to standard format
   */
  private mapFinishReason(
    reason?: string
  ): 'stop' | 'length' | 'content_filter' | 'error' | undefined {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'function_call':
        return 'stop'; // Map function_call to stop as fallback
      default:
        return;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callAPI(
    endpoint: string,
    data: unknown
  ): Promise<{
    choices?: { message?: { content: string }; finish_reason?: string }[];
    model: string;
    usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  }> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= RATE_LIMITS.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey || ''}`,
          },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw this.fromApiResponse(response.status, errorData);
        }

        return await response.json();
      } catch (error) {
        lastError = error;

        if (!this.isRetryable(error) || attempt === RATE_LIMITS.MAX_RETRIES) {
          throw error;
        }

        // Exponential backoff with jitter
        const retryDelay = RATE_LIMITS.RETRY_DELAYS[attempt - 1];
        const delay = (retryDelay || 1000) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Streaming API call with SSE parsing
   */
  private async *streamAPI(endpoint: string, data: unknown): AsyncGenerator<LLMStreamChunk> {
    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey || ''}`,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(60000), // 60 second timeout for streaming
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.fromApiResponse(response.status, errorData);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new OpenAIError('Response body is not readable', 'INVALID_REQUEST');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Process all complete lines except the last one (might be incomplete)
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i]?.trim() || '';
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content || '';
              const done = data.choices?.[0]?.finish_reason === 'stop';
              yield { content, done };
            } catch {
              // Skip invalid JSON lines
            }
          }
        }

        // Keep the incomplete last line for next iteration
        buffer = lines[lines.length - 1] || '';

        // Check for completion marker
        if (buffer === 'data: [DONE]') {
          break;
        }
      }
    } catch (error) {
      throw this.handleError(error, 'openai');
    }
  }

  /**
   * Handle errors with helpful context
   */
  protected handleError(error: unknown, _provider: string): never {
    if (error instanceof OpenAIError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    // Map common errors to OpenAI error codes
    if (message.includes('401') || message.includes('Unauthorized')) {
      throw new OpenAIError(
        'Invalid API key. Check your OpenAI API key.',
        'INVALID_API_KEY',
        401,
        error
      );
    }

    if (message.includes('429') || message.includes('Rate limit')) {
      throw new OpenAIError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMITED',
        429,
        error
      );
    }

    if (message.includes('404')) {
      throw new OpenAIError(
        'Model not found. Check the model name.',
        'MODEL_NOT_FOUND',
        404,
        error
      );
    }

    if (message.includes('400')) {
      throw new OpenAIError('Invalid request format or parameters.', 'INVALID_REQUEST', 400, error);
    }

    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      throw new OpenAIError(
        'OpenAI servers temporarily unavailable. Please try again.',
        'SERVER_OVERLOADED',
        500,
        error
      );
    }

    throw new OpenAIError(`OpenAI API error: ${message}`, 'INVALID_REQUEST', undefined, error);
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof OpenAIError) {
      return ['RATE_LIMITED', 'SERVER_OVERLOADED', 'TIMEOUT'].includes(error.code);
    }

    if (error instanceof Error) {
      return (
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('500') ||
        error.message.includes('502') ||
        error.message.includes('503')
      );
    }

    return false;
  }

  /**
   * Create OpenAIError from API response
   */
  private fromApiResponse(status: number, data: { error?: { message?: string } }): OpenAIError {
    const message = data?.error?.message || 'Unknown API error';

    switch (status) {
      case 401:
        return new OpenAIError(message, 'INVALID_API_KEY', status, data);
      case 429:
        return new OpenAIError(message, 'RATE_LIMITED', status, data);
      case 404:
        return new OpenAIError(message, 'MODEL_NOT_FOUND', status, data);
      case 400:
        return new OpenAIError(message, 'INVALID_REQUEST', status, data);
      case 500:
      case 502:
      case 503:
        return new OpenAIError(message, 'SERVER_OVERLOADED', status, data);
      default:
        return new OpenAIError(message, 'INVALID_REQUEST', status, data);
    }
  }
}

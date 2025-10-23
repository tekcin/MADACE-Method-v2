/**
 * Claude Provider - Real Anthropic Claude API Integration
 * Story LLM-015: Claude provider implementation
 *
 * Provides actual integration with Anthropic's Claude models:
 * - claude-3-5-sonnet-20241022 (most intelligent)
 * - claude-3-5-haiku-20241022 (fast, affordable)
 * - claude-3-opus-20240229 (previous flagship)
 *
 * Features: Real API calls, streaming, rate limiting, error handling
 */

import { BaseLLMProvider } from './base';
import type { LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

/**
 * Claude-specific error codes from Anthropic API
 */
export const CLAUDE_ERROR_CODES = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_REQUEST: 'INVALID_REQUEST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  OVERLOADED: 'OVERLOADED',
  CONTEXT_LENGTH_EXCEEDED: 'CONTEXT_LENGTH_EXCEEDED',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TIMEOUT: 'TIMEOUT',
} as const;

/**
 * Claude-specific error class
 */
export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public readonly code: keyof typeof CLAUDE_ERROR_CODES,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}

/**
 * Claude model configuration and capabilities
 */
export const CLAUDE_MODELS = {
  'claude-3-5-sonnet-20241022': {
    maxTokens: 8192,
    contextWindow: 200000,
    supportedFeatures: ['chat', 'streaming', 'vision'],
    pricing: { input: 0.003, output: 0.015 },
  },
  'claude-3-5-haiku-20241022': {
    maxTokens: 8192,
    contextWindow: 200000,
    supportedFeatures: ['chat', 'streaming', 'vision'],
    pricing: { input: 0.00025, output: 0.00125 },
  },
  'claude-3-opus-20240229': {
    maxTokens: 4096,
    contextWindow: 200000,
    supportedFeatures: ['chat', 'streaming', 'vision'],
    pricing: { input: 0.015, output: 0.075 },
  },
} as const;

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000], // Exponential backoff
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

/**
 * Claude Messages API request format
 */
interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

/**
 * Claude Messages API response format
 */
interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Claude streaming event types
 */
interface ClaudeStreamEvent {
  type:
    | 'message_start'
    | 'content_block_start'
    | 'content_block_delta'
    | 'content_block_stop'
    | 'message_delta'
    | 'message_stop'
    | 'ping'
    | 'error';
  message?: ClaudeResponse;
  delta?: {
    type: 'text_delta';
    text: string;
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: {
    type: string;
    message: string;
  };
}

export class ClaudeProvider extends BaseLLMProvider {
  private readonly baseURL: string;
  private readonly requestTracker: RequestTracker;

  constructor(config: LLMConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Claude provider requires API key');
    }

    this.baseURL = 'https://api.anthropic.com/v1';

    // Initialize rate limiting (conservative default: 50 req/min)
    const rateLimit = 50;
    this.requestTracker = new RequestTracker(rateLimit, 60000); // 1 minute window

    this.validateConfig();
  }

  /**
   * Enhanced config validation for Claude
   */
  validateConfig(): boolean {
    if (!this.config.apiKey) {
      throw new ClaudeAPIError('API key is required for Claude provider', 'INVALID_API_KEY');
    }

    if (!CLAUDE_MODELS[this.config.model as keyof typeof CLAUDE_MODELS]) {
      throw new ClaudeAPIError(
        `Unsupported model: ${this.config.model}. Supported models: ${Object.keys(CLAUDE_MODELS).join(', ')}`,
        'MODEL_NOT_FOUND'
      );
    }

    return true;
  }

  /**
   * Real Claude API chat implementation
   */
  async chat(request: LLMRequest): Promise<LLMResponse> {
    await this.requestTracker.waitForSlot();

    const data = this.formatRequest(request);

    try {
      const response = await this.callAPI('messages', data);
      return this.formatResponse(response);
    } catch (error) {
      throw this.handleError(error, 'claude');
    }
  }

  /**
   * Real Claude streaming implementation
   */
  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    await this.requestTracker.waitForSlot();

    const data = {
      ...this.formatRequest(request),
      stream: true,
    };

    try {
      yield* this.streamAPI('messages', data);
    } catch (error) {
      throw this.handleError(error, 'claude');
    }
  }

  /**
   * Format request for Claude Messages API
   */
  private formatRequest(request: LLMRequest): ClaudeRequest {
    return {
      model: this.config.model,
      max_tokens: Math.min(request.maxTokens || 1024, 8192),
      messages: request.messages.map((msg) => ({
        role: msg.role === 'system' ? 'user' : msg.role, // Claude doesn't have system role in messages
        content: msg.content,
      })),
      temperature: request.temperature || 1.0,
      top_p: request.topP || 1.0,
      stream: false,
    };
  }

  /**
   * Format response from Claude API
   */
  private formatResponse(response: ClaudeResponse): LLMResponse {
    const textContent = response.content.find((c) => c.type === 'text');

    return {
      content: textContent?.text || '',
      provider: 'claude',
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      finishReason: this.mapStopReason(response.stop_reason),
    };
  }

  /**
   * Map Claude stop reason to standard format
   */
  private mapStopReason(
    reason: ClaudeResponse['stop_reason']
  ): 'stop' | 'length' | 'content_filter' | 'error' | undefined {
    switch (reason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'stop_sequence':
        return 'stop';
      default:
        return undefined;
    }
  }

  /**
   * Call Claude API with retry logic
   */
  private async callAPI(endpoint: string, data: ClaudeRequest): Promise<ClaudeResponse> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= RATE_LIMITS.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey || '',
            'anthropic-version': '2023-06-01',
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
  private async *streamAPI(endpoint: string, data: ClaudeRequest): AsyncGenerator<LLMStreamChunk> {
    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey || '',
          'anthropic-version': '2023-06-01',
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
        throw new ClaudeAPIError('Response body is not readable', 'INVALID_REQUEST');
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
            const data = line.slice(6);

            // Skip ping events
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }

            try {
              const event: ClaudeStreamEvent = JSON.parse(data);

              // Handle different event types
              if (event.type === 'content_block_delta' && event.delta?.text) {
                yield {
                  content: event.delta.text,
                  done: false,
                };
              } else if (event.type === 'message_stop') {
                yield { content: '', done: true };
                return;
              } else if (event.type === 'error' && event.error) {
                throw new ClaudeAPIError(
                  event.error.message,
                  'INVALID_REQUEST',
                  undefined,
                  event.error
                );
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              if (parseError instanceof ClaudeAPIError) {
                throw parseError;
              }
            }
          }
        }

        // Keep the incomplete last line for next iteration
        buffer = lines[lines.length - 1] || '';
      }

      yield { content: '', done: true };
    } catch (error) {
      throw this.handleError(error, 'claude');
    }
  }

  /**
   * Handle errors with helpful context
   */
  protected handleError(error: unknown, _provider: string): never {
    if (error instanceof ClaudeAPIError) {
      // Add helpful context for common errors
      let message = error.message;

      switch (error.code) {
        case 'INVALID_API_KEY':
          message += '. Get your API key from https://console.anthropic.com/account/keys';
          break;
        case 'RATE_LIMIT_EXCEEDED':
          message += '. Rate limit exceeded. Please wait and try again.';
          break;
        case 'CONTEXT_LENGTH_EXCEEDED':
          message +=
            '. The message is too long for the model context window. Try reducing the message length.';
          break;
        case 'OVERLOADED':
          message += '. Claude API is temporarily overloaded. Please try again in a few moments.';
          break;
      }

      throw new ClaudeAPIError(message, error.code, error.status, error.details);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    // Map common errors to Claude error codes
    if (message.includes('401') || message.includes('Unauthorized')) {
      throw new ClaudeAPIError(
        'Invalid API key. Check your Claude API key.',
        'INVALID_API_KEY',
        401,
        error
      );
    }

    if (message.includes('429') || message.includes('Rate limit')) {
      throw new ClaudeAPIError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMIT_EXCEEDED',
        429,
        error
      );
    }

    if (message.includes('404')) {
      throw new ClaudeAPIError(
        'Model not found. Check the model name.',
        'MODEL_NOT_FOUND',
        404,
        error
      );
    }

    if (message.includes('400')) {
      throw new ClaudeAPIError(
        'Invalid request format or parameters.',
        'INVALID_REQUEST',
        400,
        error
      );
    }

    if (message.includes('529') || message.includes('overloaded')) {
      throw new ClaudeAPIError(
        'Claude API temporarily overloaded. Please try again.',
        'OVERLOADED',
        529,
        error
      );
    }

    throw new ClaudeAPIError(`Claude API error: ${message}`, 'INVALID_REQUEST', undefined, error);
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof ClaudeAPIError) {
      return ['RATE_LIMIT_EXCEEDED', 'OVERLOADED', 'TIMEOUT'].includes(error.code);
    }

    if (error instanceof Error) {
      return (
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('529') ||
        error.message.includes('overloaded')
      );
    }

    return false;
  }

  /**
   * Create ClaudeAPIError from API response
   */
  private fromApiResponse(
    status: number,
    data: { error?: { type?: string; message?: string } }
  ): ClaudeAPIError {
    const message = data?.error?.message || 'Unknown API error';
    const errorType = data?.error?.type || '';

    switch (status) {
      case 401:
        return new ClaudeAPIError(message, 'INVALID_API_KEY', status, data);
      case 429:
        return new ClaudeAPIError(message, 'RATE_LIMIT_EXCEEDED', status, data);
      case 404:
        return new ClaudeAPIError(message, 'MODEL_NOT_FOUND', status, data);
      case 400:
        if (errorType.includes('context_length')) {
          return new ClaudeAPIError(message, 'CONTEXT_LENGTH_EXCEEDED', status, data);
        }
        return new ClaudeAPIError(message, 'INVALID_REQUEST', status, data);
      case 529:
        return new ClaudeAPIError(message, 'OVERLOADED', status, data);
      default:
        return new ClaudeAPIError(message, 'INVALID_REQUEST', status, data);
    }
  }
}

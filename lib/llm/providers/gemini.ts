/**
 * Gemini Provider - Real Google Gemini API Integration
 * Story LLM-014: Gemini provider implementation
 *
 * Provides actual integration with Google's Gemini models:
 * - gemini-2.0-flash-exp (latest experimental)
 * - gemini-1.5-flash-latest (fast, efficient)
 * - gemini-1.5-pro-latest (capable, powerful)
 *
 * Features: Real API calls, streaming, rate limiting, error handling
 */

import { BaseLLMProvider } from './base';
import type { LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

/**
 * Gemini-specific error codes from Google AI API
 */
export const GEMINI_ERROR_CODES = {
  INVALID_API_KEY: 'API_KEY_INVALID',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  CONTENT_FILTERED: 'CONTENT_FILTERED',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_REQUEST: 'INVALID_REQUEST',
} as const;

/**
 * Gemini-specific error class
 */
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public readonly code: keyof typeof GEMINI_ERROR_CODES,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

/**
 * Gemini model configuration and capabilities
 */
export const GEMINI_MODELS = {
  'gemini-2.0-flash-exp': {
    maxTokens: 8192,
    contextWindow: 1_000_000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    apiEndpoint: 'gemini-2.0-flash-exp',
  },
  'gemini-1.5-flash-latest': {
    maxTokens: 8192,
    contextWindow: 1_000_000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    apiEndpoint: 'gemini-1.5-flash-latest',
  },
  'gemini-1.5-pro-latest': {
    maxTokens: 8192,
    contextWindow: 2_000_000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    apiEndpoint: 'gemini-1.5-pro-latest',
  },
} as const;

/**
 * Gemini API request format
 */
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
      role?: 'user' | 'model';
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

/**
 * Gemini API response format
 */
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    index: number;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Stream response format
 */
interface GeminiStreamResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Rate limiting configuration per model
 */
const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: {
    'gemini-1.5-flash-latest': 60,
    'gemini-1.5-pro-latest': 15,
    'gemini-2.0-flash-exp': 60,
  },
  COOLDOWN_MS: 1000, // Base cooldown
  MAX_RETRIES: 3,
};

/**
 * Request tracker for rate limiting
 */
class RequestTracker {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => time > windowStart);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = oldestRequest + this.windowMs - now;

      if (waitTime > 0) {
        await this.sleep(waitTime + Math.random() * 1000); // Add jitter
      }
    }

    this.requests.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class GeminiProvider extends BaseLLMProvider {
  private readonly baseURL: string;
  private readonly requestTracker: RequestTracker;

  constructor(config: LLMConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Gemini provider requires API key');
    }

    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';

    // Initialize rate limiting for this model
    const rateLimit =
      RATE_LIMITS.REQUESTS_PER_MINUTE[
        config.model as keyof typeof RATE_LIMITS.REQUESTS_PER_MINUTE
      ] || 15;
    this.requestTracker = new RequestTracker(rateLimit, 60000); // 1 minute window

    this.validateConfig();
  }

  /**
   * Enhanced config validation for Gemini
   */
  validateConfig(): boolean {
    if (!this.config.apiKey) {
      throw new GeminiAPIError('API key is required for Gemini provider', 'INVALID_API_KEY');
    }

    if (!GEMINI_MODELS[this.config.model as keyof typeof GEMINI_MODELS]) {
      throw new GeminiAPIError(
        `Unsupported model: ${this.config.model}. Supported models: ${Object.keys(GEMINI_MODELS).join(', ')}`,
        'MODEL_NOT_FOUND'
      );
    }

    return true;
  }

  /**
   * Real Gemini API chat implementation
   */
  async chat(request: LLMRequest): Promise<LLMResponse> {
    await this.requestTracker.waitForSlot();

    const geminiRequest = this.formatRequest(request);
    const endpoint = `models/${GEMINI_MODELS[this.config.model as keyof typeof GEMINI_MODELS].apiEndpoint}:generateContent`;

    try {
      const response = await this.callAPI<GeminiResponse>(endpoint, geminiRequest);
      return this.formatResponse(response);
    } catch (error) {
      throw this.handleError(error, 'gemini');
    }
  }

  /**
   * Real Gemini streaming implementation
   */
  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    await this.requestTracker.waitForSlot();

    const geminiRequest = {
      ...this.formatRequest(request),
      generationConfig: {
        ...this.formatGenerationConfig(request),
        stream: true,
      },
    };

    const endpoint = `models/${GEMINI_MODELS[this.config.model as keyof typeof GEMINI_MODELS].apiEndpoint}:streamGenerateContent`;

    try {
      for await (const chunk of this.streamAPI<GeminiStreamResponse>(endpoint, geminiRequest)) {
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
          yield {
            content: chunk.candidates[0].content.parts[0].text,
            done: false,
          };
        }
      }

      yield { content: '', done: true };
    } catch (error) {
      throw this.handleError(error, 'gemini');
    }
  }

  /**
   * Format request for Gemini API
   */
  private formatRequest(request: LLMRequest): GeminiRequest {
    // Convert LLM messages to Gemini format
    const contents = request.messages.map((msg) => ({
      parts: [{ text: msg.content }],
      role: msg.role === 'assistant' ? 'model' : 'user',
    }));

    return {
      contents,
      generationConfig: this.formatGenerationConfig(request),
      safetySettings: this.getDefaultSafetySettings(),
    };
  }

  /**
   * Format generation config
   */
  private formatGenerationConfig(request: LLMRequest) {
    return {
      temperature: request.temperature,
      topP: request.topP,
      maxOutputTokens: Math.min(request.maxTokens || 1024, 8192),
    };
  }

  /**
   * Default safety settings for content filtering
   */
  private getDefaultSafetySettings() {
    return [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ];
  }

  /**
   * Format Gemini response to LLM response
   */
  private formatResponse(response: GeminiResponse): LLMResponse {
    const candidate = response.candidates[0];
    if (!candidate) {
      throw new GeminiAPIError('No response candidates returned', 'INVALID_REQUEST');
    }

    const content = candidate.content.parts[0]?.text || '';
    const finishReason = this.mapFinishReason(candidate.finishReason);

    return {
      content,
      provider: 'gemini',
      model: this.config.model,
      usage: this.formatUsage(response.usageMetadata),
      finishReason,
    };
  }

  /**
   * Map Gemini finish reasons to LLM standard
   */
  private mapFinishReason(reason: string): LLMResponse['finishReason'] {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      case 'SAFETY':
        return 'content_filter';
      case 'RECITATION':
        return 'content_filter';
      case 'OTHER':
        return 'error';
      default:
        return 'stop';
    }
  }

  /**
   * Format usage metadata
   */
  private formatUsage(metadata?: GeminiResponse['usageMetadata']) {
    if (!metadata) {
      return {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
    }

    return {
      promptTokens: metadata.promptTokenCount,
      completionTokens: metadata.candidatesTokenCount,
      totalTokens: metadata.totalTokenCount,
    };
  }

  /**
   * Make HTTP request to Gemini API with retry logic
   */
  private async callAPI<T>(endpoint: string, data: unknown): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= RATE_LIMITS.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.config.apiKey || '',
          },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: { message: response.statusText } }));
          throw new GeminiAPIError(
            errorData.error?.message || `HTTP ${response.status}`,
            this.mapHttpError(response.status),
            response.status,
            errorData
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error;

        if (error instanceof GeminiAPIError && !this.isRetryable(error.code)) {
          throw error;
        }

        if (attempt === RATE_LIMITS.MAX_RETRIES) {
          break;
        }

        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 1000));
      }
    }

    throw this.handleError(lastError, 'gemini');
  }

  /**
   * Streaming API call
   */
  private async *streamAPI<T>(endpoint: string, data: unknown): AsyncGenerator<T> {
    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.config.apiKey || '',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(60000), // 60 second timeout for streaming
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: response.statusText } }));
        throw new GeminiAPIError(
          errorData.error?.message || `HTTP ${response.status}`,
          this.mapHttpError(response.status),
          response.status,
          errorData
        );
      }

      if (!response.body) {
        throw new GeminiAPIError('No response body for streaming', 'INVALID_REQUEST');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
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
                yield data;
              } catch {
                // Skip invalid JSON lines
              }
            }
          }

          // Keep the incomplete last line for next iteration
          buffer = lines[lines.length - 1] || '';

          // Check for completion markers
          if (buffer === 'data: [DONE]') {
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw this.handleError(error, 'gemini');
    }
  }

  /**
   * Map HTTP status to Gemini error codes
   */
  private mapHttpError(status: number): keyof typeof GEMINI_ERROR_CODES {
    switch (status) {
      case 400:
        return 'INVALID_REQUEST';
      case 401:
        return 'INVALID_API_KEY';
      case 403:
        return 'PERMISSION_DENIED';
      case 429:
        return 'RATE_LIMITED';
      case 404:
        return 'MODEL_NOT_FOUND';
      default:
        return 'INVALID_REQUEST';
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(code: keyof typeof GEMINI_ERROR_CODES): boolean {
    return !['INVALID_API_KEY', 'PERMISSION_DENIED', 'MODEL_NOT_FOUND'].includes(code);
  }

  /**
   * Enhanced error handling for Gemini-specific errors
   */
  protected handleError(error: unknown, provider: string): never {
    if (error instanceof GeminiAPIError) {
      // Add helpful context for common errors
      let message = error.message;

      switch (error.code) {
        case 'INVALID_API_KEY':
          message += '. Get your API key from https://makersuite.google.com/app/apikey';
          break;
        case 'QUOTA_EXCEEDED':
          message += '. Check your Gemini API usage at https://aistudio.google.com/app/usage';
          break;
        case 'CONTENT_FILTERED':
          message += '. The content was blocked by safety settings. Try rephrasing your request.';
          break;
        case 'RATE_LIMITED':
          message += '. Rate limit exceeded. Please wait and try again.';
          break;
      }

      throw new GeminiAPIError(message, error.code, error.status, error.details);
    }

    return super.handleError(error, provider);
  }
}

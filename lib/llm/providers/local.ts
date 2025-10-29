/**
 * Local Model Provider - Ollama + Docker Models Integration
 * Story LLM-017: Local model provider (Ollama/Docker models) implementation
 *
 * Provides integration with local LLM models through:
 * - Ollama HTTP API (http://localhost:11434)
 * - Docker containers with HTTP endpoints (custom models)
 * - Automatic model discovery and health checking
 * - Support for streaming and blocking responses
 *
 * Features: Zero-configuration setup, model listing, health monitoring
 */

import { BaseLLMProvider } from './base';
import type { LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

/**
 * Local provider error codes
 */
export const LOCAL_ERROR_CODES = {
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  HEALTH_CHECK_FAILED: 'HEALTH_CHECK_FAILED',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const;

/**
 * Local provider error class
 */
export class LocalModelError extends Error {
  constructor(
    message: string,
    public readonly code: keyof typeof LOCAL_ERROR_CODES,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'LocalModelError';
  }
}

/**
 * Local model configuration
 */
export interface LocalModelConfig {
  name: string;
  endpoint: string;
  type: 'ollama' | 'docker';
  healthCheckUrl?: string;
  maxTokens?: number;
  supportsStreaming: boolean;
  description?: string;
  customHeaders?: Record<string, string>;
}

/**
 * Available local models (auto-discovered + pre-configured)
 */
export const LOCAL_MODELS: Record<string, LocalModelConfig> = {
  // Ollama default models
  'llama3.1': {
    name: 'llama3.1',
    endpoint: 'http://localhost:11434',
    type: 'ollama',
    healthCheckUrl: 'http://localhost:11434',
    maxTokens: 131072,
    supportsStreaming: true,
    description: 'Meta Llama 3.1 (Ollama)',
  },
  'llama3.1:8b': {
    name: 'llama3.1:8b',
    endpoint: 'http://localhost:11434',
    type: 'ollama',
    healthCheckUrl: 'http://localhost:11434',
    maxTokens: 131072,
    supportsStreaming: true,
    description: 'Meta Llama 3.1 8B (Ollama)',
  },
  'codellama:7b': {
    name: 'codellama:7b',
    endpoint: 'http://localhost:11434',
    type: 'ollama',
    healthCheckUrl: 'http://localhost:11434',
    maxTokens: 16384,
    supportsStreaming: true,
    description: 'Code Llama 7B (Ollama)',
  },
  'mistral:7b': {
    name: 'mistral:7b',
    endpoint: 'http://localhost:11434',
    type: 'ollama',
    healthCheckUrl: 'http://localhost:11434',
    maxTokens: 8192,
    supportsStreaming: true,
    description: 'Mistral 7B (Ollama)',
  },
  gemma3: {
    name: 'gemma3',
    endpoint: 'http://localhost:11434',
    type: 'ollama',
    healthCheckUrl: 'http://localhost:11434',
    maxTokens: 8192,
    supportsStreaming: true,
    description: 'Google Gemma 3 4B (Ollama)',
  },
  'gemma3:latest': {
    name: 'gemma3:latest',
    endpoint: 'http://localhost:11434',
    type: 'ollama',
    healthCheckUrl: 'http://localhost:11434',
    maxTokens: 8192,
    supportsStreaming: true,
    description: 'Google Gemma 3 4B (Ollama)',
  },
  // Docker-based models (examples - user can add more)
  'custom-docker-7b': {
    name: 'custom-docker-7b',
    endpoint: 'http://localhost:8080',
    type: 'docker',
    healthCheckUrl: 'http://localhost:8080/health',
    maxTokens: 4096,
    supportsStreaming: true,
    description: 'Custom Docker Model (localhost:8080)',
  },
};

/**
 * Model health checker
 */
class ModelHealthChecker {
  private healthCache = new Map<string, { healthy: boolean; lastCheck: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async checkHealth(model: LocalModelConfig): Promise<boolean> {
    const cacheKey = `${model.type}-${model.name}`;
    const cached = this.healthCache.get(cacheKey);

    if (cached && Date.now() - cached.lastCheck < this.CACHE_DURATION) {
      return cached.healthy;
    }

    try {
      const healthUrl = model.healthCheckUrl || `${model.endpoint}/api/tags`;
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...model.customHeaders,
        },
        signal: AbortSignal.timeout(5000),
      });

      const healthy = response.ok;
      this.healthCache.set(cacheKey, { healthy, lastCheck: Date.now() });
      return healthy;
    } catch {
      this.healthCache.set(cacheKey, { healthy: false, lastCheck: Date.now() });
      return false;
    }
  }

  clearCache(): void {
    this.healthCache.clear();
  }
}

export class LocalProvider extends BaseLLMProvider {
  private readonly modelConfig: LocalModelConfig;
  private readonly healthChecker = new ModelHealthChecker();

  constructor(config: LLMConfig) {
    super(config);

    // Find model configuration
    const modelConfig = LOCAL_MODELS[config.model];

    if (!modelConfig) {
      // Try to detect custom Docker model from config.baseURL or default
      const endpoint = config.baseURL || 'http://localhost:11434';
      this.modelConfig = {
        name: config.model,
        endpoint: config.baseURL || 'http://localhost:11434',
        type: endpoint.includes('11434') ? 'ollama' : 'docker',
        healthCheckUrl: endpoint,
        maxTokens: 4096,
        supportsStreaming: true,
        description: `Local model at ${endpoint}`,
      };
    } else {
      this.modelConfig = modelConfig;

      // Allow endpoint override via config.baseURL
      if (config.baseURL) {
        this.modelConfig.endpoint = config.baseURL;
        this.modelConfig.healthCheckUrl = config.baseURL;
      }
    }

    this.validateConfig();
  }

  /**
   * Enhanced config validation for local models
   */
  validateConfig(): boolean {
    if (!this.modelConfig.name) {
      throw new LocalModelError('Model name is required for local provider', 'MODEL_NOT_FOUND');
    }

    return true;
  }

  /**
   * Discover available models from Ollama
   */
  async discoverOllamaModels(): Promise<LocalModelConfig[]> {
    try {
      const response = await fetch(`${this.modelConfig.endpoint}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.modelConfig.customHeaders,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error('Failed to discover Ollama models');
      }

      const data = await response.json();
      const models: LocalModelConfig[] = [];

      if (data.models) {
        for (const model of data.models) {
          models.push({
            name: model.name,
            endpoint: this.modelConfig.endpoint,
            type: 'ollama',
            healthCheckUrl: this.modelConfig.endpoint,
            maxTokens: 4096, // Default, could be enhanced with model-specific data
            supportsStreaming: true,
            description: model.digest,
          });
        }
      }

      return models;
    } catch (error) {
      throw new LocalModelError(
        `Failed to discover Ollama models: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'HEALTH_CHECK_FAILED',
        error
      );
    }
  }

  /**
   * Get list of available local models
   */
  async getAvailableModels(): Promise<LocalModelConfig[]> {
    const models: LocalModelConfig[] = [];

    // Check pre-configured models
    for (const [_name, config] of Object.entries(LOCAL_MODELS)) {
      if (await this.healthChecker.checkHealth(config)) {
        models.push(config);
      }
    }

    // Discover Ollama models if endpoint is available
    try {
      const ollamaModels = await this.discoverOllamaModels();
      for (const ollamaModel of ollamaModels) {
        if (!models.find((m) => m.name === ollamaModel.name)) {
          models.push(ollamaModel);
        }
      }
    } catch {
      // Ollama discovery failed, continue with pre-configured models
    }

    return models;
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    // Check model health before making request
    if (!(await this.healthChecker.checkHealth(this.modelConfig))) {
      throw new LocalModelError(
        `Local model '${this.modelConfig.name}' is not available or not running`,
        'MODEL_UNAVAILABLE'
      );
    }

    const data = await this.formatRequest(request);

    try {
      const response = await this.callAPI('chat', data);
      return this.formatResponse(response);
    } catch (error) {
      throw this.handleError(error, 'chat');
    }
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    // Check model health before making request
    if (!(await this.healthChecker.checkHealth(this.modelConfig))) {
      throw new LocalModelError(
        `Local model '${this.modelConfig.name}' is not available or not running`,
        'MODEL_UNAVAILABLE'
      );
    }

    const data = {
      ...(await this.formatRequest(request)),
      stream: true,
    };

    try {
      yield* this.streamAPI('chat', data);
    } catch (error) {
      throw this.handleError(error, 'chatStream');
    }
  }

  /**
   * Format request for Ollama API
   */
  private async formatRequest(request: LLMRequest) {
    const ollamaRequest = {
      model: this.modelConfig.name,
      messages: request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      options: {
        temperature: request.temperature || 0.7,
        top_p: request.topP || 1,
        num_predict: Math.min(request.maxTokens || 2048, 8192),
      },
      stream: false,
    };

    return ollamaRequest;
  }

  /**
   * Format response from Ollama API
   */
  private formatResponse(response: any): LLMResponse {
    const message = response.message;

    return {
      content: message?.content || '',
      provider: 'local',
      model: response.model || this.modelConfig.name,
      usage: {
        promptTokens: message?.prompt_eval_count || 0,
        completionTokens: message?.eval_count || 0,
        totalTokens: (message?.prompt_eval_count || 0) + (message?.eval_count || 0),
      },
      finishReason: this.mapFinishReason(response.done),
    };
  }

  /**
   * Map Ollama finish reason to standard format
   */
  private mapFinishReason(
    done?: boolean
  ): 'stop' | 'length' | 'content_filter' | 'error' | undefined {
    if (done) return 'stop';
    return;
  }

  /**
   * Call local model API
   */
  private async callAPI(endpoint: string, data: unknown): Promise<any> {
    try {
      const response = await fetch(`${this.modelConfig.endpoint}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.modelConfig.customHeaders,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(120000), // 120 second timeout for local models (CPU can be slower)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Local API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new LocalModelError('Request timeout', 'TIMEOUT', error);
      }
      throw error;
    }
  }

  /**
   * Streaming API call with SSE parsing
   */
  private async *streamAPI(endpoint: string, data: unknown): AsyncGenerator<LLMStreamChunk> {
    try {
      const response = await fetch(`${this.modelConfig.endpoint}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.modelConfig.customHeaders,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(120000), // 2 minute timeout for streaming
      });

      if (!response.ok) {
        throw new Error(`Local API streaming error (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new LocalModelError('Response body is not readable', 'INVALID_RESPONSE');
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
          if (line) {
            try {
              // Handle both Ollama JSON format and potential custom formats
              if (line.startsWith('{')) {
                const data = JSON.parse(line);
                yield { content: data.content || '', done: data.done };
              } else {
                yield { content: line, done: false };
              }
            } catch {
              // Skip invalid JSON lines, yield as raw text
              if (line) {
                yield { content: line, done: false };
              }
            }
          }
        }

        // Keep the incomplete last line for next iteration
        buffer = lines[lines.length - 1] || '';
      }
    } catch (error) {
      throw this.handleError(error, 'streamAPI');
    }
  }

  /**
   * Handle errors with helpful context
   */
  protected handleError(error: unknown, _provider: string): never {
    if (error instanceof LocalModelError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    // Map common errors to local provider error codes
    if (message.includes('ECONNREFUSED') || message.includes('Connection refused')) {
      throw new LocalModelError(
        `Cannot connect to local model at ${this.modelConfig.endpoint}. Is Ollama or your Docker model running?`,
        'CONNECTION_REFUSED',
        error
      );
    }

    if (message.includes('ENOTFOUND') || message.includes('Cannot reach')) {
      throw new LocalModelError(
        `Local model endpoint not reachable at ${this.modelConfig.endpoint}`,
        'SERVICE_UNAVAILABLE',
        error
      );
    }

    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      throw new LocalModelError(
        'Local model request timeout. Try again or check model performance.',
        'TIMEOUT',
        error
      );
    }

    if (message.includes('model') && message.includes('not')) {
      throw new LocalModelError(
        `Model '${this.modelConfig.name}' not found. Available models can be listed with /api/tags`,
        'MODEL_NOT_FOUND',
        error
      );
    }

    throw new LocalModelError(`Local model error: ${message}`, 'INVALID_REQUEST', error);
  }

  /**
   * Get model configuration
   */
  getModelInfo(): LocalModelConfig {
    return { ...this.modelConfig };
  }

  /**
   * Clear health check cache (useful for testing)
   */
  clearHealthCache(): void {
    this.healthChecker.clearCache();
  }
}

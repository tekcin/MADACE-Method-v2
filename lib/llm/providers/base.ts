import type { LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk, ILLMProvider } from '../types';

export abstract class BaseLLMProvider implements ILLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract chat(request: LLMRequest): Promise<LLMResponse>;
  abstract chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk>;

  validateConfig(config: LLMConfig): boolean {
    if (!config.model) {
      return false;
    }

    // API key required for cloud providers
    if (config.provider !== 'local' && !config.apiKey) {
      return false;
    }

    return true;
  }

  protected handleError(error: unknown, provider: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`[${provider}] ${message}`);
  }
}

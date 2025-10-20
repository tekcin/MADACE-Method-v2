import type { LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk, ILLMProvider } from './types';
import { GeminiProvider } from './providers/gemini';
import { ClaudeProvider } from './providers/claude';
import { OpenAIProvider } from './providers/openai';
import { LocalProvider } from './providers/local';

export class LLMClient {
  private provider: ILLMProvider;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.provider = this.createProvider(config);
  }

  private createProvider(config: LLMConfig): ILLMProvider {
    switch (config.provider) {
      case 'gemini':
        return new GeminiProvider(config);
      case 'claude':
        return new ClaudeProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      case 'local':
        return new LocalProvider(config);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (!this.provider.validateConfig(this.config)) {
      throw new Error('Invalid LLM configuration');
    }

    return this.provider.chat(request);
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    if (!this.provider.validateConfig(this.config)) {
      throw new Error('Invalid LLM configuration');
    }

    yield* this.provider.chatStream(request);
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...updates };
    this.provider = this.createProvider(this.config);
  }
}

// Factory function for easy creation
export function createLLMClient(config: LLMConfig): LLMClient {
  return new LLMClient(config);
}

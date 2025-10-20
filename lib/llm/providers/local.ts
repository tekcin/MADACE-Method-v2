import { BaseLLMProvider } from './base';
import type { LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

export class LocalProvider extends BaseLLMProvider {
  async chat(request: LLMRequest): Promise<LLMResponse> {
    // TODO [LLM-017]: Implement actual Ollama/Local API call
    return {
      content: '[MOCK] Local response: ' + request.messages.map((m) => m.content).join(' '),
      provider: 'local',
      model: this.config.model,
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
      finishReason: 'stop',
    };
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    // TODO [LLM-017]: Implement actual streaming
    const response = await this.chat(request);
    yield { content: response.content, done: false };
    yield { content: '', done: true };
  }
}

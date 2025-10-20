import { BaseLLMProvider } from './base';
import type { LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

export class ClaudeProvider extends BaseLLMProvider {
  async chat(request: LLMRequest): Promise<LLMResponse> {
    // TODO [LLM-015]: Implement actual Claude API call
    return {
      content: '[MOCK] Claude response: ' + request.messages.map((m) => m.content).join(' '),
      provider: 'claude',
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
    // TODO [LLM-015]: Implement actual streaming
    const response = await this.chat(request);
    yield { content: response.content, done: false };
    yield { content: '', done: true };
  }
}

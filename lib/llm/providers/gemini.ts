import { BaseLLMProvider } from './base';
import type { LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

export class GeminiProvider extends BaseLLMProvider {
  async chat(request: LLMRequest): Promise<LLMResponse> {
    // TODO [LLM-014]: Implement actual Gemini API call
    return {
      content: '[MOCK] Gemini response: ' + request.messages.map((m) => m.content).join(' '),
      provider: 'gemini',
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
    // TODO [LLM-014]: Implement actual streaming
    const response = await this.chat(request);
    yield { content: response.content, done: false };
    yield { content: '', done: true };
  }
}

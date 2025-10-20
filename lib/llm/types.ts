export type LLMProvider = 'gemini' | 'claude' | 'openai' | 'local';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model: string;
  baseURL?: string; // For local/custom endpoints
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

export interface LLMError {
  provider: LLMProvider;
  code: string;
  message: string;
  retryable: boolean;
}

export interface ILLMProvider {
  chat(request: LLMRequest): Promise<LLMResponse>;
  chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk>;
  validateConfig(config: LLMConfig): boolean;
}

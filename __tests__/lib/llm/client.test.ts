import { createLLMClient } from '@/lib/llm/client';
import type { LLMConfig, LLMRequest, LLMResponse } from '@/lib/llm/types';

// Mock the providers
jest.mock('@/lib/llm/providers/gemini');
jest.mock('@/lib/llm/providers/claude');
jest.mock('@/lib/llm/providers/openai');
jest.mock('@/lib/llm/providers/local');

describe('LLMClient', () => {
  describe('createLLMClient', () => {
    it('should create Gemini provider', () => {
      const config: LLMConfig = {
        provider: 'gemini',
        apiKey: 'test-key',
        model: 'gemini-2.0-flash-exp',
      };

      const client = createLLMClient(config);
      const clientConfig = client.getConfig();

      expect(clientConfig.provider).toBe('gemini');
      expect(clientConfig.apiKey).toBe('test-key');
      expect(clientConfig.model).toBe('gemini-2.0-flash-exp');
    });

    it('should create Claude provider', () => {
      const config: LLMConfig = {
        provider: 'claude',
        apiKey: 'test-key',
        model: 'claude-3-5-sonnet-20241022',
      };

      const client = createLLMClient(config);
      expect(client.getConfig().provider).toBe('claude');
    });

    it('should create OpenAI provider', () => {
      const config: LLMConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4-turbo-preview',
      };

      const client = createLLMClient(config);
      expect(client.getConfig().provider).toBe('openai');
    });

    it('should create Local provider', () => {
      const config: LLMConfig = {
        provider: 'local',
        baseURL: 'http://localhost:11434',
        model: 'llama2',
      };

      const client = createLLMClient(config);
      expect(client.getConfig().provider).toBe('local');
    });

    it('should throw for unknown provider', () => {
      const config = {
        provider: 'unknown' as any,
        apiKey: 'test-key',
        model: 'test-model',
      };

      expect(() => createLLMClient(config)).toThrow('Unknown provider: unknown');
    });
  });

  describe('Configuration Updates', () => {
    let client: ReturnType<typeof createLLMClient>;

    beforeEach(() => {
      client = createLLMClient({
        provider: 'gemini',
        apiKey: 'old-key',
        model: 'old-model',
      });
    });

    it('should update client configuration', () => {
      client.updateConfig({
        apiKey: 'new-key',
        model: 'new-model',
      });

      const config = client.getConfig();
      expect(config.provider).toBe('gemini'); // Provider unchanged
      expect(config.apiKey).toBe('new-key');
      expect(config.model).toBe('new-model');
    });

    it('should preserve provider when updating other fields', () => {
      client.updateConfig({
        apiKey: 'updated-key',
        baseURL: 'http://new-base-url',
      });

      const config = client.getConfig();
      expect(config.provider).toBe('gemini');
      expect(config.apiKey).toBe('updated-key');
      expect(config.baseURL).toBe('http://new-base-url');
      expect(config.model).toBe('old-model'); // Unchanged
    });

    it('should handle empty updates', () => {
      const originalConfig = client.getConfig();

      client.updateConfig({});

      const updatedConfig = client.getConfig();
      expect(updatedConfig).toEqual(originalConfig);
    });
  });

  describe('Chat Methods', () => {
    let client: ReturnType<typeof createLLMClient>;
    let mockProvider: any;

    beforeEach(() => {
      // Mock provider methods
      mockProvider = {
        validateConfig: jest.fn().mockReturnValue(true),
        chat: jest.fn(),
        chatStream: jest.fn().mockImplementation(async function* () {
          yield { content: 'chunk1' };
          yield { content: 'chunk2' };
        }),
      };

      client = createLLMClient({
        provider: 'gemini',
        apiKey: 'test-key',
        model: 'test-model',
      });

      // Replace the internal provider with our mock
      client['provider'] = mockProvider;
    });

    describe('chat', () => {
      it('should call provider chat method', async () => {
        const request: LLMRequest = {
          messages: [{ role: 'user', content: 'Hello' }],
          maxTokens: 100,
        };

        const expectedResponse: LLMResponse = {
          content: 'Hello back!',
          provider: 'gemini',
          model: 'test-model',
          usage: {
            promptTokens: 10,
            completionTokens: 5,
            totalTokens: 15,
          },
        };

        mockProvider.chat.mockResolvedValue(expectedResponse);

        const response = await client.chat(request);

        expect(mockProvider.validateConfig).toHaveBeenCalled();
        expect(mockProvider.chat).toHaveBeenCalledWith(request);
        expect(response).toEqual(expectedResponse);
      });

      it('should throw error if config validation fails', async () => {
        mockProvider.validateConfig.mockReturnValue(false);

        const request: LLMRequest = {
          messages: [{ role: 'user', content: 'Hello' }],
        };

        await expect(client.chat(request)).rejects.toThrow('Invalid LLM configuration');

        expect(mockProvider.chat).not.toHaveBeenCalled();
      });
    });

    describe('chatStream', () => {
      it('should yield chunks from provider', async () => {
        const request: LLMRequest = {
          messages: [{ role: 'user', content: 'Hello' }],
        };

        const chunks = [];
        for await (const chunk of client.chatStream(request)) {
          chunks.push(chunk);
        }

        expect(mockProvider.validateConfig).toHaveBeenCalled();
        expect(mockProvider.chatStream).toHaveBeenCalledWith(request);
        expect(chunks).toEqual([{ content: 'chunk1' }, { content: 'chunk2' }]);
      });

      it('should throw error if config validation fails', async () => {
        mockProvider.validateConfig.mockReturnValue(false);

        const request: LLMRequest = {
          messages: [{ role: 'user', content: 'Hello' }],
        };

        const generator = client.chatStream(request);

        await expect(generator.next()).rejects.toThrow('Invalid LLM configuration');
        expect(mockProvider.chatStream).not.toHaveBeenCalled();
      });
    });

    describe('getConfig', () => {
      it('should return a copy of configuration', () => {
        const config1 = client.getConfig();
        const config2 = client.getConfig();

        expect(config1).toEqual(config2);
        expect(config1).not.toBe(config2); // Different object reference
      });
    });
  });
});

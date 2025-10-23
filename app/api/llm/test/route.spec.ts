import { POST } from './route';
import { NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm';

// Mock the dependencies
jest.mock('@/lib/llm', () => ({
  createLLMClient: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('POST /api/llm/test', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      json: jest.fn(),
    };
  });

  it('should return a successful response when given valid provider configuration', async () => {
    const mockRequestBody = {
      provider: 'gemini',
      apiKey: 'test-api-key',
      model: 'gemini-2.0-flash-exp',
      testPrompt: 'Hello, world!',
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    const mockResponse = {
      content: 'Hi there!',
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      usage: {
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15,
      },
    };
    const mockChat = jest.fn().mockResolvedValue(mockResponse);
    (createLLMClient as jest.Mock).mockReturnValue({ chat: mockChat });

    await POST(mockRequest as Request);

    expect(createLLMClient).toHaveBeenCalledWith({
      provider: 'gemini',
      apiKey: 'test-api-key',
      model: 'gemini-2.0-flash-exp',
      baseURL: undefined,
    });
    expect(mockChat).toHaveBeenCalledWith({
      messages: [{ role: 'user', content: 'Hello, world!' }],
      maxTokens: 150,
    });
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Connection successful!',
      response: mockResponse,
    });
  });

  it('should return a 400 error if provider is missing', async () => {
    (mockRequest.json as jest.Mock).mockResolvedValue({});

    await POST(mockRequest as Request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: expect.stringContaining('Validation error') },
      { status: 400 }
    );
  });

  it('should return a 400 error if API key is missing for non-local providers', async () => {
    const mockRequestBody = {
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      testPrompt: 'Hello, world!',
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    await POST(mockRequest as Request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'API key is required for gemini provider' },
      { status: 400 }
    );
  });

  it('should allow local provider without API key', async () => {
    const mockRequestBody = {
      provider: 'local',
      model: 'llama2',
      testPrompt: 'Hello, world!',
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    const mockResponse = {
      content: 'Hi there!',
      provider: 'local',
      model: 'llama2',
      usage: {
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15,
      },
    };
    const mockChat = jest.fn().mockResolvedValue(mockResponse);
    (createLLMClient as jest.Mock).mockReturnValue({ chat: mockChat });

    await POST(mockRequest as Request);

    expect(createLLMClient).toHaveBeenCalledWith({
      provider: 'local',
      apiKey: undefined,
      model: 'llama2',
      baseURL: undefined,
    });
  });

  it('should return a 500 error if the LLM client throws an error', async () => {
    const mockRequestBody = {
      provider: 'gemini',
      apiKey: 'test-api-key',
      model: 'gemini-2.0-flash-exp',
      testPrompt: 'Hello, world!',
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    const errorMessage = 'LLM client error';
    const mockChat = jest.fn().mockRejectedValue(new Error(errorMessage));
    (createLLMClient as jest.Mock).mockReturnValue({ chat: mockChat });

    await POST(mockRequest as Request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  });
});

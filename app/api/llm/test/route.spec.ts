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

  it('should return a successful response when given a valid message', async () => {
    const mockMessage = 'Hello, world!';
    (mockRequest.json as jest.Mock).mockResolvedValue({ message: mockMessage });

    const mockChat = jest.fn().mockResolvedValue({ response: 'Hi there!' });
    (createLLMClient as jest.Mock).mockReturnValue({ chat: mockChat });

    await POST(mockRequest as Request);

    expect(createLLMClient).toHaveBeenCalled();
    expect(mockChat).toHaveBeenCalledWith({ messages: [{ role: 'user', content: mockMessage }] });
    expect(NextResponse.json).toHaveBeenCalledWith({ response: 'Hi there!' });
  });

  it('should return a 400 error if the message is missing', async () => {
    (mockRequest.json as jest.Mock).mockResolvedValue({});

    await POST(mockRequest as Request);

    expect(NextResponse.json).toHaveBeenCalledWith({ error: expect.any(String) }, { status: 400 });
  });

  it('should return a 400 error if the message is empty', async () => {
    (mockRequest.json as jest.Mock).mockResolvedValue({ message: '' });

    await POST(mockRequest as Request);

    expect(NextResponse.json).toHaveBeenCalledWith({ error: expect.any(String) }, { status: 400 });
  });

  it('should return a 500 error if the LLM client throws an error', async () => {
    const mockMessage = 'Hello, world!';
    (mockRequest.json as jest.Mock).mockResolvedValue({ message: mockMessage });

    const errorMessage = 'LLM client error';
    const mockChat = jest.fn().mockRejectedValue(new Error(errorMessage));
    (createLLMClient as jest.Mock).mockReturnValue({ chat: mockChat });

    await POST(mockRequest as Request);

    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});

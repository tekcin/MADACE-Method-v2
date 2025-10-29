import { NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm';
import type { LLMProvider } from '@/lib/llm/types';
import { z } from 'zod';

/**
 * POST /api/llm/test
 * Test LLM connection with provider-specific configuration
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation schema for test request
    const schema = z.object({
      provider: z.enum(['gemini', 'claude', 'openai', 'local']),
      apiKey: z.string().optional(),
      baseURL: z.string().optional(),
      model: z.string().min(1),
      testPrompt: z.string().min(1),
    });

    const { provider, apiKey, baseURL, model, testPrompt } = schema.parse(body);

    // Validate required fields based on provider
    if (provider !== 'local' && !apiKey) {
      return NextResponse.json(
        { error: `API key is required for ${provider} provider` },
        { status: 400 }
      );
    }

    // For local provider, use environment variable if available (Docker network support)
    // This allows server-side requests to use "http://ollama:11434" while browser uses "http://localhost:11434"
    const effectiveBaseURL =
      provider === 'local'
        ? process.env.LOCAL_MODEL_URL || baseURL || 'http://localhost:11434'
        : baseURL;

    // Create LLM client with provided configuration
    const client = createLLMClient({
      provider: provider as LLMProvider,
      apiKey,
      baseURL: effectiveBaseURL,
      model,
    });

    // Test the connection with a simple chat request
    const response = await client.chat({
      messages: [{ role: 'user', content: testPrompt }],
      maxTokens: 150, // Keep response short for testing
    });

    return NextResponse.json({
      success: true,
      message: 'Connection successful!',
      response: {
        content: response.content,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: `Validation error: ${error.issues.map((e: { message: string }) => e.message).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Handle LLM provider errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

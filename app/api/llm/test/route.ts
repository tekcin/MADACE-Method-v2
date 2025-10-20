import { NextResponse } from 'next/server';
import { createLLMClient, getLLMConfigFromEnv } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const config = getLLMConfigFromEnv();
    const client = createLLMClient(config);

    const response = await client.chat({
      messages: [{ role: 'user', content: message }],
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

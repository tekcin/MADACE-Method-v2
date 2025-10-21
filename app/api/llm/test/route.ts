import { NextResponse } from 'next/server';
import { createLLMClient, getLLMConfigFromEnv } from '@/lib/llm';

import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const schema = z.object({
      message: z.string().min(1),
    });

    const { message } = schema.parse(body);

    const config = getLLMConfigFromEnv();
    const client = createLLMClient(config);

    const response = await client.chat({
      messages: [{ role: 'user', content: message }],
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Chat Streaming API
 *
 * POST /api/v3/chat/stream - Stream agent response (Server-Sent Events)
 */

import { NextRequest } from 'next/server';
import { createMessage, getMessage, getSession } from '@/lib/services/chat-service';
import { createLLMClient } from '@/lib/llm/client';
import { getLLMConfigFromEnv } from '@/lib/llm/config';
import { getAgentByName } from '@/lib/services/agent-service';

/**
 * POST /api/v3/chat/stream
 * Stream agent response using Server-Sent Events
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { sessionId, agentId, replyToId } = body;

    if (!sessionId || !agentId) {
      return new Response('sessionId and agentId are required', { status: 400 });
    }

    // Get session and context
    const session = await getSession(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    // Get agent details
    const agent = await getAgentByName(session.agent?.name || '');
    if (!agent) {
      return new Response('Agent not found', { status: 404 });
    }

    // Get previous message for context
    const previousMessage = replyToId ? await getMessage(replyToId) : null;

    // Build conversation history (last 10 messages for context)
    const recentMessages = session.messages.slice(-10);
    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role === 'agent' ? ('assistant' as const) : (msg.role as 'user' | 'system'),
      content: msg.content,
    }));

    // Create LLM client
    const llmConfig = getLLMConfigFromEnv();
    const llmClient = createLLMClient(llmConfig);

    // Build system prompt from agent persona
    const persona = agent.persona as { role?: string; identity?: string };
    const systemPrompt = `You are ${agent.title}. ${persona.role || ''} ${persona.identity || ''}`;

    // Prepare messages for LLM
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...conversationHistory,
    ];

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          // Stream from LLM
          for await (const chunk of llmClient.chatStream({ messages })) {
            fullResponse += chunk.content;

            // Send chunk as SSE
            const data = `data: ${JSON.stringify({ content: chunk.content })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Save complete response to database
          await createMessage({
            sessionId,
            role: 'agent',
            content: fullResponse,
            replyToId: replyToId || undefined,
          });

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[Chat Stream] Error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Chat Stream] Failed to stream:', error);
    return new Response(error instanceof Error ? error.message : 'Streaming failed', {
      status: 500,
    });
  }
}

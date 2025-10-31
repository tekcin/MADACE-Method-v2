/**
 * Chat Streaming API
 *
 * POST /api/v3/chat/stream - Stream agent response (Server-Sent Events)
 */

import { NextRequest } from 'next/server';
import { createMessage, getSession } from '@/lib/services/chat-service';
import { createLLMClient } from '@/lib/llm/client';
import { getLLMConfigFromEnv } from '@/lib/llm/config';
import { getAgentByName } from '@/lib/services/agent-service';
import {
  buildPromptMessages,
  formatConversationHistory,
  limitPromptContext,
} from '@/lib/llm/prompt-builder';
import { extractAndSaveMemories } from '@/lib/nlu/memory-extractor';

/**
 * POST /api/v3/chat/stream
 * Stream agent response using Server-Sent Events
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { sessionId, agentId, replyToId, provider } = body;

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

    // Build conversation history (last 10 messages for context, excluding the current user message)
    const recentMessages = session.messages.slice(-11, -1); // Exclude last message (current user input)
    const conversationHistory = formatConversationHistory(recentMessages);

    // Get the current user message (last message in session)
    const currentMessage = session.messages[session.messages.length - 1]?.content || '';

    // Extract and save memories from user message (async, non-blocking)
    const conversationHistoryContent = recentMessages
      .filter((m) => m.role === 'user')
      .map((m) => m.content);
    extractAndSaveMemories(
      agent.id,
      session.userId,
      currentMessage,
      conversationHistoryContent
    ).catch((error) => {
      console.error('[Chat Stream] Error extracting memories:', error);
      // Don't block on memory extraction errors
    });

    // Create LLM client (use provider from request if specified)
    let llmConfig = getLLMConfigFromEnv();
    if (provider) {
      // Override provider if specified in request
      const providerConfigs: Record<string, Partial<typeof llmConfig>> = {
        gemini: {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        },
        claude: {
          apiKey: process.env.CLAUDE_API_KEY,
          model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        },
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        },
        local: {
          baseURL: process.env.LOCAL_MODEL_URL || 'http://localhost:11434',
          model: process.env.LOCAL_MODEL_NAME || 'gemma3:latest',
        },
      };

      llmConfig = {
        provider: provider as 'local' | 'gemini' | 'claude' | 'openai',
        ...providerConfigs[provider],
      } as typeof llmConfig;
    }
    const llmClient = createLLMClient(llmConfig);

    // Build memory-aware prompt with agent persona and user's memory context
    const messages = await buildPromptMessages(
      agent,
      session.userId,
      conversationHistory,
      currentMessage,
      true // includeMemory = true
    );

    // Limit context to avoid exceeding token limits
    const limitedMessages = limitPromptContext(messages, 4000);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          // Stream from LLM with memory-aware context
          for await (const chunk of llmClient.chatStream({ messages: limitedMessages })) {
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

/**
 * Chat Messages API
 *
 * GET /api/v3/chat/sessions/[id]/messages - List messages in session
 * POST /api/v3/chat/sessions/[id]/messages - Send message
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMessage, listMessages, type CreateMessageInput } from '@/lib/services/chat-service';
import { z } from 'zod';

/**
 * GET /api/v3/chat/sessions/[id]/messages
 * List messages in session
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const before = searchParams.get('before');

    const messages = await listMessages(sessionId, {
      limit,
      offset,
      before: before ? new Date(before) : undefined,
    });

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('[Chat API] Failed to list messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list messages',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v3/chat/sessions/[id]/messages
 * Send message
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();

    const input: CreateMessageInput = {
      sessionId,
      role: body.role,
      content: body.content,
      replyToId: body.replyToId,
    };

    const message = await createMessage(input);

    return NextResponse.json(
      {
        success: true,
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('[Chat API] Failed to send message:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      },
      { status: 500 }
    );
  }
}

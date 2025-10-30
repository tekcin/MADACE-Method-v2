/**
 * Chat Sessions API
 *
 * POST /api/v3/chat/sessions - Create new chat session
 * GET /api/v3/chat/sessions - List user's chat sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createSession,
  listSessionsByUser,
  type CreateSessionInput,
} from '@/lib/services/chat-service';
import { z } from 'zod';

/**
 * POST /api/v3/chat/sessions
 * Create new chat session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const input: CreateSessionInput = {
      userId: body.userId,
      agentId: body.agentId,
      projectId: body.projectId,
    };

    const session = await createSession(input);

    return NextResponse.json(
      {
        success: true,
        session,
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

    console.error('[Chat API] Failed to create session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v3/chat/sessions
 * List user's chat sessions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    const sessions = await listSessionsByUser(userId, {
      agentId: agentId || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('[Chat API] Failed to list sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list sessions',
      },
      { status: 500 }
    );
  }
}

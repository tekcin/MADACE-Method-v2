import { NextRequest, NextResponse } from 'next/server';
import { searchMessages } from '@/lib/services/chat-service';

/**
 * POST /api/v3/chat/search
 *
 * Search chat messages by content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, agentId, limit } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    const messages = await searchMessages(query, {
      userId,
      agentId,
      limit: limit || 50,
    });

    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('[API] Search messages error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search messages',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v3/chat/search?q=query&userId=xxx&agentId=xxx&limit=50
 *
 * Search chat messages via query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId') || undefined;
    const agentId = searchParams.get('agentId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    const messages = await searchMessages(query, {
      userId,
      agentId,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('[API] Search messages error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search messages',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getMessageThread } from '@/lib/services/chat-service';

/**
 * GET /api/v3/chat/messages/[id]/thread
 *
 * Get full thread for a message (root + all replies)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const thread = await getMessageThread(id);

    if (thread.length === 0) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: thread,
      count: thread.length,
    });
  } catch (error) {
    console.error('[API] Get message thread error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get message thread',
      },
      { status: 500 }
    );
  }
}

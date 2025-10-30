import { NextRequest, NextResponse } from 'next/server';
import { exportSessionAsMarkdown } from '@/lib/services/chat-service';

/**
 * GET /api/v3/chat/export/[sessionId]
 *
 * Export chat session as Markdown
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const markdown = await exportSessionAsMarkdown(sessionId);

    // Return as downloadable file
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="chat-${sessionId}.md"`,
      },
    });
  } catch (error) {
    console.error('[API] Export session error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export session',
      },
      { status: 500 }
    );
  }
}

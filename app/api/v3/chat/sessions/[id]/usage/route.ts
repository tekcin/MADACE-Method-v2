/**
 * Chat Session Usage Statistics API
 *
 * GET /api/v3/chat/sessions/[id]/usage
 * Returns token usage and cost statistics for a chat session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUsageStats, getSessionProviderStats } from '@/lib/services/llm-usage-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    // Get usage stats
    const [totalStats, providerStats] = await Promise.all([
      getSessionUsageStats(sessionId),
      getSessionProviderStats(sessionId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total: totalStats,
        byProvider: providerStats,
      },
    });
  } catch (error) {
    console.error('[Usage API] Error fetching usage stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}

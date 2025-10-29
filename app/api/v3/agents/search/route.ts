/**
 * Agent Search API Route
 *
 * Endpoint:
 * - GET /api/v3/agents/search - Search agents by name/title
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAgents, DatabaseError } from '@/lib/services';

/**
 * GET /api/v3/agents/search
 *
 * Search agents by name or title
 *
 * Query parameters:
 * - q or query: string (required) - Search query
 * - module?: string - Filter by module (mam, mab, cis, core)
 * - projectId?: string - Filter by project ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required (use ?q=... or ?query=...)',
        },
        { status: 400 }
      );
    }

    const moduleFilter = searchParams.get('module') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    const agents = await searchAgents({
      query,
      module: moduleFilter as 'mam' | 'mab' | 'cis' | 'core' | undefined,
      projectId,
    });

    return NextResponse.json({
      success: true,
      data: agents,
      count: agents.length,
      query,
    });
  } catch (error) {
    console.error('Error searching agents:', error);

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          operation: error.operation,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search agents',
      },
      { status: 500 }
    );
  }
}

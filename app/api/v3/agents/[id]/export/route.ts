/**
 * Agent Export API Route
 *
 * Endpoint:
 * - POST /api/v3/agents/:id/export - Export agent as JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportAgent, DatabaseError } from '@/lib/services';

/**
 * POST /api/v3/agents/:id/export
 *
 * Export an agent as JSON for backup or sharing
 *
 * Returns agent data in JSON format without database-specific fields (id, timestamps)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const agentData = await exportAgent(id);

    // Return as JSON with appropriate headers for download
    return new NextResponse(JSON.stringify(agentData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${agentData.name}.agent.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting agent:', error);

    if (error instanceof DatabaseError) {
      // Check if it's a "not found" error
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Agent not found',
          },
          { status: 404 }
        );
      }

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
        error: 'Failed to export agent',
      },
      { status: 500 }
    );
  }
}

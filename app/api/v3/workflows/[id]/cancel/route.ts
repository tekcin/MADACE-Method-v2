/**
 * Workflow Cancel API Endpoint
 *
 * POST /api/v3/workflows/[id]/cancel - Cancel workflow execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const stateFile = path.join(process.cwd(), '.madace', 'workflow-states', `.${id}.state.json`);

    // Check if workflow state exists
    try {
      await fs.access(stateFile);

      // Delete the state file to cancel
      await fs.unlink(stateFile);

      return NextResponse.json({
        success: true,
        message: 'Workflow cancelled successfully',
        workflowId: id,
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
          message: `No active workflow found with id: ${id}`,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error cancelling workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

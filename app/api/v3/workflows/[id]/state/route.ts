import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/v3/workflows/[id]/state
 * Get current workflow execution state
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
    const stateFile = path.join(stateDir, `.${id}.state.json`);

    const state = await fs
      .readFile(stateFile, 'utf-8')
      .then(JSON.parse)
      .catch(() => null);

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow state not found',
          message: 'Workflow has not been started yet',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      state,
    });
  } catch (error) {
    console.error('Get state error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

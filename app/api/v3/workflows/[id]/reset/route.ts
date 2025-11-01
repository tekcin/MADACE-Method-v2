import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * POST /api/v3/workflows/[id]/reset
 * Reset workflow state to beginning
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete state file
    const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
    const stateFile = path.join(stateDir, `.${id}.state.json`);

    await fs.unlink(stateFile).catch(() => {
      // File doesn't exist, that's fine
    });

    // Delete input file
    const inputDir = path.join(process.cwd(), '.madace', 'workflow-inputs');
    const inputFile = path.join(inputDir, `${id}.json`);

    await fs.unlink(inputFile).catch(() => {
      // File doesn't exist, that's fine
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow reset successfully',
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

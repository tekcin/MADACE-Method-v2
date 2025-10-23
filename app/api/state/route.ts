import { NextResponse } from 'next/server';
import { createStateMachine } from '@/lib/state/machine';
import { existsSync } from 'fs';
import path from 'path';

/**
 * GET /api/state
 * Get current workflow status from state machine
 */
export async function GET() {
  try {
    const statusFilePath = path.join(process.cwd(), 'docs', 'mam-workflow-status.md');

    // Check if the file exists
    if (!existsSync(statusFilePath)) {
      return NextResponse.json({
        success: true,
        status: {
          backlog: [],
          todo: [],
          inProgress: [],
          done: [],
        },
        message: 'No workflow status file found - returning empty state',
      });
    }

    const stateMachine = createStateMachine(statusFilePath);
    await stateMachine.load();
    const status = stateMachine.getStatus();

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load workflow status';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

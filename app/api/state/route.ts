import { NextResponse } from 'next/server';
import { createStateMachine } from '@/lib/state/machine';
import path from 'path';

/**
 * GET /api/state
 * Get current workflow status from state machine
 */
export async function GET() {
  try {
    const statusFilePath = path.join(process.cwd(), 'docs', 'mam-workflow-status.md');
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

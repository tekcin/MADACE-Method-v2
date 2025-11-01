/**
 * Workflow Pause API Endpoint
 *
 * POST /api/v3/workflows/[id]/pause - Pause workflow execution
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
      const content = await fs.readFile(stateFile, 'utf-8');
      const state = JSON.parse(content);

      // Update state to paused
      state.paused = true;
      state.pausedAt = new Date().toISOString();

      // Save updated state
      await fs.writeFile(stateFile, JSON.stringify(state, null, 2), 'utf-8');

      return NextResponse.json({
        success: true,
        message: 'Workflow paused successfully',
        state: {
          workflowId: id,
          currentStep: state.currentStep,
          paused: true,
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found or not running',
          message: `No active workflow found with id: ${id}`,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error pausing workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to pause workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

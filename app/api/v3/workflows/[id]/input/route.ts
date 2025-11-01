import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const InputSchema = z.object({
  stepIndex: z.number(),
  value: z.unknown(),
});

/**
 * POST /api/v3/workflows/[id]/input
 * Submit user input for elicit workflow steps
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stepIndex, value } = InputSchema.parse(body);

    // Store input in workflow state directory
    const inputDir = path.join(process.cwd(), '.madace', 'workflow-inputs');
    await fs.mkdir(inputDir, { recursive: true });

    const inputFile = path.join(inputDir, `${id}.json`);

    // Load existing inputs
    const inputs = await fs
      .readFile(inputFile, 'utf-8')
      .then(JSON.parse)
      .catch(() => ({}));

    // Store new input
    inputs[stepIndex] = value;

    await fs.writeFile(inputFile, JSON.stringify(inputs, null, 2));

    // Update workflow state to clear waiting flag
    const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
    const stateFile = path.join(stateDir, `.${id}.state.json`);

    try {
      const state = await fs.readFile(stateFile, 'utf-8').then(JSON.parse);

      // Store input in workflow variables
      if (state.variables._WAITING_FOR_INPUT) {
        const { variable } = state.variables._WAITING_FOR_INPUT;
        if (variable) {
          state.variables[variable] = value;
        }
        // Clear waiting flag
        delete state.variables._WAITING_FOR_INPUT;
      }

      // Save updated state
      await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.warn('Failed to update workflow state:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Input received',
    });
  } catch (error) {
    console.error('Input submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Workflow State API Routes
 * GET /api/workflows/[name]/state - Get current workflow execution state
 * DELETE /api/workflows/[name]/state - Reset workflow state
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { loadWorkflow } from '@/lib/workflows/loader';
import { createWorkflowExecutor } from '@/lib/workflows/executor';

// Helper to find workflow file by name
async function findWorkflowFile(name: string): Promise<string | null> {
  const workflowPaths = [
    path.join(process.cwd(), 'madace/mam/workflows'),
    path.join(process.cwd(), 'madace/workflows'),
    path.join(process.cwd(), 'workflows'),
  ];

  const possibleNames = [
    `${name}.workflow.yaml`,
    `${name}.yaml`,
    name.endsWith('.yaml') ? name : null,
  ].filter(Boolean) as string[];

  for (const workflowPath of workflowPaths) {
    for (const fileName of possibleNames) {
      try {
        const filePath = path.join(workflowPath, fileName);
        await fs.access(filePath);
        return filePath;
      } catch {
        continue;
      }
    }
  }

  return null;
}

// GET /api/workflows/[name]/state - Get current state
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if state file exists
    const statePath = path.join(process.cwd(), 'madace-data', 'workflow-states');
    const stateFile = path.join(statePath, `.${name}.state.json`);

    try {
      const content = await fs.readFile(stateFile, 'utf-8');
      const state = JSON.parse(content);

      // Convert date strings to Date objects for response
      state.startedAt = new Date(state.startedAt);
      state.updatedAt = new Date(state.updatedAt);

      return NextResponse.json({
        success: true,
        state,
        exists: true,
      });
    } catch {
      // State file doesn't exist
      return NextResponse.json({
        success: true,
        state: null,
        exists: false,
        message: 'No execution state found for this workflow',
      });
    }
  } catch (outerError) {
    console.error('Error reading workflow state:', outerError);
    return NextResponse.json(
      {
        error: 'Failed to read workflow state',
        message: outerError instanceof Error ? outerError.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/workflows/[name]/state - Reset workflow state
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Load workflow to create executor
    const workflowFile = await findWorkflowFile(id);

    if (!workflowFile) {
      return NextResponse.json(
        {
          error: 'Workflow not found',
          message: `No workflow found with name: ${name}`,
        },
        { status: 404 }
      );
    }

    const workflow = await loadWorkflow(workflowFile);
    const statePath = path.join(process.cwd(), 'madace-data', 'workflow-states');
    const executor = createWorkflowExecutor(workflow, statePath);

    // Reset the workflow state
    await executor.reset();

    return NextResponse.json({
      success: true,
      message: `Workflow state for '${name}' has been reset`,
    });
  } catch (error) {
    console.error('Error resetting workflow state:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset workflow state',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

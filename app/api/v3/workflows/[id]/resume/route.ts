import { NextRequest, NextResponse } from 'next/server';
import { loadWorkflow, createWorkflowExecutor } from '@/lib/workflows';
import path from 'path';
import fs from 'fs/promises';

/**
 * POST /api/v3/workflows/[id]/resume
 * Resume workflow execution after input submission or pause
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find and load workflow
    const workflowPath = await findWorkflowPath(id);
    if (!workflowPath) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflow = await loadWorkflow(workflowPath);

    // Create executor with state directory
    const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
    const executor = createWorkflowExecutor(workflow, stateDir);

    // Initialize (loads existing state)
    await executor.initialize();

    // Resume execution in background
    executeWorkflowAsync(id, executor);

    return NextResponse.json({
      success: true,
      message: 'Workflow resumed',
    });
  } catch (error) {
    console.error('Resume error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Find workflow file path by ID
 */
async function findWorkflowPath(id: string): Promise<string | null> {
  const possiblePaths = [
    path.join(process.cwd(), 'madace', 'mam', 'workflows', `${id}.workflow.yaml`),
    path.join(process.cwd(), 'madace', 'mab', 'workflows', `${id}.workflow.yaml`),
    path.join(process.cwd(), 'madace', 'core', 'workflows', `${id}.workflow.yaml`),
    path.join(process.cwd(), 'madace', 'mam', 'workflows', 'examples', `${id}.workflow.yaml`),
    path.join(process.cwd(), 'workflows', `${id}.yaml`),
  ];

  for (const workflowPath of possiblePaths) {
    try {
      await fs.access(workflowPath);
      return workflowPath;
    } catch {
      // File doesn't exist, try next
    }
  }

  return null;
}

/**
 * Execute workflow asynchronously
 */
async function executeWorkflowAsync(
  workflowId: string,
  executor: Awaited<ReturnType<typeof createWorkflowExecutor>>
) {
  try {
    // Continue execution from current step
    let result = await executor.executeNextStep();

    while (result.success && !result.state?.completed) {
      // Check if waiting for input
      if (result.error?.message === 'WAITING_FOR_INPUT') {
        break;
      }

      // Continue to next step
      result = await executor.executeNextStep();
    }

    if (!result.success && result.error?.message !== 'WAITING_FOR_INPUT') {
      console.error(`Workflow ${workflowId} error:`, result.error);
    }
  } catch (error) {
    console.error(`Workflow ${workflowId} execution error:`, error);
  }
}

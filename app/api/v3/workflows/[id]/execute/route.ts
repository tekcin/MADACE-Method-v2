import { NextRequest, NextResponse } from 'next/server';
import { loadWorkflow, createWorkflowExecutor } from '@/lib/workflows';
import path from 'path';
import fs from 'fs/promises';

/**
 * POST /api/v3/workflows/[id]/execute
 * Start or resume workflow execution
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Determine workflow path
    // For now, assume workflows are in madace/*/workflows/ directories
    // In production, this would come from database
    const workflowPath = await findWorkflowPath(id);

    if (!workflowPath) {
      return NextResponse.json(
        {
          success: false,
          error: `Workflow not found: ${id}`,
        },
        { status: 404 }
      );
    }

    // Load workflow
    const workflow = await loadWorkflow(workflowPath);

    // Create executor with state directory
    const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
    await fs.mkdir(stateDir, { recursive: true });

    const executor = createWorkflowExecutor(workflow, stateDir);

    // Initialize (will load existing state if present)
    await executor.initialize();

    // Start execution in background (non-blocking)
    // This will execute steps until it hits an elicit step or completes
    executeWorkflowAsync(id, executor);

    return NextResponse.json({
      success: true,
      message: 'Workflow execution started',
      workflowId: id,
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
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
 * Runs in background and updates state file
 */
async function executeWorkflowAsync(
  workflowId: string,
  executor: Awaited<ReturnType<typeof createWorkflowExecutor>>
) {
  try {
    // Execute steps until completion or waiting for input
    let result = await executor.executeNextStep();

    while (result.success && !result.state?.completed) {
      // Check if waiting for input
      if (result.error?.message === 'WAITING_FOR_INPUT') {
        // State is saved, workflow paused
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

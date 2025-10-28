/**
 * Workflow Hierarchy API
 * GET /api/workflows/[name]/hierarchy - Get workflow hierarchy tree
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { loadWorkflow, createWorkflowExecutor } from '@/lib/workflows/executor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Load workflow
    const workflowPath = path.join(process.cwd(), 'madace', 'mam', 'workflows', `${name}.workflow.yaml`);
    const workflow = await loadWorkflow(workflowPath);

    // Create executor and initialize
    const statePath = path.join(process.cwd(), 'madace-data', 'workflow-states');
    const executor = createWorkflowExecutor(workflow, statePath);
    await executor.initialize();

    // Get hierarchy
    const hierarchy = await executor.getHierarchy();

    return NextResponse.json(hierarchy);
  } catch (error) {
    console.error('Failed to get workflow hierarchy:', error);
    return NextResponse.json(
      {
        error: 'Failed to get workflow hierarchy',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

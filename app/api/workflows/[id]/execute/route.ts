/**
 * Workflow Execution API Routes
 * POST /api/workflows/[name]/execute - Initialize and execute next step of workflow
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

// POST /api/workflows/[name]/execute - Execute next step
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { variables, initialize = true } = body;

    // Load workflow
    const workflowFile = await findWorkflowFile(id);

    if (!workflowFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
          message: `No workflow found with name: ${name}. Create a workflow file in madace/mam/workflows/`,
        },
        { status: 404 }
      );
    }

    const workflow = await loadWorkflow(workflowFile);

    // Create executor with state persistence
    const statePath = path.join(process.cwd(), 'madace-data', 'workflow-states');
    const executor = createWorkflowExecutor(workflow, statePath);

    // Initialize if requested (default: true)
    if (initialize) {
      await executor.initialize();

      // Inject variables if provided
      if (variables) {
        const state = executor.getState();
        if (state) {
          state.variables = { ...state.variables, ...variables };
        }
      }
    }

    // Execute next step
    const result = await executor.executeNextStep();

    // Include current state in response
    return NextResponse.json({
      ...result,
      state: executor.getState(),
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Individual Workflow API Routes
 * GET /api/workflows/[name] - Get workflow details
 * POST /api/workflows/[name] - Execute next step of workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { loadWorkflow } from '@/lib/workflows/loader';
import { createWorkflowExecutor } from '@/lib/workflows/executor';
import type { Workflow } from '@/lib/workflows/types';

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

// GET /api/workflows/[name] - Get workflow details
export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;

    // Check for mock workflows
    const mockWorkflows: Record<string, Workflow> = {
      'plan-project': {
        workflow: {
          name: 'plan-project',
          description: 'MAM Planning workflow - Assess project scale and create initial PRD',
          agent: 'pm',
          phase: 1,
          steps: [
            {
              name: 'Load current state',
              action: 'load_state_machine',
              status_file: 'docs/mam-workflow-status.md',
            },
            {
              name: 'Assess project scale',
              action: 'elicit',
              prompt: 'What is the scope of your project? (small/medium/large/enterprise)',
              variable: 'project_scale',
            },
            {
              name: 'Identify key stakeholders',
              action: 'elicit',
              prompt: 'Who are the main stakeholders?',
              variable: 'stakeholders',
            },
            {
              name: 'Define success criteria',
              action: 'elicit',
              prompt: 'What defines success for this project?',
              variable: 'success_criteria',
            },
            {
              name: 'Generate PRD',
              action: 'template',
              template: 'madace/templates/prd.hbs',
              output_file: 'docs/PRD.md',
            },
          ],
        },
      },
      'create-story': {
        workflow: {
          name: 'create-story',
          description: 'MAM Story Creation - Draft and refine user story',
          agent: 'sm',
          phase: 2,
          steps: [
            {
              name: 'Load current state',
              action: 'load_state_machine',
              status_file: 'docs/mam-workflow-status.md',
            },
            {
              name: 'Define story goal',
              action: 'elicit',
              prompt: 'What is the goal of this user story?',
              variable: 'story_goal',
            },
            {
              name: 'Identify acceptance criteria',
              action: 'elicit',
              prompt: 'What are the acceptance criteria?',
              variable: 'acceptance_criteria',
            },
            {
              name: 'Generate story document',
              action: 'template',
              template: 'madace/templates/story.hbs',
              output_file: 'docs/story-{story_id}.md',
            },
          ],
        },
      },
      'design-architecture': {
        workflow: {
          name: 'design-architecture',
          description: 'MAM Architecture Design - Create technical architecture',
          agent: 'architect',
          phase: 3,
          steps: [
            {
              name: 'Review requirements',
              action: 'guide',
              prompt: 'Review the PRD and story requirements',
            },
            {
              name: 'Identify technical constraints',
              action: 'elicit',
              prompt: 'What are the technical constraints?',
              variable: 'constraints',
            },
            {
              name: 'Design system architecture',
              action: 'reflect',
              prompt: 'Design the high-level system architecture',
            },
            {
              name: 'Select technology stack',
              action: 'elicit',
              prompt: 'What technologies will you use?',
              variable: 'tech_stack',
            },
            {
              name: 'Define component structure',
              action: 'reflect',
              prompt: 'Define the component structure and interactions',
            },
            {
              name: 'Generate architecture document',
              action: 'template',
              template: 'madace/templates/architecture.hbs',
              output_file: 'docs/ARCHITECTURE.md',
            },
          ],
        },
      },
    };

    // Try to load real workflow file
    const workflowFile = await findWorkflowFile(name);

    let workflow: Workflow;

    if (workflowFile) {
      workflow = await loadWorkflow(workflowFile);
    } else if (mockWorkflows[name]) {
      workflow = mockWorkflows[name];
    } else {
      return NextResponse.json(
        {
          error: 'Workflow not found',
          message: `No workflow found with name: ${name}`,
          available: Object.keys(mockWorkflows),
        },
        { status: 404 }
      );
    }

    // Extract workflow data
    const wf = workflow.workflow || workflow;

    return NextResponse.json({
      name: wf.name,
      description: wf.description,
      agent: (wf as { agent?: string }).agent,
      phase: (wf as { phase?: number }).phase,
      steps: wf.steps,
      stepCount: wf.steps?.length || 0,
      variables: (wf as { variables?: Record<string, unknown> }).variables || {},
    });
  } catch (error) {
    console.error('Error loading workflow:', error);
    return NextResponse.json(
      {
        error: 'Failed to load workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/workflows/[name] - Execute next step
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { action } = body;

    // Load workflow
    const workflowFile = await findWorkflowFile(name);
    let workflow: Workflow;

    if (workflowFile) {
      workflow = await loadWorkflow(workflowFile);
    } else {
      // Try mock workflows (from GET handler)
      return NextResponse.json(
        {
          error: 'Workflow execution not supported for mock workflows',
          message: 'Create a real workflow file to enable execution',
        },
        { status: 400 }
      );
    }

    // Create executor with state persistence
    const statePath = path.join(process.cwd(), 'madace-data', 'workflow-states');
    const executor = createWorkflowExecutor(workflow, statePath);

    // Initialize if needed
    await executor.initialize();

    // Handle different actions
    switch (action) {
      case 'step':
      case 'execute': {
        // Execute next step
        const result = await executor.executeNextStep();
        return NextResponse.json(result);
      }

      case 'reset': {
        // Reset workflow state
        await executor.reset();
        return NextResponse.json({
          success: true,
          message: 'Workflow state reset',
        });
      }

      case 'state': {
        // Get current state
        const state = executor.getState();
        return NextResponse.json({
          success: true,
          state,
        });
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
            message: `Action must be one of: step, execute, reset, state`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

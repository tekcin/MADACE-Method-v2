/**
 * Workflow API Routes
 * GET /api/workflows - List all available workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { loadWorkflow } from '@/lib/workflows/loader';

export async function GET(_request: NextRequest) {
  try {
    // Define workflow search paths
    const workflowPaths = [
      path.join(process.cwd(), 'madace/mam/workflows'),
      path.join(process.cwd(), 'madace/workflows'),
      path.join(process.cwd(), 'workflows'),
    ];

    const workflows: Array<{
      name: string;
      description: string;
      agent?: string;
      phase?: number;
      stepCount: number;
      path: string;
    }> = [];

    // Search for workflow files in all paths
    for (const workflowPath of workflowPaths) {
      try {
        const files = await fs.readdir(workflowPath);
        const workflowFiles = files.filter(
          (file) => file.endsWith('.workflow.yaml') || file === 'workflow.yaml'
        );

        for (const file of workflowFiles) {
          try {
            const filePath = path.join(workflowPath, file);
            const workflow = await loadWorkflow(filePath);

            // Handle both workflow.workflow and workflow structure
            const wf = workflow.workflow || workflow;

            workflows.push({
              name: wf.name || file.replace('.workflow.yaml', ''),
              description: wf.description || 'No description',
              agent: (wf as { agent?: string }).agent,
              phase: (wf as { phase?: number }).phase,
              stepCount: wf.steps?.length || 0,
              path: filePath,
            });
          } catch (error) {
            console.error(`Failed to load workflow ${file}:`, error);
            // Skip invalid workflows
          }
        }
      } catch {
        // Directory doesn't exist, skip
        continue;
      }
    }

    // If no workflows found, return mock workflows for demonstration
    if (workflows.length === 0) {
      return NextResponse.json({
        workflows: [
          {
            name: 'plan-project',
            description: 'MAM Planning workflow - Assess project scale and create initial PRD',
            agent: 'pm',
            phase: 1,
            stepCount: 5,
            path: 'mock',
          },
          {
            name: 'create-story',
            description: 'MAM Story Creation - Draft and refine user story',
            agent: 'sm',
            phase: 2,
            stepCount: 4,
            path: 'mock',
          },
          {
            name: 'design-architecture',
            description: 'MAM Architecture Design - Create technical architecture',
            agent: 'architect',
            phase: 3,
            stepCount: 6,
            path: 'mock',
          },
        ],
        count: 3,
        note: 'Mock workflows - no workflow files found. Create workflow YAML files in madace/mam/workflows/',
      });
    }

    return NextResponse.json({
      workflows,
      count: workflows.length,
    });
  } catch (error) {
    console.error('Error listing workflows:', error);
    return NextResponse.json(
      {
        error: 'Failed to list workflows',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

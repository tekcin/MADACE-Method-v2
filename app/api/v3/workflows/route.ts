/**
 * Workflow List API Endpoint
 *
 * GET /api/v3/workflows - List all available workflows
 * POST /api/v3/workflows - Create new workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { Workflow } from '@/lib/workflows/types';

const WORKFLOWS_DIRS = [
  'madace/mam/workflows',
  'madace/mab/workflows',
  'madace/cis/workflows',
  '.madace/workflows', // User-created workflows
];

/**
 * Get all available workflows from YAML files
 */
export async function GET(request: NextRequest) {
  try {
    const workflows: Array<{
      id: string;
      name: string;
      description: string;
      agent: string;
      phase: number;
      stepCount: number;
      module: string;
      filePath: string;
    }> = [];

    // Scan all workflow directories
    for (const dir of WORKFLOWS_DIRS) {
      const fullPath = path.join(process.cwd(), dir);

      try {
        const files = await fs.readdir(fullPath);
        const yamlFiles = files.filter(
          (f) => f.endsWith('.workflow.yaml') || f.endsWith('.workflow.yml')
        );

        for (const file of yamlFiles) {
          try {
            const filePath = path.join(fullPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = yaml.load(content) as { workflow: Workflow };

            if (data.workflow) {
              const workflow = data.workflow;
              const module = dir.split('/')[1] || 'custom'; // Extract mam/mab/cis

              workflows.push({
                id: workflow.name,
                name: workflow.name,
                description: workflow.description || '',
                agent: workflow.agent || 'Unknown',
                phase: workflow.phase || 1,
                stepCount: workflow.steps?.length || 0,
                module,
                filePath: filePath.replace(process.cwd(), ''), // Relative path
              });
            }
          } catch (error) {
            console.error(`Error loading workflow file ${file}:`, error);
            // Continue with other files
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      workflows,
      count: workflows.length,
    });
  } catch (error) {
    console.error('Error listing workflows:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list workflows',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Create new workflow from JSON or YAML
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, workflow, format = 'yaml' } = body;

    if (!name || !workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, workflow',
        },
        { status: 400 }
      );
    }

    // Ensure user workflows directory exists
    const userWorkflowsDir = path.join(process.cwd(), '.madace', 'workflows');
    await fs.mkdir(userWorkflowsDir, { recursive: true });

    // Generate file content
    let content: string;
    if (format === 'yaml') {
      const yamlData = {
        workflow: {
          name: workflow.name || name,
          description: workflow.description || '',
          agent: workflow.agent || 'PM',
          phase: workflow.phase || 1,
          variables: workflow.variables || {},
          steps: workflow.steps || [],
        },
      };
      content = yaml.dump(yamlData, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
      });
    } else {
      content = JSON.stringify({ workflow }, null, 2);
    }

    // Write workflow file
    const filename = `${name}.workflow.yaml`;
    const filePath = path.join(userWorkflowsDir, filename);

    // Check if file already exists
    try {
      await fs.access(filePath);
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow already exists',
          message: `A workflow named "${name}" already exists`,
        },
        { status: 409 }
      );
    } catch {
      // File doesn't exist, good to proceed
    }

    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Workflow created successfully',
      workflow: {
        id: name,
        name,
        filePath: filePath.replace(process.cwd(), ''),
      },
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GitHub Import API
 *
 * POST /api/v3/github/import
 * Clone and analyze a GitHub repository
 */

import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/services/github-service';
import { z } from 'zod';

// Request validation schema
const importSchema = z.object({
  url: z.string().url(),
  createProject: z.boolean().optional().default(false),
  projectName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, createProject, projectName: _projectName } = importSchema.parse(body);

    // Import the repository
    console.warn(`Importing repository from ${url}...`);
    const analysis = await githubService.importRepository(url);

    // Optionally create a project in MADACE
    const projectId: string | null = null;
    if (createProject) {
      // TODO: Integrate with project service to create a project
      // const project = await projectService.createProject({
      //   name: _projectName || analysis.name,
      //   description: analysis.description,
      //   // ... other fields
      // });
      // projectId = project.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        projectId,
      },
    });
  } catch (error) {
    console.error('GitHub import error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import repository',
      },
      { status: 500 }
    );
  }
}

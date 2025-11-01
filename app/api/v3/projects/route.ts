/**
 * Projects API
 *
 * GET /api/v3/projects - List all projects for user
 * POST /api/v3/projects - Create new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/services/project-service';

// Mock user ID (in production, get from auth session)
const getCurrentUserId = () => 'default-user';

/**
 * GET /api/v3/projects
 * List all projects for the current user
 */
export async function GET(_request: NextRequest) {
  try {
    const userId = getCurrentUserId();
    const projects = await getProjects(userId);

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error('[Projects API] Failed to get projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get projects',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v3/projects
 * Create a new project
 *
 * Body: { name: string, description?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId();
    const body = await request.json();

    const project = await createProject({
      ...body,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: 'Project created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Projects API] Failed to create project:', error);

    // Check for validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project',
      },
      { status: 500 }
    );
  }
}

/**
 * Project Detail API
 *
 * GET /api/v3/projects/[id] - Get project details
 * PUT /api/v3/projects/[id] - Update project
 * DELETE /api/v3/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, deleteProject } from '@/lib/services/project-service';

// Mock user ID (in production, get from auth session)
const getCurrentUserId = () => 'default-user';

/**
 * GET /api/v3/projects/[id]
 * Get project details with permission check
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getCurrentUserId();

    const project = await getProject(id, userId);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found or access denied',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('[Project Detail API] Failed to get project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v3/projects/[id]
 * Update project (admin/owner only)
 *
 * Body: { name?: string, description?: string | null }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getCurrentUserId();
    const body = await request.json();

    const project = await updateProject(id, userId, body);

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('[Project Detail API] Failed to update project:', error);

    // Handle permission errors
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 403 }
      );
    }

    // Handle validation errors
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
        error: error instanceof Error ? error.message : 'Failed to update project',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v3/projects/[id]
 * Delete project (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getCurrentUserId();

    await deleteProject(id, userId);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('[Project Detail API] Failed to delete project:', error);

    // Handle permission errors
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete project',
      },
      { status: 500 }
    );
  }
}

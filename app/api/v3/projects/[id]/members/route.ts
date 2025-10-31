/**
 * Project Members API
 *
 * GET /api/v3/projects/[id]/members - List project members
 * POST /api/v3/projects/[id]/members - Add member
 * DELETE /api/v3/projects/[id]/members - Remove member
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from '@/lib/services/project-service';

// Mock user ID (in production, get from auth session)
const getCurrentUserId = () => 'default-user';

/**
 * GET /api/v3/projects/[id]/members
 * List all members of a project
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getCurrentUserId();

    const members = await getProjectMembers(id, userId);

    return NextResponse.json({
      success: true,
      data: members,
      count: members.length,
    });
  } catch (error) {
    console.error('[Project Members API] Failed to get members:', error);

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
        error: error instanceof Error ? error.message : 'Failed to get project members',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v3/projects/[id]/members
 * Add a member to the project (admin/owner only)
 *
 * Body: { userId: string, role?: 'owner' | 'admin' | 'member' }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const requestingUserId = getCurrentUserId();
    const body = await request.json();

    const member = await addProjectMember(id, requestingUserId, body);

    return NextResponse.json(
      {
        success: true,
        data: member,
        message: 'Member added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Project Members API] Failed to add member:', error);

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('already a member')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add member',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v3/projects/[id]/members
 * Remove a member from the project (admin/owner only)
 *
 * Body: { userId: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestingUserId = getCurrentUserId();
    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    await removeProjectMember(id, requestingUserId, body.userId);

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('[Project Members API] Failed to remove member:', error);

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('last owner')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove member',
      },
      { status: 500 }
    );
  }
}

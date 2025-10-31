import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

/**
 * GET /api/state
 * Get current workflow status from database (StateMachine records)
 * Query params:
 *   - projectId (optional): Filter stories by project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Build where clause
    const where = projectId ? { projectId } : {};

    // Fetch all stories from database
    const stories = await prisma.stateMachine.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // Group stories by status
    const backlog = stories.filter((s) => s.status === 'BACKLOG');
    const todo = stories.filter((s) => s.status === 'TODO');
    const inProgress = stories.filter((s) => s.status === 'IN_PROGRESS');
    const done = stories.filter((s) => s.status === 'DONE');

    // Transform to expected format
    const status = {
      backlog: backlog.map((s) => ({
        id: s.storyId,
        title: s.title,
        points: s.points,
        milestone: null, // Can add milestone field to schema later
      })),
      todo: todo.map((s) => ({
        id: s.storyId,
        title: s.title,
        points: s.points,
        milestone: null,
      })),
      inProgress: inProgress.map((s) => ({
        id: s.storyId,
        title: s.title,
        points: s.points,
        milestone: null,
      })),
      done: done.map((s) => ({
        id: s.storyId,
        title: s.title,
        points: s.points,
        milestone: null,
      })),
    };

    return NextResponse.json({
      success: true,
      status,
      projectId: projectId || null,
      total: stories.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load workflow status';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

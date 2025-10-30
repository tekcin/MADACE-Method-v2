/**
 * Single Memory API
 *
 * GET /api/v3/agents/:id/memory/:memoryId - Get memory
 * PUT /api/v3/agents/:id/memory/:memoryId - Update memory
 * DELETE /api/v3/agents/:id/memory/:memoryId - Delete memory
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getMemory,
  updateMemory,
  deleteMemory,
  trackMemoryAccess,
  type MemoryContext,
} from '@/lib/services/memory-service';

/**
 * GET /api/v3/agents/:id/memory/:memoryId
 * Get a single memory
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; memoryId: string } }
) {
  try {
    const { memoryId } = params;

    const memory = await getMemory(memoryId);

    if (!memory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Memory not found',
        },
        { status: 404 }
      );
    }

    // Track access
    await trackMemoryAccess(memoryId);

    return NextResponse.json({
      success: true,
      data: memory,
    });
  } catch (error) {
    console.error('[API] Get memory error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get memory',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v3/agents/:id/memory/:memoryId
 * Update a memory
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; memoryId: string } }
) {
  try {
    const { memoryId } = params;
    const body = await request.json();

    // Check if memory exists
    const existing = await getMemory(memoryId);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Memory not found',
        },
        { status: 404 }
      );
    }

    const updates: Partial<MemoryContext> = {};

    if (body.importance !== undefined) {
      if (body.importance < 1 || body.importance > 10) {
        return NextResponse.json(
          {
            success: false,
            error: 'Importance must be between 1 and 10',
          },
          { status: 400 }
        );
      }
      updates.importance = body.importance;
    }

    if (body.value !== undefined) updates.value = body.value;
    if (body.expiresAt !== undefined) {
      updates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    }
    if (body.type !== undefined) updates.type = body.type;
    if (body.category !== undefined) updates.category = body.category;

    const updatedMemory = await updateMemory(memoryId, updates);

    return NextResponse.json({
      success: true,
      data: updatedMemory,
    });
  } catch (error) {
    console.error('[API] Update memory error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update memory',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v3/agents/:id/memory/:memoryId
 * Delete a memory
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memoryId: string } }
) {
  try {
    const { memoryId } = params;

    // Check if memory exists
    const existing = await getMemory(memoryId);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Memory not found',
        },
        { status: 404 }
      );
    }

    await deleteMemory(memoryId);

    return NextResponse.json({
      success: true,
      data: { deleted: memoryId },
    });
  } catch (error) {
    console.error('[API] Delete memory error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete memory',
      },
      { status: 500 }
    );
  }
}

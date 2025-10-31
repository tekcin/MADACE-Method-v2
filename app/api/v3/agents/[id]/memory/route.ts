/**
 * Agent Memory API
 *
 * GET /api/v3/agents/:id/memory - List memories
 * POST /api/v3/agents/:id/memory - Create memory
 * DELETE /api/v3/agents/:id/memory - Clear all memories
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getMemories,
  saveMemory,
  clearMemories,
  getMemoryCount,
  getMemoryStats,
  searchMemories,
  type MemoryContext,
  type MemoryFilterOptions,
} from '@/lib/services/memory-service';

/**
 * GET /api/v3/agents/:id/memory
 * List memories for an agent
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await params;
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId') || 'cli-user'; // Mock user for now
    const type = searchParams.get('type') as 'short-term' | 'long-term' | null;
    const category = searchParams.get('category');
    const minImportance = searchParams.get('minImportance');
    const limit = searchParams.get('limit');
    const orderBy = searchParams.get('orderBy') as
      | 'createdAt'
      | 'lastAccessedAt'
      | 'importance'
      | null;
    const order = searchParams.get('order') as 'asc' | 'desc' | null;
    const query = searchParams.get('q');
    const stats = searchParams.get('stats') === 'true';
    const count = searchParams.get('count') === 'true';

    // Return stats only
    if (stats) {
      const memoryStats = await getMemoryStats(agentId, userId);
      return NextResponse.json({
        success: true,
        data: memoryStats,
      });
    }

    // Return count only
    if (count) {
      const memoryCount = await getMemoryCount(agentId, userId, type || undefined);
      return NextResponse.json({
        success: true,
        data: { count: memoryCount },
      });
    }

    // Search memories
    if (query) {
      const memories = await searchMemories(agentId, userId, query, limit ? parseInt(limit) : 20);
      return NextResponse.json({
        success: true,
        data: memories,
        count: memories.length,
      });
    }

    // List memories with filters
    const options: MemoryFilterOptions = {};
    if (type) options.type = type;
    if (category) options.category = category;
    if (minImportance) options.minImportance = parseInt(minImportance);
    if (limit) options.limit = parseInt(limit);
    if (orderBy) options.orderBy = orderBy;
    if (order) options.order = order;

    const memories = await getMemories(agentId, userId, options);

    return NextResponse.json({
      success: true,
      data: memories,
      count: memories.length,
    });
  } catch (error) {
    console.error('[API] Get memories error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get memories',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v3/agents/:id/memory
 * Create a new memory
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();

    const userId = body.userId || 'cli-user';
    const memory: MemoryContext = {
      type: body.type || 'long-term',
      category: body.category,
      key: body.key,
      value: body.value,
      importance: body.importance || 5,
      source: body.source || 'user_input',
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    };

    // Validation
    if (!memory.category || !memory.key || !memory.value) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: category, key, value',
        },
        { status: 400 }
      );
    }

    if (memory.importance < 1 || memory.importance > 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Importance must be between 1 and 10',
        },
        { status: 400 }
      );
    }

    const savedMemory = await saveMemory(agentId, userId, memory);

    return NextResponse.json({
      success: true,
      data: savedMemory,
    });
  } catch (error) {
    console.error('[API] Create memory error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create memory',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v3/agents/:id/memory
 * Clear all memories for an agent
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await params;
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId') || 'cli-user';
    const type = searchParams.get('type') as 'short-term' | 'long-term' | undefined;

    const count = await clearMemories(agentId, userId, type);

    return NextResponse.json({
      success: true,
      data: { cleared: count },
    });
  } catch (error) {
    console.error('[API] Clear memories error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear memories',
      },
      { status: 500 }
    );
  }
}

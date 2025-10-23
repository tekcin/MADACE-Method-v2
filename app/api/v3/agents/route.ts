/**
 * Agent API Routes
 *
 * Endpoints:
 * - GET /api/v3/agents - List all agents
 * - POST /api/v3/agents - Create new agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { listAgents, createAgent, DatabaseError } from '@/lib/services';

/**
 * GET /api/v3/agents
 *
 * List all agents with optional filtering
 *
 * Query parameters:
 * - projectId?: string - Filter by project ID
 * - module?: string - Filter by module (mam, mab, cis, core)
 * - limit?: number - Maximum number of results (default: 100)
 * - offset?: number - Number of results to skip (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('projectId') || undefined;
    const moduleFilter = searchParams.get('module') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const agents = await listAgents({
      projectId,
      module: moduleFilter,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    console.error('Error listing agents:', error);

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          operation: error.operation,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list agents',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v3/agents
 *
 * Create a new agent
 *
 * Request body: CreateAgentInput (see agent-service.ts)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const agent = await createAgent(body);

    return NextResponse.json(
      {
        success: true,
        data: agent,
        message: 'Agent created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent:', error);

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          operation: error.operation,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create agent',
      },
      { status: 500 }
    );
  }
}

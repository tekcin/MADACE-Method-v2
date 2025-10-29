/**
 * Individual Agent API Routes
 *
 * Endpoints:
 * - GET /api/v3/agents/:id - Get single agent
 * - PUT /api/v3/agents/:id - Update agent
 * - DELETE /api/v3/agents/:id - Delete agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgent, updateAgent, deleteAgent, DatabaseError } from '@/lib/services';

/**
 * GET /api/v3/agents/:id
 *
 * Get a single agent by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const agent = await getAgent(id);

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error getting agent:', error);

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
        error: 'Failed to get agent',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v3/agents/:id
 *
 * Update an existing agent
 *
 * Request body: UpdateAgentInput (partial, see agent-service.ts)
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const agent = await updateAgent(id, body);

    return NextResponse.json({
      success: true,
      data: agent,
      message: 'Agent updated successfully',
    });
  } catch (error) {
    console.error('Error updating agent:', error);

    if (error instanceof DatabaseError) {
      // Check if it's a "not found" error
      if (error.message.includes('not found')) {
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
          error: error.message,
          operation: error.operation,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update agent',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v3/agents/:id
 *
 * Delete an agent by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const agent = await deleteAgent(id);

    return NextResponse.json({
      success: true,
      data: agent,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting agent:', error);

    if (error instanceof DatabaseError) {
      // Check if it's a "not found" error
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Agent not found',
          },
          { status: 404 }
        );
      }

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
        error: 'Failed to delete agent',
      },
      { status: 500 }
    );
  }
}

/**
 * Agent Duplicate API Route
 *
 * Endpoint:
 * - POST /api/v3/agents/:id/duplicate - Duplicate an existing agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { duplicateAgent, DatabaseError } from '@/lib/services';

/**
 * POST /api/v3/agents/:id/duplicate
 *
 * Duplicate an existing agent with a new name
 *
 * Request body:
 * - newName: string - Name for the duplicated agent
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { newName } = body;

    if (!newName || typeof newName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'newName is required and must be a string',
        },
        { status: 400 }
      );
    }

    const duplicatedAgent = await duplicateAgent(id, newName);

    return NextResponse.json(
      {
        success: true,
        data: duplicatedAgent,
        message: 'Agent duplicated successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error duplicating agent:', error);

    if (error instanceof DatabaseError) {
      // Check if it's a "not found" error
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Source agent not found',
          },
          { status: 404 }
        );
      }

      // Check if it's a duplicate name error
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          {
            success: false,
            error: 'An agent with this name already exists',
          },
          { status: 409 }
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
        error: 'Failed to duplicate agent',
      },
      { status: 500 }
    );
  }
}

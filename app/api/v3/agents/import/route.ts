/**
 * Agent Import API Route
 *
 * Endpoint:
 * - POST /api/v3/agents/import - Import agent from JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { importAgent, DatabaseError } from '@/lib/services';

/**
 * POST /api/v3/agents/import
 *
 * Import an agent from JSON data
 *
 * Request body: Agent JSON data (from export or manual creation)
 * Optional query parameter:
 * - projectId?: string - Associate imported agent with a project
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || undefined;

    const body = await request.json();

    const agent = await importAgent(body, projectId);

    return NextResponse.json(
      {
        success: true,
        data: agent,
        message: 'Agent imported successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error importing agent:', error);

    if (error instanceof DatabaseError) {
      // Check if it's a validation error
      if (error.message.includes('validation') || error.message.includes('Invalid')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            hint: 'Please ensure the JSON matches the agent schema format',
          },
          { status: 400 }
        );
      }

      // Check if it's a duplicate name error
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          {
            success: false,
            error: 'An agent with this name already exists',
            hint: 'Consider renaming the agent in the JSON before importing',
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
        error: 'Failed to import agent',
      },
      { status: 500 }
    );
  }
}

/**
 * NLU Parse API Endpoint
 *
 * POST /api/v3/nlu/parse
 * Parses user input using NLU service (Dialogflow CX) and returns intent + entities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDialogflowProviderFromEnv } from '@/lib/nlu/dialogflow-client';
import { handleIntent } from '@/lib/nlu/intent-handler';
import type { NLUParseRequest } from '@/lib/nlu/types';

/**
 * POST /api/v3/nlu/parse
 *
 * Parse user input and return intent + action result
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "text" field' },
        { status: 400 }
      );
    }

    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "sessionId" field' },
        { status: 400 }
      );
    }

    // Create parse request
    const parseRequest: NLUParseRequest = {
      text: body.text,
      sessionId: body.sessionId,
      userId: body.userId,
      agentId: body.agentId,
      languageCode: body.languageCode || 'en',
    };

    // Check if Dialogflow CX is configured
    if (
      !process.env.DIALOGFLOW_PROJECT_ID ||
      !process.env.DIALOGFLOW_AGENT_ID
    ) {
      // NLU not configured, return helpful error
      return NextResponse.json(
        {
          error: 'NLU service not configured',
          message:
            'Dialogflow CX environment variables are not set. ' +
            'Please configure DIALOGFLOW_PROJECT_ID and DIALOGFLOW_AGENT_ID to enable conversational mode.',
          fallbackToMenu: true,
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Create Dialogflow provider
    const nluProvider = createDialogflowProviderFromEnv();

    // Parse intent
    const parseResponse = await nluProvider.parse(parseRequest);

    // If confidence is too low, return with fallback flag
    if (parseResponse.shouldFallbackToMenu) {
      return NextResponse.json({
        success: false,
        intent: parseResponse.intent,
        entities: parseResponse.entities,
        confidence: parseResponse.intent.confidence,
        shouldFallbackToMenu: true,
        message:
          `I'm not quite sure what you mean (confidence: ${(parseResponse.intent.confidence * 100).toFixed(0)}%). ` +
          'Could you try rephrasing, or would you like to use the menu instead?',
      });
    }

    // Handle intent with action handler
    const actionResult = await handleIntent(
      parseResponse.intent,
      parseResponse.entities
    );

    // Return combined response
    return NextResponse.json({
      success: actionResult.success,
      intent: {
        name: parseResponse.intent.name,
        displayName: parseResponse.intent.displayName,
        confidence: parseResponse.intent.confidence,
      },
      entities: parseResponse.entities,
      action: actionResult,
      shouldFallbackToMenu: false,
      sessionId: parseResponse.sessionId,
    });
  } catch (error) {
    console.error('[NLU Parse API] Error:', error);

    // Check if error is due to missing credentials
    if (
      error instanceof Error &&
      error.message.includes('Dialogflow CX environment variables')
    ) {
      return NextResponse.json(
        {
          error: 'NLU service not configured',
          message: error.message,
          fallbackToMenu: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to parse intent',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallbackToMenu: true,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v3/nlu/parse
 *
 * Get NLU service status and configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Check if Dialogflow CX is configured
    const isConfigured = Boolean(
      process.env.DIALOGFLOW_PROJECT_ID && process.env.DIALOGFLOW_AGENT_ID
    );

    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        provider: 'dialogflow-cx',
        message:
          'NLU service not configured. Set DIALOGFLOW_PROJECT_ID and DIALOGFLOW_AGENT_ID environment variables.',
      });
    }

    // Test connection
    try {
      const nluProvider = createDialogflowProviderFromEnv();
      const connectionTest = await nluProvider.testConnection();

      return NextResponse.json({
        configured: true,
        provider: 'dialogflow-cx',
        connected: connectionTest,
        config: nluProvider.getConfig(),
        message: connectionTest
          ? 'NLU service is configured and connected'
          : 'NLU service is configured but connection test failed',
      });
    } catch (error) {
      return NextResponse.json({
        configured: true,
        provider: 'dialogflow-cx',
        connected: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
        message:
          'NLU service is configured but unable to connect. Check your credentials.',
      });
    }
  } catch (error) {
    console.error('[NLU Parse API] Status check error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check NLU service status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

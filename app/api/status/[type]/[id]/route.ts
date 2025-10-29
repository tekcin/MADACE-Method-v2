/**
 * API Route: GET /api/status/:type/:id
 * STORY-V3-017: Create API Route for Status Checking
 *
 * Provides RESTful endpoint for querying status of any entity type.
 * Routes to appropriate status provider via registry auto-detection.
 *
 * @example
 * GET /api/status/story/STORY-V3-016
 * GET /api/status/epic/EPIC-V3-001
 * GET /api/status/workflow/pm-planning
 * GET /api/status/state-machine/state
 */

import { NextResponse } from 'next/server';
import { getStatusRegistry } from '@/lib/status/registry';
import type { StatusResult } from '@/lib/status/types';

/**
 * Error codes for API responses
 */
enum ERROR_CODE {
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND', // 404
  INVALID_TYPE = 'INVALID_TYPE', // 400
  MISSING_PARAMS = 'MISSING_PARAMS', // 400
  INTERNAL_ERROR = 'INTERNAL_ERROR', // 500
  PROVIDER_ERROR = 'PROVIDER_ERROR', // 500
  VALIDATION_ERROR = 'VALIDATION_ERROR', // 400
  PERMISSION_DENIED = 'PERMISSION_DENIED', // 500
  TIMEOUT = 'TIMEOUT', // 500
}

/**
 * Valid entity types
 */
const VALID_TYPES = ['story', 'epic', 'workflow', 'state-machine'] as const;
type ValidType = (typeof VALID_TYPES)[number];

/**
 * Success response format
 */
interface SuccessResponse {
  success: true;
  result: StatusResult;
}

/**
 * Error response format
 */
interface ErrorResponse {
  success: false;
  error: string;
  code: ERROR_CODE;
}

/**
 * GET handler for status queries
 *
 * @param request - Next.js Request object
 * @param params - Route parameters (type, id)
 * @returns NextResponse with StatusResult or error
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Await params (Next.js 15 async params)
    const { type, id } = await params;

    // Validate parameters exist
    if (!type || !id) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Missing required parameters: type and id',
          code: ERROR_CODE.MISSING_PARAMS,
        },
        { status: 400 }
      );
    }

    // Validate type parameter
    if (!isValidType(type)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: `Invalid type: ${type}. Must be one of: ${VALID_TYPES.join(', ')}`,
          code: ERROR_CODE.INVALID_TYPE,
        },
        { status: 400 }
      );
    }

    // Validate ID parameter (basic sanitization)
    const sanitizedId = sanitizeId(id);
    if (!sanitizedId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error:
            'Invalid ID: Must be a non-empty string without path traversal or injection attempts',
          code: ERROR_CODE.VALIDATION_ERROR,
        },
        { status: 400 }
      );
    }

    // Get status registry
    const registry = getStatusRegistry();

    // Query status via registry
    // Registry will auto-detect provider based on ID pattern
    const result = await registry.getStatusResult(sanitizedId);

    // Return success response
    return NextResponse.json<SuccessResponse>(
      {
        success: true,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle errors with appropriate status codes
    return handleError(error);
  }
}

/**
 * Type guard for valid entity types
 *
 * @param type - Type string to validate
 * @returns True if type is valid
 */
function isValidType(type: string): type is ValidType {
  return VALID_TYPES.includes(type as ValidType);
}

/**
 * Sanitize ID parameter
 *
 * Removes potentially dangerous characters and patterns:
 * - Path traversal (../, ..\)
 * - Null bytes
 * - HTML/SQL injection patterns
 * - Excessive length (max 1000 chars)
 *
 * @param id - Raw ID string
 * @returns Sanitized ID or null if invalid
 */
function sanitizeId(id: string): string | null {
  // Check type
  if (typeof id !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmed = id.trim();

  // Check empty
  if (trimmed.length === 0) {
    return null;
  }

  // Check max length (1000 characters)
  if (trimmed.length > 1000) {
    return null;
  }

  // Check for path traversal attempts
  if (trimmed.includes('../') || trimmed.includes('..\\')) {
    return null;
  }

  // Check for null bytes
  if (trimmed.includes('\0')) {
    return null;
  }

  // Check for HTML tags (basic XSS prevention)
  if (/<script|<iframe|<object|<embed/i.test(trimmed)) {
    return null;
  }

  // Check for SQL injection patterns (basic prevention)
  if (/;.*drop\s+table|;.*delete\s+from|;.*insert\s+into/i.test(trimmed)) {
    return null;
  }

  // Return sanitized ID
  return trimmed;
}

/**
 * Handle errors with appropriate HTTP status codes
 *
 * Maps error messages to status codes and error codes:
 * - "not found" → 404 ENTITY_NOT_FOUND
 * - "permission denied" → 500 PERMISSION_DENIED
 * - "No status provider" → 400 INVALID_TYPE
 * - "Validation failed" → 400 VALIDATION_ERROR
 * - Default → 500 INTERNAL_ERROR
 *
 * @param error - Error object or string
 * @returns NextResponse with error details
 */
function handleError(error: unknown): NextResponse<ErrorResponse> {
  // Extract error message
  const message = error instanceof Error ? error.message : String(error);

  // Map error message to status code and error code
  if (message.toLowerCase().includes('not found')) {
    // Entity not found
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: message,
        code: ERROR_CODE.ENTITY_NOT_FOUND,
      },
      { status: 404 }
    );
  }

  if (message.toLowerCase().includes('permission denied') || message.includes('EACCES')) {
    // Permission error
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'Permission denied accessing resource',
        code: ERROR_CODE.PERMISSION_DENIED,
      },
      { status: 500 }
    );
  }

  if (message.includes('No status provider found')) {
    // No provider for this entity type
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: message,
        code: ERROR_CODE.INVALID_TYPE,
      },
      { status: 400 }
    );
  }

  if (message.toLowerCase().includes('validation failed')) {
    // Validation error
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: message,
        code: ERROR_CODE.VALIDATION_ERROR,
      },
      { status: 400 }
    );
  }

  // Default: Internal server error
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      error: 'Internal server error',
      code: ERROR_CODE.INTERNAL_ERROR,
    },
    { status: 500 }
  );
}

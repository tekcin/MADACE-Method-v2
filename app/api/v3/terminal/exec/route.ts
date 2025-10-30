/**
 * Terminal Command Execution API
 *
 * POST /api/v3/terminal/exec
 *
 * Executes shell commands with security validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeCommand } from '@/lib/terminal/command-executor';
import { validateCommand } from '@/lib/terminal/command-whitelist';
import { z } from 'zod';

/**
 * Request body schema
 */
const ExecuteRequestSchema = z.object({
  command: z.string().min(1, 'Command cannot be empty').max(1000, 'Command too long'),
  cwd: z.string().optional(),
  timeout: z.number().int().min(1000).max(300000).optional(), // 1s - 5min
});

/**
 * Response body schema
 */
interface ExecuteResponse {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
  exitCode?: number | null;
  timedOut?: boolean;
}

/**
 * POST /api/v3/terminal/exec
 *
 * Execute a shell command with security validation.
 *
 * @param request - Next.js request object
 * @returns Command execution result
 */
export async function POST(request: NextRequest): Promise<NextResponse<ExecuteResponse>> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request schema
    const validationResult = ExecuteRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e: { message: string }) => e.message)
        .join(', ');
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${errors}`,
        },
        { status: 400 }
      );
    }

    const { command, cwd, timeout } = validationResult.data;

    // Validate command against whitelist
    const whitelistValidation = validateCommand(command);
    if (!whitelistValidation.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: whitelistValidation.reason || 'Command not allowed',
        },
        { status: 403 }
      );
    }

    // Execute command
    const result = await executeCommand(command, {
      cwd: cwd || process.cwd(),
      timeout: timeout || 30000, // 30s default
      env: {
        // Pass current environment
        ...process.env,
        // Add custom environment variables if needed
        MADACE_TERMINAL: 'true',
      },
    });

    // Return result
    return NextResponse.json({
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      error: result.error,
      timedOut: result.timedOut,
    });
  } catch (error) {
    console.error('[Terminal API] Error executing command:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v3/terminal/exec
 *
 * Returns API documentation and status.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Terminal Execution API',
    version: 'v3',
    endpoint: '/api/v3/terminal/exec',
    methods: ['POST'],
    description: 'Execute shell commands with security validation',
    usage: {
      method: 'POST',
      body: {
        command: 'string (required, 1-1000 chars)',
        cwd: 'string (optional, working directory)',
        timeout: 'number (optional, 1000-300000ms)',
      },
      response: {
        success: 'boolean',
        stdout: 'string (command output)',
        stderr: 'string (error output)',
        exitCode: 'number | null',
        error: 'string (error message if failed)',
        timedOut: 'boolean (true if command timed out)',
      },
    },
    security: {
      whitelist: 'Commands are validated against a whitelist',
      blockedCommands: ['rm', 'sudo', 'reboot', 'shutdown', '...'],
      allowedCommands: ['ls', 'pwd', 'cd', 'cat', 'npm', 'git', 'madace', '...'],
    },
  });
}

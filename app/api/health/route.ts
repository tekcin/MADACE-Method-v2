/**
 * Health Check API Route
 * GET /api/health - System health status check
 *
 * Checks:
 * - Application uptime
 * - File system access
 * - State machine availability
 * - Configuration availability
 * - LLM provider configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { StateMachine } from '@/lib/state/machine';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    filesystem: {
      status: 'pass' | 'fail';
      message: string;
      responseTime?: number;
    };
    stateMachine: {
      status: 'pass' | 'fail';
      message: string;
      details?: {
        backlog: number;
        todo: number;
        inProgress: number;
        done: number;
      };
      responseTime?: number;
    };
    configuration: {
      status: 'pass' | 'fail';
      message: string;
      responseTime?: number;
    };
    llmConfig: {
      status: 'pass' | 'fail';
      message: string;
      provider?: string;
      responseTime?: number;
    };
  };
  version: string;
  environment: string;
}

export async function GET(_request: NextRequest) {
  const startTime = Date.now();
  const checks: HealthCheckResult['checks'] = {
    filesystem: { status: 'pass', message: '' },
    stateMachine: { status: 'pass', message: '' },
    configuration: { status: 'pass', message: '' },
    llmConfig: { status: 'pass', message: '' },
  };

  // Check 1: File System Access
  try {
    const fsStart = Date.now();
    // Use MADACE_DATA_DIR env var or default to madace-data
    const dataPath = process.env.MADACE_DATA_DIR || path.join(process.cwd(), 'madace-data');

    // Try to create data directory if it doesn't exist
    await fs.mkdir(dataPath, { recursive: true });

    // Try to write a test file
    const testFile = path.join(dataPath, '.health-check');
    await fs.writeFile(testFile, Date.now().toString(), 'utf-8');

    // Try to read it back
    await fs.readFile(testFile, 'utf-8');

    // Clean up
    await fs.unlink(testFile).catch(() => {
      /* ignore cleanup errors */
    });

    checks.filesystem = {
      status: 'pass',
      message: 'File system is accessible and writable',
      responseTime: Date.now() - fsStart,
    };
  } catch (error) {
    checks.filesystem = {
      status: 'fail',
      message: `File system check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
    };
  }

  // Check 2: State Machine
  try {
    const smStart = Date.now();
    const statusFile = path.join(process.cwd(), 'docs', 'mam-workflow-status.md');

    try {
      // Check if status file exists
      await fs.access(statusFile);

      // Try to load state machine
      const stateMachine = new StateMachine(statusFile);
      await stateMachine.load();

      const status = stateMachine.getStatus();

      checks.stateMachine = {
        status: 'pass',
        message: 'State machine is operational',
        details: {
          backlog: status.backlog.length,
          todo: status.todo.length,
          inProgress: status.inProgress.length,
          done: status.done.length,
        },
        responseTime: Date.now() - smStart,
      };
    } catch {
      // File doesn't exist - this is okay in production
      checks.stateMachine = {
        status: 'pass',
        message: 'State machine file not found (expected in production)',
        details: {
          backlog: 0,
          todo: 0,
          inProgress: 0,
          done: 0,
        },
        responseTime: Date.now() - smStart,
      };
    }
  } catch (error) {
    checks.stateMachine = {
      status: 'fail',
      message: `State machine check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
    };
  }

  // Check 3: Configuration
  try {
    const configStart = Date.now();
    const dataPath = process.env.MADACE_DATA_DIR || path.join(process.cwd(), 'madace-data');
    const configPath = path.join(dataPath, 'config', 'config.yaml');

    try {
      await fs.access(configPath);
      checks.configuration = {
        status: 'pass',
        message: 'Configuration file exists',
        responseTime: Date.now() - configStart,
      };
    } catch {
      checks.configuration = {
        status: 'pass',
        message: 'Configuration file not found (setup not completed)',
        responseTime: Date.now() - configStart,
      };
    }
  } catch (error) {
    checks.configuration = {
      status: 'fail',
      message: `Configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
    };
  }

  // Check 4: LLM Configuration
  try {
    const llmStart = Date.now();
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasClaudeKey = !!process.env.CLAUDE_API_KEY;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const planningLLM = process.env.PLANNING_LLM;

    if (hasGeminiKey || hasClaudeKey || hasOpenAIKey) {
      const providers = [];
      if (hasGeminiKey) providers.push('Gemini');
      if (hasClaudeKey) providers.push('Claude');
      if (hasOpenAIKey) providers.push('OpenAI');

      checks.llmConfig = {
        status: 'pass',
        message: `LLM providers configured: ${providers.join(', ')}`,
        provider: planningLLM || 'none',
        responseTime: Date.now() - llmStart,
      };
    } else {
      checks.llmConfig = {
        status: 'pass',
        message: 'No LLM API keys configured (setup not completed)',
        provider: planningLLM || 'none',
        responseTime: Date.now() - llmStart,
      };
    }
  } catch (error) {
    checks.llmConfig = {
      status: 'fail',
      message: `LLM configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
    };
  }

  // Determine overall health status
  const failedChecks = Object.values(checks).filter((check) => check.status === 'fail').length;
  const overallStatus: HealthCheckResult['status'] =
    failedChecks === 0 ? 'healthy' : failedChecks <= 1 ? 'degraded' : 'unhealthy';

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    version: '3.0.0-alpha',
    environment: process.env.NODE_ENV || 'development',
  };

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(result, { status: httpStatus });
}

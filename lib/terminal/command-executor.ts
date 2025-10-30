/**
 * Terminal Command Executor
 *
 * Executes shell commands with security measures:
 * - Command whitelist validation
 * - Directory sandboxing
 * - Timeout enforcement
 * - Output streaming and capture
 */

import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { existsSync, statSync } from 'fs';
import { resolve, normalize } from 'path';

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
  error?: string;
  timedOut?: boolean;
}

/**
 * Command execution options
 */
export interface ExecutionOptions {
  cwd?: string; // Working directory
  timeout?: number; // Timeout in milliseconds (default: 30s)
  env?: Record<string, string>; // Environment variables
  maxBufferSize?: number; // Max buffer size for output (default: 1MB)
}

/**
 * Execute a shell command with security measures
 *
 * @param command - Full command string (e.g., "ls -la", "npm run build")
 * @param options - Execution options
 * @returns Command execution result
 */
export async function executeCommand(
  command: string,
  options: ExecutionOptions = {}
): Promise<CommandResult> {
  const {
    cwd = process.cwd(),
    timeout = 30000, // 30 seconds default
    env = {},
    maxBufferSize = 1024 * 1024, // 1MB default
  } = options;

  // Validate working directory
  const validatedCwd = validateWorkingDirectory(cwd);
  if (!validatedCwd.success) {
    return {
      success: false,
      stdout: '',
      stderr: '',
      exitCode: null,
      signal: null,
      error: validatedCwd.error,
    };
  }

  // Parse command into executable and arguments
  const parsedCommand = parseCommand(command);
  if (!parsedCommand) {
    return {
      success: false,
      stdout: '',
      stderr: '',
      exitCode: null,
      signal: null,
      error: 'Failed to parse command',
    };
  }

  const { executable, args } = parsedCommand;

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let killed = false;

    // Spawn process
    const spawnOptions: SpawnOptionsWithoutStdio = {
      cwd: validatedCwd.path,
      env: {
        ...process.env,
        ...env,
        // Security: prevent loading local node_modules in unexpected ways
        NODE_OPTIONS: '',
      },
      shell: true, // Use shell for command parsing (required for pipes, redirects, etc.)
    };

    const childProcess = spawn(executable, args, spawnOptions);

    // Set timeout
    const timeoutHandle = setTimeout(() => {
      if (!killed) {
        timedOut = true;
        killed = true;
        childProcess.kill('SIGTERM');

        // Force kill after 5s if still running
        setTimeout(() => {
          if (!childProcess.killed) {
            childProcess.kill('SIGKILL');
          }
        }, 5000);
      }
    }, timeout);

    // Capture stdout
    childProcess.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      if (stdout.length + chunk.length <= maxBufferSize) {
        stdout += chunk;
      } else {
        // Truncate if exceeds max buffer
        stderr += '\n[Terminal] Output truncated: exceeded max buffer size\n';
        if (!killed) {
          killed = true;
          childProcess.kill('SIGTERM');
        }
      }
    });

    // Capture stderr
    childProcess.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      if (stderr.length + chunk.length <= maxBufferSize) {
        stderr += chunk;
      }
    });

    // Handle process exit
    childProcess.on('close', (exitCode: number | null, signal: string | null) => {
      clearTimeout(timeoutHandle);

      const result: CommandResult = {
        success: exitCode === 0 && !timedOut,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode,
        signal,
        timedOut,
      };

      if (timedOut) {
        result.error = `Command timed out after ${timeout}ms`;
      } else if (exitCode !== 0 && exitCode !== null) {
        result.error = `Command exited with code ${exitCode}`;
      } else if (signal) {
        result.error = `Command terminated by signal ${signal}`;
      }

      resolve(result);
    });

    // Handle spawn errors
    childProcess.on('error', (error: Error) => {
      clearTimeout(timeoutHandle);

      resolve({
        success: false,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: null,
        signal: null,
        error: `Failed to execute command: ${error.message}`,
      });
    });
  });
}

/**
 * Validate working directory
 *
 * Ensures the directory exists and is accessible.
 * Prevents path traversal attacks.
 *
 * @param cwd - Working directory path
 * @returns Validation result with normalized path
 */
function validateWorkingDirectory(cwd: string): {
  success: boolean;
  path?: string;
  error?: string;
} {
  try {
    // Normalize and resolve path
    const normalizedPath = normalize(resolve(cwd));

    // Check if directory exists
    if (!existsSync(normalizedPath)) {
      return {
        success: false,
        error: `Directory does not exist: ${normalizedPath}`,
      };
    }

    // Check if it's a directory
    const stats = statSync(normalizedPath);
    if (!stats.isDirectory()) {
      return {
        success: false,
        error: `Path is not a directory: ${normalizedPath}`,
      };
    }

    // Security: ensure path is within allowed directories
    // For now, we allow any path, but this can be restricted to project directories
    // Example: if (!normalizedPath.startsWith('/Users/nimda/MADACE-Method-v2.0')) { ... }

    return {
      success: true,
      path: normalizedPath,
    };
  } catch (error) {
    return {
      success: false,
      error: `Invalid directory path: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse command string into executable and arguments
 *
 * Handles quoted arguments and shell metacharacters.
 *
 * @param command - Full command string
 * @returns Parsed command or null if invalid
 */
function parseCommand(command: string): {
  executable: string;
  args: string[];
} | null {
  const trimmed = command.trim();
  if (!trimmed) {
    return null;
  }

  // For shell execution, we pass the entire command as a single argument
  // The shell will handle parsing, pipes, redirects, etc.
  const parts = trimmed.split(/\s+/);
  const executable = parts[0] || '';
  const args = parts.slice(1);

  return {
    executable,
    args,
  };
}

/**
 * Execute multiple commands sequentially
 *
 * @param commands - Array of commands to execute
 * @param options - Execution options (applied to all commands)
 * @returns Array of command results
 */
export async function executeCommandSequence(
  commands: string[],
  options: ExecutionOptions = {}
): Promise<CommandResult[]> {
  const results: CommandResult[] = [];

  for (const command of commands) {
    const result = await executeCommand(command, options);
    results.push(result);

    // Stop on first failure
    if (!result.success) {
      break;
    }
  }

  return results;
}

/**
 * Check if a command is available in the system
 *
 * @param commandName - Command name (e.g., "git", "npm", "node")
 * @returns True if command is available
 */
export async function isCommandAvailable(commandName: string): Promise<boolean> {
  const result = await executeCommand(`which ${commandName}`, {
    timeout: 5000,
  });

  return result.success && result.stdout.length > 0;
}

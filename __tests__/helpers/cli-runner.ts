/**
 * CLI Runner Helper
 *
 * Provides utilities for running CLI commands in tests.
 */

import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { join } from 'path';

export interface CLIResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Run a CLI command and capture output
 *
 * @param args - Command arguments (without 'madace' prefix)
 * @param options - Spawn options
 * @returns Promise with stdout, stderr, and exit code
 */
export async function runCLI(
  args: string[],
  options?: SpawnOptionsWithoutStdio
): Promise<CLIResult> {
  return new Promise((resolve, reject) => {
    const binPath = join(__dirname, '../../bin/madace.ts');
    const child = spawn('npx', ['tsx', binPath, ...args], {
      cwd: join(__dirname, '../..'),
      env: { ...process.env, NODE_ENV: 'test' },
      ...options,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (exitCode) => {
      resolve({
        stdout,
        stderr,
        exitCode: exitCode ?? 0,
      });
    });
  });
}

/**
 * Run a CLI command and expect it to succeed
 *
 * @param args - Command arguments
 * @returns Promise with stdout
 * @throws If exit code is not 0
 */
export async function runCLISuccess(args: string[]): Promise<string> {
  const result = await runCLI(args);
  if (result.exitCode !== 0) {
    throw new Error(
      `CLI command failed with exit code ${result.exitCode}\nStderr: ${result.stderr}`
    );
  }
  return result.stdout;
}

/**
 * Run a CLI command and expect it to fail
 *
 * @param args - Command arguments
 * @returns Promise with stderr
 * @throws If exit code is 0
 */
export async function runCLIFailure(args: string[]): Promise<string> {
  const result = await runCLI(args);
  if (result.exitCode === 0) {
    throw new Error(`CLI command unexpectedly succeeded\nStdout: ${result.stdout}`);
  }
  return result.stderr;
}

/**
 * Parse JSON output from CLI command
 *
 * @param args - Command arguments (must include --json)
 * @returns Parsed JSON object
 */
export async function runCLIJSON<T = any>(args: string[]): Promise<T> {
  const stdout = await runCLISuccess([...args, '--json']);
  return JSON.parse(stdout);
}

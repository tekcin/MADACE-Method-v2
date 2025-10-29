/**
 * REPL Spawner Helper
 *
 * Provides utilities for spawning and interacting with REPL sessions in tests.
 */

import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';
import { EventEmitter } from 'events';

export interface REPLSession extends EventEmitter {
  process: ChildProcess;
  stdin: NodeJS.WritableStream;
  stdout: NodeJS.ReadableStream;
  stderr: NodeJS.ReadableStream;
  exitCode: number | null;
  output: string;

  write(input: string): void;
  waitForOutput(text: string, timeout?: number): Promise<void>;
  waitForExit(timeout?: number): Promise<number>;
  kill(): void;
}

/**
 * Spawn a REPL session for testing
 *
 * @returns REPLSession instance
 */
export function spawnREPL(): REPLSession {
  const binPath = join(__dirname, '../../bin/madace.ts');
  const child = spawn('npx', ['tsx', binPath, 'repl'], {
    cwd: join(__dirname, '../..'),
    env: { ...process.env, NODE_ENV: 'test' },
  });

  let output = '';
  let exitCode: number | null = null;

  const emitter = new EventEmitter() as REPLSession;

  child.stdout?.on('data', (data) => {
    const text = data.toString();
    output += text;
    emitter.emit('data', text);
  });

  child.stderr?.on('data', (data) => {
    const text = data.toString();
    output += text;
    emitter.emit('error-data', text);
  });

  child.on('exit', (code) => {
    exitCode = code;
    emitter.emit('exit', code);
  });

  emitter.process = child;
  emitter.stdin = child.stdin!;
  emitter.stdout = child.stdout!;
  emitter.stderr = child.stderr!;
  emitter.exitCode = exitCode;
  emitter.output = output;

  emitter.write = (input: string) => {
    child.stdin?.write(input);
  };

  emitter.waitForOutput = (text: string, timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for output: "${text}"\nGot: ${output}`));
      }, timeout);

      if (output.includes(text)) {
        clearTimeout(timer);
        resolve();
        return;
      }

      const handler = (data: string) => {
        if (output.includes(text)) {
          clearTimeout(timer);
          emitter.off('data', handler);
          resolve();
        }
      };

      emitter.on('data', handler);
    });
  };

  emitter.waitForExit = (timeout = 5000): Promise<number> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout waiting for REPL to exit'));
      }, timeout);

      if (exitCode !== null) {
        clearTimeout(timer);
        resolve(exitCode);
        return;
      }

      emitter.once('exit', (code) => {
        clearTimeout(timer);
        resolve(code ?? 0);
      });
    });
  };

  emitter.kill = () => {
    child.kill();
  };

  return emitter;
}

/**
 * Create a mock REPL session for unit tests
 *
 * @returns Mock REPL session
 */
export function createMockREPL(): jest.Mocked<REPLSession> {
  const mock = new EventEmitter() as jest.Mocked<REPLSession>;

  mock.process = {} as any;
  mock.stdin = { write: jest.fn() } as any;
  mock.stdout = { on: jest.fn() } as any;
  mock.stderr = { on: jest.fn() } as any;
  mock.exitCode = null;
  mock.output = '';

  mock.write = jest.fn();
  mock.waitForOutput = jest.fn().mockResolvedValue(undefined);
  mock.waitForExit = jest.fn().mockResolvedValue(0);
  mock.kill = jest.fn();

  return mock;
}

/* eslint-disable no-console */
/**
 * CLI Command: madace status
 * STORY-V3-016: Create `madace status` CLI Command
 *
 * Provides context-aware status checking for stories, epics, workflows, and state machine.
 * Auto-detects entity type from input pattern and routes to appropriate provider.
 */

import { Command } from 'commander';
import { getStatusRegistry } from '../../status/registry';
import type { StatusFormat } from '../../status/types';

/**
 * CLI usage examples and help text
 */
const USAGE_EXAMPLES = `
Examples:
  $ madace status                           # State machine overview (default)
  $ madace status STORY-V3-015              # Check specific story status
  $ madace status EPIC-V3-002               # Check epic progress
  $ madace status pm-planning               # Check workflow execution
  $ madace status --format=json             # JSON output format
  $ madace status STORY-001 --format=markdown   # Markdown output
  $ madace status --watch                   # Watch mode (real-time updates)
`;

/**
 * Create CLI command for status checking
 *
 * @returns Command instance configured for status checking
 *
 * @example
 * ```typescript
 * const statusCommand = createStatusCommand();
 * program.addCommand(statusCommand);
 * ```
 */
export function createStatusCommand(): Command {
  const command = new Command('status');

  command
    .description('Check status of stories, epics, workflows, or overall state machine')
    .usage('[entity] [options]')
    .argument(
      '[entity]',
      'Entity ID (STORY-001, EPIC-V3-001, workflow-name) or empty for state overview'
    )
    .option('-f, --format <format>', 'Output format (table, json, markdown)', 'table')
    .option('-w, --watch', 'Watch mode: Update display every 2 seconds (press q to exit)', false)
    .option('-i, --interval <seconds>', 'Watch interval in seconds', '2')
    .addHelpText('after', USAGE_EXAMPLES)
    .action(async (entity: string | undefined, options) => {
      try {
        const format = options.format as StatusFormat;

        // Validate format
        if (!['table', 'json', 'markdown'].includes(format)) {
          console.error(`❌ Invalid format: ${format}`);
          console.error('   Supported formats: table, json, markdown');
          process.exit(1);
        }

        // Non-watch mode (default)
        if (!options.watch) {
          await displayStatus(entity, format);
          return;
        }

        // Watch mode
        const interval = parseInt(options.interval, 10) * 1000;
        if (isNaN(interval) || interval < 1000) {
          console.error('❌ Invalid interval: Must be >= 1 second');
          process.exit(1);
        }

        await startWatchMode(entity, format, interval);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ Error: ${error.message}`);
        } else {
          console.error(`❌ Unknown error: ${String(error)}`);
        }
        process.exit(1);
      }
    });

  return command;
}

/**
 * Display status once (non-watch mode)
 *
 * @param entity - Entity ID or undefined for state machine overview
 * @param format - Output format
 */
async function displayStatus(entity: string | undefined, format: StatusFormat): Promise<void> {
  const registry = getStatusRegistry();

  try {
    // Get formatted status from registry
    const output = await registry.getStatus(entity, format);

    // Display output
    console.log(output);

    // Show help text for first-time users (only in table mode, no entity specified)
    if (!entity && format === 'table') {
      console.log('\n💡 Tip: Use `madace status STORY-ID` to check specific stories');
      console.log('   Example: madace status STORY-V3-015');
    }
  } catch (error) {
    if (error instanceof Error) {
      // Check for common error patterns
      if (error.message.includes('not found')) {
        console.error(`❌ Entity not found: ${entity}`);
        console.error('   Tip: Check the entity ID and try again');
        console.error('   Use `madace status` to see all available entities');
      } else if (error.message.includes('No status provider')) {
        console.error(`❌ Unrecognized entity pattern: ${entity}`);
        console.error('   Supported patterns:');
        console.error('     - Stories: STORY-001, V3-015, TASK-001');
        console.error('     - Epics: EPIC-V3-001, EPIC-MAM');
        console.error('     - Workflows: pm-planning, dev-implementation');
        console.error('     - State machine: (no entity, just `madace status`)');
      } else {
        throw error; // Re-throw unexpected errors
      }
    } else {
      throw error;
    }

    process.exit(1);
  }
}

/**
 * Start watch mode with WebSocket real-time updates
 *
 * @param entity - Entity ID or undefined for state machine overview
 * @param format - Output format
 * @param interval - Fallback polling interval in milliseconds (used if WebSocket fails)
 */
async function startWatchMode(
  entity: string | undefined,
  format: StatusFormat,
  interval: number
): Promise<void> {
  console.log(`\n👁️  Watch mode enabled (WebSocket real-time updates)`);
  console.log('   Fallback: Polling every ${interval / 1000}s if WebSocket unavailable');
  console.log('   Press Ctrl+C to exit\n');
  console.log('━'.repeat(80));

  const registry = getStatusRegistry();
  let isRunning = true;
  let ws: any = null; // WebSocket instance
  let useWebSocket = true; // Flag to switch between WebSocket and polling

  // Display status once immediately
  const displayCurrentStatus = async () => {
    try {
      // Clear screen (ANSI escape code) for table format
      if (format === 'table') {
        process.stdout.write('\x1Bc'); // Clear screen
      }

      // Get and display status
      const output = await registry.getStatus(entity, format);
      const timestamp = new Date().toLocaleTimeString();
      const connectionStatus = ws && ws.readyState === 1 ? '🟢 WebSocket' : '🔴 Polling';

      if (format === 'table') {
        console.log(`Last updated: ${timestamp} | Connection: ${connectionStatus}`);
        console.log('━'.repeat(80));
      }

      console.log(output);

      if (format === 'table') {
        console.log('━'.repeat(80));
        console.log(`Press 'q' or Ctrl+C to exit watch mode`);
      }
    } catch (error) {
      if (isRunning) {
        console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  // Handle Ctrl+C gracefully
  const cleanup = () => {
    isRunning = false;
    if (ws) {
      ws.close();
    }
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    console.log('\n\n✅ Watch mode stopped');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);

  // Handle 'q' key press to exit
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
      // Detect 'q' or Ctrl+C
      if (key.toString() === 'q' || key.toString() === '\u0003') {
        cleanup();
      }
    });
  }

  // Try to connect to WebSocket server
  try {
    // Dynamic import of 'ws' package for Node.js
    const WebSocket = (await import('ws')).default;
    ws = new WebSocket('ws://localhost:3001');

    ws.on('open', () => {
      console.log('[WebSocket] Connected to sync server');
      useWebSocket = true;
      displayCurrentStatus();
    });

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        // Update display on relevant messages
        if (
          message.type === 'state_updated' ||
          message.type === 'workflow_completed' ||
          message.type === 'workflow_started' ||
          message.type === 'workflow_failed'
        ) {
          displayCurrentStatus();
        }
      } catch {
        // Ignore parse errors
      }
    });

    ws.on('error', (error: Error) => {
      console.error('[WebSocket] Connection failed:', error.message);
      console.log('[WebSocket] Falling back to polling mode...');
      useWebSocket = false;
    });

    ws.on('close', () => {
      console.log('[WebSocket] Disconnected, falling back to polling');
      useWebSocket = false;
    });
  } catch {
    console.log('[WebSocket] Not available, using polling mode');
    useWebSocket = false;
  }

  // Display initial status
  await displayCurrentStatus();

  // Fallback polling loop (only runs if WebSocket is not connected)
  while (isRunning) {
    if (!useWebSocket || !ws || ws.readyState !== 1) {
      // WebSocket not available or disconnected, use polling
      await sleep(interval);
      await displayCurrentStatus();
    } else {
      // WebSocket is active, just wait
      await sleep(1000);
    }
  }
}

/**
 * Sleep for specified milliseconds
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

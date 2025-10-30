#!/usr/bin/env node
/**
 * MADACE CLI Entry Point
 * Provides command-line interface for MADACE Method v3.0
 */

import { Command } from 'commander';
import { createAssessScaleCommand } from '../lib/cli/commands/assess-scale';
import {
  createAgentsCommand,
  createConfigCommand,
  createProjectCommand,
  createStateCommand,
  createWorkflowsCommand,
} from '../lib/cli/commands';
import { startREPL } from '../lib/cli/repl';
import { startDashboard } from '../lib/cli/dashboard';
import { chatCommand } from '../lib/cli/commands/chat';
import { registerMemoryCommands } from '../lib/cli/commands/memory';

const program = new Command();

program
  .name('madace')
  .description('MADACE - Methodology for AI-Driven Agile Collaboration Engine')
  .version('3.0.0-alpha');

// Register commands
program.addCommand(createAssessScaleCommand());
program.addCommand(createAgentsCommand());
program.addCommand(createConfigCommand());
program.addCommand(createProjectCommand());
program.addCommand(createStateCommand());
program.addCommand(createWorkflowsCommand());

// REPL command
program
  .command('repl')
  .description('Start interactive REPL mode')
  .action(async () => {
    await startREPL();
  });

// Dashboard command
program
  .command('dashboard')
  .description('Launch terminal dashboard (TUI)')
  .action(async () => {
    await startDashboard();
  });

// Chat command
program
  .command('chat [agent-name]')
  .description('Start interactive chat session with an AI agent')
  .action(async (agentName?: string) => {
    await chatCommand(agentName);
  });

// Memory commands
registerMemoryCommands(program);

// Parse command line arguments
program.parse(process.argv);

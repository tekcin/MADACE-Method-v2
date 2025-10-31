/* eslint-disable no-console */
/**
 * REPL Command Handlers
 *
 * Implements all REPL commands for MADACE v3.0
 */

import chalk from 'chalk';
import { listAgents } from '@/lib/services/agent-service';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * REPL Session State
 */
interface REPLSession {
  selectedAgent: string | null;
  currentWorkflow: string | null;
  running: boolean;
}

/**
 * Command Handler Interface
 */
export interface CommandHandler {
  name: string;
  description: string;
  usage: string;
  execute(args: string[]): Promise<void>;
}

/**
 * Help Command
 */
class HelpCommand implements CommandHandler {
  name = 'help';
  description = 'Show available commands';
  usage = 'help [command]';

  private commands: Map<string, CommandHandler>;

  constructor(commands: Map<string, CommandHandler>) {
    this.commands = commands;
  }

  async execute(args: string[]): Promise<void> {
    if (args.length > 0) {
      // Show help for specific command
      const cmdName = args[0]!.toLowerCase();
      const cmd = this.commands.get(cmdName);

      if (cmd) {
        console.log(chalk.bold.cyan(`\n${cmd.name}`));
        console.log(chalk.gray(`  ${cmd.description}`));
        console.log(chalk.yellow(`  Usage: ${cmd.usage}\n`));
      } else {
        console.log(chalk.red(`\n❌ Unknown command: "${cmdName}"\n`));
      }
      return;
    }

    // Show all commands
    console.log(chalk.bold.cyan('\n📚 Available Commands:\n'));

    const commandList = Array.from(this.commands.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    for (const cmd of commandList) {
      console.log(chalk.yellow(`  ${cmd.name.padEnd(15)}`), chalk.gray(cmd.description));
    }

    console.log();
    console.log(chalk.gray('  Type "help <command>" for detailed usage.\n'));
  }
}

/**
 * Agents Command
 */
class AgentsCommand implements CommandHandler {
  name = 'agents';
  description = 'List all available agents';
  usage = 'agents [--module <mam|mab|cis>]';

  async execute(args: string[]): Promise<void> {
    try {
      // Parse arguments
      let moduleFilter: string | undefined;
      if (args.includes('--module') || args.includes('-m')) {
        const moduleIndex = args.findIndex((arg) => arg === '--module' || arg === '-m');
        moduleFilter = args[moduleIndex + 1];
      }

      // Fetch agents from database
      const agents = await listAgents(moduleFilter ? { module: moduleFilter } : {});

      if (agents.length === 0) {
        console.log(chalk.yellow('\n⚠️  No agents found.\n'));
        return;
      }

      // Display agents
      console.log(chalk.bold.cyan(`\n🤖 Agents (${agents.length}):\n`));

      for (const agent of agents) {
        const icon = agent.icon || '🤖';
        const nameDisplay = chalk.bold.yellow(agent.name);
        const titleDisplay = chalk.white(agent.title);
        const moduleDisplay = chalk.gray(`[${agent.module}]`);
        const versionDisplay = chalk.dim(`v${agent.version}`);

        console.log(
          `  ${icon} ${nameDisplay} - ${titleDisplay} ${moduleDisplay} ${versionDisplay}`
        );
      }

      console.log();
    } catch (error) {
      console.log(chalk.red('\n❌ Failed to fetch agents:'));
      if (error instanceof Error) {
        console.log(chalk.red(`   ${error.message}\n`));
      }
    }
  }
}

/**
 * Workflows Command
 */
class WorkflowsCommand implements CommandHandler {
  name = 'workflows';
  description = 'List all available workflows';
  usage = 'workflows';

  async execute(_args: string[]): Promise<void> {
    console.log(chalk.yellow('\n⚠️  Workflow system not yet implemented (Milestone 3.3).\n'));
    console.log(chalk.gray('   This feature will be available in v3.3-alpha.\n'));
  }
}

/**
 * Status Command
 */
class StatusCommand implements CommandHandler {
  name = 'status';
  description = 'Show project status and state machine';
  usage = 'status';

  async execute(_args: string[]): Promise<void> {
    try {
      // Read workflow status from file
      const statusFile = resolve(process.cwd(), 'docs/workflow-status.md');
      const content = readFileSync(statusFile, 'utf-8');

      // Extract current phase
      const phaseMatch = content.match(/\*\*Current Phase:\*\*\s*(.+)/);
      const phase = phaseMatch ? phaseMatch[1] : 'Unknown';

      // Extract milestone stats
      const completedMatch = content.match(
        /Total Completed:\s*(\d+)\s*stories\s*\|\s*(\d+)\s*points/
      );
      const remainingMatch = content.match(
        /Total Remaining:\s*(\d+)\s*stories\s*\|\s*(\d+)\s*points/
      );

      const completedStories = completedMatch ? completedMatch[1] : '0';
      const completedPoints = completedMatch ? completedMatch[2] : '0';
      const remainingStories = remainingMatch ? remainingMatch[1] : '0';
      const remainingPoints = remainingMatch ? remainingMatch[2] : '0';

      // Display status
      console.log(chalk.bold.cyan('\n📊 Project Status:\n'));
      console.log(chalk.white(`  Phase:      ${phase}`));
      console.log(
        chalk.green(`  Completed:  ${completedStories} stories | ${completedPoints} points`)
      );
      console.log(
        chalk.yellow(`  Remaining:  ${remainingStories} stories | ${remainingPoints} points`)
      );
      console.log();
    } catch (error) {
      console.log(chalk.red('\n❌ Failed to read project status:'));
      if (error instanceof Error) {
        console.log(chalk.red(`   ${error.message}\n`));
      }
    }
  }
}

/**
 * Version Command
 */
class VersionCommand implements CommandHandler {
  name = 'version';
  description = 'Show MADACE version';
  usage = 'version';

  async execute(_args: string[]): Promise<void> {
    try {
      // Read package.json
      const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'));

      console.log(chalk.bold.cyan('\n🚀 MADACE Method v3.0\n'));
      console.log(chalk.white(`  Version:     ${packageJson.version}`));
      console.log(chalk.gray(`  Node.js:     ${process.version}`));
      console.log(chalk.gray(`  Platform:    ${process.platform}`));
      console.log();
    } catch (error) {
      console.log(chalk.red('\n❌ Failed to read version:'));
      if (error instanceof Error) {
        console.log(chalk.red(`   ${error.message}\n`));
      }
    }
  }
}

/**
 * Clear Command
 */
class ClearCommand implements CommandHandler {
  name = 'clear';
  description = 'Clear the screen';
  usage = 'clear';

  async execute(_args: string[]): Promise<void> {
    console.clear();
  }
}

/**
 * Command Registry
 */
export class CommandRegistry {
  private commands: Map<string, CommandHandler>;

  constructor(_session: REPLSession) {
    this.commands = new Map();

    // Create command instances
    const commands: CommandHandler[] = [
      new AgentsCommand(),
      new WorkflowsCommand(),
      new StatusCommand(),
      new VersionCommand(),
      new ClearCommand(),
    ];

    // Register commands
    for (const cmd of commands) {
      this.commands.set(cmd.name, cmd);
    }

    // Add help command (needs access to all commands)
    this.commands.set('help', new HelpCommand(this.commands));

    // Add aliases
    this.commands.set('?', this.commands.get('help')!);
    this.commands.set('cls', this.commands.get('clear')!);
  }

  /**
   * Get command handler by name
   */
  getHandler(name: string): CommandHandler | undefined {
    return this.commands.get(name.toLowerCase());
  }

  /**
   * Get all registered commands
   */
  getAllCommands(): CommandHandler[] {
    return Array.from(this.commands.values());
  }
}

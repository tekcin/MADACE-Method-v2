/**
 * MADACE REPL (Read-Eval-Print Loop)
 *
 * Interactive command-line interface for MADACE Method v3.0
 */

import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import chalk from 'chalk';
import { CommandRegistry } from './commands/repl-commands';
import { CompletionEngine } from './completion';
import { HistoryManager } from './history';
import { formatMultilineInput } from './syntax-highlight';

// Register autocomplete prompt
inquirer.registerPrompt('autocomplete', autocompletePrompt);

/**
 * REPL Session State
 */
interface REPLSession {
  selectedAgent: string | null;
  currentWorkflow: string | null;
  running: boolean;
  multilineMode: boolean;
  multilineBuffer: string[];
}

/**
 * REPL Engine Class
 */
export class REPLEngine {
  private session: REPLSession;
  private commandRegistry: CommandRegistry;
  private completionEngine: CompletionEngine;
  private historyManager: HistoryManager;

  constructor() {
    this.session = {
      selectedAgent: null,
      currentWorkflow: null,
      running: true,
      multilineMode: false,
      multilineBuffer: [],
    };
    this.commandRegistry = new CommandRegistry(this.session);
    this.completionEngine = new CompletionEngine(this.commandRegistry);
    this.historyManager = new HistoryManager();
  }

  /**
   * Display welcome banner
   */
  private displayWelcome(): void {
    console.log(
      chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════════╗')
    );
    console.log(
      chalk.bold.cyan('║') +
        chalk.bold.white('  MADACE Method v3.0 - Interactive REPL                     ') +
        chalk.bold.cyan('║')
    );
    console.log(
      chalk.bold.cyan('╚════════════════════════════════════════════════════════════════╝\n')
    );
    console.log(chalk.gray('Type "help" for available commands, or "/exit" to quit.'));
    console.log(chalk.gray('Use ↑↓ arrows for history, Tab to autocomplete.'));
    console.log(chalk.gray('Multi-line: End line with \\ or type "/multi" for explicit mode.\n'));
  }

  /**
   * Get prompt string with session context
   */
  private getPrompt(): string {
    let prompt = 'madace';

    if (this.session.selectedAgent) {
      prompt += chalk.yellow(`[${this.session.selectedAgent}]`);
    }

    if (this.session.currentWorkflow) {
      prompt += chalk.blue(`(${this.session.currentWorkflow})`);
    }

    if (this.session.multilineMode) {
      prompt += chalk.magenta('[multi]');
    }

    return prompt + chalk.gray('> ');
  }

  /**
   * Parse user input into command and args
   */
  private parseInput(input: string): { command: string; args: string[] } {
    const trimmed = input.trim();

    // Handle empty input
    if (!trimmed) {
      return { command: '', args: [] };
    }

    // Handle exit commands
    if (trimmed === '/exit' || trimmed === 'exit' || trimmed === 'quit') {
      return { command: 'exit', args: [] };
    }

    // Split by whitespace
    const parts = trimmed.split(/\s+/);
    const command = parts[0]!.toLowerCase();
    const args = parts.slice(1);

    return { command, args };
  }

  /**
   * Check if input ends with continuation character
   */
  private hasContinuation(input: string): boolean {
    return input.trimEnd().endsWith('\\');
  }

  /**
   * Remove continuation character from input
   */
  private removeContinuation(input: string): string {
    return input.trimEnd().slice(0, -1);
  }

  /**
   * Handle multi-line input mode
   */
  private async handleMultilineInput(initialInput: string): Promise<string> {
    // Start multi-line mode
    this.session.multilineMode = true;
    this.session.multilineBuffer = [this.removeContinuation(initialInput)];

    console.log(chalk.gray('Multi-line mode: Enter lines, end with empty line or line without \\'));

    while (this.session.multilineMode) {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'line',
            message: chalk.gray(`${this.session.multilineBuffer.length + 1}> `),
            prefix: '',
          },
        ]);

        const line = answers.line;

        // Empty line ends multi-line mode
        if (!line.trim()) {
          this.session.multilineMode = false;
          break;
        }

        // Check for continuation
        if (this.hasContinuation(line)) {
          this.session.multilineBuffer.push(this.removeContinuation(line));
        } else {
          this.session.multilineBuffer.push(line);
          this.session.multilineMode = false;
        }
      } catch (error) {
        // Ctrl+C or error - exit multi-line mode
        this.session.multilineMode = false;
        this.session.multilineBuffer = [];
        throw error;
      }
    }

    // Combine lines and show highlighted preview
    const combinedInput = this.session.multilineBuffer.join('\n');
    console.log(formatMultilineInput(this.session.multilineBuffer));

    // Reset buffer
    this.session.multilineBuffer = [];

    return combinedInput;
  }

  /**
   * Handle explicit multi-line mode (/multi command)
   */
  private async handleExplicitMultiline(): Promise<string> {
    console.log(chalk.cyan('\n┌─ Multi-line Input Mode ────────────────────────────────────'));
    console.log(chalk.gray('│ Enter your content (YAML, JSON, etc.)'));
    console.log(chalk.gray('│ Type "/end" on a new line to finish'));
    console.log(chalk.cyan('└────────────────────────────────────────────────────────────\n'));

    this.session.multilineMode = true;
    this.session.multilineBuffer = [];

    while (this.session.multilineMode) {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'line',
            message: chalk.gray(`${this.session.multilineBuffer.length + 1}> `),
            prefix: '',
          },
        ]);

        const line = answers.line;

        // /end command exits multi-line mode
        if (line.trim() === '/end') {
          this.session.multilineMode = false;
          break;
        }

        this.session.multilineBuffer.push(line);
      } catch (error) {
        // Ctrl+C or error - exit multi-line mode
        this.session.multilineMode = false;
        this.session.multilineBuffer = [];
        throw error;
      }
    }

    // Combine lines and show highlighted preview
    const combinedInput = this.session.multilineBuffer.join('\n');
    if (this.session.multilineBuffer.length > 0) {
      console.log(formatMultilineInput(this.session.multilineBuffer));
    }

    // Reset buffer
    this.session.multilineBuffer = [];

    return combinedInput;
  }

  /**
   * Execute a command
   */
  private async executeCommand(command: string, args: string[]): Promise<void> {
    try {
      // Handle empty command
      if (!command) {
        return;
      }

      // Handle exit
      if (command === 'exit') {
        this.session.running = false;
        console.log(chalk.green('\nGoodbye! 👋\n'));
        return;
      }

      // Get command handler
      const handler = this.commandRegistry.getHandler(command);

      if (!handler) {
        console.log(chalk.red(`\n❌ Unknown command: "${command}"`));
        console.log(chalk.gray('Type "help" for available commands.\n'));
        return;
      }

      // Execute command handler
      await handler.execute(args);
      console.log(); // Empty line after command output
    } catch (error) {
      console.log(chalk.red('\n❌ Command error:'));
      if (error instanceof Error) {
        console.log(chalk.red(`   ${error.message}\n`));
      } else {
        console.log(chalk.red(`   ${String(error)}\n`));
      }
    }
  }

  /**
   * Main REPL loop
   */
  async start(): Promise<void> {
    // Load command history
    await this.historyManager.load();

    this.displayWelcome();

    while (this.session.running) {
      try {
        // Get history and update completion engine
        const history = this.historyManager.getHistory();
        this.completionEngine.setHistory(history);

        // Prompt for input with autocomplete
        const answers = await inquirer.prompt([
          {
            type: 'autocomplete',
            name: 'command',
            message: this.getPrompt(),
            prefix: '',
            source: async (_answersSoFar: unknown, input: string | undefined) => {
              const completions = await this.completionEngine.getCompletions(input || '');

              // If no completions, return empty to allow free typing
              if (completions.length === 0) {
                return [];
              }

              // Format completions for display
              return completions.map((completion) => ({
                name: this.completionEngine.formatCompletion(completion),
                value: completion.value,
              }));
            },
            suggestOnly: true, // Allow typing commands not in the list
            emptyText: 'No suggestions (type to continue)',
          },
        ]);

        let userInput = answers.command;

        // Handle /multi command (explicit multi-line mode)
        if (userInput.trim() === '/multi') {
          userInput = await this.handleExplicitMultiline();
        }
        // Handle backslash continuation
        else if (this.hasContinuation(userInput)) {
          userInput = await this.handleMultilineInput(userInput);
        }

        // Add to history (skip empty and /multi commands)
        if (userInput.trim() && userInput.trim() !== '/multi') {
          await this.historyManager.add(userInput);
        }

        // Parse and execute command
        const { command, args } = this.parseInput(userInput);
        await this.executeCommand(command, args);
      } catch (error) {
        // Handle Ctrl+C gracefully
        if (error && typeof error === 'object' && 'isTtyError' in error) {
          console.log(chalk.yellow('\n\nUse "/exit" or type "exit" to quit.\n'));
          continue;
        }

        // Handle other errors
        console.log(chalk.red('\n❌ REPL error:'));
        if (error instanceof Error) {
          console.log(chalk.red(`   ${error.message}\n`));
        }
        break;
      }
    }
  }

  /**
   * Stop the REPL
   */
  stop(): void {
    this.session.running = false;
  }
}

/**
 * Create and start REPL
 */
export async function startREPL(): Promise<void> {
  const repl = new REPLEngine();
  await repl.start();
}

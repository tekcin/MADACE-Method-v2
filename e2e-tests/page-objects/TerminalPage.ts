/**
 * Page Object Model for Integrated Terminal
 *
 * Strict TypeScript implementation for terminal interactions
 */

import { Page, Locator } from '@playwright/test';

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTime: number;
}

export interface TerminalConfig {
  height?: number;
  fontSize?: number;
  theme?: 'dark' | 'light';
}

export class TerminalPage {
  readonly page: Page;
  private readonly terminalContainer: Locator;
  private readonly terminalInput: Locator;
  private readonly terminalOutput: Locator;
  private readonly resizeHandle: Locator;
  private readonly xtermContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.terminalContainer = page.locator('[data-testid="terminal"]');
    this.terminalInput = page.locator('[data-testid="terminal-input"]');
    this.terminalOutput = page.locator('[data-testid="terminal-output"]');
    this.resizeHandle = page.locator('[data-testid="terminal-resize-handle"]');
    this.xtermContainer = page.locator('.xterm');
  }

  /**
   * Toggle terminal visibility using keyboard shortcut
   */
  async toggle(): Promise<void> {
    await this.page.keyboard.press('Control+`');
    await this.page.waitForTimeout(500);
  }

  /**
   * Show terminal
   */
  async show(): Promise<void> {
    const visible = await this.isVisible();
    if (!visible) {
      await this.toggle();
    }
  }

  /**
   * Hide terminal
   */
  async hide(): Promise<void> {
    const visible = await this.isVisible();
    if (visible) {
      await this.toggle();
    }
  }

  /**
   * Check if terminal is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      await this.terminalContainer.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute command and wait for output
   */
  async executeCommand(command: string, timeout = 5000): Promise<string> {
    await this.show();
    await this.terminalInput.fill(command);
    await this.terminalInput.press('Enter');
    await this.page.waitForTimeout(timeout);
    return await this.getOutput();
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeCommands(commands: string[]): Promise<string[]> {
    const results: string[] = [];

    for (const command of commands) {
      const output = await this.executeCommand(command);
      results.push(output);
    }

    return results;
  }

  /**
   * Get terminal output text
   */
  async getOutput(): Promise<string> {
    const text = await this.terminalOutput.textContent();
    if (text === null) {
      throw new Error('Terminal output is null');
    }
    return text.trim();
  }

  /**
   * Clear terminal output
   */
  async clear(): Promise<void> {
    await this.executeCommand('clear', 1000);
  }

  /**
   * Type text into terminal input
   */
  async type(text: string): Promise<void> {
    await this.terminalInput.fill(text);
  }

  /**
   * Press Enter key
   */
  async pressEnter(): Promise<void> {
    await this.terminalInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate command history (up arrow)
   */
  async navigateHistoryUp(): Promise<void> {
    await this.terminalInput.press('ArrowUp');
    await this.page.waitForTimeout(300);
  }

  /**
   * Navigate command history (down arrow)
   */
  async navigateHistoryDown(): Promise<void> {
    await this.terminalInput.press('ArrowDown');
    await this.page.waitForTimeout(300);
  }

  /**
   * Get current input value
   */
  async getInputValue(): Promise<string> {
    const value = await this.terminalInput.inputValue();
    return value.trim();
  }

  /**
   * Check if command output contains text
   */
  async outputContains(text: string): Promise<boolean> {
    const output = await this.getOutput();
    return output.includes(text);
  }

  /**
   * Wait for specific output text
   */
  async waitForOutput(text: string, timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      ({ outputLocator, expectedText }) => {
        const element = document.querySelector(outputLocator);
        return element?.textContent?.includes(expectedText) ?? false;
      },
      { outputLocator: '[data-testid="terminal-output"]', expectedText: text },
      { timeout }
    );
  }

  /**
   * Resize terminal by dragging handle
   */
  async resize(deltaY: number): Promise<void> {
    const handleBounds = await this.resizeHandle.boundingBox();
    if (!handleBounds) {
      throw new Error('Resize handle not found');
    }

    const startX = handleBounds.x + handleBounds.width / 2;
    const startY = handleBounds.y + handleBounds.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX, startY + deltaY);
    await this.page.mouse.up();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get terminal height
   */
  async getHeight(): Promise<number> {
    const bounds = await this.terminalContainer.boundingBox();
    if (!bounds) {
      throw new Error('Terminal bounds not found');
    }
    return bounds.height;
  }

  /**
   * Get terminal width
   */
  async getWidth(): Promise<number> {
    const bounds = await this.terminalContainer.boundingBox();
    if (!bounds) {
      throw new Error('Terminal bounds not found');
    }
    return bounds.width;
  }

  /**
   * Check if XTerm.js is properly loaded
   */
  async isXTermLoaded(): Promise<boolean> {
    try {
      await this.xtermContainer.waitFor({ state: 'visible', timeout: 1000 });
      const viewport = this.page.locator('.xterm-viewport');
      await viewport.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get XTerm background color
   */
  async getBackgroundColor(): Promise<string> {
    return await this.terminalContainer.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
  }

  /**
   * Get XTerm text color
   */
  async getTextColor(): Promise<string> {
    const xtermRows = this.page.locator('.xterm-rows');
    return await xtermRows.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
  }

  /**
   * Focus terminal input
   */
  async focus(): Promise<void> {
    await this.terminalInput.focus();
    await this.page.waitForTimeout(100);
  }

  /**
   * Check if terminal input has focus
   */
  async isFocused(): Promise<boolean> {
    return await this.terminalInput.evaluate((el) => {
      return document.activeElement === el;
    });
  }

  /**
   * Wait for terminal to be ready
   */
  async waitForReady(): Promise<void> {
    await this.show();
    await this.terminalInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.isXTermLoaded();
  }

  /**
   * Get command history
   */
  async getCommandHistory(): Promise<string[]> {
    const history: string[] = [];
    let previousCommand = '';

    // Navigate up through history until we reach the top
    for (let i = 0; i < 10; i++) {
      // Limit to 10 commands
      await this.navigateHistoryUp();
      const command = await this.getInputValue();

      if (command === previousCommand || command === '') {
        break;
      }

      history.unshift(command);
      previousCommand = command;
    }

    // Clear input after reading history
    await this.terminalInput.fill('');

    return history;
  }

  /**
   * Take screenshot of terminal
   */
  async screenshot(name: string): Promise<Buffer> {
    return await this.terminalContainer.screenshot({
      path: `test-results/screenshots/terminal-${name}.png`,
    });
  }
}

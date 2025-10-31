/**
 * Page Object Model for IDE Page
 *
 * Strict TypeScript implementation with full type safety
 */

import { Page, Locator } from '@playwright/test';
import { MonacoEditorPage } from './MonacoEditorPage';
import { TerminalPage } from './TerminalPage';
import { FileExplorerPage } from './FileExplorerPage';

export interface IDEConfig {
  baseURL?: string;
  timeout?: number;
}

export interface TabInfo {
  id: string;
  name: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
}

export class IDEPage {
  readonly page: Page;
  readonly editor: MonacoEditorPage;
  readonly terminal: TerminalPage;
  readonly fileExplorer: FileExplorerPage;

  // Locators with strict typing
  private readonly ideContainer: Locator;
  private readonly tabBar: Locator;
  private readonly toolBar: Locator;
  private readonly statusBar: Locator;

  constructor(page: Page, config?: IDEConfig) {
    this.page = page;
    this.editor = new MonacoEditorPage(page);
    this.terminal = new TerminalPage(page);
    this.fileExplorer = new FileExplorerPage(page);

    // Initialize locators
    this.ideContainer = page.locator('[data-testid="ide-container"]');
    this.tabBar = page.locator('[data-testid="tab-bar"]');
    this.toolBar = page.locator('[data-testid="toolbar"]');
    this.statusBar = page.locator('[data-testid="status-bar"]');
  }

  /**
   * Navigate to IDE page
   */
  async goto(): Promise<void> {
    await this.page.goto('/ide', { waitUntil: 'networkidle' });
    await this.waitForLoad();
  }

  /**
   * Wait for IDE to fully load
   */
  async waitForLoad(): Promise<void> {
    await this.ideContainer.waitFor({ state: 'visible', timeout: 10000 });
    await this.editor.waitForLoad();
  }

  /**
   * Get all open tabs
   */
  async getTabs(): Promise<TabInfo[]> {
    const tabs = await this.page.locator('[data-testid="tab"]').all();
    const tabInfos: TabInfo[] = [];

    for (const tab of tabs) {
      const id = await this.getAttribute(tab, 'data-tab-id');
      const name = await this.getTextContent(tab.locator('[data-testid="tab-name"]'));
      const language = await this.getAttribute(tab, 'data-language');
      const isDirty = (await tab.getAttribute('data-dirty')) === 'true';
      const isActive = (await tab.getAttribute('data-active')) === 'true';

      tabInfos.push({ id, name, language, isDirty, isActive });
    }

    return tabInfos;
  }

  /**
   * Open a new tab
   */
  async openTab(fileName: string): Promise<void> {
    const fileSelect = this.page.locator('#file-select');
    await fileSelect.selectOption(fileName);
    await this.page.waitForTimeout(500); // Wait for tab to render
  }

  /**
   * Close a tab by index
   */
  async closeTab(index: number): Promise<void> {
    const closeButto = this.page.locator('[data-testid="tab-close"]').nth(index);
    await closeButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Close active tab
   */
  async closeActiveTab(): Promise<void> {
    const activeTab = this.page.locator('[data-testid="tab"][data-active="true"]');
    const closeButton = activeTab.locator('[data-testid="tab-close"]');
    await closeButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Switch to tab by index
   */
  async switchToTab(index: number): Promise<void> {
    const tab = this.page.locator('[data-testid="tab"]').nth(index);
    await tab.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Switch to tab by name
   */
  async switchToTabByName(name: string): Promise<void> {
    const tab = this.page.locator(`[data-testid="tab"]:has-text("${name}")`);
    await tab.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get active tab info
   */
  async getActiveTab(): Promise<TabInfo | null> {
    const tabs = await this.getTabs();
    return tabs.find((tab) => tab.isActive) ?? null;
  }

  /**
   * Check if tab is dirty (has unsaved changes)
   */
  async isTabDirty(index: number): Promise<boolean> {
    const tab = this.page.locator('[data-testid="tab"]').nth(index);
    const isDirty = await tab.getAttribute('data-dirty');
    return isDirty === 'true';
  }

  /**
   * Save current file
   */
  async saveFile(): Promise<void> {
    await this.page.keyboard.press('Control+S');
    await this.page.waitForTimeout(500);
  }

  /**
   * Toggle terminal visibility
   */
  async toggleTerminal(): Promise<void> {
    await this.terminal.toggle();
  }

  /**
   * Check if terminal is visible
   */
  async isTerminalVisible(): Promise<boolean> {
    return await this.terminal.isVisible();
  }

  /**
   * Get status bar text
   */
  async getStatusText(): Promise<string> {
    return await this.getTextContent(this.statusBar);
  }

  /**
   * Wait for status bar to show specific text
   */
  async waitForStatus(text: string, timeout = 5000): Promise<void> {
    await this.statusBar.locator(`text=${text}`).waitFor({
      state: 'visible',
      timeout,
    });
  }

  /**
   * Take screenshot of IDE
   */
  async screenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `test-results/screenshots/ide-${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Helper: Get text content safely
   */
  private async getTextContent(locator: Locator): Promise<string> {
    const text = await locator.textContent();
    if (text === null) {
      throw new Error('Text content is null');
    }
    return text.trim();
  }

  /**
   * Helper: Get attribute safely
   */
  private async getAttribute(locator: Locator, name: string): Promise<string> {
    const attr = await locator.getAttribute(name);
    if (attr === null) {
      throw new Error(`Attribute "${name}" is null`);
    }
    return attr;
  }
}

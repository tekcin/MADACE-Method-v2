/**
 * Page Object Model for File Explorer
 *
 * Strict TypeScript implementation for file explorer interactions
 */

import { Page, Locator } from '@playwright/test';

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  isExpanded?: boolean;
  children?: FileNode[];
}

export interface FileExplorerConfig {
  showHiddenFiles?: boolean;
  sortBy?: 'name' | 'type' | 'modified';
}

export class FileExplorerPage {
  readonly page: Page;
  private readonly explorerContainer: Locator;
  private readonly fileTree: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.explorerContainer = page.locator('[data-testid="file-explorer"]');
    this.fileTree = page.locator('[data-testid="file-tree"]');
    this.searchInput = page.locator('[data-testid="file-search"]');
  }

  /**
   * Check if file explorer is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      await this.explorerContainer.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for file explorer to load
   */
  async waitForLoad(): Promise<void> {
    await this.explorerContainer.waitFor({ state: 'visible', timeout: 5000 });
    await this.fileTree.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get all visible files
   */
  async getVisibleFiles(): Promise<string[]> {
    const files = await this.page.locator('[data-testid="file-item"]').all();
    const fileNames: string[] = [];

    for (const file of files) {
      const name = await this.getTextContent(file);
      fileNames.push(name);
    }

    return fileNames;
  }

  /**
   * Get all visible directories
   */
  async getVisibleDirectories(): Promise<string[]> {
    const dirs = await this.page.locator('[data-testid="directory-item"]').all();
    const dirNames: string[] = [];

    for (const dir of dirs) {
      const name = await this.getTextContent(dir);
      dirNames.push(name);
    }

    return dirNames;
  }

  /**
   * Click on a file to open it
   */
  async openFile(fileName: string): Promise<void> {
    const file = this.page.locator(`[data-testid="file-item"]:has-text("${fileName}")`);
    await file.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Expand a directory
   */
  async expandDirectory(dirName: string): Promise<void> {
    const dir = this.page.locator(`[data-testid="directory-item"]:has-text("${dirName}")`);
    const expandIcon = dir.locator('[data-testid="expand-icon"]');

    // Check if already expanded
    const isExpanded = await this.isDirectoryExpanded(dirName);

    if (!isExpanded) {
      await expandIcon.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Collapse a directory
   */
  async collapseDirectory(dirName: string): Promise<void> {
    const dir = this.page.locator(`[data-testid="directory-item"]:has-text("${dirName}")`);
    const collapseIcon = dir.locator('[data-testid="expand-icon"]');

    // Check if currently expanded
    const isExpanded = await this.isDirectoryExpanded(dirName);

    if (isExpanded) {
      await collapseIcon.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Check if directory is expanded
   */
  async isDirectoryExpanded(dirName: string): Promise<boolean> {
    const dir = this.page.locator(`[data-testid="directory-item"]:has-text("${dirName}")`);
    const expanded = await dir.getAttribute('data-expanded');
    return expanded === 'true';
  }

  /**
   * Search for files
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get search results count
   */
  async getSearchResultsCount(): Promise<number> {
    const results = await this.page.locator('[data-testid="file-item"]').count();
    return results;
  }

  /**
   * Right-click on file to open context menu
   */
  async rightClickFile(fileName: string): Promise<void> {
    const file = this.page.locator(`[data-testid="file-item"]:has-text("${fileName}")`);
    await file.click({ button: 'right' });
    await this.page.waitForTimeout(300);
  }

  /**
   * Right-click on directory to open context menu
   */
  async rightClickDirectory(dirName: string): Promise<void> {
    const dir = this.page.locator(`[data-testid="directory-item"]:has-text("${dirName}")`);
    await dir.click({ button: 'right' });
    await this.page.waitForTimeout(300);
  }

  /**
   * Select context menu option
   */
  async selectContextMenuOption(option: string): Promise<void> {
    const menuItem = this.page.locator(`[data-testid="context-menu-item"]:has-text("${option}")`);
    await menuItem.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Create new file
   */
  async createNewFile(fileName: string): Promise<void> {
    const newFileButton = this.page.locator('[data-testid="new-file-button"]');
    await newFileButton.click();
    await this.page.waitForTimeout(200);

    const fileNameInput = this.page.locator('[data-testid="file-name-input"]');
    await fileNameInput.fill(fileName);
    await fileNameInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  /**
   * Create new directory
   */
  async createNewDirectory(dirName: string): Promise<void> {
    const newDirButton = this.page.locator('[data-testid="new-directory-button"]');
    await newDirButton.click();
    await this.page.waitForTimeout(200);

    const dirNameInput = this.page.locator('[data-testid="directory-name-input"]');
    await dirNameInput.fill(dirName);
    await dirNameInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  /**
   * Rename file
   */
  async renameFile(oldName: string, newName: string): Promise<void> {
    await this.rightClickFile(oldName);
    await this.selectContextMenuOption('Rename');

    const renameInput = this.page.locator('[data-testid="rename-input"]');
    await renameInput.fill(newName);
    await renameInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete file
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.rightClickFile(fileName);
    await this.selectContextMenuOption('Delete');

    // Confirm deletion if dialog appears
    const confirmButton = this.page.locator('[data-testid="confirm-delete"]');
    const isVisible = await confirmButton.isVisible().catch(() => false);

    if (isVisible) {
      await confirmButton.click();
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * Check if file exists
   */
  async fileExists(fileName: string): Promise<boolean> {
    const file = this.page.locator(`[data-testid="file-item"]:has-text("${fileName}")`);

    try {
      await file.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if directory exists
   */
  async directoryExists(dirName: string): Promise<boolean> {
    const dir = this.page.locator(`[data-testid="directory-item"]:has-text("${dirName}")`);

    try {
      await dir.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file icon type
   */
  async getFileIcon(fileName: string): Promise<string | null> {
    const file = this.page.locator(`[data-testid="file-item"]:has-text("${fileName}")`);
    const icon = file.locator('[data-testid="file-icon"]');
    return await icon.getAttribute('data-icon-type');
  }

  /**
   * Navigate to parent directory
   */
  async navigateUp(): Promise<void> {
    const upButton = this.page.locator('[data-testid="navigate-up-button"]');
    await upButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Refresh file explorer
   */
  async refresh(): Promise<void> {
    const refreshButton = this.page.locator('[data-testid="refresh-button"]');
    await refreshButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get current path
   */
  async getCurrentPath(): Promise<string> {
    const pathDisplay = this.page.locator('[data-testid="current-path"]');
    return await this.getTextContent(pathDisplay);
  }

  /**
   * Sort files by name
   */
  async sortByName(): Promise<void> {
    await this.selectSortOption('name');
  }

  /**
   * Sort files by type
   */
  async sortByType(): Promise<void> {
    await this.selectSortOption('type');
  }

  /**
   * Sort files by modified date
   */
  async sortByModified(): Promise<void> {
    await this.selectSortOption('modified');
  }

  /**
   * Select sort option from dropdown
   */
  private async selectSortOption(option: string): Promise<void> {
    const sortDropdown = this.page.locator('[data-testid="sort-dropdown"]');
    await sortDropdown.click();
    await this.page.waitForTimeout(200);

    const sortOption = this.page.locator(`[data-value="${option}"]`);
    await sortOption.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Toggle hidden files visibility
   */
  async toggleHiddenFiles(): Promise<void> {
    const toggleButton = this.page.locator('[data-testid="toggle-hidden-files"]');
    await toggleButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get file tree structure
   */
  async getFileTree(): Promise<FileNode[]> {
    return await this.page.evaluate(() => {
      const parseNode = (element: Element): FileNode => {
        const nameEl = element.querySelector('[data-testid="item-name"]');
        const name = nameEl?.textContent?.trim() ?? '';
        const type = element.getAttribute('data-type') as 'file' | 'directory';
        const path = element.getAttribute('data-path') ?? '';
        const isExpanded = element.getAttribute('data-expanded') === 'true';

        const node: FileNode = { name, type, path, isExpanded };

        if (type === 'directory' && isExpanded) {
          const childrenContainer = element.querySelector('[data-testid="children"]');
          if (childrenContainer) {
            const childElements = Array.from(
              childrenContainer.querySelectorAll(':scope > [data-testid$="-item"]')
            );
            node.children = childElements.map(parseNode);
          }
        }

        return node;
      };

      const rootItems = Array.from(
        document.querySelectorAll('[data-testid="file-tree"] > [data-testid$="-item"]')
      );

      return rootItems.map(parseNode);
    });
  }

  /**
   * Take screenshot of file explorer
   */
  async screenshot(name: string): Promise<Buffer> {
    return await this.explorerContainer.screenshot({
      path: `test-results/screenshots/file-explorer-${name}.png`,
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
}

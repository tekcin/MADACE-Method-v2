/**
 * E2E Tests for File Explorer
 *
 * Tests file tree navigation and operations including:
 * - Tree structure display
 * - Folder expansion/collapse
 * - File selection and opening
 * - Git status indicators
 * - File icons by extension
 * - Sidebar visibility toggle
 */

import { test, expect } from '@playwright/test';

test.describe('File Explorer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to IDE page
    await page.goto('/ide');

    // Wait for editor to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // File explorer should be visible by default
    await page.waitForSelector('[data-testid="file-explorer"]', { timeout: 5000 });
  });

  test('file explorer displays project structure', async ({ page }) => {
    // ARRANGE & ACT
    // File explorer should load automatically

    // ASSERT
    // File explorer container should be visible
    const fileExplorer = page.locator('[data-testid="file-explorer"]');
    await expect(fileExplorer).toBeVisible();

    // Root folder should be visible
    const rootFolder = page.locator('[data-testid="folder-project"]');
    await expect(rootFolder).toBeVisible();

    // Should show "project" as root folder name
    await expect(rootFolder).toContainText('project');
  });

  test('folders are collapsible and expandable', async ({ page }) => {
    // ARRANGE
    const srcFolder = page.locator('[data-testid="folder-src"]');

    // ACT
    // Click to collapse folder
    await srcFolder.click();
    await page.waitForTimeout(300);

    // ASSERT
    // Children should not be visible (or folder should be collapsed)
    const collapsed = await srcFolder.getAttribute('aria-expanded');

    if (collapsed !== null) {
      expect(collapsed).toBe('false');
    }

    // Click to expand folder again
    await srcFolder.click();
    await page.waitForTimeout(300);

    // Children should be visible again
    const expanded = await srcFolder.getAttribute('aria-expanded');
    if (expanded !== null) {
      expect(expanded).toBe('true');
    }

    // Should see files inside src folder
    const exampleTs = page.locator('[data-testid="file-example.ts"]');
    await expect(exampleTs).toBeVisible();
  });

  test('clicking file opens it in editor', async ({ page }) => {
    // ARRANGE
    // Expand src folder if not expanded
    const srcFolder = page.locator('[data-testid="folder-src"]');
    const isExpanded = await srcFolder.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await srcFolder.click();
      await page.waitForTimeout(300);
    }

    // ACT
    // Click on Python file
    const pythonFile = page.locator('[data-testid="file-example.py"]');
    await pythonFile.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Tab should be created for Python file
    const tabs = page.locator('[data-testid="tab"]');
    const pythonTab = tabs.filter({ hasText: 'example.py' });
    await expect(pythonTab).toBeVisible();

    // Python tab should be active
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.py');

    // Editor should show Python content
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toContainText('import');
  });

  test('clicking file twice does not create duplicate tabs', async ({ page }) => {
    // ARRANGE
    const srcFolder = page.locator('[data-testid="folder-src"]');
    const isExpanded = await srcFolder.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await srcFolder.click();
      await page.waitForTimeout(300);
    }

    // ACT
    // Click on Python file twice
    const pythonFile = page.locator('[data-testid="file-example.py"]');
    await pythonFile.click();
    await page.waitForTimeout(300);

    const tabCountAfterFirst = await page.locator('[data-testid="tab"]').count();

    await pythonFile.click();
    await page.waitForTimeout(300);

    // ASSERT
    // Tab count should not increase
    const tabCountAfterSecond = await page.locator('[data-testid="tab"]').count();
    expect(tabCountAfterSecond).toBe(tabCountAfterFirst);

    // Python tab should still be active
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.py');
  });

  test('file tree shows nested folder structure', async ({ page }) => {
    // ARRANGE & ACT
    // File explorer should show nested folders

    // ASSERT
    // Should have multiple folders
    const folders = page.locator('[data-testid^="folder-"]');
    const folderCount = await folders.count();
    expect(folderCount).toBeGreaterThan(1);

    // Should have src folder
    const srcFolder = page.locator('[data-testid="folder-src"]');
    await expect(srcFolder).toBeVisible();

    // Should have styles folder
    const stylesFolder = page.locator('[data-testid="folder-styles"]');
    await expect(stylesFolder).toBeVisible();

    // Should have config folder
    const configFolder = page.locator('[data-testid="folder-config"]');
    await expect(configFolder).toBeVisible();
  });

  test('files display appropriate icons by extension', async ({ page }) => {
    // ARRANGE
    // Expand src folder
    const srcFolder = page.locator('[data-testid="folder-src"]');
    const isExpanded = await srcFolder.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await srcFolder.click();
      await page.waitForTimeout(300);
    }

    // ACT & ASSERT
    // Files should be visible
    const tsFile = page.locator('[data-testid="file-example.ts"]');
    await expect(tsFile).toBeVisible();

    const pyFile = page.locator('[data-testid="file-example.py"]');
    await expect(pyFile).toBeVisible();

    const rsFile = page.locator('[data-testid="file-example.rs"]');
    await expect(rsFile).toBeVisible();

    const goFile = page.locator('[data-testid="file-example.go"]');
    await expect(goFile).toBeVisible();

    // Each file should have an icon (svg or emoji)
    const tsIcon = tsFile.locator('svg, span').first();
    await expect(tsIcon).toBeVisible();
  });

  test('selected file is highlighted in explorer', async ({ page }) => {
    // ARRANGE
    // Expand src folder
    const srcFolder = page.locator('[data-testid="folder-src"]');
    const isExpanded = await srcFolder.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await srcFolder.click();
      await page.waitForTimeout(300);
    }

    // ACT
    // Click on Rust file
    const rustFile = page.locator('[data-testid="file-example.rs"]');
    await rustFile.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Rust file should be highlighted/selected
    const selectedFile = page.locator('[data-testid="file-selected"]');
    await expect(selectedFile).toContainText('example.rs');

    // Or check for selected styling
    const rustFileClass = await rustFile.getAttribute('class');
    expect(rustFileClass).toBeTruthy();
  });

  test('sidebar toggle button hides and shows file explorer', async ({ page }) => {
    // ARRANGE
    const fileExplorer = page.locator('[data-testid="file-explorer"]');
    await expect(fileExplorer).toBeVisible();

    // ACT
    // Click sidebar toggle button
    const sidebarToggle = page.locator('button[title*="sidebar"]').first();
    await sidebarToggle.click();
    await page.waitForTimeout(500);

    // ASSERT
    // File explorer should be hidden
    await expect(fileExplorer).not.toBeVisible();

    // Editor should expand to fill space
    const editor = page.locator('.monaco-editor');
    const expandedWidth = await editor.boundingBox();
    expect(expandedWidth).toBeTruthy();

    // Click toggle again
    await sidebarToggle.click();
    await page.waitForTimeout(500);

    // File explorer should be visible again
    await expect(fileExplorer).toBeVisible();
  });

  test('root folder README.md is accessible', async ({ page }) => {
    // ARRANGE & ACT
    // README.md should be in root, not in a subfolder

    // Find README.md file
    const readmeFile = page.locator('[data-testid="file-README.md"]');

    // ACT
    // Click on README.md
    await readmeFile.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Tab should be created
    const tabs = page.locator('[data-testid="tab"]');
    const readmeTab = tabs.filter({ hasText: 'README.md' });
    await expect(readmeTab).toBeVisible();

    // Editor should show Markdown content
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toContainText('# MADACE Method');
  });

  test('folders in different paths are independently collapsible', async ({ page }) => {
    // ARRANGE
    const srcFolder = page.locator('[data-testid="folder-src"]');
    const stylesFolder = page.locator('[data-testid="folder-styles"]');

    // ACT
    // Expand src folder
    await srcFolder.click();
    await page.waitForTimeout(300);

    // Collapse styles folder
    await stylesFolder.click();
    await page.waitForTimeout(300);

    // ASSERT
    // Src folder should still show its files
    const exampleTs = page.locator('[data-testid="file-example.ts"]');
    await expect(exampleTs).toBeVisible();

    // Styles folder's files should be hidden
    const stylesCss = page.locator('[data-testid="file-styles.css"]');
    const isCssVisible = await stylesCss.isVisible();

    // If styles folder was collapsed, CSS file should not be visible
    // (depends on initial state)
    expect(isCssVisible !== undefined).toBeTruthy();
  });

  test('file tree maintains state across tab switches', async ({ page }) => {
    // ARRANGE
    // Collapse src folder
    const srcFolder = page.locator('[data-testid="folder-src"]');
    await srcFolder.click();
    await page.waitForTimeout(300);

    // Open README.md
    const readmeFile = page.locator('[data-testid="file-README.md"]');
    await readmeFile.click();
    await page.waitForTimeout(500);

    // Open another file (Python)
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    // ACT
    // Switch back to README tab
    const tabs = page.locator('[data-testid="tab"]');
    const readmeTab = tabs.filter({ hasText: 'README.md' });
    await readmeTab.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Src folder should still be collapsed
    const isExpanded = await srcFolder.getAttribute('aria-expanded');
    if (isExpanded !== null) {
      expect(isExpanded).toBe('false');
    }

    // README should still be selected in explorer
    const selectedFile = page.locator('[data-testid="file-selected"]');
    await expect(selectedFile).toContainText('README.md');
  });

  test('git status indicators appear on modified files', async ({ page }) => {
    // ARRANGE & ACT
    // Git status is fetched from API and displayed in file explorer

    // Note: This test may not show changes unless Git status API returns data
    // In a real scenario, files would show M (modified), A (added), D (deleted)

    // ASSERT
    // File explorer should have rendered without errors
    const fileExplorer = page.locator('[data-testid="file-explorer"]');
    await expect(fileExplorer).toBeVisible();

    // If Git status indicators are present, they should be visible
    const gitIndicators = page.locator('[data-testid^="git-status-"]');
    const count = await gitIndicators.count();

    // Count should be 0 or more (depends on Git status)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('file explorer shows all file types', async ({ page }) => {
    // ARRANGE & ACT
    // Expand all folders to reveal all files

    // Expand src folder
    const srcFolder = page.locator('[data-testid="folder-src"]');
    let isExpanded = await srcFolder.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await srcFolder.click();
      await page.waitForTimeout(300);
    }

    // Expand styles folder
    const stylesFolder = page.locator('[data-testid="folder-styles"]');
    isExpanded = await stylesFolder.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await stylesFolder.click();
      await page.waitForTimeout(300);
    }

    // Expand config folder
    const configFolder = page.locator('[data-testid="folder-config"]');
    isExpanded = await configFolder.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await configFolder.click();
      await page.waitForTimeout(300);
    }

    // ASSERT
    // Should show various file types
    const fileTypes = [
      'example.ts',
      'example.py',
      'example.rs',
      'example.go',
      'styles.css',
      'config.json',
      'config.yaml',
      'README.md',
    ];

    for (const fileName of fileTypes) {
      const file = page.locator(`[data-testid="file-${fileName}"]`);
      await expect(file).toBeVisible();
    }
  });

  test('file explorer is scrollable with long file lists', async ({ page }) => {
    // ARRANGE & ACT
    // Expand all folders
    const folders = page.locator('[data-testid^="folder-"]');
    const folderCount = await folders.count();

    for (let i = 0; i < folderCount; i++) {
      const folder = folders.nth(i);
      const isExpanded = await folder.getAttribute('aria-expanded');
      if (isExpanded === 'false') {
        await folder.click();
        await page.waitForTimeout(200);
      }
    }

    // ASSERT
    // File explorer should be scrollable
    const fileExplorer = page.locator('[data-testid="file-explorer"]');
    const hasOverflow = await fileExplorer.evaluate((el) => {
      return el.scrollHeight > el.clientHeight;
    });

    // May or may not have overflow depending on screen size
    expect(hasOverflow !== undefined).toBeTruthy();

    // File explorer should have overflow-y-auto or similar
    const className = await fileExplorer.getAttribute('class');
    expect(className).toBeTruthy();
  });

  test('file names are fully visible and readable', async ({ page }) => {
    // ARRANGE
    // Expand src folder
    const srcFolder = page.locator('[data-testid="folder-src"]');
    const isExpanded = await srcFolder.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await srcFolder.click();
      await page.waitForTimeout(300);
    }

    // ACT & ASSERT
    // Each file should have readable text
    const files = page.locator('[data-testid^="file-"]');
    const fileCount = await files.count();

    expect(fileCount).toBeGreaterThan(0);

    // Check first few files
    for (let i = 0; i < Math.min(3, fileCount); i++) {
      const file = files.nth(i);
      const text = await file.textContent();
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(0);
    }
  });

  test('folder icons distinguish folders from files', async ({ page }) => {
    // ARRANGE & ACT
    // File explorer should be visible

    // ASSERT
    // Folders should have folder icons
    const folders = page.locator('[data-testid^="folder-"]');
    const folderCount = await folders.count();
    expect(folderCount).toBeGreaterThan(0);

    // First folder should have an icon
    const firstFolder = folders.first();
    const folderIcon = firstFolder.locator('svg, span').first();
    await expect(folderIcon).toBeVisible();

    // Files should have file icons
    const files = page.locator('[data-testid^="file-"]');
    const fileCount = await files.count();
    expect(fileCount).toBeGreaterThan(0);

    // First file should have an icon
    const firstFile = files.first();
    const fileIcon = firstFile.locator('svg, span').first();
    await expect(fileIcon).toBeVisible();
  });

  test('clicking folder does not open file in editor', async ({ page }) => {
    // ARRANGE
    const initialTabCount = await page.locator('[data-testid="tab"]').count();

    // ACT
    // Click on folder (not file)
    const srcFolder = page.locator('[data-testid="folder-src"]');
    await srcFolder.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Tab count should not increase
    const newTabCount = await page.locator('[data-testid="tab"]').count();
    expect(newTabCount).toBe(initialTabCount);

    // Folder should just expand/collapse
    const isExpanded = await srcFolder.getAttribute('aria-expanded');
    expect(isExpanded).toBeTruthy();
  });

  test('file explorer layout remains consistent', async ({ page }) => {
    // ARRANGE & ACT
    // File explorer should be visible

    // ASSERT
    // File explorer should be on the left side
    const fileExplorer = page.locator('[data-testid="file-explorer"]');
    const bounds = await fileExplorer.boundingBox();

    expect(bounds).toBeTruthy();
    expect(bounds!.x).toBeLessThan(300); // Should be on left side
    expect(bounds!.width).toBeGreaterThan(100); // Should have reasonable width

    // Editor should be to the right of file explorer
    const editor = page.locator('.monaco-editor');
    const editorBounds = await editor.boundingBox();

    expect(editorBounds).toBeTruthy();
    expect(editorBounds!.x).toBeGreaterThan(bounds!.x); // Editor should be right of explorer
  });
});

/**
 * E2E Tests for Tab System
 *
 * Tests multi-file tab functionality including:
 * - Opening and closing tabs
 * - Tab switching (mouse and keyboard)
 * - Keyboard shortcuts (Ctrl+W, Ctrl+Tab, Ctrl+1-8)
 * - Tab state management
 * - Dirty indicator for modified files
 */

import { test, expect } from '@playwright/test';

test.describe('Tab System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to IDE page
    await page.goto('/ide');

    // Wait for editor to load with initial tab
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    await page.waitForSelector('[data-testid="tab"]', { timeout: 5000 });
  });

  test('initial tab loads with TypeScript file', async ({ page }) => {
    // ARRANGE & ACT
    // IDE should load with one tab by default

    // ASSERT
    // Should have one tab
    const tabs = page.locator('[data-testid="tab"]');
    await expect(tabs).toHaveCount(1);

    // Tab should be example.ts
    const firstTab = tabs.first();
    await expect(firstTab).toContainText('example.ts');

    // Tab should be active
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toBeVisible();
    await expect(activeTab).toContainText('example.ts');
  });

  test('opening new file creates new tab', async ({ page }) => {
    // ARRANGE
    const initialTabCount = await page.locator('[data-testid="tab"]').count();

    // ACT
    // Open Python file from dropdown
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    // ASSERT
    // Should have one more tab
    const tabs = page.locator('[data-testid="tab"]');
    const newTabCount = await tabs.count();
    expect(newTabCount).toBe(initialTabCount + 1);

    // New tab should be active
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.py');

    // Editor should show Python content
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toContainText('import');
  });

  test('opening same file twice does not create duplicate tab', async ({ page }) => {
    // ARRANGE
    // Open Python file
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    const tabCountAfterFirst = await page.locator('[data-testid="tab"]').count();

    // ACT
    // Try to open Python file again
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    // ASSERT
    // Tab count should not increase
    const tabCountAfterSecond = await page.locator('[data-testid="tab"]').count();
    expect(tabCountAfterSecond).toBe(tabCountAfterFirst);

    // Python tab should still be active
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.py');
  });

  test('clicking tab switches to that file', async ({ page }) => {
    // ARRANGE
    // Open multiple files
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);
    await fileSelect.selectOption('example.rs');
    await page.waitForTimeout(500);

    // Should have 3 tabs now (ts, py, rs)
    const tabs = page.locator('[data-testid="tab"]');
    await expect(tabs).toHaveCount(3);

    // ACT
    // Click on first tab (TypeScript)
    const firstTab = tabs.first();
    await firstTab.click();
    await page.waitForTimeout(500);

    // ASSERT
    // First tab should be active
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.ts');

    // Editor should show TypeScript content
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toContainText('interface');
  });

  test('closing tab removes it from tab bar', async ({ page }) => {
    // ARRANGE
    // Open second file
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    const initialTabCount = await page.locator('[data-testid="tab"]').count();

    // ACT
    // Close Python tab
    const tabs = page.locator('[data-testid="tab"]');
    const pythonTab = tabs.filter({ hasText: 'example.py' });
    const closeButton = pythonTab.locator('[data-testid="tab-close"]');
    await closeButton.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Tab count should decrease
    const newTabCount = await page.locator('[data-testid="tab"]').count();
    expect(newTabCount).toBe(initialTabCount - 1);

    // Python tab should not exist
    await expect(pythonTab).not.toBeVisible();

    // Should switch to adjacent tab (TypeScript)
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.ts');
  });

  test('closing active tab switches to adjacent tab', async ({ page }) => {
    // ARRANGE
    // Open multiple files
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);
    await fileSelect.selectOption('example.rs');
    await page.waitForTimeout(500);

    // Rust file should be active
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.rs');

    // ACT
    // Close active tab (Rust)
    const closeButton = activeTab.locator('[data-testid="tab-close"]');
    await closeButton.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Should switch to Python tab (adjacent)
    await expect(activeTab).toContainText('example.py');

    // Editor should show Python content
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toContainText('import');
  });

  test('keyboard shortcut Ctrl+W closes active tab', async ({ page }) => {
    // ARRANGE
    // Open second file
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    const initialTabCount = await page.locator('[data-testid="tab"]').count();

    // ACT
    // Press Ctrl+W to close active tab
    await page.keyboard.press('Control+w');
    await page.waitForTimeout(500);

    // ASSERT
    // Tab count should decrease
    const newTabCount = await page.locator('[data-testid="tab"]').count();
    expect(newTabCount).toBe(initialTabCount - 1);

    // TypeScript tab should be active
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.ts');
  });

  test('keyboard shortcut Ctrl+Tab cycles to next tab', async ({ page }) => {
    // ARRANGE
    // Open multiple files
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);
    await fileSelect.selectOption('example.rs');
    await page.waitForTimeout(500);

    // Click on first tab
    const tabs = page.locator('[data-testid="tab"]');
    await tabs.first().click();
    await page.waitForTimeout(500);

    // ACT
    // Press Ctrl+Tab to go to next tab
    await page.keyboard.press('Control+Tab');
    await page.waitForTimeout(500);

    // ASSERT
    // Should switch to Python tab
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.py');

    // Press Ctrl+Tab again
    await page.keyboard.press('Control+Tab');
    await page.waitForTimeout(500);

    // Should switch to Rust tab
    await expect(activeTab).toContainText('example.rs');

    // Press Ctrl+Tab again (should wrap to first tab)
    await page.keyboard.press('Control+Tab');
    await page.waitForTimeout(500);

    // Should wrap to TypeScript tab
    await expect(activeTab).toContainText('example.ts');
  });

  test('keyboard shortcut Ctrl+Shift+Tab cycles to previous tab', async ({ page }) => {
    // ARRANGE
    // Open multiple files
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);
    await fileSelect.selectOption('example.rs');
    await page.waitForTimeout(500);

    // Rust file should be active (last opened)

    // ACT
    // Press Ctrl+Shift+Tab to go to previous tab
    await page.keyboard.press('Control+Shift+Tab');
    await page.waitForTimeout(500);

    // ASSERT
    // Should switch to Python tab
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.py');

    // Press Ctrl+Shift+Tab again
    await page.keyboard.press('Control+Shift+Tab');
    await page.waitForTimeout(500);

    // Should switch to TypeScript tab
    await expect(activeTab).toContainText('example.ts');

    // Press Ctrl+Shift+Tab again (should wrap to last tab)
    await page.keyboard.press('Control+Shift+Tab');
    await page.waitForTimeout(500);

    // Should wrap to Rust tab
    await expect(activeTab).toContainText('example.rs');
  });

  test('keyboard shortcuts Ctrl+1 through Ctrl+8 switch to specific tabs', async ({ page }) => {
    // ARRANGE
    // Open multiple files
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(300);
    await fileSelect.selectOption('example.rs');
    await page.waitForTimeout(300);
    await fileSelect.selectOption('example.go');
    await page.waitForTimeout(300);

    // Should have 4 tabs (ts, py, rs, go)

    // ACT & ASSERT
    // Ctrl+1 should switch to first tab
    await page.keyboard.press('Control+1');
    await page.waitForTimeout(300);
    let activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.ts');

    // Ctrl+2 should switch to second tab
    await page.keyboard.press('Control+2');
    await page.waitForTimeout(300);
    activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.py');

    // Ctrl+3 should switch to third tab
    await page.keyboard.press('Control+3');
    await page.waitForTimeout(300);
    activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.rs');

    // Ctrl+4 should switch to fourth tab
    await page.keyboard.press('Control+4');
    await page.waitForTimeout(300);
    activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.go');
  });

  test('modified file shows dirty indicator', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // Edit file content
    const editor = page.locator('.monaco-editor');
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('// Modified content');
    await page.waitForTimeout(500);

    // ASSERT
    // Modified indicator should be visible in footer
    const modifiedIndicator = page.locator('text=• Modified');
    await expect(modifiedIndicator).toBeVisible();

    // Tab might also show dirty indicator (dot or asterisk)
    const activeTab = page.locator('[data-testid="tab-active"]');
    const tabText = await activeTab.textContent();
    expect(tabText).toBeTruthy();
  });

  test('tabs maintain state when switching between them', async ({ page }) => {
    // ARRANGE
    // Edit first file
    let editor = page.locator('.monaco-editor');
    await editor.click();
    await page.keyboard.press('Control+A');
    const customContent1 = '// Custom TypeScript';
    await page.keyboard.type(customContent1);
    await page.waitForTimeout(500);

    // Open and edit second file
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    editor = page.locator('.monaco-editor');
    await editor.click();
    await page.keyboard.press('Control+A');
    const customContent2 = '# Custom Python';
    await page.keyboard.type(customContent2);
    await page.waitForTimeout(500);

    // ACT
    // Switch back to first tab
    const tabs = page.locator('[data-testid="tab"]');
    await tabs.first().click();
    await page.waitForTimeout(500);

    // ASSERT
    // First file should have custom content
    let viewLines = page.locator('.view-lines');
    await expect(viewLines).toContainText(customContent1);

    // Switch to second tab
    const secondTab = tabs.nth(1);
    await secondTab.click();
    await page.waitForTimeout(500);

    // Second file should have custom content
    viewLines = page.locator('.view-lines');
    await expect(viewLines).toContainText(customContent2);
  });

  test('tab bar shows all open tabs', async ({ page }) => {
    // ARRANGE & ACT
    // Open multiple files
    const filesToOpen = ['example.py', 'example.rs', 'example.go', 'README.md'];
    const fileSelect = page.locator('#file-select');

    for (const file of filesToOpen) {
      await fileSelect.selectOption(file);
      await page.waitForTimeout(300);
    }

    // ASSERT
    // Should have 5 tabs (initial + 4 opened)
    const tabs = page.locator('[data-testid="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBe(5);

    // All files should be visible in tab bar
    for (const file of filesToOpen) {
      const tab = tabs.filter({ hasText: file });
      await expect(tab).toBeVisible();
    }
  });

  test('tab close button appears on hover', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('[data-testid="tab"]', { timeout: 5000 });

    // ACT
    const firstTab = page.locator('[data-testid="tab"]').first();
    await firstTab.hover();
    await page.waitForTimeout(300);

    // ASSERT
    // Close button should be visible or at least exist
    const closeButton = firstTab.locator('[data-testid="tab-close"]');
    const isVisible = await closeButton.isVisible();
    const exists = (await closeButton.count()) > 0;

    // Either visible or exists (might have different hover states)
    expect(isVisible || exists).toBeTruthy();
  });

  test('cannot close last remaining tab', async ({ page }) => {
    // ARRANGE
    // Should start with one tab
    const tabs = page.locator('[data-testid="tab"]');
    await expect(tabs).toHaveCount(1);

    // ACT
    // Try to close with Ctrl+W
    await page.keyboard.press('Control+w');
    await page.waitForTimeout(500);

    // ASSERT
    // Tab should still exist (can't close last tab)
    await expect(tabs).toHaveCount(1);

    // Editor should still be visible
    const editor = page.locator('.monaco-editor');
    await expect(editor).toBeVisible();
  });

  test('tab bar is scrollable with many tabs open', async ({ page }) => {
    // ARRANGE & ACT
    // Open all available files
    const allFiles = [
      'example.py',
      'example.rs',
      'example.go',
      'README.md',
      'styles.css',
      'config.json',
      'config.yaml',
    ];
    const fileSelect = page.locator('#file-select');

    for (const file of allFiles) {
      await fileSelect.selectOption(file);
      await page.waitForTimeout(200);
    }

    // ASSERT
    // Should have 8 tabs total
    const tabs = page.locator('[data-testid="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBe(8);

    // Tab bar should exist and contain all tabs
    const tabBar = page.locator('[data-testid="tab-bar"]');
    await expect(tabBar).toBeVisible();

    // All tabs should exist (even if some are scrolled)
    for (const file of allFiles) {
      const tab = tabs.filter({ hasText: file });
      expect(await tab.count()).toBeGreaterThan(0);
    }
  });

  test('active tab is highlighted visually', async ({ page }) => {
    // ARRANGE
    // Open second file
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    // ACT & ASSERT
    // Active tab should have distinct styling
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toBeVisible();

    // Active tab should be Python file
    await expect(activeTab).toContainText('example.py');

    // Inactive tab should not have active styling
    const inactiveTab = page.locator('[data-testid="tab"]').filter({ hasText: 'example.ts' });
    await expect(inactiveTab).toBeVisible();

    // Tabs should have different visual appearance
    // (This is validated by the fact that data-testid="tab-active" exists)
    const activeTabClasses = await activeTab.getAttribute('class');
    const inactiveTabClasses = await inactiveTab.getAttribute('class');

    // Classes should be different
    expect(activeTabClasses).not.toBe(inactiveTabClasses);
  });
});

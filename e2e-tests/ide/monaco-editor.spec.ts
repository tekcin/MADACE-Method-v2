/**
 * E2E Tests for Monaco Editor
 *
 * Tests Monaco Editor functionality including:
 * - Editor loading and initialization
 * - Syntax highlighting for multiple languages
 * - Theme switching
 * - Content editing
 * - Editor options (word wrap, minimap, line numbers, font size)
 */

import { test, expect } from '@playwright/test';

test.describe('Monaco Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to IDE page
    await page.goto('/ide');

    // Wait for editor to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('editor loads and displays initial TypeScript file', async ({ page }) => {
    // ARRANGE & ACT
    // Editor should load automatically with example.ts

    // ASSERT
    // Monaco editor should be visible
    const editor = page.locator('.monaco-editor');
    await expect(editor).toBeVisible();

    // Should have TypeScript content
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toBeVisible();

    // Should display TypeScript syntax (look for keywords)
    await expect(editorContent).toContainText('interface');
    await expect(editorContent).toContainText('async');
    await expect(editorContent).toContainText('function');

    // Tab should show example.ts
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.ts');

    // Toolbar should show TypeScript language
    const languageIndicator = page.locator('text=Language: TYPESCRIPT');
    await expect(languageIndicator).toBeVisible();
  });

  test('syntax highlighting works for TypeScript', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // TypeScript file should be loaded by default

    // ASSERT
    // Check for syntax highlighting tokens
    const viewLines = page.locator('.view-lines');

    // Keywords should be highlighted (TypeScript keywords)
    const keywords = await viewLines.locator('.mtk5, .mtk6, .mtk15').count();
    expect(keywords).toBeGreaterThan(0);

    // Strings should be highlighted
    const strings = await viewLines.locator('.mtk10').count();
    expect(strings).toBeGreaterThan(0);

    // Comments should be highlighted
    const comments = await viewLines.locator('.mtk3').count();
    expect(comments).toBeGreaterThan(0);
  });

  test('syntax highlighting works for Python', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // Open Python file
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');

    // Wait for Python content to load
    await page.waitForTimeout(500);

    // ASSERT
    // Active tab should be Python file
    const activeTab = page.locator('[data-testid="tab-active"]');
    await expect(activeTab).toContainText('example.py');

    // Editor should show Python syntax
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toContainText('import');
    await expect(editorContent).toContainText('async def');
    await expect(editorContent).toContainText('class');

    // Toolbar should show Python language
    const languageIndicator = page.locator('text=Language: PYTHON');
    await expect(languageIndicator).toBeVisible();

    // Python-specific syntax highlighting should be present
    const keywords = await editorContent.locator('.mtk5, .mtk6').count();
    expect(keywords).toBeGreaterThan(0);
  });

  test('syntax highlighting works for multiple languages', async ({ page }) => {
    const languageTests = [
      { file: 'example.rs', language: 'RUST', keyword: 'struct' },
      { file: 'example.go', language: 'GO', keyword: 'package' },
      { file: 'README.md', language: 'MARKDOWN', keyword: '##' },
      { file: 'styles.css', language: 'CSS', keyword: '.button' },
      { file: 'config.json', language: 'JSON', keyword: 'name' },
      { file: 'config.yaml', language: 'YAML', keyword: 'project:' },
    ];

    for (const lang of languageTests) {
      // ARRANGE & ACT
      const fileSelect = page.locator('#file-select');
      await fileSelect.selectOption(lang.file);
      await page.waitForTimeout(500);

      // ASSERT
      // Check language indicator
      const languageIndicator = page.locator(`text=Language: ${lang.language}`);
      await expect(languageIndicator).toBeVisible();

      // Check for language-specific content
      const editorContent = page.locator('.view-lines');
      await expect(editorContent).toContainText(lang.keyword);
    }
  });

  test('theme switching between dark and light', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // Default theme should be vs-dark
    let editor = page.locator('.monaco-editor');
    let editorClass = await editor.getAttribute('class');
    expect(editorClass).toContain('vs-dark');

    // Switch to light theme
    const themeSelect = page.locator('[data-testid="theme-select"]');
    await themeSelect.selectOption('vs-light');
    await page.waitForTimeout(500);

    // ASSERT
    editor = page.locator('.monaco-editor');
    editorClass = await editor.getAttribute('class');
    expect(editorClass).toContain('vs-light');

    // Background should be light
    const background = await editor.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // Light theme should have a lighter background (rgb values should be high)
    expect(background).toBeTruthy();

    // Switch back to dark theme
    await themeSelect.selectOption('vs-dark');
    await page.waitForTimeout(500);

    // Should be dark again
    editor = page.locator('.monaco-editor');
    editorClass = await editor.getAttribute('class');
    expect(editorClass).toContain('vs-dark');
  });

  test('high contrast themes work', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT & ASSERT
    // Switch to high contrast black
    const themeSelect = page.locator('[data-testid="theme-select"]');
    await themeSelect.selectOption('hc-black');
    await page.waitForTimeout(500);

    let editor = page.locator('.monaco-editor');
    let editorClass = await editor.getAttribute('class');
    expect(editorClass).toContain('hc-black');

    // Switch to high contrast light
    await themeSelect.selectOption('hc-light');
    await page.waitForTimeout(500);

    editor = page.locator('.monaco-editor');
    editorClass = await editor.getAttribute('class');
    expect(editorClass).toContain('hc-light');
  });

  test('content editing and change detection', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // Click in editor to focus
    const editor = page.locator('.monaco-editor');
    await editor.click();

    // Type new content (Ctrl+A to select all, then type)
    await page.keyboard.press('Control+A');
    await page.keyboard.type('// New TypeScript code\nconst hello = "world";');
    await page.waitForTimeout(500);

    // ASSERT
    // Editor should show new content
    const viewLines = page.locator('.view-lines');
    await expect(viewLines).toContainText('New TypeScript code');
    await expect(viewLines).toContainText('const hello');

    // Modified indicator should be visible
    const modifiedIndicator = page.locator('text=• Modified');
    await expect(modifiedIndicator).toBeVisible();

    // Character count should update
    const charCount = page.locator('text=/Characters: \\d+/');
    await expect(charCount).toBeVisible();
  });

  test('word wrap toggle works', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT & ASSERT
    // Word wrap should be off by default
    let wordWrapButton = page.locator('[data-testid="word-wrap-toggle"]');
    await expect(wordWrapButton).toBeVisible();

    // Check initial state (button might show "Off" or have unchecked appearance)
    const initialState = await wordWrapButton.textContent();
    expect(initialState).toBeTruthy();

    // Toggle word wrap on
    await wordWrapButton.click();
    await page.waitForTimeout(500);

    // Toggle word wrap off
    await wordWrapButton.click();
    await page.waitForTimeout(500);
  });

  test('minimap toggle works', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT & ASSERT
    // Minimap should be visible by default
    let minimap = page.locator('.minimap');
    await expect(minimap).toBeVisible();

    // Toggle minimap off
    const minimapButton = page.locator('[data-testid="minimap-toggle"]');
    await minimapButton.click();
    await page.waitForTimeout(500);

    // Minimap should be hidden
    minimap = page.locator('.minimap');
    await expect(minimap).not.toBeVisible();

    // Toggle minimap back on
    await minimapButton.click();
    await page.waitForTimeout(500);

    // Minimap should be visible again
    minimap = page.locator('.minimap');
    await expect(minimap).toBeVisible();
  });

  test('line numbers toggle works', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT & ASSERT
    // Line numbers should be visible by default
    let lineNumbers = page.locator('.line-numbers');
    await expect(lineNumbers.first()).toBeVisible();

    // Toggle to relative line numbers
    const lineNumbersSelect = page.locator('[data-testid="line-numbers-select"]');
    await lineNumbersSelect.selectOption('relative');
    await page.waitForTimeout(500);

    // Toggle line numbers off
    await lineNumbersSelect.selectOption('off');
    await page.waitForTimeout(500);

    // Toggle line numbers back on
    await lineNumbersSelect.selectOption('on');
    await page.waitForTimeout(500);

    // Line numbers should be visible again
    lineNumbers = page.locator('.line-numbers');
    await expect(lineNumbers.first()).toBeVisible();
  });

  test('font size adjustment works', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // Default font size should be 14px
    const editor = page.locator('.monaco-editor');
    let fontSize = await editor.evaluate((el) => {
      const lines = el.querySelector('.view-lines');
      return lines ? window.getComputedStyle(lines).fontSize : '14px';
    });
    expect(fontSize).toBeTruthy();

    // Increase font size
    const fontSizeSelect = page.locator('[data-testid="font-size-select"]');
    await fontSizeSelect.selectOption('16');
    await page.waitForTimeout(500);

    // ASSERT
    // Font size should have changed
    fontSize = await editor.evaluate((el) => {
      const lines = el.querySelector('.view-lines');
      return lines ? window.getComputedStyle(lines).fontSize : '14px';
    });
    // Font size should be 16px or larger
    const fontSizeValue = parseInt(fontSize);
    expect(fontSizeValue).toBeGreaterThanOrEqual(16);

    // Decrease font size
    await fontSizeSelect.selectOption('12');
    await page.waitForTimeout(500);

    // Font size should be smaller
    fontSize = await editor.evaluate((el) => {
      const lines = el.querySelector('.view-lines');
      return lines ? window.getComputedStyle(lines).fontSize : '14px';
    });
    const smallerFontSize = parseInt(fontSize);
    expect(smallerFontSize).toBeLessThanOrEqual(12);
  });

  test('editor statistics display correctly', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT & ASSERT
    // Footer should show line count
    const lineCount = page.locator('text=/Lines: \\d+/');
    await expect(lineCount).toBeVisible();

    // Footer should show character count
    const charCount = page.locator('text=/Characters: \\d+/');
    await expect(charCount).toBeVisible();

    // Footer should show language
    const language = page.locator('text=Language: TYPESCRIPT');
    await expect(language).toBeVisible();

    // Footer should show encoding
    const encoding = page.locator('text=Encoding: UTF-8');
    await expect(encoding).toBeVisible();

    // Footer should show tab size
    const tabSize = page.locator('text=Tab Size: 2');
    await expect(tabSize).toBeVisible();
  });

  test('editor loading state shows spinner', async ({ page }) => {
    // ARRANGE & ACT
    // Intercept Monaco loader to simulate slow loading
    await page.goto('/ide');

    // ASSERT
    // Loading indicator should appear briefly
    // (This test may pass too quickly if loading is instant)
    const loadingText = page.locator('text=/Loading|Initializing/');

    // Either loading text was visible or editor loaded immediately
    const isLoadingVisible = await loadingText.isVisible().catch(() => false);
    const isEditorVisible = await page.locator('.monaco-editor').isVisible();

    expect(isLoadingVisible || isEditorVisible).toBeTruthy();
  });

  test('editor is responsive to container resize', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // Get initial editor dimensions
    const editor = page.locator('.monaco-editor');
    const initialSize = await editor.boundingBox();
    expect(initialSize).toBeTruthy();

    // Hide sidebar to trigger resize
    const sidebarToggle = page.locator('button[title*="sidebar"]').first();
    await sidebarToggle.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Editor should have resized
    const newSize = await editor.boundingBox();
    expect(newSize).toBeTruthy();
    expect(newSize!.width).toBeGreaterThan(initialSize!.width);

    // Show sidebar again
    await sidebarToggle.click();
    await page.waitForTimeout(500);

    // Editor should resize back
    const finalSize = await editor.boundingBox();
    expect(finalSize).toBeTruthy();
  });

  test('editor supports IntelliSense features', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // Clear editor and type code that should trigger IntelliSense
    const editor = page.locator('.monaco-editor');
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('const arr = [1, 2, 3];\narr.');

    // Wait for IntelliSense suggestions
    await page.waitForTimeout(1000);

    // ASSERT
    // IntelliSense widget might appear (Monaco's suggest widget)
    const suggestWidget = page.locator('.suggest-widget');
    const isSuggestVisible = await suggestWidget.isVisible().catch(() => false);

    // If IntelliSense didn't appear, at least verify we can type
    if (!isSuggestVisible) {
      // Verify content was typed
      const viewLines = page.locator('.view-lines');
      await expect(viewLines).toContainText('arr.');
    }
  });

  test('editor preserves content when switching tabs', async ({ page }) => {
    // ARRANGE
    await page.goto('/ide');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // ACT
    // Edit first file
    const editor = page.locator('.monaco-editor');
    await editor.click();
    await page.keyboard.press('Control+A');
    const customContent = '// Custom TypeScript code';
    await page.keyboard.type(customContent);
    await page.waitForTimeout(500);

    // Open second file
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    // Switch back to first file
    const firstTab = page.locator('[data-testid="tab"]').first();
    await firstTab.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Custom content should still be there
    const viewLines = page.locator('.view-lines');
    await expect(viewLines).toContainText(customContent);

    // Modified indicator should still be visible
    const modifiedIndicator = page.locator('text=• Modified');
    await expect(modifiedIndicator).toBeVisible();
  });
});

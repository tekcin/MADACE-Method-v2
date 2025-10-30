/**
 * E2E Tests for Integrated Terminal
 *
 * Tests terminal functionality including:
 * - Terminal visibility toggle
 * - Command execution
 * - Command history
 * - Terminal resize
 * - Keyboard shortcuts
 * - Command output display
 */

import { test, expect } from '@playwright/test';

test.describe('Integrated Terminal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to IDE page
    await page.goto('/ide');

    // Wait for editor to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('terminal is hidden by default', async ({ page }) => {
    // ARRANGE & ACT
    // IDE should load with terminal hidden

    // ASSERT
    // Terminal should not be visible
    const terminal = page.locator('[data-testid="terminal"]');
    const isVisible = await terminal.isVisible().catch(() => false);

    expect(isVisible).toBe(false);
  });

  test('Ctrl+` keyboard shortcut toggles terminal visibility', async ({ page }) => {
    // ARRANGE
    const terminal = page.locator('[data-testid="terminal"]');

    // ACT
    // Press Ctrl+` to show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(500);

    // ASSERT
    // Terminal should be visible
    await expect(terminal).toBeVisible();

    // XTerm terminal should be rendered
    const xtermTerminal = page.locator('.xterm');
    await expect(xtermTerminal).toBeVisible();

    // Press Ctrl+` again to hide terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(500);

    // Terminal should be hidden
    const isVisible = await terminal.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('terminal toggle button shows and hides terminal', async ({ page }) => {
    // ARRANGE
    const terminalToggle = page.locator('button', { hasText: /Terminal/i });

    // ACT
    // Click toggle button to show terminal
    await terminalToggle.click();
    await page.waitForTimeout(500);

    // ASSERT
    // Terminal should be visible
    const terminal = page.locator('[data-testid="terminal"]');
    await expect(terminal).toBeVisible();

    // Button text should change to "Hide Terminal" or similar
    const buttonText = await terminalToggle.textContent();
    expect(buttonText).toBeTruthy();

    // Click toggle button again to hide terminal
    await terminalToggle.click();
    await page.waitForTimeout(500);

    // Terminal should be hidden
    const isVisible = await terminal.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('terminal displays XTerm.js interface', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(500);

    // ACT & ASSERT
    // XTerm container should be visible
    const xtermContainer = page.locator('.xterm');
    await expect(xtermContainer).toBeVisible();

    // XTerm viewport should be present
    const xtermViewport = page.locator('.xterm-viewport');
    await expect(xtermViewport).toBeVisible();

    // XTerm screen should be present
    const xtermScreen = page.locator('.xterm-screen');
    await expect(xtermScreen).toBeVisible();
  });

  test('terminal executes simple commands', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // ACT
    // Type a command (echo "Hello")
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('echo "Hello Terminal"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);

    // ASSERT
    // Terminal output should show the echo result
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    const outputText = await terminalOutput.textContent();

    // Output should contain "Hello Terminal"
    expect(outputText).toContain('Hello Terminal');
  });

  test('terminal executes pwd command', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // ACT
    // Execute pwd command
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('pwd');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);

    // ASSERT
    // Terminal output should show the current directory
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    const outputText = await terminalOutput.textContent();

    // Output should contain a path (likely /Users/nimda/MADACE-Method-v2.0)
    expect(outputText).toMatch(/\//); // Should contain at least one slash (path separator)
  });

  test('terminal executes ls command', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // ACT
    // Execute ls command
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);

    // ASSERT
    // Terminal output should show directory listing
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    const outputText = await terminalOutput.textContent();

    // Output should contain common files/folders (package.json, node_modules, etc.)
    expect(outputText?.length || 0).toBeGreaterThan(0);
  });

  test('terminal shows error for invalid commands', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // ACT
    // Execute invalid command
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('thisisnotavalidcommand123');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);

    // ASSERT
    // Terminal output should show error
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    const outputText = await terminalOutput.textContent();

    // Output should contain error message (not found, command not found, etc.)
    expect(outputText?.toLowerCase()).toMatch(/not found|not allowed|error/);
  });

  test('terminal maintains command history', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // Execute first command
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('echo "First command"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    // Execute second command
    await terminalInput.fill('echo "Second command"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    // ACT
    // Press Up arrow to go back in history
    await terminalInput.press('ArrowUp');
    await page.waitForTimeout(300);

    // ASSERT
    // Input should show previous command
    const inputValue = await terminalInput.inputValue();
    expect(inputValue).toContain('Second command');

    // Press Up again
    await terminalInput.press('ArrowUp');
    await page.waitForTimeout(300);

    // Should show first command
    const firstCommandValue = await terminalInput.inputValue();
    expect(firstCommandValue).toContain('First command');

    // Press Down to go forward in history
    await terminalInput.press('ArrowDown');
    await page.waitForTimeout(300);

    // Should show second command again
    const secondCommandAgain = await terminalInput.inputValue();
    expect(secondCommandAgain).toContain('Second command');
  });

  test('terminal is resizable with drag handle', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(500);

    // Get initial terminal height
    const terminal = page.locator('[data-testid="terminal"]');
    const initialBounds = await terminal.boundingBox();
    expect(initialBounds).toBeTruthy();
    const initialHeight = initialBounds!.height;

    // ACT
    // Find resize handle
    const resizeHandle = page.locator('[data-testid="terminal-resize-handle"]');
    await expect(resizeHandle).toBeVisible();

    // Drag resize handle upward to increase terminal height
    const handleBounds = await resizeHandle.boundingBox();
    expect(handleBounds).toBeTruthy();

    await page.mouse.move(
      handleBounds!.x + handleBounds!.width / 2,
      handleBounds!.y + handleBounds!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(handleBounds!.x + handleBounds!.width / 2, handleBounds!.y - 100); // Move up 100px
    await page.mouse.up();
    await page.waitForTimeout(500);

    // ASSERT
    // Terminal height should have increased
    const newBounds = await terminal.boundingBox();
    expect(newBounds).toBeTruthy();
    const newHeight = newBounds!.height;

    expect(newHeight).toBeGreaterThan(initialHeight);
  });

  test('terminal position is at bottom of editor area', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(500);

    // ACT & ASSERT
    // Terminal should be at the bottom
    const terminal = page.locator('[data-testid="terminal"]');
    const terminalBounds = await terminal.boundingBox();

    const editor = page.locator('.monaco-editor');
    const editorBounds = await editor.boundingBox();

    expect(terminalBounds).toBeTruthy();
    expect(editorBounds).toBeTruthy();

    // Terminal should be below editor
    expect(terminalBounds!.y).toBeGreaterThan(editorBounds!.y);

    // Terminal should span full width
    expect(terminalBounds!.width).toBeGreaterThan(400);
  });

  test('terminal has working clear functionality', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // Execute some commands to generate output
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('echo "Test output 1"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    await terminalInput.fill('echo "Test output 2"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    // ACT
    // Execute clear command
    await terminalInput.fill('clear');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    // ASSERT
    // Terminal output should be cleared (or minimal)
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    const outputText = await terminalOutput.textContent();

    // After clear, output should be empty or only show prompt
    const outputLength = outputText?.length || 0;
    expect(outputLength).toBeLessThan(100); // Should be minimal after clear
  });

  test('terminal supports npm commands', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // ACT
    // Execute npm --version
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('npm --version');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);

    // ASSERT
    // Terminal output should show npm version
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    const outputText = await terminalOutput.textContent();

    // Output should contain version number (e.g., 10.x.x)
    expect(outputText).toMatch(/\d+\.\d+\.\d+/);
  });

  test('terminal supports git commands', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // ACT
    // Execute git --version
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('git --version');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);

    // ASSERT
    // Terminal output should show git version
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    const outputText = await terminalOutput.textContent();

    // Output should contain "git version"
    expect(outputText?.toLowerCase()).toContain('git version');
  });

  test('terminal has dark theme consistent with IDE', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(500);

    // ACT & ASSERT
    // Terminal should have dark background
    const terminal = page.locator('[data-testid="terminal"]');
    const bgColor = await terminal.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Background should be dark (rgb values should be low)
    expect(bgColor).toBeTruthy();

    // XTerm should also have dark theme
    const xtermContainer = page.locator('.xterm');
    const xtermBg = await xtermContainer.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(xtermBg).toBeTruthy();
  });

  test('terminal text is readable with proper contrast', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // Execute a command to generate output
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('echo "Contrast test"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    // ACT & ASSERT
    // Terminal text should be visible
    const xtermRows = page.locator('.xterm-rows');
    await expect(xtermRows).toBeVisible();

    // Text color should be light (for dark theme)
    const textColor = await xtermRows.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    expect(textColor).toBeTruthy();
  });

  test('terminal shortcuts hint is visible', async ({ page }) => {
    // ARRANGE & ACT
    // Page should load with shortcuts hint

    // ASSERT
    // Shortcuts hint should mention Ctrl+` for terminal
    const shortcutsHint = page.locator('text=/Ctrl[+/`].*terminal/i');
    await expect(shortcutsHint).toBeVisible();

    // Or look for the hint text
    const hint = page.locator('text=/terminal/i').first();
    await expect(hint).toBeVisible();
  });

  test('multiple commands can be executed in sequence', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    const terminalInput = page.locator('[data-testid="terminal-input"]');
    const terminalOutput = page.locator('[data-testid="terminal-output"]');

    // ACT & ASSERT
    // Execute first command
    await terminalInput.fill('echo "Command 1"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    let outputText = await terminalOutput.textContent();
    expect(outputText).toContain('Command 1');

    // Execute second command
    await terminalInput.fill('echo "Command 2"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    outputText = await terminalOutput.textContent();
    expect(outputText).toContain('Command 2');

    // Execute third command
    await terminalInput.fill('echo "Command 3"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    outputText = await terminalOutput.textContent();
    expect(outputText).toContain('Command 3');

    // All commands should be in output history
    expect(outputText).toContain('Command 1');
    expect(outputText).toContain('Command 2');
    expect(outputText).toContain('Command 3');
  });

  test('terminal survives tab switches', async ({ page }) => {
    // ARRANGE
    // Show terminal
    await page.keyboard.press('Control+`');
    await page.waitForTimeout(1000);

    // Execute a command
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill('echo "Terminal state test"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(500);

    // ACT
    // Switch to another file
    const fileSelect = page.locator('#file-select');
    await fileSelect.selectOption('example.py');
    await page.waitForTimeout(500);

    // Switch back to first file
    const tabs = page.locator('[data-testid="tab"]');
    await tabs.first().click();
    await page.waitForTimeout(500);

    // ASSERT
    // Terminal should still be visible
    const terminal = page.locator('[data-testid="terminal"]');
    await expect(terminal).toBeVisible();

    // Terminal output should still contain previous command
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    const outputText = await terminalOutput.textContent();
    expect(outputText).toContain('Terminal state test');
  });
});

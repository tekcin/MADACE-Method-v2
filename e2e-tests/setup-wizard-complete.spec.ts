/**
 * E2E Test: Setup Wizard Complete Flow
 *
 * Tests the complete setup wizard flow through all 4 steps:
 * 1. Project Information
 * 2. LLM Configuration
 * 3. Module Selection
 * 4. Summary & Save
 *
 * Verifies form filling, validation, navigation, config persistence,
 * and error handling.
 */

import { test, expect } from '@playwright/test';
import {
  navigateToSetup,
  fillSetupStep1,
  fillLLMConfig,
  waitForAPIResponse,
  generateTestProject,
  generateTestLLMConfig,
  clearBrowserData,
  clickAndWait,
  waitForToast,
  mockAPIResponse,
  isVisible,
} from './utils/test-helpers';

test.describe('Setup Wizard Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing configuration
    await clearBrowserData(page);
    await page.goto('/');
  });

  test('should complete full setup wizard flow', async ({ page }) => {
    // Step 1: Navigate to setup
    await navigateToSetup(page);

    // Verify we're on the setup page
    await expect(page.locator('h1')).toContainText('MADACE Setup Wizard');

    // Verify step 1 is displayed
    await expect(page.locator('h2')).toContainText('Project Information');

    // Fill step 1 (Project Info)
    const testProject = generateTestProject();
    await fillSetupStep1(page, {
      projectName: testProject.projectName,
      outputFolder: testProject.outputFolder,
      userName: testProject.userName,
      language: testProject.language,
    });

    // Verify values were filled correctly
    await expect(page.locator('#projectName')).toHaveValue(testProject.projectName);
    await expect(page.locator('#outputFolder')).toHaveValue(testProject.outputFolder);
    await expect(page.locator('#userName')).toHaveValue(testProject.userName);
    await expect(page.locator('#communicationLanguage')).toHaveValue(testProject.language);

    // Click Next to go to step 2
    await page.click('button:has-text("Next")');

    // Step 2: LLM Configuration
    await expect(page.locator('h2')).toContainText('LLM Configuration');

    // Fill LLM config
    const testLLM = generateTestLLMConfig();
    await fillLLMConfig(page, {
      provider: testLLM.provider,
      apiKey: testLLM.apiKey,
      model: testLLM.model,
    });

    // Verify provider is selected (button should have blue border)
    const geminiButton = page.locator('button:has-text("Google Gemini")');
    await expect(geminiButton).toHaveClass(/border-blue-600/);

    // Verify API key and model are filled
    await expect(page.locator('#apiKey')).toHaveValue(testLLM.apiKey);
    await expect(page.locator('#model')).toHaveValue(testLLM.model);

    // Click Next to go to step 3
    await page.click('button:has-text("Next")');

    // Step 3: Module Configuration
    await expect(page.locator('h2')).toContainText('Module Selection');

    // MAM should be checked by default (recommended)
    await expect(page.locator('#mam')).toBeChecked();

    // Enable MAB module
    const mabCheckbox = page.locator('#mab');
    if (!(await mabCheckbox.isChecked())) {
      await mabCheckbox.check();
    }
    await expect(mabCheckbox).toBeChecked();

    // CIS should remain unchecked
    await expect(page.locator('#cis')).not.toBeChecked();

    // Click Next to go to step 4
    await page.click('button:has-text("Next")');

    // Step 4: Summary
    await expect(page.locator('h2')).toContainText('Summary');

    // Verify summary shows correct values (checking text content)
    const summaryContent = await page.locator('.space-y-6').textContent();
    expect(summaryContent).toContain(testProject.projectName);
    expect(summaryContent).toContain(testProject.outputFolder);
    expect(summaryContent).toContain(testProject.userName);

    // Setup dialog handler BEFORE mocking API and clicking
    const dialogPromise = new Promise<void>((resolve) => {
      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toContain('Setup complete');
        await dialog.accept();
        resolve();
      });
    });

    // Mock successful config save
    await mockAPIResponse(
      page,
      /\/api\/config$/,
      {
        success: true,
        message: 'Configuration saved successfully',
        paths: {
          config: '/app/madace-data/config/config.yaml',
          env: '/app/madace-data/config/.env',
        },
      },
      { status: 200, method: 'POST' }
    );

    // Click Finish
    await page.click('button:has-text("Finish Setup")');

    // Wait for dialog to be handled
    await dialogPromise;

    // Wait for redirect to home page (with timeout)
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('should validate required fields on step 1', async ({ page }) => {
    await navigateToSetup(page);

    // Clear the project name field (it has a default value)
    await page.fill('#projectName', '');

    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');

    // Should still be on step 1 (validation should prevent navigation)
    await expect(page.locator('h2')).toContainText('Project Information');

    // Fill required fields
    const testProject = generateTestProject();
    await fillSetupStep1(page, testProject);

    // Now Next should work
    await page.click('button:has-text("Next")');
    await expect(page.locator('h2')).toContainText('LLM Configuration');
  });

  test('should allow navigation between steps', async ({ page }) => {
    await navigateToSetup(page);

    // Fill step 1
    const testProject = generateTestProject();
    await fillSetupStep1(page, testProject);
    await page.click('button:has-text("Next")');

    // Now on step 2
    await expect(page.locator('h2')).toContainText('LLM Configuration');

    // Fill step 2
    const testLLM = generateTestLLMConfig();
    await fillLLMConfig(page, testLLM);
    await page.click('button:has-text("Next")');

    // Now on step 3
    await expect(page.locator('h2')).toContainText('Module Selection');

    // Go back to step 2
    await page.click('button:has-text("Previous")');
    await expect(page.locator('h2')).toContainText('LLM Configuration');

    // Verify data is preserved (API key should still be there)
    await expect(page.locator('#apiKey')).toHaveValue(testLLM.apiKey);

    // Go back to step 1
    await page.click('button:has-text("Previous")');
    await expect(page.locator('h2')).toContainText('Project Information');

    // Verify data is preserved
    await expect(page.locator('#projectName')).toHaveValue(testProject.projectName);

    // Previous button should be disabled on step 1
    const previousButton = page.locator('button:has-text("Previous")');
    await expect(previousButton).toBeDisabled();
  });

  test('should preserve form data when navigating forward and backward', async ({ page }) => {
    await navigateToSetup(page);

    // Fill all steps
    const testProject = generateTestProject();
    const testLLM = generateTestLLMConfig();

    // Step 1
    await fillSetupStep1(page, testProject);
    await page.click('button:has-text("Next")');

    // Step 2
    await fillLLMConfig(page, testLLM);
    await page.click('button:has-text("Next")');

    // Step 3
    await page.check('#mab');
    await page.click('button:has-text("Next")');

    // Step 4 - Summary
    await expect(page.locator('h2')).toContainText('Summary');

    // Navigate back through all steps
    await page.click('button:has-text("Previous")');
    await expect(page.locator('#mab')).toBeChecked();

    await page.click('button:has-text("Previous")');
    await expect(page.locator('#apiKey')).toHaveValue(testLLM.apiKey);

    await page.click('button:has-text("Previous")');
    await expect(page.locator('#projectName')).toHaveValue(testProject.projectName);

    // Navigate forward again
    await page.click('button:has-text("Next")');
    await expect(page.locator('#apiKey')).toHaveValue(testLLM.apiKey);

    await page.click('button:has-text("Next")');
    await expect(page.locator('#mab')).toBeChecked();

    await page.click('button:has-text("Next")');
    await expect(page.locator('h2')).toContainText('Summary');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await navigateToSetup(page);

    // Fill all steps quickly
    const testProject = generateTestProject();
    await fillSetupStep1(page, testProject);
    await page.click('button:has-text("Next")');

    const testLLM = generateTestLLMConfig();
    await fillLLMConfig(page, testLLM);
    await page.click('button:has-text("Next")');

    await page.click('button:has-text("Next")');

    // Mock API error
    await mockAPIResponse(
      page,
      /\/api\/config$/,
      {
        success: false,
        error: 'Failed to save configuration',
      },
      { status: 500, method: 'POST' }
    );

    // Try to finish
    await page.click('button:has-text("Finish Setup")');

    // Should show error message in the UI
    await page.waitForTimeout(1000); // Wait for error state to update

    // Error should be visible (check for error-related text or styling)
    const errorMessage = page.locator('.bg-red-50, .text-red-700, .text-red-800');
    const hasError = await isVisible(errorMessage.first(), 2000);
    expect(hasError).toBe(true);

    // Should stay on summary step (not redirect)
    await expect(page.locator('h2')).toContainText('Summary');

    // Finish button should be re-enabled for retry
    const finishButton = page.locator('button:has-text("Finish Setup")');
    await expect(finishButton).toBeEnabled();
  });

  test('should show loading state when saving configuration', async ({ page }) => {
    await navigateToSetup(page);

    // Fill all steps quickly
    const testProject = generateTestProject();
    await fillSetupStep1(page, testProject);
    await page.click('button:has-text("Next")');

    const testLLM = generateTestLLMConfig();
    await fillLLMConfig(page, testLLM);
    await page.click('button:has-text("Next")');

    await page.click('button:has-text("Next")');

    // Setup dialog handler
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Mock slow API response
    await page.route(/\/api\/config$/, async (route) => {
      if (route.request().method() === 'POST') {
        // Delay response by 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Configuration saved',
            paths: {
              config: '/app/madace-data/config/config.yaml',
              env: '/app/madace-data/config/.env',
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Click Finish
    await page.click('button:has-text("Finish Setup")');

    // Should show loading state (button text changes)
    await expect(page.locator('button:has-text("Saving...")')).toBeVisible({ timeout: 1000 });

    // Button should be disabled while loading
    const finishButton = page.locator('button:has-text("Saving...")');
    await expect(finishButton).toBeDisabled();

    // Wait for redirect
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('should toggle modules correctly', async ({ page }) => {
    await navigateToSetup(page);

    // Navigate to module selection step
    const testProject = generateTestProject();
    await fillSetupStep1(page, testProject);
    await page.click('button:has-text("Next")');

    const testLLM = generateTestLLMConfig();
    await fillLLMConfig(page, testLLM);
    await page.click('button:has-text("Next")');

    // Now on module selection
    await expect(page.locator('h2')).toContainText('Module Selection');

    // MAM should be checked by default
    const mamCheckbox = page.locator('#mam');
    await expect(mamCheckbox).toBeChecked();

    // MAB should be unchecked
    const mabCheckbox = page.locator('#mab');
    await expect(mabCheckbox).not.toBeChecked();

    // CIS should be unchecked
    const cisCheckbox = page.locator('#cis');
    await expect(cisCheckbox).not.toBeChecked();

    // Toggle MAM off
    await mamCheckbox.uncheck();
    await expect(mamCheckbox).not.toBeChecked();

    // Toggle MAB on
    await mabCheckbox.check();
    await expect(mabCheckbox).toBeChecked();

    // Toggle CIS on
    await cisCheckbox.check();
    await expect(cisCheckbox).toBeChecked();

    // Toggle MAM back on
    await mamCheckbox.check();
    await expect(mamCheckbox).toBeChecked();

    // Go to summary and verify module selections are shown
    await page.click('button:has-text("Next")');
    const summaryContent = await page.textContent('.space-y-6');
    expect(summaryContent).toContain('MAM');
    expect(summaryContent).toContain('MAB');
    expect(summaryContent).toContain('CIS');
  });

  test('should switch LLM providers correctly', async ({ page }) => {
    await navigateToSetup(page);

    // Navigate to LLM config step
    const testProject = generateTestProject();
    await fillSetupStep1(page, testProject);
    await page.click('button:has-text("Next")');

    // Default should be Gemini
    const geminiButton = page.locator('button:has-text("Google Gemini")');
    await expect(geminiButton).toHaveClass(/border-blue-600/);

    // Switch to Claude
    const claudeButton = page.locator('button:has-text("Anthropic Claude")');
    await claudeButton.click();
    await expect(claudeButton).toHaveClass(/border-blue-600/);
    await expect(geminiButton).not.toHaveClass(/border-blue-600/);

    // Model should update to Claude default
    await expect(page.locator('#model')).toHaveValue('claude-3-5-sonnet-20241022');

    // Switch to OpenAI
    const openaiButton = page.locator('button:has-text("OpenAI")');
    await openaiButton.click();
    await expect(openaiButton).toHaveClass(/border-blue-600/);
    await expect(claudeButton).not.toHaveClass(/border-blue-600/);

    // Model should update to OpenAI default
    await expect(page.locator('#model')).toHaveValue('gpt-4-turbo-preview');

    // Switch to Local
    const localButton = page.locator('button:has-text("Local (Ollama)")');
    await localButton.click();
    await expect(localButton).toHaveClass(/border-blue-600/);

    // Model should update to Local default
    await expect(page.locator('#model')).toHaveValue('llama2');

    // API key should show "Optional" for local
    const apiKeyLabel = page.locator('label[for="apiKey"]');
    await expect(apiKeyLabel).toContainText('Optional');
  });

  test('should display step indicator correctly', async ({ page }) => {
    await navigateToSetup(page);

    // Step 1 should be current (has blue indicator)
    const stepIndicators = page.locator('ol.flex li');
    await expect(stepIndicators).toHaveCount(4);

    // Check first step has current styling
    const firstStep = stepIndicators.nth(0);
    const firstStepSpan = firstStep.locator('span').first();
    await expect(firstStepSpan).toHaveClass(/border-blue-600/);

    // Navigate to step 2
    const testProject = generateTestProject();
    await fillSetupStep1(page, testProject);
    await page.click('button:has-text("Next")');

    // First step should show check mark (completed)
    const checkIcon = firstStep.locator('svg');
    await expect(checkIcon).toBeVisible();

    // Navigate to step 3
    const testLLM = generateTestLLMConfig();
    await fillLLMConfig(page, testLLM);
    await page.click('button:has-text("Next")');

    // First two steps should be completed
    await expect(stepIndicators.nth(0).locator('svg')).toBeVisible();
    await expect(stepIndicators.nth(1).locator('svg')).toBeVisible();

    // Navigate to step 4
    await page.click('button:has-text("Next")');

    // First three steps should be completed
    await expect(stepIndicators.nth(0).locator('svg')).toBeVisible();
    await expect(stepIndicators.nth(1).locator('svg')).toBeVisible();
    await expect(stepIndicators.nth(2).locator('svg')).toBeVisible();
  });
});

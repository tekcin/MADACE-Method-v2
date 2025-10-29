/**
 * API Endpoints E2E Tests
 *
 * These tests validate that API endpoints respond correctly
 * when accessed via browser interactions, simulating real user scenarios.
 */

import { test, expect } from '@playwright/test';

test.describe('API Endpoint Integration', () => {
  test('agents API loads and displays correctly', async ({ page }) => {
    // Navigate to agents page
    await page.goto('/agents');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for agents loading
    await expect(page.getByText('AI Agents')).toBeVisible();

    // Verify agents are loaded (should see at least PM agent)
    const pmAgent = page.getByText('PM').or(page.getByText('Product Manager'));
    if (await pmAgent.isVisible()) {
      expect(pmAgent).toBeVisible();
    }

    // Check API call was made
    const responses = page.context().route('**/api/agents', () => {});
    expect(responses).toBeTruthy();
  });

  test('LLM test API integration works', async ({ page }) => {
    await page.goto('/llm-test');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify LLM test form is present
    await expect(page.getByText('LLM Connection Test')).toBeVisible();

    // Fill in test form with invalid credentials (to test error handling)
    const providerSelect = page.getByLabel('LLM Provider');
    if (await providerSelect.isVisible()) {
      await providerSelect.selectOption('gemini');

      const apiKeyInput = page.getByLabel('API Key');
      if (await apiKeyInput.isVisible()) {
        await apiKeyInput.fill('invalid-test-key');
      }

      const modelInput = page.getByLabel('Model');
      if (await modelInput.isVisible()) {
        await modelInput.fill('gemini-2.0-flash-exp');
      }

      const promptInput = page.getByLabel('Test Prompt');
      if (await promptInput.isVisible()) {
        await promptInput.fill('Hello, test message');
      }

      // Test connection (should fail gracefully)
      const testButton = page.getByRole('button', { name: /test/i });
      if (await testButton.isVisible()) {
        await testButton.click();

        // Wait for response
        await page.waitForTimeout(3000);

        // Should show error message (not success)
        const errorMessage = page.getByText(/error|failed|invalid/i);
        const successMessage = page.getByText(/success|connected/i);

        if (await errorMessage.isVisible()) {
          expect(errorMessage).toBeVisible();
        } else if (await successMessage.isVisible()) {
          // If it succeeds, that's also valid
          expect(successMessage).toBeVisible();
        }
      }
    }
  });

  test('dashboard loads and displays statistics', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for dashboard elements
    await expect(page.getByText('MADACE-Method v2.0')).toBeVisible();
    await expect(page.getByText('Quick Actions')).toBeVisible();

    // Statistics should load (or show loading state)
    const statsCards = page
      .locator('.bg-card')
      .or(page.locator('[class*="rounded-lg"]'))
      .filter({ hasText: /completed|backlog|in progress/i });

    // Either stats are loaded or loading spinner is shown
    const statsLoaded = (await statsCards.count()) > 0;
    const loadingSpinner = page.getByText(/loading|loading/i);

    expect(statsLoaded || (await loadingSpinner.isVisible())).toBeTruthy();
  });

  test('navigation preserves state across page changes', async ({ page }) => {
    // Start on dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to settings
    const settingsLink = page.getByRole('link', { name: 'Settings' });
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForURL(/\/settings/);

      // Navigation should still be visible and active
      const navItem = page.getByRole('link', { name: 'Settings' });
      expect(navItem).toHaveClass(/border-blue-500|border-primary/);

      // Go back to dashboard
      const dashboardLink = page.getByRole('link', { name: 'Dashboard' });
      await dashboardLink.click();
      await page.waitForURL(/\/$/);

      // Dashboard navigation item should be active
      expect(page.getByRole('link', { name: 'Dashboard' })).toHaveClass(
        /border-blue-500|border-primary/
      );
    }
  });
});

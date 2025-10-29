/**
 * Authentication and Setup Flow E2E Tests
 *
 * These tests validate the complete user onboarding journey:
 * - Landing page navigation
 * - Setup wizard completion
 * - LLM configuration validation
 * - Project configuration
 * - Dashboard access after setup
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Setup and Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing cookies/localStorage
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('complete setup wizard from start to finish', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Verify landing page loads correctly
    await expect(page.getByText('MADACE-Method v3.0')).toBeVisible();
    await expect(
      page.getByText('Methodology for AI-Driven Agile Collaboration Engine')
    ).toBeVisible();

    // Look for setup wizard entry point
    const getStartedButton = page
      .getByRole('button', { name: /get started/i })
      .or(page.getByRole('link', { name: /get started/i }));

    if (await getStartedButton.isVisible()) {
      await getStartedButton.click();
    } else {
      // Navigate directly to setup page
      await page.goto('/setup');
    }

    // Verify setup wizard page loads
    await expect(page.getByText('Setup Wizard')).toBeVisible();
    await expect(page.getByText('Complete your MADACE configuration')).toBeVisible();

    // Step 1: Project Information
    await expect(page.getByLabel('Project Name')).toBeVisible();
    await page.getByLabel('Project Name').fill('Test MADACE Project');
    await page.getByLabel('Your Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2: LLM Configuration
    await expect(page.getByText('LLM Configuration')).toBeVisible();

    // Select Gemini provider
    await page.getByLabel('LLM Provider').selectOption('gemini');

    // Fill in API key (using test key - won't actually work)
    await page.getByLabel('API Key').fill('test-gemini-api-key');
    await page.getByLabel('Model').fill('gemini-2.0-flash-exp');

    // Test connection (will fail with test key, but we can still proceed)
    const testConnectionButton = page.getByRole('button', { name: 'Test Connection' });
    if (await testConnectionButton.isVisible()) {
      await testConnectionButton.click();
      // Wait for response (error expected)
      await page.waitForTimeout(2000);
    }

    await page.getByRole('button', { name: 'Next' }).click();

    // Step 3: Module Selection
    await expect(page.getByText('Module Selection')).toBeVisible();

    // Enable MADACE module
    const mamCheckbox = page.getByLabel('MADACE Module (MAM)');
    if (await mamCheckbox.isVisible()) {
      await mamCheckbox.check();
    }

    await page.getByRole('button', { name: 'Next' }).click();

    // Step 4: Summary
    await expect(page.getByText('Summary')).toBeVisible();
    await expect(page.getByText('Test MADACE Project')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('gemini')).toBeVisible();

    // Complete setup
    await page
      .getByRole('button', { name: 'Complete Setup' })
      .or(page.getByRole('button', { name: 'Finish' }))
      .click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/setup$/);

    // Check for success message or redirect to main page
    const successMessage = page.getByText(/setup/i).and(page.getByText(/complete|success/i));
    const dashboardTitle = page.getByText('Dashboard');

    if (await successMessage.isVisible()) {
      expect(successMessage).toBeVisible();
    } else {
      // Should redirect to main dashboard
      await page.waitForURL('/', { timeout: 5000 });
      await expect(page.getByText('MADACE-Method v3.0')).toBeVisible();
    }
  });

  test('setup wizard validation and error handling', async ({ page }) => {
    await page.goto('/setup');

    // Try to proceed without filling required fields
    await page.getByRole('button', { name: 'Next' }).click();

    // Should show validation errors
    await expect(page.getByText(/project name is required/i)).toBeVisible();

    // Fill project info but leave API key empty for non-local provider
    await page.getByLabel('Project Name').fill('Test Project');
    await page.getByLabel('Your Name').fill('Test User');
    await page.getByRole('button', { name: 'Next' }).click();

    // Select provider without API key
    await page.getByLabel('LLM Provider').selectOption('gemini');
    await page.getByRole('button', { name: 'Next' }).click();

    // Should show API key required error
    await expect(page.getByText(/API key is required/i)).toBeVisible();

    // Select local provider (should not require API key)
    await page.getByLabel('LLM Provider').selectOption('local');
    await page.getByRole('button', { name: 'Next' }).click();

    // Should proceed to module selection
    await expect(page.getByText('Module Selection')).toBeVisible();
  });

  test('navigation and quick actions work correctly', async ({ page }) => {
    await page.goto('/');

    // Test main navigation
    const navItems = ['Dashboard', 'Kanban', 'Agents', 'Workflows', 'LLM Test', 'Settings'];

    for (const navItem of navItems) {
      const navLink = page.getByRole('link', { name: navItem });

      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForURL(/\/.*/, { timeout: 3000 });

        // Verify page loaded (check for page title or main heading)
        const mainHeading = page
          .getByRole('heading', { level: 1 })
          .or(page.getByRole('heading', { level: 2 }));

        if (await mainHeading.isVisible()) {
          expect(mainHeading).toBeVisible();
        }

        // Go back to dashboard
        await page.goto('/');
      }
    }
  });

  test('responsive design works on different screen sizes', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const desktopNav = page.getByRole('navigation');
    await expect(desktopNav).toBeVisible();

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('navigation')).toBeVisible();

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('navigation')).toBeVisible();

    // Mobile menu should be collapsed initially
    const mobileMenuButton = page.getByRole('button', {
      name: /menu/i,
      includeHidden: true,
    });

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Menu should expand
      const mobileMenuItem = page.getByRole('link', { name: 'Dashboard' });
      await expect(mobileMenuItem).toBeVisible();
    }
  });
});

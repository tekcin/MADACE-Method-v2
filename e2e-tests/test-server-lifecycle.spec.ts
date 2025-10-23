/**
 * Server Lifecycle Test
 *
 * This test verifies that the dev server can be started and stopped
 * properly during test execution.
 */

import { test, expect } from '@playwright/test';

test.describe('Server Lifecycle', () => {
  test('dev server is running and accessible', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify server responds
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
  });

  test('API endpoints are accessible', async ({ request }) => {
    // Test agents API
    const agentsResponse = await request.get('http://localhost:3000/api/agents');
    expect(agentsResponse.ok()).toBeTruthy();

    // Test health endpoint
    const healthResponse = await request.get('http://localhost:3000/api/health');
    expect(healthResponse.ok()).toBeTruthy();
  });

  test('server handles multiple concurrent requests', async ({ page, context }) => {
    // Create multiple pages
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    const page3 = await context.newPage();

    // Navigate all pages concurrently
    await Promise.all([page1.goto('/'), page2.goto('/agents'), page3.goto('/setup')]);

    // Verify all pages loaded
    await expect(page1.locator('h1').first()).toBeVisible();
    await expect(page2.locator('h1').first()).toBeVisible();
    await expect(page3.locator('h1').first()).toBeVisible();

    // Close pages
    await page1.close();
    await page2.close();
    await page3.close();
  });
});

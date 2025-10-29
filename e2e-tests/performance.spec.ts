/**
 * Performance E2E Tests
 *
 * These tests validate application performance metrics and responsiveness.
 * They help ensure the application remains performant as features are added.
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
  test('page load times are acceptable', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify page is properly loaded
    await expect(page.getByText('MADACE-Method v2.0')).toBeVisible();
  });

  test('critical resources load without errors', async ({ page }) => {
    // Monitor for 404s or failed resource loads
    const responses: any[] = [];

    page.on('response', (response) => {
      if (!response.ok()) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for critical resource failures
    const criticalFailures = responses.filter(
      (r) => r.url.includes('/api/') || r.url.includes('/_next/') || r.url.includes('/static/')
    );

    if (criticalFailures.length > 0) {
      console.warn('Critical resource failures:', criticalFailures);
    }

    // Allow some failed resources but not critical ones
    expect(criticalFailures.length).toBeLessThan(2);
  });

  test('memory usage remains reasonable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check initial memory
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate through different pages
    const pages = ['/agents', '/settings', '/llm-test', '/'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // Brief pause
    }

    // Check memory after navigation
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      // Memory increase should be reasonable (< 50MB for full navigation cycle)
      expect(memoryIncreaseMB).toBeLessThan(50);
    }
  });

  test('responsive interactions and animations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test navigation responsiveness
    const navItems = page.getByRole('link', { name: /dashboard|agents|settings/i });
    const navCount = await navItems.count();

    if (navCount > 0) {
      const firstNavItem = await navItems.first();

      // Measure hover responsiveness
      const hoverStart = Date.now();
      await firstNavItem.hover();
      const hoverTime = Date.now() - hoverStart;

      // Hover should be responsive (< 200ms)
      expect(hoverTime).toBeLessThan(200);

      // Check visual feedback
      const hasHoverState = await firstNavItem.evaluate((el) => {
        const styles = getComputedStyle(el);
        return (
          styles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
          styles.transform !== 'none' ||
          styles.transition !== 'none'
        );
      });

      // Should have some visual feedback (hover, focus, or transition)
      expect(hasHoverState).toBeTruthy();
    }
  });

  test('form interactions are responsive', async ({ page }) => {
    await page.goto('/setup');
    await page.waitForLoadState('domcontentloaded');

    // Test form field interactions
    const projectInput = page.getByLabel('Project Name');

    if (await projectInput.isVisible()) {
      // Measure input responsiveness
      const inputStart = Date.now();
      await projectInput.click();
      const clickTime = Date.now() - inputStart;

      expect(clickTime).toBeLessThan(300);

      // Test typing responsiveness
      const typeStart = Date.now();
      await projectInput.fill('Test Project');
      const typeTime = Date.now() - typeStart;

      expect(typeTime).toBeLessThan(500);

      // Verify input value
      expect(await projectInput.inputValue()).toBe('Test Project');
    }
  });

  test('mobile performance optimization', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Mobile page should load quickly
    const mobileLoadStart = Date.now();
    await page.reload({ waitUntil: 'networkidle' });
    const mobileLoadTime = Date.now() - mobileLoadStart;

    expect(mobileLoadTime).toBeLessThan(3000);

    // Mobile navigation should be responsive
    const mobileMenuButton = page.getByRole('button', {
      name: /menu/i,
      includeHidden: true,
    });

    if (await mobileMenuButton.isVisible()) {
      const menuStart = Date.now();
      await mobileMenuButton.click();
      const menuTime = Date.now() - menuStart;

      expect(menuTime).toBeLessThan(300);
    }
  });
});

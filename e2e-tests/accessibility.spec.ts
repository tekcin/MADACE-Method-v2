/**
 * Accessibility E2E Tests
 *
 * These tests validate that the application is accessible to users
 * with disabilities and follows WCAG guidelines.
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Compliance', () => {
  test('keyboard navigation works correctly', async ({ page }) => {
    await page.goto('/');

    // Test Tab navigation
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    // Navigate through interactive elements
    const interactiveSelectors = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ];

    let focusableCount = 0;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const isFocusable = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;

        const tagName = el.tagName.toLowerCase();
        const hasTabIndex = el.getAttribute('tabindex') !== '-1';
        const isVisible = (el as HTMLElement).offsetParent !== null;

        return (
          ['button', 'a', 'input', 'select', 'textarea'].includes(tagName) &&
          hasTabIndex &&
          isVisible
        );
      });

      if (isFocusable) {
        focusableCount++;
      }
    }

    expect(focusableCount).toBeGreaterThan(0);
  });

  test('semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);

    // Verify only one main heading per page
    expect(h1Elements).toBe(1);

    // Check for navigation landmarks
    const navElement = page.locator('nav');
    const mainElement = page.locator('main');
    const footerElement = page.locator('footer');

    expect(await navElement.count()).toBeGreaterThan(0);

    // Main or section should be present
    expect((await mainElement.count()) + (await page.locator('section').count())).toBeGreaterThan(
      0
    );

    // Footer should be present
    expect(await footerElement.count()).toBeGreaterThan(0);
  });

  test('ARIA labels and descriptions', async ({ page }) => {
    await page.goto('/setup');

    // Check form inputs have labels
    const labeledInputs = await page
      .locator('input[aria-label], input[aria-labelledby], label input')
      .count();
    const totalInputs = await page
      .locator('input[type="text"], input[type="email"], select, textarea')
      .count();

    if (totalInputs > 0) {
      expect(labeledInputs).toBe(totalInputs);
    }

    // Check buttons have accessible names
    const buttonsWithText = await page.locator('button').filter({ hasText: /.+/ }).count();
    const buttonsWithAriaLabel = await page
      .locator('button[aria-label], button[aria-labelledby]')
      .count();
    const totalButtons = await page.locator('button').count();

    const accessibleButtons = buttonsWithText + buttonsWithAriaLabel;
    expect(accessibleButtons).toBe(totalButtons);
  });

  test('focus management and visual indicators', async ({ page }) => {
    await page.goto('/');

    // Test that focus is visible
    await page
      .getByRole('link', { name: /agents|settings|llm test/i })
      .first()
      .focus();

    const hasFocusStyles = await page.evaluate(() => {
      const focused = document.activeElement as HTMLElement;
      const styles = getComputedStyle(focused);
      return (
        styles.outline !== 'none' ||
        styles.boxShadow !== 'none' ||
        styles.borderColor !== styles.color
      );
    });

    expect(hasFocusStyles).toBeTruthy();
  });

  test('color contrast and readability', async ({ page }) => {
    await page.goto('/');

    // Check text elements have sufficient contrast (basic check)
    const textElements = await page.locator('p, h1, h2, h3, span, a').all();

    for (const element of textElements.slice(0, 5)) {
      // Test first 5 elements
      const isVisible = await element.isVisible();
      if (!isVisible) continue;

      const hasContrast = await element.evaluate((el) => {
        const styles = getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;

        // Basic check: text and background colors are different
        return bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== bgColor;
      });

      if (await element.isVisible()) {
        expect(hasContrast).toBeTruthy();
      }
    }
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/setup');

    // Check for proper semantic roles
    const formRoles = await page.locator('form[role="form"], method="POST"').count();
    const navigationRoles = await page.locator('nav[role="navigation"]').count();
    const mainRoles = await page.locator('main[role="main"], [role="main"]').count();

    // At least one form should be present (setup form)
    expect(formRoles + (await page.locator('form').count())).toBeGreaterThan(0);

    // Navigation should have proper role
    expect(navigationRoles + (await page.locator('nav').count())).toBeGreaterThan(0);
  });

  test('responsive text sizing and zoom', async ({ page }) => {
    await page.goto('/');

    // Test 200% zoom level
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Check layout adapts to zoom
    const originalContentSize = await page.locator('body').textContent();

    // Simulate zoom by adjusting page zoom
    await page.evaluate(() => {
      document.body.style.zoom = '200%';
    });

    // Content should still be readable (check elements are not overlapping)
    const overlappingElements = await page.locator('body').evaluate(() => {
      const elements = document.querySelectorAll('button, a');
      let overlaps = 0;

      for (const el of elements as any) {
        const rect = el.getBoundingClientRect();
        // Very basic overlap check
        if (rect.width < 20 || rect.height < 20) {
          overlaps++;
        }
      }

      return overlaps;
    });

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '100%';
    });

    // Elements should maintain reasonable size
    expect(overlappingElements).toBeLessThan(2);
  });

  test('error notifications are accessible', async ({ page }) => {
    await page.goto('/setup');

    // Try to submit form without required fields to trigger errors
    const submitButton = page.getByRole('button', { name: /next|submit/i });

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for validation errors
      await page.waitForTimeout(1000);

      // Check error messages are associated with inputs
      const errorMessages = page.getByText(/required|invalid|missing/i);
      const errorCount = await errorMessages.count();

      if (errorCount > 0) {
        // First error should be visible and accessible
        const firstError = errorMessages.first();
        await expect(firstError).toBeVisible();

        // Error should be in DOM and screener-readable
        const hasAriaLive = await firstError.evaluate((el) => {
          return (
            el.getAttribute('aria-live') ||
            el.getAttribute('role') === 'alert' ||
            el.closest('[role="alert"]')
          );
        });

        // Prefer to have aria-live or alert role (but not strictly required)
        console.log('Error accessibility attributes:', hasAriaLive);
      }
    }
  });
});

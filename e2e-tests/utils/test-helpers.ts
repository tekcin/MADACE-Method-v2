/**
 * Test Helper Utilities for Playwright E2E Tests
 *
 * Provides common functions for testing, assertions, and test data management
 */

import { Page, expect, Locator } from '@playwright/test';

/**
 * Wait for network idle (all pending requests complete)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for element to be visible and stable (not animating)
 */
export async function waitForStableElement(
  locator: Locator,
  timeout = 5000
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
  await locator.waitFor({ state: 'attached', timeout });
  // Wait for animations to complete
  await new Promise((resolve) => setTimeout(resolve, 300));
}

/**
 * Retry an action until it succeeds or timeout
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    errorMessage?: string;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, errorMessage = 'Action failed after retries' } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(
          `${errorMessage} (attempt ${attempt}/${maxAttempts}): ${error instanceof Error ? error.message : String(error)}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(errorMessage);
}

/**
 * Fill form field with retry on failure
 */
export async function fillFormField(
  locator: Locator,
  value: string,
  options: { clear?: boolean; pressEnter?: boolean } = {}
): Promise<void> {
  const { clear = true, pressEnter = false } = options;

  await retryAction(
    async () => {
      if (clear) {
        await locator.clear();
      }
      await locator.fill(value);
      // Verify the value was set
      await expect(locator).toHaveValue(value);
      if (pressEnter) {
        await locator.press('Enter');
      }
    },
    { errorMessage: `Failed to fill field with value: ${value}` }
  );
}

/**
 * Click element with retry and wait for navigation if needed
 */
export async function clickAndWait(
  locator: Locator,
  options: { waitForNavigation?: boolean; timeout?: number } = {}
): Promise<void> {
  const { waitForNavigation = false, timeout = 5000 } = options;

  await retryAction(
    async () => {
      if (waitForNavigation) {
        const page = locator.page();
        await Promise.all([
          page.waitForLoadState('networkidle', { timeout }),
          locator.click(),
        ]);
      } else {
        await locator.click();
      }
    },
    { errorMessage: 'Failed to click element' }
  );
}

/**
 * Select dropdown option with retry
 */
export async function selectDropdown(
  locator: Locator,
  value: string
): Promise<void> {
  await retryAction(
    async () => {
      await locator.selectOption(value);
      // Verify selection
      await expect(locator).toHaveValue(value);
    },
    { errorMessage: `Failed to select dropdown value: ${value}` }
  );
}

/**
 * Wait for API response and return data
 */
export async function waitForAPIResponse<T = any>(
  page: Page,
  urlPattern: string | RegExp,
  options: { timeout?: number; method?: string } = {}
): Promise<T> {
  const { timeout = 10000, method } = options;

  const response = await page.waitForResponse(
    (resp) => {
      const matchesUrl =
        typeof urlPattern === 'string'
          ? resp.url().includes(urlPattern)
          : urlPattern.test(resp.url());
      const matchesMethod = method ? resp.request().method() === method : true;
      return matchesUrl && matchesMethod;
    },
    { timeout }
  );

  if (!response.ok()) {
    throw new Error(
      `API request failed: ${response.status()} ${response.statusText()}`
    );
  }

  return await response.json();
}

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  mockData: any,
  options: { status?: number; method?: string } = {}
): Promise<void> {
  const { status = 200, method = 'GET' } = options;

  await page.route(urlPattern, async (route) => {
    if (route.request().method() === method) {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Take screenshot with custom name
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options: { fullPage?: boolean } = {}
): Promise<Buffer> {
  const { fullPage = false } = options;
  return await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage,
  });
}

/**
 * Get element text content safely
 */
export async function getTextContent(locator: Locator): Promise<string> {
  const text = await locator.textContent();
  return text?.trim() || '';
}

/**
 * Check if element is visible (without throwing)
 */
export async function isVisible(locator: Locator, timeout = 1000): Promise<boolean> {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all visible elements matching selector
 */
export async function getVisibleElements(
  page: Page,
  selector: string
): Promise<Locator[]> {
  const elements = await page.locator(selector).all();
  const visible = [];
  for (const element of elements) {
    if (await isVisible(element)) {
      visible.push(element);
    }
  }
  return visible;
}

/**
 * Wait for element count to match expected
 */
export async function waitForElementCount(
  locator: Locator,
  expectedCount: number,
  timeout = 5000
): Promise<void> {
  await expect(locator).toHaveCount(expectedCount, { timeout });
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(locator: Locator): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  // Wait for scroll animation
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Type text with human-like delays
 */
export async function typeSlowly(
  locator: Locator,
  text: string,
  delayMs = 50
): Promise<void> {
  await locator.focus();
  for (const char of text) {
    await locator.type(char, { delay: delayMs });
  }
}

/**
 * Verify accessibility (basic check)
 */
export async function checkAccessibility(locator: Locator): Promise<void> {
  // Check for aria-label or aria-labelledby
  const ariaLabel = await locator.getAttribute('aria-label');
  const ariaLabelledBy = await locator.getAttribute('aria-labelledby');
  const role = await locator.getAttribute('role');

  if (!ariaLabel && !ariaLabelledBy && !role) {
    console.warn('⚠️  Element may have accessibility issues (missing ARIA attributes)');
  }
}

/**
 * Wait for all images to load
 */
export async function waitForImages(page: Page): Promise<void> {
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = img.onerror = resolve;
            })
        )
    );
  });
}

/**
 * Generate random test data
 */
export function generateTestData(prefix = 'test'): {
  projectName: string;
  userName: string;
  email: string;
  timestamp: number;
} {
  const timestamp = Date.now();
  return {
    projectName: `${prefix}-project-${timestamp}`,
    userName: `${prefix}-user-${timestamp}`,
    email: `${prefix}-${timestamp}@test.com`,
    timestamp,
  };
}

/**
 * Clear local storage and cookies
 */
export async function clearBrowserData(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Set local storage item
 */
export async function setLocalStorage(
  page: Page,
  key: string,
  value: any
): Promise<void> {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key, value }
  );
}

/**
 * Get local storage item
 */
export async function getLocalStorage(page: Page, key: string): Promise<any> {
  return await page.evaluate((key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, key);
}

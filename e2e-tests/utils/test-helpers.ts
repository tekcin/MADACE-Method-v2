/**
 * Test Helper Utilities for Playwright E2E Tests
 *
 * Provides common functions for testing, assertions, and test data management.
 * Includes navigation helpers, form filling, wait utilities, element interaction,
 * test data generation, cleanup utilities, and assertion helpers.
 */

import { Page, expect, Locator } from '@playwright/test';

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Navigate to the setup wizard page
 */
export async function navigateToSetup(page: Page): Promise<void> {
  await page.goto('/setup');
  await expect(page).toHaveURL('/setup');
  await expect(page.locator('h1')).toContainText('Setup');
}

/**
 * Navigate to the agents page
 */
export async function navigateToAgents(page: Page): Promise<void> {
  await page.goto('/agents');
  await expect(page).toHaveURL('/agents');
}

/**
 * Navigate to the workflows page
 */
export async function navigateToWorkflows(page: Page): Promise<void> {
  await page.goto('/workflows');
  await expect(page).toHaveURL('/workflows');
}

/**
 * Navigate to the settings page
 */
export async function navigateToSettings(page: Page): Promise<void> {
  await page.goto('/settings');
  await expect(page).toHaveURL('/settings');
}

/**
 * Navigate to the home page
 */
export async function navigateToHome(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page).toHaveURL('/');
}

// ============================================================================
// FORM HELPERS
// ============================================================================

/**
 * Fill the first step of the setup wizard (Project Information)
 */
export async function fillSetupStep1(
  page: Page,
  data: {
    projectName: string;
    outputFolder: string;
    userName: string;
    language: string;
  }
): Promise<void> {
  await page.fill('[name="projectName"]', data.projectName);
  await page.fill('[name="outputFolder"]', data.outputFolder);
  await page.fill('[name="userName"]', data.userName);
  await page.selectOption('[name="language"]', data.language);
}

/**
 * Fill the LLM configuration form
 */
export async function fillLLMConfig(
  page: Page,
  data: {
    provider: 'gemini' | 'claude' | 'openai' | 'local';
    apiKey?: string;
    model?: string;
  }
): Promise<void> {
  await page.click(`[data-provider="${data.provider}"]`);
  if (data.apiKey) {
    await page.fill('[name="apiKey"]', data.apiKey);
  }
  if (data.model) {
    await page.fill('[name="model"]', data.model);
  }
}

// ============================================================================
// WAIT HELPERS
// ============================================================================

/**
 * Wait for network idle (all pending requests complete)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for specific API call to complete and return response
 */
export async function waitForAPICall(
  page: Page,
  urlPattern: string | RegExp
): Promise<void> {
  await page.waitForResponse(
    (response) =>
      (typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url())) && response.status() === 200
  );
}

/**
 * Wait for toast notification to appear
 */
export async function waitForToast(page: Page): Promise<Locator> {
  const toast = page.locator('[role="alert"]').first();
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  return toast;
}

/**
 * Wait for element to be visible and stable (not animating)
 */
export async function waitForStableElement(locator: Locator, timeout = 5000): Promise<void> {
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

// ============================================================================
// ELEMENT INTERACTION HELPERS
// ============================================================================

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
 * Accepts both Locator and Page + selector pattern
 */
export async function clickAndWait(
  target: Locator | Page,
  selectorOrOptions?: string | { waitForNavigation?: boolean; timeout?: number },
  options?: { waitForNavigation?: boolean; timeout?: number }
): Promise<void> {
  let locator: Locator;
  let actualOptions: { waitForNavigation?: boolean; timeout?: number } = {};

  // Handle overloaded parameters - check if it has page() method (Locator has it, Page doesn't)
  if ('page' in target && typeof target.page === 'function') {
    // target is Locator
    locator = target as Locator;
    actualOptions =
      typeof selectorOrOptions === 'object' ? selectorOrOptions : { waitForNavigation: false };
  } else {
    // target is Page
    if (typeof selectorOrOptions !== 'string') {
      throw new Error('Selector must be provided when first argument is Page');
    }
    locator = (target as Page).locator(selectorOrOptions);
    actualOptions = options || { waitForNavigation: false };
  }

  const { waitForNavigation = false, timeout = 5000 } = actualOptions;

  await retryAction(
    async () => {
      if (waitForNavigation) {
        const page = locator.page();
        await Promise.all([page.waitForLoadState('networkidle', { timeout }), locator.click()]);
      } else {
        await locator.click();
      }
    },
    { errorMessage: 'Failed to click element' }
  );
}

/**
 * Select dropdown option with retry
 * Supports both native select and custom dropdowns
 */
export async function selectDropdown(
  target: Locator | Page,
  valueOrSelector?: string,
  value?: string
): Promise<void> {
  let locator: Locator;
  let actualValue: string;

  // Handle overloaded parameters - check if it has page() method (Locator has it, Page doesn't)
  if ('page' in target && typeof target.page === 'function') {
    // target is Locator
    locator = target as Locator;
    actualValue = valueOrSelector!;
  } else {
    // target is Page
    if (!valueOrSelector || !value) {
      throw new Error('Both selector and value must be provided when first argument is Page');
    }
    locator = (target as Page).locator(valueOrSelector);
    actualValue = value;
  }

  await retryAction(
    async () => {
      // Try native select first
      try {
        await locator.selectOption(actualValue);
        await expect(locator).toHaveValue(actualValue);
      } catch {
        // Fallback to custom dropdown (click to open, then select option)
        await locator.click();
        const page = locator.page();
        await page.click(`[data-value="${actualValue}"]`);
      }
    },
    { errorMessage: `Failed to select dropdown value: ${actualValue}` }
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
    throw new Error(`API request failed: ${response.status()} ${response.statusText()}`);
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
export async function getVisibleElements(page: Page, selector: string): Promise<Locator[]> {
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
export async function typeSlowly(locator: Locator, text: string, delayMs = 50): Promise<void> {
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

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/**
 * Generate test project configuration
 */
export function generateTestProject() {
  const timestamp = Date.now();
  return {
    projectName: `Test Project ${timestamp}`,
    outputFolder: `output-${timestamp}`,
    userName: 'Test User',
    language: 'en',
  };
}

/**
 * Generate test LLM configuration
 */
export function generateTestLLMConfig() {
  return {
    provider: 'gemini' as const,
    apiKey: 'test-api-key-' + Math.random().toString(36).substr(2, 9),
    model: 'gemini-2.0-flash-exp',
  };
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

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Clear local storage
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Clear session storage
 */
export async function clearSessionStorage(page: Page): Promise<void> {
  await page.evaluate(() => sessionStorage.clear());
}

/**
 * Reset app to initial state (clear storage and navigate to home)
 */
export async function resetApp(page: Page): Promise<void> {
  await clearLocalStorage(page);
  await clearSessionStorage(page);
  await page.goto('/');
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
export async function setLocalStorage(page: Page, key: string, value: any): Promise<void> {
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

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Expect element to be visible
 */
export async function expectElementVisible(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector)).toBeVisible();
}

/**
 * Expect element to be hidden
 */
export async function expectElementHidden(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector)).toBeHidden();
}

/**
 * Expect element to contain text
 */
export async function expectTextContent(page: Page, selector: string, text: string): Promise<void> {
  await expect(page.locator(selector)).toContainText(text);
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Common selectors used across tests
 */
export const SELECTORS = {
  // Navigation
  NAV_HOME: 'a[href="/"]',
  NAV_SETUP: 'a[href="/setup"]',
  NAV_AGENTS: 'a[href="/agents"]',
  NAV_WORKFLOWS: 'a[href="/workflows"]',
  NAV_SETTINGS: 'a[href="/settings"]',

  // Setup Wizard
  SETUP_STEP_INDICATOR: '[data-testid="step-indicator"]',
  SETUP_NEXT_BUTTON: 'button:has-text("Next")',
  SETUP_BACK_BUTTON: 'button:has-text("Back")',
  SETUP_SUBMIT_BUTTON: 'button:has-text("Complete Setup")',

  // Forms
  INPUT_PROJECT_NAME: '[name="projectName"]',
  INPUT_OUTPUT_FOLDER: '[name="outputFolder"]',
  INPUT_USER_NAME: '[name="userName"]',
  SELECT_LANGUAGE: '[name="language"]',
  INPUT_API_KEY: '[name="apiKey"]',
  INPUT_MODEL: '[name="model"]',

  // Common UI
  TOAST: '[role="alert"]',
  LOADING_SPINNER: '[data-testid="loading"]',
  ERROR_MESSAGE: '[role="alert"][data-severity="error"]',
  SUCCESS_MESSAGE: '[role="alert"][data-severity="success"]',
};

/**
 * Common error messages for assertions
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_API_KEY: 'Invalid API key',
  CONNECTION_FAILED: 'Connection failed',
  NETWORK_ERROR: 'Network error',
};

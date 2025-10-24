/**
 * Visual Regression Testing Utilities
 *
 * Provides helpers for visual comparison testing using Playwright's built-in
 * screenshot comparison capabilities
 */

import { Page, Locator, expect } from '@playwright/test';
import path from 'path';

export interface VisualTestOptions {
  /**
   * Maximum allowed pixel difference (0-1)
   * 0 = exact match, 1 = completely different
   */
  maxDiffPixelRatio?: number;

  /**
   * Maximum allowed pixel difference in absolute pixels
   */
  maxDiffPixels?: number;

  /**
   * Threshold for color difference (0-1)
   */
  threshold?: number;

  /**
   * Whether to take full page screenshot
   */
  fullPage?: boolean;

  /**
   * CSS selector to clip screenshot to
   */
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * Animations to disable before screenshot
   */
  animations?: 'disabled' | 'allow';

  /**
   * Mask elements (hide them in screenshot)
   */
  mask?: Locator[];
}

/**
 * Compare page screenshot with baseline
 */
export async function comparePageSnapshot(
  page: Page,
  snapshotName: string,
  options: VisualTestOptions = {}
): Promise<void> {
  const {
    maxDiffPixelRatio = 0.01, // 1% difference allowed
    maxDiffPixels,
    threshold = 0.2,
    fullPage = false,
    clip,
    animations = 'disabled',
    mask = [],
  } = options;

  // Wait for page to be stable
  await page.waitForLoadState('networkidle');

  // Disable animations if requested
  if (animations === 'disabled') {
    await disableAnimations(page);
  }

  // Take screenshot and compare
  await expect(page).toHaveScreenshot(`${snapshotName}.png`, {
    maxDiffPixelRatio,
    maxDiffPixels,
    threshold,
    fullPage,
    clip,
    mask,
    animations,
  });
}

/**
 * Compare element screenshot with baseline
 */
export async function compareElementSnapshot(
  locator: Locator,
  snapshotName: string,
  options: VisualTestOptions = {}
): Promise<void> {
  const {
    maxDiffPixelRatio = 0.01,
    maxDiffPixels,
    threshold = 0.2,
    animations = 'disabled',
    mask = [],
  } = options;

  const page = locator.page();

  // Wait for element to be stable
  await locator.waitFor({ state: 'visible' });

  // Disable animations if requested
  if (animations === 'disabled') {
    await disableAnimations(page);
  }

  // Take screenshot and compare
  await expect(locator).toHaveScreenshot(`${snapshotName}.png`, {
    maxDiffPixelRatio,
    maxDiffPixels,
    threshold,
    mask,
    animations,
  });
}

/**
 * Disable all CSS animations and transitions
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });

  // Wait for animations to stop
  await page.waitForTimeout(100);
}

/**
 * Compare multiple viewport sizes
 */
export async function compareResponsiveSnapshots(
  page: Page,
  snapshotName: string,
  viewports: Array<{ width: number; height: number; name: string }>,
  options: VisualTestOptions = {}
): Promise<void> {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForLoadState('networkidle');
    await comparePageSnapshot(page, `${snapshotName}-${viewport.name}`, options);
  }
}

/**
 * Common viewport presets
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1920, height: 1080, name: 'desktop' },
  desktopHD: { width: 2560, height: 1440, name: 'desktopHD' },
};

/**
 * Compare dark mode vs light mode
 */
export async function compareThemeSnapshots(
  page: Page,
  snapshotName: string,
  options: VisualTestOptions = {}
): Promise<void> {
  // Light mode
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForLoadState('networkidle');
  await comparePageSnapshot(page, `${snapshotName}-light`, options);

  // Dark mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForLoadState('networkidle');
  await comparePageSnapshot(page, `${snapshotName}-dark`, options);
}

/**
 * Compare hover state
 */
export async function compareHoverSnapshot(
  locator: Locator,
  snapshotName: string,
  options: VisualTestOptions = {}
): Promise<void> {
  // Normal state
  await compareElementSnapshot(locator, `${snapshotName}-normal`, options);

  // Hover state
  await locator.hover();
  await locator.page().waitForTimeout(200); // Wait for hover transition
  await compareElementSnapshot(locator, `${snapshotName}-hover`, options);
}

/**
 * Compare focus state
 */
export async function compareFocusSnapshot(
  locator: Locator,
  snapshotName: string,
  options: VisualTestOptions = {}
): Promise<void> {
  // Normal state
  await compareElementSnapshot(locator, `${snapshotName}-normal`, options);

  // Focus state
  await locator.focus();
  await locator.page().waitForTimeout(200); // Wait for focus transition
  await compareElementSnapshot(locator, `${snapshotName}-focus`, options);
}

/**
 * Compare loading state
 */
export async function compareLoadingSnapshot(
  page: Page,
  snapshotName: string,
  triggerAction: () => Promise<void>,
  options: VisualTestOptions = {}
): Promise<void> {
  // Before loading
  await comparePageSnapshot(page, `${snapshotName}-before`, options);

  // Trigger loading (don't wait for completion)
  const loadingPromise = triggerAction();

  // During loading (wait a bit for spinner to appear)
  await page.waitForTimeout(100);
  await comparePageSnapshot(page, `${snapshotName}-loading`, options);

  // After loading
  await loadingPromise;
  await page.waitForLoadState('networkidle');
  await comparePageSnapshot(page, `${snapshotName}-after`, options);
}

/**
 * Compare scrolled state
 */
export async function compareScrollSnapshot(
  page: Page,
  snapshotName: string,
  scrollPositions: Array<{ x: number; y: number; name: string }>,
  options: VisualTestOptions = {}
): Promise<void> {
  for (const pos of scrollPositions) {
    await page.evaluate(({ x, y }) => {
      window.scrollTo(x, y);
    }, pos);
    await page.waitForTimeout(200); // Wait for scroll
    await comparePageSnapshot(page, `${snapshotName}-${pos.name}`, options);
  }
}

/**
 * Mask dynamic content (dates, times, IDs, etc.)
 */
export async function maskDynamicContent(
  page: Page,
  selectors: string[]
): Promise<Locator[]> {
  const masks: Locator[] = [];
  for (const selector of selectors) {
    const elements = await page.locator(selector).all();
    masks.push(...elements);
  }
  return masks;
}

/**
 * Common dynamic content selectors
 */
export const DYNAMIC_CONTENT_SELECTORS = [
  '[data-testid="timestamp"]',
  '[data-testid="date"]',
  '[data-testid="time"]',
  '[data-testid="uuid"]',
  '[data-testid="id"]',
  '.timestamp',
  '.date',
  '.time',
  '.uuid',
  '.id',
];

/**
 * Wait for fonts to load before screenshot
 */
export async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100); // Extra buffer
}

/**
 * Prepare page for visual testing
 */
export async function preparePageForVisualTest(page: Page): Promise<void> {
  // Wait for everything to load
  await page.waitForLoadState('networkidle');

  // Wait for fonts
  await waitForFonts(page);

  // Wait for images
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

  // Disable animations
  await disableAnimations(page);

  // Small buffer for final rendering
  await page.waitForTimeout(200);
}

/**
 * Compare component in different states
 */
export async function compareComponentStates(
  locator: Locator,
  snapshotName: string,
  states: Array<{ name: string; setup: () => Promise<void> }>,
  options: VisualTestOptions = {}
): Promise<void> {
  for (const state of states) {
    await state.setup();
    await locator.page().waitForTimeout(200); // Wait for state change
    await compareElementSnapshot(locator, `${snapshotName}-${state.name}`, options);
  }
}

/**
 * Generate visual test report
 */
export function generateVisualTestReport(results: {
  total: number;
  passed: number;
  failed: number;
  failedTests: string[];
}): string {
  const passRate = ((results.passed / results.total) * 100).toFixed(2);

  return `
Visual Regression Test Report
=============================
Total Tests: ${results.total}
Passed: ${results.passed}
Failed: ${results.failed}
Pass Rate: ${passRate}%

${results.failed > 0 ? `Failed Tests:\n${results.failedTests.map((t) => `  - ${t}`).join('\n')}` : 'All tests passed! ✅'}
  `;
}

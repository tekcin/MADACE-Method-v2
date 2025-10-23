import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for MADACE-Method v2.0
 *
 * This configuration enables Claude Code to run comprehensive E2E tests
 * that validate the entire application stack from user interactions
 * to backend API responses.
 *
 * Usage: npx playwright test
 * UI Mode: npx playwright test --ui
 * Debug Mode: npx playwright test --debug
 * Report: npx playwright test --report=html
 */

export default defineConfig({
  // Global setup timeout for slower development machines
  timeout: 30000,

  // Global timeout for each test
  expect: {
    timeout: 5000,
  },

  // Test directory configuration
  testDir: './e2e-tests',

  // If a test fails, retry it 2 times
  retries: 2,

  // Limit the number of workers based on CI vs local
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Global timeout for navigation actions
    actionTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet browsers
    {
      name: 'iPad Safari',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./e2e-tests/global-setup.ts'),
  globalTeardown: require.resolve('./e2e-tests/global-teardown.ts'),
});

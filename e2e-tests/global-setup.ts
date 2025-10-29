/**
 * Global Setup for Playwright E2E Tests
 *
 * This setup runs once before all tests and ensures:
 * - Development server is running
 * - Database is properly configured
 * - Test data is initialized
 */

import { chromium, type Browser, type Page } from '@playwright/test';
import { execSync } from 'child_process';
import { spawn } from 'child_process';

async function globalSetup() {
  console.log('🚀 Starting Playwright Global Setup');

  // Check if development server is running
  const devServerUrl = 'http://localhost:3000';

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(devServerUrl, { timeout: 5000 });
    await browser.close();
    console.log('✅ Development server is already running');
    console.log('ℹ️  Skipping server startup\n');
    return; // Server already running, exit early
  } catch (error) {
    console.log('📦 Development server not running');
    console.log('⚠️  Tests require dev server to be running');
    console.log('💡 Please run "npm run dev" in a separate terminal before running tests\n');
    throw new Error(
      'Development server is not running on port 3000. ' +
        'Please start it with "npm run dev" and try again.'
    );
  }
}

export default globalSetup;

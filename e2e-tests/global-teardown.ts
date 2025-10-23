/**
 * Global Teardown for Playwright E2E Tests
 *
 * This cleanup runs after all tests.
 * Since we don't start the dev server automatically,
 * there's nothing to tear down.
 */

async function globalTeardown() {
  console.log('\n🛑 Starting Playwright Global Teardown');
  console.log('ℹ️  No cleanup needed (dev server runs externally)');
  console.log('✅ Teardown completed\n');
}

export default globalTeardown;

# MADACE E2E Testing Guide

**Version:** 2.1.0-alpha
**Last Updated:** 2025-10-23
**Test Framework:** Playwright
**Methodology:** MADACE Method

---

## Table of Contents

- [Overview](#overview)
- [MADACE Testing Philosophy](#madace-testing-philosophy)
- [E2E Testing Strategy](#e2e-testing-strategy)
- [Setup & Installation](#setup--installation)
- [Test Structure](#test-structure)
- [Critical User Workflows](#critical-user-workflows)
- [Writing E2E Tests](#writing-e2e-tests)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides a comprehensive approach to End-to-End (E2E) testing for MADACE v2.0 using Playwright and the MADACE Method's systematic testing workflow.

### What is E2E Testing?

E2E testing verifies that complete user workflows function correctly from start to finish, testing the entire application stack (frontend, API, database, external services).

### Why Playwright?

- **Cross-browser testing** (Chromium, Firefox, WebKit)
- **Auto-wait** for elements (reduces flaky tests)
- **Powerful selectors** (text, CSS, accessibility)
- **Built-in test runner** with parallel execution
- **Screenshots & videos** on failure
- **TypeScript support** out of the box

---

## MADACE Testing Philosophy

The MADACE Method applies a **scale-adaptive approach** to testing, just like it does for development:

### Scale-Adaptive Testing (Test Levels)

| Level | Project Complexity | E2E Test Coverage             | Test Depth                |
| ----- | ------------------ | ----------------------------- | ------------------------- |
| **0** | Proof of Concept   | Smoke tests only              | Happy path only           |
| **1** | Simple Feature     | Core workflows                | Happy path + 1 error case |
| **2** | Standard Project   | All critical workflows        | Happy path + error cases  |
| **3** | Complex Product    | All workflows + edge cases    | Comprehensive             |
| **4** | Enterprise System  | Full test suite + performance | Exhaustive                |

**MADACE Principle**: _Test just enough to ensure quality, never more._

### Testing Pyramid (MADACE Adaptation)

```
                /\
               /  \  E2E Tests (10%)
              /    \  - Critical user workflows
             /      \  - Integration points
            /________\
           /          \ Integration Tests (30%)
          /            \  - API routes
         /              \  - Component interactions
        /________________\
       /                  \ Unit Tests (60%)
      /                    \  - Business logic
     /                      \  - Utilities
    /________________________\ - Pure functions
```

---

## E2E Testing Strategy

### 1. Critical User Workflows (Must Test)

These are the **core workflows** that users must complete successfully:

#### Setup & Configuration

- ✅ **Setup Wizard** - New user completes initial configuration
- ✅ **LLM Configuration** - User configures LLM provider
- ✅ **Module Selection** - User selects and enables modules

#### Agent Operations

- ✅ **Agent Discovery** - User browses available agents
- ✅ **Agent Viewing** - User views agent details
- ✅ **Agent Management** - User creates/edits/deletes custom agents

#### Workflow Execution

- ✅ **Workflow Status** - User checks project status
- ✅ **Story Creation** - User creates a development story
- ✅ **Story Progression** - Story moves through states (TODO → IN PROGRESS → DONE)

#### State Management

- ✅ **Kanban Board** - User views and manages stories on Kanban
- ✅ **State Validation** - System enforces one-at-a-time rules

### 2. Integration Points (Should Test)

- ✅ LLM provider connections (Gemini, Claude, OpenAI, Local)
- ✅ File system operations (config, workflows, state)
- ✅ Database operations (agents, state persistence)
- ✅ Real-time sync (WebSocket state updates)

### 3. Edge Cases (Nice to Have)

- ⚠️ Error recovery (API failures, network issues)
- ⚠️ Concurrent users
- ⚠️ Large datasets
- ⚠️ Browser compatibility

---

## Setup & Installation

### 1. Install Playwright

Playwright is already added to `package.json` devDependencies:

```bash
# Install dependencies (includes Playwright)
npm install

# Install browsers
npx playwright install

# Install system dependencies (Linux only)
npx playwright install-deps
```

### 2. Project Structure

```
MADACE-Method-v2.0/
├── e2e/                          # E2E test directory
│   ├── setup/
│   │   ├── setup-wizard.spec.ts  # Setup wizard flow
│   │   └── llm-config.spec.ts    # LLM configuration
│   ├── agents/
│   │   ├── agent-list.spec.ts    # Agent browsing
│   │   ├── agent-view.spec.ts    # Agent details
│   │   └── agent-manage.spec.ts  # Agent CRUD
│   ├── workflows/
│   │   ├── workflow-status.spec.ts  # Status checking
│   │   └── story-creation.spec.ts   # Story creation
│   ├── kanban/
│   │   ├── kanban-board.spec.ts     # Kanban operations
│   │   └── state-transitions.spec.ts # State changes
│   ├── fixtures/
│   │   ├── test-data.ts          # Test data
│   │   └── test-helpers.ts       # Helper functions
│   └── utils/
│       ├── page-objects.ts       # Page object models
│       └── test-utils.ts         # Utility functions
│
├── playwright.config.ts          # Playwright configuration
└── .github/workflows/
    └── e2e-tests.yml             # CI/CD E2E tests
```

### 3. Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [['html'], ['list'], ['junit', { outputFile: 'test-results/junit.xml' }]],

  // Shared settings
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Projects (browsers)
  projects: [
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
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Dev server
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## Test Structure

### MADACE Test Pattern (AAA)

All E2E tests follow the **Arrange-Act-Assert** pattern:

```typescript
import { test, expect } from '@playwright/test';

test('user completes critical workflow', async ({ page }) => {
  // ARRANGE - Set up test conditions
  await page.goto('/start-page');
  await setupTestData();

  // ACT - Perform user actions
  await page.click('button:has-text("Start")');
  await page.fill('input[name="field"]', 'value');
  await page.click('button:has-text("Submit")');

  // ASSERT - Verify expected outcomes
  await expect(page.locator('text=Success')).toBeVisible();
  await expect(page).toHaveURL('/success-page');
});
```

### Page Object Model (POM)

Encapsulate page interactions in reusable classes:

```typescript
// e2e/utils/page-objects.ts
export class SetupWizardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/setup');
  }

  async fillProjectInfo(projectName: string, userName: string) {
    await this.page.fill('[name="projectName"]', projectName);
    await this.page.fill('[name="userName"]', userName);
  }

  async selectLLMProvider(provider: 'gemini' | 'claude' | 'openai') {
    await this.page.click(`[data-provider="${provider}"]`);
  }

  async fillAPIKey(apiKey: string) {
    await this.page.fill('[name="apiKey"]', apiKey);
  }

  async clickNext() {
    await this.page.click('button:has-text("Next")');
  }

  async clickFinish() {
    await this.page.click('button:has-text("Finish")');
  }

  async expectSuccess() {
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
  }
}
```

### Test Fixtures

Reusable test data and setup:

```typescript
// e2e/fixtures/test-data.ts
export const testConfig = {
  projectName: 'E2E Test Project',
  userName: 'Test User',
  outputFolder: 'test-output',
  language: 'en',
};

export const testLLMConfig = {
  provider: 'gemini' as const,
  apiKey: process.env.TEST_GEMINI_API_KEY || 'test-api-key',
  model: 'gemini-2.0-flash-exp',
};

export const mockAgent = {
  name: 'test-agent',
  title: 'Test Agent',
  icon: '🧪',
  module: 'test',
  persona: {
    role: 'Test Role',
    identity: 'Test Identity',
    communication_style: 'Test Style',
    principles: ['Test Principle 1', 'Test Principle 2'],
  },
};
```

---

## Critical User Workflows

### Workflow 1: Setup Wizard (New User Onboarding)

**Priority:** CRITICAL
**Complexity:** Level 2
**User Story:** As a new user, I want to complete the setup wizard so I can start using MADACE.

```typescript
// e2e/setup/setup-wizard.spec.ts
import { test, expect } from '@playwright/test';
import { SetupWizardPage } from '../utils/page-objects';
import { testConfig, testLLMConfig } from '../fixtures/test-data';

test.describe('Setup Wizard', () => {
  let wizardPage: SetupWizardPage;

  test.beforeEach(async ({ page }) => {
    wizardPage = new SetupWizardPage(page);
    await wizardPage.goto();
  });

  test('new user completes full setup wizard', async ({ page }) => {
    // Step 1: Project Info
    await wizardPage.fillProjectInfo(testConfig.projectName, testConfig.userName);
    await wizardPage.clickNext();

    // Step 2: LLM Configuration
    await wizardPage.selectLLMProvider(testLLMConfig.provider);
    await wizardPage.fillAPIKey(testLLMConfig.apiKey);
    await page.selectOption('[name="model"]', testLLMConfig.model);
    await wizardPage.clickNext();

    // Step 3: Module Selection
    await page.check('[name="mam"]');
    await page.check('[name="mab"]');
    await wizardPage.clickNext();

    // Step 4: Summary & Confirm
    await expect(page.locator('text=' + testConfig.projectName)).toBeVisible();
    await expect(page.locator('text=' + testConfig.userName)).toBeVisible();
    await wizardPage.clickFinish();

    // Verify redirect to home
    await expect(page).toHaveURL('/');
    await wizardPage.expectSuccess();
  });

  test('user cannot proceed without required fields', async ({ page }) => {
    // Try to proceed without filling fields
    await wizardPage.clickNext();

    // Should show validation errors
    await expect(page.locator('text=Project name is required')).toBeVisible();

    // Fill required field
    await wizardPage.fillProjectInfo('Test', 'User');

    // Now can proceed
    await wizardPage.clickNext();
    await expect(page.locator('[data-step="2"]')).toBeVisible();
  });

  test('user can go back to previous steps', async ({ page }) => {
    // Complete step 1
    await wizardPage.fillProjectInfo('Test', 'User');
    await wizardPage.clickNext();

    // Go back
    await page.click('button:has-text("Previous")');

    // Verify back on step 1
    await expect(page.locator('[data-step="1"]')).toBeVisible();
    await expect(page.locator('[name="projectName"]')).toHaveValue('Test');
  });
});
```

### Workflow 2: Agent Management

**Priority:** HIGH
**Complexity:** Level 2
**User Story:** As a user, I want to browse, view, and manage agents.

```typescript
// e2e/agents/agent-operations.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Agent Management', () => {
  test('user browses agent list', async ({ page }) => {
    // Navigate to agents page
    await page.goto('/agents');

    // Should see agent list
    await expect(page.locator('[data-testid="agent-list"]')).toBeVisible();

    // Should see at least MAM agents (5 minimum)
    const agentCards = page.locator('[data-testid="agent-card"]');
    await expect(agentCards).toHaveCount(await agentCards.count());
    expect(await agentCards.count()).toBeGreaterThanOrEqual(5);

    // Should display agent info
    await expect(page.locator('text=Product Manager')).toBeVisible();
    await expect(page.locator('text=Business Analyst')).toBeVisible();
  });

  test('user views agent details', async ({ page }) => {
    await page.goto('/agents');

    // Click on PM agent
    await page.click('text=Product Manager');

    // Should navigate to details page
    await expect(page).toHaveURL(/\/agents\/.+/);

    // Should show agent details
    await expect(page.locator('[data-testid="agent-title"]')).toContainText('Product Manager');
    await expect(page.locator('[data-testid="agent-persona"]')).toBeVisible();
    await expect(page.locator('[data-testid="agent-menu"]')).toBeVisible();
  });

  test('user creates custom agent', async ({ page }) => {
    await page.goto('/agents/manage');

    // Click create button
    await page.click('button:has-text("Create Agent")');

    // Fill agent form
    await page.fill('[name="name"]', 'custom-agent');
    await page.fill('[name="title"]', 'Custom Agent');
    await page.fill('[name="icon"]', '🎯');
    await page.fill('[name="persona.role"]', 'Custom Role');

    // Submit
    await page.click('button:has-text("Save")');

    // Verify created
    await expect(page.locator('text=Agent created successfully')).toBeVisible();
    await expect(page.locator('text=Custom Agent')).toBeVisible();
  });
});
```

### Workflow 3: Kanban Board & State Management

**Priority:** CRITICAL
**Complexity:** Level 3
**User Story:** As a developer, I want to manage story states on the Kanban board.

```typescript
// e2e/kanban/kanban-operations.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Create test stories
    await page.goto('/kanban');
  });

  test('user views kanban board', async ({ page }) => {
    // Should see all columns
    await expect(page.locator('[data-column="backlog"]')).toBeVisible();
    await expect(page.locator('[data-column="todo"]')).toBeVisible();
    await expect(page.locator('[data-column="in-progress"]')).toBeVisible();
    await expect(page.locator('[data-column="done"]')).toBeVisible();

    // Should see stories
    const stories = page.locator('[data-testid="story-card"]');
    expect(await stories.count()).toBeGreaterThanOrEqual(0);
  });

  test('user moves story through workflow states', async ({ page }) => {
    // Assume we have a story in BACKLOG
    const storyCard = page.locator('[data-story-id="TEST-001"]').first();

    // Move to TODO
    await storyCard.dragTo(page.locator('[data-column="todo"]'));

    // Verify in TODO
    await expect(page.locator('[data-column="todo"] [data-story-id="TEST-001"]')).toBeVisible();

    // Move to IN PROGRESS
    await storyCard.dragTo(page.locator('[data-column="in-progress"]'));

    // Verify in IN PROGRESS
    await expect(
      page.locator('[data-column="in-progress"] [data-story-id="TEST-001"]')
    ).toBeVisible();

    // Move to DONE
    await storyCard.dragTo(page.locator('[data-column="done"]'));

    // Verify in DONE
    await expect(page.locator('[data-column="done"] [data-story-id="TEST-001"]')).toBeVisible();
  });

  test('system enforces one-at-a-time rule for TODO', async ({ page }) => {
    // Move story to TODO
    await page
      .locator('[data-story-id="TEST-001"]')
      .first()
      .dragTo(page.locator('[data-column="todo"]'));

    // Try to move another story to TODO
    await page
      .locator('[data-story-id="TEST-002"]')
      .first()
      .dragTo(page.locator('[data-column="todo"]'));

    // Should show error
    await expect(page.locator('text=Only one story can be in TODO')).toBeVisible();

    // Second story should not be in TODO
    await expect(page.locator('[data-column="todo"] [data-story-id="TEST-002"]')).not.toBeVisible();
  });
});
```

### Workflow 4: LLM Integration Testing

**Priority:** HIGH
**Complexity:** Level 3
**User Story:** As a user, I want to test my LLM connection before using it.

```typescript
// e2e/setup/llm-integration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('LLM Integration', () => {
  test('user tests LLM connection successfully', async ({ page }) => {
    await page.goto('/llm-test');

    // Select provider
    await page.selectOption('[name="provider"]', 'gemini');

    // Enter API key
    await page.fill('[name="apiKey"]', process.env.TEST_GEMINI_API_KEY || 'test-key');

    // Select model
    await page.selectOption('[name="model"]', 'gemini-2.0-flash-exp');

    // Test connection
    await page.click('button:has-text("Test Connection")');

    // Wait for response
    await page.waitForSelector('[data-testid="test-result"]', { timeout: 10000 });

    // Should show success
    await expect(page.locator('text=Connection successful')).toBeVisible();
    await expect(page.locator('[data-testid="llm-response"]')).toBeVisible();
  });

  test('user sees error for invalid API key', async ({ page }) => {
    await page.goto('/llm-test');

    // Select provider
    await page.selectOption('[name="provider"]', 'gemini');

    // Enter invalid API key
    await page.fill('[name="apiKey"]', 'invalid-key');

    // Select model
    await page.selectOption('[name="model"]', 'gemini-2.0-flash-exp');

    // Test connection
    await page.click('button:has-text("Test Connection")');

    // Should show error
    await expect(page.locator('text=Authentication failed')).toBeVisible();
  });
});
```

---

## Writing E2E Tests

### Best Practices

#### 1. Use Data Attributes for Selectors

```typescript
// Good - Stable selector
await page.click('[data-testid="submit-button"]');

// Bad - Fragile selector
await page.click('button.btn.btn-primary.mt-4');
```

#### 2. Wait for Elements Properly

```typescript
// Playwright auto-waits, but be explicit when needed
await page.waitForSelector('[data-testid="result"]');

// Wait for navigation
await Promise.all([page.waitForNavigation(), page.click('button:has-text("Submit")')]);

// Wait for API response
await page.waitForResponse((resp) => resp.url().includes('/api/agents'));
```

#### 3. Handle Asynchronous Operations

```typescript
// Wait for element to be visible
await expect(page.locator('[data-testid="success"]')).toBeVisible();

// Wait for specific state
await page.waitForLoadState('networkidle');

// Custom wait
await page.waitForFunction(() => window.dataLoaded === true);
```

#### 4. Isolate Tests

```typescript
test.beforeEach(async ({ page }) => {
  // Reset database state
  await resetTestDatabase();

  // Clear storage
  await page.context().clearCookies();
  await page.context().clearPermissions();

  // Set initial state
  await setupTestData();
});

test.afterEach(async ({ page }) => {
  // Clean up
  await cleanupTestData();
});
```

#### 5. Test User Interactions Realistically

```typescript
// Type like a user (with delay)
await page.type('[name="search"]', 'query', { delay: 100 });

// Click with mouse
await page.click('[data-testid="button"]');

// Use keyboard
await page.press('[name="input"]', 'Enter');

// Hover
await page.hover('[data-testid="menu-trigger"]');
```

#### 6. Assert Comprehensively

```typescript
// Check visibility
await expect(page.locator('[data-testid="element"]')).toBeVisible();

// Check text content
await expect(page.locator('h1')).toHaveText('Expected Title');

// Check attributes
await expect(page.locator('button')).toHaveAttribute('disabled', '');

// Check URL
await expect(page).toHaveURL('/expected-path');

// Check count
await expect(page.locator('.item')).toHaveCount(5);
```

---

## Running Tests

### Local Development

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/setup/setup-wizard.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in specific browser
npx playwright test --project=chromium

# Run with UI mode (interactive)
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Generate code (record interactions)
npx playwright codegen http://localhost:3000
```

### Watch Mode

```bash
# Watch for file changes
npx playwright test --watch
```

### Parallel Execution

```bash
# Run tests in parallel (default)
npx playwright test

# Run tests serially
npx playwright test --workers=1

# Limit parallel workers
npx playwright test --workers=4
```

### Test Reports

```bash
# Generate HTML report
npx playwright test --reporter=html

# Open HTML report
npx playwright show-report

# Generate JUnit report (for CI)
npx playwright test --reporter=junit

# Multiple reporters
npx playwright test --reporter=list --reporter=html
```

---

## Best Practices

### 1. MADACE Scale-Adaptive Testing

Apply the right level of testing based on project complexity:

**Level 0-1 Projects** (POC, Simple Features):

- ✅ Smoke tests only
- ✅ Happy path
- ❌ Skip edge cases

**Level 2 Projects** (Standard):

- ✅ All critical workflows
- ✅ Happy path + error cases
- ⚠️ Some edge cases

**Level 3-4 Projects** (Complex, Enterprise):

- ✅ Comprehensive test suite
- ✅ All workflows + edge cases
- ✅ Performance testing
- ✅ Accessibility testing

### 2. Test Independence

Each test should run independently:

```typescript
test.describe.configure({ mode: 'parallel' });

test('test 1', async ({ page }) => {
  // Completely independent
  await setupTest1Data();
  // ... test logic
  await cleanupTest1Data();
});

test('test 2', async ({ page }) => {
  // Completely independent
  await setupTest2Data();
  // ... test logic
  await cleanupTest2Data();
});
```

### 3. Use Test Fixtures

```typescript
// e2e/fixtures/base.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Log in user
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button:has-text("Login")');

    // Use the authenticated page
    await use(page);

    // Teardown: Log out
    await page.click('button:has-text("Logout")');
  },
});

// Use in tests
test('user accesses dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.locator('h1')).toHaveText('Dashboard');
});
```

### 4. Error Handling

```typescript
test('handles API errors gracefully', async ({ page }) => {
  // Intercept API request
  await page.route('**/api/agents', (route) => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });

  await page.goto('/agents');

  // Should show error message
  await expect(page.locator('text=Failed to load agents')).toBeVisible();

  // Should show retry button
  await expect(page.locator('button:has-text("Retry")')).toBeVisible();
});
```

### 5. Visual Regression Testing

```typescript
test('homepage looks correct', async ({ page }) => {
  await page.goto('/');

  // Take screenshot
  await expect(page).toHaveScreenshot('homepage.png');

  // Compare with baseline
  // First run creates baseline
  // Subsequent runs compare
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test
        env:
          TEST_GEMINI_API_KEY: ${{ secrets.TEST_GEMINI_API_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: test-results/
```

---

## Troubleshooting

### Common Issues

#### 1. Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solutions**:

```typescript
// Increase timeout
test('flaky test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds

  // Use reliable waits
  await page.waitForSelector('[data-testid="element"]', {
    state: 'visible',
    timeout: 10000,
  });

  // Wait for network to settle
  await page.waitForLoadState('networkidle');
});
```

#### 2. Element Not Found

**Problem**: Selector doesn't find element

**Solutions**:

```typescript
// Debug: Take screenshot
await page.screenshot({ path: 'debug.png' });

// Debug: Print page content
console.log(await page.content());

// Debug: Wait and retry
await page.waitForTimeout(1000);
await page.locator('[data-testid="element"]').click({ timeout: 5000 });
```

#### 3. Slow Tests

**Problem**: Tests take too long

**Solutions**:

```typescript
// Run in parallel
test.describe.configure({ mode: 'parallel' });

// Reduce waits
test.use({
  navigationTimeout: 30000,
  actionTimeout: 10000,
});

// Skip unnecessary steps
test.beforeEach(async ({ page }) => {
  // Skip animations
  await page.addInitScript(() => {
    (window as any).CSS.supports = () => false;
  });
});
```

---

## Resources

### Documentation

- **Playwright Docs**: https://playwright.dev/docs/intro
- **Best Practices**: https://playwright.dev/docs/best-practices
- **API Reference**: https://playwright.dev/docs/api/class-playwright

### Tools

- **Trace Viewer**: `npx playwright show-trace trace.zip`
- **Code Generator**: `npx playwright codegen`
- **UI Mode**: `npx playwright test --ui`

### Learning

- **Playwright University**: https://playwright.dev/docs/intro
- **Example Tests**: https://github.com/microsoft/playwright/tree/main/tests

---

## Summary

This E2E testing guide provides:

✅ **MADACE Method Integration** - Scale-adaptive testing approach
✅ **Playwright Setup** - Complete configuration and structure
✅ **Critical Workflows** - Tests for all key user journeys
✅ **Best Practices** - Page objects, fixtures, error handling
✅ **CI/CD Integration** - GitHub Actions workflow
✅ **Troubleshooting** - Common issues and solutions

**Next Steps**:

1. Install Playwright: `npx playwright install`
2. Create test directory: `mkdir e2e`
3. Write your first test (start with setup wizard)
4. Run tests: `npx playwright test`
5. Review report: `npx playwright show-report`

---

**Version:** 2.1.0-alpha
**Last Updated:** 2025-10-23
**Status:** ✅ Ready for Implementation

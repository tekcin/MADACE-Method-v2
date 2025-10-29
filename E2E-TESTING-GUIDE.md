# MADACE-Method v2.0 - Playwright E2E Testing Guide

> **Complete E2E Testing Procedure for Claude Code to Run**
>
> This guide provides everything needed to run comprehensive end-to-end tests on the MADACE-Method v2.0 application using Playwright.

## Overview

The E2E testing suite validates the complete user experience from browser interactions to backend API responses. These tests simulate real user journeys and ensure the application works end-to-end.

## Quick Start

### 1. Install Dependencies

```bash
# Install Playwright and dependencies
npm install --save-dev @playwright/test playwright

# Make the script executable
chmod +x scripts/run-e2e.sh

# Install browser binaries
npx playwright install
```

### 2. Run Tests (Claude Code Commands)

```bash
# Interactive menu (most user-friendly)
./scripts/run-e2e.sh

# Run all tests
./scripts/run-e2e.sh 1

# Run specific test suites
./scripts/run-e2e.sh 2  # Setup flow tests
./scripts/run-e2e.sh 3  # API endpoint tests
./scripts/run-e2e.sh 4  # Kanban board tests
./scripts/run-e2e.sh 5  # Performance tests
./scripts/run-e2e.sh 6  # Accessibility tests

# Debug mode (interactive, step-by-step)
./scripts/run-e2e.sh --debug

# Help
./scripts/run-e2e.sh --help
```

### 3. Direct Playwright Commands

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e-tests/auth-setup.spec.ts

# Run test with UI (visual debugging)
npx playwright test --ui

# Run in debug mode (step-by-step execution)
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

## Test Suites Overview

### 1. Setup Flow Tests (`auth-setup.spec.ts`)

**Purpose**: Validate the complete user onboarding journey

**Test Cases**:

- ✅ Complete setup wizard from start to finish
- ✅ Form validation and error handling
- ✅ Navigation and quick actions
- ✅ Responsive design on different screen sizes

**Key Validations**:

- Setup wizard progression works correctly
- LLM configuration validation
- Module selection functionality
- Error handling for invalid configurations

### 2. API Endpoint Tests (`api-endpoints.spec.ts`)

**Purpose**: Validate backend API integration through browser interactions

**Test Cases**:

- ✅ Agents API loading and display
- ✅ LLM test API integration
- ✅ Dashboard statistics loading
- ✅ Navigation state preservation

**Key Validations**:

- API calls complete successfully
- Error responses handled gracefully
- Data renders correctly in UI
- State management works across navigation

### 3. Kanban Board Tests (`kanban-board.spec.ts`)

**Purpose**: Test Kanban board functionality (implementation-aware)

**Test Cases**:

- ✅ Kanban board page loading
- ✅ Workflow status integration
- ✅ Drag and drop interactions (if implemented)
- ✅ State management validation

**Key Features**:

- Graceful handling of unimplemented features
- State machine rule validation
- Visual workflow representation

### 4. Performance Tests (`performance.spec.ts`)

**Purpose**: Validate application performance metrics

**Test Cases**:

- ✅ Page load times (< 3 seconds)
- ✅ Resource loading without errors
- ✅ Memory usage management (< 50MB increase)
- ✅ Responsive interactions (< 300ms)
- ✅ Mobile performance optimization

**Performance Metrics**:

- Load times
- Memory usage
- Interaction responsiveness
- Mobile optimization

### 5. Accessibility Tests (`accessibility.spec.ts`)

**Purpose**: Validate WCAG compliance and screen reader support

**Test Cases**:

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Semantic HTML structure
- ✅ ARIA labels and descriptions
- ✅ Focus management and indicators
- ✅ Color contrast and readability
- ✅ Screen reader compatibility
- ✅ Responsive text sizing
- ✅ Accessible error notifications

**Accessibility Standards**:

- WCAG 2.1 AA compliance
- Keyboard accessibility
- Screen reader support
- Color contrast validation

## Test Configuration

### Browser Support

The tests run on multiple browsers to ensure cross-platform compatibility:

- ✅ **Chromium** (Chrome/Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)
- ✅ **Mobile Chrome** (Android)
- ✅ **Mobile Safari** (iOS)
- ✅ **iPad Safari** (Tablet)

### Viewport Sizes

Tests validate responsive design across screen sizes:

- **Desktop**: 1920x1080
- **Tablet**: 768x1024
- **Mobile**: 375x667
- **iPad**: 1024x1366

### Test Environment Setup

The global setup automatically:

1. **Development Server**: Starts Next.js dev server on port 3000
2. **Database**: Initializes test data if needed
3. **Test Data**: Sets up consistent test environment
4. **Cleanup**: Properly stops server after tests

## Running Tests with Claude Code

### Option 1: Interactive Menu (Recommended)

```bash
./scripts/run-e2e.sh
```

This provides a user-friendly menu with numbered options:

- Type numbers 1-8 to select test suites
- Automatic server management
- Real-time progress indicators
- Built-in error reporting

### Option 2: Direct Commands

```bash
# Claude Code can run these directly:
npm run e2e                    # All tests
npm run e2e:ui                # Interactive UI mode
npm run e2e:debug             # Step-by-step debugging
npm run e2e:install           # Install browsers only
```

### Option 3: Individual Test Files

```bash
# Run specific test files
npx playwright test e2e-tests/auth-setup.spec.ts
npx playwright test e2e-tests/api-endpoints.spec.ts
npx playwright test e2e-tests/performance.spec.ts
```

## Debugging and Troubleshooting

### Debug Mode

Use debug mode for step-by-step execution:

```bash
./scripts/run-e2e.sh --debug
# or
npx playwright test --debug
```

Debug mode features:

- ⏸️ **Pause** at each step
- 🔍 **Inspect** page state
- 💻 **Browser DevTools** available
- 🧪 **Interactive execution**

### Common Issues

#### 1. Development Server Not Running

```bash
# The script starts it automatically, but if issues occur:
npm run dev
# Wait for "Ready on http://localhost:3000"
# Then run tests in another terminal
```

#### 2. Browser Installation Issues

```bash
# Reinstall Playwright browsers
npx playwright install --force
```

#### 3. Tests Time Out

```bash
# Increase timeout in playwright.config.ts
# Or run with specific timeout:
npx playwright test --timeout=60000
```

#### 4. Port Conflict

```bash
# Change port in both places:
# 1. In playwright.config.ts: baseURL: 'http://localhost:3001'
# 2. Start dev server: PORT=3001 npm run dev
```

### Test Reports

After running tests, detailed reports are available:

```bash
# HTML Report (interactive)
npx playwright show-report

# JSON Report (machine readable)
cat test-results.json

# Screenshots (on failure)
ls -la test-results/
```

## Writing New Tests

### Test File Structure

```typescript
import { test, expect, type Page } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('specific functionality', async ({ page }) => {
    // Test implementation
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Locators**, not CSS selectors when possible:

   ```typescript
   // Good
   page.getByRole('button', { name: 'Submit' });
   page.getByLabel('Email Address');
   page.getByText('Submit');

   // Avoid
   page.locator('button.submit-btn');
   ```

2. **Wait for elements** properly:

   ```typescript
   await page.waitForLoadState('networkidle');
   await page.getByText('Loading').waitFor({ state: 'hidden' });
   ```

3. **Use data-testid** for complex elements:
   ```html
   <button data-testid="submit-button">Submit</button>
   ```
   ```typescript
   await page.getByTestId('submit-button').click();
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: ./scripts/run-e2e.sh --install && ./scripts/run-e2e.sh 1

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Environment Variables

Configure test environment:

```bash
# .env.test (create this file)
NEXT_PUBLIC_APP_URL=http://localhost:3000
TEST_EMAIL=test@example.com
TEST_PASSWORD=test-password-123
```

## Performance Monitoring

The performance tests validate:

- **Load Times**: < 3 seconds average
- **Memory Usage**: < 50MB increase during navigation
- **Interaction Speed**: < 300ms response times
- **Resource Loading**: No critical 404 errors
- **Mobile Performance**: Optimized for mobile devices

## Accessibility Validation

Accessibility tests ensure:

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantics
- **Color Contrast**: Text readable for users with visual impairments
- **Focus Management**: Visible focus indicators
- **Responsive Scaling**: Text and UI scale for 200% zoom

## Maintenance

### Regular Tasks

1. **Update Browsers**: `npx playwright install --force`
2. **Review Test Failures**: Check playwright-report for flaky tests
3. **Update locators**: Ensure selectors match UI changes
4. **Performance Baselines**: Update performance expectations as features grow

### When Code Changes

- **UI Changes**: Update page locators and expectations
- **API Changes**: Update test data and response validations
- **New Features**: Add corresponding E2E tests
- **Routes Added**: Add new page-specific test files

---

## Support

For issues with E2E testing:

1. **Check logs**: Look at dev-server.log and test output
2. **Run debug mode**: Use `--debug` flag for step-by-step execution
3. **CI Issues**: Check GitHub Actions logs for environment differences
4. **Performance**: Use browser DevTools to identify bottlenecks

The E2E testing suite provides comprehensive validation of the MADACE-Method v2.0 application, ensuring reliability, performance, and accessibility for all users.

# E2E Testing Workflow Guide

## Quick Start

### Prerequisites

- Node.js installed
- All dependencies installed (`npm install`)
- Playwright browsers installed (`npx playwright install chromium`)

### Running E2E Tests

**Option 1: Manual (Recommended)**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
npm run test:e2e
```

**Option 2: Cleanup and Test**

```bash
# Verify routes, clean up old processes and run tests
npm run verify-routes # Verify route structure is clean
npm run cleanup      # Kill all dev servers and clear ports
npm run dev         # Start fresh dev server
npm run test:e2e    # Run E2E tests
```

**Option 3: Automated (Unix/macOS/Linux only)**

```bash
# This will verify routes, cleanup, start server, wait, and run tests
npm run test:e2e:clean
```

## Available Scripts

### Route Verification

```bash
# Verify route structure is clean (no conflicts)
npm run verify-routes
```

**What route verification does:**

- Checks for nested MADACE-Method-v2 directories (should not exist)
- Searches for conflicting `[name]` route parameters (should use `[id]`)
- Verifies correct route structure exists
- Displays current route tree
- Exits with error if any issues are found

### Cleanup Scripts

```bash
# Cross-platform cleanup (JavaScript - works everywhere)
npm run cleanup

# Bash cleanup (Unix/macOS/Linux only - more thorough)
npm run cleanup:bash
```

**What cleanup does:**

- Kills all processes on port 3000
- Terminates all Next.js dev servers
- Clears npm dev processes
- Removes `.next` build cache (prevents route conflicts from cached builds)
- Ensures clean state before testing

### Test Scripts

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with visual UI
npm run test:e2e:ui

# Run in debug mode (step through tests)
npm run test:e2e:debug

# Run only on Chromium browser
npm run test:e2e:chromium

# Run with browser visible (headed mode)
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

## Troubleshooting

### Route Conflicts

**Error**: `You cannot use different slug names for the same dynamic path ('id' !== 'name')`

**Solution**:

```bash
# Verify and see what's wrong
npm run verify-routes

# If nested MADACE-Method-v2 directory found
rm -rf MADACE-Method-v2

# If [name] directories found, remove them
# Then clear Next.js cache
rm -rf .next

# Verify routes are clean
npm run verify-routes
```

### Port 3000 is in use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
npm run cleanup
```

### Dev server not running

**Error**: `Development server is not running on port 3000`

**Solution**:

```bash
# Start dev server
npm run dev

# In another terminal, run tests
npm run test:e2e
```

### Multiple dev servers running

**Symptom**: Tests behave unexpectedly, port conflicts

**Solution**:

```bash
# Kill all dev servers
npm run cleanup

# Verify port is clear
lsof -ti:3000 || echo "Port 3000 is clear"

# Start fresh server
npm run dev
```

### Playwright browsers not installed

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**:

```bash
npx playwright install chromium
# Or install all browsers
npx playwright install
```

## Test Lifecycle

### 1. Global Setup (`e2e-tests/global-setup.ts`)

Runs **once** before all tests:

- Checks if dev server is running on port 3000
- Throws error if server is not running
- Does NOT start server automatically (to avoid port conflicts)

### 2. Test Execution

Tests run across multiple browsers:

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad Safari (iPad Pro)

### 3. Global Teardown (`e2e-tests/global-teardown.ts`)

Runs **once** after all tests:

- Currently does nothing (server runs externally)
- Available for future cleanup needs

## Manual Testing Workflow

For development and debugging:

```bash
# 1. Clean slate
npm run cleanup

# 2. Start dev server (keep this running)
npm run dev

# 3. In another terminal, run specific tests
npx playwright test e2e-tests/setup-wizard.spec.ts --headed

# 4. Or run in UI mode for debugging
npm run test:e2e:ui

# 5. When done, cleanup
npm run cleanup
```

## CI/CD Integration

For CI environments:

```bash
# Install dependencies
npm ci
npx playwright install --with-deps chromium

# Cleanup any existing processes
npm run cleanup

# Start server in background
npm run dev &

# Wait for server to be ready
sleep 5

# Run tests
npm run test:e2e

# Kill server
npm run cleanup
```

## Test Reports

After running tests:

```bash
# View HTML report
npm run test:e2e:report

# Or open manually
open playwright-report/index.html
```

Reports include:

- Test results (pass/fail)
- Screenshots on failure
- Videos on failure
- Execution traces
- Timing information

## Best Practices

1. **Always verify routes and cleanup before testing**

   ```bash
   npm run verify-routes && npm run cleanup && npm run dev
   ```

2. **Run tests in headless mode for CI**

   ```bash
   npm run test:e2e
   ```

3. **Use UI mode for debugging**

   ```bash
   npm run test:e2e:ui
   ```

4. **Run specific tests during development**

   ```bash
   npx playwright test e2e-tests/agents.spec.ts
   ```

5. **Keep dev server running in separate terminal**
   - Don't start/stop for each test run
   - Only cleanup when you encounter issues

## Advanced Usage

### Running Single Test

```bash
npx playwright test e2e-tests/setup-wizard.spec.ts
```

### Running Single Test Case

```bash
npx playwright test -g "user completes full setup wizard"
```

### Running with Specific Browser

```bash
npx playwright test --project=firefox
```

### Debugging Specific Test

```bash
npx playwright test e2e-tests/agents.spec.ts --debug
```

### Viewing Traces

```bash
npx playwright show-trace trace.zip
```

## Directory Structure

```
e2e-tests/
├── global-setup.ts          # Pre-test setup
├── global-teardown.ts       # Post-test cleanup
├── fixtures/
│   └── test-data.ts        # Test data and fixtures
├── page-objects/           # Page Object Models
│   ├── setup-wizard.page.ts
│   ├── agents.page.ts
│   └── home.page.ts
└── *.spec.ts               # Test files
```

## Configuration

Tests configured in `playwright.config.ts`:

- Timeout: 30 seconds per test
- Retries: 2 times on failure
- Base URL: http://localhost:3000
- Screenshots: Only on failure
- Videos: Retained on failure
- Traces: On first retry

## Need Help?

1. Check test output for error messages
2. View screenshots in `test-results/`
3. Check HTML report: `npm run test:e2e:report`
4. Run in debug mode: `npm run test:e2e:debug`
5. Check if dev server is running: `lsof -ti:3000`

---

**Last Updated**: 2025-10-23
**MADACE Version**: v2.0.0-alpha

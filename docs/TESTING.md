# MADACE Testing Guide

**Version:** 2.0.0-alpha
**Last Updated:** 2025-10-22

This guide covers testing strategies, test execution, and writing tests for MADACE v2.0.

---

## Table of Contents

- [Testing Overview](#testing-overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

---

## Testing Overview

### Testing Stack

- **Test Runner:** Jest
- **Assertion Library:** Jest (built-in)
- **Mocking:** Jest mocks
- **Coverage:** Jest coverage reports
- **Future:** Playwright for E2E tests

### Test Types

1. **Unit Tests** - Test individual functions and modules
2. **Integration Tests** - Test API routes and component integration
3. **E2E Tests** - Test complete user workflows (future)

---

## Running Tests

### All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run with verbose output
npm test -- --verbose
```

### Specific Tests

```bash
# Run tests in a specific file
npm test loader.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should load agent"

# Run tests in a directory
npm test __tests__/lib/
```

### CI/CD Commands

```bash
# Run all checks before commit
npm run check-all  # type-check + lint + format:check

# Full pre-commit check
npm run check-all && npm test && npm run build
```

---

## Test Structure

### Directory Structure

```
MADACE-Method-v2.0/
├── __tests__/              # All test files
│   ├── app/
│   │   └── api/
│   │       └── agents/
│   │           └── route.test.ts
│   └── lib/
│       ├── agents/
│       │   └── loader.test.ts
│       ├── llm/
│       │   └── client.test.ts
│       └── state/
│           └── machine.test.ts
├── app/
│   └── api/
│       └── llm/
│           └── test/
│               └── route.spec.ts  # Inline API route tests
└── jest.config.mjs
└── jest.setup.js
```

### File Naming

- **Unit tests:** `*.test.ts`
- **Integration tests:** `*.spec.ts`
- **Test data:** `*.mock.ts` or `*.fixture.ts`

---

## Unit Tests

### Example: Agent Loader

**File:** `__tests__/lib/agents/loader.test.ts`

```typescript
import { loadAgent, loadMAMAgents, AgentLoadError } from '@/lib/agents/loader';
import fs from 'fs/promises';
import path from 'path';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('AgentLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testAgentPath = path.join(process.cwd(), 'madace/mam/agents/pm.agent.yaml');
  const validAgentContent = `
agent:
  metadata:
    id: madace/mam/agents/pm.md
    name: PM
    title: Product Manager
    icon: 📋
    module: mam
    version: 1.0.0
  persona:
    role: Product Manager
    identity: Test identity
    communication_style: Professional
    principles: [test-principle]
  menu: []
  prompts: []
`;

  describe('loadAgent', () => {
    it('should load a valid agent YAML file', async () => {
      mockFs.readFile.mockResolvedValue(validAgentContent);

      const agent = await loadAgent(testAgentPath);

      expect(agent.metadata.id).toBe('madace/mam/agents/pm.md');
      expect(agent.metadata.name).toBe('PM');
      expect(agent.metadata.title).toBe('Product Manager');
      expect(agent.metadata.icon).toBe('📋');
      expect(agent.metadata.module).toBe('mam');
      expect(agent.metadata.version).toBe('1.0.0');
      expect(agent.persona.role).toBe('Product Manager');
      expect(agent.persona.principles).toContain('test-principle');
      expect(agent.menu).toEqual([]);
      expect(agent.prompts).toEqual([]);
    });

    it('should throw AgentLoadError for non-existent file', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT: no such file') as any);

      await expect(loadAgent('/non/existent/agent.yaml')).rejects.toThrow(AgentLoadError);
    });
  });
});
```

### Example: LLM Client

**File:** `__tests__/lib/llm/client.test.ts`

```typescript
import { createLLMClient } from '@/lib/llm/client';
import type { LLMConfig } from '@/lib/llm/types';

describe('LLMClient', () => {
  const mockConfig: LLMConfig = {
    provider: 'gemini',
    apiKey: 'test-key',
    model: 'gemini-2.0-flash-exp',
  };

  it('should create a client with valid config', () => {
    const client = createLLMClient(mockConfig);
    expect(client).toBeDefined();
    expect(client.chat).toBeDefined();
    expect(client.chatStream).toBeDefined();
  });

  it('should throw error for invalid provider', () => {
    const invalidConfig = { ...mockConfig, provider: 'invalid' as any };
    expect(() => createLLMClient(invalidConfig)).toThrow();
  });
});
```

---

## Integration Tests

### Example: API Route

**File:** `__tests__/app/api/agents/route.test.ts`

```typescript
import { GET } from '@/app/api/agents/route';
import { NextRequest } from 'next/server';

// Mock the agent loader
jest.mock('@/lib/agents/loader', () => ({
  loadMAMAgents: jest.fn(),
}));

import { loadMAMAgents } from '@/lib/agents/loader';
const mockLoadMAMAgents = loadMAMAgents as jest.MockedFunction<typeof loadMAMAgents>;

describe('GET /api/agents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of agents', async () => {
    const mockAgents = [
      {
        metadata: {
          id: 'pm',
          name: 'PM',
          title: 'Product Manager',
          icon: '📋',
          module: 'mam',
          version: '1.0.0',
        },
        persona: {},
        menu: [],
        prompts: [],
      },
    ];

    mockLoadMAMAgents.mockResolvedValue(mockAgents as any);

    const request = new NextRequest('http://localhost:3000/api/agents');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.agents).toHaveLength(1);
    expect(data.agents[0].metadata.name).toBe('PM');
  });

  it('should handle errors gracefully', async () => {
    mockLoadMAMAgents.mockRejectedValue(new Error('Failed to load agents'));

    const request = new NextRequest('http://localhost:3000/api/agents');
    const response = await GET(request);

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});
```

### Example: State Machine

**File:** `__tests__/lib/state/machine.test.ts`

```typescript
import { createStateMachine } from '@/lib/state/machine';
import fs from 'fs/promises';

jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('StateMachine', () => {
  const mockStatusContent = `
# MAM Workflow Status

## BACKLOG
- [TEST-001] Test story (5 points)

## TODO
(Empty)

## IN PROGRESS
(Empty)

## DONE
- [DONE-001] Completed story (3 points)
`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse workflow status file', async () => {
    mockFs.readFile.mockResolvedValue(mockStatusContent);

    const stateMachine = createStateMachine();
    await stateMachine.load();

    const status = stateMachine.getStatus();

    expect(status.backlog).toHaveLength(1);
    expect(status.backlog[0].id).toBe('TEST-001');
    expect(status.done).toHaveLength(1);
    expect(status.done[0].id).toBe('DONE-001');
  });

  it('should enforce one-at-a-time rule', async () => {
    mockFs.readFile.mockResolvedValue(mockStatusContent);

    const stateMachine = createStateMachine();
    await stateMachine.load();

    const validation = stateMachine.validate();

    expect(validation.valid).toBe(true);
    expect(validation.todoCount).toBe(0);
    expect(validation.inProgressCount).toBe(0);
  });
});
```

---

## E2E Tests

### Future: Playwright Setup

```typescript
// playwright.config.ts (future)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
```

### Example E2E Test (Future)

```typescript
// e2e/setup-wizard.spec.ts (future)
import { test, expect } from '@playwright/test';

test('complete setup wizard', async ({ page }) => {
  await page.goto('/setup');

  // Step 1: Project Info
  await page.fill('[name="projectName"]', 'Test Project');
  await page.fill('[name="outputFolder"]', 'output');
  await page.fill('[name="userName"]', 'Test User');
  await page.click('button:has-text("Next")');

  // Step 2: LLM Config
  await page.click('[data-provider="gemini"]');
  await page.fill('[name="apiKey"]', 'test-key');
  await page.selectOption('[name="model"]', 'gemini-2.0-flash-exp');
  await page.click('button:has-text("Next")');

  // Step 3: Modules
  await page.check('[name="mam"]');
  await page.click('button:has-text("Next")');

  // Step 4: Summary
  await expect(page.locator('text=Test Project')).toBeVisible();
  await page.click('button:has-text("Finish")');

  // Verify redirect
  await expect(page).toHaveURL('/');
});
```

---

## Test Coverage

### Generate Coverage Report

```bash
# Generate coverage
npm test -- --coverage

# Open coverage report
open coverage/lcov-report/index.html
```

### Coverage Thresholds

```javascript
// jest.config.mjs
export default {
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Current Coverage (As of 2025-10-22)

```
File                  | % Stmts | % Branch | % Funcs | % Lines
----------------------|---------|----------|---------|--------
lib/agents/loader.ts  |   85.7  |   75.0   |   100   |   85.7
lib/llm/client.ts     |   90.0  |   80.0   |   100   |   90.0
lib/state/machine.ts  |   78.5  |   70.0   |   85.7  |   78.5
app/api/agents/       |   100   |   100    |   100   |   100
```

---

## Best Practices

### 1. Test File Organization

```typescript
describe('ModuleName', () => {
  // Setup
  beforeEach(() => {
    // Reset state
  });

  afterEach(() => {
    // Cleanup
  });

  describe('functionName', () => {
    it('should do something specific', () => {
      // Test implementation
    });

    it('should handle errors', () => {
      // Error test
    });
  });
});
```

### 2. Mock External Dependencies

```typescript
// Mock file system
jest.mock('fs/promises');

// Mock API calls
jest.mock('node-fetch');

// Mock modules
jest.mock('@/lib/llm/client', () => ({
  createLLMClient: jest.fn(),
}));
```

### 3. Use Descriptive Test Names

```typescript
// Good
it('should return 404 when agent does not exist', () => {});

// Bad
it('returns error', () => {});
```

### 4. Test Edge Cases

```typescript
describe('loadAgent', () => {
  it('should load valid agent', () => {});
  it('should handle missing file', () => {});
  it('should handle malformed YAML', () => {});
  it('should handle invalid schema', () => {});
  it('should handle empty file', () => {});
  it('should handle large files', () => {});
});
```

### 5. Keep Tests Independent

```typescript
// Each test should be able to run alone
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService(); // Fresh instance
  });

  it('test 1', () => {
    // Independent test
  });

  it('test 2', () => {
    // Independent test
  });
});
```

### 6. Use Test Fixtures

```typescript
// fixtures/agents.ts
export const mockPMAgent = {
  metadata: {
    id: 'pm',
    name: 'PM',
    title: 'Product Manager',
    icon: '📋',
    module: 'mam',
    version: '1.0.0',
  },
  persona: {},
  menu: [],
  prompts: [],
};

// In tests
import { mockPMAgent } from '@/fixtures/agents';

it('should use fixture', () => {
  const agent = mockPMAgent;
  expect(agent.metadata.name).toBe('PM');
});
```

### 7. Test Async Code Properly

```typescript
// Use async/await
it('should load data asynchronously', async () => {
  const data = await loadData();
  expect(data).toBeDefined();
});

// Or return promise
it('should load data', () => {
  return loadData().then((data) => {
    expect(data).toBeDefined();
  });
});
```

### 8. Clean Up After Tests

```typescript
describe('FileOperations', () => {
  let tempFile: string;

  beforeEach(async () => {
    tempFile = await createTempFile();
  });

  afterEach(async () => {
    await deleteTempFile(tempFile);
  });

  it('should write to file', async () => {
    await writeToFile(tempFile, 'content');
    // Test...
  });
});
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

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

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Debugging Tests

### Run Single Test in Debug Mode

```bash
# Set breakpoint in test
# Run with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand loader.test.ts

# In Chrome: chrome://inspect
```

### Use console.log

```typescript
it('should debug test', () => {
  const result = someFunction();
  console.log('Result:', result); // Will show in test output
  expect(result).toBe(expected);
});
```

### Use jest.mock Spy

```typescript
it('should track function calls', () => {
  const spy = jest.spyOn(module, 'functionName');

  module.functionName('arg');

  expect(spy).toHaveBeenCalledWith('arg');
  expect(spy).toHaveBeenCalledTimes(1);

  spy.mockRestore();
});
```

---

## Resources

- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Playwright**: https://playwright.dev/docs/intro (for future E2E tests)

---

## Support

For testing issues:

1. Check test output: `npm test -- --verbose`
2. Check coverage: `npm test -- --coverage`
3. Debug failing test: `npm test -- loader.test.ts`

---

**Last Updated:** 2025-10-22
**Version:** 2.0.0-alpha

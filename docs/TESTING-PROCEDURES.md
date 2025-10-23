# MADACE-Method v2.0 - Testing Procedures

> **Comprehensive testing guide for developers and QA teams**
>
> This document outlines the complete testing strategy, procedures, and checklists for the MADACE-Method v2.0 project.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing Procedures](#unit-testing-procedures)
4. [Integration Testing Procedures](#integration-testing-procedures)
5. [API Testing Procedures](#api-testing-procedures)
6. [Component Testing Procedures](#component-testing-procedures)
7. [End-to-End Testing Procedures](#end-to-end-testing-procedures)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Docker Testing](#docker-testing)
11. [Pre-Release Checklist](#pre-release-checklist)
12. [Continuous Integration Testing](#continuous-integration-testing)

## Testing Overview

### Testing Pyramid Strategy

```
          E2E Tests (10%)
        ──────────────────
       Integration Tests (20%)
     ────────────────────────────
    Unit Tests (70%)
  ────────────────────────────────────────
```

### Current Test Status

| Type              | Status             | Coverage | Tools                 |
| ----------------- | ------------------ | -------- | --------------------- |
| Unit Tests        | ❌ Not Implemented | 0%       | Jest + TypeScript     |
| Integration Tests | ❌ Not Implemented | 0%       | Jest + Node.js        |
| Component Tests   | ❌ Not Implemented | 0%       | React Testing Library |
| E2E Tests         | ❌ Not Implemented | 0%       | Playwright (Future)   |
| API Tests         | ⚠️ Manual Only     | N/A      | curl/Postman          |

## Test Environment Setup

### Prerequisites

```bash
# Node.js version check
node --version  # Should be 20.x or higher

# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev jest-mock-extended nock
```

### Environment Variables for Testing

Create `.env.test` for test-specific configuration:

```bash
# Test Environment
NODE_ENV=test
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test LLM Config (use stub/test keys)
TEST_GEMINI_API_KEY=test-key-invalid
TEST_CLAUDE_API_KEY=test-key-invalid

# Database Test
TEST_DATABASE_URL=sqlite::memory:
```

### Jest Test Runner Configuration

The project already has Jest configured in `jest.config.mjs`. Current configuration:

```javascript
import nextJest from 'next/jest.js';
import type { Config } from 'jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default createJestConfig(config);
```

## Unit Testing Procedures

### 1. Agent System Tests

**File Location**: `__tests__/lib/agents/`

#### 1.1 Agent Loader Tests

```typescript
// __tests__/lib/agents/loader.test.ts
import { loadAgent, loadMAMAgents, AgentLoadError } from '@/lib/agents/loader';
import fs from 'fs/promises';
import path from 'path';

describe('AgentLoader', () => {
  const testAgentPath = path.join(process.cwd(), 'madace/mam/agents/pm.agent.yaml');

  describe('loadAgent', () => {
    it('should load a valid agent YAML file', async () => {
      const agent = await loadAgent(testAgentPath);

      expect(agent.metadata.id).toBe('madace/mam/agents/pm.md');
      expect(agent.metadata.name).toBe('PM');
      expect(agent.metadata.title).toContain('Product Manager');
      expect(agent.persona.role).toContain('Product Manager');
      expect(agent.menu).toBeInstanceOf(Array);
      expect(agent.prompts).toBeInstanceOf(Array);
    });

    it('should throw AgentLoadError for non-existent file', async () => {
      await expect(loadAgent('/non/existent/agent.yaml')).rejects.toThrow(AgentLoadError);
    });

    it('should cache loaded agents', async () => {
      const agent1 = await loadAgent(testAgentPath);
      const agent2 = await loadAgent(testAgentPath);

      expect(agent1).toBe(agent2); // Same reference from cache
    });

    it('should validate agent schema', async () => {
      // Test with malformed YAML (create temporary file)
      const invalidPath = '/tmp/invalid.agent.yaml';
      await fs.writeFile(invalidPath, 'invalid: yaml: content:');

      await expect(loadAgent(invalidPath)).rejects.toThrow('validation failed');

      await fs.unlink(invalidPath);
    });
  });

  describe('loadMAMAgents', () => {
    it('should load all MAM agents', async () => {
      const agents = await loadMAMAgents();

      expect(agents).toHaveLength(5); // PM, Analyst, Architect, SM, DEV
      expect(agents.map((a) => a.metadata.name)).toContain('PM');
      expect(agents.map((a) => a.metadata.name)).toContain('Analyst');
      expect(agents.map((a) => a.metadata.name)).toContain('Architect');
      expect(agents.map((a) => a.metadata.name)).toContain('SM');
      expect(agents.map((a) => a.metadata.name)).toContain('DEV');
    });
  });
});
```

#### 1.2 Agent Schema Tests

```typescript
// __tests__/lib/agents/schema.test.ts
import { AgentSchema, AgentFileSchema, AgentMetadataSchema } from '@/lib/agents/schema';
import { z } from 'zod';

describe('Agent Schemas', () => {
  describe('AgentMetadataSchema', () => {
    it('should validate valid agent metadata', () => {
      const metadata = {
        id: 'test-agent',
        name: 'Test',
        title: 'Test Agent',
        icon: '🤖',
        module: 'test',
        version: '1.0.0',
      };

      expect(() => AgentMetadataSchema.parse(metadata)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      const metadata = {
        id: 'test-agent',
        name: 'Test',
        // Missing other required fields
      };

      expect(() => AgentMetadataSchema.parse(metadata)).toThrow();
    });
  });

  describe('AgentSchema', () => {
    it('should validate complete agent structure', () => {
      const agent = {
        metadata: {
          id: 'test-agent',
          name: 'Test',
          title: 'Test Agent',
          icon: '🤖',
          module: 'test',
          version: '1.0.0',
        },
        persona: {
          role: 'Test Role',
          identity: 'Test identity',
          communication_style: 'Professional',
          principles: ['test-principle'],
        },
        menu: [],
        prompts: [],
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });
  });
});
```

### 2. LLM Client Tests

**File Location**: `__tests__/lib/llm/`

#### 2.1 LLM Client Factory Tests

```typescript
// __tests__/lib/llm/client.test.ts
import { createLLMClient } from '@/lib/llm/client';
import type { LLMConfig } from '@/lib/llm/types';

describe('LLMClient', () => {
  describe('createLLMClient', () => {
    it('should create Gemini provider', () => {
      const config: LLMConfig = {
        provider: 'gemini',
        apiKey: 'test-key',
        model: 'gemini-2.0-flash-exp',
      };

      const client = createLLMClient(config);
      expect(client.getConfig().provider).toBe('gemini');
    });

    it('should throw for unknown provider', () => {
      const config = {
        provider: 'unknown' as any,
        apiKey: 'test-key',
        model: 'test-model',
      };

      expect(() => createLLMClient(config)).toThrow('Unknown provider: unknown');
    });
  });

  describe('Configuration Updates', () => {
    it('should update client configuration', () => {
      const client = createLLMClient({
        provider: 'gemini',
        apiKey: 'old-key',
        model: 'old-model',
      });

      client.updateConfig({
        apiKey: 'new-key',
        model: 'new-model',
      });

      const config = client.getConfig();
      expect(config.apiKey).toBe('new-key');
      expect(config.model).toBe('new-model');
    });
  });
});
```

#### 2.2 Provider Tests (Mock-based)

```typescript
// __tests__/lib/llm/providers/gemini.test.ts
import { GeminiProvider } from '@/lib/llm/providers/gemini';
import type { LLMConfig, LLMRequest } from '@/lib/llm/types';

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockConfig: LLMConfig;

  beforeEach(() => {
    mockConfig = {
      provider: 'gemini',
      apiKey: 'test-key',
      model: 'gemini-2.0-flash-exp',
    };
    provider = new GeminiProvider(mockConfig);
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      expect(provider.validateConfig(mockConfig)).toBe(true);
    });

    it('should reject missing API key', () => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      expect(provider.validateConfig(invalidConfig)).toBe(false);
    });
  });

  describe('chat (mocked)', () => {
    it('should handle chat requests', async () => {
      // Mock the actual API call
      const mockResponse = {
        content: 'Test response',
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15,
        },
      };

      // Implementation would mock fetch/Axios calls
      // For now, just test the interface exists
      expect(typeof provider.chat).toBe('function');
    });
  });
});
```

### 3. State Machine Tests

**File Location**: `__tests__/lib/state/`

```typescript
// __tests__/lib/state/machine.test.ts
import { StateMachine } from '@/lib/state/machine';
import fs from 'fs/promises';
import path from 'path';

describe('StateMachine', () => {
  let machine: StateMachine;
  let mockStatusFile: string;

  beforeEach(async () => {
    // Create temporary status file
    mockStatusFile = '/tmp/mam-workflow-status.md';
    await fs.writeFile(
      mockStatusFile,
      `
## BACKLOG
- [TEST-001] Test Story
- [TEST-002] Another Test Story

## TODO
- [TEST-003] Todo Story

## IN PROGRESS
- [TEST-004] In Progress Story

## DONE
- [TEST-005] Completed Story
    `
    );
  });

  it('should parse status file correctly', async () => {
    machine = new StateMachine(mockStatusFile);
    await machine.load();

    const status = machine.getStatus();
    expect(status.backlog).toHaveLength(2);
    expect(status.todo).toHaveLength(1);
    expect(status.inProgress).toHaveLength(1);
    expect(status.done).toHaveLength(1);
  });

  it('should validate state constraints', async () => {
    machine = new StateMachine(mockStatusFile);
    await machine.load();

    const validation = machine.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should prevent invalid transitions', async () => {
    machine = new StateMachine(mockStatusFile);
    await machine.load();

    expect(machine.canTransition('TEST-005', 'TODO')).toBe(false);
  });
});
```

### 4. Template Engine Tests

**File Location**: `__tests__/lib/templates/`

```typescript
// __tests__/lib/templates/engine.test.ts
import { TemplateEngine } from '@/lib/templates/engine';
import fs from 'fs/promises';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;
  let tempDir: string;

  beforeEach(async () => {
    engine = new TemplateEngine();
    tempDir = '/tmp/templates';
    await fs.mkdir(tempDir, { recursive: true });
  });

  it('should render simple templates', async () => {
    const template = 'Hello {{name}}!';
    const variables = { name: 'World' };

    // Mock implementation would test actual rendering
    const result = await engine.renderString(template, variables);
    expect(result).toBe('Hello World!');
  });

  it('should handle missing variables gracefully', async () => {
    const template = 'Hello {{missing}}!';
    const variables = {};

    // Should either throw error or handle gracefully based on config
    await expect(engine.renderString(template, variables)).rejects.toThrow(/missing/);
  });
});
```

## Integration Testing Procedures

### 1. API Route Integration Tests

**File Location**: `__tests__/app/api/`

#### 1.1 Agents API Tests

```typescript
// __tests__/app/api/agents/route.test.ts
import { GET } from '@/app/api/agents/route';
import { createMocks } from 'node-mocks-http';

describe('/api/agents', () => {
  it('should return list of all agents', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agents).toHaveLength(5);
    expect(data.agents.map((a: any) => a.name)).toContain('PM');
  });

  it('should handle errors gracefully', async () => {
    // Mock file system error
    jest.spyOn(fs, 'readFile').mockRejectedValue(new Error('File not found'));

    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req);

    expect(response.status).toBe(500);
  });
});
```

#### 1.2 LLM Test API Tests

```typescript
// __tests__/app/api/llm/test/route.test.ts
import { POST } from '@/app/api/llm/test/route';
import { createMocks } from 'node-mocks-http';

describe('/api/llm/test', () => {
  it('should validate LLM test request', async () => {
    const requestBody = {
      provider: 'gemini',
      apiKey: 'test-key',
      model: 'gemini-2.0-flash-exp',
      testPrompt: 'Hello',
    };

    const { req } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500); // Should fail with test API key
    expect(data.success).toBe(false);
  });

  it('should reject missing API key', async () => {
    const requestBody = {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-2.0-flash-exp',
      testPrompt: 'Hello',
    };

    const { req } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('API key is required');
  });
});
```

### 2. Component Integration Tests

**File Location**: `__tests__/components/features/`

```typescript
// __tests__/components/features/Navigation.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigation } from '@/components/features/Navigation';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

describe('Navigation', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('should render navigation items', () => {
    render(<Navigation />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Kanban')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
  });

  it('should handle mobile menu toggle', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const menuButton = screen.getByLabelText('Toggle navigation menu');
    await user.click(menuButton);

    expect(screen.getByText('Dashboard')).toBeVisible();
  });

  it('should highlight active route', () => {
    (usePathname as jest.Mock).mockReturnValue('/kanban');
    render(<Navigation />);

    const kanbanLink = screen.getByText('Kanban');
    expect(kanbanLink.closest('a')).toHaveClass('border-blue-500');
  });
});
```

## API Testing Procedures

### 1. Manual API Testing Checklist

#### Agents API

```bash
# Test 1: Get all agents
curl -X GET http://localhost:3000/api/agents

# Expected: 200 with agents array
# Verify: Array has 5 agents, each has id, name, title, icon, module

# Test 2: Get specific agent
curl -X GET http://localhost:3000/api/agents/pm

# Expected: 200 with PM agent details
# Verify: Contains metadata, persona, menu, prompts

# Test 3: Get non-existent agent
curl -X GET http://localhost:3000/api/agents/nonexistent

# Expected: 404 error
```

#### LLM Test API

```bash
# Test 1: Valid Gemini configuration
curl -X POST http://localhost:3000/api/llm/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "apiKey": "your-real-api-key",
    "model": "gemini-2.0-flash-exp",
    "testPrompt": "Hello, respond with just the word SUCCESS"
  }'

# Expected: 200 with response content
# Verify: success: true, contains response content

# Test 2: Invalid API key
curl -X POST http://localhost:3000/api/llm/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "apiKey": "invalid-key",
    "model": "gemini-2.0-flash-exp",
    "testPrompt": "Hello"
  }'

# Expected: 500 with authentication error
```

### 2. API Test Scripts

Create test scripts for automated API testing:

```bash
#!/bin/bash
# scripts/test-api.sh
# API Integration Test Script

set -e

BASE_URL="http://localhost:3000"
FAILED_TESTS=0

test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local body="$4"
    local expected_status="$5"

    echo "Testing: $name"

    if [ "$method" = "GET" ]; then
        status=$(curl -s -o /tmp/api_response.json -w "%{http_code}" "$BASE_URL$url")
    else
        status=$(curl -s -o /tmp/api_response.json -w "%{http_code}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -d "$body" \
            "$BASE_URL$url")
    fi

    if [ "$status" -eq "$expected_status" ]; then
        echo "✅ PASS: $name"
    else
        echo "❌ FAIL: $name (Expected: $expected_status, Got: $status)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        cat /tmp/api_response.json
    fi
    echo
}

# Run API tests
test_api "Agents List" "GET" "/api/agents" "" "200"
test_api "PM Agent" "GET" "/api/agents/pm" "" "200"
test_api "Invalid Agent" "GET" "/api/agents/invalid" "" "404"

echo "API Tests Complete. Failed: $FAILED_TESTS"
exit $FAILED_TESTS
```

## Component Testing Procedures

### 1. Setup Page Testing

```typescript
// __tests__/app/setup/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetupPage from '@/app/setup/page';

describe('SetupPage', () => {
  it('should render all four setup steps', () => {
    render(<SetupPage />);

    expect(screen.getByText('Project Information')).toBeInTheDocument();
    expect(screen.getByText('LLM Configuration')).toBeInTheDocument();
    expect(screen.getByText('Module Selection')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('should navigate between steps', async () => {
    const user = userEvent.setup();
    render(<SetupPage />);

    // Fill step 1
    await user.type(screen.getByLabelText('Project Name'), 'Test Project');
    await user.click(screen.getByText('Next'));

    // Should be on step 2
    await waitFor(() => {
      expect(screen.getByText('LLM Configuration')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<SetupPage />);

    // Try to proceed without filling required fields
    await user.click(screen.getByText('Next'));

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Project name is required/)).toBeInTheDocument();
    });
  });
});
```

### 2. Dashboard Testing

```typescript
// __tests__/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock API calls
jest.mock('@/app/page', () => {
  const originalModule = jest.requireActual('@/app/page');
  return {
    ...originalModule,
    // Mock fetch for dashboard data
  };
});

describe('Home Page', () => {
  it('should render main sections', () => {
    render(<Home />);

    expect(screen.getByText('MADACE-Method v2.0')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Core Features')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('should display navigation links', () => {
    render(<Home />);

    expect(screen.getByRole('link', { name: /Kanban/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Agents/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
  });
});
```

## End-to-End Testing Procedures

### 1. User Journey Tests

Currently, manual E2E testing is required. Future implementation with Playwright:

#### Journey 1: Complete Setup Flow

```typescript
// tests/e2e/setup-flow.spec.ts (Future Playwright implementation)
import { test, expect } from '@playwright/test';

test.describe('Setup Flow', () => {
  test('Complete setup from start to finish', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click Get Started
    await page.click('text=Get Started');

    // Step 1: Project Information
    await page.fill('[name="projectName"]', 'Test Project');
    await page.fill('[name="userName"]', 'Test User');
    await page.click('text=Next');

    // Step 2: LLM Configuration
    await page.selectOption('[name="provider"]', 'gemini');
    await page.fill('[name="apiKey"]', 'test-key');
    await page.click('text=Next');

    // Step 3: Module Selection
    await page.check('[name="modules.mam"]');
    await page.click('text=Next');

    // Step 4: Summary
    await expect(page.locator('text=Test Project')).toBeVisible();
    await page.click('text=Complete Setup');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/');
  });
});
```

#### Journey 2: LLM Testing Flow

```bash
# Manual E2E Test procedure
# 1. Navigate to /setup
# 2. Complete setup with real API key
# 3. Navigate to /llm-test
# 4. Test multiple providers
# 5. Verify responses are displayed correctly
# 6. Check error handling with invalid keys
```

### 2. Manual E2E Test Checklist

#### Test Case 1: Full Application Setup

- [ ] Landing page loads correctly
- [ ] Setup wizard progression works
- [ ] All form validation checks work
- [ ] LLM connection succeeds with valid API key
- [ ] Configuration persists (if implemented)
- [ ] Navigation redirects work correctly

#### Test Case 2: Agent Management

- [ ] Agents page loads and displays all 5 agents
- [ ] Individual agent pages show details
- [ ] Agent metadata displays correctly
- [ ] API endpoints respond properly

#### Test Case 3: Error Handling

- [ ] Network errors display user-friendly messages
- [ ] Invalid API keys show appropriate feedback
- [ ] Missing files are handled gracefully
- [ ] Browser refreshes maintain application state

## Performance Testing

### 1. Load Testing API Endpoints

```bash
# Using Apache Bench for simple load testing
ab -n 100 -c 10 http://localhost:3000/api/agents

# Expected: All requests succeed (2xx status)
# Response time: < 200ms average
# No memory leaks observed
```

### 2. Frontend Performance

```typescript
// __tests__/performance/home-page.test.tsx
import { render } from '@testing-library/react';
import Home from '@/app/page';

describe('Performance Tests', () => {
  it('should render quickly', () => {
    const startTime = performance.now();
    render(<Home />);
    const endTime = performance.now();

    // Should render within 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should not cause memory leaks', () => {
    // Render multiple times to check for memory leaks
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Home />);
      unmount();
    }

    // Verify no memory warnings in CI logs
  });
});
```

## Security Testing

### 1. Input Validation Tests

```typescript
// __tests__/security/input-validation.test.ts
import { POST } from '@/app/api/llm/test/route';

describe('Security Tests', () => {
  it('should prevent injection attacks', async () => {
    const maliciousInput = {
      provider: 'gemini',
      apiKey: '<script>alert("xss")</script>',
      model: 'gemini-2.0-flash-exp',
      testPrompt: '../../../etc/passwd',
    };

    const { req } = createMocks({
      method: 'POST',
      body: maliciousInput,
    });

    const response = await POST(req);

    // Should validate and reject malicious input
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should validate JSON structure', async () => {
    const malformedJson = 'invalid json';

    const response = await fetch('/api/llm/test', {
      method: 'POST',
      body: malformedJson,
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(400);
  });
});
```

### 2. Security Checklist

- [ ] No hardcoded API keys in code
- [ ] All user inputs are sanitized
- [ ] CORS headers are properly configured
- [ ] Rate limiting is implemented
- [ ] Authentication/authorization works correctly
- [ ] HTTPS/TLS in production
- [ ] Environment variables are not exposed

## Docker Testing

### 1. Build Test

```bash
# Test Docker builds
docker build -t madace-test .

# Expected: Build completes without errors
# Image size should be < 500MB (optimized)
# Security scan passes
```

### 2. Runtime Test

```bash
# Test production container
docker-compose -f docker-compose.yml up -d

# Wait for startup
sleep 30

# Health check
curl -f http://localhost:3000/api/health || exit 1

# Test API endpoints
curl http://localhost:3000/api/agents

# Cleanup
docker-compose down
```

### 3. Development Container Test

```bash
# Test development container with VSCode
docker-compose -f docker-compose.dev.yml up -d

# Verify services
curl http://localhost:3000 -> Next.js dev server
curl http://localhost:8080 -> VSCode Server
curl http://localhost:8081 -> Cursor IDE

# Test file sync
echo "test" | docker exec madace-dev tee /workspace/test-file
docker exec madace-dev cat /workspace/test-file

# Cleanup
docker-compose -f docker-compose.dev.yml down
```

## Pre-Release Checklist

### Code Quality ✅

- [ ] All TypeScript checks pass (`npm run type-check`)
- [ ] ESLint passes with zero warnings
- [ ] Prettier formatting applied (`npm run format:check`)
- [ ] No console.error statements in production code
- [ ] All TODO/FIXME comments addressed or documented

### Testing ✅

- [ ] Unit tests run (`npm test`)
- [ ] Code coverage > 80%
- [ ] API endpoint tests pass
- [ ] Component tests cover major user flows
- [ ] Manual E2E testing completed

### Performance ✅

- [ ] Production build succeeds (`npm run build`)
- [ ] Bundle size reasonable (< 2MB total)
- [ ] Page load time < 2 seconds
- [ ] No memory leaks in development

### Security ✅

- [ ] Environment variables properly configured
- [ ] No secrets committed to repository
- [ ] Dependencies have no known vulnerabilities
- [ ] CORS settings appropriate

### Documentation ✅

- [ ] README.md is up to date
- [ ] API documentation complete
- [ ] Setup instructions tested
- [ ] Architecture decisions recorded

### Deployment ✅

- [ ] Docker images build correctly
- [ ] Production deployment tested
- [ ] Health checks configured
- [ ] Monitoring setup ready

## Continuous Integration Testing

### GitHub Actions Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test -- --coverage

      - name: Build application
        run: npm run build

      - name: Test Docker build
        run: |
          docker build -t madace-test .
          docker run --rm -d -p 3001:3000 madace-test
          sleep 10
          curl -f http://localhost:3001/api/agents || exit 1
          docker stop $(docker ps -q)

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Quality Gates

- **Build Status**: Must pass all tests
- **Coverage**: Minimum 80% code coverage
- **Performance**: Bundle size < 2MB
- **Security**: No high-severity vulnerabilities
- **Type Safety**: Zero TypeScript errors

## Running Tests Locally

### Quick Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- agents.test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="AgentLoader"
```

### Test Debugging

```bash
# Debug tests with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Run tests with verbose output
npm run test -- --verbose

# Run tests with specific timeout
npm run test -- --testTimeout=10000
```

### Environment Setup for Testing

```bash
# Create test environment
cp .env.example .env.test

# Edit .env.test with test-specific values
# - Use test API keys
# - Point to test database
# - Disable external services

# Run tests with test environment
NODE_ENV=test npm test
```

---

## Summary

This comprehensive testing strategy covers:

1. **Unit Tests** (70%): Test individual functions and components
2. **Integration Tests** (20%): Test API endpoints and component interactions
3. **E2E Tests** (10%): Test complete user journeys
4. **Performance Tests**: Ensure responsiveness and resource efficiency
5. **Security Tests**: Validate input handling and prevent vulnerabilities
6. **Infrastructure Tests**: Verify Docker deployment works correctly

**Current Status**: Testing framework is configured but no tests are implemented yet. Priority should be given to implementing core unit tests for the agent loader, LLM client, and state machine components.

**Next Steps**:

1. Implement unit tests for `lib/agents/*` modules
2. Add integration tests for API routes
3. Create component tests for major UI components
4. Set up CI/CD pipeline with the provided GitHub Actions workflow
5. Implement E2E tests with Playwright in future iterations

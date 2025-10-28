# Testing Policy

**MADACE-Method v2.0 - Immutable Testing Methodology**

**Version:** 1.0.0
**Status:** ⛔ **LOCKED** - Critical Development Policy
**Last Updated:** 2025-10-28

---

## ⛔ CRITICAL RULE: TESTS ARE IMMUTABLE

> **ABSOLUTE PRINCIPLE:** Tests define the contract. Implementation must conform to tests, NOT the other way around.

```
┌─────────────────────────────────────────────────────────────┐
│  WHEN TESTS FAIL:                                           │
│                                                              │
│  ✅ DO:   Fix the implementation code                       │
│  ✅ DO:   Write detailed failure reports                    │
│  ✅ DO:   Create todo lists for fixes                       │
│                                                              │
│  ❌ DON'T: Modify test scripts                              │
│  ❌ DON'T: Alter test procedures                            │
│  ❌ DON'T: Change assertions to make them pass              │
│  ❌ DON'T: Comment out failing tests                        │
│  ❌ DON'T: Skip or ignore test failures                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

- [Philosophy](#philosophy)
- [Core Principles](#core-principles)
- [Immutable Test Policy](#immutable-test-policy)
- [When Tests Fail](#when-tests-fail)
- [Exception Cases](#exception-cases)
- [Test Modification Process](#test-modification-process)
- [Reporting Requirements](#reporting-requirements)
- [Examples](#examples)
- [Enforcement](#enforcement)

---

## Philosophy

### Tests Are the Source of Truth

Tests represent the **requirements** and **expected behavior** of the system. They are not suggestions or guidelines - they are the contract that the implementation must fulfill.

**Analogy:**
```
Requirements Document  →  Tests  →  Implementation
    (What to build)    (How to verify)  (Actual code)
```

**Traditional (WRONG):**
```
Test fails → "This test is annoying" → Modify test → Test passes ✅ (WRONG!)
Result: Tests become meaningless. They don't verify anything.
```

**MADACE Approach (CORRECT):**
```
Test fails → "Implementation is wrong" → Fix code → Test passes ✅ (CORRECT!)
Result: Tests maintain integrity. They verify requirements.
```

### Test-Driven Development (TDD) Philosophy

MADACE-Method v2.0 follows TDD principles:

1. **Red:** Write a failing test (defines requirement)
2. **Green:** Write minimal code to make it pass
3. **Refactor:** Improve code while keeping tests green

**Tests are written FIRST, implementation SECOND.**

---

## Core Principles

### 1. Tests Define the Contract

```typescript
// This test defines the contract for the AgentLoader
test('should load agent from YAML file', async () => {
  const agent = await loadAgent('/path/to/agent.yaml');
  expect(agent.metadata.name).toBe('PM');
  expect(agent.metadata.version).toBe('1.0.0');
});

// This contract says:
// - loadAgent() must accept a file path
// - It must return an agent object
// - The agent must have metadata.name = 'PM'
// - The agent must have metadata.version = '1.0.0'
//
// If implementation doesn't meet this contract, fix THE IMPLEMENTATION.
```

### 2. Tests Are Documentation

Tests document how the system is SUPPOSED to work:

```typescript
// This test documents the version validation behavior
test('should reject version ranges in package.json', () => {
  const pkg = { dependencies: { "next": "^15.5.6" } };
  expect(() => validateVersions(pkg)).toThrow('Version ranges not allowed');
});

// Anyone reading this test knows:
// - Version ranges should be rejected
// - It should throw an error
// - The error message should mention "Version ranges not allowed"
```

### 3. Implementation Changes, Tests Don't

**Decision Flow:**

```
Test Fails
    ↓
Is the test objectively wrong?
    ↓
NO (99% of cases)  →  Fix implementation code
    ↓
YES (1% of cases)  →  Follow Test Modification Process (ADR required)
```

---

## Immutable Test Policy

### ⛔ LOCKED: Test Scripts Are Immutable

**Files Covered:**
```
__tests__/**/*.test.ts           ← Unit/Integration tests
__tests__/**/*.spec.ts           ← Unit/Integration tests
app/api/**/*.spec.ts             ← API route tests
e2e-tests/**/*.spec.ts           ← End-to-end tests
playwright.config.ts             ← Test configuration
jest.config.mjs                  ← Test configuration
jest.setup.js                    ← Test setup
```

**These files MUST NOT be modified to make tests pass.**

### What "Immutable" Means

**ALLOWED:**
- ✅ Adding NEW tests (expanding coverage)
- ✅ Adding NEW test cases to existing test suites
- ✅ Improving test descriptions/comments
- ✅ Refactoring test utilities (if behavior unchanged)
- ✅ Updating mocks to reflect new API contracts

**FORBIDDEN:**
- ❌ Changing assertions to make them pass
- ❌ Commenting out failing tests
- ❌ Skipping tests with `.skip()` or `xit()`
- ❌ Weakening assertions (e.g., `toBe()` → `toBeTruthy()`)
- ❌ Removing assertions
- ❌ Changing expected values
- ❌ Adding conditional logic to tests
- ❌ Increasing timeout values to hide performance issues

---

## When Tests Fail

### Standard Response Protocol

**Step 1: Acknowledge Failure**
```bash
npm test
# ❌ FAIL __tests__/lib/agents/loader.test.ts
#   ● AgentLoader › should load agent from YAML file
#   Expected: "PM"
#   Received: undefined
```

**Step 2: Write Failure Report**

Create: `reports/test-failure-YYYY-MM-DD-HHMMSS.md`

```markdown
# Test Failure Report

**Date:** 2025-10-28 14:30:00
**Test File:** `__tests__/lib/agents/loader.test.ts`
**Test Name:** "AgentLoader › should load agent from YAML file"
**Status:** ❌ FAILED

## Failure Details

**Expected:** "PM"
**Received:** undefined

**Error Message:**
```
Expected: "PM"
Received: undefined
```

## Root Cause Analysis

The `loadAgent()` function is not correctly parsing the `metadata.name` field from the YAML file.

Investigation shows:
- YAML file exists at the correct path ✅
- File is being read ✅
- YAML parsing is working ✅
- Zod schema validation is passing ✅
- **Problem:** Metadata mapping is incorrect ❌

## Implementation Issue

**File:** `lib/agents/loader.ts:45`
**Issue:** Agent loader returns `agent.meta.name` instead of `agent.metadata.name`

```typescript
// Current (WRONG):
return {
  ...agent,
  name: agent.meta.name  // ❌ Wrong property path
};

// Should be (CORRECT):
return {
  ...agent,
  name: agent.metadata.name  // ✅ Correct property path
};
```

## Fix Required

**Action:** Update `lib/agents/loader.ts` line 45
**Estimated Time:** 5 minutes
**Priority:** HIGH

## Related Tests

This failure may affect:
- `should load MAM agents` ← Verify after fix
- `should cache loaded agents` ← Verify after fix

---

**Report Status:** 🔴 OPEN
**Assigned To:** Dev Team
**Created By:** Testing System
```

**Step 3: Create Todo List**

Update todo tracking:

```markdown
## Test Failure Todos

- [ ] Fix agent.metadata.name mapping in loader.ts:45
- [ ] Verify fix with `npm test __tests__/lib/agents/loader.test.ts`
- [ ] Run full test suite `npm test`
- [ ] Verify related tests still pass
- [ ] Close test failure report
```

**Step 4: Fix Implementation (NOT Tests)**

```typescript
// lib/agents/loader.ts

// BEFORE (failing test):
return {
  ...agent,
  name: agent.meta.name  // ❌
};

// AFTER (passing test):
return {
  ...agent,
  name: agent.metadata.name  // ✅
};
```

**Step 5: Verify Fix**

```bash
npm test
# ✅ PASS __tests__/lib/agents/loader.test.ts
#   ✓ AgentLoader › should load agent from YAML file (24 ms)
```

**Step 6: Update Report**

```markdown
**Report Status:** ✅ RESOLVED
**Fixed By:** Dev Team
**Fix Commit:** abc123f
**Resolution Time:** 10 minutes
```

### ❌ WRONG Response (FORBIDDEN)

```typescript
// ❌ FORBIDDEN: Changing test to match broken implementation

test('should load agent from YAML file', async () => {
  const agent = await loadAgent('/path/to/agent.yaml');

  // ❌ WRONG: Changing assertion to make it pass
  expect(agent.meta.name).toBe('PM');  // Changed from metadata.name

  // ❌ WRONG: Weakening assertion
  expect(agent.metadata?.name).toBeTruthy();  // Made it optional

  // ❌ WRONG: Commenting out failing assertion
  // expect(agent.metadata.name).toBe('PM');
});

// This is FORBIDDEN and will be rejected in code review.
```

---

## Exception Cases

### When Tests CAN Be Modified

Tests can ONLY be modified in these specific cases:

#### Exception 1: Requirements Changed

**Process:**
1. Requirements officially changed (documented in PRD or ADR)
2. Create ADR documenting requirement change
3. Update test to reflect NEW requirement
4. Update implementation to pass new test

**Example:**

```markdown
# ADR-XXX: Change Agent Metadata Structure

**Decision:** Rename `metadata.name` to `metadata.agentName` for consistency

**Before:**
```typescript
test('should load agent with metadata.name', () => {
  expect(agent.metadata.name).toBe('PM');
});
```

**After (NEW REQUIREMENT):**
```typescript
test('should load agent with metadata.agentName', () => {
  expect(agent.metadata.agentName).toBe('PM');  // ✅ Allowed: Requirement changed
});
```
```

#### Exception 2: Test Was Objectively Wrong

**Process:**
1. Prove test is objectively incorrect (not just "annoying")
2. Create ADR documenting the test error
3. Fix the test
4. Verify implementation still passes

**Example:**

```markdown
# ADR-XXX: Fix Incorrect Test Assertion

**Issue:** Test expects wrong data type for agent version

**Test Error:**
```typescript
test('should parse agent version', () => {
  expect(agent.metadata.version).toBe(1.0);  // ❌ WRONG: version is string, not number
});
```

**Analysis:**
- Schema defines version as `z.string()`
- All agent YAML files have version as string
- Implementation correctly returns string
- Test expectation is objectively wrong

**Fix:**
```typescript
test('should parse agent version', () => {
  expect(agent.metadata.version).toBe('1.0.0');  // ✅ Correct: version is string
});
```
```

#### Exception 3: Adding New Tests

**Process:**
1. Add NEW tests freely (expanding coverage)
2. Do NOT modify existing tests

**Example:**

```typescript
// ✅ ALLOWED: Adding new test
test('should throw error for missing agent file', async () => {
  await expect(loadAgent('/nonexistent.yaml')).rejects.toThrow('File not found');
});

// ✅ ALLOWED: Adding new test case
test('should handle agents with multiple personas', async () => {
  const agent = await loadAgent('/multi-persona.yaml');
  expect(agent.personas).toHaveLength(3);
});
```

---

## Test Modification Process

### When Exception Applies

**Checklist:**

- [ ] Exception case applies (requirements change OR objectively wrong test)
- [ ] ADR created documenting reason for change
- [ ] Team discussion and approval
- [ ] Test modification documented in ADR
- [ ] Implementation updated to pass new test
- [ ] All other tests still pass
- [ ] Code review completed
- [ ] Merge approved

### ADR Template for Test Modifications

```markdown
# ADR-XXX: Modify Test [Test Name]

**Status:** Proposed / Approved / Rejected
**Date:** YYYY-MM-DD
**Context:** Test modification request

## Problem Statement

[Why does the test need to be modified?]

## Current Test

```typescript
[Current test code]
```

## Proposed Change

```typescript
[Proposed test code]
```

## Justification

**Exception Category:** [Requirements Change / Objectively Wrong Test]

**Rationale:**
[Detailed explanation of why modification is necessary]

**Evidence:**
[Proof that test is wrong, not implementation]

## Impact Analysis

**Affected Files:**
- Test file: [path]
- Implementation file: [path]

**Other Tests Affected:**
- [List of related tests]

**Risk Assessment:**
- Risk: [LOW / MEDIUM / HIGH]
- Mitigation: [How to minimize risk]

## Decision

**Approved by:** [Team / Lead Developer]
**Date:** YYYY-MM-DD

## Implementation

**Changes Made:**
1. [List of changes]

**Verification:**
- [ ] New test passes
- [ ] All other tests pass
- [ ] Implementation updated
- [ ] Documentation updated
```

---

## Reporting Requirements

### Test Failure Report Template

**Location:** `reports/test-failures/`
**Filename:** `failure-YYYY-MM-DD-HHMMSS.md`

```markdown
# Test Failure Report

**Report ID:** TEST-FAIL-{timestamp}
**Date:** {ISO 8601 timestamp}
**Test File:** {relative path}
**Test Suite:** {describe block name}
**Test Name:** {test name}
**Status:** ❌ FAILED

## Failure Summary

**Quick Summary:** [One-line description of failure]

**Severity:** [CRITICAL / HIGH / MEDIUM / LOW]
**Category:** [Unit / Integration / E2E / API]

## Failure Details

**Expected:** {expected value}
**Received:** {actual value}

**Error Message:**
```
{full error message with stack trace}
```

## Environment

**Node.js:** {version}
**npm:** {version}
**OS:** {platform}
**Branch:** {git branch}
**Commit:** {git commit hash}

## Root Cause Analysis

### Investigation Steps

1. [Step 1 of investigation]
2. [Step 2 of investigation]
3. [Findings]

### Root Cause

**File:** {implementation file path:line}
**Issue:** [Description of implementation bug]

**Code Snippet:**
```typescript
// Current (WRONG):
{buggy code}

// Should be (CORRECT):
{correct code}
```

## Fix Required

**Action Required:** [What needs to be fixed]
**Implementation File:** {file path}
**Estimated Time:** {time estimate}
**Priority:** [CRITICAL / HIGH / MEDIUM / LOW]

## Related Tests

**May Also Affect:**
- [ ] {test 1}
- [ ] {test 2}
- [ ] {test 3}

**Must Verify After Fix:**
- [ ] Run affected test: `npm test {path}`
- [ ] Run full test suite: `npm test`
- [ ] Run build: `npm run build`

## Fix Todo List

- [ ] {Todo item 1}
- [ ] {Todo item 2}
- [ ] {Todo item 3}

---

**Report Status:** 🔴 OPEN
**Assigned To:** {developer name}
**Created By:** {creator}
**Last Updated:** {timestamp}
```

### Resolution Update Template

When test is fixed, update report:

```markdown
---

## Resolution

**Fixed By:** {developer name}
**Fix Commit:** {commit hash}
**Fix Date:** {timestamp}
**Resolution Time:** {duration}

**Implementation Changes:**
```typescript
{code diff or description of changes}
```

**Verification:**
- ✅ Affected test now passes
- ✅ Full test suite passes
- ✅ Build succeeds
- ✅ No regressions

**Report Status:** ✅ RESOLVED
```

---

## Examples

### Example 1: Version Validation Test Failure

**Scenario:** Test expects exact version validation to reject ranges

**Test (IMMUTABLE):**
```typescript
test('should reject version ranges in package.json', () => {
  const pkg = {
    dependencies: {
      "next": "^15.5.6"  // Range operator
    }
  };

  expect(() => validateVersions(pkg)).toThrow('Version ranges not allowed');
});
```

**Failure:**
```bash
❌ FAIL: Expected function to throw, but it did not
```

**WRONG Response (FORBIDDEN):**
```typescript
// ❌ DON'T DO THIS:
test('should reject version ranges in package.json', () => {
  const pkg = {
    dependencies: {
      "next": "^15.5.6"
    }
  };

  // ❌ Commenting out the assertion
  // expect(() => validateVersions(pkg)).toThrow('Version ranges not allowed');

  // ❌ Or weakening it
  expect(() => validateVersions(pkg)).not.toThrow();  // WRONG!
});
```

**CORRECT Response:**

1. **Write Report:**
```markdown
# Test Failure Report

**Test:** "should reject version ranges in package.json"
**Issue:** validateVersions() does not throw error for version ranges

**Root Cause:**
File: scripts/validate-versions.js:78
Missing regex check for version range operators (^, ~, >, <)

**Fix Required:**
Add range detection logic to validateVersions() function
```

2. **Create Todo:**
```markdown
- [ ] Add version range regex check to validate-versions.js
- [ ] Test regex against all range operators (^, ~, >, <, >=, <=)
- [ ] Ensure error message matches test expectation
```

3. **Fix Implementation:**
```javascript
// scripts/validate-versions.js

function validateVersions(pkg) {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  for (const [name, version] of Object.entries(allDeps)) {
    // ✅ ADD THIS: Check for version ranges
    if (/[\^~><]/.test(version)) {
      throw new Error('Version ranges not allowed');
    }
  }
}
```

4. **Verify:**
```bash
npm test
# ✅ PASS: should reject version ranges in package.json
```

### Example 2: Agent Loader Test Failure

**Test (IMMUTABLE):**
```typescript
test('should cache loaded agents', async () => {
  const agent1 = await loadAgent('/path/agent.yaml');
  const agent2 = await loadAgent('/path/agent.yaml');

  expect(agent1).toBe(agent2);  // Same reference (cached)
});
```

**Failure:**
```bash
❌ FAIL: Expected values to have the same reference
```

**CORRECT Response:**

1. **Report:**
```markdown
**Root Cause:** AgentLoader creates new object on every call
**Fix:** Implement caching with Map<string, Agent>
```

2. **Fix Implementation:**
```typescript
// lib/agents/loader.ts

const cache = new Map<string, Agent>();

export async function loadAgent(path: string): Promise<Agent> {
  // ✅ Check cache first
  if (cache.has(path)) {
    return cache.get(path)!;
  }

  // Load and parse
  const agent = await parseAgentYAML(path);

  // ✅ Cache result
  cache.set(path, agent);

  return agent;
}
```

---

## Enforcement

### Code Review Checklist

**Reviewers MUST check:**

- [ ] No test files modified to make tests pass
- [ ] If test files modified, ADR exists justifying change
- [ ] Test failures addressed by fixing implementation
- [ ] Test failure reports written for any failures encountered
- [ ] Todo lists created for pending fixes
- [ ] No tests commented out or skipped
- [ ] No assertions weakened
- [ ] No timeout values increased without justification

### Pull Request Template

**Required Section:**

```markdown
## Testing

### Test Changes
- [ ] No tests modified (only implementation changed)
- [ ] OR: Tests modified with ADR justification (link: [ADR-XXX])

### Test Failures Encountered
- [ ] No test failures during development
- [ ] OR: Test failure reports created (list reports below)

**Test Failure Reports:**
1. [Link to report 1]
2. [Link to report 2]

### Test Coverage
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Coverage maintained or improved
```

### CI/CD Enforcement

**GitHub Actions:**

```yaml
name: Test Integrity Check

on: [pull_request]

jobs:
  test-integrity:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2  # Need previous commit

      - name: Check test file modifications
        run: |
          # Get list of modified test files
          MODIFIED_TESTS=$(git diff --name-only HEAD~1 HEAD | grep -E '__tests__|\.spec\.ts$|\.test\.ts$' || true)

          if [ -n "$MODIFIED_TESTS" ]; then
            echo "⚠️  Test files were modified:"
            echo "$MODIFIED_TESTS"
            echo ""
            echo "❌ Test modifications require ADR justification"
            echo "See: TESTING-POLICY.md"
            exit 1
          fi

          echo "✅ No test files modified"

      - name: Run tests
        run: npm test

      - name: Check for skipped tests
        run: |
          SKIPPED=$(grep -r "\.skip\|xit\|xdescribe" __tests__ || true)

          if [ -n "$SKIPPED" ]; then
            echo "❌ Skipped tests found"
            echo "$SKIPPED"
            exit 1
          fi

          echo "✅ No skipped tests"
```

### Automated Test Report Generation

**Hook:** `scripts/test-failure-hook.js`

```javascript
// Automatically generate failure report when tests fail

const fs = require('fs');
const path = require('path');

function generateFailureReport(testResult) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join('reports/test-failures', `failure-${timestamp}.md`);

  const report = `
# Test Failure Report

**Report ID:** TEST-FAIL-${timestamp}
**Date:** ${new Date().toISOString()}
**Test File:** ${testResult.testFilePath}
**Test Name:** ${testResult.testName}
**Status:** ❌ FAILED

## Failure Details

**Expected:** ${testResult.expected}
**Received:** ${testResult.actual}

**Error Message:**
\`\`\`
${testResult.error}
\`\`\`

## Action Required

⚠️  **DO NOT modify the test to make it pass.**

✅ **DO:**
1. Analyze the implementation code
2. Identify the bug
3. Fix the implementation
4. Verify the test passes

---

**Report Status:** 🔴 OPEN
**Created By:** Automated Test System
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📝 Test failure report created: ${reportPath}\n`);
}
```

---

## Summary

### Golden Rule

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Tests are the contract. Implementation must conform.       │
│                                                              │
│  When tests fail:                                           │
│    1. Write detailed report                                 │
│    2. Create todo list                                      │
│    3. Fix implementation                                    │
│                                                              │
│  NEVER modify tests to make them pass.                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Quick Reference

**Test Fails? Do This:**

1. ✅ Write failure report (`reports/test-failures/`)
2. ✅ Create todo list for fixes
3. ✅ Fix implementation code
4. ✅ Verify test passes
5. ✅ Update report status to RESOLVED

**Test Fails? DON'T Do This:**

1. ❌ Change test assertions
2. ❌ Comment out test
3. ❌ Skip test with `.skip()`
4. ❌ Weaken assertions
5. ❌ Modify test expectations

---

## References

- [PLAN.md](./PLAN.md) - Development workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [PRD.md](./PRD.md) - Testing requirements
- [CLAUDE.md](./CLAUDE.md) - Developer guidance
- Test files: `__tests__/**/*.test.ts`
- E2E tests: `e2e-tests/**/*.spec.ts`

---

**Document Version:** 1.0.0
**Status:** ⛔ **LOCKED** - Critical Policy
**Last Updated:** 2025-10-28
**Review Cycle:** Never (Immutable principle)
**Next Review:** N/A (Principle does not change)

---

**This policy is IMMUTABLE. Tests define the contract. Implementation must conform.**

# Comprehensive Test Plan: API Route GET /api/status/:type/:id

**Story:** STORY-V3-017 - Create API Route GET /api/status/:type/:id
**Points:** 2 (API implementation)
**Type:** API Integration
**Created:** 2025-10-29
**Status:** Test Plan Complete - Ready for Implementation

---

## Acceptance Criteria

From STORY-V3-019 (detailed requirements):

- [ ] Route: `GET /api/status/:type/:id`
- [ ] Types: epic, story, workflow, state-machine
- [ ] Use status provider registry
- [ ] Return JSON StatusResult
- [ ] Error handling (404, 500)
- [ ] API integration tests

---

## API Route Structure

### Route Location
```
app/api/status/[type]/[id]/route.ts
```

### TypeScript Function Signature
```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
): Promise<NextResponse>
```

### Response Format (Success)
```typescript
{
  success: true,
  result: StatusResult  // From lib/status/types.ts
}
```

### Response Format (Error)
```typescript
{
  success: false,
  error: string,
  code?: string  // ERROR_CODE constants
}
```

---

## Test Suite Structure

### Location
```
__tests__/app/api/status/[type]/[id]/route.test.ts
```

### Test Organization

```typescript
describe('GET /api/status/:type/:id', () => {
  // Test Suite 1: Successful Status Queries (20 tests)
  describe('Successful Status Queries', () => {
    // Story status queries (5 tests)
    // Epic status queries (5 tests)
    // Workflow status queries (5 tests)
    // State machine queries (5 tests)
  });

  // Test Suite 2: Parameter Validation (15 tests)
  describe('Parameter Validation', () => {
    // Valid type validation (4 tests)
    // Invalid type validation (4 tests)
    // ID format validation (4 tests)
    // Edge cases (3 tests)
  });

  // Test Suite 3: Error Handling (20 tests)
  describe('Error Handling', () => {
    // 404 Not Found (8 tests)
    // 500 Server Error (6 tests)
    // 400 Bad Request (6 tests)
  });

  // Test Suite 4: Response Format Validation (10 tests)
  describe('Response Format Validation', () => {
    // Success response structure (5 tests)
    // Error response structure (5 tests)
  });

  // Test Suite 5: Registry Integration (15 tests)
  describe('Registry Integration', () => {
    // Provider detection (5 tests)
    // Provider invocation (5 tests)
    // Provider errors (5 tests)
  });

  // Test Suite 6: Edge Cases & Security (10 tests)
  describe('Edge Cases & Security', () => {
    // Malformed input (3 tests)
    // Special characters (3 tests)
    // Empty parameters (2 tests)
    // Very long IDs (2 tests)
  });

  // Test Suite 7: HTTP Status Codes (6 tests)
  describe('HTTP Status Codes', () => {
    // 200 OK (2 tests)
    // 400 Bad Request (2 tests)
    // 404 Not Found (1 test)
    // 500 Internal Server Error (1 test)
  });

  // Test Suite 8: Integration Scenarios (10 tests)
  describe('Integration Scenarios', () => {
    // Real-world usage patterns (10 tests)
  });
});
```

**Total Tests: 106 comprehensive tests**

---

## Detailed Test Specifications

### Test Suite 1: Successful Status Queries (20 tests)

#### 1.1 Story Status Queries (5 tests)

**Test 1.1.1: Get story status with STORY- prefix**
```typescript
it('should return story status for STORY-V3-001', async () => {
  // Given: Valid story ID with STORY- prefix
  const type = 'story';
  const id = 'STORY-V3-001';

  // Mock: StoryStatusProvider.getStatus() returns valid result
  mockRegistry.getStatusResult.mockResolvedValue({
    entityType: 'story',
    entityId: 'STORY-V3-001',
    data: {
      status: 'in-progress',
      title: 'Example Story',
      points: 5
    },
    timestamp: new Date(),
    metadata: {}
  });

  // When: GET /api/status/story/STORY-V3-001
  const response = await GET(mockRequest, { params: Promise.resolve({ type, id }) });
  const data = await response.json();

  // Then: Returns 200 with story data
  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(data.result.entityType).toBe('story');
  expect(data.result.entityId).toBe('STORY-V3-001');
  expect(data.result.data.status).toBe('in-progress');
});
```

**Test 1.1.2: Get story status with US- prefix**
```typescript
it('should return story status for US-001', async () => {
  // US-001 pattern (User Story format)
  // Similar structure to Test 1.1.1
});
```

**Test 1.1.3: Get story status with TASK- prefix**
```typescript
it('should return story status for TASK-001', async () => {
  // TASK-001 pattern
  // Similar structure to Test 1.1.1
});
```

**Test 1.1.4: Get story status with case-insensitive ID**
```typescript
it('should return story status for story-v3-001 (lowercase)', async () => {
  // Case insensitive matching
  // Similar structure to Test 1.1.1
});
```

**Test 1.1.5: Get story status with all metadata fields**
```typescript
it('should return story with complete metadata', async () => {
  // Mock returns all fields: title, points, assignee, dates, milestone
  // Verify all fields present in response
});
```

#### 1.2 Epic Status Queries (5 tests)

**Test 1.2.1: Get epic status with EPIC-V3- prefix**
```typescript
it('should return epic status for EPIC-V3-001', async () => {
  // Given: Valid epic ID
  const type = 'epic';
  const id = 'EPIC-V3-001';

  // Mock: EpicStatusProvider.getStatus() returns valid result
  mockRegistry.getStatusResult.mockResolvedValue({
    entityType: 'epic',
    entityId: 'EPIC-V3-001',
    data: {
      title: 'Scale-Adaptive Workflow Router',
      priority: 'P0',
      effort: 34,
      completedStories: 3,
      totalStories: 10
    },
    timestamp: new Date(),
    metadata: {}
  });

  // When: GET /api/status/epic/EPIC-V3-001
  const response = await GET(mockRequest, { params: Promise.resolve({ type, id }) });
  const data = await response.json();

  // Then: Returns 200 with epic data
  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(data.result.entityType).toBe('epic');
  expect(data.result.entityId).toBe('EPIC-V3-001');
  expect(data.result.data.completedStories).toBe(3);
  expect(data.result.data.totalStories).toBe(10);
});
```

**Test 1.2.2: Get epic status with EPIC- prefix (no version)**
```typescript
it('should return epic status for EPIC-MAM', async () => {
  // EPIC-MAM pattern (no version number)
});
```

**Test 1.2.3: Get epic status with case-insensitive ID**
```typescript
it('should return epic status for epic-v3-001 (lowercase)', async () => {
  // Case insensitive matching
});
```

**Test 1.2.4: Get epic status with all metadata**
```typescript
it('should return epic with complete metadata', async () => {
  // All fields: title, description, priority, effort, quarter, owner, status, story count, last updated, summary
});
```

**Test 1.2.5: Get epic status with story breakdown**
```typescript
it('should return epic with story breakdown', async () => {
  // Verify stories array contains story details
});
```

#### 1.3 Workflow Status Queries (5 tests)

**Test 1.3.1: Get workflow status for kebab-case workflow**
```typescript
it('should return workflow status for pm-planning', async () => {
  // Given: Valid workflow name (kebab-case)
  const type = 'workflow';
  const id = 'pm-planning';

  // Mock: WorkflowStatusProvider.getStatus() returns valid result
  mockRegistry.getStatusResult.mockResolvedValue({
    entityType: 'workflow',
    entityId: 'pm-planning',
    data: {
      workflowName: 'pm-planning',
      currentStep: 2,
      totalSteps: 5,
      progress: 40,
      status: 'in_progress'
    },
    timestamp: new Date(),
    metadata: {}
  });

  // When: GET /api/status/workflow/pm-planning
  const response = await GET(mockRequest, { params: Promise.resolve({ type, id }) });
  const data = await response.json();

  // Then: Returns 200 with workflow data
  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(data.result.entityType).toBe('workflow');
  expect(data.result.entityId).toBe('pm-planning');
  expect(data.result.data.progress).toBe(40);
});
```

**Test 1.3.2: Get workflow status for completed workflow**
```typescript
it('should return workflow status for completed workflow', async () => {
  // Mock status: 'completed', progress: 100
});
```

**Test 1.3.3: Get workflow status with step details**
```typescript
it('should return workflow with step details', async () => {
  // Verify steps array contains step status, timestamps
});
```

**Test 1.3.4: Get workflow status with context variables**
```typescript
it('should return workflow with context variables', async () => {
  // Verify context object contains workflow variables
});
```

**Test 1.3.5: Get workflow status for failed workflow**
```typescript
it('should return workflow status for failed workflow', async () => {
  // Mock status: 'failed', error message included
});
```

#### 1.4 State Machine Queries (5 tests)

**Test 1.4.1: Get state machine overview with 'state' ID**
```typescript
it('should return state machine overview for state', async () => {
  // Given: state-machine type with 'state' ID
  const type = 'state-machine';
  const id = 'state';

  // Mock: StateMachineStatusProvider.getStatus() returns overview
  mockRegistry.getStatusResult.mockResolvedValue({
    entityType: 'state',
    entityId: undefined,
    data: {
      backlog: 45,
      todo: 1,
      inProgress: 1,
      done: 40
    },
    timestamp: new Date(),
    metadata: {
      todoLimit: 1,
      inProgressLimit: 1,
      todoViolation: false,
      inProgressViolation: false
    }
  });

  // When: GET /api/status/state-machine/state
  const response = await GET(mockRequest, { params: Promise.resolve({ type, id }) });
  const data = await response.json();

  // Then: Returns 200 with state machine overview
  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(data.result.entityType).toBe('state');
  expect(data.result.data.backlog).toBe(45);
  expect(data.result.data.todo).toBe(1);
  expect(data.result.data.inProgress).toBe(1);
  expect(data.result.data.done).toBe(40);
});
```

**Test 1.4.2: Get state machine overview with 'overview' ID**
```typescript
it('should return state machine overview for overview', async () => {
  // ID: 'overview' - should work same as 'state'
});
```

**Test 1.4.3: Get state machine overview with 'summary' ID**
```typescript
it('should return state machine overview for summary', async () => {
  // ID: 'summary' - should work same as 'state'
});
```

**Test 1.4.4: Get state machine with limit violations**
```typescript
it('should return state machine with limit violations', async () => {
  // Mock: todo: 2 (violation), inProgress: 2 (violation)
  // Verify violation flags in metadata
});
```

**Test 1.4.5: Get state machine with empty sections**
```typescript
it('should return state machine with empty sections', async () => {
  // Mock: backlog: 0, todo: 0, inProgress: 0, done: 0
});
```

---

### Test Suite 2: Parameter Validation (15 tests)

#### 2.1 Valid Type Validation (4 tests)

**Test 2.1.1: Accept 'story' type**
```typescript
it('should accept type=story as valid', async () => {
  // type: 'story', id: 'STORY-001'
  // Expect: Success response
});
```

**Test 2.1.2: Accept 'epic' type**
```typescript
it('should accept type=epic as valid', async () => {
  // type: 'epic', id: 'EPIC-V3-001'
});
```

**Test 2.1.3: Accept 'workflow' type**
```typescript
it('should accept type=workflow as valid', async () => {
  // type: 'workflow', id: 'pm-planning'
});
```

**Test 2.1.4: Accept 'state-machine' type**
```typescript
it('should accept type=state-machine as valid', async () => {
  // type: 'state-machine', id: 'state'
});
```

#### 2.2 Invalid Type Validation (4 tests)

**Test 2.2.1: Reject invalid type 'invalid'**
```typescript
it('should return 400 for invalid type', async () => {
  // Given: Invalid type
  const type = 'invalid';
  const id = 'STORY-001';

  // When: GET /api/status/invalid/STORY-001
  const response = await GET(mockRequest, { params: Promise.resolve({ type, id }) });
  const data = await response.json();

  // Then: Returns 400 Bad Request
  expect(response.status).toBe(400);
  expect(data.success).toBe(false);
  expect(data.error).toContain('Invalid type');
  expect(data.error).toContain('story, epic, workflow, state-machine');
});
```

**Test 2.2.2: Reject empty type**
```typescript
it('should return 400 for empty type', async () => {
  // type: '', id: 'STORY-001'
  // Expect: 400 Bad Request
});
```

**Test 2.2.3: Reject uppercase type**
```typescript
it('should return 400 for STORY type (uppercase)', async () => {
  // type: 'STORY', id: 'STORY-001'
  // Expect: 400 Bad Request (types must be lowercase)
});
```

**Test 2.2.4: Reject type with special characters**
```typescript
it('should return 400 for type with special characters', async () => {
  // type: 'story!', id: 'STORY-001'
  // Expect: 400 Bad Request
});
```

#### 2.3 ID Format Validation (4 tests)

**Test 2.3.1: Accept valid story ID formats**
```typescript
it('should accept STORY-V3-001, US-001, TASK-001 formats', async () => {
  // Test multiple ID formats
  // All should succeed
});
```

**Test 2.3.2: Accept valid epic ID formats**
```typescript
it('should accept EPIC-V3-001, EPIC-MAM formats', async () => {
  // Test multiple epic ID formats
});
```

**Test 2.3.3: Accept valid workflow ID formats**
```typescript
it('should accept pm-planning, create-prd formats', async () => {
  // Test kebab-case workflow names
});
```

**Test 2.3.4: Accept state machine keyword IDs**
```typescript
it('should accept state, overview, summary, all for state-machine', async () => {
  // Test all valid state machine keywords
});
```

#### 2.4 Edge Cases (3 tests)

**Test 2.4.1: Handle very long IDs**
```typescript
it('should handle ID with 200+ characters', async () => {
  // ID: 'STORY-' + 'A'.repeat(200)
  // Should either accept or return 400 with length error
});
```

**Test 2.4.2: Handle IDs with URL-encoded characters**
```typescript
it('should handle URL-encoded ID %20%20%20', async () => {
  // ID: 'STORY%20001'
  // Should handle URL decoding or return 400
});
```

**Test 2.4.3: Handle IDs with trailing whitespace**
```typescript
it('should handle ID with trailing whitespace', async () => {
  // ID: 'STORY-001   '
  // Should trim or return error
});
```

---

### Test Suite 3: Error Handling (20 tests)

#### 3.1 404 Not Found Errors (8 tests)

**Test 3.1.1: Story not found**
```typescript
it('should return 404 for non-existent story', async () => {
  // Given: Story ID that doesn't exist
  const type = 'story';
  const id = 'STORY-NONEXISTENT';

  // Mock: Registry throws "Story not found" error
  mockRegistry.getStatusResult.mockRejectedValue(
    new Error('Story not found: STORY-NONEXISTENT')
  );

  // When: GET /api/status/story/STORY-NONEXISTENT
  const response = await GET(mockRequest, { params: Promise.resolve({ type, id }) });
  const data = await response.json();

  // Then: Returns 404 Not Found
  expect(response.status).toBe(404);
  expect(data.success).toBe(false);
  expect(data.error).toContain('not found');
  expect(data.code).toBe('ENTITY_NOT_FOUND');
});
```

**Test 3.1.2: Epic not found**
```typescript
it('should return 404 for non-existent epic', async () => {
  // Epic doesn't exist in docs/v3-planning/epics/
});
```

**Test 3.1.3: Workflow not found**
```typescript
it('should return 404 for non-existent workflow', async () => {
  // Workflow state file doesn't exist
});
```

**Test 3.1.4: Story not found in status file**
```typescript
it('should return 404 for story not in mam-workflow-status.md', async () => {
  // Story exists but not tracked in state machine
});
```

**Test 3.1.5: Epic file missing**
```typescript
it('should return 404 for missing epic markdown file', async () => {
  // EPIC-V3-999 file doesn't exist
});
```

**Test 3.1.6: Workflow state directory missing**
```typescript
it('should return 404 for missing workflow state directory', async () => {
  // madace-data/workflow-states/ doesn't exist
});
```

**Test 3.1.7: State machine file missing**
```typescript
it('should return 404 for missing mam-workflow-status.md', async () => {
  // docs/mam-workflow-status.md doesn't exist
});
```

**Test 3.1.8: Entity ID doesn't match provider pattern**
```typescript
it('should return 404 for ID that no provider recognizes', async () => {
  // Registry can't find provider for this ID pattern
});
```

#### 3.2 500 Server Error (6 tests)

**Test 3.2.1: Registry throws unexpected error**
```typescript
it('should return 500 for registry internal error', async () => {
  // Given: Registry throws non-standard error
  mockRegistry.getStatusResult.mockRejectedValue(
    new Error('Internal registry error')
  );

  // When: GET /api/status/story/STORY-001
  const response = await GET(mockRequest, { params: Promise.resolve({ type: 'story', id: 'STORY-001' }) });
  const data = await response.json();

  // Then: Returns 500 Internal Server Error
  expect(response.status).toBe(500);
  expect(data.success).toBe(false);
  expect(data.error).toContain('error');
  expect(data.code).toBe('INTERNAL_ERROR');
});
```

**Test 3.2.2: File system read error**
```typescript
it('should return 500 for file system permission error', async () => {
  // Mock: EACCES error (permission denied)
});
```

**Test 3.2.3: JSON parse error**
```typescript
it('should return 500 for malformed workflow state JSON', async () => {
  // Mock: JSON.parse() throws SyntaxError
});
```

**Test 3.2.4: Provider initialization error**
```typescript
it('should return 500 for provider initialization failure', async () => {
  // Mock: Provider constructor throws error
});
```

**Test 3.2.5: Unknown error type**
```typescript
it('should return 500 for non-Error exception', async () => {
  // Mock: Registry throws string error (not Error object)
  mockRegistry.getStatusResult.mockRejectedValue('String error');
});
```

**Test 3.2.6: Timeout error**
```typescript
it('should return 500 for timeout reading large file', async () => {
  // Mock: Promise never resolves (timeout scenario)
});
```

#### 3.3 400 Bad Request (6 tests)

**Test 3.3.1: Missing type parameter**
```typescript
it('should return 400 for missing type parameter', async () => {
  // type: undefined, id: 'STORY-001'
  // Expect: 400 Bad Request
});
```

**Test 3.3.2: Missing ID parameter**
```typescript
it('should return 400 for missing ID parameter', async () => {
  // type: 'story', id: undefined
  // Expect: 400 Bad Request
});
```

**Test 3.3.3: Both parameters missing**
```typescript
it('should return 400 for both parameters missing', async () => {
  // type: undefined, id: undefined
  // Expect: 400 Bad Request
});
```

**Test 3.3.4: Type parameter is number**
```typescript
it('should return 400 for numeric type parameter', async () => {
  // type: '123', id: 'STORY-001'
  // Expect: 400 Bad Request
});
```

**Test 3.3.5: ID with invalid characters**
```typescript
it('should return 400 for ID with SQL injection attempt', async () => {
  // id: "'; DROP TABLE stories; --"
  // Expect: 400 Bad Request (sanitization)
});
```

**Test 3.3.6: ID with path traversal attempt**
```typescript
it('should return 400 for ID with path traversal', async () => {
  // id: '../../../etc/passwd'
  // Expect: 400 Bad Request (security)
});
```

---

### Test Suite 4: Response Format Validation (10 tests)

#### 4.1 Success Response Structure (5 tests)

**Test 4.1.1: Validate success response has required fields**
```typescript
it('should return success response with required fields', async () => {
  // Response must have: success, result
  const response = await GET(...);
  const data = await response.json();

  expect(data).toHaveProperty('success');
  expect(data.success).toBe(true);
  expect(data).toHaveProperty('result');
  expect(data).not.toHaveProperty('error');
});
```

**Test 4.1.2: Validate StatusResult structure**
```typescript
it('should return result with StatusResult structure', async () => {
  // result must have: entityType, entityId, data, timestamp, metadata
  const data = await response.json();

  expect(data.result).toHaveProperty('entityType');
  expect(data.result).toHaveProperty('data');
  expect(data.result).toHaveProperty('timestamp');
  expect(data.result).toHaveProperty('metadata');
});
```

**Test 4.1.3: Validate timestamp is ISO string**
```typescript
it('should return timestamp as ISO 8601 string', async () => {
  // timestamp should be parseable as Date
  const data = await response.json();
  const timestamp = new Date(data.result.timestamp);

  expect(timestamp).toBeInstanceOf(Date);
  expect(timestamp.toString()).not.toBe('Invalid Date');
});
```

**Test 4.1.4: Validate data object is not null**
```typescript
it('should return data object (not null)', async () => {
  const data = await response.json();

  expect(data.result.data).not.toBeNull();
  expect(typeof data.result.data).toBe('object');
});
```

**Test 4.1.5: Validate metadata object exists**
```typescript
it('should return metadata object', async () => {
  const data = await response.json();

  expect(data.result.metadata).toBeDefined();
  expect(typeof data.result.metadata).toBe('object');
});
```

#### 4.2 Error Response Structure (5 tests)

**Test 4.2.1: Validate error response has required fields**
```typescript
it('should return error response with required fields', async () => {
  // Response must have: success, error, code
  mockRegistry.getStatusResult.mockRejectedValue(new Error('Test error'));

  const response = await GET(...);
  const data = await response.json();

  expect(data).toHaveProperty('success');
  expect(data.success).toBe(false);
  expect(data).toHaveProperty('error');
  expect(data).toHaveProperty('code');
  expect(data).not.toHaveProperty('result');
});
```

**Test 4.2.2: Validate error message is string**
```typescript
it('should return error as string', async () => {
  const data = await response.json();

  expect(typeof data.error).toBe('string');
  expect(data.error.length).toBeGreaterThan(0);
});
```

**Test 4.2.3: Validate error code is from enum**
```typescript
it('should return error code from ERROR_CODE enum', async () => {
  const data = await response.json();
  const validCodes = ['ENTITY_NOT_FOUND', 'INVALID_TYPE', 'INTERNAL_ERROR', 'MISSING_PARAMS'];

  expect(validCodes).toContain(data.code);
});
```

**Test 4.2.4: Validate error response doesn't leak stack traces**
```typescript
it('should not return stack trace in production', async () => {
  const data = await response.json();

  expect(data.error).not.toContain('at Object');
  expect(data.error).not.toContain('.ts:');
  expect(data).not.toHaveProperty('stack');
});
```

**Test 4.2.5: Validate error response is JSON-serializable**
```typescript
it('should return error response that is JSON-serializable', async () => {
  const response = await GET(...);
  const data = await response.json();

  // Should not throw
  const serialized = JSON.stringify(data);
  expect(serialized).toBeDefined();

  // Should be parseable
  const parsed = JSON.parse(serialized);
  expect(parsed).toEqual(data);
});
```

---

### Test Suite 5: Registry Integration (15 tests)

#### 5.1 Provider Detection (5 tests)

**Test 5.1.1: Verify StoryStatusProvider is invoked for story type**
```typescript
it('should invoke StoryStatusProvider for type=story', async () => {
  // Mock: Spy on registry.getStatusResult()
  const spy = jest.spyOn(mockRegistry, 'getStatusResult');

  await GET(..., { params: Promise.resolve({ type: 'story', id: 'STORY-001' }) });

  // Verify: getStatusResult was called with 'STORY-001'
  expect(spy).toHaveBeenCalledWith('STORY-001');
});
```

**Test 5.1.2: Verify EpicStatusProvider is invoked for epic type**
```typescript
it('should invoke EpicStatusProvider for type=epic', async () => {
  // Similar to 5.1.1
});
```

**Test 5.1.3: Verify WorkflowStatusProvider is invoked for workflow type**
```typescript
it('should invoke WorkflowStatusProvider for type=workflow', async () => {
  // Similar to 5.1.1
});
```

**Test 5.1.4: Verify StateMachineStatusProvider is invoked for state-machine type**
```typescript
it('should invoke StateMachineStatusProvider for type=state-machine', async () => {
  // Similar to 5.1.1
});
```

**Test 5.1.5: Verify registry is only called once per request**
```typescript
it('should call registry getStatusResult() exactly once', async () => {
  const spy = jest.spyOn(mockRegistry, 'getStatusResult');

  await GET(...);

  expect(spy).toHaveBeenCalledTimes(1);
});
```

#### 5.2 Provider Invocation (5 tests)

**Test 5.2.1: Verify provider receives correct entity ID**
```typescript
it('should pass correct entity ID to provider', async () => {
  mockRegistry.getStatusResult.mockImplementation(async (entityId) => {
    // Verify entityId matches expected value
    expect(entityId).toBe('STORY-V3-001');
    return mockResult;
  });

  await GET(..., { params: Promise.resolve({ type: 'story', id: 'STORY-V3-001' }) });
});
```

**Test 5.2.2: Verify provider return value is passed through**
```typescript
it('should return provider result unchanged', async () => {
  const mockResult = {
    entityType: 'story',
    entityId: 'STORY-001',
    data: { status: 'done' },
    timestamp: new Date(),
    metadata: {}
  };

  mockRegistry.getStatusResult.mockResolvedValue(mockResult);

  const response = await GET(...);
  const data = await response.json();

  expect(data.result).toEqual(mockResult);
});
```

**Test 5.2.3: Verify provider errors are caught**
```typescript
it('should catch provider errors and return error response', async () => {
  mockRegistry.getStatusResult.mockRejectedValue(new Error('Provider error'));

  const response = await GET(...);

  expect(response.status).toBeGreaterThanOrEqual(400);
});
```

**Test 5.2.4: Verify provider timeout is handled**
```typescript
it('should handle provider timeout gracefully', async () => {
  // Mock: Promise never resolves
  mockRegistry.getStatusResult.mockImplementation(() => new Promise(() => {}));

  // Should timeout or return error (if timeout implemented)
});
```

**Test 5.2.5: Verify provider null result is handled**
```typescript
it('should handle provider returning null', async () => {
  mockRegistry.getStatusResult.mockResolvedValue(null as any);

  const response = await GET(...);

  // Should return error or handle gracefully
  expect(response.status).toBeGreaterThanOrEqual(400);
});
```

#### 5.3 Provider Errors (5 tests)

**Test 5.3.1: Handle provider "not found" error**
```typescript
it('should return 404 for provider "not found" error', async () => {
  mockRegistry.getStatusResult.mockRejectedValue(
    new Error('Entity not found: STORY-999')
  );

  const response = await GET(...);

  expect(response.status).toBe(404);
});
```

**Test 5.3.2: Handle provider "permission denied" error**
```typescript
it('should return 500 for provider permission error', async () => {
  mockRegistry.getStatusResult.mockRejectedValue(
    new Error('EACCES: permission denied')
  );

  const response = await GET(...);

  expect(response.status).toBe(500);
});
```

**Test 5.3.3: Handle provider "no provider" error**
```typescript
it('should return 400 for "No status provider found" error', async () => {
  mockRegistry.getStatusResult.mockRejectedValue(
    new Error('No status provider found for input: "INVALID"')
  );

  const response = await GET(...);

  expect(response.status).toBe(400);
});
```

**Test 5.3.4: Handle provider validation error**
```typescript
it('should return 400 for provider validation error', async () => {
  mockRegistry.getStatusResult.mockRejectedValue(
    new Error('Validation failed: Invalid entity ID format')
  );

  const response = await GET(...);

  expect(response.status).toBe(400);
});
```

**Test 5.3.5: Handle provider generic error**
```typescript
it('should return 500 for provider generic error', async () => {
  mockRegistry.getStatusResult.mockRejectedValue(
    new Error('Something went wrong')
  );

  const response = await GET(...);

  expect(response.status).toBe(500);
});
```

---

### Test Suite 6: Edge Cases & Security (10 tests)

#### 6.1 Malformed Input (3 tests)

**Test 6.1.1: Handle null type parameter**
```typescript
it('should handle null type parameter', async () => {
  // type: null, id: 'STORY-001'
  const response = await GET(..., { params: Promise.resolve({ type: null as any, id: 'STORY-001' }) });

  expect(response.status).toBe(400);
});
```

**Test 6.1.2: Handle undefined ID parameter**
```typescript
it('should handle undefined ID parameter', async () => {
  // type: 'story', id: undefined
  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: undefined as any }) });

  expect(response.status).toBe(400);
});
```

**Test 6.1.3: Handle object as ID parameter**
```typescript
it('should handle object as ID parameter', async () => {
  // type: 'story', id: { foo: 'bar' }
  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: { foo: 'bar' } as any }) });

  expect(response.status).toBe(400);
});
```

#### 6.2 Special Characters (3 tests)

**Test 6.2.1: Handle HTML injection in ID**
```typescript
it('should sanitize HTML in ID parameter', async () => {
  // id: '<script>alert("XSS")</script>'
  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: '<script>alert("XSS")</script>' }) });

  // Should return 400 or sanitize
  expect(response.status).toBe(400);
});
```

**Test 6.2.2: Handle SQL injection in ID**
```typescript
it('should sanitize SQL injection in ID parameter', async () => {
  // id: "'; DROP TABLE stories; --"
  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: "'; DROP TABLE stories; --" }) });

  expect(response.status).toBe(400);
});
```

**Test 6.2.3: Handle path traversal in ID**
```typescript
it('should prevent path traversal in ID parameter', async () => {
  // id: '../../../etc/passwd'
  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: '../../../etc/passwd' }) });

  expect(response.status).toBe(400);
});
```

#### 6.3 Empty Parameters (2 tests)

**Test 6.3.1: Handle empty string type**
```typescript
it('should return 400 for empty string type', async () => {
  const response = await GET(..., { params: Promise.resolve({ type: '', id: 'STORY-001' }) });

  expect(response.status).toBe(400);
});
```

**Test 6.3.2: Handle empty string ID**
```typescript
it('should return 400 for empty string ID', async () => {
  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: '' }) });

  expect(response.status).toBe(400);
});
```

#### 6.4 Very Long IDs (2 tests)

**Test 6.4.1: Handle 500-character ID**
```typescript
it('should handle or reject 500-character ID', async () => {
  const longId = 'STORY-' + 'A'.repeat(494);
  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: longId }) });

  // Should either accept or return 400 with length error
  expect([200, 400, 404]).toContain(response.status);
});
```

**Test 6.4.2: Handle 10000-character ID**
```typescript
it('should reject 10000-character ID', async () => {
  const veryLongId = 'STORY-' + 'A'.repeat(9994);
  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: veryLongId }) });

  expect(response.status).toBe(400);
});
```

---

### Test Suite 7: HTTP Status Codes (6 tests)

**Test 7.1: Return 200 OK for successful story query**
```typescript
it('should return 200 OK for successful query', async () => {
  mockRegistry.getStatusResult.mockResolvedValue(mockStoryResult);

  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: 'STORY-001' }) });

  expect(response.status).toBe(200);
});
```

**Test 7.2: Return 200 OK for successful epic query**
```typescript
it('should return 200 OK for successful epic query', async () => {
  // Similar to 7.1
});
```

**Test 7.3: Return 400 Bad Request for invalid type**
```typescript
it('should return 400 Bad Request for invalid type', async () => {
  const response = await GET(..., { params: Promise.resolve({ type: 'invalid', id: 'STORY-001' }) });

  expect(response.status).toBe(400);
});
```

**Test 7.4: Return 400 Bad Request for missing parameters**
```typescript
it('should return 400 Bad Request for missing parameters', async () => {
  const response = await GET(..., { params: Promise.resolve({ type: undefined as any, id: 'STORY-001' }) });

  expect(response.status).toBe(400);
});
```

**Test 7.5: Return 404 Not Found for non-existent entity**
```typescript
it('should return 404 Not Found for non-existent entity', async () => {
  mockRegistry.getStatusResult.mockRejectedValue(new Error('Entity not found'));

  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: 'STORY-999' }) });

  expect(response.status).toBe(404);
});
```

**Test 7.6: Return 500 Internal Server Error for registry failure**
```typescript
it('should return 500 Internal Server Error for registry failure', async () => {
  mockRegistry.getStatusResult.mockRejectedValue(new Error('Internal error'));

  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: 'STORY-001' }) });

  expect(response.status).toBe(500);
});
```

---

### Test Suite 8: Integration Scenarios (10 tests)

**Test 8.1: End-to-end story status query**
```typescript
it('should handle complete story status query flow', async () => {
  // Real-world scenario: Frontend queries story status
  // 1. Parse parameters
  // 2. Validate type and ID
  // 3. Call registry
  // 4. Return formatted response

  mockRegistry.getStatusResult.mockResolvedValue({
    entityType: 'story',
    entityId: 'STORY-V3-016',
    data: {
      status: 'done',
      title: 'Create madace status CLI Command',
      points: 3,
      completedAt: '2025-10-29'
    },
    timestamp: new Date(),
    metadata: {}
  });

  const response = await GET(..., { params: Promise.resolve({ type: 'story', id: 'STORY-V3-016' }) });
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(data.result.entityType).toBe('story');
  expect(data.result.data.status).toBe('done');
});
```

**Test 8.2: Epic progress tracking scenario**
```typescript
it('should return epic progress for Web UI dashboard', async () => {
  // Scenario: Dashboard displays epic completion percentage
});
```

**Test 8.3: Workflow execution monitoring**
```typescript
it('should return workflow status for monitoring page', async () => {
  // Scenario: Monitor workflow execution progress
});
```

**Test 8.4: State machine Kanban view**
```typescript
it('should return state machine overview for Kanban board', async () => {
  // Scenario: Kanban board displays story counts
});
```

**Test 8.5: CLI integration scenario**
```typescript
it('should return JSON response for CLI consumption', async () => {
  // Scenario: CLI tool queries status via API
});
```

**Test 8.6: Multiple concurrent requests**
```typescript
it('should handle multiple concurrent requests', async () => {
  // Scenario: 10 requests at the same time
  // All should succeed
});
```

**Test 8.7: Request with stale cache**
```typescript
it('should return fresh data even if cache is stale', async () => {
  // Scenario: Registry cache might be stale
  // API should return latest data
});
```

**Test 8.8: Request after file system change**
```typescript
it('should return updated data after file change', async () => {
  // Scenario: Status file changed between requests
});
```

**Test 8.9: Error recovery scenario**
```typescript
it('should recover after transient error', async () => {
  // First request fails, second succeeds
  mockRegistry.getStatusResult
    .mockRejectedValueOnce(new Error('Temporary error'))
    .mockResolvedValueOnce(mockStoryResult);

  const response1 = await GET(...);
  expect(response1.status).toBe(500);

  const response2 = await GET(...);
  expect(response2.status).toBe(200);
});
```

**Test 8.10: Comprehensive error handling flow**
```typescript
it('should handle complete error flow with proper logging', async () => {
  // Scenario: Error occurs, gets logged, returns proper response
});
```

---

## Test Implementation Guidelines

### Mocking Strategy

```typescript
// Mock Next.js Response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

// Mock Status Registry
jest.mock('@/lib/status/registry', () => ({
  getStatusRegistry: jest.fn(),
}));
```

### Test Setup Pattern

```typescript
describe('GET /api/status/:type/:id', () => {
  let mockRequest: Partial<Request>;
  let mockRegistry: jest.Mocked<StatusProviderRegistry>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      url: 'http://localhost:3000/api/status/story/STORY-001',
      headers: new Headers(),
    };

    mockRegistry = {
      getStatusResult: jest.fn(),
      getStatus: jest.fn(),
      detectEntityType: jest.fn(),
    } as any;

    (getStatusRegistry as jest.Mock).mockReturnValue(mockRegistry);
  });

  // Tests here...
});
```

### Assertion Patterns

```typescript
// Success response assertions
expect(response.status).toBe(200);
expect(data).toHaveProperty('success', true);
expect(data).toHaveProperty('result');
expect(data.result).toHaveProperty('entityType');

// Error response assertions
expect(response.status).toBeGreaterThanOrEqual(400);
expect(data).toHaveProperty('success', false);
expect(data).toHaveProperty('error');
expect(data).toHaveProperty('code');

// Type assertions
expect(typeof data.result.entityType).toBe('string');
expect(Array.isArray(data.result.data.stories)).toBe(true);
expect(data.result.timestamp).toBeInstanceOf(Date);
```

---

## Error Code Constants

```typescript
// ERROR_CODE enum
enum ERROR_CODE {
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',       // 404
  INVALID_TYPE = 'INVALID_TYPE',               // 400
  MISSING_PARAMS = 'MISSING_PARAMS',           // 400
  INTERNAL_ERROR = 'INTERNAL_ERROR',           // 500
  PROVIDER_ERROR = 'PROVIDER_ERROR',           // 500
  VALIDATION_ERROR = 'VALIDATION_ERROR',       // 400
  PERMISSION_DENIED = 'PERMISSION_DENIED',     // 500
  TIMEOUT = 'TIMEOUT',                         // 500
}
```

---

## Coverage Goals

- **Line Coverage:** 100%
- **Branch Coverage:** 100%
- **Function Coverage:** 100%
- **Statement Coverage:** 100%

---

## Test Execution

```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/app/api/status/[type]/[id]/route.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Acceptance Criteria Checklist

After implementation, verify:

- [ ] All 106 tests pass (100%)
- [ ] Route handles all 4 entity types (story, epic, workflow, state-machine)
- [ ] Registry integration works correctly
- [ ] Error codes match enum
- [ ] HTTP status codes are correct (200, 400, 404, 500)
- [ ] Response format matches specification
- [ ] Security validation (no injection, no path traversal)
- [ ] Performance acceptable (<100ms for typical request)
- [ ] TypeScript compilation passes (0 errors)
- [ ] ESLint passes (0 errors)
- [ ] Production build succeeds

---

## Next Steps

1. **Review Test Plan** - Validate completeness with user
2. **Implement API Route** - Create `app/api/status/[type]/[id]/route.ts`
3. **Implement Tests** - Create test file with all 106 tests
4. **Fix Failing Tests** - Iterate until 100% pass rate
5. **Run Quality Checks** - type-check, lint, build, test
6. **Document** - Update mam-workflow-status.md with completion details
7. **Commit** - Git commit with detailed message

---

**Test Plan Status:** ✅ COMPLETE - Ready for Implementation
**Test Count:** 106 comprehensive tests
**Coverage Target:** 100% (line, branch, function, statement)
**Next Action:** Review with user, then implement

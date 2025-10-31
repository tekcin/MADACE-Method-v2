# Remaining Workflow API Endpoints

**Status:** To Be Implemented
**Created:** 2025-10-31

---

## Overview

This document lists the remaining API endpoints needed to complete the interactive workflow system. The UI components (WorkflowInputForm, WorkflowRunner) and execution endpoint are already built.

---

## Required Endpoints

### 1. POST /api/v3/workflows/[id]/input

**Purpose:** Submit user input for elicit steps

**Location:** `app/api/v3/workflows/[id]/input/route.ts`

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const InputSchema = z.object({
  stepIndex: z.number(),
  value: z.unknown(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { stepIndex, value } = InputSchema.parse(body);

    // Store input in workflow state directory
    const inputDir = path.join(process.cwd(), '.madace', 'workflow-inputs');
    await fs.mkdir(inputDir, { recursive: true});

    const inputFile = path.join(inputDir, `${id}.json`);

    const inputs = await fs
      .readFile(inputFile, 'utf-8')
      .then(JSON.parse)
      .catch(() => ({}));

    inputs[stepIndex] = value;

    await fs.writeFile(inputFile, JSON.stringify(inputs, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Input received',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

### 2. POST /api/v3/workflows/[id]/resume

**Purpose:** Resume workflow execution after input submission

**Location:** `app/api/v3/workflows/[id]/resume/route.ts`

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { loadWorkflow, createWorkflowExecutor } from '@/lib/workflows';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Load workflow and executor
    const workflowPath = await findWorkflowPath(id);
    if (!workflowPath) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflow = await loadWorkflow(workflowPath);
    const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
    const executor = createWorkflowExecutor(workflow, stateDir);

    await executor.initialize(); // Load existing state

    // Resume execution
    const result = await executor.resume();

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

### 3. GET /api/v3/workflows/[id]/stream

**Purpose:** Server-Sent Events endpoint for live workflow updates

**Location:** `app/api/v3/workflows/[id]/stream/route.ts`

**Implementation:**
```typescript
import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Poll workflow state every 500ms
      const interval = setInterval(async () => {
        try {
          const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
          const stateFile = path.join(stateDir, `.${id}.state.json`);

          const state = await fs
            .readFile(stateFile, 'utf-8')
            .then(JSON.parse)
            .catch(() => null);

          if (state) {
            sendEvent({ type: 'state', state });

            if (state.completed) {
              sendEvent({ type: 'completed' });
              clearInterval(interval);
              controller.close();
            }

            if (state.variables._WAITING_FOR_INPUT) {
              sendEvent({
                type: 'waiting_input',
                step: state.variables._WAITING_FOR_INPUT,
              });
            }
          }
        } catch (error) {
          sendEvent({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }, 500);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

---

### 4. POST /api/v3/workflows/[id]/reset

**Purpose:** Reset workflow state to beginning

**Location:** `app/api/v3/workflows/[id]/reset/route.ts`

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
    const stateFile = path.join(stateDir, `.${id}.state.json`);

    // Delete state file
    await fs.unlink(stateFile).catch(() => {
      // File doesn't exist, that's fine
    });

    // Delete input file
    const inputDir = path.join(process.cwd(), '.madace', 'workflow-inputs');
    const inputFile = path.join(inputDir, `${id}.json`);

    await fs.unlink(inputFile).catch(() => {
      // File doesn't exist, that's fine
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow reset successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

### 5. GET /api/v3/workflows/[id]/state

**Purpose:** Get current workflow execution state

**Location:** `app/api/v3/workflows/[id]/state/route.ts`

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
    const stateFile = path.join(stateDir, `.${id}.state.json`);

    const state = await fs
      .readFile(stateFile, 'utf-8')
      .then(JSON.parse)
      .catch(() => null);

    if (!state) {
      return NextResponse.json(
        { success: false, error: 'Workflow state not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      state,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Implementation Priority

1. **HIGH PRIORITY** (Needed for interactive workflows):
   - POST /api/v3/workflows/[id]/input
   - POST /api/v3/workflows/[id]/resume
   - GET /api/v3/workflows/[id]/stream

2. **MEDIUM PRIORITY** (Nice to have):
   - POST /api/v3/workflows/[id]/reset
   - GET /api/v3/workflows/[id]/state

---

## Testing Plan

### Unit Tests
```typescript
// __tests__/app/api/workflows/execute.test.ts
describe('POST /api/v3/workflows/[id]/execute', () => {
  it('should start workflow execution', async () => {
    const response = await POST(
      new Request('http://localhost/api/v3/workflows/test-workflow/execute', {
        method: 'POST',
      }),
      { params: { id: 'test-workflow' } }
    );

    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### Integration Tests
- Test complete workflow execution with input steps
- Verify SSE updates are sent correctly
- Test workflow reset functionality
- Validate state persistence

---

## Estimated Effort

- Input endpoint: 30 minutes
- Resume endpoint: 30 minutes
- SSE stream endpoint: 1 hour
- Reset endpoint: 20 minutes
- State endpoint: 20 minutes
- Testing: 1 hour

**Total: ~3-4 hours**

---

## Next Steps

1. Create remaining API endpoint files
2. Update executor to properly handle input waiting state
3. Test end-to-end workflow with UI
4. Add comprehensive error handling
5. Document API in main docs

---

## Notes

- All endpoints follow Next.js 15 App Router conventions
- Error handling uses try-catch with proper HTTP status codes
- File-based state storage for simplicity (can be migrated to database later)
- SSE polling interval is 500ms for responsive updates
- All endpoints are properly typed with TypeScript

---

**Status:** Ready for Implementation
**Created:** 2025-10-31
**Estimated Completion:** 3-4 hours of focused development


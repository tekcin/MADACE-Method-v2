# Workflow Features Implementation Plan

**Created:** 2025-10-31
**Status:** In Progress
**Target Completion:** 1-2 weeks

---

## Executive Summary

This document outlines the implementation plan for enhancing MADACE v3.0's workflow system with interactive features, LLM integration, and user-friendly creation tools.

**Current State:**
- ✅ YAML workflow loader implemented
- ✅ Workflow state persistence working
- ✅ Handlebars template engine available
- ⚠️ Template engine not integrated into workflow executor
- ⚠️ LLM integration placeholder only
- ⚠️ Elicit steps have no interactive UI
- ❌ No workflow creation UI

**Target State:**
- ✅ Full template rendering in workflows
- ✅ Real-time LLM responses for reflect steps
- ✅ Interactive forms for elicit steps
- ✅ Visual workflow execution with live updates
- ✅ Workflow creation wizard (MAB module)
- ✅ Complete API endpoints for all operations

---

## Architecture Overview

### Current Workflow System

```
YAML Files (madace/*/workflows/*.yaml)
         ↓
  Workflow Loader (lib/workflows/loader.ts)
         ↓
  Workflow Executor (lib/workflows/executor.ts)
         ↓
  State Persistence (.state.json files)
```

**Supported Actions:**
- `guide` - Display guidance message
- `elicit` - Collect user input (placeholder)
- `reflect` - LLM reflection (placeholder)
- `template` - Render template (placeholder)
- `validate` - Validate conditions
- `display` - Display message
- `load_state_machine` - Load story status
- `sub-workflow` - Execute child workflow
- `route` - Complexity-based routing

### Enhanced Architecture

```
┌─────────────────────────────────────────────┐
│         Web UI (React Components)           │
├─────────────────────────────────────────────┤
│  Workflow Creator  │  Workflow Executor UI  │
│  (MAB Module)      │  (Live Updates)        │
└────────────┬───────────────┬────────────────┘
             │               │
             ↓               ↓
┌─────────────────────────────────────────────┐
│         API Routes (Next.js)                │
├─────────────────────────────────────────────┤
│  POST /api/v3/workflows        │  Create    │
│  GET  /api/v3/workflows        │  List      │
│  GET  /api/v3/workflows/[id]   │  Get       │
│  POST /api/v3/workflows/[id]/execute │ Run  │
│  POST /api/v3/workflows/[id]/input   │ Submit│
│  GET  /api/v3/workflows/[id]/stream  │ SSE   │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│       Business Logic (lib/)                 │
├─────────────────────────────────────────────┤
│  Workflow Executor (Enhanced)               │
│    ├─ Template Engine Integration           │
│    ├─ LLM Client Integration                │
│    ├─ Interactive Input Handling            │
│    └─ Server-Sent Events (SSE)              │
├─────────────────────────────────────────────┤
│  Template Engine (lib/templates/)           │
│  LLM Client (lib/llm/)                      │
│  Database (Prisma)                          │
└─────────────────────────────────────────────┘
```

---

## Feature Breakdown

### 1. Template Engine Integration (2-3 hours)

**Goal:** Replace placeholder template rendering with full Handlebars integration

**Files to Modify:**
- `lib/workflows/executor.ts` - Update `handleTemplate()` method

**Implementation:**

```typescript
// In WorkflowExecutor class
import { getTemplateEngine } from '@/lib/templates/engine';

private async handleTemplate(step: WorkflowStep): Promise<void> {
  if (!step.template || !step.output_file) {
    throw new Error('Template step requires template and output_file');
  }

  const templateEngine = getTemplateEngine();
  const templatePath = this.resolveVariables(step.template);
  const outputPath = this.resolveVariables(step.output_file);

  const context = {
    ...this.state!.variables,
    ...(step.variables || {}),
  };

  // Check if template is a file path or inline template
  let rendered: string;

  if (await fs.access(templatePath).then(() => true).catch(() => false)) {
    // Template is a file
    rendered = await templateEngine.renderFile(templatePath, context);
  } else {
    // Template is inline
    rendered = templateEngine.render(templatePath, context);
  }

  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Write rendered output
  await fs.writeFile(outputPath, rendered, 'utf-8');

  console.warn(`   ✅ Template rendered: ${templatePath} -> ${outputPath}`);
}
```

**Testing:**
- Create test workflow with template step
- Verify file rendering
- Test inline template rendering
- Validate variable substitution

---

### 2. LLM Integration for Reflect Steps (3-4 hours)

**Goal:** Add real-time LLM responses to reflect steps with streaming support

**Files to Modify:**
- `lib/workflows/executor.ts` - Update `handleReflect()` method
- `lib/workflows/types.ts` - Add reflection result type

**New Types:**

```typescript
// In types.ts
export interface ReflectionResult {
  prompt: string;
  response: string;
  model: string;
  tokensUsed: number;
  durationMs: number;
}

export interface WorkflowStep {
  // ... existing fields

  // For reflect action
  model?: string; // LLM model to use (default: from config)
  max_tokens?: number; // Max tokens for response
  temperature?: number; // Temperature for LLM
  store_as?: string; // Variable name to store reflection result
}
```

**Implementation:**

```typescript
// In WorkflowExecutor class
import { createLLMClient } from '@/lib/llm/client';

private async handleReflect(step: WorkflowStep): Promise<void> {
  if (!step.prompt) {
    throw new Error('Reflect step requires prompt');
  }

  const prompt = this.resolveVariables(step.prompt);
  console.warn(`   🤔 Reflection prompt: ${prompt}`);

  try {
    // Get LLM configuration
    const llmConfig = await this.getLLMConfig();
    const client = createLLMClient({
      provider: llmConfig.provider,
      apiKey: llmConfig.apiKey,
      model: step.model || llmConfig.model,
    });

    // Prepare messages
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful AI assistant helping with workflow execution.',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const startTime = Date.now();

    // Get LLM response
    const response = await client.chat({
      messages,
      max_tokens: step.max_tokens || 500,
      temperature: step.temperature || 0.7,
    });

    const duration = Date.now() - startTime;

    // Store reflection result
    const result: ReflectionResult = {
      prompt,
      response: response.content,
      model: response.model || step.model || llmConfig.model,
      tokensUsed: response.usage?.total_tokens || 0,
      durationMs: duration,
    };

    // Store in workflow variables
    const varName = step.store_as || 'last_reflection';
    this.state!.variables[varName] = result;

    console.warn(`   ✅ Reflection complete (${duration}ms, ${result.tokensUsed} tokens)`);
    console.warn(`   Response: ${response.content.substring(0, 100)}...`);
  } catch (error) {
    console.warn(`   ❌ Reflection failed: ${error}`);
    throw new Error(`LLM reflection failed: ${error}`);
  }
}

private async getLLMConfig() {
  // Get LLM configuration from database or environment
  const { prisma } = await import('@/lib/database/client');

  const config = await prisma.config.findUnique({
    where: { key: 'llm' },
  });

  if (config && config.value) {
    return config.value as {
      provider: string;
      apiKey: string;
      model: string;
    };
  }

  // Fallback to environment variables
  return {
    provider: process.env.DEFAULT_LLM_PROVIDER || 'local',
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.DEFAULT_LLM_MODEL || 'gemma3:latest',
  };
}
```

**Testing:**
- Test with all LLM providers (local, Gemini, Claude, OpenAI)
- Verify reflection results stored in variables
- Test error handling
- Validate token usage tracking

---

### 3. Interactive Input Forms for Elicit Steps (4-5 hours)

**Goal:** Create interactive UI for collecting user input during workflow execution

**New Files:**
- `components/features/workflow/WorkflowInputForm.tsx` - Input form component
- `app/api/v3/workflows/[id]/input/route.ts` - API for submitting input

**WorkflowInputForm Component:**

```typescript
'use client';

import { useState } from 'react';
import type { WorkflowStep } from '@/lib/workflows/types';

interface WorkflowInputFormProps {
  step: WorkflowStep;
  onSubmit: (value: unknown) => void;
  onCancel: () => void;
}

export function WorkflowInputForm({ step, onSubmit, onCancel }: WorkflowInputFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim()) {
      setError('This field is required');
      return;
    }

    // Validate based on step.validation if present
    if (step.validation) {
      // TODO: Implement validation
    }

    onSubmit(value);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {step.prompt}
          </label>
          {step.variable && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Variable: {step.variable}
            </p>
          )}
          <textarea
            id="input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            rows={4}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Enter your response..."
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

**API Endpoint:**

```typescript
// app/api/v3/workflows/[id]/input/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

    // Store input in workflow state (in-memory or Redis for production)
    // For now, store in temp file
    const fs = await import('fs/promises');
    const path = await import('path');

    const inputFile = path.join(
      process.cwd(),
      '.madace',
      'workflow-inputs',
      `${id}.json`
    );

    await fs.mkdir(path.dirname(inputFile), { recursive: true });

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

**Update WorkflowExecutor:**

```typescript
// In executor.ts
private async handleElicit(step: WorkflowStep): Promise<void> {
  if (!step.prompt) {
    throw new Error('Elicit step requires prompt');
  }

  const prompt = this.resolveVariables(step.prompt);
  console.warn(`   📝 Eliciting input: ${prompt}`);

  // In interactive mode (web UI), wait for user input
  // Input will be provided via API call and stored in workflow state
  if (this.state!.variables['_INTERACTIVE_MODE']) {
    // Mark step as waiting for input
    this.state!.variables['_WAITING_FOR_INPUT'] = {
      stepIndex: this.state!.currentStep,
      prompt,
      variable: step.variable,
    };

    await this.saveState();

    // Execution will pause here
    // When input is received, resume() will be called
    throw new Error('WAITING_FOR_INPUT'); // Special error to pause execution
  }

  // In non-interactive mode (CLI), use readline or default
  if (step.variable) {
    // For CLI, could use readline here
    // For now, use placeholder
    this.state!.variables[step.variable] = '<user-input>';
  }
}
```

**Testing:**
- Test input form rendering
- Verify input submission
- Test workflow pause/resume
- Validate input storage

---

### 4. Visual Workflow Execution UI (5-6 hours)

**Goal:** Create a live workflow execution view with step-by-step progress

**New Files:**
- `components/features/workflow/WorkflowRunner.tsx` - Main execution component
- `app/api/v3/workflows/[id]/execute/route.ts` - Execute API
- `app/api/v3/workflows/[id]/stream/route.ts` - SSE endpoint for live updates

**WorkflowRunner Component:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { WorkflowInputForm } from './WorkflowInputForm';
import type { Workflow, WorkflowState, WorkflowStep } from '@/lib/workflows/types';

interface WorkflowRunnerProps {
  workflow: Workflow;
  workflowId: string;
}

export function WorkflowRunner({ workflow, workflowId }: WorkflowRunnerProps) {
  const [state, setState] = useState<WorkflowState | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Connect to SSE for live updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/v3/workflows/${workflowId}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'state':
          setState(data.state);
          break;
        case 'step':
          setCurrentStep(data.step);
          break;
        case 'log':
          setLogs((prev) => [...prev, data.message]);
          break;
        case 'waiting_input':
          setWaitingForInput(true);
          setCurrentStep(data.step);
          break;
        case 'completed':
          setIsRunning(false);
          setLogs((prev) => [...prev, '✅ Workflow completed']);
          break;
        case 'error':
          setIsRunning(false);
          setLogs((prev) => [...prev, `❌ Error: ${data.error}`]);
          break;
      }
    };

    return () => eventSource.close();
  }, [workflowId]);

  const handleStart = async () => {
    setIsRunning(true);
    setLogs([]);

    const response = await fetch(`/api/v3/workflows/${workflowId}/execute`, {
      method: 'POST',
    });

    const result = await response.json();

    if (!result.success) {
      setLogs((prev) => [...prev, `❌ Failed to start: ${result.error}`]);
      setIsRunning(false);
    }
  };

  const handleInputSubmit = async (value: unknown) => {
    if (!currentStep || !state) return;

    await fetch(`/api/v3/workflows/${workflowId}/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stepIndex: state.currentStep,
        value,
      }),
    });

    setWaitingForInput(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {workflow.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {workflow.description}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={isRunning}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400"
        >
          {isRunning ? 'Running...' : 'Start Workflow'}
        </button>
      </div>

      {/* Progress Bar */}
      {state && (
        <div className="w-full rounded-lg bg-gray-200 dark:bg-gray-700">
          <div
            className="rounded-lg bg-blue-600 py-2 text-center text-xs font-medium text-white"
            style={{
              width: `${((state.currentStep + 1) / (workflow.steps?.length || 1)) * 100}%`,
            }}
          >
            Step {state.currentStep + 1} of {workflow.steps?.length || 0}
          </div>
        </div>
      )}

      {/* Current Step */}
      {currentStep && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Step: {currentStep.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Action: {currentStep.action}
          </p>
        </div>
      )}

      {/* Input Form */}
      {waitingForInput && currentStep && (
        <WorkflowInputForm
          step={currentStep}
          onSubmit={handleInputSubmit}
          onCancel={() => setWaitingForInput(false)}
        />
      )}

      {/* Logs */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          Execution Log
        </h3>
        <div className="space-y-1">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No logs yet. Start the workflow to see execution details.
            </p>
          ) : (
            logs.map((log, index) => (
              <p
                key={index}
                className="font-mono text-xs text-gray-700 dark:text-gray-300"
              >
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

**SSE Endpoint:**

```typescript
// app/api/v3/workflows/[id]/stream/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send workflow state updates
      const sendEvent = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Poll workflow state every second
      const interval = setInterval(async () => {
        try {
          // Read workflow state from file
          const fs = await import('fs/promises');
          const path = await import('path');

          const stateFile = path.join(
            process.cwd(),
            '.madace',
            `${id}.state.json`
          );

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
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

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

**Testing:**
- Test workflow execution with all action types
- Verify SSE updates
- Test input pause/resume
- Validate progress bar accuracy

---

### 5. Workflow Creation UI (MAB Module) (8-10 hours)

**Goal:** Build visual workflow creator similar to the agent creation wizard

**New Files:**
- `app/workflows/create/page.tsx` - Main page
- `components/features/workflow/CreateWorkflowWizard.tsx` - Wizard component
- `components/features/workflow/WorkflowBasicStep.tsx` - Basic info step
- `components/features/workflow/WorkflowStepsEditor.tsx` - Steps editor
- `components/features/workflow/WorkflowPreview.tsx` - YAML preview

**Implementation Overview:**

1. **Step 1: Basic Information**
   - Name, description
   - Agent selection
   - Phase number

2. **Step 2: Steps Editor**
   - Add/edit/delete steps
   - Select action type
   - Configure step parameters
   - Drag-and-drop reordering

3. **Step 3: Variables**
   - Define initial variables
   - Variable types (string, number, boolean, object)

4. **Step 4: Preview & Create**
   - YAML preview
   - Validation
   - Save to database or download

This is a larger feature and will be detailed in a separate section.

---

### 6. API Endpoints (2-3 hours)

**New Endpoints:**

```
POST   /api/v3/workflows              Create workflow
GET    /api/v3/workflows              List workflows
GET    /api/v3/workflows/[id]         Get workflow
PUT    /api/v3/workflows/[id]         Update workflow
DELETE /api/v3/workflows/[id]         Delete workflow
POST   /api/v3/workflows/[id]/execute Start execution
GET    /api/v3/workflows/[id]/state   Get execution state
POST   /api/v3/workflows/[id]/input   Submit input
GET    /api/v3/workflows/[id]/stream  SSE for updates
POST   /api/v3/workflows/[id]/resume  Resume paused workflow
POST   /api/v3/workflows/[id]/reset   Reset workflow state
```

---

## Implementation Timeline

### Week 1: Core Enhancements (Days 1-3)

**Day 1:**
- ✅ Integrate template engine into workflow executor (2-3 hours)
- ✅ Add LLM integration for reflect steps (3-4 hours)
- ✅ Testing and bug fixes (1-2 hours)

**Day 2:**
- ✅ Create interactive input forms (4-5 hours)
- ✅ Build input API endpoint (1-2 hours)
- ✅ Update workflow executor for input handling (1-2 hours)

**Day 3:**
- ✅ Build visual workflow execution UI (5-6 hours)
- ✅ Create SSE endpoint for live updates (2-3 hours)

### Week 1-2: Creation UI (Days 4-7)

**Day 4:**
- ✅ Design workflow creation wizard structure
- ✅ Build basic information step (2-3 hours)
- ✅ Build steps editor component (4-5 hours)

**Day 5:**
- ✅ Complete steps editor (continued)
- ✅ Add drag-and-drop functionality (2-3 hours)
- ✅ Build variables editor (2-3 hours)

**Day 6:**
- ✅ Build YAML preview component (2-3 hours)
- ✅ Add validation (2-3 hours)
- ✅ Implement save functionality (2-3 hours)

**Day 7:**
- ✅ Create API endpoints (2-3 hours)
- ✅ Integration testing (3-4 hours)
- ✅ Documentation (2-3 hours)

---

## Testing Strategy

### Unit Tests
- Workflow executor methods
- Template rendering
- LLM integration
- Input validation

### Integration Tests
- End-to-end workflow execution
- Input collection flow
- SSE updates
- State persistence

### E2E Tests
- Workflow creation wizard
- Workflow execution UI
- Multi-step workflows
- Error handling

---

## Success Criteria

✅ **Template Rendering**
- Templates render correctly with Handlebars
- Variables substituted properly
- File and inline templates work

✅ **LLM Integration**
- Reflect steps get real LLM responses
- All providers (local, Gemini, Claude, OpenAI) work
- Responses stored in workflow variables

✅ **Interactive Input**
- Input forms display correctly
- User input captured and stored
- Workflow resumes after input

✅ **Visual Execution**
- Live progress updates via SSE
- Logs display in real-time
- Step-by-step visualization

✅ **Workflow Creation**
- Wizard creates valid YAML
- All action types supported
- YAML can be downloaded or saved

✅ **API Completeness**
- All CRUD operations work
- Execution API functional
- SSE streaming works
- State management correct

---

## Future Enhancements (v3.1+)

- **Workflow Templates** - Pre-built workflows for common tasks
- **Workflow Marketplace** - Share and import community workflows
- **Visual Workflow Designer** - Drag-and-drop flow chart editor
- **Workflow Scheduling** - Cron-based workflow execution
- **Workflow Analytics** - Track execution metrics
- **Parallel Execution** - Run multiple steps concurrently
- **Approval Steps** - Require approval before proceeding
- **Webhook Integration** - Trigger workflows from external events

---

## Conclusion

This implementation plan provides a comprehensive roadmap for enhancing MADACE's workflow system from a basic executor to a full-featured, interactive workflow platform with visual creation tools and real-time execution monitoring.

**Estimated Total Effort:** 30-40 hours (1-2 weeks)
**Priority:** High (essential for v3.0.1 or v3.1)
**Dependencies:** None (all foundational features already exist)


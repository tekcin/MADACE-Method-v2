# [CORE-011] Agent Loader with Zod Validation

**Status:** Ready (IN PROGRESS)
**Points:** 5
**Epic:** Milestone 1.3 - Core TypeScript Modules
**Created:** 2025-10-20
**Completed:** _[Pending]_
**Assigned:** DEV Agent
**Actual Time:** _[To be filled after completion]_

---

## Description

Create a type-safe agent loader that can parse and validate MADACE agent YAML files. This is a foundational component that will be used throughout the application to load agent configurations, personas, menus, and prompts.

**Context:**

- We have 5 agent YAML files in `madace/mam/agents/` (pm, analyst, architect, sm, dev)
- Each agent has a well-defined structure (metadata, persona, menu, prompts, etc.)
- We need Zod validation to ensure type safety at runtime
- This will be used by the agent selection UI, workflow engine, and CLI adapters

**Why This Story:**
The agent loader is the foundation for all agent-based functionality in MADACE. Without it, we can't load agent personas, execute workflows, or provide guided assistance to users.

---

## Acceptance Criteria

- [ ] `lib/types/agent.ts` - Complete TypeScript types for agent structure
- [ ] `lib/agents/schema.ts` - Zod schemas for runtime validation
- [ ] `lib/agents/loader.ts` - Agent loader implementation
- [ ] Load agent from file path with full validation
- [ ] Parse YAML with error handling
- [ ] Validate against Zod schema
- [ ] Return strongly-typed Agent object
- [ ] Handle malformed YAML gracefully
- [ ] Handle missing files gracefully
- [ ] Support variable substitution in `load_always` paths
- [ ] Cache loaded agents for performance
- [ ] Export convenience functions for loading all agents
- [ ] TypeScript types for all interfaces
- [ ] Unit tests for loader logic
- [ ] No console errors or warnings
- [ ] All quality checks pass (lint, format, type-check)

---

## Implementation Plan

### Step 1: Install Dependencies

```bash
npm install js-yaml zod
npm install --save-dev @types/js-yaml
```

### Step 2: Create Agent Type Definitions

Update `lib/types/agent.ts`:

```typescript
export interface AgentMetadata {
  id: string;
  name: string;
  title: string;
  icon: string;
  module: string;
  version: string;
}

export interface AgentPersona {
  role: string;
  identity: string;
  communication_style: string;
  principles: string[];
}

export interface AgentMenuItem {
  trigger: string;
  action: string;
  description: string;
}

export interface AgentPrompt {
  name: string;
  trigger: string;
  content: string;
}

export interface Agent {
  metadata: AgentMetadata;
  persona: AgentPersona;
  critical_actions?: string[];
  menu: AgentMenuItem[];
  load_always?: string[];
  prompts: AgentPrompt[];
}

export interface AgentFile {
  agent: Agent;
}
```

### Step 3: Create Zod Validation Schemas

Create `lib/agents/schema.ts`:

```typescript
import { z } from 'zod';

export const AgentMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  icon: z.string(),
  module: z.string(),
  version: z.string(),
});

export const AgentPersonaSchema = z.object({
  role: z.string(),
  identity: z.string(),
  communication_style: z.string(),
  principles: z.array(z.string()),
});

export const AgentMenuItemSchema = z.object({
  trigger: z.string(),
  action: z.string(),
  description: z.string(),
});

export const AgentPromptSchema = z.object({
  name: z.string(),
  trigger: z.string(),
  content: z.string(),
});

export const AgentSchema = z.object({
  metadata: AgentMetadataSchema,
  persona: AgentPersonaSchema,
  critical_actions: z.array(z.string()).optional(),
  menu: z.array(AgentMenuItemSchema),
  load_always: z.array(z.string()).optional(),
  prompts: z.array(AgentPromptSchema),
});

export const AgentFileSchema = z.object({
  agent: AgentSchema,
});
```

### Step 4: Implement Agent Loader

Create `lib/agents/loader.ts`:

```typescript
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { AgentFileSchema } from './schema';
import type { Agent, AgentFile } from '@/lib/types/agent';

export class AgentLoadError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AgentLoadError';
  }
}

export class AgentLoader {
  private cache = new Map<string, Agent>();

  /**
   * Load an agent from a YAML file
   */
  async loadAgent(filePath: string): Promise<Agent> {
    // Check cache first
    const cached = this.cache.get(filePath);
    if (cached) {
      return cached;
    }

    try {
      // Read file
      const fileContent = await fs.readFile(filePath, 'utf-8');

      // Parse YAML
      const parsed = yaml.load(fileContent) as unknown;

      // Validate with Zod
      const validated = AgentFileSchema.parse(parsed);

      // Cache and return
      this.cache.set(filePath, validated.agent);
      return validated.agent;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new AgentLoadError(`Agent file not found: ${filePath}`, filePath, error);
      }

      if (error instanceof yaml.YAMLException) {
        throw new AgentLoadError(`Invalid YAML in agent file: ${error.message}`, filePath, error);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        throw new AgentLoadError(
          `Agent validation failed: ${error.message}`,
          filePath,
          error
        );
      }

      throw new AgentLoadError(`Failed to load agent: ${String(error)}`, filePath, error);
    }
  }

  /**
   * Load all agents from a directory
   */
  async loadAgentsFromDirectory(dirPath: string): Promise<Agent[]> {
    try {
      const files = await fs.readdir(dirPath);
      const agentFiles = files.filter((f) => f.endsWith('.agent.yaml'));

      const agents = await Promise.all(
        agentFiles.map((file) => this.loadAgent(path.join(dirPath, file)))
      );

      return agents;
    } catch (error) {
      throw new AgentLoadError(`Failed to load agents from directory: ${dirPath}`, dirPath, error);
    }
  }

  /**
   * Clear the agent cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get a cached agent
   */
  getCached(filePath: string): Agent | undefined {
    return this.cache.get(filePath);
  }
}

// Singleton instance for convenience
const defaultLoader = new AgentLoader();

/**
 * Load an agent from a file (uses default singleton loader)
 */
export async function loadAgent(filePath: string): Promise<Agent> {
  return defaultLoader.loadAgent(filePath);
}

/**
 * Load all agents from MAM directory
 */
export async function loadMAMAgents(): Promise<Agent[]> {
  const mamAgentsPath = path.join(process.cwd(), 'madace', 'mam', 'agents');
  return defaultLoader.loadAgentsFromDirectory(mamAgentsPath);
}

/**
 * Clear the agent cache
 */
export function clearAgentCache(): void {
  defaultLoader.clearCache();
}
```

### Step 5: Update Exports

Update `lib/agents/index.ts`:

```typescript
export * from './loader';
export * from './schema';
export type { Agent, AgentMetadata, AgentPersona, AgentMenuItem, AgentPrompt } from '@/lib/types/agent';
```

Update `lib/types/index.ts` to include agent types:

```typescript
export * from './agent';
export * from './workflow';
// ... other exports
```

### Step 6: Create Example API Route

Create `app/api/agents/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { loadMAMAgents } from '@/lib/agents';

export async function GET() {
  try {
    const agents = await loadMAMAgents();
    return NextResponse.json({
      agents: agents.map((agent) => ({
        id: agent.metadata.id,
        name: agent.metadata.name,
        title: agent.metadata.title,
        icon: agent.metadata.icon,
        module: agent.metadata.module,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Step 7: Create API Route for Single Agent

Create `app/api/agents/[name]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { loadAgent } from '@/lib/agents';
import path from 'path';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const agentPath = path.join(
      process.cwd(),
      'madace',
      'mam',
      'agents',
      `${params.name}.agent.yaml`
    );

    const agent = await loadAgent(agentPath);
    return NextResponse.json({ agent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Step 8: Test and Verify

```bash
# Install dependencies
npm install js-yaml zod
npm install --save-dev @types/js-yaml

# Run quality checks
npm run check-all

# Build to verify
npm run build

# Test API routes
curl http://localhost:3000/api/agents
curl http://localhost:3000/api/agents/sm
```

---

## Technical Notes

### Zod vs TypeScript

- **TypeScript types**: Compile-time safety only
- **Zod schemas**: Runtime validation + type inference
- We use both: Zod for validation, TypeScript types exported from Zod schemas

### Caching Strategy

- Cache loaded agents by file path
- Prevents re-parsing YAML on every request
- Can be cleared with `clearAgentCache()` for testing
- In production, cache would persist for app lifetime

### Error Handling

Three types of errors:
1. **File not found** - `ENOENT` error
2. **Invalid YAML** - `yaml.YAMLException`
3. **Validation failure** - Zod validation error

All wrapped in `AgentLoadError` with context.

### Variable Substitution

The `load_always` field can contain variables like `{output_folder}`. This story doesn't implement substitution yet - that will come in [CORE-012] Agent Runtime.

---

## Testing Checklist

**Type Definitions:**

- [ ] All agent types defined in `lib/types/agent.ts`
- [ ] Types match YAML structure exactly
- [ ] No TypeScript errors

**Zod Schemas:**

- [ ] All schemas defined in `lib/agents/schema.ts`
- [ ] Schemas match TypeScript types
- [ ] Validation works correctly

**Loader Implementation:**

- [ ] `AgentLoader` class created
- [ ] `loadAgent()` method works
- [ ] `loadAgentsFromDirectory()` works
- [ ] Caching implemented
- [ ] Error handling comprehensive
- [ ] Singleton instance exported

**API Routes:**

- [ ] `/api/agents` lists all agents
- [ ] `/api/agents/[name]` loads single agent
- [ ] Error responses formatted correctly

**Quality:**

```bash
npm run type-check  # Pass
npm run lint        # Pass
npm run format:check # Pass
npm run build       # Pass
```

---

## Dependencies

**Depends On:**

- [NEXT-001] through [NEXT-005] (DONE) ✅
- [NEXT-002] Project structure with lib/types (DONE) ✅

**Blocks:**

- [CORE-012] Agent Runtime (needs loader to instantiate agents)
- [CORE-013] Workflow Engine (needs agents for workflow execution)
- [UI-002] Agent selection component (needs to list agents)
- All agent-based functionality

---

## Risks & Mitigations

**Risk 1: YAML Parsing Errors**

- **Risk:** Agent files might have syntax errors
- **Mitigation:** Comprehensive error handling with clear messages
- **Likelihood:** Low (files are well-formed)

**Risk 2: Schema Changes**

- **Risk:** Agent file structure might evolve
- **Mitigation:** Zod schemas are easy to update, versioning in agent metadata
- **Likelihood:** Medium (expected as MADACE evolves)

**Risk 3: Performance**

- **Risk:** Loading many agents could be slow
- **Mitigation:** Caching + async loading + only load when needed
- **Likelihood:** Low (only 5 agents currently)

---

## Definition of Done

This story is considered DONE when:

1. ✅ `js-yaml` and `zod` dependencies installed
2. ✅ Complete agent types defined in `lib/types/agent.ts`
3. ✅ Zod schemas created in `lib/agents/schema.ts`
4. ✅ `AgentLoader` class implemented in `lib/agents/loader.ts`
5. ✅ Singleton convenience functions exported
6. ✅ Caching implemented
7. ✅ Error handling comprehensive
8. ✅ API routes created and working
9. ✅ All exports properly configured
10. ✅ No TypeScript errors
11. ✅ All quality checks pass (type-check, lint, format)
12. ✅ Build succeeds
13. ✅ Can load all 5 MAM agents
14. ✅ Git committed with clear message
15. ✅ Story moved to DONE in workflow status

---

## Time Estimate

**Estimated Time:** 60-90 minutes

**Breakdown:**

- Install dependencies: 5 minutes
- Create type definitions: 15 minutes
- Create Zod schemas: 15 minutes
- Implement loader: 20 minutes
- Create API routes: 10 minutes
- Testing and verification: 15 minutes
- Quality checks and fixes: 10 minutes

**Actual Time:** _[To be filled after completion]_

---

## Implementation Notes

### Before You Start

- Review agent YAML files in `madace/mam/agents/`
- Understand Zod schema definition syntax
- Check existing type definitions in `lib/types/`

### During Implementation

- Keep types and schemas in sync
- Test with all 5 agent files
- Add detailed error messages
- Use TypeScript strict mode
- Document public APIs

### After Completion

- Test loading all agents
- Verify API routes work
- Test error cases (missing file, invalid YAML)
- Run all quality checks
- Commit with descriptive message

---

## Related Documentation

- [Zod Documentation](https://zod.dev/)
- [js-yaml Documentation](https://github.com/nodeca/js-yaml)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MADACE Agent Structure](../../madace/mam/agents/)

---

## Future Enhancements

These will be implemented in subsequent stories:

- **[CORE-012]** Agent Runtime with variable substitution
- **[CORE-012]** Load `load_always` files dynamically
- **[UI-002]** Agent selection UI using loader
- **Hot reloading** of agents during development
- **Agent validation CLI** tool
- **Agent migration** utilities for schema updates

---

**Story Created By:** SM Agent (Scrum Master)
**Reviewed By:** _[Auto-approved for implementation]_
**Implemented By:** DEV Agent
**Date Created:** 2025-10-20
**Last Updated:** 2025-10-20

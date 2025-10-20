# [NEXT-002] Configure Project Structure

**Status:** DONE ✅
**Points:** 3
**Epic:** Milestone 1.1 - Next.js Project Foundation
**Created:** 2025-10-20
**Completed:** 2025-10-20
**Assigned:** DEV Agent
**Actual Time:** 45 minutes

---

## Description

Organize the Next.js project with a proper directory structure following best practices. Create the standard directories for libraries, components, types, and utilities that will house the MADACE business logic.

**Context:**

- [NEXT-001] completed - Next.js 14 is initialized and running
- We need a clean, scalable structure for the MADACE implementation
- Following Next.js 14 App Router conventions with TypeScript

**Why This Story:**
This story establishes the organizational foundation that all future code will follow. A well-organized structure makes development faster and more maintainable.

---

## Acceptance Criteria

- [ ] `lib/` directory created for business logic
- [ ] `lib/agents/` created for agent loader and runtime
- [ ] `lib/workflows/` created for workflow engine
- [ ] `lib/state/` created for state machine
- [ ] `lib/templates/` created for template engine
- [ ] `lib/config/` created for configuration management
- [ ] `lib/llm/` created for LLM client abstraction
- [ ] `lib/cli/` created for CLI integration (Claude, Gemini)
- [ ] `lib/types/` created for TypeScript type definitions
- [ ] `lib/utils/` created for utility functions
- [ ] `components/` directory created for React components
- [ ] `components/ui/` created for base UI components
- [ ] `components/features/` created for feature-specific components
- [ ] Each directory has a README.md explaining its purpose
- [ ] Project structure documented in ARCHITECTURE.md
- [ ] No TypeScript errors after structure changes

---

## Implementation Plan

### Step 1: Create Core Library Directories

```bash
mkdir -p lib/agents
mkdir -p lib/workflows
mkdir -p lib/state
mkdir -p lib/templates
mkdir -p lib/config
mkdir -p lib/llm
mkdir -p lib/cli
mkdir -p lib/types
mkdir -p lib/utils
```

### Step 2: Create Component Directories

```bash
mkdir -p components/ui
mkdir -p components/features
```

### Step 3: Create Index Files and Documentation

For each `lib/` subdirectory, create:

- `index.ts` - Barrel export file
- `README.md` - Directory purpose and usage

### Step 4: Create Type Definitions Starter

Create `lib/types/index.ts` with common types:

```typescript
// Core MADACE types
export type AgentMetadata = {
  id: string;
  name: string;
  title: string;
  icon: string;
  module: string;
  version: string;
};

export type WorkflowStep = {
  name: string;
  action: 'elicit' | 'reflect' | 'guide' | 'template' | 'validate' | 'sub-workflow';
  prompt?: string;
  template?: string;
  output?: string;
};

export type StoryStatus = 'backlog' | 'todo' | 'in-progress' | 'done';

// Re-export for convenience
export * from './agent';
export * from './workflow';
export * from './state';
export * from './config';
```

### Step 5: Create Utility Functions Starter

Create `lib/utils/index.ts`:

```typescript
/**
 * Utility functions for MADACE
 */

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0] || '';
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Create a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
```

### Step 6: Update ARCHITECTURE.md

Add project structure section documenting the new directories.

### Step 7: Verify Structure

```bash
# List the structure
tree lib/ components/ -L 2

# Verify TypeScript compilation
npx tsc --noEmit
```

---

## Technical Notes

### Proposed Directory Structure

```
MADACE-Method v2.0/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── setup/                   # Setup wizard (future)
│   ├── settings/                # Settings page (future)
│   ├── agents/                  # Agent UI (future)
│   └── api/                     # API routes (future)
│       ├── agents/
│       ├── workflows/
│       ├── state/
│       └── config/
├── lib/                          # Business logic (NEW)
│   ├── agents/                  # Agent system
│   │   ├── loader.ts           # Load agent YAML files
│   │   ├── runtime.ts          # Execute agents
│   │   └── index.ts            # Exports
│   ├── workflows/               # Workflow engine
│   │   ├── engine.ts           # Execute workflows
│   │   ├── parser.ts           # Parse YAML workflows
│   │   └── index.ts            # Exports
│   ├── state/                   # State machine
│   │   ├── machine.ts          # Story lifecycle
│   │   ├── parser.ts           # Parse status markdown
│   │   └── index.ts            # Exports
│   ├── templates/               # Template engine
│   │   ├── engine.ts           # Handlebars rendering
│   │   └── index.ts            # Exports
│   ├── config/                  # Configuration
│   │   ├── manager.ts          # Load/validate config
│   │   ├── schema.ts           # Zod schemas
│   │   └── index.ts            # Exports
│   ├── llm/                     # LLM client
│   │   ├── client.ts           # Multi-provider client
│   │   ├── providers/          # Provider implementations
│   │   │   ├── gemini.ts
│   │   │   ├── claude.ts
│   │   │   ├── openai.ts
│   │   │   └── ollama.ts
│   │   └── index.ts            # Exports
│   ├── cli/                     # CLI integration
│   │   ├── claude.ts           # Claude CLI adapter
│   │   ├── gemini.ts           # Gemini CLI adapter
│   │   └── index.ts            # Exports
│   ├── types/                   # TypeScript types
│   │   ├── agent.ts            # Agent types
│   │   ├── workflow.ts         # Workflow types
│   │   ├── state.ts            # State types
│   │   ├── config.ts           # Config types
│   │   └── index.ts            # Exports
│   └── utils/                   # Utilities
│       ├── date.ts             # Date helpers
│       ├── string.ts           # String helpers
│       ├── fs.ts               # File system helpers
│       └── index.ts            # Exports
├── components/                   # React components (NEW)
│   ├── ui/                      # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── index.ts
│   └── features/                # Feature components
│       ├── agent-card/
│       ├── workflow-progress/
│       ├── state-board/
│       └── index.ts
├── public/                       # Static assets
├── docs/                         # Documentation
├── madace/                       # MADACE YAML files
└── madace-data/                  # Runtime data
```

### Design Principles

1. **Separation of Concerns:**
   - `lib/` = Pure TypeScript business logic (no React)
   - `components/` = React UI components
   - `app/` = Next.js pages and API routes

2. **Barrel Exports:**
   - Each directory has `index.ts` that re-exports
   - Cleaner imports: `import { loadAgent } from '@/lib/agents'`

3. **Type Safety:**
   - All types in `lib/types/`
   - Strict TypeScript mode enabled
   - Zod for runtime validation

4. **Scalability:**
   - Clear boundaries between modules
   - Easy to add new features
   - Testable structure

---

## Testing Checklist

**Directory Creation:**

- [ ] All `lib/` subdirectories exist
- [ ] All `components/` subdirectories exist
- [ ] Each directory has `index.ts`
- [ ] Each directory has `README.md`

**TypeScript Compilation:**

- [ ] `npx tsc --noEmit` passes without errors
- [ ] Type definitions in `lib/types/index.ts` are valid
- [ ] Utility functions in `lib/utils/index.ts` compile

**Documentation:**

- [ ] ARCHITECTURE.md updated with structure
- [ ] Each README.md explains directory purpose

**Verification Commands:**

```bash
# Check structure
ls -la lib/*/
ls -la components/*/

# Verify TypeScript
npx tsc --noEmit

# Check for index files
find lib components -name "index.ts"

# Check for README files
find lib components -name "README.md"
```

---

## Dependencies

**Depends On:**

- [NEXT-001] Initialize Next.js 14 project (DONE) ✅

**Blocks:**

- [CORE-011] Agent Loader implementation
- [CORE-012] Agent Runtime implementation
- [CORE-013] Workflow Engine implementation
- [SETUP-002] Setup Wizard UI
- All future implementation stories

---

## Risks & Mitigations

**Risk 1: Directory Structure Changes Later**

- **Risk:** May need to reorganize as project grows
- **Mitigation:** Keep good documentation, use barrel exports for easy refactoring
- **Likelihood:** Low (following Next.js best practices)

**Risk 2: TypeScript Path Aliases**

- **Risk:** Import paths may break
- **Mitigation:** Already configured `@/*` alias in tsconfig.json
- **Likelihood:** Low (configured in NEXT-001)

---

## Definition of Done

This story is considered DONE when:

1. ✅ All directories created with correct structure
2. ✅ All `index.ts` files created
3. ✅ All `README.md` files created and documented
4. ✅ Type definitions starter created in `lib/types/`
5. ✅ Utility functions starter created in `lib/utils/`
6. ✅ TypeScript compilation passes with no errors
7. ✅ ARCHITECTURE.md updated with structure documentation
8. ✅ Git committed with clear message
9. ✅ Story moved to DONE in workflow status
10. ✅ Next story [NEXT-003] moved to TODO

---

## Time Estimate

**Estimated Time:** 45 minutes - 1 hour

**Breakdown:**

- Create directories: 5 minutes
- Create index.ts files: 10 minutes
- Create README.md files: 15 minutes
- Create type definitions: 10 minutes
- Create utility functions: 10 minutes
- Update ARCHITECTURE.md: 10 minutes
- Testing and verification: 10 minutes

**Actual Time:** _[To be filled after completion]_

---

## Implementation Notes

### Before You Start

- Ensure [NEXT-001] is complete and Next.js is running
- Review the proposed directory structure above
- Understand the separation of concerns (lib vs components vs app)

### During Implementation

- Create directories in the order shown
- Don't skip the README files (they're documentation!)
- Keep each index.ts simple (just exports)
- Test TypeScript compilation after each major step

### After Completion

- Review the structure with `tree` command
- Ensure all imports work
- Commit with descriptive message
- Update workflow status

---

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Will be updated with structure
- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure) - Official guidelines
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/modules.html) - Module organization

---

**Story Created By:** SM Agent (Scrum Master)
**Reviewed By:** _[Pending review with *story-ready workflow]_
**Implemented By:** _[DEV Agent will guide implementation]_
**Date Created:** 2025-10-20
**Last Updated:** 2025-10-20

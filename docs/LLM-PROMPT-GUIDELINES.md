# LLM Prompt Guidelines

**Purpose**: Ensure all LLM interactions use the correct technology stack and patterns.

---

## Quick Reference

**Always include this tech stack context in LLM prompts:**

```
TECH STACK CONTEXT:
- Framework: Next.js 15.5.6 (App Router)
- Language: TypeScript 5.9.3 (strict mode)
- Runtime: Node.js 20+
- UI: React 19.2.0 + Tailwind CSS 4.1.15
- Validation: Zod 4.1.12
- YAML: js-yaml 4.1.0
- Templates: Handlebars 4.7.8
- Pattern: Full-stack TypeScript (single runtime, no FFI)
```

---

## Using Tech Stack in Code

### Import the helper functions

```typescript
import {
  getTechStackContext,
  getAgentTechStackContext,
  getSystemPrompt,
} from '@/lib/templates/llm-system-prompt';
```

### Basic LLM Call

```typescript
const systemPrompt = getSystemPrompt({ type: 'base' });

const response = await llmClient.generate({
  system: systemPrompt,
  prompt: 'Your user prompt here',
});
```

### Code Generation

```typescript
const systemPrompt = getSystemPrompt({
  type: 'code',
  additionalContext: 'Generate a validation function for user input',
});

const response = await llmClient.generate({
  system: systemPrompt,
  prompt: 'Create a Zod schema for validating user registration',
});
```

### Agent Interaction

```typescript
const systemPrompt = getSystemPrompt({
  type: 'agent',
  role: 'SM (Scrum Master)',
  additionalContext: 'Current story is about implementing agent loader',
});

const response = await llmClient.generate({
  system: systemPrompt,
  prompt: 'Review the current story for completeness',
});
```

### Workflow Execution

```typescript
const systemPrompt = getSystemPrompt({
  type: 'workflow',
  workflow: 'create-story',
  additionalContext: 'User wants to implement LLM client',
});

const response = await llmClient.generate({
  system: systemPrompt,
  prompt: 'Execute the next step in the workflow',
});
```

---

## Critical Rules for LLM Prompts

### ✅ Always Include

1. **Tech Stack Context** - Use `getTechStackContext()` or `getSystemPrompt()`
2. **TypeScript Version** - Specify 5.7.3 with strict mode
3. **Framework Pattern** - Next.js 15 App Router
4. **Single Runtime** - Node.js only, no multi-language
5. **Validation Strategy** - Zod for runtime validation

### ❌ Never Allow

1. **Python Code** - No Python, only TypeScript
2. **Rust Code** - No Rust, only TypeScript
3. **FFI** - No Foreign Function Interface
4. **Multi-Runtime** - Single runtime (Node.js)
5. **Callbacks** - Use async/await instead
6. **Any Type** - Use proper types or unknown

---

## Example Prompts

### Good Prompt ✅

```typescript
const prompt = `
${getTechStackContext()}

Create a function to load YAML agent files with Zod validation.

Requirements:
- Use TypeScript 5.9.3 with strict mode
- Use js-yaml 4.1.0 for parsing
- Use Zod 4.1.12 for validation
- Return a typed Result<Agent, Error>
- Handle file read errors
- Validate against AgentSchema

File: lib/agents/loader.ts
`;
```

### Bad Prompt ❌

```typescript
// WRONG - No tech stack context
const prompt = `
Create a function to load agent files.
`;

// WRONG - Allows wrong languages
const prompt = `
Create a function to load agent files.
Use Python or Rust for performance.
`;

// WRONG - No version specifics
const prompt = `
Create a Next.js function.
Use Zod for validation.
`;
```

---

## Template for New Features

```typescript
const systemPrompt = `
${getTechStackContext()}

You are implementing a new feature for MADACE-Method v2.0.

CONSTRAINTS:
- Only use TypeScript 5.9.3
- Use Next.js 15.5.6 App Router patterns
- Use React 19.2.0 Server Components where appropriate
- Use Zod 4.1.12 for all validation
- Use Tailwind CSS 4.1.15 for styling
- Follow functional programming patterns
- Use async/await (no callbacks)
- Handle errors with try/catch or Result types
- Add JSDoc comments for public APIs

NEVER:
- Generate Python or Rust code
- Use FFI or multi-language solutions
- Use 'any' type
- Mutate function parameters
`;

const userPrompt = `
Feature: [Your feature description]

Requirements:
- [Requirement 1]
- [Requirement 2]

Expected output:
- [Expected file 1]
- [Expected file 2]
`;
```

---

## Agent-Specific Prompts

### PM Agent

```typescript
const prompt = `
${getAgentSystemPrompt('PM (Product Manager)')}

You are assessing project scale (Level 0-4).

Consider:
- Estimated timeline
- Team size
- Complexity
- Documentation needs
`;
```

### DEV Agent

```typescript
const prompt = `
${getAgentSystemPrompt('DEV (Developer)')}

You are implementing story: ${storyId}

Tech Stack Requirements:
${getTechStackContext()}

Generate implementation following TypeScript best practices.
`;
```

### SM Agent

```typescript
const prompt = `
${getAgentSystemPrompt('SM (Scrum Master)')}

You are managing story lifecycle.

State Machine Rules:
- Only ONE story in TODO
- Only ONE story in IN PROGRESS
- State file: docs/mam-workflow-status.md
- Transitions: BACKLOG → TODO → IN PROGRESS → DONE
`;
```

---

## Validation Checklist

Before sending an LLM prompt, verify:

- [ ] Tech stack context included
- [ ] TypeScript version specified (5.7.3)
- [ ] Next.js version specified (15.5.6)
- [ ] No Python/Rust/FFI mentioned
- [ ] Proper validation strategy (Zod)
- [ ] Clear constraints specified
- [ ] Expected output format defined
- [ ] Error handling requirements included

---

## Common Mistakes to Avoid

### 1. Missing Tech Stack Context

```typescript
// WRONG
const response = await llm.generate('Create a validation function');

// RIGHT
const response = await llm.generate(`
${getTechStackContext()}

Create a validation function using Zod 4.1.12...
`);
```

### 2. Ambiguous Framework Version

```typescript
// WRONG
const prompt = 'Use Next.js';

// RIGHT
const prompt = 'Use Next.js 15.5.6 with App Router';
```

### 3. Allowing Wrong Languages

```typescript
// WRONG
const prompt = 'Implement this feature efficiently';
// LLM might choose Python for "efficiency"

// RIGHT
const prompt = `
${getTechStackContext()}
Implement this feature in TypeScript 5.9.3 only.
NO Python, NO Rust, NO other languages.
`;
```

### 4. Missing Validation Strategy

```typescript
// WRONG
const prompt = 'Parse this YAML file';

// RIGHT
const prompt = `
Parse this YAML file:
1. Use js-yaml 4.1.0 for parsing
2. Use Zod 4.1.12 for validation
3. Return Result<T, Error> type
`;
```

---

## Testing LLM Outputs

After receiving LLM response, verify:

```typescript
import { TECH_STACK } from '@/lib/constants/tech-stack';

function validateLLMOutput(code: string): boolean {
  // Check for wrong languages
  if (code.includes('python') || code.includes('rust')) {
    console.error('❌ LLM generated wrong language code');
    return false;
  }

  // Check for TypeScript
  if (!code.includes('typescript') && !code.includes('.ts')) {
    console.warn('⚠️  No TypeScript indicators found');
  }

  // Check for proper imports
  if (code.includes('import') && code.includes('zod')) {
    console.log('✅ Using Zod validation');
  }

  return true;
}
```

---

## Quick Copy-Paste Snippets

### For Documentation Updates

```markdown
**Tech Stack**: Next.js 15.5.6 • React 19.2.0 • TypeScript 5.9.3 • Node.js 20+ • Tailwind CSS 4.1.15 • Zod 4.1.12
```

### For LLM System Prompts

```typescript
import { getSystemPrompt } from '@/lib/templates/llm-system-prompt';

const systemPrompt = getSystemPrompt({ type: 'code' });
```

### For Agent Prompts

```typescript
import { getAgentTechStackContext } from '@/lib/constants/tech-stack';

const context = getAgentTechStackContext();
```

---

## Resources

- **Tech Stack Reference**: [TECH-STACK.md](./TECH-STACK.md)
- **Constants File**: `lib/constants/tech-stack.ts`
- **Prompt Templates**: `lib/templates/llm-system-prompt.ts`
- **Architecture**: [ARCHITECTURE.md](../ARCHITECTURE.md)

---

**Last Updated**: 2025-10-20
**Maintained By**: MADACE Core Team

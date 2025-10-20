# lib/

**Business Logic Layer**

This directory contains all pure TypeScript business logic for MADACE. No React components should be placed here.

## Structure

- `agents/` - Agent loading and execution
- `workflows/` - Workflow engine and execution
- `state/` - State machine for story lifecycle
- `templates/` - Template rendering with Handlebars
- `config/` - Configuration management with Zod validation
- `llm/` - LLM client abstraction (multi-provider)
- `cli/` - CLI integration (Claude, Gemini)
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

## Usage

Import from barrel exports:

```typescript
import { loadAgent } from '@/lib/agents';
import { executeWorkflow } from '@/lib/workflows';
import { formatDate } from '@/lib/utils';
```

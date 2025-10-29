# Story: [CORE-014] Template Engine

**Status**: IN PROGRESS
**Points**: 5
**Module**: Core Infrastructure
**Dependencies**: handlebars (installed), Zod validation

---

## Overview

Implement a robust template engine for rendering Handlebars templates with MADACE standard variables. The engine should support variable substitution, custom helpers, legacy pattern support, and template validation.

---

## Acceptance Criteria

### 1. Template Engine Core (lib/templates/engine.ts)

- [ ] **TemplateEngine class** with singleton pattern
  - `render(template: string, context: TemplateContext): string` - Render inline template
  - `renderFile(filePath: string, context: TemplateContext): Promise<string>` - Render template file
  - `compile(template: string): CompiledTemplate` - Pre-compile template for reuse
  - `registerHelper(name: string, fn: HelperFunction): void` - Register custom helper
  - `validateTemplate(template: string): ValidationResult` - Validate template syntax

- [ ] **Error handling**
  - Custom `TemplateError` class with template location and cause
  - Handle missing variables (strict mode vs. lenient mode)
  - Handle missing files
  - Handle compilation errors with line numbers

- [ ] **Caching mechanism**
  - Cache compiled templates by content hash
  - Cache file templates by path and mtime
  - Cache invalidation on file changes
  - Memory-efficient cache with LRU eviction

### 2. Template Context (lib/templates/types.ts)

- [ ] **TypeScript interfaces**

  ```typescript
  interface TemplateContext {
    // Standard MADACE variables (from config.yaml)
    project_name: string;
    output_folder: string;
    user_name: string;
    communication_language: string;

    // Runtime variables
    [key: string]: unknown;
  }

  interface CompiledTemplate {
    render(context: TemplateContext): string;
  }

  interface ValidationResult {
    valid: boolean;
    errors: TemplateValidationError[];
  }
  ```

### 3. Standard Helpers (lib/templates/helpers.ts)

- [ ] **Built-in Handlebars helpers**
  - `{{uppercase value}}` - Convert to uppercase
  - `{{lowercase value}}` - Convert to lowercase
  - `{{capitalize value}}` - Capitalize first letter
  - `{{date format}}` - Format current date
  - `{{json value}}` - JSON stringify
  - `{{eq a b}}` - Equality comparison
  - `{{ne a b}}` - Inequality comparison
  - `{{gt a b}}` - Greater than
  - `{{lt a b}}` - Less than

- [ ] **MADACE-specific helpers**
  - `{{tech-stack}}` - Insert technology stack context
  - `{{agent-role name}}` - Get agent role description
  - `{{workflow-status}}` - Get current workflow status

### 4. Legacy Pattern Support (lib/templates/legacy.ts)

- [ ] **Pattern conversion**
  - `{variable-name}` → `{{variable_name}}` (old MADACE style)
  - `${variable}` → `{{variable}}` (shell/JS style)
  - `%VAR%` → `{{VAR}}` (Windows style)

- [ ] **Automatic detection and conversion**
  - Detect legacy patterns in templates
  - Convert to Handlebars syntax before compilation
  - Warn about legacy pattern usage (deprecation)

### 5. Validation (lib/templates/schema.ts)

- [ ] **Zod schemas**
  - `TemplateContextSchema` - Validate context object
  - Validate required variables present
  - Type checking for variable values

- [ ] **Template syntax validation**
  - Validate Handlebars syntax
  - Detect undefined variables
  - Detect helper usage errors

### 6. Integration

- [ ] **Export public API** (lib/templates/index.ts)

  ```typescript
  export { TemplateEngine, createTemplateEngine } from './engine';
  export { registerStandardHelpers } from './helpers';
  export type { TemplateContext, CompiledTemplate } from './types';
  ```

- [ ] **Configuration integration**
  - Load standard variables from config.yaml
  - Merge with runtime context
  - Environment variable support

### 7. Testing & Quality

- [ ] **All TypeScript checks pass**

  ```bash
  npm run type-check    # No type errors
  npm run lint          # No linting errors
  npm run format:check  # Properly formatted
  npm run build         # Production build succeeds
  ```

- [ ] **Manual testing**
  - Render simple template with variables
  - Render template file
  - Use custom helpers
  - Handle missing variables (strict vs. lenient)
  - Cache performance test

---

## Technical Design

### Architecture

```
TemplateEngine (Singleton)
  ├── Handlebars (core rendering)
  ├── TemplateCache (compiled templates)
  ├── HelperRegistry (custom helpers)
  ├── LegacyConverter (pattern conversion)
  └── Validator (syntax validation)
```

### Usage Examples

```typescript
// Basic usage
import { createTemplateEngine } from '@/lib/templates';

const engine = createTemplateEngine();

// Render inline template
const result = engine.render('Hello {{user_name}}, welcome to {{project_name}}!', {
  user_name: 'Alice',
  project_name: 'MADACE',
});
// Output: "Hello Alice, welcome to MADACE!"

// Render file template
const output = await engine.renderFile('templates/prd.hbs', {
  project_name: 'My Project',
  features: ['Auth', 'API'],
});

// Register custom helper
engine.registerHelper('shout', (str: string) => str.toUpperCase() + '!!!');

// Use custom helper
engine.render('{{shout "hello"}}', {}); // "HELLO!!!"

// Strict mode (throws on missing vars)
engine.setStrictMode(true);
engine.render('{{missing_var}}', {}); // Throws TemplateError

// Validation
const validation = engine.validateTemplate('{{#if invalid');
console.log(validation.errors); // [{ message: 'Unclosed block...', line: 1 }]
```

### File Structure

```
lib/templates/
├── index.ts              # Public exports ✅
├── engine.ts             # TemplateEngine class (NEW)
├── types.ts              # TypeScript interfaces (NEW)
├── helpers.ts            # Standard helpers (NEW)
├── legacy.ts             # Legacy pattern support (NEW)
├── schema.ts             # Zod validation (NEW)
├── cache.ts              # Template caching (NEW)
├── llm-system-prompt.ts  # Existing file ✅
└── README.md             # Existing docs ✅
```

---

## Dependencies

- `handlebars` (^4.7.8) - Already installed ✅
- `zod` (^4.1.12) - Already installed ✅
- `js-yaml` (^4.1.0) - For loading config.yaml ✅

---

## Implementation Plan

### Phase 1: Core Engine (30 min)

1. Create `types.ts` with interfaces
2. Create `engine.ts` with TemplateEngine class
3. Implement basic `render()` and `renderFile()` methods
4. Add error handling with TemplateError class

### Phase 2: Helpers & Legacy (20 min)

5. Create `helpers.ts` with standard helpers
6. Register helpers in engine initialization
7. Create `legacy.ts` for pattern conversion
8. Integrate legacy converter into engine

### Phase 3: Caching & Validation (20 min)

9. Create `cache.ts` with LRU cache
10. Integrate caching into engine
11. Create `schema.ts` with Zod schemas
12. Implement template validation

### Phase 4: Testing & Integration (20 min)

13. Update `index.ts` with public exports
14. Test with real MADACE templates
15. Run all quality checks
16. Update documentation

**Total Estimated Time**: ~90 minutes

---

## Testing Strategy

### Unit Tests (Future)

- Template rendering with various contexts
- Helper functions
- Legacy pattern conversion
- Cache hit/miss scenarios
- Error handling

### Integration Tests (Manual)

- Render agent persona templates
- Render workflow step templates
- Load variables from config.yaml
- Performance test with large templates

### Edge Cases

- Empty templates
- Missing variables in strict mode
- Invalid Handlebars syntax
- File not found errors
- Circular helper dependencies

---

## Risks & Mitigations

| Risk                             | Impact | Mitigation                      |
| -------------------------------- | ------ | ------------------------------- |
| Handlebars version compatibility | Medium | Use stable API, test thoroughly |
| Memory leaks from cache          | Medium | Implement LRU eviction          |
| Legacy pattern conflicts         | Low    | Conversion order matters        |
| Performance with large templates | Low    | Use compiled template caching   |

---

## Success Metrics

- ✅ All quality checks pass (type-check, lint, format, build)
- ✅ Can render templates with MADACE standard variables
- ✅ Custom helpers work correctly
- ✅ Legacy patterns converted automatically
- ✅ Template validation catches errors
- ✅ Caching improves performance (>50% faster on repeated renders)

---

## Related Stories

- **[CORE-012] Agent Runtime** - Will use template engine for agent prompts
- **[CORE-013] Workflow Engine** - Will use template engine for workflow steps
- **[SETUP-007] Configuration validation** - Provides config.yaml schema

---

## Notes

- Handlebars is a mature, well-tested library with excellent TypeScript support
- Auto-escaping is enabled by default for security
- Consider adding sandbox mode for user-provided templates (future)
- Template precompilation can be added for production optimization

---

**Story created**: 2025-10-22
**Story started**: 2025-10-22
**Story completed**: _In Progress_

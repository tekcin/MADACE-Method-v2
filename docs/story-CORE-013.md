# Story: [CORE-013] Workflow Engine

**Status**: IN PROGRESS
**Points**: 5
**Module**: Core Infrastructure
**Dependencies**: Agent Runtime (CORE-012), Template Engine (CORE-014)

---

## Overview

Implement workflow execution engine that parses and executes MADACE workflow YAML files with step-by-step orchestration.

---

## Acceptance Criteria

- [ ] Workflow types and Zod schemas (lib/workflows/types.ts, schema.ts)
- [ ] Workflow loader with YAML parsing (lib/workflows/loader.ts)
- [ ] Workflow executor with step execution (lib/workflows/executor.ts)
- [ ] Step executors: elicit, reflect, guide, template, validate, sub-workflow
- [ ] State persistence (.workflow-name.state.json)
- [ ] All quality checks pass (type-check, lint, format, build)

---

## Implementation

Workflow YAML structure:

```yaml
workflow:
  name: example-workflow
  description: Example workflow
  steps:
    - name: step1
      action: guide
      content: 'Welcome message'
    - name: step2
      action: elicit
      prompt: 'Enter project name'
      variable: project_name
```

---

**Story created**: 2025-10-22
**Story started**: 2025-10-22

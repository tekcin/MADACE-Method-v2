# EPIC-V3-004: Story-Context Workflow

**Epic ID:** EPIC-V3-004 | **Priority:** P1 | **Effort:** 34 points (3 weeks) | **Quarter:** Q3 2026

## Summary

Just-in-time context gathering with 5 layers (requirements, related code, dependencies, testing, architecture). 80-95% token reduction vs full codebase.

## Problem

- Agents receive entire codebase (10k-100k tokens) even though only 5-10 files are relevant
- Generic responses due to lack of project-specific context
- High LLM API costs from unnecessary token usage

## Solution

- **Context Layers:**
  1. Story requirements (from story file)
  2. Related code (AST search for similar patterns)
  3. Dependencies (import graph analysis)
  4. Testing context (matching test files)
  5. Architectural constraints (from architecture.md)
- Output: `docs/story-context/${STORY_ID}-context.md`
- Max size: 10,000 tokens (configurable)

## User Stories

1. **US-001:** As a Dev Agent, I want only relevant files so I produce better solutions
2. **US-002:** As a project, I want to reduce LLM costs by 85%
3. **US-003:** As a developer, I want agents to produce code consistent with existing patterns

## Implementation (3 weeks)

- Week 1: Codebase search & AST parsing
- Week 2: Dependency graph & test pattern matching
- Week 3: Context assembly, template engine, integration

## Success Metrics

- 80-95% token reduction (measured)
- 85% cost savings per story
- 30% faster completion
- 40% fewer revision requests

**Dependencies:** EPIC-V3-003 (JIT Tech Specs provides architecture context)

---

**Status:** 📋 Planning | **Last Updated:** 2025-10-24

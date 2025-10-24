# EPIC-V3-005: Brownfield Analysis Workflow

**Epic ID:** EPIC-V3-005 | **Priority:** P1 | **Effort:** 34 points (3 weeks) | **Quarter:** Q3 2026

## Summary

Automated codebase documentation for existing projects. <10 min analysis for 50k LOC.

## Problem

- Starting MADACE on existing codebases requires manual architecture documentation
- New team members spend days understanding legacy code
- No automated tech debt assessment

## Solution

- **Scan Types:** File structure, tech stack, entry points, API routes, data models, dependencies, test coverage
- **Outputs:**
  - `brownfield/analysis-report.md` - Comprehensive findings
  - `architecture.md` - MADACE-compatible architecture doc
  - `brownfield/dependency-graph.json` - Machine-readable graph
  - `brownfield/tech-debt.md` - Prioritized improvement list
- **Trigger:** User selects "Existing codebase" in setup wizard

## User Stories

1. **US-001:** As a developer, I want automated docs so I understand the codebase quickly
2. **US-002:** As a team, I want to start MADACE without manual documentation
3. **US-003:** As a PM, I want tech debt assessment to prioritize refactoring

## Implementation (3 weeks)

- Week 1: AST parsing, file structure analysis, tech stack detection
- Week 2: Dependency graph, git history analysis, LLM architecture inference
- Week 3: Report generation, MADACE doc creation, testing

## Success Metrics

- <10 min for 50k LOC codebase
- 85%+ accuracy vs manual assessment
- 60%+ adoption for brownfield projects
- 90% time savings vs manual docs

**Dependencies:** None

---

**Status:** 📋 Planning | **Last Updated:** 2025-10-24

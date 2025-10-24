# MADACE v3.0 - Product Requirements Document (PRD)

**Project:** MADACE-Method v3.0 - Workflow Intelligence & Agent Enhancements
**Version:** 3.0.0-beta
**Document Status:** Planning (PM Agent Review)
**Scale Level:** Level 3-4 (Complex to Enterprise-Scale)
**Created:** 2025-10-24
**Target Release:** Q1 2027 (Beta), Q2 2027 (GA)
**Timeline:** 12 months (Q2 2026 - Q1 2027)

> **📋 MADACE-Method Applied:** This PRD follows MAM (MADACE Agile Method) guidelines for Level 3-4 projects
>
> **🎯 Key Decision:** v3.0 focuses on BMAD-inspired workflow intelligence features. Database-backed agents, NLU, Web IDE, and real-time collaboration are **deferred to v3.1+ (2027)**.

---

## Executive Summary

MADACE v3.0 integrates **8 proven innovations from BMAD v6** while maintaining MADACE's unique web-first, multi-provider LLM vision. This release focuses on:

- **Intelligent Automation:** Scale-Adaptive Workflow Router, Just-In-Time Tech Specs
- **Contextual Awareness:** Story-Context Workflow, Brownfield Analysis
- **User Empowerment:** Agent Sidecar Customization, Enhanced Setup Wizard
- **Developer Productivity:** Universal Workflow Status Checker, Story Lifecycle Enhancements

### v3.0 Scope Decision

**Included in v3.0 (Q2-Q4 2026):**
✅ Scale-Adaptive Workflow Router (Priority 0)
✅ Universal Workflow Status Checker (Priority 0)
✅ Just-In-Time Tech Specs (Priority 1)
✅ Story-Context Workflow (Priority 1)
✅ Brownfield Analysis (Priority 1)
✅ Agent Sidecar Customization (Priority 1)
✅ Enhanced Setup Wizard (Priority 1)
✅ Story Lifecycle Enhancements (Priority 2)

**Deferred to v3.1+ (2027):**
❌ Dynamic Agent Management (Database-backed agents) → v3.1 Q2 2027
❌ Conversational Interaction (NLU) → v3.1 Q2 2027
❌ Persistent Agent Memory (Database) → v3.1 Q2 2027
❌ Interactive CLI Mode (REPL) → v3.1 Q3 2027
❌ Terminal Dashboard (TUI) → v3.1 Q3 2027
❌ CLI Feature Parity → v3.1 Q3 2027
❌ Unified Configuration Database → v3.2 Q4 2027
❌ Integrated Web IDE → v3.2 Q4 2027
❌ Real-time Collaboration → v3.2 Q4 2027

**Rationale:** File-based agents with sidecar customization provide sufficient flexibility without the complexity of database migration. Focus on workflow intelligence delivers immediate value to users.

### Success Criteria

- **Adoption:** 1,000+ projects using v3.0 within 6 months of GA
- **Retention:** 70%+ of v2.0 users upgrade to v3.0
- **Performance:** Scale-Adaptive Router reduces planning time by 50% for simple projects
- **Quality:** 85%+ user satisfaction rating
- **Cost Savings:** 85% reduction in LLM API costs per story (via story-context)

---

## 1. Strategic Context

### 1.1 Evolution from v2.0

MADACE v2.0 Alpha (218 points delivered) successfully validated:

- ✅ Next.js 15 full-stack architecture
- ✅ Multi-provider LLM integration (Gemini, Claude, OpenAI, Local)
- ✅ Agent-based workflows (5 MAM agents)
- ✅ State machine with visual Kanban board
- ✅ WebSocket sync (CLI ↔ Web UI)
- ✅ Docker deployment (production + development)

**v3.0 Addresses v2.0 Limitations:**

- ❌ One-size-fits-all workflows (now: scale-adaptive routing)
- ❌ Stale upfront tech specs (now: JIT tech specs)
- ❌ Generic agent responses (now: story-context workflow)
- ❌ Difficult brownfield onboarding (now: automated analysis)
- ❌ Risky agent customization (now: update-safe sidecars)
- ❌ Manual status checking (now: universal status checker)
- ❌ Limited setup wizard (now: comprehensive preferences)
- ❌ Basic story lifecycle (now: 6-state with blocking)

### 1.2 Competitive Positioning

| Feature                      | MADACE v3.0    | BMAD v6       | GitHub Copilot | Cursor IDE  |
| ---------------------------- | -------------- | ------------- | -------------- | ----------- |
| **Scale-Adaptive Planning**  | ✅ Levels 0-4  | ✅ Levels 0-4 | ❌             | ❌          |
| **Multi-Provider LLM**       | ✅ 4 providers | ❌ Fixed      | ✅ 2           | ✅ Multiple |
| **Web-First Interface**      | ✅ Next.js UI  | ❌ CLI-only   | ❌ IDE-only    | ❌ IDE-only |
| **Brownfield Analysis**      | ✅ Automated   | ✅ Automated  | ❌ Manual      | ❌ Manual   |
| **Agent Customization**      | ✅ Sidecars    | ✅ Sidecars   | ❌             | ❌          |
| **Visual Kanban Board**      | ✅ Web UI      | ❌ CLI only   | ❌             | ❌          |
| **Story-Context Generation** | ✅ Automated   | ✅ Automated  | ❌ Manual      | ❌ Manual   |
| **JIT Tech Specs**           | ✅ On-demand   | ✅ On-demand  | ❌             | ❌          |

**MADACE v3.0 = Best of Both Worlds:**

- MADACE: Web-first, visual Kanban, multi-provider LLM, Docker-native
- BMAD: Workflow intelligence, customization system, universal status checker

---

## 2. Features - Priority 0 (Q2 2026)

### Feature 2.1: Scale-Adaptive Workflow Router

**Epic ID:** EPIC-V3-001  
**Priority:** P0 (Critical)  
**Effort:** 34 points (3 weeks)  
**Dependencies:** None

**Problem:** One-size-fits-all workflows don't adapt to project complexity. Simple scripts get over-planned, complex systems get under-planned.

**Solution:** Dynamic workflow routing that assesses project complexity (Levels 0-4) and automatically selects appropriate planning workflows.

**User Stories:**

1. As a developer starting a simple script, I want minimal documentation so I can start coding in <5 minutes
2. As a PM planning an enterprise system, I want comprehensive documentation so nothing is missed
3. As a team lead, I want the system to recommend the right planning level based on project characteristics

**Acceptance Criteria:**

- Complexity assessment with 8 criteria (team size, codebase size, integrations, security, duration, user base)
- Level determination algorithm (0-4) with clear thresholds and scoring
- Workflow routing YAML with conditional paths per level
- User override option to manually select level
- Assessment report document generation (docs/scale-assessment.md)
- CLI command: `madace assess-scale` with --format options (table, json, markdown)
- Web UI integration in enhanced setup wizard (auto-assessment on project creation)

**Technical Specifications:**

- Assessment interface: `ComplexityAssessment` (TypeScript)
- Workflow file: `workflows/route-workflow.yaml`
- Routing step: `action: route` with level-based paths
- Output document: `docs/scale-assessment.md`
- API route: `POST /api/workflows/assess-scale`

**Success Metrics:**

- Level 0: <5 min from start to first story
- Level 4: Complete docs in <2 hours
- User satisfaction: 90%+ feel workflows match needs
- Override rate: <10% (routing is accurate)

---

### Feature 2.2: Universal Workflow Status Checker

**Epic ID:** EPIC-V3-002  
**Priority:** P0 (Critical)  
**Effort:** 21 points (2 weeks)  
**Dependencies:** None

**Problem:** No unified way to check workflow status across different contexts (epic, story, workflow, state machine). Users manually inspect multiple files.

**Solution:** Single command interface to check status of any workflow entity with intelligent context detection.

**User Stories:**

1. As a developer, I want to check story status with one command instead of opening status files
2. As a PM, I want to see epic completion percentage without manual calculation
3. As a team, we want real-time workflow status in our terminal and Web UI

**Acceptance Criteria:**

- Context-aware entity detection (epic → story → workflow → state machine)
- Status provider interface: `IStatusProvider` with implementations for each entity type
- Multiple output formats: `--format=table` (default), `--format=json`, `--format=markdown`
- Watch mode with 2-second polling: `madace status --watch`
- WebSocket integration for live updates (no polling needed)
- CLI command: `madace status [entity]` with optional entity ID
- API endpoint: `GET /api/status/:type/:id`
- Web UI status dashboard page (`/status`)

**Technical Specifications:**

- Provider interface: `IStatusProvider` with `getStatus(entityId?: string)` method
- Providers: `EpicStatusProvider`, `StoryStatusProvider`, `WorkflowStatusProvider`, `StateMachineStatusProvider`
- CLI integration: `lib/cli/commands/status.ts`
- API route: `app/api/status/[type]/[id]/route.ts`
- WebSocket message type: `{ type: 'status_update', entity, data }`

**Success Metrics:**

- Command usage: 50+ invocations per project
- Coverage: 100% of workflow entities supported
- Response time: <100ms (95th percentile)
- Adoption: 80%+ use status checker daily

---

## 3. Features - Priority 1 (Q2-Q3 2026)

### Feature 3.1: Just-In-Time (JIT) Technical Specifications

**Epic ID:** EPIC-V3-003  
**Effort:** 21 points (2 weeks)

Generate tech specs on-demand when epic implementation begins. Includes web research for latest APIs/standards.

**Success Metrics:** 50% time savings, 90%+ usage rate, 100% freshness

---

### Feature 3.2: Story-Context Workflow

**Epic ID:** EPIC-V3-004  
**Effort:** 34 points (3 weeks)

Just-in-time context gathering with 5 layers (requirements, related code, dependencies, testing, architecture). 80-95% token reduction vs full codebase.

**Success Metrics:** 85% cost reduction, 30% faster completion, 40% fewer revisions

---

### Feature 3.3: Brownfield Analysis Workflow

**Epic ID:** EPIC-V3-005  
**Effort:** 34 points (3 weeks)

Automated codebase documentation for existing projects. <10 min analysis for 50k LOC.

**Success Metrics:** 90% time savings vs manual docs, 85%+ accuracy

---

### Feature 3.4: Agent Sidecar Customization System

**Epic ID:** EPIC-V3-006  
**Effort:** 21 points (2 weeks)

Update-safe agent overrides via sidecar YAML files. Deep merge strategy, Web UI editor with live preview.

**Success Metrics:** 40%+ users customize agents, 100% retention on updates

---

### Feature 3.5: Enhanced Setup Wizard

**Epic ID:** EPIC-V3-007  
**Effort:** 21 points (2 weeks)

6-step wizard capturing user preferences (name, technical level, languages, communication style). Auto-generates agent sidecars.

**Success Metrics:** 85%+ completion rate, <10 min average time, 90%+ satisfaction

---

## 4. Features - Priority 2 (Q4 2026)

### Feature 4.1: Story Lifecycle Enhancements

**Epic ID:** EPIC-V3-008  
**Effort:** 21 points (2 weeks)

Extended state machine: BACKLOG → TODO → IN_PROGRESS → REVIEW → TESTING → DONE + BLOCKED state.

**Success Metrics:** 30% bug reduction, <2 days average blocking time

---

## 5. Release Plan

**Phase 1 (Q2 2026):** Priority 0 - 8 weeks
**Phase 2 (Q3 2026):** Priority 1 Part 1 - 8 weeks
**Phase 3 (Q3 2026):** Priority 1 Part 2 - 8 weeks  
**Phase 4 (Q4 2026):** Priority 2 - 4 weeks
**Phase 5 (Q1 2027):** Beta testing & polish - 8 weeks

**Total:** 207 points, 32 weeks development + 8 weeks beta

---

## 6. Epic Summary

| Epic        | Feature                  | Priority  | Points  | Weeks  | Q              |
| ----------- | ------------------------ | --------- | ------- | ------ | -------------- |
| EPIC-V3-001 | Scale-Adaptive Router    | P0        | 34      | 3      | Q2 2026        |
| EPIC-V3-002 | Universal Status Checker | P0        | 21      | 2      | Q2 2026        |
| EPIC-V3-003 | JIT Tech Specs           | P1        | 21      | 2      | Q2 2026        |
| EPIC-V3-004 | Story-Context Workflow   | P1        | 34      | 3      | Q3 2026        |
| EPIC-V3-005 | Brownfield Analysis      | P1        | 34      | 3      | Q3 2026        |
| EPIC-V3-006 | Agent Sidecars           | P1        | 21      | 2      | Q3 2026        |
| EPIC-V3-007 | Enhanced Setup Wizard    | P1        | 21      | 2      | Q3 2026        |
| EPIC-V3-008 | Story Lifecycle          | P2        | 21      | 2      | Q4 2026        |
| **Total**   | **8 Epics**              | **P0-P2** | **207** | **19** | **Q2-Q4 2026** |

---

## 7. Related Documents

- [SCALE-ASSESSMENT.md](./SCALE-ASSESSMENT.md) - Scale assessment report (Level 3-4)
- [PRD-V3-UPGRADE-FROM-BMAD.md](./PRD-V3-UPGRADE-FROM-BMAD.md) - BMAD analysis (1,077 lines)
- [ARCHITECTURE-V3-FUTURE.md](../../ARCHITECTURE-V3-FUTURE.md) - Technical architecture (624 lines)
- [PRD-V3-FUTURE-VISION-ORIGINAL.md](./PRD-V3-FUTURE-VISION-ORIGINAL.md) - v3.1+ features (database, NLU, Web IDE)
- [Epics-V3.md](./Epics-V3.md) - Detailed epic breakdown

---

**Document Status:** Draft - Pending Stakeholder Review  
**Next Steps:** Epic breakdown → Story generation → Priority 0 development kickoff

**Approvals Required:**

- [ ] Product Owner (User/Team Lead)
- [ ] Technical Architect
- [ ] Development Team
- [ ] QA Lead

---

**Last Updated:** 2025-10-24  
**Version:** 1.0 (BMAD-focused v3.0)

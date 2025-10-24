# EPIC-V3-002: Universal Workflow Status Checker

**Epic ID:** EPIC-V3-002  
**Epic Name:** Universal Workflow Status Checker  
**Priority:** P0 (Critical)  
**Effort Estimate:** 21 points (2 weeks)  
**Target Quarter:** Q2 2026  
**Owner:** SM + DEV  
**Status:** 📋 Planning

---

## Epic Summary

Single command interface to check status of any workflow entity (epic, story, workflow, state machine) with intelligent context detection. Eliminates manual file inspection.

**Key Innovation from BMAD v6:** Universal Workflow Status Checker with context-aware entity detection

---

## Problem Statement

**Current State (v2.0):**
- No unified status checking system
- Users manually open `mam-workflow-status.md` to check story status
- Epic progress requires manual calculation
- Workflow execution status requires inspecting `.*.state.json` files
- No CLI command for quick status queries

**Pain Points:**
- Developer: "What's the status of story F11?" → Opens editor, searches status file
- PM: "How complete is Epic 003?" → Manually counts completed vs total stories
- Team: "Is the workflow still running?" → Checks file system for state files

---

## Solution Overview

1. **Context-Aware Status Checker**
   - Smart entity detection (epic-001 → epic, F11 → story, plan-project → workflow)
   - Single command: `madace status [entity]`
   - Multiple output formats (table, JSON, markdown)

2. **Status Provider System**
   - Interface: `IStatusProvider` with `getStatus(entityId?): StatusResult`
   - Providers: Epic, Story, Workflow, StateMachine
   - Pluggable architecture for future entity types

3. **Real-time Updates**
   - Watch mode: `madace status --watch` (2-second polling)
   - WebSocket integration: Live updates without polling
   - Web UI status dashboard with auto-refresh

---

## User Stories

### US-001: Check Story Status
**As a** developer  
**I want** to check story status with one CLI command  
**So that** I don't need to open and search status files

**Acceptance Criteria:**
- `madace status F11-SUB-WORKFLOWS` returns story state (TODO/IN_PROGRESS/DONE)
- Shows: story ID, title, points, assigned agent, started date, milestone
- Response time: <100ms
- Works for any story ID pattern

---

### US-002: Check Epic Progress
**As a** PM  
**I want** to see epic completion percentage  
**So that** I can track progress without manual calculation

**Acceptance Criteria:**
- `madace status epic-003` returns:
  - Epic title and description
  - Total stories vs completed stories
  - Completion percentage
  - List of stories with states
  - Tech spec status (exists/missing)
- Shows blockers and dependencies

---

### US-003: Watch Mode for Real-time Updates
**As a** team  
**I want** real-time status updates in my terminal  
**So that** I can monitor workflow progress continuously

**Acceptance Criteria:**
- `madace status --watch` polls every 2 seconds
- Updates display inline (no scroll spam)
- Shows: IN_PROGRESS stories, active workflows, recent state changes
- Press 'q' to exit watch mode

---

## Technical Specifications

```typescript
// lib/status/provider-interface.ts
export interface IStatusProvider {
  entityType: 'epic' | 'story' | 'workflow' | 'state-machine';
  getStatus(entityId?: string): Promise<StatusResult>;
  detectEntity(input: string): boolean;
}

export interface StatusResult {
  entityType: string;
  entityId?: string;
  status: 'active' | 'completed' | 'blocked' | 'pending';
  details: Record<string, any>;
  timestamp: Date;
}

// Story Status Provider
export class StoryStatusProvider implements IStatusProvider {
  async getStatus(storyId: string): Promise<StatusResult> {
    const statusFile = await loadStatusFile('mam-workflow-status.md');
    const story = findStory(statusFile, storyId);
    
    return {
      entityType: 'story',
      entityId: story.id,
      status: story.state,
      details: {
        title: story.title,
        points: story.points,
        assignedTo: story.assignedTo,
        startedAt: story.startedAt,
        milestone: story.milestone
      },
      timestamp: new Date()
    };
  }
}
```

**CLI Integration:**
```bash
# Check specific entity
madace status F11-SUB-WORKFLOWS    # Auto-detects story
madace status epic-003             # Auto-detects epic
madace status plan-project         # Auto-detects workflow

# Check state machine overview
madace status                       # Shows Kanban summary

# Watch mode
madace status --watch               # Real-time updates

# Output formats
madace status F11 --format=json    # Machine-readable
madace status F11 --format=table   # Human-readable (default)
madace status F11 --format=markdown # Doc-ready
```

---

## Implementation Plan

### Phase 1: Status Provider System (Week 1)
- STORY-V3-011: Create IStatusProvider interface
- STORY-V3-012: Implement StoryStatusProvider
- STORY-V3-013: Implement EpicStatusProvider
- STORY-V3-014: Implement WorkflowStatusProvider
- STORY-V3-015: Implement StateMachineStatusProvider

### Phase 2: CLI & API Integration (Week 2)
- STORY-V3-016: Create `madace status` CLI command
- STORY-V3-017: Add context-aware entity detection
- STORY-V3-018: Implement watch mode with polling
- STORY-V3-019: Create API route GET /api/status/:type/:id
- STORY-V3-020: Integrate WebSocket for real-time updates
- STORY-V3-021: Create Web UI status dashboard page

---

## Success Metrics

- **Command Usage:** 50+ invocations per project
- **Coverage:** 100% of workflow entities supported
- **Response Time:** <100ms (95th percentile)
- **Adoption:** 80%+ of users use status checker daily

---

## Dependencies

- None (can be implemented independently)

---

**Epic Status:** 📋 Planning → Ready for Story Breakdown  
**Last Updated:** 2025-10-24

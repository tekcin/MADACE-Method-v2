# EPIC-V3-008: Story Lifecycle Enhancements

**Epic ID:** EPIC-V3-008 | **Priority:** P2 | **Effort:** 21 points (2 weeks) | **Quarter:** Q4 2026

## Summary
Extended state machine: BACKLOG → TODO → IN_PROGRESS → REVIEW → TESTING → DONE + BLOCKED state.

## Problem
- Current 4-state machine (BACKLOG/TODO/IN_PROGRESS/DONE) lacks intermediate states
- No review or testing checkpoints
- No explicit blocking management
- Can't track time-in-state for velocity metrics

## Solution
- **6 States:** BACKLOG, TODO, IN_PROGRESS, REVIEW, TESTING, DONE
- **BLOCKED State:** Can transition from any active state (TODO/IN_PROGRESS/REVIEW/TESTING)
- **Metadata:** assigned_to, started_at, blocked_reason, blocker_details, reviewer, test_results
- **Web UI:** 6-column Kanban board with blocker visualization

## User Stories
1. **US-001:** As a developer, I want to mark story "in review" when ready for QA
2. **US-002:** As QA, I want to see which stories are in testing
3. **US-003:** As PM, I want to know why stories are blocked

## Implementation (2 weeks)
- Week 1: State machine enhancement (add 3 states), transition validation, metadata
- Week 2: Web UI Kanban update, blocker management, API routes, testing

## Success Metrics
- 100% story state accuracy
- 30% bug reduction (review/testing checkpoints)
- <2 days average blocking time
- Time-in-state data available

**Dependencies:** EPIC-V3-002 (Universal Status Checker - displays new states)

---
**Status:** 📋 Planning | **Last Updated:** 2025-10-24

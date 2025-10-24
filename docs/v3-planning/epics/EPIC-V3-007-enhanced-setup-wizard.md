# EPIC-V3-007: Enhanced Setup Wizard

**Epic ID:** EPIC-V3-007 | **Priority:** P1 | **Effort:** 21 points (2 weeks) | **Quarter:** Q3 2026

## Summary
6-step wizard capturing user preferences (name, technical level, languages, communication style). Auto-generates agent sidecars.

## Problem
- Current setup wizard doesn't capture user preferences
- No technical level setting (beginners get advanced explanations, experts get verbose)
- No language preference for non-English users

## Solution
- **6 Steps:**
  1. User Profile (name, tech level, languages, team size)
  2. Communication Preferences (language, style, doc language, explanation depth)
  3. Project Configuration (name, folder, type, scale, existing/greenfield)
  4. LLM Configuration (provider, API key with test, model selection)
  5. Module Selection (MAM, MAB, CIS toggles)
  6. IDE Integration (Claude CLI, Gemini CLI, VSCode)
- **Auto-generate agent sidecars** based on preferences
- **Smart defaults** with auto-detection

## User Stories
1. **US-001:** As a new user, I want wizard to ask about my preferences
2. **US-002:** As a beginner, I want detailed explanations (while experts get concise)
3. **US-003:** As non-English developer, I want to set language once

## Implementation (2 weeks)
- Week 1: New wizard steps, preferences capture, sidecar generation
- Week 2: Smart defaults, validation, migration support, testing

## Success Metrics
- 85%+ completion rate
- <10 min average time
- 90%+ satisfaction
- 70%+ have auto-generated sidecars

**Dependencies:** EPIC-V3-006 (Agent Sidecars - generates sidecars from preferences)

---
**Status:** 📋 Planning | **Last Updated:** 2025-10-24

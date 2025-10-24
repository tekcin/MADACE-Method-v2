# EPIC-V3-006: Agent Sidecar Customization System

**Epic ID:** EPIC-V3-006 | **Priority:** P1 | **Effort:** 21 points (2 weeks) | **Quarter:** Q3 2026

## Summary
Update-safe agent overrides via sidecar YAML files. Deep merge strategy, Web UI editor with live preview.

## Problem
- Users who customize agents lose changes on MADACE updates
- No way to change agent communication style, language, or prompts
- Modifying base agent files breaks update path

## Solution
- **Sidecar Files:** `madace-data/config/agents/{agent-name}.override.yaml`
- **Merge Strategy:** Load base agent + load sidecar → deep merge → runtime composition
- **Supported Overrides:** Name, persona, communication style, language, prompts, menu
- **Web UI:** Agent customization editor with live preview and validation

## User Stories
1. **US-001:** As a user, I want to customize agent style without losing changes on updates
2. **US-002:** As a non-English speaker, I want agents to communicate in my language
3. **US-003:** As a team, I want to customize PM prompts to match our PRD format

## Implementation (2 weeks)
- Week 1: Sidecar schema, merge algorithm, agent loader enhancement
- Week 2: Web UI editor, validation, reset functionality, testing

## Success Metrics
- 40%+ users customize at least one agent
- 100% retention on updates (sidecars not overwritten)
- <1% validation error rate
- 90%+ satisfaction with flexibility

**Dependencies:** None

---
**Status:** 📋 Planning | **Last Updated:** 2025-10-24

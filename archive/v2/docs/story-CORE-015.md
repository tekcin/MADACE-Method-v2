# Story: [CORE-015] State Machine

**Status**: IN PROGRESS
**Points**: 5
**Module**: Core Infrastructure

---

## Overview

Implement state machine for managing story lifecycle with strict transition rules.

---

## Acceptance Criteria

- [ ] State types: BACKLOG, TODO, IN_PROGRESS, DONE
- [ ] Parse mam-workflow-status.md
- [ ] Enforce: ONE story in TODO, ONE in IN_PROGRESS
- [ ] Atomic transitions: BACKLOG→TODO→IN_PROGRESS→DONE
- [ ] Update status file atomically
- [ ] All quality checks pass

---

**Story created**: 2025-10-22
**Story started**: 2025-10-22

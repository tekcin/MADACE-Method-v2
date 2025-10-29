# Story: [UI-001] Home Dashboard Page

**Status**: IN_PROGRESS
**Points**: 5
**Module**: Frontend Components
**Dependencies**: CORE-015 (State Machine), CORE-016 (Config Manager)

---

## Overview

Enhance the home page (`app/page.tsx`) to create a comprehensive dashboard that provides an overview of the project status, quick actions, and navigation to key features. This is the first page users see and should give them immediate insight into their MADACE project.

---

## Acceptance Criteria

- [ ] Enhanced home dashboard at `app/page.tsx`
- [ ] Project overview section showing:
  - [ ] Project name (from config)
  - [ ] Current milestone/phase
  - [ ] Progress statistics (stories completed, total points)
- [ ] Quick actions section with:
  - [ ] "View Kanban Board" button
  - [ ] "Test LLM Connection" button
  - [ ] "Configure Settings" button
  - [ ] "Setup Project" button (if not configured)
- [ ] Recent activity/status section
- [ ] Getting started guide for new users
- [ ] Feature highlights (MAM, MAB, CIS modules)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] All quality checks pass (type-check, lint, format, build)

---

## Technical Design

### Dashboard Sections

1. **Hero Section**
   - Project name and tagline
   - Quick status overview
   - Primary call-to-action

2. **Project Statistics**
   - Stories completed
   - Total points
   - Current milestone
   - Active modules

3. **Quick Actions**
   - Large button cards linking to main features
   - Visual icons for each action
   - Descriptive text

4. **Feature Grid**
   - MAM, MAB, CIS module descriptions
   - Status indicators (enabled/disabled)

5. **Getting Started** (for new users)
   - Step-by-step guide
   - Links to setup and documentation

---

## Implementation Plan

### Step 1: Read current home page (5 min)

Understand existing structure and plan enhancements.

### Step 2: Design dashboard layout (15 min)

- Hero section with project branding
- Statistics cards
- Quick actions grid
- Feature highlights

### Step 3: Implement API integration (20 min)

- Load config via GET /api/config
- Load workflow status via GET /api/state
- Handle loading and error states

### Step 4: Build UI components (40 min)

- Hero section
- Statistics cards
- Quick action cards
- Feature cards
- Getting started guide

### Step 5: Styling and polish (15 min)

- Responsive design
- Dark mode
- Hover effects
- Animations

### Step 6: Testing and quality (10 min)

**Total**: ~105 minutes (~1.75 hours)

---

## Definition of Done

- ✅ Enhanced dashboard at `/` (home page)
- ✅ Project statistics from config and state machine
- ✅ Quick action buttons with navigation
- ✅ Feature highlights for MAM/MAB/CIS
- ✅ Getting started guide for new users
- ✅ Responsive design
- ✅ Dark mode supported
- ✅ All quality checks pass
- ✅ Production build succeeds

---

**Story Created By**: SM Agent
**Date Created**: 2025-10-22
**Estimated Time**: 1.5-2 hours

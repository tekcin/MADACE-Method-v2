# Story: [UI-005] State Machine Kanban Board

**Status**: TODO
**Points**: 8
**Module**: Frontend Components
**Dependencies**: CORE-015 (State Machine), CORE-011 (Agent Loader)

---

## Overview

Create a visual Kanban board UI that displays the current workflow status by parsing `docs/mam-workflow-status.md` and showing stories in their respective columns (BACKLOG, TODO, IN_PROGRESS, DONE). This provides a visual representation of the MADACE state machine and allows users to see the project progress at a glance.

---

## Acceptance Criteria

- [ ] Kanban board page created at `app/kanban/page.tsx`
- [ ] Four columns: BACKLOG, TODO, IN_PROGRESS, DONE
- [ ] Story cards display in appropriate columns based on state
- [ ] Each story card shows:
  - [ ] Story ID (e.g., [UI-005])
  - [ ] Story title/description
  - [ ] Points
  - [ ] Status indicator
- [ ] Integration with State Machine (lib/state/machine.ts)
- [ ] Real-time state indicators (only 1 in TODO, only 1 in IN_PROGRESS)
- [ ] Milestone grouping in BACKLOG column
- [ ] Completed stories grouped by phase in DONE column
- [ ] Drag-and-drop support for state transitions (optional for v1)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Accessibility features (ARIA labels, keyboard navigation)
- [ ] All quality checks pass (type-check, lint, format, build)

---

## Technical Design

### Component Structure

```
app/kanban/
└── page.tsx              # Main Kanban board page

components/features/kanban/
├── KanbanBoard.tsx       # Main board component
├── KanbanColumn.tsx      # Column component (BACKLOG, TODO, etc.)
├── StoryCard.tsx         # Individual story card
├── MilestoneSection.tsx  # Milestone grouping in BACKLOG
└── StatsPanel.tsx        # Statistics panel (total points, velocity, etc.)
```

### Page Layout

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createStateMachine } from '@/lib/state/machine';
import type { WorkflowStatus, Story } from '@/lib/state/types';

export default function KanbanPage() {
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflowStatus();
  }, []);

  const loadWorkflowStatus = async () => {
    try {
      const stateMachine = createStateMachine();
      const workflowStatus = await stateMachine.load();
      setStatus(workflowStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!status) return null;

  return (
    <div className="container mx-auto p-6">
      <h1>MADACE Workflow Status</h1>
      <StatsPanel status={status} />
      <KanbanBoard status={status} onRefresh={loadWorkflowStatus} />
    </div>
  );
}
```

### State Machine Integration

```typescript
import { createStateMachine } from '@/lib/state/machine';
import type { WorkflowStatus } from '@/lib/state/types';

// Load workflow status
const stateMachine = createStateMachine();
const status: WorkflowStatus = await stateMachine.load();

// Access columns
const backlog = status.backlog; // Story[]
const todo = status.todo; // Story | null
const inProgress = status.inProgress; // Story | null
const done = status.done; // Story[]

// Get statistics
const totalCompleted = done.length;
const totalPoints = done.reduce((sum, story) => sum + story.points, 0);
```

### Story Card Component

```typescript
interface StoryCardProps {
  story: Story;
  state: 'backlog' | 'todo' | 'in_progress' | 'done';
}

export function StoryCard({ story, state }: StoryCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{story.id}</h3>
          <p className="text-sm text-muted-foreground">{story.title}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
          {story.points} pts
        </span>
      </div>
      {story.milestone && (
        <div className="mt-2 text-xs text-muted-foreground">
          Milestone: {story.milestone}
        </div>
      )}
    </div>
  );
}
```

### Kanban Column Component

```typescript
interface KanbanColumnProps {
  title: string;
  stories: Story[];
  state: 'backlog' | 'todo' | 'in_progress' | 'done';
  limit?: number; // 1 for TODO and IN_PROGRESS
}

export function KanbanColumn({ title, stories, state, limit }: KanbanColumnProps) {
  const totalPoints = stories.reduce((sum, story) => sum + story.points, 0);

  return (
    <div className="flex flex-col rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold">{title}</h2>
        <div className="text-sm text-muted-foreground">
          {stories.length} stories • {totalPoints} points
          {limit && stories.length > limit && (
            <span className="text-red-500"> (⚠️ Exceeds limit of {limit})</span>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-2 p-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} state={state} />
        ))}
      </div>
    </div>
  );
}
```

### Statistics Panel

```typescript
interface StatsPanelProps {
  status: WorkflowStatus;
}

export function StatsPanel({ status }: StatsPanelProps) {
  const totalCompleted = status.done.length;
  const totalPoints = status.done.reduce((sum, story) => sum + story.points, 0);
  const inProgress = status.inProgress ? 1 : 0;
  const todo = status.todo ? 1 : 0;
  const backlog = status.backlog.length;

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
      <StatCard label="Backlog" value={backlog} color="gray" />
      <StatCard label="TODO" value={todo} color="blue" limit={1} />
      <StatCard label="In Progress" value={inProgress} color="yellow" limit={1} />
      <StatCard label="Done" value={totalCompleted} color="green" />
      <StatCard label="Points" value={totalPoints} color="purple" />
    </div>
  );
}
```

---

## Implementation Plan

### Step 1: Create State Machine API route (15 min)

```bash
mkdir -p app/api/state
touch app/api/state/route.ts
```

Create GET endpoint to load workflow status via State Machine.

### Step 2: Create Kanban page structure (20 min)

```bash
mkdir -p app/kanban
touch app/kanban/page.tsx
```

Basic page with loading/error states and state fetching.

### Step 3: Create Kanban components (45 min)

```bash
mkdir -p components/features/kanban
touch components/features/kanban/KanbanBoard.tsx
touch components/features/kanban/KanbanColumn.tsx
touch components/features/kanban/StoryCard.tsx
touch components/features/kanban/StatsPanel.tsx
```

Implement each component with proper TypeScript types.

### Step 4: Style and layout (20 min)

- Grid layout for columns (responsive: 1 col mobile, 2 cols tablet, 4 cols desktop)
- Card styling with proper spacing
- Color coding for different states
- Dark mode support

### Step 5: Add milestone grouping (15 min)

Group BACKLOG stories by milestone with collapsible sections.

### Step 6: Add statistics panel (10 min)

Display project velocity, completion rate, etc.

### Step 7: Testing and quality checks (10 min)

- Type-check, lint, format
- Production build verification
- Manual testing with different states

**Total**: ~135 minutes (~2.25 hours)

---

## Dependencies

**Requires**:

- ✅ [CORE-015] State Machine (lib/state/machine.ts) - DONE
- ✅ [CORE-011] Agent Loader (lib/agents/loader.ts) - DONE
- ✅ mam-workflow-status.md parsing logic - Available in State Machine

**Blocks**:

- [UI-004] Workflow execution UI (may want to integrate with Kanban)

---

## Testing Checklist

**Manual Testing**:

- [ ] Load Kanban page successfully
- [ ] Verify BACKLOG column shows all backlog stories
- [ ] Verify TODO column shows current TODO story (only 1)
- [ ] Verify IN_PROGRESS column shows current story (only 1)
- [ ] Verify DONE column shows all completed stories
- [ ] Verify story cards display correctly (ID, title, points)
- [ ] Verify milestone grouping in BACKLOG
- [ ] Verify statistics panel calculates correctly
- [ ] Test responsive layout (mobile, tablet, desktop)
- [ ] Test dark mode
- [ ] Test accessibility (keyboard navigation, screen readers)

**Quality Checks**:

```bash
npm run type-check  # TypeScript compilation
npm run lint        # ESLint
npm run format      # Prettier
npm run build       # Production build
```

---

## Definition of Done

- ✅ Kanban board page accessible at `/kanban`
- ✅ Four columns displaying stories from state machine
- ✅ Story cards showing ID, title, points
- ✅ Statistics panel with project metrics
- ✅ Milestone grouping in BACKLOG
- ✅ State validation indicators (1 in TODO, 1 in IN_PROGRESS)
- ✅ Responsive design works on all screen sizes
- ✅ Dark mode supported
- ✅ All quality checks pass
- ✅ Production build succeeds
- ✅ Story moved to DONE in workflow status

---

## Success Metrics

- Visual representation of MADACE workflow
- Easy tracking of project progress
- Clear indication of state machine rules (1 TODO, 1 IN_PROGRESS)
- Milestone grouping for better organization
- Real-time project statistics

---

## Future Enhancements (Not in v1)

- Drag-and-drop to transition stories between states
- Click to view full story details
- Filter by milestone or module
- Search stories
- Export workflow status as PDF/image
- Story timeline view
- Burndown chart

---

## Related Documentation

- [CORE-015](./story-CORE-015.md) - State Machine implementation
- [lib/state/machine.ts](../lib/state/machine.ts) - State Machine API
- [lib/state/types.ts](../lib/state/types.ts) - TypeScript types
- [docs/mam-workflow-status.md](./mam-workflow-status.md) - Source of truth

---

**Story Created By**: SM Agent (Scrum Master)
**Date Created**: 2025-10-22
**Estimated Time**: 2-2.5 hours

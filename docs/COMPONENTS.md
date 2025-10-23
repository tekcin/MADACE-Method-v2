# MADACE Component Documentation

**Version:** 2.0.0-alpha
**Last Updated:** 2025-10-22

This document provides comprehensive documentation for all React components in the MADACE v2.0 application.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Feature Components](#feature-components)
  - [Navigation](#navigation)
  - [Footer](#footer)
  - [Agent Components](#agent-components)
  - [Workflow Components](#workflow-components)
  - [Setup Wizard Components](#setup-wizard-components)
- [Page Components](#page-components)
- [Component Patterns](#component-patterns)
- [Styling Guidelines](#styling-guidelines)
- [Accessibility](#accessibility)

---

## Architecture Overview

### Component Structure

```
components/
├── features/          # Feature-specific components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── AgentCard.tsx
│   ├── AgentSelector.tsx
│   ├── AgentPersona.tsx
│   ├── WorkflowCard.tsx
│   ├── WorkflowExecutionPanel.tsx
│   └── setup/         # Setup wizard components
│       ├── StepIndicator.tsx
│       ├── ProjectInfoStep.tsx
│       ├── LLMConfigStep.tsx
│       ├── ModuleConfigStep.tsx
│       └── SummaryStep.tsx
└── ui/                # UI primitives (future: Shadcn/ui)
    └── index.ts
```

### Design Principles

1. **Composition over Inheritance** - Small, composable components
2. **Single Responsibility** - Each component has one clear purpose
3. **TypeScript First** - All components are fully typed
4. **Accessibility** - ARIA labels, keyboard navigation, semantic HTML
5. **Responsive** - Mobile-first design with Tailwind breakpoints
6. **Dark Mode** - Full dark mode support for all components

---

## Feature Components

### Navigation

**File:** `components/features/Navigation.tsx`

Main navigation component with responsive mobile menu.

#### Props

None (uses Next.js routing context internally)

#### Features

- Responsive navigation bar
- Mobile hamburger menu
- Active link highlighting
- 7 navigation items with icons
- Dark mode support
- Keyboard accessible

#### Usage

```tsx
import { Navigation } from '@/components/features';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
```

#### Navigation Items

| Label       | Route          | Icon               |
| ----------- | -------------- | ------------------ |
| Dashboard   | `/`            | HomeIcon           |
| Kanban      | `/kanban`      | ViewColumnsIcon    |
| Agents      | `/agents`      | UserGroupIcon      |
| Workflows   | `/workflows`   | RectangleStackIcon |
| Sync Status | `/sync-status` | ArrowPathIcon      |
| LLM Test    | `/llm-test`    | BeakerIcon         |
| Settings    | `/settings`    | Cog6ToothIcon      |

#### Styling

- Desktop: Horizontal navigation bar with bottom border indicators
- Mobile: Full-screen overlay menu with left border indicators
- Active state: Blue border (light mode) / White text (dark mode)

---

### Footer

**File:** `components/features/Footer.tsx`

Simple footer with branding and links.

#### Props

None

#### Features

- Copyright notice
- Version display
- Documentation link
- Dark mode support

#### Usage

```tsx
import { Footer } from '@/components/features';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

---

## Agent Components

### AgentCard

**File:** `components/features/AgentCard.tsx`

Display card for a single agent with selection support.

#### Props

```typescript
interface AgentCardProps {
  agent: Agent;
  selected?: boolean;
  onSelect?: (agent: Agent) => void;
  onClick?: (agent: Agent) => void;
}
```

#### Features

- Agent icon, name, title, module badge
- Selection indicator (checkmark)
- Hover effects
- Click and keyboard interaction
- Dark mode support

#### Usage

```tsx
<AgentCard
  agent={pmAgent}
  selected={selectedAgents.includes(pmAgent)}
  onSelect={handleSelect}
  onClick={handleAgentClick}
/>
```

#### Styling

- Card: White background with border (light mode), Gray background (dark mode)
- Selected: Blue border with checkmark icon
- Hover: Shadow and scale transform

---

### AgentSelector

**File:** `components/features/AgentSelector.tsx`

Grid of agent cards with selection modes.

#### Props

```typescript
interface AgentSelectorProps {
  mode?: 'single' | 'multi';
  initialSelection?: Agent[];
  onSelectionChange?: (agents: Agent[]) => void;
  onAgentClick?: (agent: Agent) => void;
  agents?: Agent[];
  showBulkActions?: boolean;
}
```

#### Features

- Single or multi-select modes
- Bulk actions (Select All, Clear All)
- Selection summary with badges
- Auto-fetch from API
- Loading and error states
- Responsive grid (1-4 columns)

#### Usage

```tsx
<AgentSelector
  mode="multi"
  onSelectionChange={(agents) => setSelected(agents)}
  showBulkActions={true}
/>
```

#### Grid Layout

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

---

### AgentPersona

**File:** `components/features/AgentPersona.tsx`

Detailed agent information display.

#### Props

```typescript
interface AgentPersonaProps {
  agent: Agent;
  onActionClick?: (action: string) => void;
}
```

#### Features

- Agent header with icon and title
- Identity and philosophy section
- Communication style
- Core principles list
- Critical actions with badges
- Available actions as clickable cards
- Expandable prompts
- Auto-loaded files list
- Dark mode support

#### Usage

```tsx
<AgentPersona agent={selectedAgent} onActionClick={(action) => console.log('Execute:', action)} />
```

#### Sections

1. **Header**: Icon, title, role, module badge, version
2. **About**: Identity and philosophy (expandable)
3. **Communication**: Communication style description
4. **Principles**: Checkmark list of core principles
5. **Critical Actions**: Warning badges for important actions
6. **Available Actions**: Clickable menu item cards
7. **Prompts**: Expandable details with prompt content
8. **Files**: List of auto-loaded files

---

## Workflow Components

### WorkflowCard

**File:** `components/features/WorkflowCard.tsx`

Display card for a single workflow.

#### Props

```typescript
interface WorkflowCardProps {
  workflow: WorkflowCardData;
  onExecute?: (workflowName: string) => void;
  onClick?: (workflowName: string) => void;
}

interface WorkflowCardData {
  name: string;
  description: string;
  agent?: string;
  phase?: string;
  stepCount?: number;
}
```

#### Features

- Workflow name and description
- Agent badge
- Phase indicator
- Step count
- Execute button
- Hover effects

#### Usage

```tsx
<WorkflowCard
  workflow={planProjectWorkflow}
  onExecute={(name) => startWorkflow(name)}
  onClick={(name) => viewDetails(name)}
/>
```

---

### WorkflowExecutionPanel

**File:** `components/features/WorkflowExecutionPanel.tsx`

Step-by-step workflow execution interface.

#### Props

```typescript
interface WorkflowExecutionPanelProps {
  state: WorkflowExecutionState;
  onExecuteNext?: () => void;
  onReset?: () => void;
  loading?: boolean;
}

interface WorkflowExecutionState {
  workflowName: string;
  currentStep: number;
  totalSteps: number;
  steps: WorkflowExecutionStep[];
  variables: Record<string, any>;
  completed: boolean;
  startedAt: number;
}

interface WorkflowExecutionStep {
  name: string;
  action: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  message?: string;
  error?: string;
}
```

#### Features

- Progress bar
- Step list with status icons
- Action type badges
- Variables display
- Execute next button
- Reset functionality
- Loading states
- Error display

#### Usage

```tsx
<WorkflowExecutionPanel
  state={executionState}
  onExecuteNext={executeNextStep}
  onReset={resetWorkflow}
  loading={isExecuting}
/>
```

#### Status Icons

- ⏳ **Pending**: Clock icon, gray color
- ▶️ **In Progress**: Play icon, blue color
- ✅ **Completed**: Check icon, green color
- ❌ **Failed**: X icon, red color

---

## Setup Wizard Components

### StepIndicator

**File:** `components/features/setup/StepIndicator.tsx`

Progress tracker for multi-step wizard.

#### Props

```typescript
interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}
```

#### Features

- Visual step progression
- Current step highlighting
- Completed step indicators
- Responsive layout

#### Usage

```tsx
<StepIndicator
  steps={['Project Info', 'LLM Config', 'Modules', 'Summary']}
  currentStep={currentStep}
/>
```

---

### ProjectInfoStep

**File:** `components/features/setup/ProjectInfoStep.tsx`

First step of setup wizard - project configuration.

#### Props

```typescript
interface ProjectInfoStepProps {
  data: {
    projectName: string;
    outputFolder: string;
    userName: string;
    language: string;
  };
  onChange: (field: string, value: string) => void;
}
```

#### Fields

- Project name (required)
- Output folder (required)
- User name (required)
- Communication language (required)

#### Usage

```tsx
<ProjectInfoStep data={projectInfo} onChange={(field, value) => updateConfig(field, value)} />
```

---

### LLMConfigStep

**File:** `components/features/setup/LLMConfigStep.tsx`

Second step - LLM provider configuration.

#### Props

```typescript
interface LLMConfigStepProps {
  data: {
    provider: string;
    apiKey: string;
    model: string;
  };
  onChange: (field: string, value: string) => void;
}
```

#### Features

- Provider selection cards (Gemini, Claude, OpenAI, Local)
- Provider descriptions
- API key input (masked)
- Model selection
- Provider-specific hints

#### Providers

1. **Gemini** - Google's Gemini AI (recommended for free tier)
2. **Claude** - Anthropic's Claude AI (best reasoning)
3. **OpenAI** - OpenAI's GPT models (popular)
4. **Local** - Local/Ollama models (privacy)

---

### ModuleConfigStep

**File:** `components/features/setup/ModuleConfigStep.tsx`

Third step - module enablement.

#### Props

```typescript
interface ModuleConfigStepProps {
  data: {
    mam: boolean;
    mab: boolean;
    cis: boolean;
  };
  onChange: (module: string, enabled: boolean) => void;
}
```

#### Modules

- **MAM** - MADACE Agile Method (required)
- **MAB** - MADACE Builder (optional)
- **CIS** - Creative Intelligence Suite (optional)

---

### SummaryStep

**File:** `components/features/setup/SummaryStep.tsx`

Fourth step - configuration review.

#### Props

```typescript
interface SummaryStepProps {
  config: SetupConfig;
}
```

#### Features

- Read-only configuration summary
- Masked API keys (last 4 characters visible)
- Module status indicators
- Organized by section

---

## Page Components

### Home Page (Dashboard)

**File:** `app/page.tsx`

Main dashboard with statistics and quick actions.

#### Features

- Hero section with branding
- Live statistics cards (4 metrics)
- Quick action cards (4 items)
- Feature highlights (3 cards)
- Getting started guide (4 steps)

#### Statistics

- Completed stories count
- Total points
- In progress count
- Backlog count

---

### Agents Page

**File:** `app/agents/page.tsx`

Agent selection and management.

#### Features

- AgentSelector component
- Selection mode toggle
- Agent detail navigation

---

### Agent Detail Page

**File:** `app/agents/[name]/page.tsx`

Detailed agent information view.

#### Features

- Dynamic routing
- AgentPersona component
- Breadcrumb navigation
- Loading and error states

---

### Workflows Page

**File:** `app/workflows/page.tsx`

Workflow listing and execution.

#### Features

- Workflow cards grid
- Execution panel
- Mock workflow data (demo)

---

### Kanban Page

**File:** `app/kanban/page.tsx`

Visual state machine board.

#### Features

- 4-column layout (BACKLOG, TODO, IN_PROGRESS, DONE)
- Statistics panel
- Story cards
- Milestone grouping
- State validation warnings

---

### Settings Page

**File:** `app/settings/page.tsx`

Configuration management.

#### Features

- Form validation
- Model dropdown
- Connection testing
- Keyboard shortcuts (Ctrl+S / Cmd+S)
- Unsaved changes warning

---

### Setup Wizard Page

**File:** `app/setup/page.tsx`

Multi-step setup wizard.

#### Features

- 4-step wizard
- Step validation
- Navigation controls
- Configuration persistence

---

### LLM Test Page

**File:** `app/llm-test/page.tsx`

LLM connection testing interface.

#### Features

- Provider selection
- Dynamic form fields
- Test prompt customization
- Success/error display
- Token usage statistics

---

### Sync Status Page

**File:** `app/sync-status/page.tsx`

Real-time sync service monitoring.

#### Features

- Service status indicator
- Connected clients list
- Client health monitoring
- Start/stop controls
- Auto-refresh (5 seconds)

---

## Component Patterns

### Server vs Client Components

**Server Components (Default):**

```tsx
// No 'use client' directive
export default async function ServerComponent() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}
```

**Client Components (Interactive):**

```tsx
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [state, setState] = useState(0);
  return <button onClick={() => setState((s) => s + 1)}>{state}</button>;
}
```

### Data Fetching

**Client-Side Fetching:**

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{data.title}</div>;
}
```

### Error Boundaries

```tsx
'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Loading States

```tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}
```

---

## Styling Guidelines

### Tailwind CSS Classes

**Layout:**

```tsx
<div className="container mx-auto max-w-7xl px-4 py-8">{/* Content */}</div>
```

**Cards:**

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
  {/* Card content */}
</div>
```

**Buttons:**

```tsx
<button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
  Click me
</button>
```

**Grid:**

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{/* Grid items */}</div>
```

### Dark Mode

All components support dark mode using Tailwind's `dark:` prefix:

```tsx
<div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{/* Content */}</div>
```

### Responsive Breakpoints

- `sm:` - 640px and up (tablet)
- `md:` - 768px and up (desktop)
- `lg:` - 1024px and up (large desktop)
- `xl:` - 1280px and up (extra large)

---

## Accessibility

### ARIA Labels

```tsx
<button aria-label="Close menu" onClick={closeMenu}>
  <XIcon className="h-6 w-6" />
</button>
```

### Keyboard Navigation

```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  {/* Content */}
</div>
```

### Semantic HTML

```tsx
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

<footer>
  <p>&copy; 2025</p>
</footer>
```

### Focus Management

```tsx
import { useRef, useEffect } from 'react';

export default function Dialog({ isOpen }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div>
      <button ref={closeButtonRef}>Close</button>
    </div>
  );
}
```

---

## Testing

### Component Testing (Future)

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentCard } from '@/components/features';

test('AgentCard renders correctly', () => {
  const agent = { name: 'pm', title: 'Product Manager' };
  render(<AgentCard agent={agent} />);

  expect(screen.getByText('Product Manager')).toBeInTheDocument();
});

test('AgentCard handles click', () => {
  const handleClick = jest.fn();
  const agent = { name: 'pm', title: 'Product Manager' };

  render(<AgentCard agent={agent} onClick={handleClick} />);
  fireEvent.click(screen.getByText('Product Manager'));

  expect(handleClick).toHaveBeenCalledWith(agent);
});
```

---

## Best Practices

1. **TypeScript Props** - Always define component prop types
2. **Error Boundaries** - Wrap components that might throw
3. **Loading States** - Show loading indicators for async operations
4. **Null Safety** - Check for null/undefined before rendering
5. **Memoization** - Use `useMemo` and `useCallback` for expensive operations
6. **Keys in Lists** - Always provide unique keys for list items
7. **Accessibility** - Include ARIA labels and keyboard navigation
8. **Dark Mode** - Support both light and dark themes
9. **Responsive Design** - Test on mobile, tablet, and desktop
10. **Code Splitting** - Use dynamic imports for large components

---

## Future Enhancements

- [ ] Add Storybook for component documentation
- [ ] Implement Shadcn/ui component library
- [ ] Add component unit tests with Jest
- [ ] Create visual regression tests
- [ ] Add component performance monitoring
- [ ] Implement component error boundaries
- [ ] Add component accessibility testing

---

**Last Updated:** 2025-10-22
**Version:** 2.0.0-alpha

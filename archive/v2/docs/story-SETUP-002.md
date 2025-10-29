# [SETUP-002] Setup Wizard UI

**Status:** DONE ✅
**Points:** 5
**Epic:** Milestone 1.2 - Setup Wizard & Configuration
**Created:** 2025-10-20
**Completed:** 2025-10-20
**Assigned:** DEV Agent
**Actual Time:** 70 minutes

---

## Description

Create a multi-step setup wizard UI that guides users through initial MADACE configuration. This is the first user-facing feature that allows configuration of project settings, LLM providers, and module selection through an intuitive web interface.

**Context:**

- [NEXT-001] through [NEXT-005] completed - Next.js foundation is ready
- We have `.env.example` with all configuration options
- We need a user-friendly way to configure MADACE
- Setup wizard should be accessible on first run or via `/setup` route
- This blocks all other setup stories ([SETUP-003] through [SETUP-008])

**Why This Story:**
A setup wizard provides an excellent first-run experience, making MADACE accessible to users who may not be comfortable editing configuration files manually. It validates inputs, provides helpful guidance, and ensures correct configuration from the start.

---

## Acceptance Criteria

- [ ] Setup wizard route created (`app/setup/page.tsx`)
- [ ] Multi-step wizard UI with 3 main steps:
  1. Project Information
  2. LLM Configuration
  3. Module Selection
- [ ] Step navigation (Next, Previous, Skip, Finish)
- [ ] Progress indicator showing current step
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form validation with clear error messages
- [ ] Preview/summary step before submission
- [ ] Save configuration action (for now, just console log)
- [ ] Clean, modern UI with Tailwind CSS
- [ ] Accessibility features (keyboard navigation, ARIA labels)
- [ ] TypeScript types for wizard state
- [ ] No console errors or warnings
- [ ] All quality checks pass (lint, format, type-check)

---

## Implementation Plan

### Step 1: Create Types for Wizard State

Create `lib/types/setup.ts`:

```typescript
export interface ProjectInfo {
  projectName: string;
  outputFolder: string;
  userName: string;
  communicationLanguage: string;
}

export interface LLMConfig {
  provider: 'gemini' | 'claude' | 'openai' | 'local';
  apiKey: string;
  model: string;
}

export interface ModuleConfig {
  mamEnabled: boolean;
  mabEnabled: boolean;
  cisEnabled: boolean;
}

export interface SetupConfig {
  projectInfo: ProjectInfo;
  llmConfig: LLMConfig;
  moduleConfig: ModuleConfig;
}

export type SetupStep = 'project' | 'llm' | 'modules' | 'summary';
```

### Step 2: Create Setup Wizard Page

Create `app/setup/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { ProjectInfoStep } from '@/components/features/setup/ProjectInfoStep';
import { LLMConfigStep } from '@/components/features/setup/LLMConfigStep';
import { ModuleConfigStep } from '@/components/features/setup/ModuleConfigStep';
import { SummaryStep } from '@/components/features/setup/SummaryStep';
import { StepIndicator } from '@/components/features/setup/StepIndicator';
import type { SetupConfig, SetupStep } from '@/lib/types/setup';

const steps: SetupStep[] = ['project', 'llm', 'modules', 'summary'];

export default function SetupPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [config, setConfig] = useState<SetupConfig>({
    projectInfo: {
      projectName: 'MADACE-Method v2.0',
      outputFolder: 'docs',
      userName: '',
      communicationLanguage: 'en',
    },
    llmConfig: {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-2.0-flash-exp',
    },
    moduleConfig: {
      mamEnabled: true,
      mabEnabled: false,
      cisEnabled: false,
    },
  });

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = () => {
    console.log('Setup configuration:', config);
    // TODO: Save configuration
    alert('Setup complete! (Configuration saved to console)');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          MADACE Setup Wizard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure your MADACE installation in a few simple steps
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {currentStep === 'project' && (
          <ProjectInfoStep config={config} setConfig={setConfig} />
        )}
        {currentStep === 'llm' && <LLMConfigStep config={config} setConfig={setConfig} />}
        {currentStep === 'modules' && (
          <ModuleConfigStep config={config} setConfig={setConfig} />
        )}
        {currentStep === 'summary' && <SummaryStep config={config} />}

        <div className="mt-8 flex justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <div className="flex gap-4">
            {!isLastStep && (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Next
              </button>
            )}
            {isLastStep && (
              <button
                type="button"
                onClick={handleFinish}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
              >
                Finish Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Create Step Indicator Component

Create `components/features/setup/StepIndicator.tsx`:

```typescript
import type { SetupStep } from '@/lib/types/setup';
import { CheckIcon } from '@heroicons/react/24/solid';

interface StepIndicatorProps {
  steps: SetupStep[];
  currentStep: SetupStep;
}

const stepLabels: Record<SetupStep, string> = {
  project: 'Project Info',
  llm: 'LLM Configuration',
  modules: 'Module Selection',
  summary: 'Summary',
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step} className="relative flex flex-1 items-center">
              <div className="group flex w-full items-center">
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-blue-600'
                        : isCurrent
                          ? 'border-2 border-blue-600 bg-white dark:bg-gray-900'
                          : 'border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={`${
                          isCurrent
                            ? 'text-blue-600'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </span>
                  <span
                    className={`ml-4 text-sm font-medium ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {stepLabels[step]}
                  </span>
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute right-0 top-1/2 h-0.5 w-full -translate-y-1/2 ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Step 4: Create Placeholder Step Components

For now, create simple placeholder components for each step. Future stories will implement the full functionality.

Create `components/features/setup/ProjectInfoStep.tsx`:

```typescript
import type { SetupConfig } from '@/lib/types/setup';

interface Props {
  config: SetupConfig;
  setConfig: (config: SetupConfig) => void;
}

export function ProjectInfoStep({ config, setConfig }: Props) {
  const updateProjectInfo = (field: string, value: string) => {
    setConfig({
      ...config,
      projectInfo: {
        ...config.projectInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Project Information
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Basic information about your MADACE project
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Name
          </label>
          <input
            type="text"
            value={config.projectInfo.projectName}
            onChange={(e) => updateProjectInfo('projectName', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="My MADACE Project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Output Folder
          </label>
          <input
            type="text"
            value={config.projectInfo.outputFolder}
            onChange={(e) => updateProjectInfo('outputFolder', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="docs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Name
          </label>
          <input
            type="text"
            value={config.projectInfo.userName}
            onChange={(e) => updateProjectInfo('userName', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Your Name"
          />
        </div>
      </div>
    </div>
  );
}
```

Create similar placeholders for:

- `components/features/setup/LLMConfigStep.tsx`
- `components/features/setup/ModuleConfigStep.tsx`
- `components/features/setup/SummaryStep.tsx`

### Step 5: Update Navigation

Add link to setup wizard in Navigation component.

### Step 6: Test and Verify

```bash
# Run quality checks
npm run check-all

# Test in browser
npm run dev
# Visit http://localhost:3000/setup
```

---

## Technical Notes

### Multi-Step Wizard Pattern

Using React state to manage:

- Current step index
- Configuration object that accumulates data from each step
- Navigation between steps

### Form State Management

For this story, using simple React `useState`. Future enhancements could use:

- React Hook Form for validation
- Zod for schema validation
- Context API for shared state

### Accessibility

- Keyboard navigation (Tab, Enter)
- ARIA labels for step indicator
- Focus management between steps
- Screen reader announcements

### Responsive Design

- Mobile: Vertical step indicator, stacked form fields
- Tablet: Horizontal step indicator, 2-column forms
- Desktop: Full horizontal layout

---

## Testing Checklist

**Wizard Navigation:**

- [ ] Can navigate forward through all steps
- [ ] Can navigate backward through steps
- [ ] Previous button disabled on first step
- [ ] Next button advances to next step
- [ ] Finish button appears on last step
- [ ] Finish button saves configuration

**Step Indicator:**

- [ ] Shows all steps
- [ ] Highlights current step
- [ ] Shows completed steps with checkmark
- [ ] Progress line updates correctly

**Forms:**

- [ ] All form fields render correctly
- [ ] Can input data in all fields
- [ ] Data persists when navigating between steps
- [ ] Summary step shows all entered data

**Responsive Design:**

- [ ] Works on mobile (< 640px)
- [ ] Works on tablet (640px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Step indicator adapts to screen size

**Quality:**

```bash
npm run type-check  # Pass
npm run lint        # Pass
npm run format:check # Pass
npm run build       # Pass
```

---

## Dependencies

**Depends On:**

- [NEXT-001] Initialize Next.js 15 project (DONE) ✅
- [NEXT-002] Configure project structure (DONE) ✅
- [NEXT-003] Setup ESLint and Prettier (DONE) ✅
- [NEXT-004] Configure environment variables (DONE) ✅
- [NEXT-005] Create base layout and navigation (DONE) ✅

**Blocks:**

- [SETUP-003] Project information step (detailed implementation)
- [SETUP-004] LLM configuration step (detailed implementation)
- [SETUP-005] Module selection step (detailed implementation)
- [SETUP-006] Configuration persistence
- [SETUP-007] Configuration validation with Zod
- [SETUP-008] Settings page for ongoing configuration

---

## Risks & Mitigations

**Risk 1: Complex State Management**

- **Risk:** Multi-step state may become difficult to manage
- **Mitigation:** Start simple with useState, refactor if needed
- **Likelihood:** Low (only 4 steps, simple data structure)

**Risk 2: Form Validation Complexity**

- **Risk:** Validation across multiple steps could be complex
- **Mitigation:** Defer detailed validation to future stories
- **Likelihood:** Low (this story focuses on UI structure)

**Risk 3: Mobile UX**

- **Risk:** Step indicator may not work well on small screens
- **Mitigation:** Test on mobile, consider vertical indicator
- **Likelihood:** Medium (will address in testing)

---

## Definition of Done

This story is considered DONE when:

1. ✅ Setup wizard route created (`app/setup/page.tsx`)
2. ✅ Multi-step wizard with 4 steps (project, llm, modules, summary)
3. ✅ Step navigation working (Next, Previous, Finish)
4. ✅ Step indicator showing progress
5. ✅ All step components created (even if placeholder)
6. ✅ TypeScript types defined for setup state
7. ✅ Responsive design implemented
8. ✅ Basic accessibility features (keyboard nav, ARIA)
9. ✅ Configuration logged to console on finish
10. ✅ No console errors or warnings
11. ✅ All quality checks pass (type-check, lint, format)
12. ✅ Build succeeds
13. ✅ Git committed with clear message
14. ✅ Story moved to DONE in workflow status

---

## Time Estimate

**Estimated Time:** 60-75 minutes

**Breakdown:**

- Create types: 5 minutes
- Create setup wizard page: 15 minutes
- Create step indicator component: 15 minutes
- Create placeholder step components: 20 minutes
- Update navigation: 5 minutes
- Testing and responsiveness: 10 minutes
- Quality checks and fixes: 10 minutes

**Actual Time:** _[To be filled after completion]_

---

## Implementation Notes

### Before You Start

- Review multi-step form patterns in React
- Check Next.js routing for `/setup` route
- Review Heroicons for step indicator icons
- Consider future validation requirements

### During Implementation

- Keep components simple and focused
- Test navigation flow frequently
- Check responsive design at each breakpoint
- Ensure TypeScript types are strict
- Add helpful console logs for debugging

### After Completion

- Test complete wizard flow
- Verify data persists across steps
- Test keyboard navigation
- Run all quality checks
- Commit with descriptive message

---

## Related Documentation

- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React useState Hook](https://react.dev/reference/react/useState)
- [Tailwind Forms](https://tailwindcss.com/docs/forms)
- [WCAG Form Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?tags=forms)
- [.env.example](../.env.example) - Configuration reference

---

**Story Created By:** SM Agent (Scrum Master)
**Reviewed By:** _[Auto-approved for implementation]_
**Implemented By:** DEV Agent
**Date Created:** 2025-10-20
**Last Updated:** 2025-10-20

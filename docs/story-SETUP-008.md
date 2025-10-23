# Story: SETUP-008 - Settings Page for Ongoing Configuration

**Story ID:** SETUP-008
**Title:** Settings page for ongoing configuration
**Type:** Feature
**Points:** 5
**Status:** Draft
**Created:** 2025-10-21
**Milestone:** 1.2 - Setup Wizard & Configuration

---

## User Story

**As a** user who has completed the initial setup
**I want** to view and edit my MADACE configuration
**So that** I can update settings without re-running the setup wizard

---

## Acceptance Criteria

1. ✅ **Settings Page Created**
   - Located at `/settings` (app/settings/page.tsx)
   - Loads existing configuration from GET /api/config
   - Displays all configuration fields in editable form
   - Responsive design with dark mode support

2. ✅ **Configuration Form**
   - Project information (name, output folder, user name, language)
   - LLM configuration (provider, API key, model)
   - Module toggles (MAM, MAB, CIS)
   - Pre-filled with current configuration values
   - Client-side validation before submit

3. ✅ **Save Functionality**
   - Calls POST /api/config with updated configuration
   - Shows loading state during save
   - Displays success message on save
   - Shows error message on failure
   - Updates displayed values after successful save

4. ✅ **Cancel/Reset**
   - Cancel button reverts changes to original values
   - Visual indication of unsaved changes
   - Confirmation dialog for unsaved changes on navigation

5. ✅ **Error Handling**
   - Shows error if configuration not found
   - Prompts user to run setup wizard
   - Displays validation errors clearly
   - Handles API errors gracefully

6. ✅ **UI/UX**
   - Clear section headings for each configuration group
   - Helpful tooltips/hints for each field
   - Consistent with setup wizard styling
   - Accessible (keyboard navigation, ARIA labels)

---

## Technical Design

### Settings Page: `app/settings/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Config } from '@/lib/config';

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Config | null>(null);
  const [originalConfig, setOriginalConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/config');
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 404) {
          // Configuration not found - redirect to setup
          router.push('/setup');
          return;
        }
        throw new Error(result.message || 'Failed to load configuration');
      }

      setConfig(result.config);
      setOriginalConfig(result.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Transform config to API format
      const payload = {
        project_name: config.project_name,
        output_folder: config.output_folder,
        user_name: config.user_name,
        communication_language: config.communication_language,
        llm: {
          provider: 'gemini', // TODO: Get from form
          apiKey: '', // TODO: Get from form
          model: 'gemini-2.0-flash-exp', // TODO: Get from form
        },
        modules: config.modules,
      };

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save configuration');
      }

      setSuccessMessage('Configuration saved successfully!');
      setOriginalConfig(config);

      // Reload configuration to get updated values
      await loadConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setConfig(originalConfig);
    setSuccessMessage(null);
    setError(null);
  };

  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  // Rest of component implementation...
}
```

### Layout Structure

```
Settings Page
├── Header
│   ├── Title: "MADACE Settings"
│   └── Description: "Manage your configuration"
│
├── Loading State (when loading)
│   └── Spinner + "Loading configuration..."
│
├── Error State (if config not found)
│   ├── Error message
│   └── Button: "Run Setup Wizard"
│
├── Configuration Form (when loaded)
│   ├── Section: Project Information
│   │   ├── Project Name (text input)
│   │   ├── Output Folder (text input)
│   │   ├── User Name (text input)
│   │   └── Language (select/text input)
│   │
│   ├── Section: LLM Configuration
│   │   ├── Provider (select: Gemini, Claude, OpenAI, Local)
│   │   ├── API Key (password input)
│   │   └── Model (text input)
│   │
│   ├── Section: Modules
│   │   ├── MAM (toggle)
│   │   ├── MAB (toggle)
│   │   └── CIS (toggle)
│   │
│   └── Actions
│       ├── Success Message (if saved)
│       ├── Error Message (if error)
│       ├── Save Button (primary, disabled when saving)
│       └── Cancel Button (secondary)
│
└── Footer
    └── Unsaved changes indicator (if has changes)
```

---

## Implementation Tasks

- [ ] Update `app/settings/page.tsx`
  - [ ] Add client component directive
  - [ ] Implement state management (config, loading, saving, error)
  - [ ] Add useEffect to load configuration on mount
  - [ ] Implement loadConfiguration function
  - [ ] Handle redirect to /setup if no config
- [ ] Create configuration form UI
  - [ ] Project information section
  - [ ] LLM configuration section (reuse components from setup wizard?)
  - [ ] Module toggles section
  - [ ] Form validation
- [ ] Implement save functionality
  - [ ] handleSave function
  - [ ] Transform Config to API payload
  - [ ] Call POST /api/config
  - [ ] Handle success/error responses
  - [ ] Update UI state after save
- [ ] Implement cancel functionality
  - [ ] handleCancel function
  - [ ] Reset form to original values
  - [ ] Clear messages
- [ ] Add unsaved changes tracking
  - [ ] Compare current vs original config
  - [ ] Show indicator when changes exist
  - [ ] (Optional) Warn on navigation with unsaved changes
- [ ] Styling and responsive design
  - [ ] Match setup wizard styling
  - [ ] Dark mode support
  - [ ] Mobile responsive
  - [ ] Accessibility
- [ ] Test settings page
  - [ ] Load existing configuration
  - [ ] Edit and save configuration
  - [ ] Cancel changes
  - [ ] Handle errors
- [ ] Run quality checks
  - [ ] TypeScript type checking
  - [ ] ESLint
  - [ ] Prettier
  - [ ] Build verification

---

## Dependencies

**Requires:**

- ✅ [SETUP-006] Configuration persistence (completed)
- ✅ [SETUP-007] Configuration validation (completed)
- ✅ GET /api/config endpoint (implemented)
- ✅ POST /api/config endpoint (implemented)
- ✅ Config type from lib/config (available)

**Blocks:**

- None (final story in Milestone 1.2)

---

## Testing Strategy

### Manual Testing

1. **First Visit (No Config)**
   - Visit `/settings` without running setup
   - Should redirect to `/setup`

2. **Load Existing Config**
   - Complete setup wizard first
   - Visit `/settings`
   - Should show all configuration values
   - All fields should be editable

3. **Edit and Save**
   - Change project name
   - Change module toggles
   - Click "Save"
   - Should show success message
   - Should update displayed values

4. **Cancel Changes**
   - Edit some fields
   - Click "Cancel"
   - Should revert to original values
   - Unsaved changes indicator should disappear

5. **Error Handling**
   - Enter invalid data (empty required field)
   - Try to save
   - Should show validation error
   - Should not submit to API

6. **API Errors**
   - Simulate API failure (disconnect network)
   - Try to save
   - Should show error message
   - Should not lose user's changes

---

## Definition of Done

- ✅ All acceptance criteria met
- ✅ Settings page loads existing configuration
- ✅ All fields are editable
- ✅ Save functionality works
- ✅ Cancel functionality works
- ✅ Error handling implemented
- ✅ Unsaved changes tracking works
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessible
- ✅ Quality checks pass (type-check, lint, format)
- ✅ Production build succeeds
- ✅ Manual testing completed
- ✅ Story documented in workflow status

---

## Notes

- Consider reusing components from setup wizard (ProjectInfoStep, LLMConfigStep, ModuleConfigStep)
- May need to refactor setup wizard components to be more reusable
- API payload transformation needed (Config → API format)
- Future enhancement: Add "Reset to Defaults" button
- Future enhancement: Import/export configuration
- Future enhancement: Unsaved changes dialog on navigation

---

## Component Reuse Strategy

**Option 1: Reuse Existing Components**

- Use ProjectInfoStep, LLMConfigStep, ModuleConfigStep from setup wizard
- Pros: Less code duplication
- Cons: May need refactoring to work outside wizard context

**Option 2: Create New Form Components**

- Build new form components specific to settings page
- Pros: More flexible, independent
- Cons: More code to write and maintain

**Recommendation:** Start with Option 2 (new components) for simplicity, refactor later if needed.

---

## Related Documentation

- [SETUP-002](./story-SETUP-002.md) - Setup wizard UI (reference for styling)
- [SETUP-006](./story-SETUP-006.md) - Configuration persistence (API endpoints)
- [SETUP-007](./story-SETUP-007.md) - Configuration validation (Config type)
- [lib/config/schema.ts](../lib/config/schema.ts) - Configuration types
- [app/api/config/route.ts](../app/api/config/route.ts) - Configuration API

# Story: SETUP-006 - Configuration Persistence

**Story ID:** SETUP-006
**Title:** Configuration persistence (config.yaml + .env)
**Type:** Feature
**Points:** 5
**Status:** Draft
**Created:** 2025-10-21
**Milestone:** 1.2 - Setup Wizard & Configuration

---

## User Story

**As a** user completing the setup wizard
**I want** my configuration to be saved to persistent storage
**So that** I can use the application without re-entering configuration on every restart

---

## Acceptance Criteria

1. ✅ **API Route Created**
   - `POST /api/config` saves configuration to file system
   - Validates configuration with Zod schema
   - Returns success/error response

2. ✅ **Configuration File Generated**
   - Saves to `madace-data/config/config.yaml`
   - Contains: project_name, output_folder, user_name, communication_language, modules
   - Proper YAML formatting
   - File permissions set correctly

3. ✅ **Environment File Generated**
   - Saves to `madace-data/config/.env`
   - Contains: LLM provider, API keys, model names
   - Secrets properly protected (file permissions)
   - Never committed to git

4. ✅ **Setup Wizard Integration**
   - "Finish" button calls `/api/config` API
   - Shows success/error feedback to user
   - Redirects to home page on success
   - Displays error message on failure

5. ✅ **Configuration Validation**
   - Zod schema validates all required fields
   - Returns clear error messages for invalid data
   - Prevents saving incomplete configuration

6. ✅ **File System Safety**
   - Creates `madace-data/config/` directory if not exists
   - Backs up existing config before overwriting
   - Atomic file writes (write to temp, then rename)
   - Proper error handling for file system errors

---

## Technical Design

### API Route: `app/api/config/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Zod schema for configuration
const ConfigSchema = z.object({
  project_name: z.string().min(1),
  output_folder: z.string().min(1),
  user_name: z.string().min(1),
  communication_language: z.string().min(1),
  llm: z.object({
    provider: z.enum(['gemini', 'claude', 'openai', 'local']),
    apiKey: z.string().optional(),
    model: z.string().min(1),
  }),
  modules: z.object({
    mam: z.object({ enabled: z.boolean() }),
    mab: z.object({ enabled: z.boolean() }),
    cis: z.object({ enabled: z.boolean() }),
  }),
});

export async function POST(request: NextRequest) {
  // 1. Parse and validate request body
  // 2. Create config directory if not exists
  // 3. Write config.yaml
  // 4. Write .env file
  // 5. Return success response
}
```

### Configuration Files

**madace-data/config/config.yaml:**

```yaml
project_name: 'My MADACE Project'
output_folder: 'docs'
user_name: 'John Doe'
communication_language: 'English'
madace_version: '2.0.0-alpha'
modules:
  mam:
    enabled: true
  mab:
    enabled: false
  cis:
    enabled: false
```

**madace-data/config/.env:**

```bash
# LLM Configuration
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash-exp

# Application Configuration
NODE_ENV=development
```

### Setup Wizard Update: `app/setup/page.tsx`

```typescript
const handleFinish = async () => {
  const config = {
    project_name: projectInfo.projectName,
    output_folder: projectInfo.outputFolder,
    user_name: projectInfo.userName,
    communication_language: projectInfo.language,
    llm: llmConfig,
    modules: moduleConfig,
  };

  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (response.ok) {
      // Show success message
      // Redirect to home
      router.push('/');
    } else {
      // Show error message
      const error = await response.json();
      setError(error.message);
    }
  } catch (error) {
    setError('Failed to save configuration');
  }
};
```

---

## Implementation Tasks

- [ ] Create `app/api/config/route.ts`
- [ ] Implement Zod validation schema
- [ ] Implement `POST` handler
  - [ ] Validate request body
  - [ ] Create config directory
  - [ ] Write config.yaml (with backup)
  - [ ] Write .env file (with proper permissions)
  - [ ] Handle errors gracefully
- [ ] Update `app/setup/page.tsx`
  - [ ] Add `handleFinish` function
  - [ ] Call `/api/config` API
  - [ ] Show success/error feedback
  - [ ] Add redirect on success
- [ ] Test configuration persistence
  - [ ] Verify config.yaml format
  - [ ] Verify .env format
  - [ ] Verify file permissions
  - [ ] Test error cases
- [ ] Run quality checks
  - [ ] TypeScript type checking
  - [ ] ESLint
  - [ ] Prettier
  - [ ] Build verification

---

## Dependencies

**Requires:**

- ✅ [SETUP-002] Setup wizard UI (completed)
- ✅ TypeScript types for configuration (in `lib/types/setup.ts`)

**Blocks:**

- [SETUP-007] Configuration validation with Zod
- [SETUP-008] Settings page for ongoing configuration
- [CORE-016] Configuration Manager

---

## Testing Strategy

### Manual Testing

1. **Happy Path:**
   - Complete setup wizard with valid data
   - Click "Finish"
   - Verify `madace-data/config/config.yaml` created
   - Verify `madace-data/config/.env` created
   - Verify redirection to home page

2. **Error Cases:**
   - Submit with missing required fields → Should show validation error
   - Submit with invalid data → Should show validation error
   - Test file system errors (permissions) → Should show error message

3. **Edge Cases:**
   - Run setup twice → Should backup existing config
   - Special characters in project name → Should handle properly
   - Long API keys → Should handle properly

### File Verification

```bash
# Verify config.yaml
cat madace-data/config/config.yaml

# Verify .env (check permissions)
ls -la madace-data/config/.env

# Verify contents (without exposing secrets)
head -n 3 madace-data/config/.env
```

---

## Definition of Done

- ✅ All acceptance criteria met
- ✅ API route implemented and tested
- ✅ Setup wizard integrated with API
- ✅ Configuration files generated correctly
- ✅ File permissions set properly
- ✅ Error handling implemented
- ✅ Quality checks pass (type-check, lint, format)
- ✅ Production build succeeds
- ✅ Manual testing completed
- ✅ Story documented in workflow status

---

## Notes

- Use `js-yaml` library for YAML generation (already installed)
- Use Node.js `fs.promises` for async file operations
- Use atomic writes (temp file + rename) to prevent corruption
- Store config in `madace-data/config/` (Docker volume mount point)
- Ensure `.env` is git-ignored (already configured)
- Consider backup strategy for existing configs

---

## Related Documentation

- [PRD.md](../PRD.md) - Section 5.1 "Configuration Management"
- [CLAUDE.md](../CLAUDE.md) - "Key Configuration" section
- [.env.example](../.env.example) - Environment variable template
- [lib/types/setup.ts](../lib/types/setup.ts) - Configuration types

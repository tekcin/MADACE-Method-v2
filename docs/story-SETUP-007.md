# Story: SETUP-007 - Configuration Validation with Zod

**Story ID:** SETUP-007
**Title:** Configuration validation with Zod
**Type:** Enhancement
**Points:** 3
**Status:** Draft
**Created:** 2025-10-21
**Milestone:** 1.2 - Setup Wizard & Configuration

---

## User Story

**As a** developer or system administrator
**I want** configuration files to be validated on load
**So that** I can catch configuration errors early and get clear error messages

---

## Acceptance Criteria

1. ✅ **Zod Schema Module Created**
   - `lib/config/schema.ts` defines all configuration schemas
   - Matches the structure saved in `config.yaml`
   - Validates all required fields
   - Provides default values where appropriate

2. ✅ **Configuration Loader Implemented**
   - `lib/config/loader.ts` loads and validates configuration
   - Reads from `madace-data/config/config.yaml`
   - Validates with Zod schema
   - Returns typed configuration object
   - Throws descriptive errors on validation failure

3. ✅ **Error Messages**
   - Clear, actionable error messages for validation failures
   - Shows which field failed and why
   - Includes path to configuration file in error
   - Suggests fixes for common issues

4. ✅ **GET /api/config Enhanced**
   - Uses new configuration loader
   - Returns validated configuration
   - Handles missing/invalid config gracefully

5. ✅ **Type Safety**
   - Exported TypeScript types from Zod schema
   - Used throughout application
   - No `any` types for configuration

6. ✅ **Testing**
   - Manual testing with valid configuration
   - Manual testing with invalid configuration
   - Verify error messages are helpful

---

## Technical Design

### Configuration Schema: `lib/config/schema.ts`

```typescript
import { z } from 'zod';

// Module configuration schema
const ModuleConfigSchema = z.object({
  enabled: z.boolean().default(false),
});

// Main configuration schema
export const ConfigSchema = z.object({
  project_name: z.string().min(1, 'Project name is required'),
  output_folder: z.string().min(1, 'Output folder is required'),
  user_name: z.string().min(1, 'User name is required'),
  communication_language: z.string().min(1, 'Communication language is required'),
  madace_version: z.string().optional(),
  installed_at: z.string().optional(),
  modules: z.object({
    mam: ModuleConfigSchema,
    mab: ModuleConfigSchema,
    cis: ModuleConfigSchema,
  }),
});

// Export TypeScript type
export type Config = z.infer<typeof ConfigSchema>;
```

### Configuration Loader: `lib/config/loader.ts`

```typescript
import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ConfigSchema, type Config } from './schema';

export class ConfigLoadError extends Error {
  constructor(
    message: string,
    public readonly configPath: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ConfigLoadError';
  }
}

export async function loadConfig(): Promise<Config> {
  const configDir = process.env.CONFIG_DIR || path.join(process.cwd(), 'madace-data', 'config');
  const configPath = path.join(configDir, 'config.yaml');

  try {
    // Check if config file exists
    await fs.access(configPath);
  } catch {
    throw new ConfigLoadError(
      'Configuration file not found. Please run the setup wizard.',
      configPath
    );
  }

  try {
    // Read config file
    const configContent = await fs.readFile(configPath, 'utf-8');

    // Parse YAML
    const rawConfig = yaml.load(configContent);

    // Validate with Zod
    const validatedConfig = ConfigSchema.parse(rawConfig);

    return validatedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new ConfigLoadError(
        `Configuration validation failed:\n${errorMessages}`,
        configPath,
        error
      );
    }

    throw new ConfigLoadError(
      `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      configPath,
      error
    );
  }
}
```

### Updated API Route: `app/api/config/route.ts`

```typescript
// Update GET handler to use new loader
import { loadConfig } from '@/lib/config/loader';

export async function GET() {
  try {
    const config = await loadConfig();

    return NextResponse.json(
      {
        success: true,
        config,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ConfigLoadError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration error',
          message: error.message,
          path: error.configPath,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Implementation Tasks

- [ ] Create `lib/config/schema.ts`
  - [ ] Define ModuleConfigSchema
  - [ ] Define ConfigSchema
  - [ ] Export TypeScript type
- [ ] Create `lib/config/loader.ts`
  - [ ] Implement ConfigLoadError class
  - [ ] Implement loadConfig() function
  - [ ] Handle file not found
  - [ ] Handle YAML parse errors
  - [ ] Handle validation errors
  - [ ] Format error messages nicely
- [ ] Update `lib/config/index.ts`
  - [ ] Export schema and loader
- [ ] Update `app/api/config/route.ts`
  - [ ] Use loadConfig() in GET handler
  - [ ] Handle ConfigLoadError
  - [ ] Return proper error responses
- [ ] Test configuration validation
  - [ ] Valid configuration loads successfully
  - [ ] Missing required fields show errors
  - [ ] Invalid YAML shows errors
  - [ ] Missing file shows helpful error
- [ ] Run quality checks
  - [ ] TypeScript type checking
  - [ ] ESLint
  - [ ] Prettier
  - [ ] Build verification

---

## Dependencies

**Requires:**

- ✅ [SETUP-006] Configuration persistence (completed)
- ✅ Zod library (already installed)
- ✅ js-yaml library (already installed)

**Blocks:**

- [SETUP-008] Settings page (will use config loader)
- [CORE-016] Configuration Manager (will extend this)

---

## Testing Strategy

### Valid Configuration Test

```bash
# Create valid config
cat > madace-data/config/config.yaml << 'EOF'
project_name: "Test Project"
output_folder: "docs"
user_name: "Test User"
communication_language: "en"
madace_version: "2.0.0-alpha"
modules:
  mam:
    enabled: true
  mab:
    enabled: false
  cis:
    enabled: false
EOF

# Test loading
curl http://localhost:3001/api/config
# Should return: {"success":true,"config":{...}}
```

### Invalid Configuration Test

```bash
# Missing required field
cat > madace-data/config/config.yaml << 'EOF'
project_name: "Test Project"
# Missing output_folder
user_name: "Test User"
modules:
  mam:
    enabled: true
EOF

# Test loading
curl http://localhost:3001/api/config
# Should return validation error with clear message
```

### Missing Configuration Test

```bash
# Remove config file
rm madace-data/config/config.yaml

# Test loading
curl http://localhost:3001/api/config
# Should return: "Configuration file not found. Please run the setup wizard."
```

---

## Definition of Done

- ✅ All acceptance criteria met
- ✅ Configuration schema created with Zod
- ✅ Configuration loader implemented
- ✅ Error handling for all cases
- ✅ GET /api/config uses new loader
- ✅ Type safety throughout
- ✅ Quality checks pass (type-check, lint, format)
- ✅ Production build succeeds
- ✅ Manual testing completed
- ✅ Story documented in workflow status

---

## Notes

- This story focuses on **reading** configuration, not writing it
- Writing is already handled by SETUP-006 (POST /api/config)
- The loader can be reused by other parts of the application
- Consider caching configuration in memory (future optimization)
- Error messages should guide users to fix issues

---

## Example Error Messages

**Good Error Messages:**

```
Configuration validation failed:
  - output_folder: Output folder is required
  - modules.mam.enabled: Expected boolean, received string
```

**Bad Error Messages:**

```
Invalid config
Validation error
```

---

## Related Documentation

- [SETUP-006](./story-SETUP-006.md) - Configuration persistence
- [lib/agents/schema.ts](../lib/agents/schema.ts) - Similar Zod validation pattern
- [Zod Documentation](https://zod.dev/) - Schema validation library

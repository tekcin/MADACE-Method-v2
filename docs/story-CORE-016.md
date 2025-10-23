# CORE-016: Configuration Manager (lib/config/manager.ts)

**Story ID**: CORE-016  
**Title**: Configuration Manager (lib/config/manager.ts)  
**Points**: 5  
**Status**: Draft  
**Created**: 2025-10-22  
**Epic**: Core TypeScript Modules

## User Story

As a **MADACE developer**, I want a **robust configuration manager** so that the framework can **automatically detect, validate, and manage project configuration** across different environments and platforms.

## Acceptance Criteria

- [ ] **ConfigManager class** with auto-detection of `./madace/core/config.yaml`
- [ ] **Cross-platform path resolution** supporting macOS, Linux, and Windows
- [ ] **Zod schema validation** for all configuration fields
- [ ] **Installation integrity checks** to verify MADACE installation
- [ ] **State persistence** for configuration changes
- [ ] **API integration** with existing `GET/POST /api/config` routes
- [ ] **Error handling** with custom `ConfigError` and detailed messages
- [ ] **Type safety** with TypeScript interfaces throughout
- [ ] **Factory pattern** for creating config manager instances
- [ ] **All unit tests pass** with 100% code coverage
- [ ] **Integration tests** verify API route functionality
- [ ] **Documentation** with JSDoc comments on all public methods
- [ ] **Production build succeeds** without errors or warnings

## Technical Notes

### Core Requirements

The configuration manager should provide:

1. **Auto-detection**: Automatically find `config.yaml` in standard locations
2. **Cross-platform**: Handle path differences between operating systems
3. **Validation**: Use Zod schemas to validate configuration integrity
4. **Persistence**: Save configuration changes with atomic operations
5. **Integration**: Work seamlessly with existing API infrastructure

### File Structure

```
lib/config/
├── manager.ts           # Main ConfigManager class
├── loader.ts            # Already exists - will integrate
├── schema.ts            # Already exists - will enhance
├── index.ts             # Public exports
└── types.ts             # Configuration types
```

### Configuration Locations (Priority Order)

1. `./madace/core/config.yaml` (standard MADACE installation)
2. `./madace/config.yaml` (simplified structure)
3. `./config.yaml` (project root fallback)
4. Environment variable override (`MADACE_CONFIG_PATH`)

### Integration Points

- **Existing code**: `lib/config/loader.ts`, `lib/config/schema.ts`
- **API routes**: `app/api/config/route.ts` (GET and POST)
- **Setup wizard**: Uses config for initial configuration
- **State machine**: Tracks configuration changes
- **Template engine**: Uses config variables

## Dependencies

- [SETUP-006] ✅ Configuration persistence (config.yaml + .env)
- [SETUP-007] ✅ Configuration validation with Zod
- [CORE-011] ✅ Agent Loader with Zod validation

## Testing Requirements

### Unit Tests

```typescript
// lib/config/manager.test.ts
describe('ConfigManager', () => {
  describe('loadConfig', () => {
    // Test auto-detection of config files
    // Test YAML parsing
    // Test Zod validation
  });

  describe('saveConfig', () => {
    // Test atomic file operations
    // Test error handling
    // Test permission handling
  });

  describe('validateConfig', () => {
    // Test all schema validations
    // Test error messages
    // Test partial config handling
  });
});
```

### Integration Tests

```typescript
// app/api/config/route.test.ts
describe('Config API', () => {
  describe('GET /api/config', () => {
    // Test config loading via API
    // Test error responses
  });

  describe('POST /api/config', () => {
    // Test config saving via API
    // Test validation errors
  });
});
```

## Implementation Details

### ConfigManager Class Interface

```typescript
export class ConfigManager {
  private configPath?: string;
  private config?: MADACEConfig;

  // Auto-detect and load configuration
  async loadConfig(): Promise<MADACEConfig>;

  // Save configuration with validation
  async saveConfig(config: MADACEConfig): Promise<void>;

  // Validate configuration against schema
  validateConfig(config: unknown): MADACEConfig;

  // Check if configuration exists
  configExists(): boolean;

  // Get configuration file path
  getConfigPath(): string | undefined;

  // Reset to default configuration
  resetConfig(): Promise<void>;

  // Watch for configuration changes
  watchConfig(callback: (config: MADACEConfig) => void): void;
}

// Factory function
export function createConfigManager(): ConfigManager;
```

### Error Handling

```typescript
export class ConfigError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string
  );
}

// Error codes
export const CONFIG_ERROR_CODES = {
  NOT_FOUND: 'CONFIG_NOT_FOUND',
  INVALID_FORMAT: 'CONFIG_INVALID_FORMAT',
  VALIDATION_FAILED: 'CONFIG_VALIDATION_FAILED',
  PERMISSION_DENIED: 'CONFIG_PERMISSION_DENIED',
  SAVE_FAILED: 'CONFIG_SAVE_FAILED',
} as const;
```

### Schema Integration

Enhance existing schema with:

```typescript
export const ConfigManagerSchema = z.object({
  // Core project settings
  project_name: z.string().min(1),
  output_folder: z.string(),
  user_name: z.string(),
  communication_language: z.string(),

  // Module configuration
  modules: z.object({
    mam: z.object({ enabled: z.boolean() }),
    mab: z.object({ enabled: z.boolean() }),
    cis: z.object({ enabled: z.boolean() }),
  }),

  // LLM configuration
  llm: z.object({
    provider: z.enum(['gemini', 'claude', 'openai', 'local']),
    apiKey: z.string().min(1),
    model: z.string().min(1),
  }),

  // Advanced settings
  advanced: z
    .object({
      config_path: z.string().optional(),
      auto_save: z.boolean().default(true),
      backup_count: z.number().min(0).max(10).default(3),
    })
    .optional(),
});
```

## Implementation Steps

1. **Create ConfigManager class** in `lib/config/manager.ts`
2. **Implement auto-detection** logic for config file locations
3. **Add cross-platform path handling** with `path.resolve()`
4. **Integrate with existing loader and schema**
5. **Add save functionality** with atomic operations
6. **Implement validation** using existing Zod schemas
7. **Create factory function** and error classes
8. **Update API routes** to use new ConfigManager
9. **Add comprehensive tests** and documentation
10. **Verify integration** with setup wizard and other components

## Definition of Done

- [ ] All acceptance criteria completed
- [ ] Code review passes all quality checks (ESLint, Prettier, TypeScript)
- [ ] Unit tests achieve 100% code coverage
- [ ] Integration tests pass with API routes
- [ ] Documentation includes JSDoc comments
- [ ] Production build succeeds without warnings
- [ ] Manual testing verifies config loading/saving
- [ ] Story moved to DONE in workflow status
- [ ] Next story (LLM-014) auto-moved to TODO

## Risk Mitigation

### Technical Risks

- **File permissions**: Implement proper permission checks and fallbacks
- **Path resolution**: Use Node.js path module for cross-platform compatibility
- **Concurrent access**: Implement file locking for save operations

### Integration Risks

- **API compatibility**: Ensure backward compatibility with existing routes
- **Setup wizard**: Test integration with configuration persistence
- **State machine**: Verify state transitions work correctly

## Success Metrics

- ✅ Configuration loading time < 100ms (cold start)
- ✅ Configuration saving completes in < 50ms
- ✅ Zero configuration errors in production
- ✅ All tests pass (unit + integration)
- ✅ Production build succeeds
- ✅ Manual testing validates full workflow

---

**This story implements the core configuration management system needed for MADACE-Method v2.0 to properly manage project state and settings across different platforms and deployment scenarios.**

/**
 * Template Engine Module
 *
 * Public API for template rendering with Handlebars.
 *
 * @example
 * ```typescript
 * import { createTemplateEngine } from '@/lib/templates';
 *
 * const engine = createTemplateEngine();
 * const result = engine.render('Hello {{name}}!', { name: 'World' });
 * console.log(result); // "Hello World!"
 * ```
 */

// Core engine
export {
  TemplateEngine,
  TemplateError,
  createTemplateEngine,
  getTemplateEngine,
  resetTemplateEngine,
} from './engine';

// Types
export type {
  TemplateContext,
  CompiledTemplate,
  ValidationResult,
  TemplateValidationError,
  TemplateEngineOptions,
  TemplateFileMetadata,
  HelperFunction,
  CacheEntry,
  RenderStats,
} from './types';

// Helpers
export { registerStandardHelpers, getRegisteredHelpers, isHelperRegistered } from './helpers';

// Legacy pattern support
export { convertLegacyPatterns, hasLegacyPatterns, extractLegacyVariables } from './legacy';
export type { LegacyPatternType, LegacyPatternDetection } from './legacy';

// Cache
export { TemplateCache, hashTemplate, filePathKey } from './cache';

// Validation schemas
export {
  TemplateContextSchema,
  StrictTemplateContextSchema,
  TemplateEngineOptionsSchema,
  TemplateFileMetadataSchema,
  ValidationResultSchema,
  validateTemplateContext,
  safeValidateTemplateContext,
} from './schema';

// System prompts (for LLM integration)
export {
  getBaseSystemPrompt,
  getCodeGenerationPrompt,
  getAgentSystemPrompt,
  getWorkflowSystemPrompt,
  getSystemPrompt,
  TECH_STACK_REMINDER,
} from './llm-system-prompt';

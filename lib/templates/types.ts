/**
 * Template Engine Types
 *
 * TypeScript interfaces for template rendering system.
 */

/**
 * Template rendering context
 *
 * Contains all variables available during template rendering.
 */
export interface TemplateContext {
  // Standard MADACE variables (from config.yaml)
  project_name?: string;
  output_folder?: string;
  user_name?: string;
  communication_language?: string;

  // Runtime variables
  [key: string]: unknown;
}

/**
 * Compiled template ready for rendering
 */
export interface CompiledTemplate {
  /**
   * Render the compiled template with a context
   */
  render(context: TemplateContext): string;

  /**
   * Original template source
   */
  source: string;

  /**
   * Compilation timestamp
   */
  compiledAt: Date;
}

/**
 * Template validation error
 */
export interface TemplateValidationError {
  /**
   * Error message
   */
  message: string;

  /**
   * Line number where error occurred (1-indexed)
   */
  line?: number;

  /**
   * Column number where error occurred (1-indexed)
   */
  column?: number;

  /**
   * Error type
   */
  type: 'syntax' | 'undefined-variable' | 'helper-error' | 'other';
}

/**
 * Template validation result
 */
export interface ValidationResult {
  /**
   * Whether template is valid
   */
  valid: boolean;

  /**
   * Validation errors (empty if valid)
   */
  errors: TemplateValidationError[];

  /**
   * Warnings (non-fatal issues)
   */
  warnings?: TemplateValidationError[];
}

/**
 * Handlebars helper function
 */
export type HelperFunction = (...args: unknown[]) => string | number | boolean;

/**
 * Template engine options
 */
export interface TemplateEngineOptions {
  /**
   * Strict mode: throw error on missing variables
   * @default false
   */
  strict?: boolean;

  /**
   * Enable legacy pattern conversion
   * @default true
   */
  enableLegacyPatterns?: boolean;

  /**
   * Cache compiled templates
   * @default true
   */
  enableCache?: boolean;

  /**
   * Maximum cache size (number of templates)
   * @default 100
   */
  maxCacheSize?: number;

  /**
   * Custom Handlebars options
   */
  handlebarsOptions?: {
    noEscape?: boolean;
    strict?: boolean;
    data?: boolean;
  };
}

/**
 * Template file metadata
 */
export interface TemplateFileMetadata {
  /**
   * Absolute file path
   */
  path: string;

  /**
   * File modification time (for cache invalidation)
   */
  mtime: Date;

  /**
   * File size in bytes
   */
  size: number;
}

/**
 * Cache entry for compiled templates
 */
export interface CacheEntry {
  /**
   * Compiled template
   */
  template: CompiledTemplate;

  /**
   * File metadata (if loaded from file)
   */
  metadata?: TemplateFileMetadata;

  /**
   * Last access timestamp (for LRU eviction)
   */
  lastAccessed: Date;

  /**
   * Access count (for statistics)
   */
  accessCount: number;
}

/**
 * Template rendering statistics
 */
export interface RenderStats {
  /**
   * Total renders
   */
  totalRenders: number;

  /**
   * Cache hits
   */
  cacheHits: number;

  /**
   * Cache misses
   */
  cacheMisses: number;

  /**
   * Average render time (ms)
   */
  avgRenderTime: number;

  /**
   * Cache hit rate (0-1)
   */
  cacheHitRate: number;
}

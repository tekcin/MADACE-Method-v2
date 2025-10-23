/**
 * Template Engine
 *
 * Handlebars-based template rendering with caching and validation.
 */

import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import type {
  TemplateContext,
  CompiledTemplate,
  ValidationResult,
  TemplateEngineOptions,
  TemplateFileMetadata,
  HelperFunction,
  RenderStats,
} from './types';
import { TemplateCache, hashTemplate, filePathKey } from './cache';
import { convertLegacyPatterns } from './legacy';
import { registerStandardHelpers } from './helpers';

/**
 * Custom error class for template errors
 */
export class TemplateError extends Error {
  constructor(
    message: string,
    public readonly template?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'TemplateError';
  }
}

/**
 * Template Engine - Singleton class for rendering Handlebars templates
 */
export class TemplateEngine {
  private cache: TemplateCache;
  private options: Required<TemplateEngineOptions>;
  private stats: {
    renders: number;
    cacheHits: number;
    cacheMisses: number;
    totalRenderTime: number;
  } = {
    renders: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalRenderTime: 0,
  };

  constructor(options: TemplateEngineOptions = {}) {
    this.options = {
      strict: options.strict ?? false,
      enableLegacyPatterns: options.enableLegacyPatterns ?? true,
      enableCache: options.enableCache ?? true,
      maxCacheSize: options.maxCacheSize ?? 100,
      handlebarsOptions: options.handlebarsOptions ?? {
        noEscape: false,
        strict: false,
        data: true,
      },
    };

    this.cache = new TemplateCache(this.options.maxCacheSize);

    // Register standard helpers once during initialization
    registerStandardHelpers();
  }

  /**
   * Render inline template
   *
   * @param template - Template string
   * @param context - Template context with variables
   * @returns Rendered string
   */
  render(template: string, context: TemplateContext = {}): string {
    const startTime = Date.now();

    try {
      // Convert legacy patterns if enabled
      let processedTemplate = template;
      if (this.options.enableLegacyPatterns) {
        const { template: converted } = convertLegacyPatterns(template, true);
        processedTemplate = converted;
      }

      // Try cache first
      let compiled: CompiledTemplate | undefined;
      const cacheKey = hashTemplate(processedTemplate);

      if (this.options.enableCache) {
        compiled = this.cache.get(cacheKey);
        if (compiled) {
          this.stats.cacheHits++;
        }
      }

      // Compile if not cached
      if (!compiled) {
        this.stats.cacheMisses++;
        compiled = this.compile(processedTemplate);

        // Cache the compiled template
        if (this.options.enableCache) {
          this.cache.set(cacheKey, compiled);
        }
      }

      // Render the template
      const result = compiled.render(context);

      // Update stats
      this.stats.renders++;
      this.stats.totalRenderTime += Date.now() - startTime;

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new TemplateError(`Failed to render template: ${error.message}`, template, error);
      }
      throw error;
    }
  }

  /**
   * Render template from file
   *
   * @param filePath - Absolute path to template file
   * @param context - Template context with variables
   * @returns Rendered string
   */
  async renderFile(filePath: string, context: TemplateContext = {}): Promise<string> {
    const startTime = Date.now();

    try {
      // Resolve absolute path
      const absolutePath = path.resolve(filePath);

      // Get file metadata
      const stats = await fs.stat(absolutePath);
      const metadata: TemplateFileMetadata = {
        path: absolutePath,
        mtime: stats.mtime,
        size: stats.size,
      };

      // Try cache first
      let compiled: CompiledTemplate | undefined;
      const cacheKey = filePathKey(absolutePath);

      if (this.options.enableCache) {
        compiled = this.cache.get(cacheKey, metadata);
        if (compiled) {
          this.stats.cacheHits++;
        }
      }

      // Load and compile if not cached
      if (!compiled) {
        this.stats.cacheMisses++;

        // Read file
        const templateContent = await fs.readFile(absolutePath, 'utf-8');

        // Convert legacy patterns if enabled
        let processedTemplate = templateContent;
        if (this.options.enableLegacyPatterns) {
          const { template: converted } = convertLegacyPatterns(templateContent, true);
          processedTemplate = converted;
        }

        // Compile template
        compiled = this.compile(processedTemplate);

        // Cache with metadata
        if (this.options.enableCache) {
          this.cache.set(cacheKey, compiled, metadata);
        }
      }

      // Render the template
      const result = compiled.render(context);

      // Update stats
      this.stats.renders++;
      this.stats.totalRenderTime += Date.now() - startTime;

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new TemplateError(
          `Failed to render file "${filePath}": ${error.message}`,
          undefined,
          error
        );
      }
      throw error;
    }
  }

  /**
   * Compile template to reusable function
   *
   * @param template - Template string
   * @returns Compiled template
   */
  compile(template: string): CompiledTemplate {
    try {
      const handlebarsTemplate = Handlebars.compile(template, this.options.handlebarsOptions);

      return {
        render: (context: TemplateContext): string => {
          try {
            return handlebarsTemplate(context);
          } catch (error) {
            if (this.options.strict) {
              throw error;
            }
            // In non-strict mode, return empty string on error
            console.warn('[TemplateEngine] Render error (non-strict mode):', error);
            return '';
          }
        },
        source: template,
        compiledAt: new Date(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new TemplateError(`Failed to compile template: ${error.message}`, template, error);
      }
      throw error;
    }
  }

  /**
   * Register custom helper
   *
   * @param name - Helper name
   * @param fn - Helper function
   */
  registerHelper(name: string, fn: HelperFunction): void {
    Handlebars.registerHelper(name, fn);
  }

  /**
   * Unregister helper
   *
   * @param name - Helper name
   */
  unregisterHelper(name: string): void {
    Handlebars.unregisterHelper(name);
  }

  /**
   * Validate template syntax
   *
   * @param template - Template string to validate
   * @returns Validation result
   */
  validateTemplate(template: string): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    try {
      // Try to compile the template
      Handlebars.compile(template, { strict: true });
    } catch (error) {
      if (error instanceof Error) {
        errors.push({
          message: error.message,
          type: 'syntax',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Set strict mode
   *
   * @param strict - Enable strict mode
   */
  setStrictMode(strict: boolean): void {
    this.options.strict = strict;
  }

  /**
   * Get current strict mode setting
   */
  isStrictMode(): boolean {
    return this.options.strict;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get rendering statistics
   */
  getRenderStats(): RenderStats {
    const totalAttempts = this.stats.cacheHits + this.stats.cacheMisses;
    return {
      totalRenders: this.stats.renders,
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      avgRenderTime: this.stats.renders > 0 ? this.stats.totalRenderTime / this.stats.renders : 0,
      cacheHitRate: totalAttempts > 0 ? this.stats.cacheHits / totalAttempts : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      renders: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalRenderTime: 0,
    };
  }
}

/**
 * Singleton instance
 */
let defaultEngine: TemplateEngine | null = null;

/**
 * Create or get default template engine instance
 *
 * @param options - Template engine options
 * @returns Template engine instance
 */
export function createTemplateEngine(options?: TemplateEngineOptions): TemplateEngine {
  if (!defaultEngine) {
    defaultEngine = new TemplateEngine(options);
  }
  return defaultEngine;
}

/**
 * Get default template engine instance (creates if not exists)
 */
export function getTemplateEngine(): TemplateEngine {
  return createTemplateEngine();
}

/**
 * Reset default template engine instance
 */
export function resetTemplateEngine(): void {
  defaultEngine = null;
}

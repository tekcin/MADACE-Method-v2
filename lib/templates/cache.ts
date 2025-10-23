/**
 * Template Cache
 *
 * LRU cache for compiled templates with file-based invalidation.
 */

import type { CacheEntry, CompiledTemplate, TemplateFileMetadata } from './types';

/**
 * LRU cache for compiled templates
 */
export class TemplateCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get cached template
   *
   * @param key - Cache key (template content hash or file path)
   * @param metadata - File metadata for validation (optional)
   * @returns Cached template or undefined if not found/invalid
   */
  get(key: string, metadata?: TemplateFileMetadata): CompiledTemplate | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // If metadata is provided, validate file hasn't changed
    if (metadata && entry.metadata) {
      // Check if file has been modified
      if (entry.metadata.mtime.getTime() !== metadata.mtime.getTime()) {
        // File changed, invalidate cache
        this.cache.delete(key);
        return undefined;
      }

      // Check if file size changed
      if (entry.metadata.size !== metadata.size) {
        this.cache.delete(key);
        return undefined;
      }
    }

    // Update LRU: move to end
    this.cache.delete(key);
    entry.lastAccessed = new Date();
    entry.accessCount++;
    this.cache.set(key, entry);

    return entry.template;
  }

  /**
   * Set cached template
   *
   * @param key - Cache key
   * @param template - Compiled template
   * @param metadata - File metadata (optional)
   */
  set(key: string, template: CompiledTemplate, metadata?: TemplateFileMetadata): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry = {
      template,
      metadata,
      lastAccessed: new Date(),
      accessCount: 1,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key is cached
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    utilization: number;
    entries: Array<{
      key: string;
      accessCount: number;
      lastAccessed: Date;
      hasMetadata: boolean;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed,
      hasMetadata: !!entry.metadata,
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: this.cache.size / this.maxSize,
      entries,
    };
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all file-based cache entries
   *
   * Useful when file system changes are detected
   */
  invalidateFiles(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Generate cache key from template content
 *
 * Uses a simple hash function for fast key generation.
 */
export function hashTemplate(template: string): string {
  let hash = 0;

  for (let i = 0; i < template.length; i++) {
    const char = template.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `template_${hash.toString(36)}`;
}

/**
 * Generate cache key from file path
 */
export function filePathKey(path: string): string {
  return `file_${path}`;
}

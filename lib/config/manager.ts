/**
 * Configuration Manager - MADACE-METHOD Enhanced
 * Based on official MADACE-METHOD patterns for config-manager.js
 * Story CORE-016: Configuration Manager (lib/config/manager.ts)
 *
 * Provides centralized configuration management with:
 * - Auto-detection of config files in standard MADACE locations
 * - Cross-platform path resolution (macOS/Linux/Windows)
 * - Zod schema validation with detailed error messages
 * - Installation integrity checks
 * - Atomic file operations with backup creation
 * - Environment variable merging
 * - File watching for hot-reload
 * - Integration with existing MADACE workflow
 *
 * Config detection priority order:
 * 1. ./madace/core/config.yaml (standard MADACE installation)
 * 2. ./madace/config.yaml (simplified structure)
 * 3. ./config.yaml (project root fallback)
 * 4. Environment variable override (MADACE_CONFIG_PATH)
 */

import { promises as fs, watch as fsWatch, type FSWatcher, constants as fsConstants } from 'fs';
import * as fsSync from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { z } from 'zod';
import { ConfigSchema, type Config } from './schema';
import { ConfigLoadError } from './loader';

/**
 * Configuration update callback type
 */
export type ConfigUpdateCallback = (config: Config) => void;

/**
 * Enhanced configuration error with MADACE-METHOD error codes
 * Based on official MADACE error handling patterns
 */
export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly code: keyof typeof CONFIG_ERROR_CODES,
    public readonly path?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Official MADACE error codes
 */
export const CONFIG_ERROR_CODES = {
  NOT_FOUND: 'CONFIG_NOT_FOUND',
  INVALID_FORMAT: 'CONFIG_INVALID_FORMAT',
  VALIDATION_FAILED: 'CONFIG_VALIDATION_FAILED',
  PERMISSION_DENIED: 'CONFIG_PERMISSION_DENIED',
  SAVE_FAILED: 'CONFIG_SAVE_FAILED',
  AUTO_DETECTION_FAILED: 'CONFIG_AUTO_DETECTION_FAILED',
  INSTALLATION_CORRUPT: 'CONFIG_INSTALLATION_CORRUPT',
  PATH_RESOLUTION_FAILED: 'CONFIG_PATH_RESOLUTION_FAILED',
} as const;

/**
 * Configuration locations for auto-detection (priority order)
 */
export const CONFIG_LOCATIONS = [
  './madace/core/config.yaml', // Standard MADACE installation
  './madace/config.yaml', // Simplified structure
  './config.yaml', // Project root fallback
] as const;

/**
 * MADACE installation integrity checks
 */
export interface IntegrityCheckResult {
  valid: boolean;
  issues: string[];
  critical: string[];
}

/**
 * Configuration Manager - MADACE-METHOD Enhanced
 *
 * Provides centralized configuration management with:
 * - Auto-detection of config files in standard MADACE locations
 * - Cross-platform path resolution
 * - MADACE installation integrity checks
 * - Caching for performance
 * - Validation on updates
 * - Atomic writes with backup and rollback
 * - File watching for hot-reload
 * - Environment variable merging
 * - Integration with existing MADACE workflow
 *
 * @example
 * ```typescript
 * const manager = getConfigManager();
 * await manager.load();
 *
 * const config = manager.get();
 * console.warn(`Project: ${config?.project_name}`);
 *
 * await manager.saveConfig(config);
 * manager.watch((newConfig) => {
 *   console.warn('Config updated:', newConfig);
 * });
 * ```
 */
export class ConfigurationManager {
  private config: Config | null = null;
  private configPath?: string;
  private watcher: FSWatcher | null = null;
  private watchCallbacks: Set<ConfigUpdateCallback> = new Set();
  private reloadDebounceTimer: NodeJS.Timeout | null = null;

  /**
   * Load configuration with auto-detection (MADACE-METHOD style)
   *
   * Attempts to locate configuration in standard MADACE locations:
   * 1. ./madace/core/config.yaml (standard installation)
   * 2. ./madace/config.yaml (simplified)
   * 3. ./config.yaml (project root)
   * 4. Environment variable override (MADACE_CONFIG_PATH)
   *
   * @param force - Force reload even if cached
   * @returns Validated configuration with full path resolution
   * @throws ConfigError if configuration cannot be loaded or validated
   */
  async load(force = false): Promise<Config> {
    if (this.config && !force) {
      return this.config;
    }

    // Try environment override first
    const envPath = process.env.MADACE_CONFIG_PATH;
    if (envPath) {
      try {
        this.configPath = path.resolve(envPath);
        this.config = await this.loadConfigFile(this.configPath);
        return this.config;
      } catch (error) {
        throw new ConfigError(
          `Failed to load config from MADACE_CONFIG_PATH: ${envPath}`,
          'PATH_RESOLUTION_FAILED',
          envPath,
          error
        );
      }
    }

    // Try standard MADACE locations
    for (const location of CONFIG_LOCATIONS) {
      try {
        const resolvedPath = this.resolvePath(location);
        // console.warn(`[ConfigManager] Trying config path: ${resolvedPath}`);

        await fs.access(resolvedPath, fsConstants.F_OK | fsConstants.R_OK);
        this.configPath = resolvedPath;
        this.config = await this.loadConfigFile(resolvedPath);
        // console.warn(`[ConfigManager] ✅ Loaded config from: ${resolvedPath}`);
        return this.config;
      } catch {
        // Continue to next location
        continue;
      }
    }

    // No valid config found - provide helpful error message
    const searchedPaths = CONFIG_LOCATIONS.map((loc) => this.resolvePath(loc)).join('\n');
    throw new ConfigLoadError(
      `Configuration file not found. Searched locations:\n${searchedPaths}\n\n` +
        `Please run the setup wizard at /setup or create a config file at one of the above locations.`,
      this.resolvePath(CONFIG_LOCATIONS[0]) // Primary location for error context
    );
  }

  /**
   * Load configuration from specific file path
   * @param configPath - Absolute path to config file
   * @returns Validated configuration
   * @throws ConfigError if loading or validation fails
   */
  private async loadConfigFile(configPath: string): Promise<Config> {
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const rawConfig = yaml.load(configContent);

      if (!rawConfig || typeof rawConfig !== 'object') {
        throw new Error('Configuration file is empty or invalid YAML');
      }

      // Validate with Zod schema
      const validatedConfig = ConfigSchema.parse(rawConfig);

      // Store detected config path for future operations
      this.configPath = configPath;
      return validatedConfig;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues
          .map((err) => {
            const fieldPath = err.path.join('.');
            return `  - ${fieldPath || '(root)'}: ${err.message}`;
          })
          .join('\n');

        throw new ConfigError(
          `Configuration validation failed:\n${errorMessages}`,
          'VALIDATION_FAILED',
          configPath,
          error
        );
      }

      if (error instanceof yaml.YAMLException) {
        throw new ConfigError(
          `Failed to parse YAML configuration: ${error.message}`,
          'INVALID_FORMAT',
          configPath,
          error
        );
      }

      throw new ConfigError(
        `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SAVE_FAILED',
        configPath,
        error
      );
    }
  }

  /**
   * Get cached configuration with environment variable overrides
   *
   * @returns Cached configuration or null if not loaded
   */
  get(): Config | null {
    return this.config;
  }

  /**
   * Get configuration merged with environment variable overrides
   * Environment variables take precedence over config file values
   *
   * @returns Configuration with environment overrides or null
   */
  mergeEnv(): Config | null {
    if (!this.config) {
      return null;
    }

    return {
      ...this.config,
      project_name: process.env.MADACE_PROJECT_NAME || this.config.project_name,
      output_folder: process.env.MADACE_OUTPUT_FOLDER || this.config.output_folder,
      user_name: process.env.MADACE_USER_NAME || this.config.user_name,
      communication_language:
        process.env.MADACE_COMMUNICATION_LANGUAGE || this.config.communication_language,
      modules: {
        mam: {
          enabled:
            process.env.MADACE_MODULE_MAM === 'true'
              ? true
              : process.env.MADACE_MODULE_MAM === 'false'
                ? false
                : this.config.modules.mam.enabled,
        },
        mab: {
          enabled:
            process.env.MADACE_MODULE_MAB === 'true'
              ? true
              : process.env.MADACE_MODULE_MAB === 'false'
                ? false
                : this.config.modules.mab.enabled,
        },
        cis: {
          enabled:
            process.env.MADACE_MODULE_CIS === 'true'
              ? true
              : process.env.MADACE_MODULE_CIS === 'false'
                ? false
                : this.config.modules.cis.enabled,
        },
      },
    };
  }

  /**
   * Save configuration to file with validation (MADACE-METHOD style)
   *
   * Creates backup before saving and writes atomically with proper permissions.
   * Uses detected config path or creates default MADACE structure.
   *
   * @param config - Configuration to save
   * @param customPath - Optional custom path (overrides auto-detection)
   * @throws ConfigError if validation or save fails
   */
  async saveConfig(config: Config, customPath?: string): Promise<void> {
    // Validate merged config
    const validated = ConfigSchema.parse(config);

    // Determine save path
    let savePath: string;
    if (customPath) {
      savePath = this.resolvePath(customPath);
    } else if (this.configPath) {
      savePath = this.configPath;
    } else {
      // Create standard MADACE config location
      savePath = this.resolvePath(CONFIG_LOCATIONS[0]); // ./madace/core/config.yaml
    }

    // Ensure directory exists
    const configDir = path.dirname(savePath);
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (error) {
      throw new ConfigError(
        `Failed to create config directory: ${configDir}`,
        'PERMISSION_DENIED',
        configDir,
        error
      );
    }

    // Create backup if file exists
    const backupPath = `${savePath}.bak.${Date.now()}`;
    let hasBackup = false;

    try {
      await fs.access(savePath);
      await fs.copyFile(savePath, backupPath);
      hasBackup = true;
    } catch {
      // File doesn't exist, no backup needed
    }

    try {
      // Write updated config atomically
      const yamlContent = yaml.dump(validated, { indent: 2, lineWidth: 100 });
      const tempPath = `${savePath}.tmp.${Date.now()}`;

      await fs.writeFile(tempPath, yamlContent, 'utf-8');
      await fs.rename(tempPath, savePath);

      // Set secure file permissions (Unix/Linux)
      if (process.platform !== 'win32') {
        try {
          await fs.chmod(
            savePath,
            fsConstants.S_IRUSR | fsConstants.S_IWUSR | fsConstants.S_IRGRP | fsConstants.S_IROTH
          );
        } catch {
          // Ignore chmod errors on some systems
        }
      }

      // Update cached config and path
      this.config = validated;
      this.configPath = savePath;

      // Cleanup old backups (keep last 3)
      await this.cleanupBackups(savePath);

      // Notify watchers
      this.notifyWatchers(validated);

      // console.warn(`[ConfigManager] ✅ Configuration saved to: ${savePath}`);
    } catch (error) {
      // Restore backup if save failed
      if (hasBackup) {
        try {
          await fs.copyFile(backupPath, savePath);
          await fs.unlink(backupPath);
        } catch {
          // Backup restoration failed
        }
      }

      throw new ConfigError(
        `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SAVE_FAILED',
        savePath,
        error
      );
    }
  }

  /**
   * Update configuration with partial updates (legacy compatibility)
   * @param updates - Partial configuration updates to merge
   */
  async update(updates: Partial<Config>): Promise<void> {
    if (!this.config) {
      await this.load();
    }

    const updatedConfig = {
      ...this.config!,
      ...updates,
      modules: updates.modules
        ? {
            ...this.config!.modules,
            ...updates.modules,
          }
        : this.config!.modules,
    };

    await this.saveConfig(updatedConfig);
  }

  /**
   * Reload configuration from disk with force reload
   * Forces a fresh load from the file system, bypassing cache.
   *
   * @returns Reloaded configuration
   * @throws ConfigError if reload fails
   */
  async reload(): Promise<Config> {
    return this.load(true);
  }

  /**
   * Check if configuration file exists
   * @returns true if any config file exists in the search locations
   */
  configExists(): boolean {
    // Use existing configExists function but with our search logic
    return this.searchConfigPaths().some((path) => {
      try {
        fsSync.accessSync(path, fsConstants.F_OK);
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Get detected configuration file path
   * @returns Path to current config file or undefined if not loaded
   */
  getConfigPath(): string | undefined {
    return this.configPath;
  }

  /**
   * Reset configuration to default MADACE values
   * Creates a fresh config with sensible defaults
   *
   * @returns Default configuration
   */
  async resetConfig(): Promise<Config> {
    const defaultConfig: Config = {
      project_name: 'MADACE Project',
      output_folder: 'docs',
      user_name: 'User',
      communication_language: 'English',
      madace_version: '3.0.0-alpha',
      installed_at: new Date().toISOString(),
      modules: {
        mam: { enabled: true },
        mab: { enabled: false },
        cis: { enabled: false },
      },
    };

    await this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  /**
   * Validate MADACE installation integrity
   * Checks required files and structure for a valid MADACE installation
   *
   * @returns Integrity check result with issues and critical problems
   */
  async checkInstallation(): Promise<IntegrityCheckResult> {
    const issues: string[] = [];
    const critical: string[] = [];
    let valid = true;

    // Check if config exists
    if (!this.configExists()) {
      critical.push('Configuration file not found');
      valid = false;
    }

    // Check MADACE core directory
    const coreDir = this.resolvePath('./madace/core');
    try {
      await fs.access(coreDir, fsConstants.F_OK | fsConstants.R_OK);
    } catch {
      critical.push('MADACE core directory not found or inaccessible');
      valid = false;
    }

    // Check MAM modules
    const mamDir = this.resolvePath('./madace/mam/agents');
    try {
      const agents = await fs.readdir(mamDir);
      const requiredAgents = ['pm', 'analyst', 'architect', 'sm', 'dev'];
      const missingAgents = requiredAgents.filter(
        (agent) => !agents.some((file) => file.startsWith(agent))
      );

      if (missingAgents.length > 0) {
        issues.push(`Missing MAM agents: ${missingAgents.join(', ')}`);
      }
    } catch {
      critical.push('MAM agents directory not found or inaccessible');
      valid = false;
    }

    // Check configuration validity if loaded
    if (this.config) {
      try {
        ConfigSchema.parse(this.config);
      } catch {
        critical.push('Current configuration fails validation');
        valid = false;
      }
    }

    return { valid, issues, critical };
  }

  /**
   * Watch configuration file for changes (MADACE-METHOD enhanced)
   *
   * Sets up file system watcher with debouncing for the detected config path.
   * Automatically reloads configuration and notifies callbacks on change.
   *
   * @param callback - Optional callback to invoke on config changes
   * @throws ConfigError if watcher setup fails
   */
  watch(callback?: ConfigUpdateCallback): void {
    if (callback) {
      this.watchCallbacks.add(callback);
    }

    // Already watching
    if (this.watcher) {
      return;
    }

    // Ensure we have a config path
    if (!this.configPath) {
      throw new ConfigError('Cannot watch configuration: no config file loaded', 'NOT_FOUND');
    }

    try {
      this.watcher = fsWatch(this.configPath, (eventType: string) => {
        if (eventType === 'change') {
          // Debounce reload (wait 100ms for file writes to complete)
          if (this.reloadDebounceTimer) {
            clearTimeout(this.reloadDebounceTimer);
          }

          this.reloadDebounceTimer = setTimeout(async () => {
            try {
              const newConfig = await this.reload();
              this.notifyWatchers(newConfig);
              console.warn(`[ConfigManager] 📁 Configuration reloaded from: ${this.configPath}`);
            } catch (error) {
              console.error(`[ConfigManager] ❌ Failed to reload configuration:`, error);
            }
          }, 100);
        }
      });
      // console.warn(`[ConfigManager] 👀 Watching configuration file: ${this.configPath}`);
    } catch (error) {
      throw new ConfigError(
        `Failed to watch configuration file: ${this.configPath}`,
        'PERMISSION_DENIED',
        this.configPath,
        error
      );
    }
  }

  /**
   * Stop watching configuration file
   *
   * Cleans up file system watcher and clears all callbacks.
   */
  unwatch(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      // console.warn('[ConfigManager] 🛑 Stopped watching configuration file');
    }

    if (this.reloadDebounceTimer) {
      clearTimeout(this.reloadDebounceTimer);
      this.reloadDebounceTimer = null;
    }

    this.watchCallbacks.clear();
  }

  /**
   * Cross-platform path resolution (MADACE-METHOD)
   * Resolves relative paths to absolute paths with proper handling
   * of working directory and cross-platform separators
   *
   * @param relativePath - Relative or absolute path to resolve
   * @returns Absolute path with proper separators
   * @throws ConfigError if path resolution fails
   */
  private resolvePath(relativePath: string): string {
    try {
      return path.resolve(relativePath);
    } catch (error) {
      throw new ConfigError(
        `Failed to resolve path: ${relativePath}`,
        'PATH_RESOLUTION_FAILED',
        relativePath,
        error
      );
    }
  }

  /**
   * Search for configuration files in all standard locations
   * @returns Array of absolute paths to check
   */
  private searchConfigPaths(): string[] {
    return CONFIG_LOCATIONS.map((loc) => this.resolvePath(loc));
  }

  /**
   * Cleanup old backup files (keep last 3)
   * @param configPath - Path to the main config file
   */
  private async cleanupBackups(configPath: string): Promise<void> {
    try {
      const configDir = path.dirname(configPath);
      const configBase = path.basename(configPath);
      const configName = path.parse(configBase).name;

      const files = await fs.readdir(configDir);
      const backupFiles = files
        .filter((file) => file.startsWith(`${configName}.bak.`))
        .map((file) => path.join(configDir, file))
        .map((file) => ({
          path: file,
          mtime: fs.stat(file).then((stat) => stat.mtime),
        }));

      // Sort by modification time (newest first)
      const sortedBackups = await Promise.all(
        backupFiles.map(async (file) => ({
          ...file,
          mtime: await file.mtime,
        }))
      );
      sortedBackups.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Delete old backups (keep latest 3)
      const backupsToDelete = sortedBackups.slice(3);
      for (const backup of backupsToDelete) {
        try {
          await fs.unlink(backup.path);
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Notify all registered watchers of configuration change
   */
  private notifyWatchers(config: Config): void {
    for (const callback of Array.from(this.watchCallbacks)) {
      try {
        callback(config);
      } catch {
        // Ignore callback errors
      }
    }
  }

  /**
   * Clear cached configuration
   *
   * Useful for testing or when you want to force a fresh load.
   */
  clear(): void {
    this.config = null;
  }
}

/**
 * Singleton instance
 */
let instance: ConfigurationManager | null = null;

/**
 * Get singleton ConfigurationManager instance (MADACE-METHOD)
 * Creates global configuration manager with auto-detection and
 * cross-platform support following official MADACE patterns
 *
 * @returns Global configuration manager instance
 *
 * @example
 * ```typescript
 * const manager = getConfigManager();
 * await manager.load();
 * const config = manager.get();
 *
 * // Save configuration with MADACE patterns
 * await manager.saveConfig(newConfig);
 *
 * // Check installation integrity
 * const integrity = await manager.checkInstallation();
 * ```
 */
export function getConfigManager(): ConfigurationManager {
  if (!instance) {
    instance = new ConfigurationManager();
  }
  return instance;
}

/**
 * Create ConfigManager instance (Factory pattern)
 * MADACE-METHOD factory function for consistent instance creation
 *
 * @returns New ConfigurationManager instance
 * @example
 * ```typescript
 * const manager = createConfigManager();
 * await manager.load();
 * ```
 */
export function createConfigManager(): ConfigurationManager {
  return new ConfigurationManager();
}

/**
 * Reset singleton instance (MADACE-METHOD)
 * Cleans up all resources and resets the singleton.
 * Primarily for testing purposes.
 *
 * @example
 * ```typescript
 * resetConfigManager();
 * const freshManager = getConfigManager();
 * ```
 */
export function resetConfigManager(): void {
  if (instance) {
    instance.unwatch();
    instance.clear();
  }
  instance = null;
}

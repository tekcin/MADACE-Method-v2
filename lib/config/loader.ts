import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { ConfigSchema, type Config } from './schema';

/**
 * Custom error class for configuration loading failures
 * Provides context about what went wrong and where
 */
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

/**
 * Load and validate MADACE configuration from file system
 *
 * @returns Validated configuration object
 * @throws ConfigLoadError if configuration is missing or invalid
 *
 * @example
 * ```typescript
 * try {
 *   const config = await loadConfig();
 *   console.log(`Project: ${config.project_name}`);
 * } catch (error) {
 *   if (error instanceof ConfigLoadError) {
 *     console.error(`Config error at ${error.configPath}: ${error.message}`);
 *   }
 * }
 * ```
 */
export async function loadConfig(): Promise<Config> {
  // Determine config directory path
  // In Docker: /app/data/config (set via CONFIG_DIR env var)
  // In local: ./madace-data/config
  const configDir = process.env.CONFIG_DIR || path.join(process.cwd(), 'madace-data', 'config');
  const configPath = path.join(configDir, 'config.yaml');

  // Check if config file exists
  try {
    await fs.access(configPath);
  } catch {
    throw new ConfigLoadError(
      'Configuration file not found. Please run the setup wizard at /setup',
      configPath
    );
  }

  try {
    // Read config file
    const configContent = await fs.readFile(configPath, 'utf-8');

    // Parse YAML
    const rawConfig = yaml.load(configContent);

    if (!rawConfig || typeof rawConfig !== 'object') {
      throw new Error('Configuration file is empty or invalid YAML');
    }

    // Validate with Zod schema
    const validatedConfig = ConfigSchema.parse(rawConfig);

    return validatedConfig;
  } catch (error) {
    // Handle Zod validation errors with detailed messages
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err: z.ZodIssue) => {
          const fieldPath = err.path.join('.');
          return `  - ${fieldPath || '(root)'}: ${err.message}`;
        })
        .join('\n');

      throw new ConfigLoadError(
        `Configuration validation failed:\n${errorMessages}\n\nPlease check your configuration at: ${configPath}`,
        configPath,
        error
      );
    }

    // Handle YAML parsing errors
    if (error instanceof yaml.YAMLException) {
      throw new ConfigLoadError(
        `Failed to parse YAML configuration: ${error.message}\n\nPlease check your YAML syntax at: ${configPath}`,
        configPath,
        error
      );
    }

    // Handle other errors
    throw new ConfigLoadError(
      `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      configPath,
      error
    );
  }
}

/**
 * Check if configuration exists without loading it
 *
 * @returns true if config.yaml exists, false otherwise
 *
 * @example
 * ```typescript
 * if (await configExists()) {
 *   const config = await loadConfig();
 * } else {
 *   // Redirect to setup wizard
 * }
 * ```
 */
export async function configExists(): Promise<boolean> {
  const configDir = process.env.CONFIG_DIR || path.join(process.cwd(), 'madace-data', 'config');
  const configPath = path.join(configDir, 'config.yaml');

  try {
    await fs.access(configPath);
    return true;
  } catch {
    return false;
  }
}

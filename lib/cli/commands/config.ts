/**
 * Configuration CLI Commands
 *
 * Commands for managing MADACE configuration via CLI
 */

import { Command } from 'commander';
import { loadConfig, configExists } from '@/lib/config';
import { formatKeyValue, formatJSON } from '@/lib/cli/formatters';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Create config command group
 */
export function createConfigCommand(): Command {
  const config = new Command('config');
  config.description('Manage configuration');

  // config get <key>
  config
    .command('get <key>')
    .description('Get configuration value')
    .option('--json', 'Output as JSON')
    .action(async (key, options) => {
      try {
        // Check if config exists
        const exists = await configExists();
        if (!exists) {
          console.error('Configuration not found. Run setup wizard first.');
          process.exit(1);
        }

        // Load config
        const configuration = await loadConfig();

        // Navigate nested keys (e.g., "modules.mam.enabled")
        const keys = key.split('.');
        let value: unknown = configuration;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
          } else {
            console.error(`Configuration key '${key}' not found`);
            process.exit(1);
          }
        }

        if (options.json) {
          console.log(formatJSON({ key, value }));
          return;
        }

        console.log(formatKeyValue({ [key]: value }, 'Configuration Value'));
      } catch (error) {
        console.error('Error getting configuration:', error);
        process.exit(1);
      }
    });

  // config set <key> <value>
  config
    .command('set <key> <value>')
    .description('Set configuration value')
    .option('--json', 'Output as JSON')
    .action(async (key, value, options) => {
      try {
        // Check if config exists
        const exists = await configExists();
        if (!exists) {
          console.error('Configuration not found. Run setup wizard first.');
          process.exit(1);
        }

        // Load current config
        const configuration = await loadConfig();

        // Parse value (try JSON first, fall back to string)
        let parsedValue: unknown = value;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          // Keep as string if not valid JSON
          parsedValue = value;
        }

        // Navigate nested keys and set value
        const keys = key.split('.');
        const lastKey = keys.pop()!;
        let target: Record<string, unknown> = configuration as Record<string, unknown>;

        for (const k of keys) {
          if (!(k in target)) {
            target[k] = {};
          }
          target = target[k] as Record<string, unknown>;
        }

        target[lastKey] = parsedValue;

        // Save config
        const configPath = resolve(process.cwd(), 'madace-data/config/config.yaml');

        // Convert to YAML and save
        const yaml = await import('js-yaml');
        const yamlContent = yaml.dump(configuration);
        writeFileSync(configPath, yamlContent, 'utf-8');

        if (options.json) {
          console.log(
            formatJSON({
              success: true,
              message: `Configuration '${key}' updated`,
              value: parsedValue,
            })
          );
          return;
        }

        console.log(`\n✅ Configuration '${key}' updated successfully!`);
        console.log(`   New value: ${JSON.stringify(parsedValue)}\n`);
      } catch (error) {
        console.error('Error setting configuration:', error);
        process.exit(1);
      }
    });

  // config list
  config
    .command('list')
    .description('List all configuration values')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Check if config exists
        const exists = await configExists();
        if (!exists) {
          console.error('Configuration not found. Run setup wizard first.');
          process.exit(1);
        }

        // Load config
        const configuration = await loadConfig();

        if (options.json) {
          console.log(formatJSON(configuration));
          return;
        }

        // Flatten nested config for display
        const flatConfig = flattenObject(configuration as Record<string, unknown>);

        console.log(formatKeyValue(flatConfig, 'MADACE Configuration'));
      } catch (error) {
        console.error('Error listing configuration:', error);
        process.exit(1);
      }
    });

  // config validate
  config
    .command('validate')
    .description('Validate configuration')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Check if config exists
        const exists = await configExists();
        if (!exists) {
          console.error('Configuration not found. Run setup wizard first.');
          process.exit(1);
        }

        // Load config (this validates with Zod)
        const configuration = await loadConfig();

        // Additional validation checks
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check required fields
        if (!configuration.project_name) {
          errors.push('project_name is required');
        }
        if (!configuration.output_folder) {
          errors.push('output_folder is required');
        }
        if (!configuration.user_name) {
          errors.push('user_name is required');
        }
        if (!configuration.communication_language) {
          errors.push('communication_language is required');
        }

        // Check modules
        if (configuration.modules) {
          const modules = configuration.modules as Record<string, { enabled: boolean }>;
          const enabledModules = Object.entries(modules)
            .filter(([_, mod]) => mod.enabled)
            .map(([name]) => name);

          if (enabledModules.length === 0) {
            warnings.push('No modules enabled');
          }
        }

        // Check LLM config (if present)
        const config = configuration as Record<string, unknown>;
        if (config.llm) {
          const llm = config.llm as {
            provider?: string;
            model?: string;
          };
          if (!llm.provider) {
            warnings.push('LLM provider not configured');
          }
          if (!llm.model) {
            warnings.push('LLM model not configured');
          }
        }

        const isValid = errors.length === 0;

        if (options.json) {
          console.log(
            formatJSON({
              valid: isValid,
              errors,
              warnings,
            })
          );
          return;
        }

        if (isValid) {
          console.log('\n✅ Configuration is valid!\n');
          if (warnings.length > 0) {
            console.log('⚠️  Warnings:');
            warnings.forEach((w) => console.log(`   - ${w}`));
            console.log();
          }
        } else {
          console.log('\n❌ Configuration is invalid!\n');
          console.log('Errors:');
          errors.forEach((e) => console.log(`   - ${e}`));
          console.log();
          if (warnings.length > 0) {
            console.log('Warnings:');
            warnings.forEach((w) => console.log(`   - ${w}`));
            console.log();
          }
          process.exit(1);
        }
      } catch (error) {
        if (options.json) {
          console.log(
            formatJSON({
              valid: false,
              error: String(error),
            })
          );
        } else {
          console.error('\n❌ Configuration validation failed!\n');
          console.error('Error:', error);
          console.log();
        }
        process.exit(1);
      }
    });

  return config;
}

/**
 * Flatten nested object to dot notation
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

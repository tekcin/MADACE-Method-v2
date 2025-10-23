import { z } from 'zod';

/**
 * Module configuration schema
 * Each module (MAM, MAB, CIS) has an enabled flag
 */
const ModuleConfigSchema = z.object({
  enabled: z.boolean().default(false),
});

/**
 * Main MADACE configuration schema
 * Validates config.yaml structure
 */
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

/**
 * TypeScript type inferred from Zod schema
 * Use this type throughout the application for type safety
 */
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Module configuration type
 */
export type ModuleConfig = z.infer<typeof ModuleConfigSchema>;

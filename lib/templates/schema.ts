/**
 * Template Validation Schemas
 *
 * Zod schemas for template context validation.
 */

import { z } from 'zod';

/**
 * Schema for template context
 *
 * Validates the data passed to template rendering.
 */
export const TemplateContextSchema = z
  .object({
    // Standard MADACE variables (optional)
    project_name: z.string().optional(),
    output_folder: z.string().optional(),
    user_name: z.string().optional(),
    communication_language: z.string().optional(),
  })
  .catchall(z.unknown());

/**
 * Schema for strict template context (all standard variables required)
 */
export const StrictTemplateContextSchema = z
  .object({
    // Standard MADACE variables (required)
    project_name: z.string().min(1, 'project_name is required'),
    output_folder: z.string().min(1, 'output_folder is required'),
    user_name: z.string().min(1, 'user_name is required'),
    communication_language: z.string().min(1, 'communication_language is required'),
  })
  .catchall(z.unknown());

/**
 * Schema for template engine options
 */
export const TemplateEngineOptionsSchema = z.object({
  strict: z.boolean().optional().default(false),
  enableLegacyPatterns: z.boolean().optional().default(true),
  enableCache: z.boolean().optional().default(true),
  maxCacheSize: z.number().int().positive().optional().default(100),
  handlebarsOptions: z
    .object({
      noEscape: z.boolean().optional(),
      strict: z.boolean().optional(),
      data: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Schema for file metadata
 */
export const TemplateFileMetadataSchema = z.object({
  path: z.string().min(1),
  mtime: z.date(),
  size: z.number().int().nonnegative(),
});

/**
 * Schema for validation result
 */
export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(
    z.object({
      message: z.string(),
      line: z.number().int().positive().optional(),
      column: z.number().int().positive().optional(),
      type: z.enum(['syntax', 'undefined-variable', 'helper-error', 'other']),
    })
  ),
  warnings: z
    .array(
      z.object({
        message: z.string(),
        line: z.number().int().positive().optional(),
        column: z.number().int().positive().optional(),
        type: z.enum(['syntax', 'undefined-variable', 'helper-error', 'other']),
      })
    )
    .optional(),
});

/**
 * Validate template context
 *
 * @param context - Context to validate
 * @param strict - Use strict validation (require all standard variables)
 * @returns Validated context
 */
export function validateTemplateContext(
  context: unknown,
  strict = false
): z.infer<typeof TemplateContextSchema> {
  const schema = strict ? StrictTemplateContextSchema : TemplateContextSchema;
  return schema.parse(context);
}

/**
 * Safe validation (returns result instead of throwing)
 *
 * @param context - Context to validate
 * @param strict - Use strict validation
 * @returns Validation result
 */
export function safeValidateTemplateContext(
  context: unknown,
  strict = false
):
  | { success: true; data: z.infer<typeof TemplateContextSchema> }
  | { success: false; error: z.ZodError } {
  const schema = strict ? StrictTemplateContextSchema : TemplateContextSchema;
  return schema.safeParse(context);
}

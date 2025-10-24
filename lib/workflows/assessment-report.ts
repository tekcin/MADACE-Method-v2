/**
 * Assessment Report Generator
 *
 * Generates human-readable complexity assessment reports using Handlebars templates.
 * Converts ComplexityResult into formatted markdown documentation.
 *
 * @module lib/workflows/assessment-report
 */

import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import type { ComplexityResult } from './complexity-types';

/**
 * Report generation options
 */
export interface ReportGenerationOptions {
  /** Project name to display in report */
  projectName?: string;
  /** File path to save report (optional) */
  saveTo?: string;
  /** Additional context data to pass to template */
  additionalContext?: Record<string, unknown>;
}

/**
 * Report context data passed to Handlebars template
 */
interface ReportContext {
  /** Project name */
  projectName: string;
  /** ISO timestamp of report generation */
  timestamp: string;
  /** Complexity level (0-4) */
  level: number;
  /** Total score (0-40) */
  totalScore: number;
  /** Maximum possible score */
  maxScore: number;
  /** Human-readable interpretation */
  interpretation: string;
  /** Recommended workflow path */
  recommendedPath: string;
  /** Breakdown of scores by criterion */
  breakdown: {
    projectSize: number;
    teamSize: number;
    codebase: number;
    integrations: number;
    userBase: number;
    security: number;
    duration: number;
    risk: number;
  };
  /** Additional custom context */
  [key: string]: unknown;
}

/**
 * Register custom Handlebars helpers for template rendering
 */
function registerHandlebarsHelpers(): void {
  // Equality helper for {{#if (eq level 0)}}
  Handlebars.registerHelper('eq', function (a: unknown, b: unknown): boolean {
    return a === b;
  });

  // Greater than or equal helper
  Handlebars.registerHelper('gte', function (a: number, b: number): boolean {
    return a >= b;
  });

  // Less than or equal helper
  Handlebars.registerHelper('lte', function (a: number, b: number): boolean {
    return a <= b;
  });

  // Logical AND helper
  Handlebars.registerHelper('and', function (a: boolean, b: boolean): boolean {
    return a && b;
  });

  // Date formatting helper (optional, for future use)
  Handlebars.registerHelper('formatDate', function (date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}

// Register helpers immediately on module load
registerHandlebarsHelpers();

/**
 * Generate complexity assessment report from template
 *
 * Reads the Handlebars template, compiles it, and renders with ComplexityResult data.
 * Optionally saves the rendered markdown to a file.
 *
 * @param result - Complexity assessment result
 * @param options - Generation options
 * @returns Promise resolving to markdown string
 * @throws Error if template file not found or rendering fails
 *
 * @example
 * ```typescript
 * const result = await assessComplexity(input);
 * const markdown = await generateAssessmentReport(result, {
 *   projectName: 'My App',
 *   saveTo: 'docs/scale-assessment.md'
 * });
 * console.log('Report saved:', markdown.length, 'bytes');
 * ```
 */
export async function generateAssessmentReport(
  result: ComplexityResult,
  options?: ReportGenerationOptions
): Promise<string> {
  try {
    // Read template file
    const templatePath = path.resolve(
      process.cwd(),
      'lib/templates/assessment-report.hbs'
    );
    const templateSource = await fs.readFile(templatePath, 'utf-8');

    // Compile template
    const template = Handlebars.compile(templateSource);

    // Prepare context data for template
    const context: ReportContext = {
      projectName: options?.projectName || 'Unnamed Project',
      timestamp: new Date().toISOString(),
      level: result.level,
      totalScore: result.totalScore,
      maxScore: 40, // 8 criteria × 5 points each
      interpretation: result.levelName,
      recommendedPath: result.recommendedWorkflow,
      breakdown: {
        projectSize: result.breakdown.projectSize,
        teamSize: result.breakdown.teamSize,
        codebase: result.breakdown.codebaseComplexity,
        integrations: result.breakdown.integrations,
        userBase: result.breakdown.userBase,
        security: result.breakdown.security,
        duration: result.breakdown.duration,
        risk: result.breakdown.existingCode,
      },
      ...options?.additionalContext,
    };

    // Render markdown
    const markdown = template(context);

    // Save to file if requested
    if (options?.saveTo) {
      const outputPath = path.resolve(process.cwd(), options.saveTo);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, markdown, 'utf-8');
    }

    return markdown;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to generate assessment report: ${error.message}`,
        { cause: error }
      );
    }
    throw new Error('Failed to generate assessment report: Unknown error');
  }
}

/**
 * Save assessment report to default location
 *
 * Convenience function that generates and saves report to `docs/scale-assessment.md`.
 *
 * @param result - Complexity assessment result
 * @param projectName - Project name
 * @returns Promise resolving to file path where report was saved
 * @throws Error if generation or file write fails
 *
 * @example
 * ```typescript
 * const result = await assessComplexity(input);
 * const filePath = await saveAssessmentReport(result, 'My App');
 * console.log('Report saved to:', filePath);
 * ```
 */
export async function saveAssessmentReport(
  result: ComplexityResult,
  projectName: string
): Promise<string> {
  const filePath = 'docs/scale-assessment.md';
  await generateAssessmentReport(result, {
    projectName,
    saveTo: filePath,
  });
  return filePath;
}

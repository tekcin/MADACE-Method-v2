/**
 * Interactive Assessment CLI Command
 *
 * Command handler for `madace assess-scale` - interactive complexity assessment.
 * Prompts user for project details, calculates complexity, generates report.
 *
 * @module lib/cli/assess-scale
 */

import { promptForComplexityAssessment } from './prompts';
import { assessComplexity } from '../workflows/complexity-assessment';
import { saveAssessmentReport } from '../workflows/assessment-report';
import type { ProjectInput } from '../workflows/complexity-types';
import path from 'path';

/**
 * CLI command options for assess-scale
 */
export interface AssessScaleOptions {
  /** Custom output path for report (default: docs/scale-assessment.md) */
  output?: string;
  /** Output format (only markdown supported currently) */
  format?: 'markdown' | 'json';
  /** Project name override (optional, will prompt if not provided) */
  projectName?: string;
}

/**
 * Interactive complexity assessment CLI command
 *
 * Prompts user through 8-question assessment, calculates complexity score,
 * generates detailed report, and displays summary to console.
 *
 * @throws Error if assessment fails or file write fails
 *
 * @example
 * ```bash
 * madace assess-scale
 * madace assess-scale --output=custom/path.md
 * ```
 */
export async function runAssessScale(): Promise<void> {
  /* eslint-disable no-console */
  console.log('\n🔍 MADACE Scale-Adaptive Assessment\n');
  console.log('Answer the following questions to determine your project complexity level.\n');
  /* eslint-enable no-console */

  try {
    // Step 1: Prompt user for project details
    const projectInput: ProjectInput = await promptForComplexityAssessment();

    // Step 2: Calculate complexity
    /* eslint-disable no-console */
    console.log('\n⚙️  Calculating complexity score...\n');
    /* eslint-enable no-console */
    const result = assessComplexity(projectInput);

    // Step 3: Display summary
    displayAssessmentResults(result);

    // Step 4: Generate and save report
    /* eslint-disable no-console */
    console.log('📝 Generating detailed report...\n');
    /* eslint-enable no-console */
    const filePath = await saveAssessmentReport(result, 'Project Assessment');

    // Convert to absolute path for display
    const absolutePath = path.resolve(process.cwd(), filePath);

    /* eslint-disable no-console */
    console.log(`✅ Assessment report saved to: ${absolutePath}\n`);

    // Step 5: Next steps
    displayNextSteps(result, absolutePath);
    /* eslint-enable no-console */
  } catch (error) {
    /* eslint-disable no-console */
    console.error('\n❌ Error during assessment:');
    console.error(error instanceof Error ? error.message : String(error));
    /* eslint-enable no-console */
    process.exit(1);
  }
}

/**
 * Display assessment results summary to console
 *
 * @param result - Complexity assessment result
 */
function displayAssessmentResults(result: {
  level: number;
  levelName: string;
  totalScore: number;
  breakdown: {
    projectSize: number;
    teamSize: number;
    codebaseComplexity: number;
    integrations: number;
    userBase: number;
    security: number;
    duration: number;
    existingCode: number;
  };
  recommendedWorkflow: string;
}): void {
  /* eslint-disable no-console */
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Assessment Results');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Complexity Level: ${result.level} - ${result.levelName}`);
  console.log(`Total Score: ${result.totalScore} / 40 points\n`);
  console.log('Breakdown:');
  console.log(`  Project Size:       ${result.breakdown.projectSize}/5`);
  console.log(`  Team Size:          ${result.breakdown.teamSize}/5`);
  console.log(`  Codebase:           ${result.breakdown.codebaseComplexity}/5`);
  console.log(`  Integrations:       ${result.breakdown.integrations}/5`);
  console.log(`  User Base:          ${result.breakdown.userBase}/5`);
  console.log(`  Security:           ${result.breakdown.security}/5`);
  console.log(`  Duration:           ${result.breakdown.duration}/5`);
  console.log(`  Existing Code:      ${result.breakdown.existingCode}/5\n`);
  console.log(`Recommended Workflow: ${result.recommendedWorkflow}\n`);
  /* eslint-enable no-console */
}

/**
 * Display next steps guidance to console
 *
 * @param result - Complexity assessment result
 * @param reportPath - Absolute path to saved report file
 */
function displayNextSteps(
  result: { recommendedWorkflow: string },
  reportPath: string
): void {
  /* eslint-disable no-console */
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📖 Next Steps:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`1. Review the full report: ${reportPath}`);
  console.log(`2. Run the recommended workflow: madace run ${result.recommendedWorkflow}`);
  console.log('3. Customize assessment if needed with --override flag\n');
  /* eslint-enable no-console */
}

/**
 * CLI command with options support
 *
 * Extended command handler that supports CLI options like --output and --format.
 * Currently delegates to runAssessScale() but can be extended for future options.
 *
 * @param _options - Command options (unused currently, prefixed with underscore)
 * @throws Error if assessment fails
 *
 * @example
 * ```typescript
 * await assessScaleCommand({ output: 'custom/path.md' });
 * ```
 */
export async function assessScaleCommand(_options?: AssessScaleOptions): Promise<void> {
  // For now, delegate to basic flow
  // Future: Use _options.output and _options.format for custom behavior
  await runAssessScale();

  // TODO: Implement custom output path support
  // if (_options?.output) {
  //   // Save to custom path
  // }

  // TODO: Implement JSON format support
  // if (_options?.format === 'json') {
  //   // Output as JSON instead of markdown
  // }
}

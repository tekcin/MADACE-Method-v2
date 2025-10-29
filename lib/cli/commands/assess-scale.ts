/**
 * CLI Command: madace assess-scale
 * STORY-V3-007: Add CLI Command for Complexity Assessment
 *
 * Provides interactive complexity assessment with multiple output formats.
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { assessComplexity } from '../../workflows/complexity-assessment';
import type { ProjectInput, ComplexityResult } from '../../workflows/complexity-types';

/**
 * Interactive questions for complexity assessment
 */
const ASSESSMENT_QUESTIONS = [
  {
    type: 'list',
    name: 'projectSize',
    message: 'What is the scale of your project?',
    choices: [
      { name: 'Tiny (< 1K LOC, simple script/tool)', value: 0 },
      { name: 'Small (1K-5K LOC, simple app)', value: 1 },
      { name: 'Medium (5K-20K LOC, standard app)', value: 2 },
      { name: 'Large (20K-100K LOC, complex system)', value: 3 },
      { name: 'Very Large (100K-500K LOC, enterprise platform)', value: 4 },
      { name: 'Massive (500K+ LOC, distributed platform)', value: 5 },
    ],
  },
  {
    type: 'list',
    name: 'teamSize',
    message: 'How many developers will work on this project?',
    choices: [
      { name: 'Solo (1 developer)', value: 0 },
      { name: 'Small team (2-3 developers)', value: 1 },
      { name: 'Medium team (4-6 developers)', value: 2 },
      { name: 'Large team (7-15 developers)', value: 3 },
      { name: 'Very Large team (16-50 developers)', value: 4 },
      { name: 'Enterprise team (50+ developers)', value: 5 },
    ],
  },
  {
    type: 'list',
    name: 'codebaseComplexity',
    message: 'What is the technical complexity of the codebase?',
    choices: [
      { name: 'Trivial (simple scripts, basic logic)', value: 0 },
      { name: 'Simple (straightforward app, minimal architecture)', value: 1 },
      { name: 'Moderate (standard patterns, modular)', value: 2 },
      { name: 'Complex (microservices, multiple repos)', value: 3 },
      { name: 'Very Complex (distributed systems, advanced patterns)', value: 4 },
      { name: 'Extreme (large-scale distributed, cutting-edge)', value: 5 },
    ],
  },
  {
    type: 'list',
    name: 'integrations',
    message: 'How many external systems/APIs will you integrate?',
    choices: [
      { name: 'None (standalone application)', value: 0 },
      { name: 'Few (1-2 simple APIs)', value: 1 },
      { name: 'Some (3-5 APIs or services)', value: 2 },
      { name: 'Many (6-10 integrations)', value: 3 },
      { name: 'Very Many (11-20 integrations)', value: 4 },
      { name: 'Extensive (20+ complex integrations)', value: 5 },
    ],
  },
  {
    type: 'list',
    name: 'userBase',
    message: 'What is the expected user base size?',
    choices: [
      { name: 'Personal (< 10 users, personal project)', value: 0 },
      { name: 'Internal (10-100 users, internal tool)', value: 1 },
      { name: 'Small (100-1K users, small business)', value: 2 },
      { name: 'Medium (1K-10K users, medium business)', value: 3 },
      { name: 'Large (10K-100K users, large business)', value: 4 },
      { name: 'Massive (100K+ users, enterprise/public)', value: 5 },
    ],
  },
  {
    type: 'list',
    name: 'security',
    message: 'What are the security and compliance requirements?',
    choices: [
      { name: 'None (no sensitive data)', value: 0 },
      { name: 'Low (basic auth, non-sensitive data)', value: 1 },
      { name: 'Moderate (user data, standard security)', value: 2 },
      { name: 'High (PII, payment data, GDPR)', value: 3 },
      { name: 'Very High (healthcare HIPAA, financial PCI-DSS)', value: 4 },
      { name: 'Critical (government, military, critical infrastructure)', value: 5 },
    ],
  },
  {
    type: 'list',
    name: 'duration',
    message: 'What is the estimated project duration?',
    choices: [
      { name: 'Very Short (< 1 week)', value: 0 },
      { name: 'Short (1-4 weeks)', value: 1 },
      { name: 'Medium (1-3 months)', value: 2 },
      { name: 'Long (3-6 months)', value: 3 },
      { name: 'Very Long (6-12 months)', value: 4 },
      { name: 'Indefinite (12+ months, ongoing)', value: 5 },
    ],
  },
  {
    type: 'list',
    name: 'existingCode',
    message: 'Are you working with existing code?',
    choices: [
      { name: 'Greenfield (brand new project)', value: 0 },
      { name: 'Minor Refactor (< 20% changes to existing code)', value: 1 },
      { name: 'Moderate Refactor (20-50% changes)', value: 2 },
      { name: 'Major Refactor (50-80% changes)', value: 3 },
      { name: 'Legacy Modernization (80%+ changes, updating old tech)', value: 4 },
      { name: 'Full Rewrite (replacing entire system)', value: 5 },
    ],
  },
];

/**
 * Format assessment result as table (default CLI output)
 */
function formatAsTable(result: ComplexityResult): string {
  const { level, levelName, totalScore, breakdown } = result;

  const lines = [
    '',
    '━'.repeat(60),
    '  COMPLEXITY ASSESSMENT RESULT',
    '━'.repeat(60),
    '',
    `  Level: ${level} (${levelName})`,
    `  Total Score: ${totalScore}/40 points`,
    `  Score Range: ${result.scoreRange}`,
    `  Recommended Workflow: ${result.recommendedWorkflow}`,
    '',
    '━'.repeat(60),
    '  CRITERIA BREAKDOWN',
    '━'.repeat(60),
    '',
    `  Project Size:          ${breakdown.projectSize}/5`,
    `  Team Size:             ${breakdown.teamSize}/5`,
    `  Codebase Complexity:   ${breakdown.codebaseComplexity}/5`,
    `  Integrations:          ${breakdown.integrations}/5`,
    `  User Base:             ${breakdown.userBase}/5`,
    `  Security:              ${breakdown.security}/5`,
    `  Duration:              ${breakdown.duration}/5`,
    `  Existing Code:         ${breakdown.existingCode}/5`,
    '',
    '━'.repeat(60),
    '',
  ];

  return lines.join('\n');
}

/**
 * Format assessment result as JSON
 */
function formatAsJSON(result: ComplexityResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Format assessment result as Markdown report
 */
function formatAsMarkdown(result: ComplexityResult): string {
  const { level, levelName, totalScore, breakdown } = result;
  const date = new Date().toISOString().split('T')[0];

  const lines = [
    '# Project Complexity Assessment',
    '',
    `**Assessment Date:** ${date}`,
    `**Recommended Level:** Level ${level} (${levelName})`,
    `**Total Score:** ${totalScore}/40 points`,
    `**Score Range:** ${result.scoreRange}`,
    `**Recommended Workflow:** \`${result.recommendedWorkflow}\``,
    '',
    '## Criteria Breakdown',
    '',
    '| Criterion | Score | Max | Percentage |',
    '|-----------|-------|-----|------------|',
    `| Project Size | ${breakdown.projectSize} | 5 | ${Math.round((breakdown.projectSize / 5) * 100)}% |`,
    `| Team Size | ${breakdown.teamSize} | 5 | ${Math.round((breakdown.teamSize / 5) * 100)}% |`,
    `| Codebase Complexity | ${breakdown.codebaseComplexity} | 5 | ${Math.round((breakdown.codebaseComplexity / 5) * 100)}% |`,
    `| Integrations | ${breakdown.integrations} | 5 | ${Math.round((breakdown.integrations / 5) * 100)}% |`,
    `| User Base | ${breakdown.userBase} | 5 | ${Math.round((breakdown.userBase / 5) * 100)}% |`,
    `| Security | ${breakdown.security} | 5 | ${Math.round((breakdown.security / 5) * 100)}% |`,
    `| Duration | ${breakdown.duration} | 5 | ${Math.round((breakdown.duration / 5) * 100)}% |`,
    `| Existing Code | ${breakdown.existingCode} | 5 | ${Math.round((breakdown.existingCode / 5) * 100)}% |`,
    '',
    '## Level Characteristics',
    '',
    getLevelDescription(level),
    '',
    '## Next Steps',
    '',
    getNextSteps(level),
    '',
  ];

  return lines.join('\n');
}

/**
 * Get level description for markdown report
 */
function getLevelDescription(level: number): string {
  const descriptions = {
    0: '**Level 0 - Minimal:** Simple projects with minimal planning overhead. Ideal for solo developer projects, prototypes, small scripts, or personal projects.',
    1: '**Level 1 - Basic:** Small team projects with basic planning. Suitable for small teams (2-3 developers), simple web applications, internal tools, or MVPs with limited scope.',
    2: '**Level 2 - Standard:** Medium-sized projects with structured planning. Appropriate for medium teams (4-6 developers), standard business applications, moderate complexity features, or typical SaaS products.',
    3: '**Level 3 - Comprehensive:** Large projects with comprehensive planning. Designed for large teams (7-15 developers), complex multi-tier systems, high-stakes business applications, or security-critical systems.',
    4: '**Level 4 - Enterprise:** Mission-critical enterprise systems. Required for very large teams (16+ developers), distributed systems at scale, regulatory compliance, or public-facing critical infrastructure.',
  };

  return descriptions[level as keyof typeof descriptions] || descriptions[2];
}

/**
 * Get next steps recommendations for markdown report
 */
function getNextSteps(level: number): string {
  const steps: Record<number, string[]> = {
    0: [
      '1. Start with story creation directly',
      '2. Minimal documentation required',
      '3. Focus on rapid prototyping',
    ],
    1: [
      '1. Create lightweight PRD',
      '2. Break down into user stories',
      '3. Plan sprints and iterations',
    ],
    2: [
      '1. Create full PRD with requirements',
      '2. Design basic architecture',
      '3. Break down into epics and stories',
      '4. Plan development phases',
    ],
    3: [
      '1. Create comprehensive PRD',
      '2. Design detailed architecture with diagrams',
      '3. Write security and compliance specifications',
      '4. Break down into epics and stories',
      '5. Plan development milestones',
    ],
    4: [
      '1. Create enterprise PRD with all stakeholders',
      '2. Design complete architecture documentation',
      '3. Write security, compliance, and DevOps specifications',
      '4. Break down into epics and milestones',
      '5. Plan development phases with governance',
      '6. Establish review and approval processes',
    ],
  };

  const stepsList = steps[level] || steps[2] || [];
  return stepsList.join('\n');
}

/**
 * Create CLI command for complexity assessment
 */
export function createAssessScaleCommand(): Command {
  const command = new Command('assess-scale');

  command
    .description('Assess project complexity and recommend planning level')
    .option('-f, --format <format>', 'Output format (table, json, markdown)', 'table')
    .option('-o, --output <file>', 'Save report to file')
    .option('-j, --json <data>', 'Provide assessment data as JSON (non-interactive)')
    .action(async (options) => {
      try {
        let projectInput: ProjectInput;

        // Interactive mode (default)
        if (!options.json) {
          console.log('\n✨ MADACE Project Complexity Assessment\n');
          console.log('Answer 8 questions to determine the recommended planning level.\n');

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const answers = await inquirer.prompt(ASSESSMENT_QUESTIONS as any);
          projectInput = answers as ProjectInput;
        } else {
          // Non-interactive mode (JSON input)
          try {
            projectInput = JSON.parse(options.json) as ProjectInput;
          } catch {
            console.error('❌ Invalid JSON input');
            process.exit(1);
          }
        }

        // Run complexity assessment
        const result = assessComplexity(projectInput);

        // Format output based on selected format
        let output: string;
        switch (options.format) {
          case 'json':
            output = formatAsJSON(result);
            break;
          case 'markdown':
            output = formatAsMarkdown(result);
            break;
          case 'table':
          default:
            output = formatAsTable(result);
            break;
        }

        // Display output
        console.log(output);

        // Save to file if --output specified
        if (options.output) {
          const outputPath = path.resolve(options.output);
          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await fs.writeFile(outputPath, output, 'utf-8');
          console.log(`\n📄 Report saved to: ${outputPath}`);
        } else if (options.format === 'markdown' && !options.json) {
          // Auto-save markdown report to default location
          const defaultPath = path.resolve('docs/scale-assessment.md');
          await fs.mkdir(path.dirname(defaultPath), { recursive: true });
          await fs.writeFile(defaultPath, output, 'utf-8');
          console.log(`\n📄 Report saved to: ${defaultPath}`);
        }

        // Display summary
        if (!options.json && options.format === 'table') {
          console.log(`✅ Assessment Complete: Level ${result.level} (${result.levelName})`);
          console.log(`📊 Total Score: ${result.totalScore}/40 points\n`);
        }
      } catch (error) {
        console.error('❌ Assessment failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}

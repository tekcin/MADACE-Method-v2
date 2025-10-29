/**
 * CLI Prompt Definitions for Complexity Assessment
 *
 * Interactive command-line prompts for gathering project complexity data.
 * Uses @inquirer/prompts for modern typed experience.
 *
 * @module lib/cli/prompts
 */

import input from '@inquirer/input';
import select from '@inquirer/select';
import confirm from '@inquirer/confirm';
import type { ProjectInput } from '../workflows/complexity-types';
import {
  ProjectSize,
  TeamSize,
  CodebaseComplexity,
  IntegrationsCount,
  UserBase,
  SecurityLevel,
  ProjectDuration,
  ExistingCodebase,
} from '../workflows/complexity-types';

/**
 * Prompt user for complete complexity assessment
 *
 * Interactive CLI workflow that gathers all 8 complexity criteria:
 * 1. Project size
 * 2. Team size
 * 3. Existing codebase (with conditional follow-up)
 * 4. External integrations
 * 5. User base
 * 6. Security requirements
 * 7. Project duration
 * 8. Codebase complexity (calculated from existing code answer)
 *
 * @returns Promise resolving to ProjectInput with all assessment data
 * @throws Error if validation fails (should not happen with proper prompts)
 */
export async function promptForComplexityAssessment(): Promise<ProjectInput> {
  /* eslint-disable no-console */
  console.log('\n📊 Project Complexity Assessment\n');
  console.log('Answer 8 questions to determine the appropriate workflow level.\n');
  /* eslint-enable no-console */

  // 1. Project Size
  const projectSize = await select<ProjectSize>({
    message: 'What is the expected project size?',
    choices: [
      {
        name: 'Tiny (< 1K LOC, 1-3 features)',
        value: ProjectSize.TINY,
        description: 'Very small project, single file or few modules',
      },
      {
        name: 'Small (1K-5K LOC, 4-10 features)',
        value: ProjectSize.SMALL,
        description: 'Small application with basic features',
      },
      {
        name: 'Medium (5K-20K LOC, 11-30 features)',
        value: ProjectSize.MEDIUM,
        description: 'Standard business application',
      },
      {
        name: 'Large (20K-100K LOC, 31-100 features)',
        value: ProjectSize.LARGE,
        description: 'Large application with many features',
      },
      {
        name: 'Very Large (100K-500K LOC, 100+ features)',
        value: ProjectSize.VERY_LARGE,
        description: 'Enterprise-scale application',
      },
      {
        name: 'Massive (500K+ LOC, enterprise-scale)',
        value: ProjectSize.MASSIVE,
        description: 'Very large distributed system',
      },
    ],
  });

  // 2. Team Size
  const teamSizeInput = await input({
    message: 'How many developers will work on this project?',
    default: '1',
    validate: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        return 'Please enter a positive number (minimum 1)';
      }
      return true;
    },
  });

  const teamSizeNum = parseInt(teamSizeInput, 10);
  let teamSize: TeamSize;
  if (teamSizeNum === 1) {
    teamSize = TeamSize.SOLO;
  } else if (teamSizeNum <= 3) {
    teamSize = TeamSize.SMALL;
  } else if (teamSizeNum <= 6) {
    teamSize = TeamSize.MEDIUM;
  } else if (teamSizeNum <= 15) {
    teamSize = TeamSize.LARGE;
  } else if (teamSizeNum <= 50) {
    teamSize = TeamSize.VERY_LARGE;
  } else {
    teamSize = TeamSize.ENTERPRISE;
  }

  // 3. Existing Codebase (Yes/No)
  const hasExistingCode = await confirm({
    message: 'Is this an existing codebase (or greenfield project)?',
    default: false,
  });

  // 4. Existing Codebase Size (conditional)
  let existingCode: ExistingCodebase;
  if (hasExistingCode) {
    // Ask for codebase size (informational - not used in calculation)
    await input({
      message: 'Approximate lines of code in existing codebase:',
      default: '10000',
      validate: (value: string) => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0) {
          return 'Please enter a non-negative number';
        }
        return true;
      },
    });

    const refactorScope = await select<string>({
      message: 'What percentage of the codebase will be changed?',
      choices: [
        {
          name: 'Minor refactor (< 20% changes)',
          value: 'minor',
          description: 'Small improvements, bug fixes',
        },
        {
          name: 'Moderate refactor (20-50% changes)',
          value: 'moderate',
          description: 'Feature additions, structural changes',
        },
        {
          name: 'Major refactor (50-80% changes)',
          value: 'major',
          description: 'Significant architectural changes',
        },
        {
          name: 'Legacy modernization (80%+ changes)',
          value: 'legacy',
          description: 'Complete modernization of old system',
        },
        {
          name: 'Full rewrite',
          value: 'rewrite',
          description: 'Starting fresh with new architecture',
        },
      ],
    });

    switch (refactorScope) {
      case 'minor':
        existingCode = ExistingCodebase.MINOR_REFACTOR;
        break;
      case 'moderate':
        existingCode = ExistingCodebase.MODERATE_REFACTOR;
        break;
      case 'major':
        existingCode = ExistingCodebase.MAJOR_REFACTOR;
        break;
      case 'legacy':
        existingCode = ExistingCodebase.LEGACY_MODERNIZATION;
        break;
      case 'rewrite':
        existingCode = ExistingCodebase.FULL_REWRITE;
        break;
      default:
        existingCode = ExistingCodebase.MODERATE_REFACTOR;
    }
  } else {
    existingCode = ExistingCodebase.GREENFIELD;
  }

  // 5. External Integrations
  const integrationsInput = await input({
    message: 'How many external APIs or services will you integrate with?',
    default: '0',
    validate: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) {
        return 'Please enter a non-negative number';
      }
      return true;
    },
  });

  const integrationsNum = parseInt(integrationsInput, 10);
  let integrations: IntegrationsCount;
  if (integrationsNum === 0) {
    integrations = IntegrationsCount.NONE;
  } else if (integrationsNum <= 2) {
    integrations = IntegrationsCount.FEW;
  } else if (integrationsNum <= 5) {
    integrations = IntegrationsCount.SOME;
  } else if (integrationsNum <= 10) {
    integrations = IntegrationsCount.MANY;
  } else if (integrationsNum <= 20) {
    integrations = IntegrationsCount.VERY_MANY;
  } else {
    integrations = IntegrationsCount.EXTENSIVE;
  }

  // 6. User Base
  const userBase = await select<UserBase>({
    message: 'What is the expected user base size?',
    choices: [
      {
        name: 'Personal (< 10 users)',
        value: UserBase.PERSONAL,
        description: 'Personal project or very small audience',
      },
      {
        name: 'Internal (10-100 users)',
        value: UserBase.INTERNAL,
        description: 'Internal company tool or team project',
      },
      {
        name: 'Small (100-1K users)',
        value: UserBase.SMALL,
        description: 'Small business or niche product',
      },
      {
        name: 'Medium (1K-10K users)',
        value: UserBase.MEDIUM,
        description: 'Medium-sized business or growing product',
      },
      {
        name: 'Large (10K-100K users)',
        value: UserBase.LARGE,
        description: 'Large business or popular service',
      },
      {
        name: 'Massive (100K+ users)',
        value: UserBase.MASSIVE,
        description: 'Enterprise or public-facing at scale',
      },
    ],
  });

  // 7. Security Requirements
  const security = await select<SecurityLevel>({
    message: 'What level of security is required?',
    choices: [
      {
        name: 'None (no sensitive data)',
        value: SecurityLevel.NONE,
        description: 'Public information, no user data',
      },
      {
        name: 'Low (basic auth, non-sensitive)',
        value: SecurityLevel.LOW,
        description: 'Basic authentication, low-risk data',
      },
      {
        name: 'Moderate (user data, standard security)',
        value: SecurityLevel.MODERATE,
        description: 'Standard user accounts and preferences',
      },
      {
        name: 'High (PII, payments, GDPR)',
        value: SecurityLevel.HIGH,
        description: 'Personal information, payment processing',
      },
      {
        name: 'Very High (HIPAA, PCI-DSS)',
        value: SecurityLevel.VERY_HIGH,
        description: 'Healthcare or financial compliance required',
      },
      {
        name: 'Critical (government, military)',
        value: SecurityLevel.CRITICAL,
        description: 'Critical infrastructure or classified data',
      },
    ],
  });

  // 8. Project Duration
  const durationInput = await input({
    message: 'Estimated project duration in weeks:',
    default: '4',
    validate: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        return 'Please enter a positive number (minimum 1 week)';
      }
      return true;
    },
  });

  const durationWeeks = parseInt(durationInput, 10);
  let duration: ProjectDuration;
  if (durationWeeks < 1) {
    duration = ProjectDuration.VERY_SHORT;
  } else if (durationWeeks <= 4) {
    duration = ProjectDuration.SHORT;
  } else if (durationWeeks <= 12) {
    duration = ProjectDuration.MEDIUM;
  } else if (durationWeeks <= 24) {
    duration = ProjectDuration.LONG;
  } else if (durationWeeks <= 52) {
    duration = ProjectDuration.VERY_LONG;
  } else {
    duration = ProjectDuration.INDEFINITE;
  }

  // 9. Codebase Complexity (derived from project details)
  // For CLI prompts, we ask directly about complexity
  const codebaseComplexity = await select<CodebaseComplexity>({
    message: 'What is the expected technical complexity?',
    choices: [
      {
        name: 'Trivial (simple script, single file)',
        value: CodebaseComplexity.TRIVIAL,
        description: 'Basic script or utility',
      },
      {
        name: 'Simple (basic app, minimal dependencies)',
        value: CodebaseComplexity.SIMPLE,
        description: 'Simple application with few dependencies',
      },
      {
        name: 'Moderate (modular, standard patterns)',
        value: CodebaseComplexity.MODERATE,
        description: 'Modular architecture with standard practices',
      },
      {
        name: 'Complex (microservices, multiple repos)',
        value: CodebaseComplexity.COMPLEX,
        description: 'Distributed system with multiple services',
      },
      {
        name: 'Very Complex (distributed, advanced patterns)',
        value: CodebaseComplexity.VERY_COMPLEX,
        description: 'Complex distributed system with advanced architecture',
      },
      {
        name: 'Extreme (large-scale distributed)',
        value: CodebaseComplexity.EXTREME,
        description: 'Large-scale distributed with cutting-edge patterns',
      },
    ],
  });

  /* eslint-disable no-console */
  console.log('\n✅ Assessment complete!\n');
  /* eslint-enable no-console */

  return {
    projectSize,
    teamSize,
    codebaseComplexity,
    integrations,
    userBase,
    security,
    duration,
    existingCode,
  };
}

/**
 * Display assessment result summary
 *
 * Pretty-prints the complexity assessment result to console.
 *
 * @param input - Project input data
 * @param totalScore - Calculated total score (0-40)
 * @param levelName - Human-readable level name
 */
export function displayAssessmentSummary(
  input: ProjectInput,
  totalScore: number,
  levelName: string
): void {
  /* eslint-disable no-console */
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPLEXITY ASSESSMENT SUMMARY');
  console.log('='.repeat(60) + '\n');

  console.log(`Total Score: ${totalScore}/40 points`);
  console.log(`Complexity Level: ${levelName}\n`);

  console.log('Breakdown:');
  console.log(`  • Project Size:        ${input.projectSize}/5`);
  console.log(`  • Team Size:           ${input.teamSize}/5`);
  console.log(`  • Codebase Complexity: ${input.codebaseComplexity}/5`);
  console.log(`  • Integrations:        ${input.integrations}/5`);
  console.log(`  • User Base:           ${input.userBase}/5`);
  console.log(`  • Security:            ${input.security}/5`);
  console.log(`  • Duration:            ${input.duration}/5`);
  console.log(`  • Existing Code:       ${input.existingCode}/5`);

  console.log('\n' + '='.repeat(60) + '\n');
  /* eslint-enable no-console */
}

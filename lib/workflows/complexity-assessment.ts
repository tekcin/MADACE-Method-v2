/**
 * Complexity Assessment Implementation
 *
 * Implements the scoring algorithm for project complexity assessment.
 * Used by the Scale-Adaptive Router (EPIC-V3-001) to determine appropriate
 * workflow levels based on 8 assessment criteria.
 *
 * Each criterion is scored 0-5 points (8 criteria = 40 points max).
 * Total score maps to one of 5 complexity levels (0-4).
 *
 * @module lib/workflows/complexity-assessment
 */

import {
  ProjectInput,
  ComplexityResult,
  ComplexityBreakdown,
  ComplexityLevel,
  ProjectSize,
  TeamSize,
  CodebaseComplexity,
  IntegrationsCount,
  UserBase,
  SecurityLevel,
  ProjectDuration,
  ExistingCodebase,
  calculateLevel,
  getLevelMetadata,
  validateProjectInput,
  ComplexityAssessmentConfig,
  DEFAULT_LEVEL_THRESHOLDS,
} from './complexity-types';

/**
 * Score project size criterion (0-5 points)
 *
 * Maps project size enum to complexity points:
 * - TINY: 0 points (< 1K LOC or 1-3 features)
 * - SMALL: 1 point (1K-5K LOC or 4-10 features)
 * - MEDIUM: 2 points (5K-20K LOC or 11-30 features)
 * - LARGE: 3 points (20K-100K LOC or 31-100 features)
 * - VERY_LARGE: 4 points (100K-500K LOC or 100+ features)
 * - MASSIVE: 5 points (500K+ LOC or enterprise-scale)
 *
 * @param size - Project size enum value
 * @returns Score (0-5 points)
 */
export function scoreProjectSize(size: ProjectSize): number {
  return size; // Direct mapping: enum values are 0-5
}

/**
 * Score team size criterion (0-5 points)
 *
 * Maps team size enum to complexity points:
 * - SOLO: 0 points (solo developer)
 * - SMALL: 1 point (2-3 developers)
 * - MEDIUM: 2 points (4-6 developers)
 * - LARGE: 3 points (7-15 developers)
 * - VERY_LARGE: 4 points (16-50 developers)
 * - ENTERPRISE: 5 points (50+ developers)
 *
 * @param size - Team size enum value
 * @returns Score (0-5 points)
 */
export function scoreTeamSize(size: TeamSize): number {
  return size; // Direct mapping: enum values are 0-5
}

/**
 * Score codebase complexity criterion (0-5 points)
 *
 * Maps codebase complexity enum to complexity points:
 * - TRIVIAL: 0 points (simple scripts, single file)
 * - SIMPLE: 1 point (basic app, minimal dependencies)
 * - MODERATE: 2 points (modular architecture, standard dependencies)
 * - COMPLEX: 3 points (microservices, multiple repos)
 * - VERY_COMPLEX: 4 points (distributed systems, complex patterns)
 * - EXTREME: 5 points (large-scale distributed, advanced patterns)
 *
 * @param complexity - Codebase complexity enum value
 * @returns Score (0-5 points)
 */
export function scoreCodebase(complexity: CodebaseComplexity): number {
  return complexity; // Direct mapping: enum values are 0-5
}

/**
 * Score external integrations criterion (0-5 points)
 *
 * Maps integrations count enum to complexity points:
 * - NONE: 0 points (no external integrations)
 * - FEW: 1 point (1-2 simple APIs)
 * - SOME: 2 points (3-5 APIs or services)
 * - MANY: 3 points (6-10 integrations)
 * - VERY_MANY: 4 points (11-20 integrations)
 * - EXTENSIVE: 5 points (20+ complex integrations)
 *
 * @param count - Integrations count enum value
 * @returns Score (0-5 points)
 */
export function scoreIntegrations(count: IntegrationsCount): number {
  return count; // Direct mapping: enum values are 0-5
}

/**
 * Score user base criterion (0-5 points)
 *
 * Maps user base enum to complexity points:
 * - PERSONAL: 0 points (personal project, < 10 users)
 * - INTERNAL: 1 point (internal tool, 10-100 users)
 * - SMALL: 2 points (small business, 100-1K users)
 * - MEDIUM: 3 points (medium business, 1K-10K users)
 * - LARGE: 4 points (large business, 10K-100K users)
 * - MASSIVE: 5 points (enterprise/public, 100K+ users)
 *
 * @param base - User base enum value
 * @returns Score (0-5 points)
 */
export function scoreUserBase(base: UserBase): number {
  return base; // Direct mapping: enum values are 0-5
}

/**
 * Score security requirements criterion (0-5 points)
 *
 * Maps security level enum to complexity points:
 * - NONE: 0 points (no sensitive data)
 * - LOW: 1 point (basic auth, non-sensitive data)
 * - MODERATE: 2 points (user data, standard security)
 * - HIGH: 3 points (PII, payment data, GDPR)
 * - VERY_HIGH: 4 points (healthcare HIPAA, financial PCI-DSS)
 * - CRITICAL: 5 points (government, military, critical infrastructure)
 *
 * @param level - Security level enum value
 * @returns Score (0-5 points)
 */
export function scoreSecurity(level: SecurityLevel): number {
  return level; // Direct mapping: enum values are 0-5
}

/**
 * Score project duration criterion (0-5 points)
 *
 * Maps project duration enum to complexity points:
 * - VERY_SHORT: 0 points (< 1 week)
 * - SHORT: 1 point (1-4 weeks)
 * - MEDIUM: 2 points (1-3 months)
 * - LONG: 3 points (3-6 months)
 * - VERY_LONG: 4 points (6-12 months)
 * - INDEFINITE: 5 points (12+ months, ongoing)
 *
 * @param duration - Project duration enum value
 * @returns Score (0-5 points)
 */
export function scoreDuration(duration: ProjectDuration): number {
  return duration; // Direct mapping: enum values are 0-5
}

/**
 * Score existing codebase criterion (0-5 points)
 *
 * Maps existing codebase enum to complexity points:
 * - GREENFIELD: 0 points (greenfield, no existing code)
 * - MINOR_REFACTOR: 1 point (small refactor, < 20% changes)
 * - MODERATE_REFACTOR: 2 points (moderate refactor, 20-50% changes)
 * - MAJOR_REFACTOR: 3 points (major refactor, 50-80% changes)
 * - LEGACY_MODERNIZATION: 4 points (legacy modernization, 80%+ changes)
 * - FULL_REWRITE: 5 points (complete rewrite of large system)
 *
 * @param existingCode - Existing codebase enum value
 * @returns Score (0-5 points)
 */
export function scoreExistingCode(existingCode: ExistingCodebase): number {
  return existingCode; // Direct mapping: enum values are 0-5
}

/**
 * Apply configuration filters to breakdown
 *
 * Zeros out scores for disabled criteria based on configuration.
 *
 * @param breakdown - Raw complexity breakdown
 * @param config - Assessment configuration (optional)
 * @returns Filtered breakdown with disabled criteria set to 0
 */
function applyConfigFilters(
  breakdown: ComplexityBreakdown,
  config?: ComplexityAssessmentConfig
): ComplexityBreakdown {
  if (!config?.enabledCriteria) {
    return breakdown; // No filters, return as-is
  }

  const enabled = config.enabledCriteria;
  return {
    projectSize: enabled.projectSize !== false ? breakdown.projectSize : 0,
    teamSize: enabled.teamSize !== false ? breakdown.teamSize : 0,
    codebaseComplexity: enabled.codebaseComplexity !== false ? breakdown.codebaseComplexity : 0,
    integrations: enabled.integrations !== false ? breakdown.integrations : 0,
    userBase: enabled.userBase !== false ? breakdown.userBase : 0,
    security: enabled.security !== false ? breakdown.security : 0,
    duration: enabled.duration !== false ? breakdown.duration : 0,
    existingCode: enabled.existingCode !== false ? breakdown.existingCode : 0,
  };
}

/**
 * Calculate total score from breakdown
 *
 * Sums all criterion scores to get total complexity score (0-40).
 *
 * @param breakdown - Complexity breakdown with individual scores
 * @returns Total score (0-40 points)
 */
function calculateTotalScore(breakdown: ComplexityBreakdown): number {
  return (
    breakdown.projectSize +
    breakdown.teamSize +
    breakdown.codebaseComplexity +
    breakdown.integrations +
    breakdown.userBase +
    breakdown.security +
    breakdown.duration +
    breakdown.existingCode
  );
}

/**
 * Get recommended workflow name for level
 *
 * Returns workflow filename based on level, with optional custom override.
 *
 * @param level - Complexity level (0-4)
 * @param config - Assessment configuration (optional)
 * @returns Workflow filename (e.g., "standard-workflow.yaml")
 */
function getRecommendedWorkflow(
  level: ComplexityLevel,
  config?: ComplexityAssessmentConfig
): string {
  // Check for custom workflow name override
  if (config?.workflowNames?.[level]) {
    return config.workflowNames[level]!;
  }

  // Use default from metadata
  return getLevelMetadata(level).workflow;
}

/**
 * Assess project complexity
 *
 * Main entry point for complexity assessment. Evaluates project across 8 criteria,
 * calculates total score (0-40 points), and determines complexity level (0-4).
 *
 * Scoring breakdown:
 * - Each of 8 criteria scores 0-5 points
 * - Total score: 0-40 points
 * - Level mapping:
 *   - Level 0 (MINIMAL): 0-5 points
 *   - Level 1 (BASIC): 6-12 points
 *   - Level 2 (STANDARD): 13-20 points
 *   - Level 3 (COMPREHENSIVE): 21-30 points
 *   - Level 4 (ENTERPRISE): 31-40 points
 *
 * @param input - Project input with 8 criterion values
 * @param config - Optional configuration for assessment behavior
 * @returns Complete complexity assessment result
 * @throws Error if input validation fails (invalid criterion values)
 *
 * @example
 * ```typescript
 * const result = assessComplexity({
 *   projectSize: ProjectSize.LARGE,
 *   teamSize: TeamSize.MEDIUM,
 *   codebaseComplexity: CodebaseComplexity.COMPLEX,
 *   integrations: IntegrationsCount.MANY,
 *   userBase: UserBase.LARGE,
 *   security: SecurityLevel.HIGH,
 *   duration: ProjectDuration.LONG,
 *   existingCode: ExistingCodebase.MODERATE_REFACTOR,
 * });
 * // result.totalScore = 24
 * // result.level = ComplexityLevel.COMPREHENSIVE
 * // result.levelName = "Comprehensive"
 * ```
 */
export function assessComplexity(
  input: ProjectInput,
  config?: ComplexityAssessmentConfig
): ComplexityResult {
  // Validate input (throws if invalid)
  validateProjectInput(input);

  // Score each criterion (0-5 points each)
  const rawBreakdown: ComplexityBreakdown = {
    projectSize: scoreProjectSize(input.projectSize),
    teamSize: scoreTeamSize(input.teamSize),
    codebaseComplexity: scoreCodebase(input.codebaseComplexity),
    integrations: scoreIntegrations(input.integrations),
    userBase: scoreUserBase(input.userBase),
    security: scoreSecurity(input.security),
    duration: scoreDuration(input.duration),
    existingCode: scoreExistingCode(input.existingCode),
  };

  // Apply configuration filters (zero out disabled criteria)
  const breakdown = applyConfigFilters(rawBreakdown, config);

  // Calculate total score (0-40 points)
  const totalScore = calculateTotalScore(breakdown);

  // Determine complexity level (0-4)
  const thresholds = config?.levelThresholds || DEFAULT_LEVEL_THRESHOLDS;
  const level = calculateLevel(totalScore, thresholds);

  // Get level metadata
  const metadata = getLevelMetadata(level);

  // Build result
  const result: ComplexityResult = {
    totalScore,
    level,
    breakdown,
    levelName: metadata.name,
    scoreRange: metadata.scoreRange,
    recommendedWorkflow: getRecommendedWorkflow(level, config),
    assessedAt: new Date(),
  };

  return result;
}

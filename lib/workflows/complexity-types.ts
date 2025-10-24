/**
 * Complexity Assessment Types
 *
 * Defines TypeScript interfaces for project complexity assessment system.
 * Used by the Scale-Adaptive Router (EPIC-V3-001) to determine appropriate
 * workflow levels based on 8 assessment criteria.
 *
 * @module lib/workflows/complexity-types
 */

/**
 * Complexity Level Enum (0-4)
 *
 * Maps total complexity score (0-40 points) to workflow levels:
 * - Level 0 (0-5 points): Minimal - Simple projects, single developer
 * - Level 1 (6-12 points): Basic - Small team, low complexity
 * - Level 2 (13-20 points): Standard - Medium team, moderate complexity
 * - Level 3 (21-30 points): Comprehensive - Large team, high complexity
 * - Level 4 (31-40 points): Enterprise - Very large, mission-critical
 */
export enum ComplexityLevel {
  /** Minimal workflow - Simple projects (0-5 points) */
  MINIMAL = 0,
  /** Basic workflow - Small projects (6-12 points) */
  BASIC = 1,
  /** Standard workflow - Medium projects (13-20 points) */
  STANDARD = 2,
  /** Comprehensive workflow - Large projects (21-30 points) */
  COMPREHENSIVE = 3,
  /** Enterprise workflow - Mission-critical projects (31-40 points) */
  ENTERPRISE = 4,
}

/**
 * Project Size Criterion (0-5 points)
 *
 * Assessed by estimated lines of code, features, or modules.
 */
export enum ProjectSize {
  /** < 1K LOC or 1-3 features */
  TINY = 0,
  /** 1K-5K LOC or 4-10 features */
  SMALL = 1,
  /** 5K-20K LOC or 11-30 features */
  MEDIUM = 2,
  /** 20K-100K LOC or 31-100 features */
  LARGE = 3,
  /** 100K-500K LOC or 100+ features */
  VERY_LARGE = 4,
  /** 500K+ LOC or enterprise-scale */
  MASSIVE = 5,
}

/**
 * Team Size Criterion (0-5 points)
 *
 * Number of developers working on the project.
 */
export enum TeamSize {
  /** Solo developer */
  SOLO = 0,
  /** 2-3 developers */
  SMALL = 1,
  /** 4-6 developers */
  MEDIUM = 2,
  /** 7-15 developers */
  LARGE = 3,
  /** 16-50 developers */
  VERY_LARGE = 4,
  /** 50+ developers */
  ENTERPRISE = 5,
}

/**
 * Codebase Complexity Criterion (0-5 points)
 *
 * Technical complexity of architecture and dependencies.
 */
export enum CodebaseComplexity {
  /** Simple scripts, single file */
  TRIVIAL = 0,
  /** Basic app, minimal dependencies */
  SIMPLE = 1,
  /** Modular architecture, standard dependencies */
  MODERATE = 2,
  /** Microservices, multiple repos */
  COMPLEX = 3,
  /** Distributed systems, complex patterns */
  VERY_COMPLEX = 4,
  /** Large-scale distributed, advanced patterns */
  EXTREME = 5,
}

/**
 * External Integrations Criterion (0-5 points)
 *
 * Number and complexity of third-party integrations.
 */
export enum IntegrationsCount {
  /** No external integrations */
  NONE = 0,
  /** 1-2 simple APIs */
  FEW = 1,
  /** 3-5 APIs or services */
  SOME = 2,
  /** 6-10 integrations */
  MANY = 3,
  /** 11-20 integrations */
  VERY_MANY = 4,
  /** 20+ complex integrations */
  EXTENSIVE = 5,
}

/**
 * User Base Criterion (0-5 points)
 *
 * Number of expected users and usage patterns.
 */
export enum UserBase {
  /** Personal project, < 10 users */
  PERSONAL = 0,
  /** Internal tool, 10-100 users */
  INTERNAL = 1,
  /** Small business, 100-1K users */
  SMALL = 2,
  /** Medium business, 1K-10K users */
  MEDIUM = 3,
  /** Large business, 10K-100K users */
  LARGE = 4,
  /** Enterprise/Public, 100K+ users */
  MASSIVE = 5,
}

/**
 * Security Requirements Criterion (0-5 points)
 *
 * Security, compliance, and regulatory requirements.
 */
export enum SecurityLevel {
  /** No sensitive data */
  NONE = 0,
  /** Basic auth, non-sensitive data */
  LOW = 1,
  /** User data, standard security */
  MODERATE = 2,
  /** PII, payment data, GDPR */
  HIGH = 3,
  /** Healthcare (HIPAA), financial (PCI-DSS) */
  VERY_HIGH = 4,
  /** Government, military, critical infrastructure */
  CRITICAL = 5,
}

/**
 * Project Duration Criterion (0-5 points)
 *
 * Expected project timeline.
 */
export enum ProjectDuration {
  /** < 1 week */
  VERY_SHORT = 0,
  /** 1-4 weeks */
  SHORT = 1,
  /** 1-3 months */
  MEDIUM = 2,
  /** 3-6 months */
  LONG = 3,
  /** 6-12 months */
  VERY_LONG = 4,
  /** 12+ months, ongoing */
  INDEFINITE = 5,
}

/**
 * Existing Codebase Criterion (0-5 points)
 *
 * Working with existing code vs. greenfield.
 */
export enum ExistingCodebase {
  /** Greenfield, no existing code */
  GREENFIELD = 0,
  /** Small refactor, < 20% changes */
  MINOR_REFACTOR = 1,
  /** Moderate refactor, 20-50% changes */
  MODERATE_REFACTOR = 2,
  /** Major refactor, 50-80% changes */
  MAJOR_REFACTOR = 3,
  /** Legacy modernization, 80%+ changes */
  LEGACY_MODERNIZATION = 4,
  /** Complete rewrite of large system */
  FULL_REWRITE = 5,
}

/**
 * Project Input Data
 *
 * Raw input from user for complexity assessment.
 * Each criterion is scored 0-5 points (8 criteria = 40 points max).
 */
export interface ProjectInput {
  /** Project size assessment (0-5) */
  projectSize: ProjectSize;
  /** Team size assessment (0-5) */
  teamSize: TeamSize;
  /** Codebase complexity (0-5) */
  codebaseComplexity: CodebaseComplexity;
  /** External integrations count (0-5) */
  integrations: IntegrationsCount;
  /** User base size (0-5) */
  userBase: UserBase;
  /** Security requirements (0-5) */
  security: SecurityLevel;
  /** Project duration (0-5) */
  duration: ProjectDuration;
  /** Existing codebase impact (0-5) */
  existingCode: ExistingCodebase;
}

/**
 * Complexity Assessment Breakdown
 *
 * Detailed breakdown of how each criterion contributes to total score.
 */
export interface ComplexityBreakdown {
  /** Project size score (0-5) */
  projectSize: number;
  /** Team size score (0-5) */
  teamSize: number;
  /** Codebase complexity score (0-5) */
  codebaseComplexity: number;
  /** Integrations count score (0-5) */
  integrations: number;
  /** User base score (0-5) */
  userBase: number;
  /** Security level score (0-5) */
  security: number;
  /** Duration score (0-5) */
  duration: number;
  /** Existing code impact score (0-5) */
  existingCode: number;
}

/**
 * Complexity Assessment Result
 *
 * Complete result of complexity assessment with score, level, and metadata.
 */
export interface ComplexityResult {
  /** Total complexity score (0-40 points) */
  totalScore: number;
  /** Determined complexity level (0-4) */
  level: ComplexityLevel;
  /** Detailed score breakdown by criterion */
  breakdown: ComplexityBreakdown;
  /** Human-readable level name */
  levelName: string;
  /** Score range for this level */
  scoreRange: string;
  /** Recommended workflow name */
  recommendedWorkflow: string;
  /** Assessment timestamp */
  assessedAt: Date;
  /** Optional: Manual override information */
  override?: {
    /** Original calculated level before override */
    originalLevel: ComplexityLevel;
    /** New level after override */
    overrideLevel: ComplexityLevel;
    /** Reason for manual override */
    reason: string;
    /** Who performed the override */
    overriddenBy?: string;
    /** When the override occurred */
    overriddenAt: Date;
  };
}

/**
 * Complexity Assessment Configuration
 *
 * Optional configuration for assessment behavior.
 */
export interface ComplexityAssessmentConfig {
  /** Custom score thresholds for levels (default: [6, 13, 21, 31]) */
  levelThresholds?: [number, number, number, number];
  /** Enable/disable specific criteria */
  enabledCriteria?: {
    projectSize?: boolean;
    teamSize?: boolean;
    codebaseComplexity?: boolean;
    integrations?: boolean;
    userBase?: boolean;
    security?: boolean;
    duration?: boolean;
    existingCode?: boolean;
  };
  /** Custom workflow names per level */
  workflowNames?: {
    [key in ComplexityLevel]?: string;
  };
}

/**
 * Complexity Assessment
 *
 * Main interface for performing complexity assessments.
 * Exported for use by assessment functions.
 */
export interface ComplexityAssessment {
  /** Project input data */
  input: ProjectInput;
  /** Assessment result */
  result: ComplexityResult;
  /** Optional configuration */
  config?: ComplexityAssessmentConfig;
}

/**
 * Level Metadata
 *
 * Descriptive information about each complexity level.
 */
export interface LevelMetadata {
  /** Complexity level (0-4) */
  level: ComplexityLevel;
  /** Human-readable name */
  name: string;
  /** Score range string (e.g., "0-5") */
  scoreRange: string;
  /** Minimum score for this level */
  minScore: number;
  /** Maximum score for this level */
  maxScore: number;
  /** Recommended workflow file name */
  workflow: string;
  /** Description of this level */
  description: string;
  /** Typical use cases */
  useCases: string[];
}

/**
 * Level Metadata Map
 *
 * Predefined metadata for all 5 complexity levels.
 */
export const LEVEL_METADATA: Record<ComplexityLevel, LevelMetadata> = {
  [ComplexityLevel.MINIMAL]: {
    level: ComplexityLevel.MINIMAL,
    name: 'Minimal',
    scoreRange: '0-5',
    minScore: 0,
    maxScore: 5,
    workflow: 'minimal-workflow.yaml',
    description: 'Simple projects with minimal planning overhead',
    useCases: [
      'Solo developer projects',
      'Proof-of-concept prototypes',
      'Small scripts or utilities',
      'Personal projects',
    ],
  },
  [ComplexityLevel.BASIC]: {
    level: ComplexityLevel.BASIC,
    name: 'Basic',
    scoreRange: '6-12',
    minScore: 6,
    maxScore: 12,
    workflow: 'basic-workflow.yaml',
    description: 'Small team projects with basic planning',
    useCases: [
      'Small team (2-3 developers)',
      'Simple web applications',
      'Internal tools',
      'MVPs with limited scope',
    ],
  },
  [ComplexityLevel.STANDARD]: {
    level: ComplexityLevel.STANDARD,
    name: 'Standard',
    scoreRange: '13-20',
    minScore: 13,
    maxScore: 20,
    workflow: 'standard-workflow.yaml',
    description: 'Medium-sized projects with structured planning',
    useCases: [
      'Medium teams (4-6 developers)',
      'Standard business applications',
      'Moderate complexity features',
      'Typical SaaS products',
    ],
  },
  [ComplexityLevel.COMPREHENSIVE]: {
    level: ComplexityLevel.COMPREHENSIVE,
    name: 'Comprehensive',
    scoreRange: '21-30',
    minScore: 21,
    maxScore: 30,
    workflow: 'comprehensive-workflow.yaml',
    description: 'Large projects with comprehensive planning',
    useCases: [
      'Large teams (7-15 developers)',
      'Complex multi-tier systems',
      'High-stakes business applications',
      'Security-critical systems',
    ],
  },
  [ComplexityLevel.ENTERPRISE]: {
    level: ComplexityLevel.ENTERPRISE,
    name: 'Enterprise',
    scoreRange: '31-40',
    minScore: 31,
    maxScore: 40,
    workflow: 'enterprise-workflow.yaml',
    description: 'Mission-critical enterprise systems',
    useCases: [
      'Very large teams (16+ developers)',
      'Distributed systems at scale',
      'Regulatory compliance required',
      'Public-facing critical infrastructure',
    ],
  },
};

/**
 * Default level thresholds
 *
 * Score boundaries for each level transition.
 * [Level 1 min, Level 2 min, Level 3 min, Level 4 min]
 */
export const DEFAULT_LEVEL_THRESHOLDS: [number, number, number, number] = [6, 13, 21, 31];

/**
 * Calculate complexity level from total score
 *
 * @param totalScore - Total complexity score (0-40)
 * @param thresholds - Custom thresholds (optional)
 * @returns Complexity level (0-4)
 */
export function calculateLevel(
  totalScore: number,
  thresholds: [number, number, number, number] = DEFAULT_LEVEL_THRESHOLDS
): ComplexityLevel {
  if (totalScore < thresholds[0]) return ComplexityLevel.MINIMAL;
  if (totalScore < thresholds[1]) return ComplexityLevel.BASIC;
  if (totalScore < thresholds[2]) return ComplexityLevel.STANDARD;
  if (totalScore < thresholds[3]) return ComplexityLevel.COMPREHENSIVE;
  return ComplexityLevel.ENTERPRISE;
}

/**
 * Get level metadata by complexity level
 *
 * @param level - Complexity level (0-4)
 * @returns Level metadata
 */
export function getLevelMetadata(level: ComplexityLevel): LevelMetadata {
  return LEVEL_METADATA[level];
}

/**
 * Validate project input
 *
 * Ensures all criteria are within valid range (0-5).
 *
 * @param input - Project input to validate
 * @throws Error if any criterion is out of range
 */
export function validateProjectInput(input: ProjectInput): void {
  const criteria = [
    { name: 'projectSize', value: input.projectSize },
    { name: 'teamSize', value: input.teamSize },
    { name: 'codebaseComplexity', value: input.codebaseComplexity },
    { name: 'integrations', value: input.integrations },
    { name: 'userBase', value: input.userBase },
    { name: 'security', value: input.security },
    { name: 'duration', value: input.duration },
    { name: 'existingCode', value: input.existingCode },
  ];

  for (const criterion of criteria) {
    if (criterion.value < 0 || criterion.value > 5) {
      throw new Error(`Invalid ${criterion.name}: ${criterion.value}. Must be between 0 and 5.`);
    }
  }
}

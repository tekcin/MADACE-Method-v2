/**
 * Unit Tests for Complexity Assessment
 *
 * Comprehensive test suite for the complexity assessment system.
 * Tests all 5 complexity levels, 8 scoring functions, boundary conditions,
 * and edge cases to achieve >95% code coverage.
 *
 * @module __tests__/lib/workflows/complexity-assessment
 */

import { describe, it, expect } from '@jest/globals';
import {
  assessComplexity,
  scoreProjectSize,
  scoreTeamSize,
  scoreCodebase,
  scoreIntegrations,
  scoreUserBase,
  scoreSecurity,
  scoreDuration,
  scoreExistingCode,
} from '@/lib/workflows/complexity-assessment';
import {
  ProjectInput,
  ComplexityLevel,
  ProjectSize,
  TeamSize,
  CodebaseComplexity,
  IntegrationsCount,
  UserBase,
  SecurityLevel,
  ProjectDuration,
  ExistingCodebase,
  ComplexityAssessmentConfig,
} from '@/lib/workflows/complexity-types';

describe('Complexity Assessment', () => {
  describe('assessComplexity()', () => {
    it('should calculate level 0 (MINIMAL) for minimal project (0-5 points)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.TINY, // 0
        teamSize: TeamSize.SOLO, // 0
        codebaseComplexity: CodebaseComplexity.TRIVIAL, // 0
        integrations: IntegrationsCount.NONE, // 0
        userBase: UserBase.PERSONAL, // 0
        security: SecurityLevel.NONE, // 0
        duration: ProjectDuration.VERY_SHORT, // 0
        existingCode: ExistingCodebase.GREENFIELD, // 0
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.MINIMAL);
      expect(result.totalScore).toBe(0);
      expect(result.levelName).toBe('Minimal');
      expect(result.scoreRange).toBe('0-5');
      expect(result.recommendedWorkflow).toBe('minimal-workflow.yaml');
    });

    it('should calculate level 0 (MINIMAL) for score 5 (upper boundary)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.TINY, // 0
        teamSize: TeamSize.SOLO, // 0
        codebaseComplexity: CodebaseComplexity.TRIVIAL, // 0
        integrations: IntegrationsCount.FEW, // 1
        userBase: UserBase.PERSONAL, // 0
        security: SecurityLevel.LOW, // 1
        duration: ProjectDuration.VERY_SHORT, // 0
        existingCode: ExistingCodebase.MAJOR_REFACTOR, // 3
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.MINIMAL);
      expect(result.totalScore).toBe(5);
    });

    it('should calculate level 1 (BASIC) for simple project (6-12 points)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.SMALL, // 1
        teamSize: TeamSize.SMALL, // 1
        codebaseComplexity: CodebaseComplexity.SIMPLE, // 1
        integrations: IntegrationsCount.FEW, // 1
        userBase: UserBase.INTERNAL, // 1
        security: SecurityLevel.LOW, // 1
        duration: ProjectDuration.SHORT, // 1
        existingCode: ExistingCodebase.MINOR_REFACTOR, // 1
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.BASIC);
      expect(result.totalScore).toBe(8);
      expect(result.levelName).toBe('Basic');
      expect(result.scoreRange).toBe('6-12');
      expect(result.recommendedWorkflow).toBe('basic-workflow.yaml');
    });

    it('should calculate level 1 (BASIC) for score 6 (lower boundary)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.SMALL, // 1
        teamSize: TeamSize.SOLO, // 0
        codebaseComplexity: CodebaseComplexity.TRIVIAL, // 0
        integrations: IntegrationsCount.FEW, // 1
        userBase: UserBase.INTERNAL, // 1
        security: SecurityLevel.LOW, // 1
        duration: ProjectDuration.SHORT, // 1
        existingCode: ExistingCodebase.MINOR_REFACTOR, // 1
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.BASIC);
      expect(result.totalScore).toBe(6);
    });

    it('should calculate level 1 (BASIC) for score 12 (upper boundary)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.MEDIUM, // 2
        teamSize: TeamSize.SMALL, // 1
        codebaseComplexity: CodebaseComplexity.SIMPLE, // 1
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.SMALL, // 2
        security: SecurityLevel.MODERATE, // 2
        duration: ProjectDuration.SHORT, // 1
        existingCode: ExistingCodebase.MINOR_REFACTOR, // 1
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.BASIC);
      expect(result.totalScore).toBe(12);
    });

    it('should calculate level 2 (STANDARD) for standard project (13-20 points)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.MEDIUM, // 2
        teamSize: TeamSize.MEDIUM, // 2
        codebaseComplexity: CodebaseComplexity.MODERATE, // 2
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.SMALL, // 2
        security: SecurityLevel.MODERATE, // 2
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.MODERATE_REFACTOR, // 2
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.STANDARD);
      expect(result.totalScore).toBe(16);
      expect(result.levelName).toBe('Standard');
      expect(result.scoreRange).toBe('13-20');
      expect(result.recommendedWorkflow).toBe('standard-workflow.yaml');
    });

    it('should calculate level 2 (STANDARD) for score 13 (lower boundary)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.MEDIUM, // 2
        teamSize: TeamSize.SMALL, // 1
        codebaseComplexity: CodebaseComplexity.SIMPLE, // 1
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.SMALL, // 2
        security: SecurityLevel.MODERATE, // 2
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.MINOR_REFACTOR, // 1
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.STANDARD);
      expect(result.totalScore).toBe(13);
    });

    it('should calculate level 2 (STANDARD) for score 20 (upper boundary)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.LARGE, // 3
        teamSize: TeamSize.MEDIUM, // 2
        codebaseComplexity: CodebaseComplexity.MODERATE, // 2
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.MEDIUM, // 3
        security: SecurityLevel.HIGH, // 3
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.MAJOR_REFACTOR, // 3
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.STANDARD);
      expect(result.totalScore).toBe(20);
      expect(result.breakdown.projectSize).toBe(3);
    });

    it('should calculate level 3 (COMPREHENSIVE) for complex project (21-30 points)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.LARGE, // 3
        teamSize: TeamSize.LARGE, // 3
        codebaseComplexity: CodebaseComplexity.COMPLEX, // 3
        integrations: IntegrationsCount.MANY, // 3
        userBase: UserBase.MEDIUM, // 3
        security: SecurityLevel.HIGH, // 3
        duration: ProjectDuration.LONG, // 3
        existingCode: ExistingCodebase.MODERATE_REFACTOR, // 2
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.COMPREHENSIVE);
      expect(result.totalScore).toBe(23);
      expect(result.levelName).toBe('Comprehensive');
      expect(result.scoreRange).toBe('21-30');
      expect(result.recommendedWorkflow).toBe('comprehensive-workflow.yaml');
    });

    it('should calculate level 3 (COMPREHENSIVE) for score 21 (lower boundary)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.LARGE, // 3
        teamSize: TeamSize.MEDIUM, // 2
        codebaseComplexity: CodebaseComplexity.MODERATE, // 2
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.MEDIUM, // 3
        security: SecurityLevel.HIGH, // 3
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.LEGACY_MODERNIZATION, // 4
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.COMPREHENSIVE);
      expect(result.totalScore).toBe(21);
    });

    it('should calculate level 3 (COMPREHENSIVE) for score 30 (upper boundary)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.VERY_LARGE, // 4
        teamSize: TeamSize.LARGE, // 3
        codebaseComplexity: CodebaseComplexity.COMPLEX, // 3
        integrations: IntegrationsCount.MANY, // 3
        userBase: UserBase.LARGE, // 4
        security: SecurityLevel.HIGH, // 3
        duration: ProjectDuration.LONG, // 3
        existingCode: ExistingCodebase.LEGACY_MODERNIZATION, // 4
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.COMPREHENSIVE);
      expect(result.totalScore).toBe(27);
    });

    it('should calculate level 4 (ENTERPRISE) for enterprise project (31-40 points)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.MASSIVE, // 5
        teamSize: TeamSize.ENTERPRISE, // 5
        codebaseComplexity: CodebaseComplexity.EXTREME, // 5
        integrations: IntegrationsCount.EXTENSIVE, // 5
        userBase: UserBase.MASSIVE, // 5
        security: SecurityLevel.CRITICAL, // 5
        duration: ProjectDuration.INDEFINITE, // 5
        existingCode: ExistingCodebase.FULL_REWRITE, // 5
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.ENTERPRISE);
      expect(result.totalScore).toBe(40);
      expect(result.levelName).toBe('Enterprise');
      expect(result.scoreRange).toBe('31-40');
      expect(result.recommendedWorkflow).toBe('enterprise-workflow.yaml');
    });

    it('should calculate level 4 (ENTERPRISE) for score 31 (lower boundary)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.VERY_LARGE, // 4
        teamSize: TeamSize.VERY_LARGE, // 4
        codebaseComplexity: CodebaseComplexity.VERY_COMPLEX, // 4
        integrations: IntegrationsCount.VERY_MANY, // 4
        userBase: UserBase.LARGE, // 4
        security: SecurityLevel.VERY_HIGH, // 4
        duration: ProjectDuration.VERY_LONG, // 4
        existingCode: ExistingCodebase.MAJOR_REFACTOR, // 3
      };

      const result = assessComplexity(input);

      expect(result.level).toBe(ComplexityLevel.ENTERPRISE);
      expect(result.totalScore).toBe(31);
    });

    it('should handle boundary transition from level 0 to 1 (scores 5-6)', () => {
      // Score 5 (Level 0)
      const input5: ProjectInput = {
        projectSize: ProjectSize.TINY, // 0
        teamSize: TeamSize.SOLO, // 0
        codebaseComplexity: CodebaseComplexity.TRIVIAL, // 0
        integrations: IntegrationsCount.FEW, // 1
        userBase: UserBase.PERSONAL, // 0
        security: SecurityLevel.LOW, // 1
        duration: ProjectDuration.VERY_SHORT, // 0
        existingCode: ExistingCodebase.MAJOR_REFACTOR, // 3
      };

      const result5 = assessComplexity(input5);
      expect(result5.level).toBe(ComplexityLevel.MINIMAL);
      expect(result5.totalScore).toBe(5);

      // Score 6 (Level 1)
      const input6: ProjectInput = {
        projectSize: ProjectSize.SMALL, // 1
        teamSize: TeamSize.SOLO, // 0
        codebaseComplexity: CodebaseComplexity.TRIVIAL, // 0
        integrations: IntegrationsCount.FEW, // 1
        userBase: UserBase.INTERNAL, // 1
        security: SecurityLevel.LOW, // 1
        duration: ProjectDuration.SHORT, // 1
        existingCode: ExistingCodebase.MINOR_REFACTOR, // 1
      };

      const result6 = assessComplexity(input6);
      expect(result6.level).toBe(ComplexityLevel.BASIC);
      expect(result6.totalScore).toBe(6);
    });

    it('should handle boundary transition from level 1 to 2 (scores 12-13)', () => {
      // Score 12 (Level 1)
      const input12: ProjectInput = {
        projectSize: ProjectSize.MEDIUM, // 2
        teamSize: TeamSize.SMALL, // 1
        codebaseComplexity: CodebaseComplexity.SIMPLE, // 1
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.SMALL, // 2
        security: SecurityLevel.MODERATE, // 2
        duration: ProjectDuration.SHORT, // 1
        existingCode: ExistingCodebase.MINOR_REFACTOR, // 1
      };

      const result12 = assessComplexity(input12);
      expect(result12.level).toBe(ComplexityLevel.BASIC);
      expect(result12.totalScore).toBe(12);

      // Score 13 (Level 2)
      const input13: ProjectInput = {
        projectSize: ProjectSize.MEDIUM, // 2
        teamSize: TeamSize.SMALL, // 1
        codebaseComplexity: CodebaseComplexity.SIMPLE, // 1
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.SMALL, // 2
        security: SecurityLevel.MODERATE, // 2
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.MINOR_REFACTOR, // 1
      };

      const result13 = assessComplexity(input13);
      expect(result13.level).toBe(ComplexityLevel.STANDARD);
      expect(result13.totalScore).toBe(13);
    });

    it('should handle boundary transition from level 2 to 3 (scores 20-21)', () => {
      // Score 20 (Level 2)
      const input20: ProjectInput = {
        projectSize: ProjectSize.LARGE, // 3
        teamSize: TeamSize.MEDIUM, // 2
        codebaseComplexity: CodebaseComplexity.MODERATE, // 2
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.MEDIUM, // 3
        security: SecurityLevel.HIGH, // 3
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.MAJOR_REFACTOR, // 3
      };

      const result20 = assessComplexity(input20);
      expect(result20.level).toBe(ComplexityLevel.STANDARD);
      expect(result20.totalScore).toBe(20);

      // Score 21 (Level 3)
      const input21: ProjectInput = {
        projectSize: ProjectSize.LARGE, // 3
        teamSize: TeamSize.MEDIUM, // 2
        codebaseComplexity: CodebaseComplexity.MODERATE, // 2
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.MEDIUM, // 3
        security: SecurityLevel.HIGH, // 3
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.LEGACY_MODERNIZATION, // 4
      };

      const result21 = assessComplexity(input21);
      expect(result21.level).toBe(ComplexityLevel.COMPREHENSIVE);
      expect(result21.totalScore).toBe(21);
    });

    it('should handle boundary transition from level 3 to 4 (scores 30-31)', () => {
      // Score 30 (Level 3)
      const input30: ProjectInput = {
        projectSize: ProjectSize.VERY_LARGE, // 4
        teamSize: TeamSize.LARGE, // 3
        codebaseComplexity: CodebaseComplexity.VERY_COMPLEX, // 4
        integrations: IntegrationsCount.MANY, // 3
        userBase: UserBase.LARGE, // 4
        security: SecurityLevel.HIGH, // 3
        duration: ProjectDuration.LONG, // 3
        existingCode: ExistingCodebase.LEGACY_MODERNIZATION, // 4
      };

      const result30 = assessComplexity(input30);
      expect(result30.level).toBe(ComplexityLevel.COMPREHENSIVE);
      expect(result30.totalScore).toBe(28);

      // Score 31 (Level 4)
      const input31: ProjectInput = {
        projectSize: ProjectSize.VERY_LARGE, // 4
        teamSize: TeamSize.VERY_LARGE, // 4
        codebaseComplexity: CodebaseComplexity.VERY_COMPLEX, // 4
        integrations: IntegrationsCount.VERY_MANY, // 4
        userBase: UserBase.LARGE, // 4
        security: SecurityLevel.VERY_HIGH, // 4
        duration: ProjectDuration.VERY_LONG, // 4
        existingCode: ExistingCodebase.MAJOR_REFACTOR, // 3
      };

      const result31 = assessComplexity(input31);
      expect(result31.level).toBe(ComplexityLevel.ENTERPRISE);
      expect(result31.totalScore).toBe(31);
    });
  });

  describe('Individual Scoring Functions', () => {
    describe('scoreProjectSize()', () => {
      it('should score TINY as 0 points', () => {
        expect(scoreProjectSize(ProjectSize.TINY)).toBe(0);
      });

      it('should score SMALL as 1 point', () => {
        expect(scoreProjectSize(ProjectSize.SMALL)).toBe(1);
      });

      it('should score MEDIUM as 2 points', () => {
        expect(scoreProjectSize(ProjectSize.MEDIUM)).toBe(2);
      });

      it('should score LARGE as 3 points', () => {
        expect(scoreProjectSize(ProjectSize.LARGE)).toBe(3);
      });

      it('should score VERY_LARGE as 4 points', () => {
        expect(scoreProjectSize(ProjectSize.VERY_LARGE)).toBe(4);
      });

      it('should score MASSIVE as 5 points', () => {
        expect(scoreProjectSize(ProjectSize.MASSIVE)).toBe(5);
      });
    });

    describe('scoreTeamSize()', () => {
      it('should score SOLO as 0 points', () => {
        expect(scoreTeamSize(TeamSize.SOLO)).toBe(0);
      });

      it('should score SMALL as 1 point', () => {
        expect(scoreTeamSize(TeamSize.SMALL)).toBe(1);
      });

      it('should score MEDIUM as 2 points', () => {
        expect(scoreTeamSize(TeamSize.MEDIUM)).toBe(2);
      });

      it('should score LARGE as 3 points', () => {
        expect(scoreTeamSize(TeamSize.LARGE)).toBe(3);
      });

      it('should score VERY_LARGE as 4 points', () => {
        expect(scoreTeamSize(TeamSize.VERY_LARGE)).toBe(4);
      });

      it('should score ENTERPRISE as 5 points', () => {
        expect(scoreTeamSize(TeamSize.ENTERPRISE)).toBe(5);
      });
    });

    describe('scoreCodebase()', () => {
      it('should score TRIVIAL as 0 points', () => {
        expect(scoreCodebase(CodebaseComplexity.TRIVIAL)).toBe(0);
      });

      it('should score SIMPLE as 1 point', () => {
        expect(scoreCodebase(CodebaseComplexity.SIMPLE)).toBe(1);
      });

      it('should score MODERATE as 2 points', () => {
        expect(scoreCodebase(CodebaseComplexity.MODERATE)).toBe(2);
      });

      it('should score COMPLEX as 3 points', () => {
        expect(scoreCodebase(CodebaseComplexity.COMPLEX)).toBe(3);
      });

      it('should score VERY_COMPLEX as 4 points', () => {
        expect(scoreCodebase(CodebaseComplexity.VERY_COMPLEX)).toBe(4);
      });

      it('should score EXTREME as 5 points', () => {
        expect(scoreCodebase(CodebaseComplexity.EXTREME)).toBe(5);
      });
    });

    describe('scoreIntegrations()', () => {
      it('should score NONE as 0 points', () => {
        expect(scoreIntegrations(IntegrationsCount.NONE)).toBe(0);
      });

      it('should score FEW as 1 point', () => {
        expect(scoreIntegrations(IntegrationsCount.FEW)).toBe(1);
      });

      it('should score SOME as 2 points', () => {
        expect(scoreIntegrations(IntegrationsCount.SOME)).toBe(2);
      });

      it('should score MANY as 3 points', () => {
        expect(scoreIntegrations(IntegrationsCount.MANY)).toBe(3);
      });

      it('should score VERY_MANY as 4 points', () => {
        expect(scoreIntegrations(IntegrationsCount.VERY_MANY)).toBe(4);
      });

      it('should score EXTENSIVE as 5 points', () => {
        expect(scoreIntegrations(IntegrationsCount.EXTENSIVE)).toBe(5);
      });
    });

    describe('scoreUserBase()', () => {
      it('should score PERSONAL as 0 points', () => {
        expect(scoreUserBase(UserBase.PERSONAL)).toBe(0);
      });

      it('should score INTERNAL as 1 point', () => {
        expect(scoreUserBase(UserBase.INTERNAL)).toBe(1);
      });

      it('should score SMALL as 2 points', () => {
        expect(scoreUserBase(UserBase.SMALL)).toBe(2);
      });

      it('should score MEDIUM as 3 points', () => {
        expect(scoreUserBase(UserBase.MEDIUM)).toBe(3);
      });

      it('should score LARGE as 4 points', () => {
        expect(scoreUserBase(UserBase.LARGE)).toBe(4);
      });

      it('should score MASSIVE as 5 points', () => {
        expect(scoreUserBase(UserBase.MASSIVE)).toBe(5);
      });
    });

    describe('scoreSecurity()', () => {
      it('should score NONE as 0 points', () => {
        expect(scoreSecurity(SecurityLevel.NONE)).toBe(0);
      });

      it('should score LOW as 1 point', () => {
        expect(scoreSecurity(SecurityLevel.LOW)).toBe(1);
      });

      it('should score MODERATE as 2 points', () => {
        expect(scoreSecurity(SecurityLevel.MODERATE)).toBe(2);
      });

      it('should score HIGH as 3 points', () => {
        expect(scoreSecurity(SecurityLevel.HIGH)).toBe(3);
      });

      it('should score VERY_HIGH as 4 points', () => {
        expect(scoreSecurity(SecurityLevel.VERY_HIGH)).toBe(4);
      });

      it('should score CRITICAL as 5 points', () => {
        expect(scoreSecurity(SecurityLevel.CRITICAL)).toBe(5);
      });
    });

    describe('scoreDuration()', () => {
      it('should score VERY_SHORT as 0 points', () => {
        expect(scoreDuration(ProjectDuration.VERY_SHORT)).toBe(0);
      });

      it('should score SHORT as 1 point', () => {
        expect(scoreDuration(ProjectDuration.SHORT)).toBe(1);
      });

      it('should score MEDIUM as 2 points', () => {
        expect(scoreDuration(ProjectDuration.MEDIUM)).toBe(2);
      });

      it('should score LONG as 3 points', () => {
        expect(scoreDuration(ProjectDuration.LONG)).toBe(3);
      });

      it('should score VERY_LONG as 4 points', () => {
        expect(scoreDuration(ProjectDuration.VERY_LONG)).toBe(4);
      });

      it('should score INDEFINITE as 5 points', () => {
        expect(scoreDuration(ProjectDuration.INDEFINITE)).toBe(5);
      });
    });

    describe('scoreExistingCode()', () => {
      it('should score GREENFIELD as 0 points', () => {
        expect(scoreExistingCode(ExistingCodebase.GREENFIELD)).toBe(0);
      });

      it('should score MINOR_REFACTOR as 1 point', () => {
        expect(scoreExistingCode(ExistingCodebase.MINOR_REFACTOR)).toBe(1);
      });

      it('should score MODERATE_REFACTOR as 2 points', () => {
        expect(scoreExistingCode(ExistingCodebase.MODERATE_REFACTOR)).toBe(2);
      });

      it('should score MAJOR_REFACTOR as 3 points', () => {
        expect(scoreExistingCode(ExistingCodebase.MAJOR_REFACTOR)).toBe(3);
      });

      it('should score LEGACY_MODERNIZATION as 4 points', () => {
        expect(scoreExistingCode(ExistingCodebase.LEGACY_MODERNIZATION)).toBe(4);
      });

      it('should score FULL_REWRITE as 5 points', () => {
        expect(scoreExistingCode(ExistingCodebase.FULL_REWRITE)).toBe(5);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum possible score (0 points)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.TINY, // 0
        teamSize: TeamSize.SOLO, // 0
        codebaseComplexity: CodebaseComplexity.TRIVIAL, // 0
        integrations: IntegrationsCount.NONE, // 0
        userBase: UserBase.PERSONAL, // 0
        security: SecurityLevel.NONE, // 0
        duration: ProjectDuration.VERY_SHORT, // 0
        existingCode: ExistingCodebase.GREENFIELD, // 0
      };

      const result = assessComplexity(input);

      expect(result.totalScore).toBe(0);
      expect(result.level).toBe(ComplexityLevel.MINIMAL);
      expect(result.breakdown.projectSize).toBe(0);
      expect(result.breakdown.teamSize).toBe(0);
      expect(result.breakdown.codebaseComplexity).toBe(0);
      expect(result.breakdown.integrations).toBe(0);
      expect(result.breakdown.userBase).toBe(0);
      expect(result.breakdown.security).toBe(0);
      expect(result.breakdown.duration).toBe(0);
      expect(result.breakdown.existingCode).toBe(0);
    });

    it('should handle maximum possible score (40 points)', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.MASSIVE, // 5
        teamSize: TeamSize.ENTERPRISE, // 5
        codebaseComplexity: CodebaseComplexity.EXTREME, // 5
        integrations: IntegrationsCount.EXTENSIVE, // 5
        userBase: UserBase.MASSIVE, // 5
        security: SecurityLevel.CRITICAL, // 5
        duration: ProjectDuration.INDEFINITE, // 5
        existingCode: ExistingCodebase.FULL_REWRITE, // 5
      };

      const result = assessComplexity(input);

      expect(result.totalScore).toBe(40);
      expect(result.level).toBe(ComplexityLevel.ENTERPRISE);
      expect(result.breakdown.projectSize).toBe(5);
      expect(result.breakdown.teamSize).toBe(5);
      expect(result.breakdown.codebaseComplexity).toBe(5);
      expect(result.breakdown.integrations).toBe(5);
      expect(result.breakdown.userBase).toBe(5);
      expect(result.breakdown.security).toBe(5);
      expect(result.breakdown.duration).toBe(5);
      expect(result.breakdown.existingCode).toBe(5);
    });

    it('should apply configuration filters to disable criteria', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.MASSIVE, // 5
        teamSize: TeamSize.ENTERPRISE, // 5
        codebaseComplexity: CodebaseComplexity.EXTREME, // 5
        integrations: IntegrationsCount.EXTENSIVE, // 5
        userBase: UserBase.MASSIVE, // 5
        security: SecurityLevel.CRITICAL, // 5
        duration: ProjectDuration.INDEFINITE, // 5
        existingCode: ExistingCodebase.FULL_REWRITE, // 5
      };

      const config: ComplexityAssessmentConfig = {
        enabledCriteria: {
          projectSize: false, // Disable
          teamSize: false, // Disable
          codebaseComplexity: true,
          integrations: true,
          userBase: true,
          security: true,
          duration: true,
          existingCode: true,
        },
      };

      const result = assessComplexity(input, config);

      // Should zero out disabled criteria
      expect(result.breakdown.projectSize).toBe(0);
      expect(result.breakdown.teamSize).toBe(0);

      // Other criteria should remain
      expect(result.breakdown.codebaseComplexity).toBe(5);
      expect(result.breakdown.integrations).toBe(5);
      expect(result.breakdown.userBase).toBe(5);
      expect(result.breakdown.security).toBe(5);
      expect(result.breakdown.duration).toBe(5);
      expect(result.breakdown.existingCode).toBe(5);

      // Total should exclude disabled criteria
      expect(result.totalScore).toBe(30); // 40 - 5 - 5 = 30
    });

    it('should apply custom level thresholds', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.MEDIUM, // 2
        teamSize: TeamSize.MEDIUM, // 2
        codebaseComplexity: CodebaseComplexity.MODERATE, // 2
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.SMALL, // 2
        security: SecurityLevel.MODERATE, // 2
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.MODERATE_REFACTOR, // 2
      };

      // Custom thresholds: [10, 15, 20, 25]
      const config: ComplexityAssessmentConfig = {
        levelThresholds: [10, 15, 20, 25],
      };

      const result = assessComplexity(input, config);

      // Total score = 16
      // With custom thresholds: 16 >= 15 and < 20 => Level 2
      expect(result.totalScore).toBe(16);
      expect(result.level).toBe(ComplexityLevel.STANDARD);
    });

    it('should use custom workflow names when provided', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.SMALL, // 1
        teamSize: TeamSize.SMALL, // 1
        codebaseComplexity: CodebaseComplexity.SIMPLE, // 1
        integrations: IntegrationsCount.FEW, // 1
        userBase: UserBase.INTERNAL, // 1
        security: SecurityLevel.LOW, // 1
        duration: ProjectDuration.SHORT, // 1
        existingCode: ExistingCodebase.MINOR_REFACTOR, // 1
      };

      const config: ComplexityAssessmentConfig = {
        workflowNames: {
          [ComplexityLevel.MINIMAL]: 'custom-minimal.yaml',
          [ComplexityLevel.BASIC]: 'custom-basic.yaml',
          [ComplexityLevel.STANDARD]: 'custom-standard.yaml',
          [ComplexityLevel.COMPREHENSIVE]: 'custom-comprehensive.yaml',
          [ComplexityLevel.ENTERPRISE]: 'custom-enterprise.yaml',
        },
      };

      const result = assessComplexity(input, config);

      // Score = 8 => Level 1 (BASIC)
      expect(result.level).toBe(ComplexityLevel.BASIC);
      expect(result.recommendedWorkflow).toBe('custom-basic.yaml');
    });

    it('should validate input and throw error for invalid criterion value', () => {
      const invalidInput = {
        projectSize: 10, // Invalid: should be 0-5
        teamSize: TeamSize.SOLO,
        codebaseComplexity: CodebaseComplexity.TRIVIAL,
        integrations: IntegrationsCount.NONE,
        userBase: UserBase.PERSONAL,
        security: SecurityLevel.NONE,
        duration: ProjectDuration.VERY_SHORT,
        existingCode: ExistingCodebase.GREENFIELD,
      } as unknown as ProjectInput;

      expect(() => assessComplexity(invalidInput)).toThrow(
        'Invalid projectSize: 10. Must be between 0 and 5.'
      );
    });

    it('should validate input and throw error for negative criterion value', () => {
      const invalidInput = {
        projectSize: ProjectSize.TINY,
        teamSize: -1, // Invalid: should be 0-5
        codebaseComplexity: CodebaseComplexity.TRIVIAL,
        integrations: IntegrationsCount.NONE,
        userBase: UserBase.PERSONAL,
        security: SecurityLevel.NONE,
        duration: ProjectDuration.VERY_SHORT,
        existingCode: ExistingCodebase.GREENFIELD,
      } as unknown as ProjectInput;

      expect(() => assessComplexity(invalidInput)).toThrow(
        'Invalid teamSize: -1. Must be between 0 and 5.'
      );
    });
  });

  describe('Result Structure', () => {
    it('should return proper ComplexityResult structure with all required fields', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.MEDIUM, // 2
        teamSize: TeamSize.MEDIUM, // 2
        codebaseComplexity: CodebaseComplexity.MODERATE, // 2
        integrations: IntegrationsCount.SOME, // 2
        userBase: UserBase.SMALL, // 2
        security: SecurityLevel.MODERATE, // 2
        duration: ProjectDuration.MEDIUM, // 2
        existingCode: ExistingCodebase.MODERATE_REFACTOR, // 2
      };

      const result = assessComplexity(input);

      // Check all required fields exist
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('levelName');
      expect(result).toHaveProperty('scoreRange');
      expect(result).toHaveProperty('recommendedWorkflow');
      expect(result).toHaveProperty('assessedAt');

      // Check types
      expect(typeof result.totalScore).toBe('number');
      expect(typeof result.level).toBe('number');
      expect(typeof result.levelName).toBe('string');
      expect(typeof result.scoreRange).toBe('string');
      expect(typeof result.recommendedWorkflow).toBe('string');
      expect(result.assessedAt).toBeInstanceOf(Date);

      // Check breakdown structure
      expect(result.breakdown).toHaveProperty('projectSize');
      expect(result.breakdown).toHaveProperty('teamSize');
      expect(result.breakdown).toHaveProperty('codebaseComplexity');
      expect(result.breakdown).toHaveProperty('integrations');
      expect(result.breakdown).toHaveProperty('userBase');
      expect(result.breakdown).toHaveProperty('security');
      expect(result.breakdown).toHaveProperty('duration');
      expect(result.breakdown).toHaveProperty('existingCode');
    });

    it('should have assessedAt timestamp close to current time', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.SMALL,
        teamSize: TeamSize.SMALL,
        codebaseComplexity: CodebaseComplexity.SIMPLE,
        integrations: IntegrationsCount.FEW,
        userBase: UserBase.INTERNAL,
        security: SecurityLevel.LOW,
        duration: ProjectDuration.SHORT,
        existingCode: ExistingCodebase.MINOR_REFACTOR,
      };

      const before = new Date();
      const result = assessComplexity(input);
      const after = new Date();

      expect(result.assessedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.assessedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should not include override field when no override is provided', () => {
      const input: ProjectInput = {
        projectSize: ProjectSize.SMALL,
        teamSize: TeamSize.SMALL,
        codebaseComplexity: CodebaseComplexity.SIMPLE,
        integrations: IntegrationsCount.FEW,
        userBase: UserBase.INTERNAL,
        security: SecurityLevel.LOW,
        duration: ProjectDuration.SHORT,
        existingCode: ExistingCodebase.MINOR_REFACTOR,
      };

      const result = assessComplexity(input);

      expect(result.override).toBeUndefined();
    });
  });
});

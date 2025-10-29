/**
 * Scale Assessment Template Tests
 * Tests for STORY-V3-002: Create Assessment Report Template
 */

import { TemplateEngine } from '@/lib/templates/engine';
import { ComplexityLevel } from '@/lib/workflows/complexity-types';
import type { ComplexityResult, ComplexityBreakdown } from '@/lib/workflows/complexity-types';
import fs from 'fs/promises';
import path from 'path';

describe('Scale Assessment Template', () => {
  let engine: TemplateEngine;
  let templatePath: string;

  beforeAll(() => {
    engine = new TemplateEngine();
    templatePath = path.resolve(__dirname, '../../../templates/scale-assessment.hbs');
  });

  // Helper function to create a mock ComplexityResult
  function createMockResult(level: ComplexityLevel, totalScore: number): ComplexityResult {
    const breakdown: ComplexityBreakdown = {
      projectSize: Math.floor(totalScore / 8),
      teamSize: Math.floor(totalScore / 8),
      codebaseComplexity: Math.floor(totalScore / 8),
      integrations: Math.floor(totalScore / 8),
      userBase: Math.floor(totalScore / 8),
      security: Math.floor(totalScore / 8),
      duration: Math.floor(totalScore / 8),
      existingCode: Math.floor(totalScore / 8),
    };

    return {
      totalScore,
      level,
      breakdown,
      levelName: getLevelName(level),
      scoreRange: getScoreRange(level),
      recommendedWorkflow: getRecommendedWorkflow(level),
      assessedAt: new Date('2025-10-29T12:00:00Z'),
    };
  }

  function getLevelName(level: ComplexityLevel): string {
    const names = {
      [ComplexityLevel.MINIMAL]: 'Minimal',
      [ComplexityLevel.BASIC]: 'Basic',
      [ComplexityLevel.STANDARD]: 'Standard',
      [ComplexityLevel.COMPREHENSIVE]: 'Comprehensive',
      [ComplexityLevel.ENTERPRISE]: 'Enterprise',
    };
    return names[level];
  }

  function getScoreRange(level: ComplexityLevel): string {
    const ranges = {
      [ComplexityLevel.MINIMAL]: '0-5',
      [ComplexityLevel.BASIC]: '6-12',
      [ComplexityLevel.STANDARD]: '13-20',
      [ComplexityLevel.COMPREHENSIVE]: '21-30',
      [ComplexityLevel.ENTERPRISE]: '31-40',
    };
    return ranges[level];
  }

  function getRecommendedWorkflow(level: ComplexityLevel): string {
    const workflows = {
      [ComplexityLevel.MINIMAL]: 'minimal-workflow.yaml',
      [ComplexityLevel.BASIC]: 'basic-workflow.yaml',
      [ComplexityLevel.STANDARD]: 'standard-workflow.yaml',
      [ComplexityLevel.COMPREHENSIVE]: 'comprehensive-workflow.yaml',
      [ComplexityLevel.ENTERPRISE]: 'enterprise-workflow.yaml',
    };
    return workflows[level];
  }

  describe('Template Rendering for All Levels', () => {
    it('should render Level 0 (Minimal) assessment', async () => {
      const result = createMockResult(ComplexityLevel.MINIMAL, 3);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('Project Complexity Assessment Report');
      expect(rendered).toContain('Level 0 - Minimal');
      expect(rendered).toContain('3/40 points');
      expect(rendered).toContain('Minimal Complexity');
      expect(rendered).toContain('minimal-workflow.yaml');
      expect(rendered).toContain('Solo developer or very small team');
      expect(rendered).not.toContain('undefined');
      expect(rendered).not.toContain('{{');
    });

    it('should render Level 1 (Basic) assessment', async () => {
      const result = createMockResult(ComplexityLevel.BASIC, 9);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('Project Complexity Assessment Report');
      expect(rendered).toContain('Level 1 - Basic');
      expect(rendered).toContain('9/40 points');
      expect(rendered).toContain('Basic Complexity');
      expect(rendered).toContain('basic-workflow.yaml');
      expect(rendered).toContain('Small team (2-3 developers)');
      expect(rendered).not.toContain('undefined');
      expect(rendered).not.toContain('{{');
    });

    it('should render Level 2 (Standard) assessment', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('Project Complexity Assessment Report');
      expect(rendered).toContain('Level 2 - Standard');
      expect(rendered).toContain('16/40 points');
      expect(rendered).toContain('Standard Complexity');
      expect(rendered).toContain('standard-workflow.yaml');
      expect(rendered).toContain('Medium team (4-6 developers)');
      expect(rendered).not.toContain('undefined');
      expect(rendered).not.toContain('{{');
    });

    it('should render Level 3 (Comprehensive) assessment', async () => {
      const result = createMockResult(ComplexityLevel.COMPREHENSIVE, 25);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('Project Complexity Assessment Report');
      expect(rendered).toContain('Level 3 - Comprehensive');
      expect(rendered).toContain('25/40 points');
      expect(rendered).toContain('Comprehensive Complexity');
      expect(rendered).toContain('comprehensive-workflow.yaml');
      expect(rendered).toContain('Large team (7-15 developers)');
      expect(rendered).not.toContain('undefined');
      expect(rendered).not.toContain('{{');
    });

    it('should render Level 4 (Enterprise) assessment', async () => {
      const result = createMockResult(ComplexityLevel.ENTERPRISE, 35);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('Project Complexity Assessment Report');
      expect(rendered).toContain('Level 4 - Enterprise');
      expect(rendered).toContain('35/40 points');
      expect(rendered).toContain('Enterprise Complexity');
      expect(rendered).toContain('enterprise-workflow.yaml');
      expect(rendered).toContain('Very large teams (16+ developers)');
      expect(rendered).not.toContain('undefined');
      expect(rendered).not.toContain('{{');
    });
  });

  describe('Template Sections', () => {
    it('should include all required sections', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Check for all required sections
      expect(rendered).toContain('Executive Summary');
      expect(rendered).toContain('Criteria Scores');
      expect(rendered).toContain('Level Determination');
      expect(rendered).toContain('Recommendations');
      expect(rendered).toContain('Risks and Considerations');
      expect(rendered).toContain('Next Steps');
    });

    it('should include criteria breakdown table', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Check for all 8 criteria in the table
      expect(rendered).toContain('Project Size');
      expect(rendered).toContain('Team Size');
      expect(rendered).toContain('Codebase Complexity');
      expect(rendered).toContain('External Integrations');
      expect(rendered).toContain('User Base');
      expect(rendered).toContain('Security Requirements');
      expect(rendered).toContain('Project Duration');
      expect(rendered).toContain('Existing Codebase');

      // Check for table structure
      expect(rendered).toContain('Criterion | Score | Max');
    });

    it('should include score distribution visualization', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('Score Distribution');
      expect(rendered).toContain('Minimal (0-5)');
      expect(rendered).toContain('Basic (6-12)');
      expect(rendered).toContain('Standard (13-20)');
      expect(rendered).toContain('Comprehensive (21-30)');
      expect(rendered).toContain('Enterprise (31-40)');
    });
  });

  describe('Helper Functions', () => {
    it('should use badge helper correctly', async () => {
      const result = createMockResult(ComplexityLevel.MINIMAL, 3);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('🟢'); // Green badge for Level 0
    });

    it('should use date helper correctly', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Should contain a formatted date (checking for year is safe)
      expect(rendered).toMatch(/\d{4}/); // Contains a year
    });

    it('should use comparison helpers correctly', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Should only show Standard level content, not others
      expect(rendered).toContain('Standard Complexity');
      expect(rendered).not.toContain('Minimal Complexity');
      expect(rendered).not.toContain('Enterprise Complexity');
    });

    it('should use math helpers correctly', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Should calculate percentage: 16/40 = 40%
      expect(rendered).toContain('40%');
    });
  });

  describe('Conditional Content', () => {
    it('should show appropriate content for Level 0', async () => {
      const result = createMockResult(ComplexityLevel.MINIMAL, 3);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Should show minimal planning content
      expect(rendered).toContain('Minimal Documentation');
      expect(rendered).toContain('PM Agent');
      expect(rendered).toContain('DEV Agent');

      // Should NOT show comprehensive content
      expect(rendered).not.toContain('Analyst Agent');
      expect(rendered).not.toContain('Architect Agent');
      expect(rendered).not.toContain('SM Agent');
    });

    it('should show appropriate content for Level 4', async () => {
      const result = createMockResult(ComplexityLevel.ENTERPRISE, 35);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Should show enterprise content
      expect(rendered).toContain('Comprehensive/Enterprise Documentation');
      expect(rendered).toContain('External Experts');
      expect(rendered).toContain('enterprise-workflow.yaml');

      // Should show all agents
      expect(rendered).toContain('PM Agent');
      expect(rendered).toContain('Analyst Agent');
      expect(rendered).toContain('Architect Agent');
      expect(rendered).toContain('SM Agent');
      expect(rendered).toContain('DEV Agent');
    });
  });

  describe('Manual Override Support', () => {
    it('should display override information when present', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      result.override = {
        originalLevel: ComplexityLevel.COMPREHENSIVE,
        overrideLevel: ComplexityLevel.STANDARD,
        reason: 'Team preference for simpler workflow',
        overriddenBy: 'PM Agent',
        overriddenAt: new Date('2025-10-29T14:00:00Z'),
      };

      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('Manual Override Applied');
      expect(rendered).toContain('Original Level: 3');
      expect(rendered).toContain('Override Level: 2');
      expect(rendered).toContain('Team preference for simpler workflow');
      expect(rendered).toContain('PM Agent');
    });

    it('should not display override section when no override', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).not.toContain('Manual Override Applied');
      expect(rendered).toContain('Override Applied: No');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum score (0 points)', async () => {
      const result = createMockResult(ComplexityLevel.MINIMAL, 0);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('0/40 points');
      expect(rendered).toContain('Level 0 - Minimal');
      expect(rendered).not.toContain('undefined');
    });

    it('should handle maximum score (40 points)', async () => {
      const result = createMockResult(ComplexityLevel.ENTERPRISE, 40);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      expect(rendered).toContain('40/40 points');
      expect(rendered).toContain('Level 4 - Enterprise');
      expect(rendered).toContain('100%');
      expect(rendered).not.toContain('undefined');
    });

    it('should handle boundary scores correctly', async () => {
      // Test each level boundary
      const boundaries = [
        { level: ComplexityLevel.MINIMAL, score: 5 },
        { level: ComplexityLevel.BASIC, score: 6 },
        { level: ComplexityLevel.BASIC, score: 12 },
        { level: ComplexityLevel.STANDARD, score: 13 },
        { level: ComplexityLevel.STANDARD, score: 20 },
        { level: ComplexityLevel.COMPREHENSIVE, score: 21 },
        { level: ComplexityLevel.COMPREHENSIVE, score: 30 },
        { level: ComplexityLevel.ENTERPRISE, score: 31 },
      ];

      for (const boundary of boundaries) {
        const result = createMockResult(boundary.level, boundary.score);
        const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

        expect(rendered).toContain(`${boundary.score}/40 points`);
        expect(rendered).toContain(`Level ${boundary.level}`);
        expect(rendered).not.toContain('undefined');
      }
    });

    it('should handle high criterion scores (4-5 points)', async () => {
      const result = createMockResult(ComplexityLevel.ENTERPRISE, 35);
      result.breakdown = {
        projectSize: 5,
        teamSize: 5,
        codebaseComplexity: 5,
        integrations: 5,
        userBase: 5,
        security: 5,
        duration: 3,
        existingCode: 2,
      };

      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Should show warnings for high-scoring criteria
      expect(rendered).toContain('High Scoring Criteria');
      expect(rendered).toContain('Project Size');
      expect(rendered).toContain('Team Size');
      expect(rendered).toContain('Codebase Complexity');
      expect(rendered).toContain('Integrations');
      expect(rendered).toContain('User Base');
      expect(rendered).toContain('Security');
    });
  });

  describe('Template File Existence', () => {
    it('should have template file at correct location', async () => {
      const templateExists = await fs
        .access(templatePath)
        .then(() => true)
        .catch(() => false);

      expect(templateExists).toBe(true);
    });

    it('should be valid Handlebars syntax', async () => {
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Basic Handlebars syntax validation
      expect(templateContent).toContain('{{');
      expect(templateContent).toContain('}}');
      expect(templateContent).toContain('#if');
      expect(templateContent).toContain('/if');

      // Should not have unclosed tags
      const openTags = (templateContent.match(/{{#/g) || []).length;
      const closeTags = (templateContent.match(/{{\/\w/g) || []).length;
      expect(openTags).toBe(closeTags);
    });
  });

  describe('Output Quality', () => {
    it('should produce valid Markdown', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Check for Markdown formatting
      expect(rendered).toMatch(/^#\s/m); // Starts with header
      expect(rendered).toContain('**'); // Bold text
      expect(rendered).toContain('##'); // Sub-headers
      expect(rendered).toContain('|'); // Tables
      expect(rendered).toContain('```'); // Code blocks
      expect(rendered).toContain('-'); // Lists
    });

    it('should have no template syntax left in output', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Should not contain any unprocessed Handlebars syntax
      expect(rendered).not.toContain('{{');
      expect(rendered).not.toContain('}}');
      expect(rendered).not.toContain('undefined');
      expect(rendered).not.toContain('null');
    });

    it('should produce consistent line breaks', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);
      const rendered = await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);

      // Should not have excessive blank lines
      expect(rendered).not.toMatch(/\n{5,}/); // No more than 4 consecutive newlines
    });
  });

  describe('Template Caching', () => {
    it('should cache template after first render', async () => {
      const result = createMockResult(ComplexityLevel.STANDARD, 16);

      // Clear cache first
      engine.clearCache();
      const stats1 = engine.getCacheStats();
      expect(stats1.size).toBe(0);

      // First render
      await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);
      const stats2 = engine.getCacheStats();
      expect(stats2.size).toBe(1);

      // Second render (should use cache)
      await engine.renderFile(templatePath, result as unknown as Record<string, unknown>);
      const stats3 = engine.getCacheStats();
      expect(stats3.size).toBe(1); // Still 1 (same template)

      const renderStats = engine.getRenderStats();
      expect(renderStats.totalRenders).toBe(2);
    });
  });
});

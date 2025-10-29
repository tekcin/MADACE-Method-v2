/**
 * CLI Integration Tests: madace assess-scale
 * STORY-V3-007: Add CLI Command for Complexity Assessment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Extract JSON from npm output
 * npm run adds lines like "> madace-method-v2@2.0.0-alpha madace" before actual output
 */
function extractJSON(stdout: string): string {
  // Split into lines and filter out npm output lines (start with ">")
  const lines = stdout.split('\n').filter((line) => !line.trim().startsWith('>'));
  const filtered = lines.join('\n').trim();

  // Now extract JSON object
  const firstBrace = filtered.indexOf('{');
  const lastBrace = filtered.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return filtered.substring(firstBrace, lastBrace + 1);
  }

  return filtered;
}

describe('madace assess-scale CLI command', () => {
  const cliCommand = 'npm run madace assess-scale --';

  describe('JSON Input Mode (Non-Interactive)', () => {
    it('should assess complexity with JSON input and JSON output', async () => {
      const input = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=json`);

      const result = JSON.parse(extractJSON(stdout));
      expect(result).toHaveProperty('totalScore', 14);
      expect(result).toHaveProperty('level', 2);
      expect(result).toHaveProperty('levelName', 'Standard');
      expect(result).toHaveProperty('scoreRange', '13-20');
      expect(result).toHaveProperty('recommendedWorkflow', 'standard-workflow.yaml');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('assessedAt');
    });

    it('should assess complexity with JSON input and table output', async () => {
      const input = JSON.stringify({
        projectSize: 1,
        teamSize: 1,
        codebaseComplexity: 1,
        integrations: 1,
        userBase: 1,
        security: 1,
        duration: 1,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=table`);

      expect(stdout).toContain('COMPLEXITY ASSESSMENT RESULT');
      expect(stdout).toContain('Level: 1 (Basic)');
      expect(stdout).toContain('Total Score: 7/40 points');
      expect(stdout).toContain('CRITERIA BREAKDOWN');
    });

    it('should assess complexity with JSON input and markdown output', async () => {
      const input = JSON.stringify({
        projectSize: 3,
        teamSize: 3,
        codebaseComplexity: 3,
        integrations: 3,
        userBase: 3,
        security: 3,
        duration: 3,
        existingCode: 3,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=markdown`);

      expect(stdout).toContain('# Project Complexity Assessment');
      expect(stdout).toContain('**Recommended Level:** Level 3 (Comprehensive)');
      expect(stdout).toContain('**Total Score:** 24/40 points');
      expect(stdout).toContain('## Criteria Breakdown');
      expect(stdout).toContain('## Level Characteristics');
      expect(stdout).toContain('## Next Steps');
    });

    it('should save assessment to custom file with --output flag', async () => {
      const input = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const outputFile = path.join(process.cwd(), '__test-output__.md');

      try {
        const { stdout } = await execAsync(
          `${cliCommand} --json '${input}' --format=markdown --output=${outputFile}`
        );

        expect(stdout).toContain(`Report saved to: ${outputFile}`);

        const content = await fs.readFile(outputFile, 'utf-8');
        expect(content).toContain('# Project Complexity Assessment');
        expect(content).toContain('**Recommended Level:** Level 2 (Standard)');
      } finally {
        // Clean up
        try {
          await fs.unlink(outputFile);
        } catch {
          // Ignore cleanup errors
        }
      }
    }, 15000);
  });

  describe('Level Detection', () => {
    it('should detect Level 0 (Minimal) for low complexity', async () => {
      const input = JSON.stringify({
        projectSize: 0,
        teamSize: 0,
        codebaseComplexity: 0,
        integrations: 0,
        userBase: 0,
        security: 0,
        duration: 0,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=json`);

      const result = JSON.parse(extractJSON(stdout));
      expect(result.level).toBe(0);
      expect(result.levelName).toBe('Minimal');
      expect(result.totalScore).toBeLessThanOrEqual(5);
    });

    it('should detect Level 1 (Basic) for small projects', async () => {
      const input = JSON.stringify({
        projectSize: 1,
        teamSize: 1,
        codebaseComplexity: 1,
        integrations: 1,
        userBase: 1,
        security: 1,
        duration: 1,
        existingCode: 1,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=json`);

      const result = JSON.parse(extractJSON(stdout));
      expect(result.level).toBe(1);
      expect(result.levelName).toBe('Basic');
      expect(result.totalScore).toBeGreaterThanOrEqual(6);
      expect(result.totalScore).toBeLessThanOrEqual(12);
    });

    it('should detect Level 2 (Standard) for medium projects', async () => {
      const input = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=json`);

      const result = JSON.parse(extractJSON(stdout));
      expect(result.level).toBe(2);
      expect(result.levelName).toBe('Standard');
      expect(result.totalScore).toBeGreaterThanOrEqual(13);
      expect(result.totalScore).toBeLessThanOrEqual(20);
    });

    it('should detect Level 3 (Comprehensive) for large projects', async () => {
      const input = JSON.stringify({
        projectSize: 3,
        teamSize: 3,
        codebaseComplexity: 3,
        integrations: 3,
        userBase: 3,
        security: 3,
        duration: 3,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=json`);

      const result = JSON.parse(extractJSON(stdout));
      expect(result.level).toBe(3);
      expect(result.levelName).toBe('Comprehensive');
      expect(result.totalScore).toBeGreaterThanOrEqual(21);
      expect(result.totalScore).toBeLessThanOrEqual(30);
    });

    it('should detect Level 4 (Enterprise) for very large projects', async () => {
      const input = JSON.stringify({
        projectSize: 5,
        teamSize: 5,
        codebaseComplexity: 5,
        integrations: 5,
        userBase: 5,
        security: 5,
        duration: 5,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=json`);

      const result = JSON.parse(extractJSON(stdout));
      expect(result.level).toBe(4);
      expect(result.levelName).toBe('Enterprise');
      expect(result.totalScore).toBeGreaterThanOrEqual(31);
      expect(result.totalScore).toBeLessThanOrEqual(40);
    });
  });

  describe('Error Handling', () => {
    it('should fail with invalid JSON input', async () => {
      try {
        await execAsync(`${cliCommand} --json 'invalid-json' --format=json`);
        fail('Should have thrown an error');
      } catch (error) {
        const err = error as { stderr: string };
        expect(err.stderr).toContain('Invalid JSON input');
      }
    });
  });

  describe('Output Format Options', () => {
    it('should default to table format when no format specified', async () => {
      const input = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}'`);

      expect(stdout).toContain('COMPLEXITY ASSESSMENT RESULT');
      expect(stdout).toContain('CRITERIA BREAKDOWN');
      expect(stdout).toContain('━'); // Table border character
    });

    it('should support --format=table explicitly', async () => {
      const input = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=table`);

      expect(stdout).toContain('COMPLEXITY ASSESSMENT RESULT');
      expect(stdout).toContain('Level: 2 (Standard)');
    });

    it('should support --format=json', async () => {
      const input = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=json`);

      const result = JSON.parse(extractJSON(stdout));
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('totalScore');
    });

    it('should support --format=markdown', async () => {
      const input = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const { stdout } = await execAsync(`${cliCommand} --json '${input}' --format=markdown`);

      expect(stdout).toContain('# Project Complexity Assessment');
      expect(stdout).toContain('| Criterion | Score | Max | Percentage |');
    });
  });
});

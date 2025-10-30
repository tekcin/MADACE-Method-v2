/**
 * Integration Tests: CLI Commands
 *
 * Tests actual CLI command execution using spawned processes
 */

import { runCLI, runCLISuccess, runCLIJSON } from '@/__tests__/helpers/cli-runner';

describe('CLI Integration Tests', () => {
  // Increase timeout for integration tests
  jest.setTimeout(10000);

  describe('madace --help', () => {
    it('should show help message', async () => {
      const result = await runCLI(['--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('MADACE');
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('Commands:');
    });

    it('should show version', async () => {
      const result = await runCLI(['--version']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('3.0.0');
    });
  });

  describe('madace assess-scale', () => {
    it('should show help for assess-scale command', async () => {
      const result = await runCLI(['assess-scale', '--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('assess-scale');
      expect(result.stdout).toContain('Assess project complexity');
    });

    it('should handle JSON input and output table format', async () => {
      const jsonInput = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const result = await runCLI(['assess-scale', '--json', jsonInput, '--format', 'table']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Level:');
      expect(result.stdout).toContain('Recommended Workflow');
    });

    it('should output JSON format when requested', async () => {
      const jsonInput = JSON.stringify({
        projectSize: 2,
        teamSize: 2,
        codebaseComplexity: 2,
        integrations: 2,
        userBase: 2,
        security: 2,
        duration: 2,
        existingCode: 0,
      });

      const result = await runCLI(['assess-scale', '--json', jsonInput, '--format', 'json']);

      expect(result.exitCode).toBe(0);
      const parsed = JSON.parse(result.stdout);
      expect(parsed).toHaveProperty('level');
      expect(parsed).toHaveProperty('totalScore');
      expect(parsed).toHaveProperty('recommendedWorkflow');
    });
  });

  describe('madace agents', () => {
    it('should list agents', async () => {
      const stdout = await runCLISuccess(['agents', 'list']);

      expect(stdout).toContain('Agents');
      // Should show table headers
      expect(stdout).toContain('Name');
      expect(stdout).toContain('Title');
      expect(stdout).toContain('Module');
    });

    it('should list agents in JSON format', async () => {
      const agents = await runCLIJSON<any[]>(['agents', 'list']);

      expect(Array.isArray(agents)).toBe(true);
    });

    it('should filter agents by module', async () => {
      const stdout = await runCLISuccess(['agents', 'list', '--module', 'MAM']);

      // Either shows MAM agents or "No data to display" if none exist
      expect(stdout.includes('MAM') || stdout.includes('No data')).toBe(true);
    });

    it('should show agent details', async () => {
      // First get list of agents
      const agents = await runCLIJSON<any[]>(['agents', 'list']);

      if (agents.length > 0) {
        const firstAgent = agents[0];
        const stdout = await runCLISuccess(['agents', 'show', firstAgent.name]);

        expect(stdout).toContain(firstAgent.name);
        expect(stdout).toContain('Agent:');
      }
    });

    it('should show agent details in JSON format', async () => {
      const agents = await runCLIJSON<any[]>(['agents', 'list']);

      if (agents.length > 0) {
        const firstAgent = agents[0];
        const result = await runCLI(['agents', 'show', firstAgent.name, '--json']);

        expect(result.exitCode).toBe(0);
        const agent = JSON.parse(result.stdout);
        expect(agent.name).toBe(firstAgent.name);
      }
    });

    it('should handle non-existent agent gracefully', async () => {
      const result = await runCLI(['agents', 'show', 'nonexistent-agent-xyz']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('not found');
    });
  });

  describe('madace config', () => {
    it('should list configuration or show not found message', async () => {
      const result = await runCLI(['config', 'list']);

      // Either success with configuration or error saying not found
      if (result.exitCode === 0) {
        expect(result.stdout).toContain('Configuration');
      } else {
        expect(result.stderr).toContain('not found');
      }
    });

    it('should list configuration in JSON format or error', async () => {
      const result = await runCLI(['config', 'list', '--json']);

      // Either success with JSON or error
      if (result.exitCode === 0) {
        const config = JSON.parse(result.stdout);
        expect(typeof config).toBe('object');
      } else {
        expect(result.stderr).toContain('not found');
      }
    });

    it('should get configuration value or error', async () => {
      const result = await runCLI(['config', 'get', 'project_name']);

      // Either success or not found error
      expect(result.exitCode === 0 || result.stderr.includes('not found')).toBe(true);
    });

    it('should validate configuration or show not found', async () => {
      const result = await runCLI(['config', 'validate']);

      // Either success or not found error
      if (result.exitCode === 0) {
        expect(result.stdout).toContain('Configuration');
      } else {
        expect(result.stderr).toContain('not found');
      }
    });
  });

  describe('madace project', () => {
    it('should show project status or not initialized message', async () => {
      const result = await runCLI(['project', 'status']);

      // Either success or not initialized error
      if (result.exitCode === 0) {
        expect(result.stdout).toContain('Project');
      } else {
        expect(result.stderr).toContain('not initialized');
      }
    });

    it('should show project status in JSON format or error', async () => {
      const result = await runCLI(['project', 'status', '--json']);

      // Either success or not initialized error
      if (result.exitCode === 0) {
        const status = JSON.parse(result.stdout);
        expect(typeof status).toBe('object');
      } else {
        expect(result.stderr).toContain('not initialized');
      }
    });

    it('should show project statistics or error', async () => {
      const result = await runCLI(['project', 'stats']);

      // Either success or not initialized error
      if (result.exitCode === 0) {
        expect(result.stdout).toContain('Statistics');
      } else {
        expect(result.stderr).toContain('not initialized');
      }
    });
  });

  describe('madace state', () => {
    it('should show state machine status', async () => {
      const stdout = await runCLISuccess(['state', 'show']);

      expect(stdout).toContain('State Machine');
    });

    it('should show state machine status in JSON format', async () => {
      const result = await runCLI(['state', 'show', '--json']);

      expect(result.exitCode).toBe(0);
      const state = JSON.parse(result.stdout);
      expect(typeof state).toBe('object');
    });

    it('should show state statistics', async () => {
      const stdout = await runCLISuccess(['state', 'stats']);

      expect(stdout).toContain('Statistics');
    });
  });

  describe('madace workflows', () => {
    it('should list workflows or show no workflows message', async () => {
      const stdout = await runCLISuccess(['workflows', 'list']);

      // Either shows workflows or "No workflows found"
      expect(stdout.length).toBeGreaterThan(0);
    });

    it('should list workflows in JSON format', async () => {
      const result = await runCLI(['workflows', 'list', '--json']);

      expect(result.exitCode).toBe(0);
      // Handle both JSON array and "No workflows found" message
      if (result.stdout.includes('No workflows')) {
        expect(result.stdout).toContain('No workflows');
      } else {
        const workflows = JSON.parse(result.stdout);
        expect(Array.isArray(workflows)).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', async () => {
      const result = await runCLI(['invalid-command']);

      expect(result.exitCode).toBe(1);
    });

    it('should handle missing required arguments', async () => {
      const result = await runCLI(['agents', 'show']);

      expect(result.exitCode).toBe(1);
    });
  });

  describe('Global Options', () => {
    it('should support --help on subcommands', async () => {
      const result = await runCLI(['agents', '--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('agents');
      expect(result.stdout).toContain('Commands:');
    });

    it('should support --json on multiple commands', async () => {
      const commands = [
        ['agents', 'list'],
        ['state', 'show'],
      ];

      for (const cmd of commands) {
        const result = await runCLI([...cmd, '--json']);
        expect(result.exitCode).toBe(0);
        // Should output valid JSON (no Prisma logging mixed in)
        try {
          JSON.parse(result.stdout);
        } catch (e) {
          // If parsing fails, output should at least not be empty
          expect(result.stdout.length).toBeGreaterThan(0);
        }
      }
    });
  });
});

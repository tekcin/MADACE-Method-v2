/**
 * Tests for StateMachineStatusProvider
 *
 * Purpose: Parse mam-workflow-status.md to provide Kanban-style state overview
 *
 * Coverage:
 * - detectEntity() - keyword matching (state, machine, status, overview, summary, empty string)
 * - getStatus() - parsing mam-workflow-status.md, counting stories per state
 * - State counting - BACKLOG, TODO, IN_PROGRESS, DONE sections
 * - Limit tracking - TODO > 1 violation, IN_PROGRESS > 1 violation
 * - formatOutput() - JSON, table, markdown formats
 * - Error handling - file read errors, malformed content
 * - Edge cases - empty sections, missing sections, various story formats
 */

import { StateMachineStatusProvider } from '@/lib/status/providers/state-machine-provider';
import type { StatusResult } from '@/lib/status/types';
import { readFile } from 'fs/promises';

// Mock fs/promises module
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe('StateMachineStatusProvider', () => {
  let provider: StateMachineStatusProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new StateMachineStatusProvider('docs/mam-workflow-status.md');
  });

  // ============================================================================
  // detectEntity() Tests
  // ============================================================================

  describe('detectEntity', () => {
    it('should detect empty string as state machine (default)', () => {
      expect(provider.detectEntity('')).toBe(true);
    });

    it('should detect whitespace-only string as state machine', () => {
      expect(provider.detectEntity('   ')).toBe(true);
    });

    it('should detect "state" keyword', () => {
      expect(provider.detectEntity('state')).toBe(true);
      expect(provider.detectEntity('STATE')).toBe(true);
      expect(provider.detectEntity('State Machine')).toBe(true);
    });

    it('should detect "machine" keyword', () => {
      expect(provider.detectEntity('machine')).toBe(true);
      expect(provider.detectEntity('MACHINE')).toBe(true);
      expect(provider.detectEntity('state machine')).toBe(true);
    });

    it('should detect "status" keyword', () => {
      expect(provider.detectEntity('status')).toBe(true);
      expect(provider.detectEntity('STATUS')).toBe(true);
      expect(provider.detectEntity('show status')).toBe(true);
    });

    it('should detect "overview" keyword', () => {
      expect(provider.detectEntity('overview')).toBe(true);
      expect(provider.detectEntity('OVERVIEW')).toBe(true);
      expect(provider.detectEntity('project overview')).toBe(true);
    });

    it('should detect "summary" keyword', () => {
      expect(provider.detectEntity('summary')).toBe(true);
      expect(provider.detectEntity('SUMMARY')).toBe(true);
      expect(provider.detectEntity('sprint summary')).toBe(true);
    });

    it('should detect "all" keyword', () => {
      expect(provider.detectEntity('all')).toBe(true);
      expect(provider.detectEntity('ALL')).toBe(true);
      expect(provider.detectEntity('show all')).toBe(true);
    });

    it('should reject non-matching patterns', () => {
      expect(provider.detectEntity('STORY-V3-015')).toBe(false);
      expect(provider.detectEntity('pm-planning')).toBe(false);
      expect(provider.detectEntity('EPIC-V3-002')).toBe(false);
      expect(provider.detectEntity('random-text')).toBe(false);
    });
  });

  // ============================================================================
  // getStatus() - Parsing and Counting Tests
  // ============================================================================

  describe('getStatus - Parsing and Counting', () => {
    const mockStatusContent = `# MADACE Workflow Status

## BACKLOG

**EPIC-V3-002: Universal Workflow Status Checker** (11 stories, 21 points)

- **[STORY-V3-016]** Create madace status CLI Command [3 pts]
- **[STORY-V3-017]** Add status caching layer [2 pts]
- **[STORY-V3-018]** Implement real-time status updates [5 pts]

## TODO

- **[STORY-V3-019]** Fix status display bug (2025-10-29) [Points: 1]
  **Status:** TODO - Ready to start
  **Developer:** Unassigned | **Epic:** EPIC-V3-002

## IN PROGRESS

- **[STORY-V3-015]** Implement StateMachineStatusProvider (2025-10-29) [Points: 2]
  **Status:** IN PROGRESS - Creating comprehensive unit tests
  **Developer:** Claude | **Epic:** EPIC-V3-002

## DONE

- **[STORY-V3-014]** Implement WorkflowStatusProvider (2025-10-29) [Points: 3]
  **Status:** COMPLETED
  **Developer:** Claude

- **[STORY-V3-013]** Implement EpicStatusProvider (2025-10-29) [Points: 2]
  **Status:** COMPLETED
  **Developer:** Claude
`;

    it('should parse and count stories in all states', async () => {
      mockReadFile.mockResolvedValue(mockStatusContent);

      const result = await provider.getStatus();

      expect(result.entityType).toBe('state');
      expect(result.entityId).toBe('state-machine');
      expect(result.data.backlog).toBe(3);
      expect(result.data.todo).toBe(1);
      expect(result.data.inProgress).toBe(1);
      expect(result.data.done).toBe(2);
      expect(result.data.total).toBe(7);
    });

    it('should include limits for TODO and IN_PROGRESS', async () => {
      mockReadFile.mockResolvedValue(mockStatusContent);

      const result = await provider.getStatus();

      expect(result.data.todoLimit).toBe(1);
      expect(result.data.inProgressLimit).toBe(1);
    });

    it('should detect no violations when within limits', async () => {
      mockReadFile.mockResolvedValue(mockStatusContent);

      const result = await provider.getStatus();

      expect(result.metadata?.todoViolation).toBe(false);
      expect(result.metadata?.inProgressViolation).toBe(false);
    });

    it('should detect TODO limit violation', async () => {
      const contentWithTodoViolation = `
## BACKLOG
- **[STORY-001]** Story 1

## TODO
- **[STORY-002]** Story 2
- **[STORY-003]** Story 3

## IN PROGRESS
- **[STORY-004]** Story 4

## DONE
- **[STORY-005]** Story 5
`;
      mockReadFile.mockResolvedValue(contentWithTodoViolation);

      const result = await provider.getStatus();

      expect(result.data.todo).toBe(2);
      expect(result.metadata?.todoViolation).toBe(true);
    });

    it('should detect IN_PROGRESS limit violation', async () => {
      const contentWithInProgressViolation = `
## BACKLOG
- **[STORY-001]** Story 1

## TODO
- **[STORY-002]** Story 2

## IN PROGRESS
- **[STORY-003]** Story 3
- **[STORY-004]** Story 4
- **[STORY-005]** Story 5

## DONE
- **[STORY-006]** Story 6
`;
      mockReadFile.mockResolvedValue(contentWithInProgressViolation);

      const result = await provider.getStatus();

      expect(result.data.inProgress).toBe(3);
      expect(result.metadata?.inProgressViolation).toBe(true);
    });

    it('should include timestamp', async () => {
      mockReadFile.mockResolvedValue(mockStatusContent);
      const beforeTime = new Date().toISOString();

      const result = await provider.getStatus();

      const afterTime = new Date().toISOString();
      expect(result.timestamp).toBeDefined();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.timestamp >= beforeTime).toBe(true);
      expect(result.timestamp <= afterTime).toBe(true);
    });

    it('should include source file path in metadata', async () => {
      mockReadFile.mockResolvedValue(mockStatusContent);

      const result = await provider.getStatus();

      expect(result.metadata?.source).toBe('docs/mam-workflow-status.md');
    });

    it('should ignore entity ID parameter (always returns full state)', async () => {
      mockReadFile.mockResolvedValue(mockStatusContent);

      const result1 = await provider.getStatus();
      const result2 = await provider.getStatus('ignored-id');

      expect(result1.data).toEqual(result2.data);
    });
  });

  // ============================================================================
  // Edge Cases - Empty and Missing Sections
  // ============================================================================

  describe('getStatus - Edge Cases', () => {
    it('should handle empty BACKLOG section', async () => {
      const content = `
## BACKLOG

## TODO
- **[STORY-001]** Story 1

## IN PROGRESS
- **[STORY-002]** Story 2

## DONE
- **[STORY-003]** Story 3
`;
      mockReadFile.mockResolvedValue(content);

      const result = await provider.getStatus();

      expect(result.data.backlog).toBe(0);
      expect(result.data.total).toBe(3);
    });

    it('should handle empty TODO section', async () => {
      const content = `
## BACKLOG
- **[STORY-001]** Story 1

## TODO

## IN PROGRESS
- **[STORY-002]** Story 2

## DONE
- **[STORY-003]** Story 3
`;
      mockReadFile.mockResolvedValue(content);

      const result = await provider.getStatus();

      expect(result.data.todo).toBe(0);
      expect(result.metadata?.todoViolation).toBe(false);
    });

    it('should handle empty IN_PROGRESS section', async () => {
      const content = `
## BACKLOG
- **[STORY-001]** Story 1

## TODO
- **[STORY-002]** Story 2

## IN PROGRESS

## DONE
- **[STORY-003]** Story 3
`;
      mockReadFile.mockResolvedValue(content);

      const result = await provider.getStatus();

      expect(result.data.inProgress).toBe(0);
      expect(result.metadata?.inProgressViolation).toBe(false);
    });

    it('should handle empty DONE section', async () => {
      const content = `
## BACKLOG
- **[STORY-001]** Story 1

## TODO
- **[STORY-002]** Story 2

## IN PROGRESS
- **[STORY-003]** Story 3

## DONE
`;
      mockReadFile.mockResolvedValue(content);

      const result = await provider.getStatus();

      expect(result.data.done).toBe(0);
      expect(result.data.total).toBe(3);
    });

    it('should handle missing sections (malformed file)', async () => {
      const content = `
# MADACE Workflow Status

Some random content without proper sections.

- **[STORY-001]** Story 1 (not in a section)
`;
      mockReadFile.mockResolvedValue(content);

      const result = await provider.getStatus();

      expect(result.data.backlog).toBe(0);
      expect(result.data.todo).toBe(0);
      expect(result.data.inProgress).toBe(0);
      expect(result.data.done).toBe(0);
      expect(result.data.total).toBe(0);
    });

    it('should handle all empty sections', async () => {
      const content = `
## BACKLOG

## TODO

## IN PROGRESS

## DONE
`;
      mockReadFile.mockResolvedValue(content);

      const result = await provider.getStatus();

      expect(result.data.backlog).toBe(0);
      expect(result.data.todo).toBe(0);
      expect(result.data.inProgress).toBe(0);
      expect(result.data.done).toBe(0);
      expect(result.data.total).toBe(0);
    });

    it('should handle case-insensitive section headers', async () => {
      const content = `
## backlog
- **[STORY-001]** Story 1

## ToDo
- **[STORY-002]** Story 2

## In Progress
- **[STORY-003]** Story 3

## DONE
- **[STORY-004]** Story 4
`;
      mockReadFile.mockResolvedValue(content);

      const result = await provider.getStatus();

      expect(result.data.backlog).toBe(1);
      expect(result.data.todo).toBe(1);
      expect(result.data.inProgress).toBe(1);
      expect(result.data.done).toBe(1);
    });

    it('should only count lines starting with "- **["', async () => {
      const content = `
## BACKLOG
- **[STORY-001]** Story 1 (counted)
- [STORY-002] Story 2 (not counted - single bracket)
  - **[STORY-003]** Story 3 (not counted - indented)
Some text **[STORY-004]** (not counted - not a list item)

## DONE
- **[STORY-005]** Story 5 (counted)
`;
      mockReadFile.mockResolvedValue(content);

      const result = await provider.getStatus();

      expect(result.data.backlog).toBe(1);
      expect(result.data.done).toBe(1);
      expect(result.data.total).toBe(2);
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('getStatus - Error Handling', () => {
    it('should handle file read errors gracefully', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const result = await provider.getStatus();

      expect(result.entityType).toBe('state');
      expect(result.entityId).toBe('state-machine');
      expect(result.data).toEqual({});
      expect(result.metadata?.errors).toHaveLength(1);
      expect(result.metadata?.errors?.[0]).toContain('Failed to read status file');
      expect(result.metadata?.errors?.[0]).toContain('File not found');
    });

    it('should handle permission errors', async () => {
      mockReadFile.mockRejectedValue(new Error('EACCES: permission denied'));

      const result = await provider.getStatus();

      expect(result.metadata?.errors).toHaveLength(1);
      expect(result.metadata?.errors?.[0]).toContain('permission denied');
    });

    it('should handle non-Error exceptions', async () => {
      mockReadFile.mockRejectedValue('Unknown error string');

      const result = await provider.getStatus();

      expect(result.metadata?.errors).toHaveLength(1);
      expect(result.metadata?.errors?.[0]).toContain('Unknown error string');
    });

    it('should return valid structure even on error', async () => {
      mockReadFile.mockRejectedValue(new Error('Test error'));

      const result = await provider.getStatus();

      expect(result).toHaveProperty('entityType');
      expect(result).toHaveProperty('entityId');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('metadata');
    });
  });

  // ============================================================================
  // formatOutput() Tests
  // ============================================================================

  describe('formatOutput', () => {
    const mockResult: StatusResult = {
      entityType: 'state',
      entityId: 'state-machine',
      data: {
        backlog: 5,
        todo: 1,
        inProgress: 1,
        done: 10,
        total: 17,
        todoLimit: 1,
        inProgressLimit: 1,
      },
      timestamp: '2025-10-29T10:00:00.000Z',
      metadata: {
        source: 'docs/mam-workflow-status.md',
        todoViolation: false,
        inProgressViolation: false,
      },
    };

    it('should format as JSON', () => {
      const output = provider.formatOutput(mockResult, 'json');
      const parsed = JSON.parse(output);

      // formatOutput returns only the data portion, not the full result
      expect(parsed.backlog).toBe(5);
      expect(parsed.todo).toBe(1);
      expect(parsed.inProgress).toBe(1);
      expect(parsed.done).toBe(10);
      expect(parsed.total).toBe(17);
    });

    it('should format as ASCII table', () => {
      const output = provider.formatOutput(mockResult, 'table');

      expect(output).toContain('┌───────────────┬───────┬───────┐');
      expect(output).toContain('│ State         │ Count │ Limit │');
      expect(output).toContain('│ BACKLOG       │ 5     │ ∞     │');
      expect(output).toContain('│ TODO          │ 1     │ 1     │');
      expect(output).toContain('│ IN PROGRESS   │ 1     │ 1     │');
      expect(output).toContain('│ DONE          │ 10    │ ∞     │');
      expect(output).toContain('└───────────────┴───────┴───────┘');
    });

    it('should show warning indicator for TODO limit violation in table', () => {
      const resultWithViolation: StatusResult = {
        ...mockResult,
        data: {
          ...mockResult.data,
          todo: 2, // Exceeds limit of 1
        },
        metadata: {
          ...mockResult.metadata,
          todoViolation: true,
        },
      };

      const output = provider.formatOutput(resultWithViolation, 'table');

      // Should contain warning emoji after TODO line
      const lines = output.split('\n');
      const todoLine = lines.find((line) => line.includes('TODO'));
      expect(todoLine).toContain('⚠️');
    });

    it('should show warning indicator for IN_PROGRESS limit violation in table', () => {
      const resultWithViolation: StatusResult = {
        ...mockResult,
        data: {
          ...mockResult.data,
          inProgress: 3, // Exceeds limit of 1
        },
        metadata: {
          ...mockResult.metadata,
          inProgressViolation: true,
        },
      };

      const output = provider.formatOutput(resultWithViolation, 'table');

      // Should contain warning emoji after IN PROGRESS line
      const lines = output.split('\n');
      const inProgressLine = lines.find((line) => line.includes('IN PROGRESS'));
      expect(inProgressLine).toContain('⚠️');
    });

    it('should format as markdown', () => {
      const output = provider.formatOutput(mockResult, 'markdown');

      expect(output).toContain('# State Machine Status');
      expect(output).toContain('| State | Count | Limit |');
      expect(output).toContain('| BACKLOG | 5 | ∞ |');
      expect(output).toContain('| TODO | 1 | 1 |');
      expect(output).toContain('| IN PROGRESS | 1 | 1 |');
      expect(output).toContain('| DONE | 10 | ∞ |');
      expect(output).toContain('| **TOTAL** | **17** | |');
    });

    it('should show warning indicators in markdown if violations exist', () => {
      const resultWithViolations: StatusResult = {
        ...mockResult,
        data: {
          ...mockResult.data,
          todo: 2,
          inProgress: 3,
        },
        metadata: {
          ...mockResult.metadata,
          todoViolation: true,
          inProgressViolation: true,
        },
      };

      const output = provider.formatOutput(resultWithViolations, 'markdown');

      // Should include warning emojis inline with table rows
      expect(output).toContain('| TODO | 2 | 1 | ⚠️');
      expect(output).toContain('| IN PROGRESS | 3 | 1 | ⚠️');
    });

    it('should not show warning indicators in markdown if no violations', () => {
      const output = provider.formatOutput(mockResult, 'markdown');

      // Check that TODO line doesn't have warning emoji
      const lines = output.split('\n');
      const todoLine = lines.find((line) => line.includes('| TODO |'));
      expect(todoLine).toBeDefined();
      expect(todoLine).not.toContain('⚠️');

      // Check that IN PROGRESS line doesn't have warning emoji
      const inProgressLine = lines.find((line) => line.includes('| IN PROGRESS |'));
      expect(inProgressLine).toBeDefined();
      expect(inProgressLine).not.toContain('⚠️');
    });

    it('should handle empty data gracefully', () => {
      const emptyResult: StatusResult = {
        entityType: 'state',
        entityId: 'state-machine',
        data: {
          backlog: 0,
          todo: 0,
          inProgress: 0,
          done: 0,
          total: 0,
          todoLimit: 1,
          inProgressLimit: 1,
        },
        timestamp: '2025-10-29T10:00:00.000Z',
      };

      const jsonOutput = provider.formatOutput(emptyResult, 'json');
      const tableOutput = provider.formatOutput(emptyResult, 'table');
      const mdOutput = provider.formatOutput(emptyResult, 'markdown');

      expect(() => JSON.parse(jsonOutput)).not.toThrow();
      expect(tableOutput).toContain('│ BACKLOG       │ 0     │ ∞     │');
      expect(tableOutput).toContain('│ TOTAL         │ 0     │       │');
      expect(mdOutput).toContain('| BACKLOG | 0 | ∞ |');
      expect(mdOutput).toContain('| **TOTAL** | **0** | |');
    });
  });

  // ============================================================================
  // Integration Scenarios
  // ============================================================================

  describe('Integration Scenarios', () => {
    it('should handle real-world status file format', async () => {
      const realWorldContent = `# MADACE Workflow Status

**Project:** MADACE-Method v2.0
**Last Updated:** 2025-10-29

## BACKLOG

**EPIC-V3-001: Foundation** (5 stories, 12 points)

- **[STORY-V3-001]** Setup project structure [3 pts]
  **Description:** Initialize Next.js project with TypeScript
  **Epic:** EPIC-V3-001

- **[STORY-V3-002]** Configure ESLint and Prettier [1 pt]
  **Epic:** EPIC-V3-001

**EPIC-V3-002: Status System** (10 stories, 25 points)

- **[STORY-V3-016]** Create madace status CLI [3 pts]
- **[STORY-V3-017]** Add caching layer [2 pts]

## TODO

- **[STORY-V3-020]** Implement logging system (2025-10-29) [Points: 2]
  **Status:** TODO - Ready for development
  **Developer:** Unassigned | **Epic:** EPIC-V3-003
  **Dependencies:** None

  **Acceptance Criteria:**
  - [ ] Winston logger configured
  - [ ] Log levels: debug, info, warn, error
  - [ ] File rotation enabled

## IN PROGRESS

- **[STORY-V3-015]** Implement StateMachineStatusProvider (2025-10-29) [Points: 2]
  **Status:** IN PROGRESS - Writing comprehensive unit tests
  **Developer:** Claude | **Duration:** ~45 minutes
  **Epic:** EPIC-V3-002

  **Progress:**
  - ✅ Implementation complete
  - ✅ Unit tests (in progress - 20/30 tests)
  - ⏳ Quality checks pending

## DONE

- **[STORY-V3-014]** Implement WorkflowStatusProvider (2025-10-29) [Points: 3]
  **Status:** COMPLETED
  **Developer:** Claude | **Duration:** ~90 minutes

- **[STORY-V3-013]** Implement EpicStatusProvider (2025-10-29) [Points: 2]
  **Status:** COMPLETED
  **Developer:** Claude | **Duration:** ~60 minutes
`;

      mockReadFile.mockResolvedValue(realWorldContent);

      const result = await provider.getStatus();

      expect(result.data.backlog).toBe(4); // 2 from EPIC-V3-001 + 2 from EPIC-V3-002
      expect(result.data.todo).toBe(1);
      expect(result.data.inProgress).toBe(1);
      expect(result.data.done).toBe(2);
      expect(result.data.total).toBe(8);
      expect(result.metadata?.todoViolation).toBe(false);
      expect(result.metadata?.inProgressViolation).toBe(false);
    });

    it('should detect violations in sprint planning scenario', async () => {
      const sprintContent = `
## BACKLOG
- **[STORY-001]** Backlog story 1
- **[STORY-002]** Backlog story 2

## TODO
- **[STORY-003]** Ready story 1
- **[STORY-004]** Ready story 2
- **[STORY-005]** Ready story 3

## IN PROGRESS
- **[STORY-006]** Active story 1
- **[STORY-007]** Active story 2

## DONE
- **[STORY-008]** Completed story 1
`;

      mockReadFile.mockResolvedValue(sprintContent);

      const result = await provider.getStatus();

      expect(result.data.todo).toBe(3); // Violates limit of 1
      expect(result.data.inProgress).toBe(2); // Violates limit of 1
      expect(result.metadata?.todoViolation).toBe(true);
      expect(result.metadata?.inProgressViolation).toBe(true);

      const tableOutput = provider.formatOutput(result, 'table');
      const todoLine = tableOutput.split('\n').find((line) => line.includes('TODO'));
      const inProgressLine = tableOutput.split('\n').find((line) => line.includes('IN PROGRESS'));

      expect(todoLine).toContain('⚠️');
      expect(inProgressLine).toContain('⚠️');
    });
  });

  // ============================================================================
  // Custom Constructor Tests
  // ============================================================================

  describe('Custom Constructor', () => {
    it('should use default status file path', () => {
      const defaultProvider = new StateMachineStatusProvider();

      // Access private property for testing (TypeScript will complain, but it works at runtime)
      expect((defaultProvider as any).statusFilePath).toBe('docs/mam-workflow-status.md');
    });

    it('should accept custom status file path', () => {
      const customProvider = new StateMachineStatusProvider('custom/path/status.md');

      expect((customProvider as any).statusFilePath).toBe('custom/path/status.md');
    });

    it('should use custom path when reading file', async () => {
      const customProvider = new StateMachineStatusProvider('custom/status.md');
      mockReadFile.mockResolvedValue('## BACKLOG\n- **[STORY-001]** Story 1');

      await customProvider.getStatus();

      expect(mockReadFile).toHaveBeenCalledWith('custom/status.md', 'utf-8');
    });
  });
});

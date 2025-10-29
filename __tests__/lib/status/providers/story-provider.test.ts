/**
 * MADACE Story Status Provider Tests
 * STORY-V3-012: Implement StoryStatusProvider
 */

import { StoryStatusProvider } from '@/lib/status/providers/story-provider';
import type { StatusResult } from '@/lib/status/types';
import fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('StoryStatusProvider', () => {
  let provider: StoryStatusProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new StoryStatusProvider('docs/mam-workflow-status.md');
  });

  describe('detectEntity', () => {
    it('should detect STORY-XXX pattern', () => {
      expect(provider.detectEntity('STORY-001')).toBe(true);
      expect(provider.detectEntity('STORY-123')).toBe(true);
      expect(provider.detectEntity('STORY-999')).toBe(true);
    });

    it('should detect US-XXX pattern (User Story)', () => {
      expect(provider.detectEntity('US-001')).toBe(true);
      expect(provider.detectEntity('US-123')).toBe(true);
    });

    it('should detect TASK-XXX pattern', () => {
      expect(provider.detectEntity('TASK-001')).toBe(true);
      expect(provider.detectEntity('TASK-123')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(provider.detectEntity('story-001')).toBe(true);
      expect(provider.detectEntity('us-001')).toBe(true);
      expect(provider.detectEntity('task-001')).toBe(true);
    });

    it('should reject non-story patterns', () => {
      expect(provider.detectEntity('EPIC-001')).toBe(false);
      expect(provider.detectEntity('pm-planning')).toBe(false);
      expect(provider.detectEntity('random text')).toBe(false);
      expect(provider.detectEntity('')).toBe(false);
      expect(provider.detectEntity('STORY')).toBe(false);
      expect(provider.detectEntity('STORY-')).toBe(false);
      expect(provider.detectEntity('STORY-ABC')).toBe(false);
    });
  });

  describe('getStatus - Single Story', () => {
    const mockStatusFile = `
## BACKLOG

- [ ] **[STORY-001]** First story | 5 points
- [ ] **[STORY-002]** Second story | 3 points | @john

## TODO

- [ ] **[STORY-003]** Third story | 8 points | Started: 2025-10-20

## IN PROGRESS

- [ ] **[STORY-004]** Fourth story | 13 points | @jane

## DONE

- [x] **[STORY-005]** Fifth story | 2 points | Completed: 2025-10-22
`;

    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(mockStatusFile);
    });

    it('should return story from BACKLOG', async () => {
      const result = await provider.getStatus('STORY-001');

      expect(result.entityType).toBe('story');
      expect(result.entityId).toBe('STORY-001');
      expect(result.data.id).toBe('STORY-001');
      expect(result.data.title).toBe('First story');
      expect(result.data.status).toBe('BACKLOG');
      expect(result.data.points).toBe(5);
      expect(result.data.completed).toBe(false);
    });

    it('should return story with assignee', async () => {
      const result = await provider.getStatus('STORY-002');

      expect(result.data.assignee).toBe('john');
      expect(result.data.points).toBe(3);
    });

    it('should return story with started date', async () => {
      const result = await provider.getStatus('STORY-003');

      expect(result.data.status).toBe('TODO');
      expect(result.data.startedDate).toBeDefined();
    });

    it('should return story from IN PROGRESS', async () => {
      const result = await provider.getStatus('STORY-004');

      expect(result.data.status).toBe('IN_PROGRESS');
      expect(result.data.assignee).toBe('jane');
      expect(result.data.points).toBe(13);
    });

    it('should return completed story from DONE', async () => {
      const result = await provider.getStatus('STORY-005');

      expect(result.data.status).toBe('DONE');
      expect(result.data.completed).toBe(true);
      expect(result.data.completedDate).toBeDefined();
    });

    it('should handle story not found', async () => {
      const result = await provider.getStatus('STORY-999');

      expect(result.data.found).toBe(false);
      expect(result.data.error).toContain('not found');
      expect(result.metadata?.errors).toBeDefined();
    });

    it('should be case insensitive for story ID', async () => {
      const result = await provider.getStatus('story-001');

      expect(result.data.id).toBe('STORY-001');
    });
  });

  describe('getStatus - All Stories', () => {
    const mockStatusFile = `
## BACKLOG

- [ ] **[STORY-001]** First story | 5 points
- [ ] **[STORY-002]** Second story | 3 points

## TODO

- [ ] **[STORY-003]** Third story | 8 points

## IN PROGRESS

- [ ] **[STORY-004]** Fourth story | 13 points

## DONE

- [x] **[STORY-005]** Fifth story | 2 points
- [x] **[STORY-006]** Sixth story | 5 points
`;

    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(mockStatusFile);
    });

    it('should return all stories when no entityId provided', async () => {
      const result = await provider.getStatus();

      expect(result.entityType).toBe('story');
      expect(result.entityId).toBeUndefined();
      expect(Array.isArray(result.data.stories)).toBe(true);
      expect(result.data.totalCount).toBe(6);
    });

    it('should group stories by status', async () => {
      const result = await provider.getStatus();

      expect(result.data.byStatus).toEqual({
        BACKLOG: 2,
        TODO: 1,
        IN_PROGRESS: 1,
        DONE: 2,
      });
    });

    it('should include all story details', async () => {
      const result = await provider.getStatus();
      const stories = result.data.stories as Array<{ id: string; title: string; points?: number }>;

      expect(stories[0]).toMatchObject({
        id: 'STORY-001',
        title: 'First story',
        status: 'BACKLOG',
        points: 5,
      });
    });
  });

  describe('formatOutput', () => {
    const mockResult: StatusResult = {
      entityType: 'story',
      entityId: 'STORY-001',
      data: {
        id: 'STORY-001',
        title: 'Test Story',
        status: 'IN_PROGRESS',
        points: 5,
        assignee: 'john',
        milestone: 'Milestone 1.0',
        completed: false,
      },
      timestamp: new Date().toISOString(),
    };

    it('should format as JSON', () => {
      const output = provider.formatOutput(mockResult, 'json');

      expect(output).toContain('"entityType": "story"');
      expect(output).toContain('"STORY-001"');
      const parsed = JSON.parse(output);
      expect(parsed.entityType).toBe('story');
    });

    it('should format as table', () => {
      const output = provider.formatOutput(mockResult, 'table');

      expect(output).toContain('┌');
      expect(output).toContain('└');
      expect(output).toContain('STORY-001');
      expect(output).toContain('Test Story');
      expect(output).toContain('IN_PROGRESS');
      expect(output).toContain('5');
    });

    it('should format as markdown', () => {
      const output = provider.formatOutput(mockResult, 'markdown');

      expect(output).toContain('## Story: STORY-001');
      expect(output).toContain('**Title:** Test Story');
      expect(output).toContain('**Status:** IN_PROGRESS');
      expect(output).toContain('**Points:** 5');
      expect(output).toContain('**Assignee:** john');
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await provider.getStatus('STORY-001');

      expect(result.data.found).toBe(false);
      expect(result.data.error).toContain('File not found');
      expect(result.metadata?.errors).toBeDefined();
    });

    it('should handle malformed status file gracefully', async () => {
      mockFs.readFile.mockResolvedValue('Invalid content without proper sections');

      const result = await provider.getStatus();

      expect(result.entityType).toBe('story');
      expect(result.data.totalCount).toBe(0);
    });
  });

  describe('Parsing Edge Cases', () => {
    it('should handle stories with no points', async () => {
      const mockFile = `
## BACKLOG
- [ ] **[STORY-001]** Story without points
`;
      mockFs.readFile.mockResolvedValue(mockFile);

      const result = await provider.getStatus('STORY-001');

      expect(result.data.points).toBeUndefined();
    });

    it('should handle stories with multiple metadata fields', async () => {
      const mockFile = `
## IN PROGRESS
- [ ] **[STORY-001]** Complex story | 8 points | @alice | Due: 2025-10-30 | Started: 2025-10-20
`;
      mockFs.readFile.mockResolvedValue(mockFile);

      const result = await provider.getStatus('STORY-001');

      expect(result.data.points).toBe(8);
      expect(result.data.assignee).toBe('alice');
      expect(result.data.dueDate).toBeDefined();
      expect(result.data.startedDate).toBeDefined();
    });

    it('should handle empty sections', async () => {
      const mockFile = `
## BACKLOG

## TODO

## IN PROGRESS

## DONE
- [x] **[STORY-001]** Only story | 3 points
`;
      mockFs.readFile.mockResolvedValue(mockFile);

      const result = await provider.getStatus();

      expect(result.data.totalCount).toBe(1);
      expect(result.data.byStatus).toEqual({
        BACKLOG: 0,
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 1,
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle real-world status file format', async () => {
      const realWorldFile = `## BACKLOG

### Milestone 2.0: Advanced Features

- [ ] **[STORY-011]** Sub-workflows support | 13 points
- [ ] **[STORY-012]** Nested templates | 8 points | @bob

## TODO

## IN PROGRESS

- [ ] **[STORY-013]** Agent composition | 21 points | @alice | Started: 2025-10-25

## DONE

- [x] **[STORY-007]** Basic setup | 5 points | Completed: 2025-10-20
- [x] **[STORY-008]** Configuration | 3 points | Completed: 2025-10-21
`;
      mockFs.readFile.mockResolvedValue(realWorldFile);

      const result = await provider.getStatus();

      expect(result.data.totalCount).toBe(5);
      expect(result.data.byStatus).toEqual({
        BACKLOG: 2,
        TODO: 0,
        IN_PROGRESS: 1,
        DONE: 2,
      });
    });
  });
});

/**
 * MADACE Epic Status Provider Tests
 * STORY-V3-013: Implement EpicStatusProvider
 */

import { EpicStatusProvider } from '@/lib/status/providers/epic-provider';
import type { StatusResult } from '@/lib/status/types';
import fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('EpicStatusProvider', () => {
  let provider: EpicStatusProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new EpicStatusProvider('docs/v3-planning/epics');
  });

  describe('detectEntity', () => {
    it('should detect EPIC-V3-XXX pattern', () => {
      expect(provider.detectEntity('EPIC-V3-001')).toBe(true);
      expect(provider.detectEntity('EPIC-V3-123')).toBe(true);
      expect(provider.detectEntity('EPIC-V3-999')).toBe(true);
    });

    it('should detect EPIC-XXX pattern', () => {
      expect(provider.detectEntity('EPIC-001')).toBe(true);
      expect(provider.detectEntity('EPIC-123')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(provider.detectEntity('epic-v3-001')).toBe(true);
      expect(provider.detectEntity('epic-001')).toBe(true);
      expect(provider.detectEntity('EPIC-v3-001')).toBe(true);
    });

    it('should reject non-epic patterns', () => {
      expect(provider.detectEntity('STORY-001')).toBe(false);
      expect(provider.detectEntity('US-001')).toBe(false);
      expect(provider.detectEntity('random text')).toBe(false);
      expect(provider.detectEntity('')).toBe(false);
      expect(provider.detectEntity('EPIC')).toBe(false);
      expect(provider.detectEntity('EPIC-')).toBe(false);
      expect(provider.detectEntity('EPIC-ABC')).toBe(false);
    });
  });

  describe('getStatus - Single Epic', () => {
    const mockEpicFile = `# EPIC-V3-001: Scale-Adaptive Workflow Router

**Epic ID:** EPIC-V3-001
**Priority:** P0 (Critical - Foundation)
**Effort Estimate:** 34 points
**Target Quarter:** Q2 2026
**Owner:** Product Team
**Status:** ✅ Planning Complete
**Last Updated:** 2025-10-24

## Epic Summary

Implement intelligent workflow routing based on project complexity assessment.

---

## User Stories

1. **US-001:** As a PM, I want automatic complexity assessment
2. **US-002:** As a developer, I want routing recommendations
3. **US-003:** As a team lead, I want override capabilities
`;

    beforeEach(() => {
      // Mock directory access
      mockFs.access.mockResolvedValue(undefined);

      // Mock readdir to return epic files
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue([
        'EPIC-V3-001-scale-router.md',
        'EPIC-V3-002-status-checker.md',
        'README.md', // Should be filtered out
      ] as any);
    });

    it('should return epic from file', async () => {
      mockFs.readFile.mockResolvedValue(mockEpicFile);

      const result = await provider.getStatus('EPIC-V3-001');

      expect(result.entityType).toBe('epic');
      expect(result.entityId).toBe('EPIC-V3-001');
      expect(result.data.id).toBe('EPIC-V3-001');
      expect(result.data.name).toBe('Scale-Adaptive Workflow Router');
      expect(result.data.priority).toBe('P0');
      expect(result.data.effort).toBe(34);
      expect(result.data.quarter).toBe('Q2');
      expect(result.data.owner).toBe('Product Team');
      expect(result.data.status).toBe('Planning Complete');
    });

    it('should extract story count', async () => {
      mockFs.readFile.mockResolvedValue(mockEpicFile);

      const result = await provider.getStatus('EPIC-V3-001');

      expect(result.data.storyCount).toBe(3);
    });

    it('should extract summary', async () => {
      mockFs.readFile.mockResolvedValue(mockEpicFile);

      const result = await provider.getStatus('EPIC-V3-001');

      expect(result.data.summary).toContain(
        'Implement intelligent workflow routing based on project complexity assessment'
      );
    });

    it('should handle epic not found', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue(['EPIC-V3-002-status-checker.md'] as any);

      const result = await provider.getStatus('EPIC-V3-999');

      expect(result.entityType).toBe('epic');
      expect(result.entityId).toBe('EPIC-V3-999');
      expect(result.metadata?.errors).toBeDefined();
      expect(result.metadata?.errors?.[0]).toContain('not found');
    });

    it('should be case insensitive for epic ID', async () => {
      mockFs.readFile.mockResolvedValue(mockEpicFile);

      const result = await provider.getStatus('epic-v3-001');

      expect(result.data.id).toBe('EPIC-V3-001');
    });

    it('should handle directory not accessible', async () => {
      mockFs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await provider.getStatus('EPIC-V3-001');

      expect(result.metadata?.errors).toBeDefined();
      expect(result.metadata?.errors?.[0]).toContain('not found');
    });
  });

  describe('getStatus - All Epics', () => {
    const mockEpic1 = `# EPIC-V3-001: Scale Router

**Epic ID:** EPIC-V3-001
**Priority:** P0
**Effort Estimate:** 34 points
**Target Quarter:** Q2 2026
**Owner:** Team A
**Status:** Planning

## Epic Summary

First epic summary.

## User Stories

1. **US-001:** Story 1
2. **US-002:** Story 2
`;

    const mockEpic2 = `# EPIC-V3-002: Status Checker

**Epic ID:** EPIC-V3-002
**Priority:** P0
**Effort:** 21 points
**Quarter:** Q2 2026
**Owner:** Team B
**Status:** In Progress

## Summary

Second epic summary.

## User Stories

1. **US-001:** Story A
`;

    beforeEach(() => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        'EPIC-V3-001-scale-router.md',
        'EPIC-V3-002-status-checker.md',
      ] as any);
    });

    it('should return all epics when no entityId provided', async () => {
      mockFs.readFile
        .mockResolvedValueOnce(mockEpic1)
        .mockResolvedValueOnce(mockEpic2);

      const result = await provider.getStatus();

      expect(result.entityType).toBe('epic');
      expect(result.entityId).toBeUndefined();
      expect(Array.isArray(result.data.epics)).toBe(true);
      expect(result.data.totalCount).toBe(2);
    });

    it('should include all epic details', async () => {
      mockFs.readFile
        .mockResolvedValueOnce(mockEpic1)
        .mockResolvedValueOnce(mockEpic2);

      const result = await provider.getStatus();
      const epics = result.data.epics as Array<{ id: string; name: string; effort: number }>;

      expect(epics[0]).toMatchObject({
        id: 'EPIC-V3-001',
        name: 'Scale Router',
        effort: 34,
        priority: 'P0',
        owner: 'Team A',
      });

      expect(epics[1]).toMatchObject({
        id: 'EPIC-V3-002',
        name: 'Status Checker',
        effort: 21,
        priority: 'P0',
        owner: 'Team B',
      });
    });

    it('should sort epics by ID', async () => {
      mockFs.readFile
        .mockResolvedValueOnce(mockEpic1)
        .mockResolvedValueOnce(mockEpic2);

      const result = await provider.getStatus();
      const epics = result.data.epics as Array<{ id: string }>;

      expect(epics[0]!.id).toBe('EPIC-V3-001');
      expect(epics[1]!.id).toBe('EPIC-V3-002');
    });

    it('should handle empty epic directory', async () => {
      mockFs.readdir.mockResolvedValue([] as any);

      const result = await provider.getStatus();

      expect(result.data.epics).toEqual([]);
      expect(result.data.totalCount).toBe(0);
      expect(result.metadata?.warnings).toBeDefined();
    });

    it('should filter non-epic files', async () => {
      mockFs.readdir.mockResolvedValue([
        'EPIC-V3-001-scale-router.md',
        'README.md',
        'template.md',
        '.DS_Store',
      ] as any);
      mockFs.readFile.mockResolvedValue(mockEpic1);

      const result = await provider.getStatus();

      expect(result.data.totalCount).toBe(1);
    });
  });

  describe('formatOutput', () => {
    const mockResult: StatusResult = {
      entityType: 'epic',
      entityId: 'EPIC-V3-001',
      data: {
        id: 'EPIC-V3-001',
        name: 'Scale-Adaptive Workflow Router',
        priority: 'P0',
        effort: 34,
        quarter: 'Q2 2026',
        owner: 'Product Team',
        status: 'Planning Complete',
        storyCount: 10,
        lastUpdated: '2025-10-24',
        summary: 'Implement intelligent workflow routing based on project complexity.',
      },
      timestamp: new Date().toISOString(),
    };

    it('should format as JSON', () => {
      const output = provider.formatOutput(mockResult, 'json');

      expect(output).toContain('"entityType": "epic"');
      expect(output).toContain('"EPIC-V3-001"');
      const parsed = JSON.parse(output);
      expect(parsed.entityType).toBe('epic');
    });

    it('should format as table for single epic', () => {
      const output = provider.formatOutput(mockResult, 'table');

      expect(output).toContain('┌');
      expect(output).toContain('└');
      expect(output).toContain('EPIC-V3-001');
      expect(output).toContain('Scale-Adaptive Workflow Router');
      expect(output).toContain('34 points');
      expect(output).toContain('Q2 2026');
    });

    it('should format as markdown for single epic', () => {
      const output = provider.formatOutput(mockResult, 'markdown');

      expect(output).toContain('# ');
      expect(output).toContain('EPIC-V3-001');
      expect(output).toContain('Scale-Adaptive Workflow Router');
      expect(output).toContain('**Priority:** P0');
      expect(output).toContain('**Effort:** 34 points');
      expect(output).toContain('## Summary');
    });

    it('should format as table for multiple epics', () => {
      const multipleResult: StatusResult = {
        entityType: 'epic',
        data: {
          epics: [
            {
              id: 'EPIC-V3-001',
              name: 'Scale Router',
              priority: 'P0',
              effort: 34,
              quarter: 'Q2',
              owner: 'Team A',
              status: 'Planning',
              storyCount: 10,
              lastUpdated: '2025-10-24',
              summary: 'Summary 1',
            },
            {
              id: 'EPIC-V3-002',
              name: 'Status Checker',
              priority: 'P0',
              effort: 21,
              quarter: 'Q2',
              owner: 'Team B',
              status: 'In Progress',
              storyCount: 8,
              lastUpdated: '2025-10-25',
              summary: 'Summary 2',
            },
          ],
          totalCount: 2,
        },
        timestamp: new Date().toISOString(),
      };

      const output = provider.formatOutput(multipleResult, 'table');

      expect(output).toContain('EPIC-V3-001');
      expect(output).toContain('EPIC-V3-002');
      expect(output).toContain('Total: 2 epics');
    });

    it('should format as markdown for multiple epics', () => {
      const multipleResult: StatusResult = {
        entityType: 'epic',
        data: {
          epics: [
            {
              id: 'EPIC-V3-001',
              name: 'Scale Router',
              priority: 'P0',
              effort: 34,
              quarter: 'Q2',
              owner: 'Team A',
              status: 'Planning',
              storyCount: 10,
              lastUpdated: '2025-10-24',
              summary: 'Summary 1',
            },
          ],
          totalCount: 1,
        },
        timestamp: new Date().toISOString(),
      };

      const output = provider.formatOutput(multipleResult, 'markdown');

      expect(output).toContain('# MADACE Epics');
      expect(output).toContain('## ');
      expect(output).toContain('EPIC-V3-001');
      expect(output).toContain('**Total:** 1 epics');
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['EPIC-V3-001-scale-router.md'] as any);
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'));

      const result = await provider.getStatus('EPIC-V3-001');

      expect(result.metadata?.errors).toBeDefined();
      expect(result.metadata?.errors?.[0]).toContain('Failed to read epic');
    });

    it('should handle directory read errors', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));

      const result = await provider.getStatus();

      expect(result.metadata?.errors).toBeDefined();
      expect(result.metadata?.errors?.[0]).toContain('Failed to read epics directory');
    });

    it('should collect errors from multiple file parsing failures', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        'EPIC-V3-001-scale-router.md',
        'EPIC-V3-002-status-checker.md',
      ] as any);
      mockFs.readFile
        .mockRejectedValueOnce(new Error('Parse error 1'))
        .mockRejectedValueOnce(new Error('Parse error 2'));

      const result = await provider.getStatus();

      expect(result.data.totalCount).toBe(0);
      expect(result.metadata?.errors).toBeDefined();
      expect(result.metadata?.errors?.length).toBe(2);
    });
  });

  describe('Parsing Edge Cases', () => {
    it('should handle epic with minimal metadata', async () => {
      const minimalEpic = `# EPIC-V3-001: Minimal Epic

**Epic ID:** EPIC-V3-001
`;
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['EPIC-V3-001-minimal.md'] as any);
      mockFs.readFile.mockResolvedValue(minimalEpic);

      const result = await provider.getStatus('EPIC-V3-001');

      expect(result.data.id).toBe('EPIC-V3-001');
      expect(result.data.name).toBe('Minimal Epic');
      expect(result.data.priority).toBe('Unknown');
      expect(result.data.effort).toBe(0);
    });

    it('should handle epic with all metadata fields', async () => {
      const completeEpic = `# EPIC-V3-001: Complete Epic

**Epic ID:** EPIC-V3-001
**Priority:** P0 (Critical - Foundation)
**Effort Estimate:** 50 points
**Target Quarter:** Q3 2026
**Owner:** Engineering Team
**Status:** 🔄 In Progress
**Last Updated:** 2025-10-29

## Epic Summary

This is a complete epic with all metadata.

## User Stories

1. **US-001:** Story 1
2. **US-002:** Story 2
3. **US-003:** Story 3
`;
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['EPIC-V3-001-complete.md'] as any);
      mockFs.readFile.mockResolvedValue(completeEpic);

      const result = await provider.getStatus('EPIC-V3-001');

      expect(result.data.id).toBe('EPIC-V3-001');
      expect(result.data.name).toBe('Complete Epic');
      expect(result.data.priority).toBe('P0');
      expect(result.data.effort).toBe(50);
      expect(result.data.quarter).toBe('Q3');
      expect(result.data.owner).toBe('Engineering Team');
      expect(result.data.status).toBe('In Progress');
      expect(result.data.storyCount).toBe(3);
      expect(result.data.lastUpdated).toBe('2025-10-29');
    });

    it('should extract epic ID from filename if not in content', async () => {
      const noIdEpic = `# No ID Epic

Some content without explicit Epic ID field.
`;
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['EPIC-V3-999-no-id.md'] as any);
      mockFs.readFile.mockResolvedValue(noIdEpic);

      const result = await provider.getStatus('EPIC-V3-999');

      expect(result.data.id).toBe('EPIC-V3-999');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle real-world epic file format', async () => {
      const realWorldEpic = `# EPIC-V3-001: Scale-Adaptive Workflow Router

**Epic ID:** EPIC-V3-001
**Priority:** P0 (Critical - Foundation)
**Effort Estimate:** 34 points (10 stories)
**Target Quarter:** Q2 2026 (5 weeks dev + 3 weeks testing)
**Owner:** Product & Engineering Team
**Status:** ✅ Planning Complete
**Last Updated:** 2025-10-24

---

## Epic Summary

Implement intelligent workflow routing that automatically adapts to project complexity level (0-4).

The Scale Router eliminates manual workflow selection by:
- Assessing 8 project criteria (team size, codebase, integrations, etc.)
- Calculating complexity score (0-40 points)
- Routing to appropriate workflow (minimal → enterprise)

**Key Innovation:** Zero-config intelligent routing reduces planning friction by 70%.

---

## User Stories (10 stories, 34 points)

### Core Assessment (13 points)

1. **US-001:** Complexity Scoring Algorithm | 5 pts
2. **US-002:** Assessment Report Template | 3 pts
3. **US-003:** Interactive Assessment CLI | 3 pts

### Routing Engine (13 points)

4. **US-004:** Route-Workflow YAML | 5 pts
5. **US-005:** Routing Action in Executor | 5 pts
6. **US-006:** User Override System | 5 pts

### CLI & UI (8 points)

7. **US-007:** CLI Command \`madace assess-scale\` | 3 pts
8. **US-008:** Integrate into Setup Wizard | 2 pts
9. **US-009:** Assessment Dashboard Page | 2 pts
10. **US-010:** E2E Testing | 1 pt
`;
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        'EPIC-V3-001-scale-router.md',
      ] as any);
      mockFs.readFile.mockResolvedValue(realWorldEpic);

      const result = await provider.getStatus('EPIC-V3-001');

      expect(result.data.id).toBe('EPIC-V3-001');
      expect(result.data.name).toBe('Scale-Adaptive Workflow Router');
      expect(result.data.priority).toBe('P0');
      expect(result.data.effort).toBe(34);
      expect(result.data.quarter).toBe('Q2');
      expect(result.data.owner).toBe('Product & Engineering Team');
      expect(result.data.status).toBe('Planning Complete');
      expect(result.data.storyCount).toBe(10);
      expect(result.data.lastUpdated).toBe('2025-10-24');
      expect(result.data.summary).toContain(
        'Implement intelligent workflow routing that automatically adapts to project complexity level'
      );
    });
  });
});

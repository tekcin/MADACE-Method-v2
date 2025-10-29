/**
 * MADACE Workflow Status Provider Tests
 * STORY-V3-014: Implement WorkflowStatusProvider
 */

import { WorkflowStatusProvider } from '@/lib/status/providers/workflow-provider';
import type { StatusResult } from '@/lib/status/types';
import type {
  WorkflowState,
  WorkflowData,
  WorkflowStep,
} from '@/lib/status/providers/workflow-provider';
import { promises as fs } from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    readdir: jest.fn(),
  },
}));
const mockFs = fs as jest.Mocked<typeof fs>;

describe('WorkflowStatusProvider', () => {
  let provider: WorkflowStatusProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new WorkflowStatusProvider('madace-data/workflow-states');
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // detectEntity() Tests
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('detectEntity', () => {
    it('should detect valid kebab-case workflow names', () => {
      expect(provider.detectEntity('pm-planning')).toBe(true);
      expect(provider.detectEntity('create-prd')).toBe(true);
      expect(provider.detectEntity('epic-breakdown')).toBe(true);
      expect(provider.detectEntity('route-workflow')).toBe(true);
    });

    it('should detect single word workflow names', () => {
      expect(provider.detectEntity('planning')).toBe(true);
      expect(provider.detectEntity('assessment')).toBe(true);
    });

    it('should reject uppercase patterns', () => {
      expect(provider.detectEntity('PM-PLANNING')).toBe(false);
      expect(provider.detectEntity('Create-PRD')).toBe(false);
      expect(provider.detectEntity('PLANNING')).toBe(false);
    });

    it('should reject story/epic patterns', () => {
      expect(provider.detectEntity('STORY-001')).toBe(false);
      expect(provider.detectEntity('EPIC-V3-001')).toBe(false);
      expect(provider.detectEntity('US-001')).toBe(false);
      expect(provider.detectEntity('TASK-001')).toBe(false);
    });

    it('should reject camelCase patterns', () => {
      expect(provider.detectEntity('pmPlanning')).toBe(false);
      expect(provider.detectEntity('createPRD')).toBe(false);
      expect(provider.detectEntity('epicBreakdown')).toBe(false);
    });

    it('should reject patterns with numbers', () => {
      expect(provider.detectEntity('workflow-123')).toBe(false);
      expect(provider.detectEntity('plan-v3')).toBe(false);
      expect(provider.detectEntity('step-1')).toBe(false);
    });

    it('should reject special characters', () => {
      expect(provider.detectEntity('pm_planning')).toBe(false);
      expect(provider.detectEntity('create.prd')).toBe(false);
      expect(provider.detectEntity('epic breakdown')).toBe(false);
      expect(provider.detectEntity('')).toBe(false);
    });

    it('should reject trailing or leading hyphens', () => {
      expect(provider.detectEntity('-planning')).toBe(false);
      expect(provider.detectEntity('planning-')).toBe(false);
      expect(provider.detectEntity('-')).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // getStatus() - Single Workflow Tests
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('getStatus - Single Workflow', () => {
    const mockWorkflowState: WorkflowState = {
      workflow: 'pm-planning',
      currentStep: 3,
      totalSteps: 5,
      status: 'in_progress',
      startedAt: '2025-10-29T10:00:00.000Z',
      lastUpdated: '2025-10-29T10:30:00.000Z',
      steps: [
        {
          id: 'elicit-project-name',
          status: 'completed',
          startedAt: '2025-10-29T10:00:00.000Z',
          completedAt: '2025-10-29T10:05:00.000Z',
        },
        {
          id: 'elicit-project-description',
          status: 'completed',
          startedAt: '2025-10-29T10:05:00.000Z',
          completedAt: '2025-10-29T10:15:00.000Z',
        },
        {
          id: 'generate-initial-prd',
          status: 'in_progress',
          startedAt: '2025-10-29T10:15:00.000Z',
        },
        {
          id: 'review-prd',
          status: 'pending',
        },
        {
          id: 'finalize-prd',
          status: 'pending',
        },
      ],
      context: {
        projectName: 'Test Project',
        projectDescription: 'A test project for MADACE',
      },
    };

    beforeEach(() => {
      mockFs.access.mockResolvedValue(undefined);
    });

    it('should return workflow status from state file', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockWorkflowState));

      const result = await provider.getStatus('pm-planning');

      expect(result.entityType).toBe('workflow');
      expect(result.entityId).toBe('pm-planning');
      expect(result.data.workflow).toBe('pm-planning');
      expect(result.data.status).toBe('in_progress');
      expect(result.data.currentStep).toBe(3);
      expect(result.data.totalSteps).toBe(5);
    });

    it('should calculate progress correctly', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockWorkflowState));

      const result = await provider.getStatus('pm-planning');

      // 2 completed steps out of 5 = 40%
      expect(result.data.progress).toBe(40);
    });

    it('should extract current step name', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockWorkflowState));

      const result = await provider.getStatus('pm-planning');

      expect(result.data.currentStepName).toBe('generate-initial-prd');
    });

    it('should include workflow context', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockWorkflowState));

      const result = await provider.getStatus('pm-planning');

      expect(result.data.context).toEqual({
        projectName: 'Test Project',
        projectDescription: 'A test project for MADACE',
      });
    });

    it('should include all workflow steps', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockWorkflowState));

      const result = await provider.getStatus('pm-planning');

      const steps = result.data.steps as WorkflowStep[];
      expect(steps).toHaveLength(5);
      expect(steps[0]!.id).toBe('elicit-project-name');
      expect(steps[0]!.status).toBe('completed');
      expect(steps[2]!.id).toBe('generate-initial-prd');
      expect(steps[2]!.status).toBe('in_progress');
    });

    it('should handle workflow not found error', async () => {
      mockFs.access.mockResolvedValue(undefined);
      const notFoundError: NodeJS.ErrnoException = new Error('File not found');
      notFoundError.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(notFoundError);

      const result = await provider.getStatus('nonexistent-workflow');

      expect(result.data.error).toContain('Workflow not found');
      expect(result.metadata?.errors).toBeDefined();
    });

    it('should handle directory not found', async () => {
      mockFs.access.mockRejectedValue(new Error('Directory not found'));

      const result = await provider.getStatus('pm-planning');

      expect(result.data.error).toBe('Workflow state directory not found');
      expect(result.metadata?.warnings).toContain(
        'Workflow state directory not found: madace-data/workflow-states'
      );
    });

    it('should handle invalid JSON in state file', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue('{ invalid json }');

      const result = await provider.getStatus('pm-planning');

      expect(result.data.error).toBeDefined();
      expect(result.metadata?.errors).toBeDefined();
    });

    it('should handle completed workflow', async () => {
      const completedState: WorkflowState = {
        ...mockWorkflowState,
        currentStep: 5,
        status: 'completed',
        steps: mockWorkflowState.steps.map((step) => ({
          ...step,
          status: 'completed',
          completedAt: '2025-10-29T11:00:00.000Z',
        })),
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(completedState));

      const result = await provider.getStatus('pm-planning');

      expect(result.data.status).toBe('completed');
      expect(result.data.progress).toBe(100);
    });

    it('should handle workflow with no completed steps', async () => {
      const pendingState: WorkflowState = {
        ...mockWorkflowState,
        currentStep: 1,
        status: 'in_progress',
        steps: mockWorkflowState.steps.map((step) => ({
          ...step,
          status: 'pending',
        })),
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(pendingState));

      const result = await provider.getStatus('pm-planning');

      expect(result.data.progress).toBe(0);
    });

    it('should handle failed workflow', async () => {
      const failedState: WorkflowState = {
        ...mockWorkflowState,
        status: 'failed',
        steps: [
          ...mockWorkflowState.steps.slice(0, 2),
          {
            id: 'generate-initial-prd',
            status: 'failed',
            startedAt: '2025-10-29T10:15:00.000Z',
            error: 'LLM API timeout',
          },
          ...mockWorkflowState.steps.slice(3),
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(failedState));

      const result = await provider.getStatus('pm-planning');

      expect(result.data.status).toBe('failed');
      const steps = result.data.steps as WorkflowStep[];
      expect(steps[2]!.error).toBe('LLM API timeout');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // getStatus() - All Workflows Tests
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('getStatus - All Workflows', () => {
    beforeEach(() => {
      mockFs.access.mockResolvedValue(undefined);
    });

    it('should return all active workflows', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue([
        '.pm-planning.state.json',
        '.create-prd.state.json',
        '.epic-breakdown.state.json',
        'README.md',
      ] as any);

      const pmState: WorkflowState = {
        workflow: 'pm-planning',
        currentStep: 2,
        totalSteps: 5,
        status: 'in_progress',
        startedAt: '2025-10-29T10:00:00.000Z',
        lastUpdated: '2025-10-29T10:30:00.000Z',
        steps: [
          { id: 'step-1', status: 'completed', completedAt: '2025-10-29T10:10:00.000Z' },
          { id: 'step-2', status: 'in_progress', startedAt: '2025-10-29T10:20:00.000Z' },
          { id: 'step-3', status: 'pending' },
          { id: 'step-4', status: 'pending' },
          { id: 'step-5', status: 'pending' },
        ],
        context: {},
      };

      const createPrdState: WorkflowState = {
        ...pmState,
        workflow: 'create-prd',
        currentStep: 1,
        totalSteps: 3,
        steps: [
          { id: 'step-1', status: 'in_progress', startedAt: '2025-10-29T10:00:00.000Z' },
          { id: 'step-2', status: 'pending' },
          { id: 'step-3', status: 'pending' },
        ],
      };

      const epicState: WorkflowState = {
        ...pmState,
        workflow: 'epic-breakdown',
        currentStep: 3,
        totalSteps: 3,
        status: 'completed',
        steps: [
          { id: 'step-1', status: 'completed', completedAt: '2025-10-29T09:00:00.000Z' },
          { id: 'step-2', status: 'completed', completedAt: '2025-10-29T09:30:00.000Z' },
          { id: 'step-3', status: 'completed', completedAt: '2025-10-29T10:00:00.000Z' },
        ],
      };

      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(pmState))
        .mockResolvedValueOnce(JSON.stringify(createPrdState))
        .mockResolvedValueOnce(JSON.stringify(epicState));

      const result = await provider.getStatus();

      expect(result.entityType).toBe('workflow');
      expect(result.entityId).toBeUndefined();
      expect(result.data.totalWorkflows).toBe(3);

      const workflows = result.data.workflows as WorkflowData[];
      expect(workflows).toHaveLength(3);
      expect(workflows[0]!.workflow).toBe('pm-planning');
      expect(workflows[1]!.workflow).toBe('create-prd');
      expect(workflows[2]!.workflow).toBe('epic-breakdown');
    });

    it('should return empty array when no workflows exist', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue(['README.md', '.gitignore'] as any);

      const result = await provider.getStatus();

      expect(result.data.totalWorkflows).toBe(0);
      expect(result.data.workflows).toEqual([]);
    });

    it('should skip invalid state files', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue(['.pm-planning.state.json', '.invalid.state.json'] as any);

      const validState: WorkflowState = {
        workflow: 'pm-planning',
        currentStep: 1,
        totalSteps: 3,
        status: 'in_progress',
        startedAt: '2025-10-29T10:00:00.000Z',
        lastUpdated: '2025-10-29T10:30:00.000Z',
        steps: [
          { id: 'step-1', status: 'in_progress' },
          { id: 'step-2', status: 'pending' },
          { id: 'step-3', status: 'pending' },
        ],
        context: {},
      };

      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(validState))
        .mockResolvedValueOnce('{ invalid json }');

      // Mock console.error to suppress error output during test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await provider.getStatus();

      expect(result.data.totalWorkflows).toBe(1);
      expect(result.data.workflows).toHaveLength(1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle directory not found for all workflows', async () => {
      mockFs.access.mockRejectedValue(new Error('Directory not found'));

      const result = await provider.getStatus();

      expect(result.data.totalWorkflows).toBe(0);
      expect(result.data.workflows).toEqual([]);
      expect(result.metadata?.warnings).toContain(
        'Workflow state directory not found: madace-data/workflow-states'
      );
    });

    it('should calculate progress for multiple workflows', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue(['.workflow-a.state.json', '.workflow-b.state.json'] as any);

      const stateA: WorkflowState = {
        workflow: 'workflow-a',
        currentStep: 2,
        totalSteps: 4,
        status: 'in_progress',
        startedAt: '2025-10-29T10:00:00.000Z',
        lastUpdated: '2025-10-29T10:30:00.000Z',
        steps: [
          { id: 'step-1', status: 'completed', completedAt: '2025-10-29T10:10:00.000Z' },
          { id: 'step-2', status: 'in_progress', startedAt: '2025-10-29T10:20:00.000Z' },
          { id: 'step-3', status: 'pending' },
          { id: 'step-4', status: 'pending' },
        ],
        context: {},
      };

      const stateB: WorkflowState = {
        workflow: 'workflow-b',
        currentStep: 3,
        totalSteps: 3,
        status: 'completed',
        startedAt: '2025-10-29T09:00:00.000Z',
        lastUpdated: '2025-10-29T10:00:00.000Z',
        steps: [
          { id: 'step-1', status: 'completed', completedAt: '2025-10-29T09:20:00.000Z' },
          { id: 'step-2', status: 'completed', completedAt: '2025-10-29T09:40:00.000Z' },
          { id: 'step-3', status: 'completed', completedAt: '2025-10-29T10:00:00.000Z' },
        ],
        context: {},
      };

      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(stateA))
        .mockResolvedValueOnce(JSON.stringify(stateB));

      const result = await provider.getStatus();
      const workflows = result.data.workflows as WorkflowData[];

      expect(workflows[0]!.progress).toBe(25); // 1/4 = 25%
      expect(workflows[1]!.progress).toBe(100); // 3/3 = 100%
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // formatOutput() Tests
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('formatOutput', () => {
    const mockSingleWorkflowResult: StatusResult = {
      entityType: 'workflow',
      entityId: 'pm-planning',
      data: {
        workflow: 'pm-planning',
        status: 'in_progress',
        currentStep: 3,
        totalSteps: 5,
        progress: 40,
        currentStepName: 'generate-prd',
        startedAt: '2025-10-29T10:00:00.000Z',
        lastUpdated: '2025-10-29T10:30:00.000Z',
        context: { projectName: 'Test Project' },
        steps: [
          { id: 'step-1', status: 'completed', completedAt: '2025-10-29T10:10:00.000Z' },
          { id: 'step-2', status: 'completed', completedAt: '2025-10-29T10:20:00.000Z' },
          { id: 'step-3', status: 'in_progress', startedAt: '2025-10-29T10:25:00.000Z' },
          { id: 'step-4', status: 'pending' },
          { id: 'step-5', status: 'pending' },
        ],
      } as unknown as Record<string, unknown>,
      timestamp: new Date().toISOString(),
    };

    const mockMultipleWorkflowsResult: StatusResult = {
      entityType: 'workflow',
      data: {
        workflows: [
          {
            workflow: 'pm-planning',
            status: 'in_progress',
            currentStep: 2,
            totalSteps: 5,
            progress: 40,
            currentStepName: 'step-2',
            startedAt: '2025-10-29T10:00:00.000Z',
            lastUpdated: '2025-10-29T10:30:00.000Z',
            context: {},
            steps: [],
          },
          {
            workflow: 'create-prd',
            status: 'completed',
            currentStep: 3,
            totalSteps: 3,
            progress: 100,
            currentStepName: 'step-3',
            startedAt: '2025-10-29T09:00:00.000Z',
            lastUpdated: '2025-10-29T10:00:00.000Z',
            context: {},
            steps: [],
          },
        ],
        totalWorkflows: 2,
      } as Record<string, unknown>,
      timestamp: new Date().toISOString(),
    };

    it('should format single workflow as JSON', () => {
      const output = provider.formatOutput(mockSingleWorkflowResult, 'json');

      expect(output).toContain('"entityType": "workflow"');
      expect(output).toContain('"pm-planning"');
      const parsed = JSON.parse(output);
      expect(parsed.entityType).toBe('workflow');
    });

    it('should format single workflow as table', () => {
      const output = provider.formatOutput(mockSingleWorkflowResult, 'table');

      expect(output).toContain('┌');
      expect(output).toContain('└');
      expect(output).toContain('Workflow');
      expect(output).toContain('pm-planning');
      expect(output).toContain('in_progress');
      expect(output).toContain('generate-prd');
      expect(output).toContain('40%');
      expect(output).toContain('Steps:');
    });

    it('should format single workflow as markdown', () => {
      const output = provider.formatOutput(mockSingleWorkflowResult, 'markdown');

      expect(output).toContain('## Workflow: pm-planning');
      expect(output).toContain('**Status:** in_progress');
      expect(output).toContain('**Progress:** 3/5 (40%)');
      expect(output).toContain('**Current Step:** generate-prd');
      expect(output).toContain('### Steps');
      expect(output).toContain('✅');
      expect(output).toContain('🔄');
      expect(output).toContain('⏳');
    });

    it('should format multiple workflows as JSON', () => {
      const output = provider.formatOutput(mockMultipleWorkflowsResult, 'json');

      const parsed = JSON.parse(output);
      expect(parsed.data.totalWorkflows).toBe(2);
      expect(parsed.data.workflows).toHaveLength(2);
    });

    it('should format multiple workflows as table', () => {
      const output = provider.formatOutput(mockMultipleWorkflowsResult, 'table');

      expect(output).toContain('┌');
      expect(output).toContain('└');
      expect(output).toContain('Workflow');
      expect(output).toContain('pm-planning');
      expect(output).toContain('create-prd');
      expect(output).toContain('40%');
      expect(output).toContain('100%');
    });

    it('should format multiple workflows as markdown', () => {
      const output = provider.formatOutput(mockMultipleWorkflowsResult, 'markdown');

      expect(output).toContain('## Active Workflows');
      expect(output).toContain('### pm-planning');
      expect(output).toContain('### create-prd');
      expect(output).toContain('**Status:** in_progress');
      expect(output).toContain('**Status:** completed');
      expect(output).toContain('[████████░░░░░░░░░░░░] 40%');
      expect(output).toContain('[████████████████████] 100%');
    });

    it('should handle error in output formatting', () => {
      const errorResult: StatusResult = {
        entityType: 'workflow',
        entityId: 'pm-planning',
        data: { error: 'Workflow not found' },
        timestamp: new Date().toISOString(),
      };

      const tableOutput = provider.formatOutput(errorResult, 'table');
      expect(tableOutput).toContain('Error: Workflow not found');

      const markdownOutput = provider.formatOutput(errorResult, 'markdown');
      expect(markdownOutput).toContain('**Error:** Workflow not found');
    });

    it('should handle empty workflows list', () => {
      const emptyResult: StatusResult = {
        entityType: 'workflow',
        data: { workflows: [], totalWorkflows: 0 },
        timestamp: new Date().toISOString(),
      };

      const tableOutput = provider.formatOutput(emptyResult, 'table');
      expect(tableOutput).toContain('No active workflows found.');

      const markdownOutput = provider.formatOutput(emptyResult, 'markdown');
      expect(markdownOutput).toContain('_No active workflows found._');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Error Handling Tests
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Error Handling', () => {
    it('should handle file system read errors', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'));

      const result = await provider.getStatus('pm-planning');

      expect(result.data.error).toContain('Permission denied');
      expect(result.metadata?.errors).toBeDefined();
    });

    it('should handle readdir errors for all workflows', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockRejectedValue(new Error('Read error'));

      const result = await provider.getStatus();

      expect(result.data.workflows).toEqual([]);
      expect(result.data.totalWorkflows).toBe(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Edge Cases Tests
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Edge Cases', () => {
    it('should handle workflow with empty steps array', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const emptyStepsState: WorkflowState = {
        workflow: 'test-workflow',
        currentStep: 0,
        totalSteps: 0,
        status: 'pending',
        startedAt: '2025-10-29T10:00:00.000Z',
        lastUpdated: '2025-10-29T10:00:00.000Z',
        steps: [],
        context: {},
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(emptyStepsState));

      const result = await provider.getStatus('test-workflow');

      expect(result.data.steps).toEqual([]);
      expect(result.data.progress).toBeNaN(); // 0/0 = NaN
      expect(result.data.currentStepName).toBe('unknown');
    });

    it('should handle workflow with missing context', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const noContextState: WorkflowState = {
        workflow: 'test-workflow',
        currentStep: 1,
        totalSteps: 1,
        status: 'in_progress',
        startedAt: '2025-10-29T10:00:00.000Z',
        lastUpdated: '2025-10-29T10:00:00.000Z',
        steps: [{ id: 'step-1', status: 'in_progress' }],
        context: {},
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(noContextState));

      const result = await provider.getStatus('test-workflow');

      expect(result.data.context).toEqual({});
    });

    it('should handle current step out of bounds', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const outOfBoundsState: WorkflowState = {
        workflow: 'test-workflow',
        currentStep: 10,
        totalSteps: 3,
        status: 'in_progress',
        startedAt: '2025-10-29T10:00:00.000Z',
        lastUpdated: '2025-10-29T10:00:00.000Z',
        steps: [
          { id: 'step-1', status: 'completed', completedAt: '2025-10-29T10:10:00.000Z' },
          { id: 'step-2', status: 'completed', completedAt: '2025-10-29T10:20:00.000Z' },
          { id: 'step-3', status: 'completed', completedAt: '2025-10-29T10:30:00.000Z' },
        ],
        context: {},
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(outOfBoundsState));

      const result = await provider.getStatus('test-workflow');

      expect(result.data.currentStepName).toBe('unknown');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Integration Scenarios Tests
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Integration Scenarios', () => {
    it('should handle real-world workflow state format', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const realWorldState: WorkflowState = {
        workflow: 'route-workflow',
        currentStep: 2,
        totalSteps: 4,
        status: 'in_progress',
        startedAt: '2025-10-29T09:00:00.000Z',
        lastUpdated: '2025-10-29T10:30:00.000Z',
        steps: [
          {
            id: 'assess-complexity',
            status: 'completed',
            startedAt: '2025-10-29T09:00:00.000Z',
            completedAt: '2025-10-29T09:15:00.000Z',
          },
          {
            id: 'calculate-score',
            status: 'in_progress',
            startedAt: '2025-10-29T09:15:00.000Z',
          },
          {
            id: 'recommend-workflow',
            status: 'pending',
          },
          {
            id: 'apply-override',
            status: 'pending',
          },
        ],
        context: {
          projectSize: 2,
          teamSize: 1,
          complexityScore: 15,
        },
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(realWorldState));

      const result = await provider.getStatus('route-workflow');

      expect(result.data.workflow).toBe('route-workflow');
      expect(result.data.status).toBe('in_progress');
      expect(result.data.progress).toBe(25); // 1/4 = 25%
      expect(result.data.currentStepName).toBe('calculate-score');
      expect(result.data.context).toEqual({
        projectSize: 2,
        teamSize: 1,
        complexityScore: 15,
      });
    });

    it('should handle workflow lifecycle transitions', async () => {
      mockFs.access.mockResolvedValue(undefined);

      // Test pending workflow
      const pendingState: WorkflowState = {
        workflow: 'test-workflow',
        currentStep: 0,
        totalSteps: 3,
        status: 'pending',
        startedAt: '2025-10-29T10:00:00.000Z',
        lastUpdated: '2025-10-29T10:00:00.000Z',
        steps: [
          { id: 'step-1', status: 'pending' },
          { id: 'step-2', status: 'pending' },
          { id: 'step-3', status: 'pending' },
        ],
        context: {},
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(pendingState));

      const pendingResult = await provider.getStatus('test-workflow');
      const pendingData = pendingResult.data as unknown as WorkflowData;

      expect(pendingData.status).toBe('pending');
      expect(pendingData.progress).toBe(0);

      // Test in_progress workflow
      const inProgressState: WorkflowState = {
        ...pendingState,
        currentStep: 2,
        status: 'in_progress',
        steps: [
          { id: 'step-1', status: 'completed', completedAt: '2025-10-29T10:10:00.000Z' },
          { id: 'step-2', status: 'in_progress', startedAt: '2025-10-29T10:20:00.000Z' },
          { id: 'step-3', status: 'pending' },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(inProgressState));

      const inProgressResult = await provider.getStatus('test-workflow');
      const inProgressData = inProgressResult.data as unknown as WorkflowData;

      expect(inProgressData.status).toBe('in_progress');
      expect(inProgressData.progress).toBe(33); // 1/3 ≈ 33%

      // Test completed workflow
      const completedState: WorkflowState = {
        ...inProgressState,
        currentStep: 3,
        status: 'completed',
        steps: [
          { id: 'step-1', status: 'completed', completedAt: '2025-10-29T10:10:00.000Z' },
          { id: 'step-2', status: 'completed', completedAt: '2025-10-29T10:20:00.000Z' },
          { id: 'step-3', status: 'completed', completedAt: '2025-10-29T10:30:00.000Z' },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(completedState));

      const completedResult = await provider.getStatus('test-workflow');
      const completedData = completedResult.data as unknown as WorkflowData;

      expect(completedData.status).toBe('completed');
      expect(completedData.progress).toBe(100);
    });
  });
});

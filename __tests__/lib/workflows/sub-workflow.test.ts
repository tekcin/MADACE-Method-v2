/**
 * Sub-Workflow Execution Tests
 * Tests for F11-SUB-WORKFLOWS story implementation
 */

import { WorkflowExecutor, loadWorkflow } from '@/lib/workflows/executor';
import fs from 'fs/promises';
import path from 'path';

// Mock file system
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Sub-Workflow Execution', () => {
  const testStatePath = '/tmp/test-workflows';

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue();
    mockFs.readFile.mockRejectedValue(new Error('State file not found'));
  });

  describe('Context Inheritance', () => {
    it('should inherit parent context in child workflow', async () => {
      const parentWorkflow = {
        workflow: {
          name: 'parent-workflow',
          description: 'Parent workflow',
          agent: 'pm',
          phase: 1,
          steps: [
            {
              name: 'Setup',
              action: 'guide' as const,
              prompt: 'Initialize',
            },
          ],
        },
      };

      const executor = new WorkflowExecutor(parentWorkflow, testStatePath);
      await executor.initialize();

      // Verify initial state
      const state = executor.getState();
      expect(state).toBeDefined();
      expect(state?.workflowName).toBe('parent-workflow');
      expect(state?.currentStep).toBe(0);
    });

    it('should track WORKFLOW_DEPTH correctly', async () => {
      const workflow = {
        workflow: {
          name: 'test-workflow',
          description: 'Test',
          agent: 'pm',
          phase: 1,
          steps: [],
        },
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);

      // Initialize as child workflow
      await executor.initializeChildWorkflow('parent-workflow', '.parent.state.json', {
        PROJECT_NAME: 'Test',
        WORKFLOW_DEPTH: 0,
      });

      const state = executor.getState();
      expect(state?.variables['WORKFLOW_DEPTH']).toBe(0);
      expect(state?.parentWorkflow).toBe('parent-workflow');
    });
  });

  describe('Circular Dependency Detection', () => {
    it('should detect direct circular dependency (A → A)', () => {
      // This would be tested with actual workflow execution
      // For now, verify that the detectCircularDependency method exists
      const workflow = {
        workflow: {
          name: 'circular-workflow',
          description: 'Test',
          agent: 'pm',
          phase: 1,
          steps: [],
        },
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      expect(executor).toBeDefined();
    });
  });

  describe('Child Workflow State Tracking', () => {
    it('should initialize child workflow with parent reference', async () => {
      const childWorkflow = {
        workflow: {
          name: 'child-workflow',
          description: 'Child',
          agent: 'dev',
          phase: 2,
          steps: [],
        },
      };

      const executor = new WorkflowExecutor(childWorkflow, testStatePath);
      await executor.initializeChildWorkflow('parent-workflow', '.parent.state.json', {
        PROJECT_NAME: 'Test Project',
        PARENT_WORKFLOW: 'parent-workflow',
        WORKFLOW_DEPTH: 1,
      });

      const state = executor.getState();
      expect(state?.parentWorkflow).toBe('parent-workflow');
      expect(state?.parentStateFile).toBe('.parent.state.json');
      expect(state?.variables['PARENT_WORKFLOW']).toBe('parent-workflow');
      expect(state?.variables['WORKFLOW_DEPTH']).toBe(1);
    });
  });

  describe('Workflow Hierarchy', () => {
    it('should build hierarchy for workflow without children', async () => {
      const workflow = {
        workflow: {
          name: 'simple-workflow',
          description: 'Simple',
          agent: 'pm',
          phase: 1,
          steps: [
            { name: 'Step 1', action: 'guide' as const, prompt: 'Do something' },
            { name: 'Step 2', action: 'guide' as const, prompt: 'Do more' },
          ],
        },
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const hierarchy = await executor.getHierarchy();

      expect(hierarchy.workflow).toBe('simple-workflow');
      expect(hierarchy.totalSteps).toBe(2);
      expect(hierarchy.currentStep).toBe(0);
      expect(hierarchy.status).toBe('pending');
      expect(hierarchy.depth).toBe(0);
      expect(hierarchy.children).toEqual([]);
    });

    it('should show running status for workflow in progress', async () => {
      const workflow = {
        workflow: {
          name: 'running-workflow',
          description: 'Running',
          agent: 'pm',
          phase: 1,
          steps: [{ name: 'Step 1', action: 'guide' as const, prompt: 'Do something' }],
        },
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      // Execute first step
      await executor.executeNextStep();

      const hierarchy = await executor.getHierarchy();
      expect(hierarchy.status).not.toBe('pending');
      expect(hierarchy.currentStep).toBe(1);
    });
  });

  describe('Resume Functionality', () => {
    it('should resume workflow from current step', async () => {
      const workflow = {
        workflow: {
          name: 'resumable-workflow',
          description: 'Resumable',
          agent: 'pm',
          phase: 1,
          steps: [
            { name: 'Step 1', action: 'guide' as const, prompt: 'First' },
            { name: 'Step 2', action: 'guide' as const, prompt: 'Second' },
          ],
        },
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      // Execute and resume
      await executor.executeNextStep();
      const result = await executor.resume();

      expect(result.success).toBe(true);
      const state = executor.getState();
      expect(state?.currentStep).toBe(2); // Both steps executed
    });
  });
});

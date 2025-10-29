/**
 * Routing Action Tests
 * STORY-V3-005: Implement Routing Action in Workflow Executor
 *
 * Tests the route action that executes different workflows based on complexity level.
 */

import { WorkflowExecutor, loadWorkflow } from '@/lib/workflows/executor';
import type { Workflow, RoutingResult } from '@/lib/workflows/types';
import fs from 'fs/promises';
import path from 'path';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Routing Action (STORY-V3-005)', () => {
  const testStatePath = '/tmp/workflow-states';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock mkdir to always succeed
    mockFs.mkdir.mockResolvedValue(undefined);

    // Mock writeFile to always succeed
    mockFs.writeFile.mockResolvedValue(undefined);
  });

  describe('Route Action Validation', () => {
    it('should throw error if routing configuration is missing', async () => {
      const workflow: Workflow = {
        name: 'test-route-no-config',
        description: 'Test routing without config',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            // Missing routing configuration
          },
        ],
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const result = await executor.executeNextStep();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('requires routing configuration');
    });

    it('should throw error if condition variable is missing', async () => {
      const workflow: Workflow = {
        name: 'test-route-no-condition',
        description: 'Test routing without condition',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            // Missing condition
            routing: {
              level_0: ['workflow1.yaml'],
            },
          },
        ],
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const result = await executor.executeNextStep();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('requires condition variable');
    });

    it('should throw error for invalid routing level (negative)', async () => {
      const workflow: Workflow = {
        name: 'test-route-invalid-level',
        description: 'Test routing with invalid level',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_0: ['workflow1.yaml'],
            },
          },
        ],
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      // Set invalid level
      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = -1;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid routing level');
    });

    it('should throw error for invalid routing level (> 4)', async () => {
      const workflow: Workflow = {
        name: 'test-route-invalid-level-high',
        description: 'Test routing with invalid high level',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_0: ['workflow1.yaml'],
            },
          },
        ],
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      // Set invalid level
      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 5;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid routing level');
    });

    it('should throw error if routing configuration not found for level', async () => {
      const workflow: Workflow = {
        name: 'test-route-missing-level',
        description: 'Test routing with missing level config',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_0: ['workflow1.yaml'],
              // level_2 not defined
            },
          },
        ],
      };

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      // Set level 2 which is not defined
      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 2;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('No routing configuration found for level 2');
    });
  });

  describe('Level Extraction', () => {
    it('should extract level from direct number', async () => {
      const workflow: Workflow = {
        name: 'test-level-direct',
        description: 'Test level extraction from number',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_2: ['workflow1.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflow
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 2;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);
      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult.level).toBe(2);
    });

    it('should extract level from "level_N" pattern', async () => {
      const workflow: Workflow = {
        name: 'test-level-pattern',
        description: 'Test level extraction from pattern',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_3: ['workflow1.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflow
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 'level_3';
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);
      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult.level).toBe(3);
    });
  });

  describe('Routing Execution', () => {
    it('should execute single workflow for Level 0 (Minimal)', async () => {
      const workflow: Workflow = {
        name: 'test-route-level-0',
        description: 'Test Level 0 routing',
        steps: [
          {
            name: 'Route to Level 0',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_0: ['workflows/create-stories.workflow.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflow
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: create-stories
  description: Create stories workflow
  agent: test-agent
  phase: 1
  steps:
    - name: Create Story
      action: guide
      prompt: Create story
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 0;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);
      expect(result.message).toContain('completed');

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult).toBeDefined();
      expect(routingResult.level).toBe(0);
      expect(routingResult.workflowsExecuted).toBe(1);
      expect(routingResult.workflowPaths).toEqual(['workflows/create-stories.workflow.yaml']);
      expect(routingResult.success).toBe(true);
    });

    it('should execute two workflows for Level 1 (Basic)', async () => {
      const workflow: Workflow = {
        name: 'test-route-level-1',
        description: 'Test Level 1 routing',
        steps: [
          {
            name: 'Route to Level 1',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_1: [
                'workflows/plan-project-light.workflow.yaml',
                'workflows/create-stories.workflow.yaml',
              ],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflows
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 1;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult).toBeDefined();
      expect(routingResult.level).toBe(1);
      expect(routingResult.workflowsExecuted).toBe(2);
      expect(routingResult.workflowPaths).toEqual([
        'workflows/plan-project-light.workflow.yaml',
        'workflows/create-stories.workflow.yaml',
      ]);
      expect(routingResult.success).toBe(true);
    });

    it('should execute four workflows for Level 2 (Standard)', async () => {
      const workflow: Workflow = {
        name: 'test-route-level-2',
        description: 'Test Level 2 routing',
        steps: [
          {
            name: 'Route to Level 2',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_2: [
                'workflows/plan-project.workflow.yaml',
                'workflows/create-architecture-basic.workflow.yaml',
                'workflows/create-epics.workflow.yaml',
                'workflows/create-stories.workflow.yaml',
              ],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflows
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 2;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult).toBeDefined();
      expect(routingResult.level).toBe(2);
      expect(routingResult.workflowsExecuted).toBe(4);
      expect(routingResult.success).toBe(true);
    });

    it('should execute five workflows for Level 3 (Comprehensive)', async () => {
      const workflow: Workflow = {
        name: 'test-route-level-3',
        description: 'Test Level 3 routing',
        steps: [
          {
            name: 'Route to Level 3',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_3: [
                'workflows/plan-project.workflow.yaml',
                'workflows/create-tech-specs.workflow.yaml',
                'workflows/create-architecture.workflow.yaml',
                'workflows/create-epics.workflow.yaml',
                'workflows/create-stories.workflow.yaml',
              ],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflows
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 3;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult).toBeDefined();
      expect(routingResult.level).toBe(3);
      expect(routingResult.workflowsExecuted).toBe(5);
      expect(routingResult.success).toBe(true);
    });

    it('should execute seven workflows for Level 4 (Enterprise)', async () => {
      const workflow: Workflow = {
        name: 'test-route-level-4',
        description: 'Test Level 4 routing',
        steps: [
          {
            name: 'Route to Level 4',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_4: [
                'workflows/plan-project.workflow.yaml',
                'workflows/create-tech-specs.workflow.yaml',
                'workflows/create-architecture.workflow.yaml',
                'workflows/create-security-spec.workflow.yaml',
                'workflows/create-devops-spec.workflow.yaml',
                'workflows/create-epics.workflow.yaml',
                'workflows/create-stories.workflow.yaml',
              ],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflows
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 4;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult).toBeDefined();
      expect(routingResult.level).toBe(4);
      expect(routingResult.workflowsExecuted).toBe(7);
      expect(routingResult.success).toBe(true);
    });
  });

  describe('Default Fallback', () => {
    it('should use default routing if level not defined', async () => {
      const workflow: Workflow = {
        name: 'test-route-default',
        description: 'Test default routing fallback',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_0: ['workflow-level-0.yaml'],
              default: ['workflow-default.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflow
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: default-workflow
  description: Default workflow
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 3; // Level 3 not defined, should use default
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult).toBeDefined();
      expect(routingResult.level).toBe(3);
      expect(routingResult.workflowPaths).toEqual(['workflow-default.yaml']);
    });
  });

  describe('Error Handling', () => {
    it('should handle workflow execution failure and stop routing', async () => {
      const workflow: Workflow = {
        name: 'test-route-error',
        description: 'Test routing with workflow failure',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_1: ['workflow1.yaml', 'workflow2.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock first workflow to fail (invalid YAML)
      mockFs.readFile.mockRejectedValue(new Error('File not found: workflow1.yaml'));

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 1;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Routing failed');
      expect(result.error?.message).toContain('workflow1.yaml');
    });

    it('should track child workflows in parent state', async () => {
      const workflow: Workflow = {
        name: 'test-route-tracking',
        description: 'Test child workflow tracking',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_1: ['workflow1.yaml', 'workflow2.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflows
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 1;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      // Check that child workflows were tracked
      expect(state?.childWorkflows).toBeDefined();
      expect(state?.childWorkflows?.length).toBeGreaterThanOrEqual(2);

      const completedChildren = state?.childWorkflows?.filter(
        (child) => child.status === 'completed'
      );
      expect(completedChildren?.length).toBe(2);
    });
  });

  describe('Routing Result', () => {
    it('should save routing result to output_var', async () => {
      const workflow: Workflow = {
        name: 'test-routing-result',
        description: 'Test routing result capture',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_2: ['workflow1.yaml', 'workflow2.yaml', 'workflow3.yaml'],
            },
            output_var: 'my_routing_result',
          },
        ],
      };

      // Mock child workflows
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 2;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      const routingResult = state?.variables['my_routing_result'] as RoutingResult;
      expect(routingResult).toBeDefined();
      expect(routingResult.level).toBe(2);
      expect(routingResult.workflowsExecuted).toBe(3);
      expect(routingResult.workflowPaths.length).toBe(3);
      expect(routingResult.success).toBe(true);
      expect(routingResult.startedAt).toBeDefined();
      expect(routingResult.completedAt).toBeDefined();
    });

    it('should also save routing result to routing_decision variable', async () => {
      const workflow: Workflow = {
        name: 'test-routing-decision',
        description: 'Test routing decision variable',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_0: ['workflow1.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflow
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 0;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      // Both output_var and routing_decision should be set
      expect(state?.variables['routing_result']).toBeDefined();
      expect(state?.variables['routing_decision']).toBeDefined();

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      const routingDecision = state?.variables['routing_decision'] as RoutingResult;

      expect(routingResult).toEqual(routingDecision);
    });
  });

  describe('Acceptance Criteria Validation', () => {
    it('✅ should support action: route in workflow executor', async () => {
      const workflow: Workflow = {
        name: 'test-route-action',
        description: 'Test route action support',
        steps: [
          {
            name: 'Route Step',
            action: 'route', // ✅ route action is recognized
            condition: '{{confirmed_level}}',
            routing: {
              level_0: ['workflow1.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock child workflow
      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 0;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);
      expect(result.message).toContain('completed');
    });

    it('✅ should implement conditional routing based on level variable', async () => {
      // Test that different levels route to different workflows
      const testLevels = [0, 1, 2, 3, 4];

      for (const level of testLevels) {
        const workflow: Workflow = {
          name: `test-route-level-${level}`,
          description: `Test routing for level ${level}`,
          steps: [
            {
              name: 'Route Step',
              action: 'route',
              condition: '{{confirmed_level}}', // ✅ Conditional based on variable
              routing: {
                level_0: ['level0-workflow.yaml'],
                level_1: ['level1-workflow.yaml'],
                level_2: ['level2-workflow.yaml'],
                level_3: ['level3-workflow.yaml'],
                level_4: ['level4-workflow.yaml'],
              },
              output_var: 'routing_result',
            },
          ],
        };

        mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

        const executor = new WorkflowExecutor(workflow, testStatePath);
        await executor.initialize();

        const state = executor.getState();
        if (state) {
          state.variables['confirmed_level'] = level;
        }

        const result = await executor.executeNextStep();

        expect(result.success).toBe(true);

        const routingResult = state?.variables['routing_result'] as RoutingResult;
        expect(routingResult.level).toBe(level); // ✅ Routed to correct level
        expect(routingResult.workflowPaths[0]).toContain(`level${level}-workflow.yaml`);
      }
    });

    it('✅ should support sequential workflow execution per level', async () => {
      const workflow: Workflow = {
        name: 'test-sequential-execution',
        description: 'Test sequential workflow execution',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_2: [
                'workflow1.yaml', // ✅ Executed first
                'workflow2.yaml', // ✅ Executed second
                'workflow3.yaml', // ✅ Executed third
              ],
            },
            output_var: 'routing_result',
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 2;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult.workflowsExecuted).toBe(3); // ✅ All 3 executed
      expect(routingResult.workflowPaths).toEqual([
        'workflow1.yaml',
        'workflow2.yaml',
        'workflow3.yaml',
      ]); // ✅ In correct order
    });

    it('✅ should track parent-child workflow relationships', async () => {
      const workflow: Workflow = {
        name: 'parent-workflow',
        description: 'Parent workflow',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_1: ['child1.yaml', 'child2.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 1;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      // ✅ Parent tracks child workflows
      expect(state?.childWorkflows).toBeDefined();
      expect(state?.childWorkflows?.length).toBeGreaterThanOrEqual(2);

      // ✅ Children have completed status
      const completedChildren = state?.childWorkflows?.filter(
        (child) => child.status === 'completed'
      );
      expect(completedChildren?.length).toBe(2);
    });

    it('✅ should update workflow state with routing information', async () => {
      const workflow: Workflow = {
        name: 'test-state-update',
        description: 'Test state update with routing info',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_3: ['workflow1.yaml', 'workflow2.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 3;
      }

      const result = await executor.executeNextStep();

      expect(result.success).toBe(true);

      // ✅ State contains routing information
      expect(state?.variables['routing_result']).toBeDefined();
      expect(state?.variables['routing_decision']).toBeDefined();

      const routingResult = state?.variables['routing_result'] as RoutingResult;
      expect(routingResult.level).toBe(3);
      expect(routingResult.workflowsExecuted).toBe(2);
      expect(routingResult.workflowPaths.length).toBe(2);
      expect(routingResult.startedAt).toBeDefined();
      expect(routingResult.completedAt).toBeDefined();
    });

    it('✅ should handle errors for invalid routes', async () => {
      const workflow: Workflow = {
        name: 'test-error-handling',
        description: 'Test error handling for invalid routes',
        steps: [
          {
            name: 'Route Step',
            action: 'route',
            condition: '{{confirmed_level}}',
            routing: {
              level_0: ['nonexistent-workflow.yaml'],
            },
            output_var: 'routing_result',
          },
        ],
      };

      // Mock file not found error
      mockFs.readFile.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const executor = new WorkflowExecutor(workflow, testStatePath);
      await executor.initialize();

      const state = executor.getState();
      if (state) {
        state.variables['confirmed_level'] = 0;
      }

      const result = await executor.executeNextStep();

      // ✅ Error is caught and reported
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Routing failed');
    });

    it('✅ should pass integration tests for all 5 routing paths', async () => {
      // This test validates that all 5 routing paths (levels 0-4) work correctly
      const routingConfigs = [
        { level: 0, workflows: ['create-stories.yaml'] },
        { level: 1, workflows: ['plan-project-light.yaml', 'create-stories.yaml'] },
        {
          level: 2,
          workflows: [
            'plan-project.yaml',
            'create-architecture-basic.yaml',
            'create-epics.yaml',
            'create-stories.yaml',
          ],
        },
        {
          level: 3,
          workflows: [
            'plan-project.yaml',
            'create-tech-specs.yaml',
            'create-architecture.yaml',
            'create-epics.yaml',
            'create-stories.yaml',
          ],
        },
        {
          level: 4,
          workflows: [
            'plan-project.yaml',
            'create-tech-specs.yaml',
            'create-architecture.yaml',
            'create-security-spec.yaml',
            'create-devops-spec.yaml',
            'create-epics.yaml',
            'create-stories.yaml',
          ],
        },
      ];

      // ✅ Test all 5 routing paths
      for (const config of routingConfigs) {
        const workflow: Workflow = {
          name: `integration-test-level-${config.level}`,
          description: `Integration test for level ${config.level}`,
          steps: [
            {
              name: 'Route Step',
              action: 'route',
              condition: '{{confirmed_level}}',
              routing: {
                [`level_${config.level}` as `level_${number}`]: config.workflows,
              },
              output_var: 'routing_result',
            },
          ],
        };

        mockFs.readFile.mockResolvedValue(`
workflow:
  name: child-workflow
  description: Test child
  agent: test-agent
  phase: 1
  steps:
    - name: Step 1
      action: guide
      prompt: Test step
`);

        const executor = new WorkflowExecutor(workflow, testStatePath);
        await executor.initialize();

        const state = executor.getState();
        if (state) {
          state.variables['confirmed_level'] = config.level;
        }

        const result = await executor.executeNextStep();

        // ✅ Routing succeeds for this level
        expect(result.success).toBe(true);

        const routingResult = state?.variables['routing_result'] as RoutingResult;
        expect(routingResult.level).toBe(config.level);
        expect(routingResult.workflowsExecuted).toBe(config.workflows.length);
        expect(routingResult.success).toBe(true);
      }
    });
  });
});

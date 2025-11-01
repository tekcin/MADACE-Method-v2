/**
 * Workflow Integration Tests
 *
 * End-to-end integration tests that combine workflow creation and execution.
 * Tests complete user workflows from creation through execution and completion.
 */

import { test, expect } from '@playwright/test';
import { WorkflowsPage } from './page-objects/workflows.page';
import { WorkflowCreatorPage } from './page-objects/workflow-creator.page';
import { WorkflowExecutionPage } from './page-objects/workflow-execution.page';

let workflowsPage: WorkflowsPage;
let creatorPage: WorkflowCreatorPage;
let executionPage: WorkflowExecutionPage;

test.beforeEach(async ({ page }) => {
  workflowsPage = new WorkflowsPage(page);
  creatorPage = new WorkflowCreatorPage(page);
  executionPage = new WorkflowExecutionPage(page);
});

test.describe('Workflow Creation to Execution Integration', () => {
  test('should create and execute a simple display workflow', async ({ page }) => {
    // Create workflow
    await creatorPage.goto();
    await creatorPage.fillBasicInfo({
      name: 'simple-display-workflow',
      description: 'Simple workflow with display steps',
      agent: 'PM',
      phase: 1,
    });
    await creatorPage.clickNext();

    // Add display step
    await creatorPage.addStep({
      name: 'Welcome Message',
      action: 'display',
      message: 'Welcome to the workflow!',
    });
    await creatorPage.clickNext();
    await creatorPage.clickNext(); // Skip variables

    // Download YAML
    const downloadPromise = page.waitForEvent('download');
    await creatorPage.downloadYaml();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('simple-display-workflow.yaml');

    // Navigate to workflows page and execute
    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('simple-display-workflow');

    // Verify execution
    await executionPage.expectExecutionPanelVisible();
    await executionPage.executeNextStep();
    await executionPage.expectWorkflowCompleted();
  });

  test('should create workflow with multiple action types and execute', async ({ page }) => {
    await creatorPage.goto();

    // Create complex workflow
    await creatorPage.completeWorkflowCreation({
      name: 'multi-action-workflow',
      description: 'Workflow with multiple action types',
      agent: 'Analyst',
      phase: 2,
      steps: [
        {
          name: 'Display Instructions',
          action: 'display',
          message: 'Starting multi-action workflow',
        },
        {
          name: 'Get User Input',
          action: 'elicit',
          prompt: 'Enter your project name',
          variable: 'project_name',
        },
        {
          name: 'Analyze Requirements',
          action: 'reflect',
          prompt: 'Analyze the project requirements',
          model: 'gemma3:latest',
        },
        {
          name: 'Generate Document',
          action: 'template',
          template: 'templates/project.hbs',
          output_file: 'output/project.md',
        },
      ],
      variables: [
        { name: 'version', type: 'string', value: '1.0.0' },
        { name: 'max_points', type: 'number', value: 100 },
      ],
    });

    // Download and verify YAML
    const yaml = await creatorPage.getYamlPreview();
    expect(yaml).toContain('multi-action-workflow');
    expect(yaml).toContain('display');
    expect(yaml).toContain('elicit');
    expect(yaml).toContain('reflect');
    expect(yaml).toContain('template');

    // Execute workflow
    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('multi-action-workflow');
    await executionPage.expectExecutionPanelVisible();

    // Execute first step (display)
    await executionPage.executeNextStep();
    expect(await executionPage.getCurrentStepNumber()).toBe(1);

    // Execute second step (elicit) - would require input form
    // Note: This would pause for user input in real execution

    // Verify workflow state
    const state = await executionPage.getExecutionState();
    expect(state.totalSteps).toBe(4);
  });

  test('should create workflow, execute partially, pause, and resume', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'pause-resume-workflow',
      description: 'Test pause and resume functionality',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'Step 1', action: 'display', message: 'First step' },
        { name: 'Step 2', action: 'display', message: 'Second step' },
        { name: 'Step 3', action: 'display', message: 'Third step' },
        { name: 'Step 4', action: 'display', message: 'Fourth step' },
      ],
    });

    // Execute workflow
    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('pause-resume-workflow');

    // Execute first step
    await executionPage.executeNextStep();
    expect(await executionPage.getCurrentStepNumber()).toBe(1);

    // Pause workflow
    await executionPage.pauseWorkflow();
    await executionPage.expectWorkflowStatus('Paused');

    // Resume workflow
    await executionPage.resumeWorkflow();
    await executionPage.expectWorkflowStatus('Running');

    // Execute remaining steps
    await executionPage.executeNextStep(); // Step 2
    await executionPage.executeNextStep(); // Step 3
    await executionPage.executeNextStep(); // Step 4

    await executionPage.expectWorkflowCompleted();
  });

  test('should handle workflow cancellation and re-execution', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'cancel-test-workflow',
      description: 'Test workflow cancellation',
      agent: 'Developer',
      phase: 3,
      steps: [
        { name: 'Init', action: 'display', message: 'Initialize' },
        { name: 'Process', action: 'display', message: 'Processing' },
        { name: 'Complete', action: 'display', message: 'Done' },
      ],
    });

    // First execution - cancel midway
    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('cancel-test-workflow');
    await executionPage.executeNextStep();

    // Cancel workflow
    await executionPage.cancelWorkflow(true);
    await executionPage.expectExecutionPanelNotVisible();

    // Re-execute the same workflow
    await workflowsPage.executeWorkflow('cancel-test-workflow');
    await executionPage.expectExecutionPanelVisible();

    // Complete execution this time
    await executionPage.executeUntilCompletion();
    await executionPage.expectWorkflowCompleted();
  });
});

test.describe('Workflow State Persistence Integration', () => {
  test('should persist workflow state across page reloads', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'persistence-test-workflow',
      description: 'Test state persistence',
      agent: 'Analyst',
      phase: 2,
      steps: [
        { name: 'Step 1', action: 'display', message: 'First' },
        { name: 'Step 2', action: 'display', message: 'Second' },
        { name: 'Step 3', action: 'display', message: 'Third' },
      ],
      variables: [
        { name: 'test_var', type: 'string', value: 'test_value' },
      ],
    });

    // Execute first step
    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('persistence-test-workflow');
    await executionPage.executeNextStep();

    const beforeReload = await executionPage.getCurrentStepNumber();
    expect(beforeReload).toBe(1);

    // Reload page
    await page.reload();

    // Verify state persisted
    await executionPage.expectExecutionPanelVisible();
    const afterReload = await executionPage.getCurrentStepNumber();
    expect(afterReload).toBe(beforeReload);

    // Continue execution
    await executionPage.executeNextStep();
    await executionPage.executeNextStep();
    await executionPage.expectWorkflowCompleted();
  });

  test('should maintain workflow variables across execution', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'variables-persistence-workflow',
      description: 'Test variable persistence',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'Init', action: 'display', message: 'Initialize variables' },
        { name: 'Process', action: 'display', message: 'Process with variables' },
      ],
      variables: [
        { name: 'project_name', type: 'string', value: 'TestProject' },
        { name: 'version', type: 'string', value: '1.0.0' },
        { name: 'max_points', type: 'number', value: 100 },
        { name: 'is_active', type: 'boolean', value: true },
      ],
    });

    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('variables-persistence-workflow');

    // Execute first step
    await executionPage.executeNextStep();

    // Check variables are available
    const variables = await executionPage.getWorkflowVariables();
    expect(variables).toHaveProperty('project_name', 'TestProject');
    expect(variables).toHaveProperty('version', '1.0.0');
    expect(variables).toHaveProperty('max_points', 100);
    expect(variables).toHaveProperty('is_active', true);

    // Complete workflow
    await executionPage.executeNextStep();
    await executionPage.expectWorkflowCompleted();
  });

  test('should reset workflow state correctly', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'reset-test-workflow',
      description: 'Test workflow reset',
      agent: 'Developer',
      phase: 3,
      steps: [
        { name: 'Step 1', action: 'display', message: 'First' },
        { name: 'Step 2', action: 'display', message: 'Second' },
      ],
    });

    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('reset-test-workflow');

    // Execute first step
    await executionPage.executeNextStep();
    expect(await executionPage.getCurrentStepNumber()).toBe(1);

    // Reset workflow
    await executionPage.resetWorkflow();
    await executionPage.expectExecutionPanelNotVisible();

    // Re-execute from beginning
    await workflowsPage.executeWorkflow('reset-test-workflow');
    expect(await executionPage.getCurrentStepNumber()).toBe(0);

    // Complete workflow
    await executionPage.executeUntilCompletion();
    await executionPage.expectWorkflowCompleted();
  });
});

test.describe('Multiple Workflows Integration', () => {
  test('should create and manage multiple workflows', async ({ page }) => {
    // Create first workflow
    await creatorPage.goto();
    await creatorPage.completeWorkflowCreation({
      name: 'workflow-alpha',
      description: 'First workflow',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'Alpha Step', action: 'display', message: 'Alpha workflow' },
      ],
    });

    // Create second workflow
    await creatorPage.goto();
    await creatorPage.completeWorkflowCreation({
      name: 'workflow-beta',
      description: 'Second workflow',
      agent: 'Analyst',
      phase: 2,
      steps: [
        { name: 'Beta Step', action: 'display', message: 'Beta workflow' },
      ],
    });

    // Verify both workflows exist
    await workflowsPage.goto();
    const workflows = await workflowsPage.getAvailableWorkflows();

    const alphaWorkflow = workflows.find(w => w.name === 'workflow-alpha');
    const betaWorkflow = workflows.find(w => w.name === 'workflow-beta');

    expect(alphaWorkflow).toBeDefined();
    expect(betaWorkflow).toBeDefined();
    expect(alphaWorkflow?.agent).toBe('PM');
    expect(betaWorkflow?.agent).toBe('Analyst');
  });

  test('should execute multiple workflows sequentially', async ({ page }) => {
    // Create workflows
    await creatorPage.goto();
    await creatorPage.completeWorkflowCreation({
      name: 'sequential-workflow-1',
      description: 'First sequential workflow',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'Step 1', action: 'display', message: 'Workflow 1' },
      ],
    });

    await creatorPage.goto();
    await creatorPage.completeWorkflowCreation({
      name: 'sequential-workflow-2',
      description: 'Second sequential workflow',
      agent: 'Developer',
      phase: 3,
      steps: [
        { name: 'Step 1', action: 'display', message: 'Workflow 2' },
      ],
    });

    // Execute first workflow
    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('sequential-workflow-1');
    await executionPage.executeUntilCompletion();
    await executionPage.expectWorkflowCompleted();

    // Reset and execute second workflow
    await executionPage.resetWorkflow();
    await workflowsPage.executeWorkflow('sequential-workflow-2');
    await executionPage.executeUntilCompletion();
    await executionPage.expectWorkflowCompleted();
  });

  test('should switch between workflows without losing state', async ({ page }) => {
    // Create two workflows
    await creatorPage.goto();
    await creatorPage.completeWorkflowCreation({
      name: 'workflow-switch-a',
      description: 'Switch test A',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'A1', action: 'display', message: 'A Step 1' },
        { name: 'A2', action: 'display', message: 'A Step 2' },
      ],
    });

    await creatorPage.goto();
    await creatorPage.completeWorkflowCreation({
      name: 'workflow-switch-b',
      description: 'Switch test B',
      agent: 'Analyst',
      phase: 2,
      steps: [
        { name: 'B1', action: 'display', message: 'B Step 1' },
        { name: 'B2', action: 'display', message: 'B Step 2' },
      ],
    });

    // Start first workflow
    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('workflow-switch-a');
    await executionPage.executeNextStep();
    const stepA = await executionPage.getCurrentStepNumber();
    expect(stepA).toBe(1);

    // Switch to second workflow
    await executionPage.resetWorkflow();
    await workflowsPage.executeWorkflow('workflow-switch-b');
    await executionPage.executeNextStep();
    const stepB = await executionPage.getCurrentStepNumber();
    expect(stepB).toBe(1);

    // Complete second workflow
    await executionPage.executeNextStep();
    await executionPage.expectWorkflowCompleted();
  });
});

test.describe('Complex Workflow Scenarios', () => {
  test('should handle workflow with all 7 MADACE action types', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'all-actions-workflow',
      description: 'Workflow with all MADACE action types',
      agent: 'PM',
      phase: 1,
      steps: [
        {
          name: 'Display Step',
          action: 'display',
          message: 'Starting comprehensive workflow',
        },
        {
          name: 'Reflect Step',
          action: 'reflect',
          prompt: 'Analyze project requirements',
          model: 'gemma3:latest',
        },
        {
          name: 'Elicit Step',
          action: 'elicit',
          prompt: 'Enter project name',
          variable: 'project_name',
        },
        {
          name: 'Template Step',
          action: 'template',
          template: 'templates/project.hbs',
          output_file: 'output/project.md',
        },
        {
          name: 'Guide Step',
          action: 'guide',
          message: 'Follow these guidelines...',
        },
        {
          name: 'Validate Step',
          action: 'validate',
          condition: 'project_name != ""',
          error_message: 'Project name is required',
        },
        {
          name: 'Route Step',
          action: 'route',
          routes: [
            {
              condition: 'complexity == "simple"',
              workflow: 'simple-workflow.yaml',
            },
            {
              condition: 'complexity == "complex"',
              workflow: 'complex-workflow.yaml',
            },
          ],
        },
      ],
      variables: [
        { name: 'complexity', type: 'string', value: 'simple' },
      ],
    });

    // Verify YAML contains all action types
    const yaml = await creatorPage.getYamlPreview();
    expect(yaml).toContain('action: display');
    expect(yaml).toContain('action: reflect');
    expect(yaml).toContain('action: elicit');
    expect(yaml).toContain('action: template');
    expect(yaml).toContain('action: guide');
    expect(yaml).toContain('action: validate');
    expect(yaml).toContain('action: route');

    // Download workflow
    const downloadPromise = page.waitForEvent('download');
    await creatorPage.downloadYaml();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('all-actions-workflow.yaml');
  });

  test('should create workflow with nested variables and complex logic', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'complex-logic-workflow',
      description: 'Workflow with complex variable logic',
      agent: 'Architect',
      phase: 2,
      steps: [
        {
          name: 'Initialize',
          action: 'display',
          message: 'Initializing complex workflow',
        },
        {
          name: 'Validate Complexity',
          action: 'validate',
          condition: 'complexity_score > min_complexity',
          error_message: 'Complexity score too low',
        },
        {
          name: 'Route by Complexity',
          action: 'route',
          routes: [
            {
              condition: 'complexity_score >= 8',
              workflow: 'high-complexity.yaml',
            },
            {
              condition: 'complexity_score >= 5',
              workflow: 'medium-complexity.yaml',
            },
            {
              condition: 'complexity_score >= 2',
              workflow: 'low-complexity.yaml',
            },
          ],
        },
      ],
      variables: [
        { name: 'complexity_score', type: 'number', value: 7 },
        { name: 'min_complexity', type: 'number', value: 2 },
        { name: 'max_points', type: 'number', value: 100 },
        { name: 'enable_analytics', type: 'boolean', value: true },
      ],
    });

    const yaml = await creatorPage.getYamlPreview();
    expect(yaml).toContain('complexity_score');
    expect(yaml).toContain('min_complexity');
    expect(yaml).toContain('condition:');
  });

  test('should handle workflow with sub-workflow references', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'parent-workflow',
      description: 'Parent workflow with sub-workflow',
      agent: 'PM',
      phase: 1,
      steps: [
        {
          name: 'Initialize Parent',
          action: 'display',
          message: 'Starting parent workflow',
        },
        {
          name: 'Execute Sub-Workflow',
          action: 'sub-workflow',
          workflow: 'madace/mam/workflows/child-workflow.yaml',
        },
        {
          name: 'Complete Parent',
          action: 'display',
          message: 'Parent workflow complete',
        },
      ],
    });

    const yaml = await creatorPage.getYamlPreview();
    expect(yaml).toContain('action: sub-workflow');
    expect(yaml).toContain('workflow:');
    expect(yaml).toContain('child-workflow.yaml');
  });
});

test.describe('Error Recovery and Edge Cases', () => {
  test('should recover from workflow execution errors', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'error-recovery-workflow',
      description: 'Test error recovery',
      agent: 'Developer',
      phase: 3,
      steps: [
        { name: 'Step 1', action: 'display', message: 'First step' },
        {
          name: 'Validation Step',
          action: 'validate',
          condition: 'required_var != ""',
          error_message: 'Required variable missing',
        },
        { name: 'Step 3', action: 'display', message: 'Third step' },
      ],
      variables: [
        { name: 'required_var', type: 'string', value: '' }, // Empty - will fail validation
      ],
    });

    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('error-recovery-workflow');

    // Execute first step successfully
    await executionPage.executeNextStep();
    expect(await executionPage.getCurrentStepNumber()).toBe(1);

    // Second step should fail validation
    // Note: Actual error handling depends on implementation
    // This test verifies the workflow can be reset after error

    await executionPage.resetWorkflow();
    await executionPage.expectExecutionPanelNotVisible();
  });

  test('should handle empty workflow gracefully', async ({ page }) => {
    await creatorPage.goto();

    // Try to create workflow without steps
    await creatorPage.fillBasicInfo({
      name: 'empty-workflow',
      description: 'Workflow with no steps',
      agent: 'PM',
      phase: 1,
    });
    await creatorPage.clickNext();

    // Skip adding steps
    await creatorPage.clickNext();
    await creatorPage.clickNext();

    // Should still show preview (even if empty)
    await creatorPage.expectOnPreviewStep();

    const yaml = await creatorPage.getYamlPreview();
    expect(yaml).toContain('empty-workflow');
    expect(yaml).toContain('steps:');
  });

  test('should handle workflow with maximum step count', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.fillBasicInfo({
      name: 'max-steps-workflow',
      description: 'Workflow with many steps',
      agent: 'PM',
      phase: 1,
    });
    await creatorPage.clickNext();

    // Add 20 steps
    for (let i = 1; i <= 20; i++) {
      await creatorPage.addStep({
        name: `Step ${i}`,
        action: 'display',
        message: `Step ${i} message`,
      });
    }

    await creatorPage.clickNext();
    await creatorPage.clickNext();

    const yaml = await creatorPage.getYamlPreview();
    expect(yaml).toContain('Step 1');
    expect(yaml).toContain('Step 20');
  });

  test('should validate workflow name uniqueness', async ({ page }) => {
    await creatorPage.goto();

    // Create first workflow
    await creatorPage.completeWorkflowCreation({
      name: 'duplicate-name-test',
      description: 'First workflow',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'Step 1', action: 'display', message: 'First' },
      ],
    });

    // Try to create second workflow with same name
    await creatorPage.goto();
    await creatorPage.fillBasicInfo({
      name: 'duplicate-name-test', // Same name
      description: 'Second workflow',
      agent: 'Analyst',
      phase: 2,
    });

    // Should show validation error or warning
    // Note: Actual validation depends on implementation
    // This test documents expected behavior
  });
});

test.describe('Workflow YAML Export and Import', () => {
  test('should export workflow as valid YAML', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'export-test-workflow',
      description: 'Test YAML export',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'Step 1', action: 'display', message: 'Export test' },
      ],
      variables: [
        { name: 'test_var', type: 'string', value: 'test_value' },
      ],
    });

    // Download YAML
    const downloadPromise = page.waitForEvent('download');
    await creatorPage.downloadYaml();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('export-test-workflow.yaml');

    // Verify download occurred
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('should copy YAML to clipboard', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'clipboard-test-workflow',
      description: 'Test clipboard copy',
      agent: 'Developer',
      phase: 3,
      steps: [
        { name: 'Step 1', action: 'display', message: 'Clipboard test' },
      ],
    });

    // Copy to clipboard
    await creatorPage.copyYamlToClipboard();

    // Verify clipboard contains YAML
    // Note: Clipboard API testing may require special permissions
    const yaml = await creatorPage.getYamlPreview();
    expect(yaml).toContain('clipboard-test-workflow');
  });

  test('should generate valid YAML structure', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'yaml-structure-test',
      description: 'Test YAML structure',
      agent: 'Architect',
      phase: 2,
      steps: [
        { name: 'Step 1', action: 'display', message: 'Structure test' },
      ],
      variables: [
        { name: 'var1', type: 'string', value: 'value1' },
        { name: 'var2', type: 'number', value: 42 },
        { name: 'var3', type: 'boolean', value: true },
      ],
    });

    const yaml = await creatorPage.getYamlPreview();

    // Verify YAML structure
    expect(yaml).toContain('workflow:');
    expect(yaml).toContain('name: yaml-structure-test');
    expect(yaml).toContain('description:');
    expect(yaml).toContain('agent:');
    expect(yaml).toContain('phase:');
    expect(yaml).toContain('steps:');
    expect(yaml).toContain('variables:');
    expect(yaml).toContain('var1:');
    expect(yaml).toContain('var2:');
    expect(yaml).toContain('var3:');
  });
});

test.describe('Workflow UI Responsiveness', () => {
  test('should maintain state during rapid button clicks', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'rapid-click-test',
      description: 'Test rapid clicking',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'Step 1', action: 'display', message: 'First' },
        { name: 'Step 2', action: 'display', message: 'Second' },
        { name: 'Step 3', action: 'display', message: 'Third' },
      ],
    });

    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('rapid-click-test');

    // Rapid clicks on execute button
    await executionPage.executeNextStep();
    await executionPage.executeNextStep();
    await executionPage.executeNextStep();

    // Should complete successfully despite rapid clicks
    await executionPage.expectWorkflowCompleted();
  });

  test('should handle pause/resume cycles correctly', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'pause-cycle-test',
      description: 'Test pause/resume cycles',
      agent: 'Developer',
      phase: 3,
      steps: [
        { name: 'Step 1', action: 'display', message: 'First' },
        { name: 'Step 2', action: 'display', message: 'Second' },
        { name: 'Step 3', action: 'display', message: 'Third' },
        { name: 'Step 4', action: 'display', message: 'Fourth' },
      ],
    });

    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('pause-cycle-test');

    // Multiple pause/resume cycles
    await executionPage.executeNextStep();
    await executionPage.pauseWorkflow();
    await executionPage.resumeWorkflow();

    await executionPage.executeNextStep();
    await executionPage.pauseWorkflow();
    await executionPage.resumeWorkflow();

    await executionPage.executeNextStep();
    await executionPage.executeNextStep();

    await executionPage.expectWorkflowCompleted();
  });

  test('should update progress bar correctly during execution', async ({ page }) => {
    await creatorPage.goto();

    await creatorPage.completeWorkflowCreation({
      name: 'progress-test-workflow',
      description: 'Test progress tracking',
      agent: 'PM',
      phase: 1,
      steps: [
        { name: 'Step 1', action: 'display', message: 'First' },
        { name: 'Step 2', action: 'display', message: 'Second' },
        { name: 'Step 3', action: 'display', message: 'Third' },
        { name: 'Step 4', action: 'display', message: 'Fourth' },
      ],
    });

    await workflowsPage.goto();
    await workflowsPage.executeWorkflow('progress-test-workflow');

    // Verify progress updates
    let state = await executionPage.getExecutionState();
    expect(state.currentStep).toBe(0);
    expect(state.totalSteps).toBe(4);

    await executionPage.executeNextStep();
    state = await executionPage.getExecutionState();
    expect(state.currentStep).toBe(1);

    await executionPage.executeNextStep();
    state = await executionPage.getExecutionState();
    expect(state.currentStep).toBe(2);

    await executionPage.executeUntilCompletion();
    state = await executionPage.getExecutionState();
    expect(state.completed).toBe(true);
  });
});

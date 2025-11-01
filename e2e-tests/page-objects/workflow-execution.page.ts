/**
 * Page Object Model for Workflow Execution
 *
 * Encapsulates all interactions with workflow execution functionality.
 * Handles execution controls, state monitoring, and step progression.
 */

import { Page, Locator, expect } from '@playwright/test';

export type WorkflowStatus = 'Running' | 'Paused' | 'Completed';
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export class WorkflowExecutionPage {
  readonly page: Page;

  // Execution panel elements
  readonly executionPanel: Locator;
  readonly workflowTitle: Locator;
  readonly statusBadge: Locator;
  readonly progressBar: Locator;
  readonly progressText: Locator;

  // Control buttons
  readonly executeNextButton: Locator;
  readonly pauseButton: Locator;
  readonly resumeButton: Locator;
  readonly cancelButton: Locator;
  readonly resetButton: Locator;

  // Steps section
  readonly stepsSection: Locator;
  readonly stepsList: Locator;
  readonly stepItems: Locator;

  // Variables section
  readonly variablesSection: Locator;
  readonly variablesList: Locator;

  constructor(page: Page) {
    this.page = page;

    // Execution panel
    this.executionPanel = page.locator('div.space-y-6').first();
    this.workflowTitle = page.locator('h2.text-2xl');
    this.statusBadge = page.locator('span.rounded-full.px-4.py-1');
    this.progressBar = page.locator('div.h-2.overflow-hidden');
    this.progressText = page.locator('span:has-text("steps")');

    // Control buttons
    this.executeNextButton = page.locator('button:has-text("Execute Next Step")');
    this.pauseButton = page.locator('button:has-text("Pause")');
    this.resumeButton = page.locator('button:has-text("Resume")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.resetButton = page.locator('button:has-text("Reset")');

    // Steps section
    this.stepsSection = page.locator('div.space-y-3:has(h3:has-text("Execution Steps"))');
    this.stepsList = page.locator('div.space-y-3').last();
    this.stepItems = page.locator('div.rounded-lg.border.p-4');

    // Variables section
    this.variablesSection = page.locator('div:has(h3:has-text("Workflow Variables"))');
    this.variablesList = page.locator('div.space-y-2:has(code)');
  }

  /**
   * Start workflow execution
   * (Typically done from WorkflowsPage.executeWorkflow())
   */
  async startExecution() {
    // This is usually triggered from the workflows list page
    // But if execution panel is visible with initial state, we can proceed
    await expect(this.executionPanel).toBeVisible();
  }

  /**
   * Execute next step in the workflow
   */
  async executeNextStep() {
    await expect(this.executeNextButton).toBeVisible();
    await expect(this.executeNextButton).toBeEnabled();
    await this.executeNextButton.click();

    // Wait for execution to complete (spinner should appear and disappear)
    await this.page.waitForTimeout(1500); // Wait for simulated execution
  }

  /**
   * Pause workflow execution
   */
  async pauseWorkflow() {
    await expect(this.pauseButton).toBeVisible();
    await expect(this.pauseButton).toBeEnabled();
    await this.pauseButton.click();
    await this.page.waitForTimeout(300);

    // Verify paused state
    await expect(this.statusBadge).toContainText('Paused');
  }

  /**
   * Resume workflow execution
   */
  async resumeWorkflow() {
    await expect(this.resumeButton).toBeVisible();
    await expect(this.resumeButton).toBeEnabled();
    await this.resumeButton.click();
    await this.page.waitForTimeout(300);

    // Verify resumed state (should show Running or no badge)
    await expect(this.resumeButton).not.toBeVisible();
  }

  /**
   * Cancel workflow execution with confirmation
   * @param confirmCancel Whether to confirm the cancellation dialog
   */
  async cancelWorkflow(confirmCancel: boolean = true) {
    // Set up dialog handler before clicking
    this.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Are you sure you want to cancel');
      if (confirmCancel) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });

    await this.cancelButton.click();

    if (confirmCancel) {
      await this.page.waitForTimeout(500);
      // Execution panel should be hidden after cancel
      await expect(this.executionPanel).not.toBeVisible();
    }
  }

  /**
   * Reset workflow execution
   */
  async resetWorkflow() {
    await expect(this.resetButton).toBeVisible();
    await this.resetButton.click();
    await this.page.waitForTimeout(500);

    // Execution panel should be hidden after reset
    await expect(this.executionPanel).not.toBeVisible();
  }

  /**
   * Get current workflow execution state
   */
  async getExecutionState(): Promise<{
    currentStep: number;
    totalSteps: number;
    status: WorkflowStatus | null;
    progress: number;
  }> {
    const progressTextContent = await this.progressText.textContent();
    const match = progressTextContent?.match(/(\d+)\s*\/\s*(\d+)\s*steps/);

    const currentStep = match ? parseInt(match[1] || '0') : 0;
    const totalSteps = match ? parseInt(match[2] || '0') : 0;
    const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

    let status: WorkflowStatus | null = null;
    try {
      const statusText = await this.statusBadge.textContent();
      if (statusText?.includes('Completed')) {
        status = 'Completed';
      } else if (statusText?.includes('Paused')) {
        status = 'Paused';
      } else if (statusText?.includes('Running')) {
        status = 'Running';
      }
    } catch {
      // Badge may not be visible
      status = null;
    }

    return { currentStep, totalSteps, status, progress };
  }

  /**
   * Get current step number (0-indexed)
   */
  async getCurrentStepNumber(): Promise<number> {
    const state = await this.getExecutionState();
    return state.currentStep;
  }

  /**
   * Get total number of steps
   */
  async getTotalSteps(): Promise<number> {
    const state = await this.getExecutionState();
    return state.totalSteps;
  }

  /**
   * Get workflow status badge text
   */
  async getWorkflowStatus(): Promise<WorkflowStatus | null> {
    const state = await this.getExecutionState();
    return state.status;
  }

  /**
   * Get step status by index
   * @param stepIndex Zero-based step index
   */
  async getStepStatus(stepIndex: number): Promise<StepStatus> {
    const step = this.stepItems.nth(stepIndex);
    await expect(step).toBeVisible();

    // Check for status-specific classes or icons
    const classes = await step.getAttribute('class');

    if (classes?.includes('border-green-300') || classes?.includes('bg-green-50')) {
      return 'completed';
    } else if (classes?.includes('border-blue-300') || classes?.includes('bg-blue-50')) {
      return 'in-progress';
    } else if (classes?.includes('border-red-300') || classes?.includes('bg-red-50')) {
      return 'failed';
    } else {
      return 'pending';
    }
  }

  /**
   * Get step list with their statuses
   */
  async getStepList(): Promise<Array<{ name: string; action: string; status: StepStatus }>> {
    const steps: Array<{ name: string; action: string; status: StepStatus }> = [];
    const count = await this.stepItems.count();

    for (let i = 0; i < count; i++) {
      const stepItem = this.stepItems.nth(i);

      // Get step name (format: "1. Step Name")
      const nameLocator = stepItem.locator('h4.font-medium');
      const nameText = await nameLocator.textContent();
      const name = nameText?.replace(/^\d+\.\s*/, '').trim() || '';

      // Get action (in code badge)
      const actionLocator = stepItem.locator('span.font-mono');
      const action = (await actionLocator.textContent())?.trim() || '';

      // Get status
      const status = await this.getStepStatus(i);

      steps.push({ name, action, status });
    }

    return steps;
  }

  /**
   * Get workflow variables
   */
  async getWorkflowVariables(): Promise<Record<string, unknown>> {
    const variables: Record<string, unknown> = {};

    try {
      await expect(this.variablesSection).toBeVisible();

      const variableItems = this.variablesSection.locator('div.flex.items-start');
      const count = await variableItems.count();

      for (let i = 0; i < count; i++) {
        const item = variableItems.nth(i);
        const keyLocator = item.locator('code.text-blue-600, code.text-blue-400');
        const valueLocator = item.locator('code.text-gray-700, code.text-gray-300');

        const key = (await keyLocator.textContent())?.replace(':', '').trim() || '';
        const valueText = (await valueLocator.textContent())?.trim() || '';

        try {
          variables[key] = JSON.parse(valueText);
        } catch {
          variables[key] = valueText;
        }
      }
    } catch {
      // Variables section may not be visible
    }

    return variables;
  }

  /**
   * Verify execution panel is visible
   */
  async expectExecutionPanelVisible() {
    await expect(this.executionPanel).toBeVisible();
    await expect(this.workflowTitle).toBeVisible();
    await expect(this.progressBar).toBeVisible();
  }

  /**
   * Verify execution panel is hidden
   */
  async expectExecutionPanelHidden() {
    await expect(this.executionPanel).not.toBeVisible();
  }

  /**
   * Verify workflow status badge
   * @param expectedStatus Expected workflow status
   */
  async expectWorkflowStatus(expectedStatus: WorkflowStatus) {
    await expect(this.statusBadge).toBeVisible();
    await expect(this.statusBadge).toContainText(expectedStatus);
  }

  /**
   * Verify step has specific status
   * @param stepIndex Zero-based step index
   * @param expectedStatus Expected step status
   */
  async expectStepStatus(stepIndex: number, expectedStatus: StepStatus) {
    const actualStatus = await this.getStepStatus(stepIndex);
    expect(actualStatus).toBe(expectedStatus);
  }

  /**
   * Verify workflow is completed
   */
  async expectWorkflowCompleted() {
    await expect(this.statusBadge).toContainText('Completed');
    await expect(this.executeNextButton).not.toBeVisible();

    // All steps should be completed
    const steps = await this.getStepList();
    for (const step of steps) {
      expect(step.status).toBe('completed');
    }
  }

  /**
   * Verify workflow is paused
   */
  async expectWorkflowPaused() {
    await expect(this.statusBadge).toContainText('Paused');
    await expect(this.resumeButton).toBeVisible();
    await expect(this.executeNextButton).not.toBeVisible();
  }

  /**
   * Verify workflow is running
   */
  async expectWorkflowRunning() {
    // When running, either no status badge or "Running" badge
    const isVisible = await this.statusBadge.isVisible();
    if (isVisible) {
      const text = await this.statusBadge.textContent();
      expect(text).toContain('Running');
    }

    await expect(this.executeNextButton).toBeVisible();
    await expect(this.resumeButton).not.toBeVisible();
  }

  /**
   * Verify progress matches expected values
   * @param expectedCurrent Expected current step number
   * @param expectedTotal Expected total steps
   */
  async expectProgress(expectedCurrent: number, expectedTotal: number) {
    const state = await this.getExecutionState();
    expect(state.currentStep).toBe(expectedCurrent);
    expect(state.totalSteps).toBe(expectedTotal);
  }

  /**
   * Verify step message is displayed
   * @param stepIndex Zero-based step index
   * @param expectedMessage Expected message content
   */
  async expectStepMessage(stepIndex: number, expectedMessage: string) {
    const step = this.stepItems.nth(stepIndex);
    const messageLocator = step.locator('p.text-sm.text-gray-600, p.text-sm.text-gray-400');
    await expect(messageLocator).toContainText(expectedMessage);
  }

  /**
   * Verify workflow variables contain specific key-value pairs
   * @param expectedVariables Expected variables
   */
  async expectVariables(expectedVariables: Record<string, unknown>) {
    const actualVariables = await this.getWorkflowVariables();

    for (const [key, expectedValue] of Object.entries(expectedVariables)) {
      expect(actualVariables).toHaveProperty(key);
      expect(actualVariables[key]).toEqual(expectedValue);
    }
  }

  /**
   * Execute workflow until completion
   * @param maxSteps Maximum number of steps to execute (safety limit)
   */
  async executeUntilCompletion(maxSteps: number = 20) {
    let step = 0;

    while (step < maxSteps) {
      try {
        const state = await this.getExecutionState();

        if (state.status === 'Completed' || state.currentStep >= state.totalSteps) {
          // Workflow completed
          break;
        }

        // Check if execute button is visible and enabled
        const isVisible = await this.executeNextButton.isVisible();
        const isEnabled = await this.executeNextButton.isEnabled();

        if (!isVisible || !isEnabled) {
          // No more steps to execute
          break;
        }

        await this.executeNextStep();
        step++;
      } catch (error) {
        // If button is not visible, workflow may be completed
        break;
      }
    }

    if (step >= maxSteps) {
      throw new Error(`Workflow did not complete within ${maxSteps} steps`);
    }
  }

  /**
   * Wait for workflow status change
   * @param expectedStatus Expected status to wait for
   * @param timeout Timeout in milliseconds
   */
  async waitForStatus(expectedStatus: WorkflowStatus, timeout: number = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getWorkflowStatus();
      if (status === expectedStatus) {
        return;
      }
      await this.page.waitForTimeout(500);
    }

    throw new Error(`Workflow did not reach status "${expectedStatus}" within ${timeout}ms`);
  }

  /**
   * Verify step count matches expected
   * @param expectedCount Expected number of steps
   */
  async expectStepCount(expectedCount: number) {
    const count = await this.stepItems.count();
    expect(count).toBe(expectedCount);
  }

  /**
   * Get workflow title
   */
  async getWorkflowTitle(): Promise<string> {
    const text = await this.workflowTitle.textContent();
    return text?.trim() || '';
  }

  /**
   * Verify workflow title
   * @param expectedTitle Expected workflow title
   */
  async expectWorkflowTitle(expectedTitle: string) {
    await expect(this.workflowTitle).toHaveText(expectedTitle);
  }
}

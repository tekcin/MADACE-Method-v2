/**
 * Page Object Model for Workflow Creator Page
 *
 * Encapsulates all interactions with the Workflow Creator at /workflows/create
 * Provides methods for creating workflows through the multi-step wizard.
 */

import { Page, Locator, expect } from '@playwright/test';

export class WorkflowCreatorPage {
  readonly page: Page;

  // Page elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Progress indicator elements
  readonly progressIndicator: Locator;

  // Navigation buttons
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;

  // Basic Info Step (Step 1)
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly agentSelect: Locator;
  readonly phaseSelect: Locator;

  // Steps Editor (Step 2)
  readonly addStepButton: Locator;
  readonly stepsList: Locator;

  // Variables Step (Step 3)
  readonly addVariableButton: Locator;
  readonly variablesList: Locator;

  // Preview Step (Step 4)
  readonly yamlPreview: Locator;
  readonly downloadYamlButton: Locator;
  readonly copyToClipboardButton: Locator;
  readonly validationResults: Locator;

  // Status messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements
    this.pageTitle = page.locator('h1:has-text("Create New Workflow")').first();
    this.pageDescription = page.locator('p:has-text("Build a custom MADACE workflow")');

    // Progress indicator
    this.progressIndicator = page.locator('div.flex.items-center.justify-between').first();

    // Navigation buttons
    this.previousButton = page.locator('button:has-text("Previous")');
    this.nextButton = page.locator('button:has-text("Next")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.finishButton = page.locator('button:has-text("Finish")');

    // Basic Info Step
    this.nameInput = page.locator('input[name="name"]');
    this.descriptionInput = page.locator('textarea[name="description"]');
    this.agentSelect = page.locator('select[name="agent"]');
    this.phaseSelect = page.locator('select[name="phase"]');

    // Steps Editor
    this.addStepButton = page.locator('button:has-text("Add Step")');
    this.stepsList = page.locator('[data-testid="steps-list"]');

    // Variables Step
    this.addVariableButton = page.locator('button:has-text("Add Variable")');
    this.variablesList = page.locator('[data-testid="variables-list"]');

    // Preview Step
    this.yamlPreview = page.locator('pre code');
    this.downloadYamlButton = page.locator('button:has-text("Download YAML")');
    this.copyToClipboardButton = page.locator('button:has-text("Copy to Clipboard")');
    this.validationResults = page.locator('div.space-y-2').filter({ has: page.locator('svg') });

    // Status messages
    this.errorMessage = page.locator('div.bg-red-50, div.bg-red-900\\/20').filter({ hasText: 'Error' });
    this.successMessage = page.locator('div.bg-green-50, div.bg-green-900\\/20').filter({ hasText: 'success' });
  }

  /**
   * Navigate to the Workflow Creator page
   */
  async goto() {
    await this.page.goto('/workflows/create');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill basic info step (Step 1)
   * @param data Basic workflow information
   */
  async fillBasicInfo(data: {
    name: string;
    description: string;
    agent: string;
    phase?: number;
  }) {
    await this.nameInput.fill(data.name);
    await this.descriptionInput.fill(data.description);
    await this.agentSelect.selectOption(data.agent);

    if (data.phase !== undefined) {
      await this.phaseSelect.selectOption(data.phase.toString());
    }
  }

  /**
   * Click Next button to advance to next step
   */
  async clickNext() {
    await this.nextButton.click();
    await this.page.waitForTimeout(300); // Wait for step transition
  }

  /**
   * Click Previous button to go back to previous step
   */
  async clickPrevious() {
    await this.previousButton.click();
    await this.page.waitForTimeout(300); // Wait for step transition
  }

  /**
   * Click Cancel button
   * @param confirmCancel Whether to confirm the cancellation dialog
   */
  async clickCancel(confirmCancel: boolean = true) {
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
  }

  /**
   * Click Finish button to complete workflow creation
   */
  async clickFinish() {
    await this.finishButton.click();
  }

  /**
   * Add a workflow step (Step 2)
   * @param stepData Step configuration
   */
  async addStep(stepData: {
    name: string;
    action: string;
    message?: string;
    prompt?: string;
    variable?: string;
  }) {
    await this.addStepButton.click();
    await this.page.waitForTimeout(200);

    // Get the last step form (newly added)
    const stepForms = this.page.locator('[data-testid^="step-form-"]');
    const count = await stepForms.count();
    const newStepForm = stepForms.nth(count - 1);

    // Fill step details
    await newStepForm.locator('input[name="stepName"]').fill(stepData.name);
    await newStepForm.locator('select[name="action"]').selectOption(stepData.action);

    if (stepData.message) {
      await newStepForm.locator('textarea[name="message"]').fill(stepData.message);
    }

    if (stepData.prompt) {
      await newStepForm.locator('textarea[name="prompt"]').fill(stepData.prompt);
    }

    if (stepData.variable) {
      await newStepForm.locator('input[name="variable"]').fill(stepData.variable);
    }
  }

  /**
   * Edit a workflow step by index (Step 2)
   * @param index Zero-based index of the step
   * @param stepData Updated step configuration
   */
  async editStep(
    index: number,
    stepData: {
      name?: string;
      action?: string;
      message?: string;
      prompt?: string;
      variable?: string;
    }
  ) {
    const stepForms = this.page.locator('[data-testid^="step-form-"]');
    const stepForm = stepForms.nth(index);

    if (stepData.name) {
      await stepForm.locator('input[name="stepName"]').fill(stepData.name);
    }

    if (stepData.action) {
      await stepForm.locator('select[name="action"]').selectOption(stepData.action);
    }

    if (stepData.message) {
      await stepForm.locator('textarea[name="message"]').fill(stepData.message);
    }

    if (stepData.prompt) {
      await stepForm.locator('textarea[name="prompt"]').fill(stepData.prompt);
    }

    if (stepData.variable) {
      await stepForm.locator('input[name="variable"]').fill(stepData.variable);
    }
  }

  /**
   * Delete a workflow step by index (Step 2)
   * @param index Zero-based index of the step to delete
   */
  async deleteStep(index: number) {
    const stepForms = this.page.locator('[data-testid^="step-form-"]');
    const stepForm = stepForms.nth(index);
    const deleteButton = stepForm.locator('button:has-text("Delete"), button[aria-label="Delete step"]');

    await deleteButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Get the number of steps
   */
  async getStepCount(): Promise<number> {
    const stepForms = this.page.locator('[data-testid^="step-form-"]');
    return await stepForms.count();
  }

  /**
   * Add a variable (Step 3)
   * @param variableData Variable configuration
   */
  async addVariable(variableData: { name: string; value: string }) {
    await this.addVariableButton.click();
    await this.page.waitForTimeout(200);

    // Get the last variable form (newly added)
    const variableForms = this.page.locator('[data-testid^="variable-form-"]');
    const count = await variableForms.count();
    const newVariableForm = variableForms.nth(count - 1);

    // Fill variable details
    await newVariableForm.locator('input[name="variableName"]').fill(variableData.name);
    await newVariableForm.locator('input[name="variableValue"]').fill(variableData.value);
  }

  /**
   * Edit a variable by index (Step 3)
   * @param index Zero-based index of the variable
   * @param variableData Updated variable configuration
   */
  async editVariable(index: number, variableData: { name?: string; value?: string }) {
    const variableForms = this.page.locator('[data-testid^="variable-form-"]');
    const variableForm = variableForms.nth(index);

    if (variableData.name) {
      await variableForm.locator('input[name="variableName"]').fill(variableData.name);
    }

    if (variableData.value) {
      await variableForm.locator('input[name="variableValue"]').fill(variableData.value);
    }
  }

  /**
   * Delete a variable by index (Step 3)
   * @param index Zero-based index of the variable to delete
   */
  async deleteVariable(index: number) {
    const variableForms = this.page.locator('[data-testid^="variable-form-"]');
    const variableForm = variableForms.nth(index);
    const deleteButton = variableForm.locator('button:has-text("Delete"), button[aria-label="Delete variable"]');

    await deleteButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Get the number of variables
   */
  async getVariableCount(): Promise<number> {
    const variableForms = this.page.locator('[data-testid^="variable-form-"]');
    return await variableForms.count();
  }

  /**
   * Get YAML preview content (Step 4)
   */
  async getYamlPreview(): Promise<string> {
    const text = await this.yamlPreview.textContent();
    return text?.trim() || '';
  }

  /**
   * Download YAML workflow file (Step 4)
   */
  async downloadYaml() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadYamlButton.click();
    const download = await downloadPromise;
    return download;
  }

  /**
   * Copy YAML to clipboard (Step 4)
   */
  async copyYamlToClipboard() {
    await this.copyToClipboardButton.click();
    await this.page.waitForTimeout(500); // Wait for copy operation

    // Verify success message appears
    const successText = this.page.locator('text="Copied to clipboard!"');
    await expect(successText).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verify current step in wizard
   * @param stepNumber Expected step number (1-4)
   */
  async expectCurrentStep(stepNumber: 1 | 2 | 3 | 4) {
    // Check step indicator
    const stepIndicator = this.page.locator(`div.flex.items-center.justify-center:has-text("${stepNumber}")`).first();
    await expect(stepIndicator).toHaveClass(/bg-blue-600|bg-blue-500/);
  }

  /**
   * Verify validation error appears
   * @param errorMessage Expected error message
   */
  async expectValidationError(errorMessage: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(errorMessage);
  }

  /**
   * Verify success message appears
   */
  async expectSuccess() {
    await expect(this.successMessage).toBeVisible();
  }

  /**
   * Verify navigation buttons state
   * @param expectedState Expected button visibility state
   */
  async expectNavigationButtons(expectedState: {
    previousVisible?: boolean;
    nextVisible?: boolean;
    cancelVisible?: boolean;
    finishVisible?: boolean;
  }) {
    if (expectedState.previousVisible !== undefined) {
      if (expectedState.previousVisible) {
        await expect(this.previousButton).toBeVisible();
      } else {
        await expect(this.previousButton).not.toBeVisible();
      }
    }

    if (expectedState.nextVisible !== undefined) {
      if (expectedState.nextVisible) {
        await expect(this.nextButton).toBeVisible();
      } else {
        await expect(this.nextButton).not.toBeVisible();
      }
    }

    if (expectedState.cancelVisible !== undefined) {
      if (expectedState.cancelVisible) {
        await expect(this.cancelButton).toBeVisible();
      } else {
        await expect(this.cancelButton).not.toBeVisible();
      }
    }

    if (expectedState.finishVisible !== undefined) {
      if (expectedState.finishVisible) {
        await expect(this.finishButton).toBeVisible();
      } else {
        await expect(this.finishButton).not.toBeVisible();
      }
    }
  }

  /**
   * Complete entire workflow creation flow
   * @param workflowData Complete workflow configuration
   */
  async completeWorkflowCreation(workflowData: {
    name: string;
    description: string;
    agent: string;
    phase?: number;
    steps?: Array<{
      name: string;
      action: string;
      message?: string;
      prompt?: string;
      variable?: string;
    }>;
    variables?: Array<{
      name: string;
      value: string;
    }>;
  }) {
    // Step 1: Basic Info
    await this.fillBasicInfo({
      name: workflowData.name,
      description: workflowData.description,
      agent: workflowData.agent,
      phase: workflowData.phase,
    });
    await this.clickNext();

    // Step 2: Steps
    if (workflowData.steps && workflowData.steps.length > 0) {
      for (const step of workflowData.steps) {
        await this.addStep(step);
      }
    }
    await this.clickNext();

    // Step 3: Variables
    if (workflowData.variables && workflowData.variables.length > 0) {
      for (const variable of workflowData.variables) {
        await this.addVariable(variable);
      }
    }
    await this.clickNext();

    // Step 4: Preview & Finish
    await this.expectCurrentStep(4);
    await this.clickFinish();
  }

  /**
   * Verify page is loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageDescription).toBeVisible();
    await expect(this.progressIndicator).toBeVisible();
  }

  /**
   * Verify YAML preview contains expected content
   * @param expectedContent Expected YAML content (partial match)
   */
  async expectYamlContains(expectedContent: string) {
    const yaml = await this.getYamlPreview();
    expect(yaml).toContain(expectedContent);
  }

  /**
   * Verify validation results in preview step
   * @param expectedResults Expected validation messages
   */
  async expectValidationResults(expectedResults: {
    errors?: string[];
    warnings?: string[];
    successes?: string[];
  }) {
    if (expectedResults.errors) {
      for (const error of expectedResults.errors) {
        const errorLocator = this.page.locator('div.bg-red-50, div.bg-red-900\\/20').filter({ hasText: error });
        await expect(errorLocator).toBeVisible();
      }
    }

    if (expectedResults.warnings) {
      for (const warning of expectedResults.warnings) {
        const warningLocator = this.page.locator('div.bg-yellow-50, div.bg-yellow-900\\/20').filter({ hasText: warning });
        await expect(warningLocator).toBeVisible();
      }
    }

    if (expectedResults.successes) {
      for (const success of expectedResults.successes) {
        const successLocator = this.page.locator('div.bg-green-50, div.bg-green-900\\/20').filter({ hasText: success });
        await expect(successLocator).toBeVisible();
      }
    }
  }
}

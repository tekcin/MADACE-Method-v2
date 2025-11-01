/**
 * Page Object Model for Workflows List Page
 *
 * Encapsulates all interactions with the Workflows page at /workflows
 * Provides methods for navigating, creating, and executing workflows.
 */

import { Page, Locator, expect } from '@playwright/test';

export class WorkflowsPage {
  readonly page: Page;

  // Main elements
  readonly pageTitle: Locator;
  readonly createWorkflowButton: Locator;
  readonly workflowsGrid: Locator;
  readonly workflowCards: Locator;

  // Workflow execution panel
  readonly executionPanel: Locator;
  readonly executionTitle: Locator;
  readonly executionProgress: Locator;
  readonly executionStepsList: Locator;

  // Status section
  readonly statusCompleteSection: Locator;

  // Information sections
  readonly aboutWorkflowsSection: Locator;
  readonly featuresCompleteSection: Locator;

  // Empty state
  readonly emptyStateContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main elements
    this.pageTitle = page.locator('h1:has-text("MADACE Workflows")');
    this.createWorkflowButton = page.locator('a[href="/workflows/create"]');
    this.workflowsGrid = page.locator('div.grid');
    this.workflowCards = page.locator('[role="button"]').filter({ hasText: 'Execute Workflow' });

    // Workflow execution panel
    this.executionPanel = page.locator('div.space-y-6').first();
    this.executionTitle = page.locator('h2.text-2xl');
    this.executionProgress = page.locator('div.h-2.overflow-hidden');
    this.executionStepsList = page.locator('div.space-y-3:has(h3:has-text("Execution Steps"))');

    // Status section
    this.statusCompleteSection = page.locator('div:has-text("100% Complete")');

    // Information sections
    this.aboutWorkflowsSection = page.locator('div:has(h3:has-text("About MADACE Workflows"))');
    this.featuresCompleteSection = page.locator(
      'div:has(h4:has-text("Workflow Features - 100% Complete"))'
    );

    // Empty state
    this.emptyStateContainer = page.locator('div.border-dashed:has-text("No workflows available")');
  }

  /**
   * Navigate to the Workflows page
   */
  async goto() {
    await this.page.goto('/workflows');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click "Create Workflow" button
   */
  async clickCreateWorkflow() {
    await this.createWorkflowButton.click();
    await this.page.waitForLoadState('networkidle');
    // Verify navigation to create page
    await expect(this.page).toHaveURL('/workflows/create');
  }

  /**
   * Get list of available workflows
   * @returns Array of workflow names
   */
  async getAvailableWorkflows(): Promise<string[]> {
    const workflows: string[] = [];
    const count = await this.workflowCards.count();

    for (let i = 0; i < count; i++) {
      const card = this.workflowCards.nth(i);
      const titleLocator = card.locator('h3');
      const title = await titleLocator.textContent();
      if (title) {
        workflows.push(title.trim());
      }
    }

    return workflows;
  }

  /**
   * Get workflow card by name
   * @param workflowName Name of the workflow
   */
  getWorkflowCard(workflowName: string): Locator {
    return this.page.locator(`[role="button"]:has(h3:has-text("${workflowName}"))`);
  }

  /**
   * Execute a workflow by name
   * @param workflowName Name of the workflow to execute
   */
  async executeWorkflow(workflowName: string) {
    const workflowCard = this.getWorkflowCard(workflowName);
    const executeButton = workflowCard.locator('button:has-text("Execute Workflow")');

    await executeButton.click();
    await this.page.waitForTimeout(500); // Wait for execution panel to appear

    // Verify execution panel is visible
    await expect(this.executionPanel).toBeVisible();
  }

  /**
   * Click on a workflow card (for details, not execution)
   * @param workflowName Name of the workflow
   */
  async clickWorkflowCard(workflowName: string) {
    const workflowCard = this.getWorkflowCard(workflowName);
    // Click on the card itself, not the execute button
    await workflowCard.click({ position: { x: 10, y: 10 } });
  }

  /**
   * Check if "100% Complete" status section is visible
   */
  async expectCompleteStatusVisible() {
    await expect(this.featuresCompleteSection).toBeVisible();
    await expect(this.featuresCompleteSection).toContainText('100% Complete');
  }

  /**
   * Get workflow card count
   */
  async getWorkflowCount(): Promise<number> {
    return await this.workflowCards.count();
  }

  /**
   * Verify workflow card details
   * @param workflowName Name of the workflow
   * @param expectedDetails Expected workflow details
   */
  async expectWorkflowDetails(
    workflowName: string,
    expectedDetails: {
      description?: string;
      agent?: string;
      phase?: number;
      stepCount?: number;
    }
  ) {
    const workflowCard = this.getWorkflowCard(workflowName);
    await expect(workflowCard).toBeVisible();

    if (expectedDetails.description) {
      await expect(workflowCard).toContainText(expectedDetails.description);
    }

    if (expectedDetails.agent) {
      await expect(workflowCard).toContainText(`Agent: ${expectedDetails.agent}`);
    }

    if (expectedDetails.phase !== undefined) {
      await expect(workflowCard).toContainText(`Phase ${expectedDetails.phase}`);
    }

    if (expectedDetails.stepCount !== undefined) {
      await expect(workflowCard).toContainText(`${expectedDetails.stepCount} steps`);
    }
  }

  /**
   * Verify empty state is displayed
   */
  async expectEmptyState() {
    await expect(this.emptyStateContainer).toBeVisible();
    await expect(this.emptyStateContainer).toContainText('No workflows available');
  }

  /**
   * Verify workflows are loaded
   */
  async expectWorkflowsLoaded() {
    const count = await this.getWorkflowCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Verify page is loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.createWorkflowButton).toBeVisible();
    await expect(this.aboutWorkflowsSection).toBeVisible();
    await expect(this.featuresCompleteSection).toBeVisible();
  }

  /**
   * Verify execution panel is visible
   */
  async expectExecutionPanelVisible() {
    await expect(this.executionPanel).toBeVisible();
    await expect(this.executionTitle).toBeVisible();
    await expect(this.executionProgress).toBeVisible();
  }

  /**
   * Verify execution panel is hidden
   */
  async expectExecutionPanelHidden() {
    await expect(this.executionPanel).not.toBeVisible();
  }

  /**
   * Get workflow description from card
   * @param workflowName Name of the workflow
   */
  async getWorkflowDescription(workflowName: string): Promise<string> {
    const workflowCard = this.getWorkflowCard(workflowName);
    const description = workflowCard.locator('p.text-sm').first();
    const text = await description.textContent();
    return text?.trim() || '';
  }

  /**
   * Verify "About MADACE Workflows" section
   */
  async expectAboutSectionVisible() {
    await expect(this.aboutWorkflowsSection).toBeVisible();
    await expect(this.aboutWorkflowsSection).toContainText('About MADACE Workflows');
    // Verify action types are listed
    await expect(this.aboutWorkflowsSection).toContainText('Elicit');
    await expect(this.aboutWorkflowsSection).toContainText('Reflect');
    await expect(this.aboutWorkflowsSection).toContainText('Guide');
    await expect(this.aboutWorkflowsSection).toContainText('Template');
    await expect(this.aboutWorkflowsSection).toContainText('Validate');
    await expect(this.aboutWorkflowsSection).toContainText('Sub-workflow');
  }
}

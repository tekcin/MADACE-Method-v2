/**
 * Page Object Model for Setup Wizard
 *
 * Encapsulates all interactions with the Setup Wizard at /setup
 */

import { Page, Locator, expect } from '@playwright/test';

export class SetupWizardPage {
  readonly page: Page;

  // Step indicators
  readonly stepIndicator: Locator;

  // Project Info Step (Step 1)
  readonly projectNameInput: Locator;
  readonly outputFolderInput: Locator;
  readonly userNameInput: Locator;
  readonly languageSelect: Locator;

  // LLM Config Step (Step 2)
  readonly geminiProviderCard: Locator;
  readonly claudeProviderCard: Locator;
  readonly openaiProviderCard: Locator;
  readonly localProviderCard: Locator;
  readonly apiKeyInput: Locator;
  readonly modelSelect: Locator;

  // Module Config Step (Step 3)
  readonly mamToggle: Locator;
  readonly mabToggle: Locator;
  readonly cisToggle: Locator;

  // Navigation buttons
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly finishButton: Locator;

  // Summary Step (Step 4)
  readonly summaryProjectName: Locator;
  readonly summaryLLMProvider: Locator;
  readonly summaryModules: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step indicators
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');

    // Project Info Step
    this.projectNameInput = page.locator('input[name="projectName"]');
    this.outputFolderInput = page.locator('input[name="outputFolder"]');
    this.userNameInput = page.locator('input[name="userName"]');
    this.languageSelect = page.locator('select[name="language"]');

    // LLM Config Step
    this.geminiProviderCard = page.locator('[data-testid="provider-gemini"]');
    this.claudeProviderCard = page.locator('[data-testid="provider-claude"]');
    this.openaiProviderCard = page.locator('[data-testid="provider-openai"]');
    this.localProviderCard = page.locator('[data-testid="provider-local"]');
    this.apiKeyInput = page.locator('input[name="apiKey"]');
    this.modelSelect = page.locator('select[name="model"]');

    // Module Config Step
    this.mamToggle = page.locator('input[name="mam"]');
    this.mabToggle = page.locator('input[name="mab"]');
    this.cisToggle = page.locator('input[name="cis"]');

    // Navigation buttons
    this.nextButton = page.locator('button:has-text("Next")');
    this.previousButton = page.locator('button:has-text("Previous")');
    this.finishButton = page.locator('button:has-text("Finish")');

    // Summary Step
    this.summaryProjectName = page.locator('[data-testid="summary-project-name"]');
    this.summaryLLMProvider = page.locator('[data-testid="summary-llm-provider"]');
    this.summaryModules = page.locator('[data-testid="summary-modules"]');
  }

  /**
   * Navigate to the Setup Wizard page
   */
  async goto() {
    await this.page.goto('/setup');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill out Project Info step (Step 1)
   */
  async fillProjectInfo(
    projectName: string,
    userName: string,
    outputFolder = 'docs',
    language = 'English'
  ) {
    await this.projectNameInput.fill(projectName);
    await this.outputFolderInput.fill(outputFolder);
    await this.userNameInput.fill(userName);
    await this.languageSelect.selectOption(language);
  }

  /**
   * Select LLM provider (Step 2)
   */
  async selectLLMProvider(provider: 'gemini' | 'claude' | 'openai' | 'local') {
    const providerMap = {
      gemini: this.geminiProviderCard,
      claude: this.claudeProviderCard,
      openai: this.openaiProviderCard,
      local: this.localProviderCard,
    };

    await providerMap[provider].click();
  }

  /**
   * Fill API key (Step 2)
   */
  async fillAPIKey(apiKey: string) {
    await this.apiKeyInput.fill(apiKey);
  }

  /**
   * Select model (Step 2)
   */
  async selectModel(model: string) {
    await this.modelSelect.selectOption(model);
  }

  /**
   * Toggle module (Step 3)
   */
  async toggleModule(module: 'mam' | 'mab' | 'cis', enabled: boolean) {
    const toggleMap = {
      mam: this.mamToggle,
      mab: this.mabToggle,
      cis: this.cisToggle,
    };

    const toggle = toggleMap[module];
    const isChecked = await toggle.isChecked();

    if (isChecked !== enabled) {
      await toggle.click();
    }
  }

  /**
   * Click Next button
   */
  async clickNext() {
    await this.nextButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Previous button
   */
  async clickPrevious() {
    await this.previousButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Finish button
   */
  async clickFinish() {
    await this.finishButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify we're on a specific step
   */
  async expectStep(stepNumber: 1 | 2 | 3 | 4) {
    const stepText = await this.stepIndicator.textContent();
    expect(stepText).toContain(`Step ${stepNumber}`);
  }

  /**
   * Verify setup completed successfully
   */
  async expectSuccess() {
    // Should redirect to home page or show success message
    await expect(this.page).toHaveURL('/', { timeout: 10000 });
  }

  /**
   * Complete the entire setup wizard
   */
  async completeSetup(config: {
    projectName: string;
    userName: string;
    provider: 'gemini' | 'claude' | 'openai' | 'local';
    apiKey: string;
    model: string;
    modules: { mam: boolean; mab: boolean; cis: boolean };
  }) {
    // Step 1: Project Info
    await this.fillProjectInfo(config.projectName, config.userName);
    await this.clickNext();

    // Step 2: LLM Config
    await this.selectLLMProvider(config.provider);
    await this.fillAPIKey(config.apiKey);
    await this.selectModel(config.model);
    await this.clickNext();

    // Step 3: Module Config
    await this.toggleModule('mam', config.modules.mam);
    await this.toggleModule('mab', config.modules.mab);
    await this.toggleModule('cis', config.modules.cis);
    await this.clickNext();

    // Step 4: Summary & Finish
    await this.expectStep(4);
    await this.clickFinish();

    await this.expectSuccess();
  }
}

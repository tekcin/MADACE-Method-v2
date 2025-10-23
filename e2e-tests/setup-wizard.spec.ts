/**
 * E2E Tests for Setup Wizard
 *
 * Tests the complete setup wizard flow including all 4 steps:
 * 1. Project Info
 * 2. LLM Configuration
 * 3. Module Selection
 * 4. Summary & Finish
 */

import { test, expect } from '@playwright/test';
import { SetupWizardPage } from './page-objects/setup-wizard.page';
import { HomePage } from './page-objects/home.page';
import { testUsers, testLLMConfigs, testModuleConfigs } from './fixtures/test-data';

test.describe('Setup Wizard', () => {
  let wizardPage: SetupWizardPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    wizardPage = new SetupWizardPage(page);
    homePage = new HomePage(page);
  });

  test('new user completes full setup wizard with Gemini', async ({ page }) => {
    // ARRANGE
    await wizardPage.goto();

    // ACT - Step 1: Project Info
    await wizardPage.fillProjectInfo(
      testUsers.default.projectName,
      testUsers.default.userName,
      testUsers.default.outputFolder,
      testUsers.default.language
    );
    await wizardPage.clickNext();

    // Step 2: LLM Config
    await wizardPage.expectStep(2);
    await wizardPage.selectLLMProvider(testLLMConfigs.gemini.provider);
    await wizardPage.fillAPIKey(testLLMConfigs.gemini.apiKey);
    await wizardPage.selectModel(testLLMConfigs.gemini.model);
    await wizardPage.clickNext();

    // Step 3: Module Config
    await wizardPage.expectStep(3);
    await wizardPage.toggleModule('mam', testModuleConfigs.allEnabled.mam);
    await wizardPage.toggleModule('mab', testModuleConfigs.allEnabled.mab);
    await wizardPage.toggleModule('cis', testModuleConfigs.allEnabled.cis);
    await wizardPage.clickNext();

    // Step 4: Summary & Finish
    await wizardPage.expectStep(4);
    await wizardPage.clickFinish();

    // ASSERT
    await wizardPage.expectSuccess();
  });

  test('user navigates between steps using Previous button', async ({ page }) => {
    // ARRANGE
    await wizardPage.goto();

    // ACT
    await wizardPage.fillProjectInfo(testUsers.default.projectName, testUsers.default.userName);
    await wizardPage.clickNext();
    await wizardPage.expectStep(2);

    await wizardPage.clickPrevious();

    // ASSERT
    await wizardPage.expectStep(1);
    await expect(wizardPage.projectNameInput).toHaveValue(testUsers.default.projectName);
  });

  test('setup wizard validates required fields', async ({ page }) => {
    // ARRANGE
    await wizardPage.goto();

    // ACT - Try to proceed without filling fields
    await wizardPage.clickNext();

    // ASSERT - Should stay on Step 1
    await wizardPage.expectStep(1);
  });

  test('setup wizard supports all LLM providers', async ({ page }) => {
    const providers = [
      testLLMConfigs.gemini,
      testLLMConfigs.claude,
      testLLMConfigs.openai,
      testLLMConfigs.local,
    ];

    for (const providerConfig of providers) {
      // ARRANGE
      await wizardPage.goto();

      // ACT
      await wizardPage.fillProjectInfo(
        `${providerConfig.provider}-test`,
        testUsers.default.userName
      );
      await wizardPage.clickNext();

      await wizardPage.selectLLMProvider(providerConfig.provider);
      await wizardPage.fillAPIKey(providerConfig.apiKey);
      await wizardPage.selectModel(providerConfig.model);

      // ASSERT - Verify provider selected (visual feedback)
      const selectedCard = page.locator(`[data-testid="provider-${providerConfig.provider}"]`);
      await expect(selectedCard).toHaveClass(/selected|active|border-primary/);
    }
  });

  test('setup wizard supports module configurations', async ({ page }) => {
    const moduleConfigs = [
      { name: 'All Enabled', config: testModuleConfigs.allEnabled },
      { name: 'MAM Only', config: testModuleConfigs.mamOnly },
      { name: 'Creative', config: testModuleConfigs.creative },
    ];

    for (const { name, config } of moduleConfigs) {
      // ARRANGE
      await wizardPage.goto();
      await wizardPage.fillProjectInfo(name, testUsers.default.userName);
      await wizardPage.clickNext();
      await wizardPage.selectLLMProvider(testLLMConfigs.gemini.provider);
      await wizardPage.fillAPIKey(testLLMConfigs.gemini.apiKey);
      await wizardPage.clickNext();

      // ACT
      await wizardPage.toggleModule('mam', config.mam);
      await wizardPage.toggleModule('mab', config.mab);
      await wizardPage.toggleModule('cis', config.cis);

      // ASSERT - Verify toggles
      await expect(wizardPage.mamToggle).toBeChecked({ checked: config.mam });
      await expect(wizardPage.mabToggle).toBeChecked({ checked: config.mab });
      await expect(wizardPage.cisToggle).toBeChecked({ checked: config.cis });
    }
  });

  test('setup wizard summary displays correct configuration', async ({ page }) => {
    // ARRANGE
    await wizardPage.goto();

    // ACT
    await wizardPage.fillProjectInfo(testUsers.default.projectName, testUsers.default.userName);
    await wizardPage.clickNext();

    await wizardPage.selectLLMProvider(testLLMConfigs.gemini.provider);
    await wizardPage.fillAPIKey(testLLMConfigs.gemini.apiKey);
    await wizardPage.clickNext();

    await wizardPage.toggleModule('mam', true);
    await wizardPage.toggleModule('mab', false);
    await wizardPage.toggleModule('cis', false);
    await wizardPage.clickNext();

    // ASSERT - Verify summary shows correct values
    await wizardPage.expectStep(4);
    await expect(wizardPage.summaryProjectName).toContainText(testUsers.default.projectName);
    await expect(wizardPage.summaryLLMProvider).toContainText('Gemini');
    await expect(wizardPage.summaryModules).toContainText('MAM');
  });

  test('completed setup redirects to home page', async ({ page }) => {
    // ARRANGE
    const config = {
      projectName: testUsers.default.projectName,
      userName: testUsers.default.userName,
      provider: testLLMConfigs.gemini.provider,
      apiKey: testLLMConfigs.gemini.apiKey,
      model: testLLMConfigs.gemini.model,
      modules: testModuleConfigs.mamOnly,
    };

    await wizardPage.goto();

    // ACT
    await wizardPage.completeSetup(config);

    // ASSERT
    await expect(page).toHaveURL('/');
    await homePage.expectHomePageLoaded();
  });
});

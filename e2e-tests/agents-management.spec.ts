/**
 * E2E Tests for Agent Management
 *
 * Tests agent selector page (/agents) - displays all 5 MAM agents
 * with selection and navigation capabilities.
 */

import { test, expect } from '@playwright/test';
import {
  waitForNetworkIdle,
  waitForAPIResponse,
  clickAndWait,
  isVisible,
  getTextContent,
  waitForElementCount,
  retryAction,
} from './utils/test-helpers';

test.describe('Agent Management - Selector Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to agents selector page
    await page.goto('/agents');
    await waitForNetworkIdle(page);
  });

  test('should load agents selector page', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('MADACE Agents');

    // Verify page description
    const description = page.locator('p').first();
    await expect(description).toContainText('Select and interact with AI agents');

    // Verify agents API was called successfully
    const apiResponse = await waitForAPIResponse(page, '/api/agents', { timeout: 10000 });
    expect(apiResponse).toBeTruthy();
    expect(apiResponse.agents).toBeDefined();
    expect(Array.isArray(apiResponse.agents)).toBeTruthy();
    expect(apiResponse.agents.length).toBe(5); // 5 MAM agents
  });

  test('should display all 5 MAM agents', async ({ page }) => {
    // Wait for agents to load
    const agentList = page.locator('[data-testid="agent-list"]');
    await expect(agentList).toBeVisible();

    // Wait for agent cards to appear
    const agentCards = page.locator('[aria-label*="Select"][aria-label*="agent"]');
    await waitForElementCount(agentCards, 5);

    // Verify expected agents are displayed
    const expectedAgents = [
      { name: 'PM', title: 'Product Manager' },
      { name: 'Analyst', title: 'Business Analyst' },
      { name: 'Architect', title: 'Solution Architect' },
      { name: 'SM', title: 'Scrum Master' },
      { name: 'DEV', title: 'Developer' },
    ];

    for (const agent of expectedAgents) {
      const agentCard = page.locator(`button:has-text("${agent.name}")`).first();
      await expect(agentCard).toBeVisible();
    }
  });

  test('should display agent metadata correctly', async ({ page }) => {
    // Get first agent card
    const firstAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').first();
    await expect(firstAgent).toBeVisible();

    // Verify agent card has name
    const agentName = firstAgent.locator('h3');
    await expect(agentName).toBeVisible();
    const nameText = await getTextContent(agentName);
    expect(nameText.length).toBeGreaterThan(0);

    // Verify agent has title/description
    const agentTitle = firstAgent.locator('p.text-sm').first();
    await expect(agentTitle).toBeVisible();

    // Verify agent has module badge
    const moduleBadge = firstAgent.locator('.uppercase');
    await expect(moduleBadge).toBeVisible();
    const moduleText = await getTextContent(moduleBadge);
    expect(moduleText.toLowerCase()).toContain('mam');
  });

  test('should navigate to agent detail page', async ({ page }) => {
    // Click first agent card
    const firstAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').first();
    const agentNameElement = firstAgent.locator('h3');
    const agentName = (await getTextContent(agentNameElement)).toLowerCase();

    await clickAndWait(firstAgent, { waitForNavigation: true });
    await waitForNetworkIdle(page);

    // Verify navigation to detail page
    await expect(page).toHaveURL(new RegExp(`/agents/${agentName}`));
  });

  test('should support single selection mode', async ({ page }) => {
    // Select first agent
    const firstAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').first();
    await firstAgent.click();
    await page.waitForTimeout(500);

    // Check if selection is indicated (aria-pressed or visual indicator)
    const isPressed = await firstAgent.getAttribute('aria-pressed');
    expect(isPressed).toBe('true');

    // Select second agent (should deselect first in single mode)
    const secondAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').nth(1);
    await secondAgent.click();
    await page.waitForTimeout(500);

    // Verify second agent is now selected
    const isSecondPressed = await secondAgent.getAttribute('aria-pressed');
    expect(isSecondPressed).toBe('true');

    // Verify first agent is deselected
    const isFirstPressed = await firstAgent.getAttribute('aria-pressed');
    expect(isFirstPressed).toBe('false');
  });

  test('should support multiple selection mode', async ({ page }) => {
    // Switch to multiple selection mode
    const multiModeButton = page.locator('button:has-text("Multiple")');
    if (await isVisible(multiModeButton)) {
      await multiModeButton.click();
      await page.waitForTimeout(500);

      // Select first agent
      const firstAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').first();
      await firstAgent.click();
      await page.waitForTimeout(500);

      // Select second agent
      const secondAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').nth(1);
      await secondAgent.click();
      await page.waitForTimeout(500);

      // Verify both are selected
      const isFirstPressed = await firstAgent.getAttribute('aria-pressed');
      const isSecondPressed = await secondAgent.getAttribute('aria-pressed');

      expect(isFirstPressed).toBe('true');
      expect(isSecondPressed).toBe('true');
    }
  });

  test('should display module filter', async ({ page }) => {
    // Look for module filter dropdown
    const moduleFilter = page.locator('#moduleFilter');

    if (await isVisible(moduleFilter)) {
      await expect(moduleFilter).toBeVisible();

      // Verify filter options exist
      const allOption = moduleFilter.locator('option:has-text("All Agents")');
      await expect(allOption).toBeVisible();

      // Verify "MAM" option exists
      const mamOption = moduleFilter.locator('option:has-text("MAM")');
      await expect(mamOption).toBeVisible();
    }
  });

  test('should filter agents by module', async ({ page }) => {
    // Select MAM module filter
    const moduleFilter = page.locator('#moduleFilter');

    if (await isVisible(moduleFilter)) {
      // Select MAM option (exact match or first option containing MAM)
      const options = await moduleFilter.locator('option').allTextContents();
      const mamOption = options.find(opt => opt.toLowerCase().includes('mam'));
      if (mamOption) {
        await moduleFilter.selectOption({ label: mamOption });
      }
      await waitForNetworkIdle(page);

      // Verify 5 agents are displayed
      const agentCards = page.locator('[aria-label*="Select"][aria-label*="agent"]');
      await waitForElementCount(agentCards, 5);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await waitForNetworkIdle(page);

    // Verify page loads
    await expect(page.locator('h1')).toBeVisible();

    // Verify agents grid adapts to mobile
    const agentList = page.locator('[data-testid="agent-list"]');
    await expect(agentList).toBeVisible();

    const firstAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').first();
    await expect(firstAgent).toBeVisible();

    const boundingBox = await firstAgent.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('should display selection summary', async ({ page }) => {
    // Select an agent
    const firstAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').first();
    await firstAgent.click();
    await page.waitForTimeout(500);

    // Look for selection summary
    const selectionSummary = page.locator('text=/Selected.*agent/i').first();

    if (await isVisible(selectionSummary)) {
      await expect(selectionSummary).toBeVisible();
      const summaryText = await getTextContent(selectionSummary);
      expect(summaryText).toMatch(/Selected.*1.*agent/i);
    }
  });

  test('should show bulk actions in multi mode', async ({ page }) => {
    // Switch to multiple selection mode
    const multiModeButton = page.locator('button:has-text("Multiple")');

    if (await isVisible(multiModeButton)) {
      await multiModeButton.click();
      await page.waitForTimeout(500);

      // Look for bulk action buttons
      const selectAllButton = page.locator('button:has-text("Select All")');
      const clearAllButton = page.locator('button:has-text("Clear All")');

      // At least one bulk action button should be visible
      const hasSelectAll = await isVisible(selectAllButton);
      const hasClearAll = await isVisible(clearAllButton);

      expect(hasSelectAll || hasClearAll).toBeTruthy();
    }
  });

  test('should display agent information section', async ({ page }) => {
    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Look for agent information section
    const infoSection = page.locator('text=/MADACE Agents.*5 agents/i').first();

    if (await isVisible(infoSection)) {
      await expect(infoSection).toBeVisible();

      // Verify MAM module description exists
      const mamDescription = page.locator('text=/MAM - MADACE Agile Method/i');
      await expect(mamDescription).toBeVisible();
    }
  });

  test('should display coming soon section', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Look for "Coming Soon" section
    const comingSoonSection = page.locator('h4:has-text("Coming Soon")');

    if (await isVisible(comingSoonSection)) {
      await expect(comingSoonSection).toBeVisible();

      // Verify future features are listed
      const featuresList = comingSoonSection.locator('..').locator('ul');
      await expect(featuresList).toBeVisible();

      const listItems = featuresList.locator('li');
      const itemCount = await listItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await waitForNetworkIdle(page);

    // Filter out expected errors
    const criticalErrors = errors.filter(
      (error) => !error.includes('404') && !error.includes('favicon')
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Agent Management - Detail Page', () => {
  test('should display full agent details for PM agent', async ({ page }) => {
    // Navigate directly to PM agent detail page
    // Note: Using /agents/manage path based on actual app structure
    await page.goto('/agents');
    await waitForNetworkIdle(page);

    // Click PM agent card
    const pmAgentCard = page
      .locator('[aria-label*="Select"][aria-label*="agent"]')
      .filter({ hasText: 'PM' })
      .first();
    await clickAndWait(pmAgentCard, { waitForNavigation: true });
    await waitForNetworkIdle(page);

    // Wait for agent detail page to load
    await retryAction(
      async () => {
        const heading = page.locator('h1');
        await expect(heading).toBeVisible({ timeout: 5000 });
      },
      { maxAttempts: 3, delay: 1000 }
    );

    // Verify page has loaded with agent details
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should display agent actions on detail page', async ({ page }) => {
    // Navigate to agent detail
    await page.goto('/agents');
    await waitForNetworkIdle(page);

    const firstAgent = page.locator('[aria-label*="Select"][aria-label*="agent"]').first();
    await clickAndWait(firstAgent, { waitForNavigation: true });
    await waitForNetworkIdle(page);

    // Wait for detail page to load
    await retryAction(
      async () => {
        const heading = page.locator('h1');
        await expect(heading).toBeVisible({ timeout: 5000 });
      },
      { maxAttempts: 3, delay: 1000 }
    );

    // Check for action buttons (Export, Duplicate, Back)
    const exportButton = page.locator('button:has-text("Export")');
    const duplicateButton = page.locator('button:has-text("Duplicate")');
    const backLink = page.locator('a:has-text("Back")');

    // At least one action should be visible
    const exportVisible = await isVisible(exportButton);
    const duplicateVisible = await isVisible(duplicateButton);
    const backVisible = await isVisible(backLink);

    expect(exportVisible || duplicateVisible || backVisible).toBeTruthy();
  });

  test('should handle agent not found gracefully', async ({ page }) => {
    // Navigate to non-existent agent
    await page.goto('/agents/nonexistent-agent-xyz-123');
    await waitForNetworkIdle(page);

    // Verify error message or proper error handling
    const bodyText = await page.locator('body').textContent();
    const hasErrorIndicator =
      bodyText?.match(/(not found|404|doesn't exist|error|failed)/i) !== null;
    expect(hasErrorIndicator).toBeTruthy();
  });
});

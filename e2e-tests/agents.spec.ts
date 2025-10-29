/**
 * E2E Tests for Agent Management
 *
 * Tests agent listing, filtering, search, and detail views
 */

import { test, expect } from '@playwright/test';
import { AgentsPage } from './page-objects/agents.page';
import { HomePage } from './page-objects/home.page';
import { testAgents } from './fixtures/test-data';

test.describe('Agent Management', () => {
  let agentsPage: AgentsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    agentsPage = new AgentsPage(page);
    homePage = new HomePage(page);
  });

  test('agents page loads and displays MAM agents', async ({ page }) => {
    // ARRANGE & ACT
    await agentsPage.goto();

    // ASSERT
    await agentsPage.expectMAMAgentsLoaded();
  });

  test('user can filter agents by module', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();

    // ACT & ASSERT - Filter by MAM
    await agentsPage.filterByModule('mam');
    const mamCount = await agentsPage.getAgentCount();
    expect(mamCount).toBe(5);

    // ACT & ASSERT - Filter by MADACE
    await agentsPage.filterByModule('madace');
    const madaceCount = await agentsPage.getAgentCount();
    expect(madaceCount).toBe(10);

    // ACT & ASSERT - Filter by MADACE v3 BMM
    await agentsPage.filterByModule('madace-v3-bmm');
    const bmmCount = await agentsPage.getAgentCount();
    expect(bmmCount).toBe(10);
  });

  test('user can search for agents by name', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();

    // ACT
    await agentsPage.search('Product Manager');

    // ASSERT
    const count = await agentsPage.getAgentCount();
    expect(count).toBeGreaterThan(0);

    // All visible agents should contain "PM" or "Product" in their title
    const agentCards = agentsPage.agentCards;
    const visibleCount = await agentCards.count();

    for (let i = 0; i < visibleCount; i++) {
      const text = await agentCards.nth(i).textContent();
      expect(text?.toLowerCase()).toMatch(/product|pm/);
    }
  });

  test('user can view agent details', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();
    await agentsPage.filterByModule('mam');

    // ACT
    await agentsPage.clickAgent('pm');

    // ASSERT
    await agentsPage.expectAgentDetail('Product Manager');
    await agentsPage.expectAgentHasMenu();
  });

  test('user can close agent detail modal', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();
    await agentsPage.clickAgent('pm');
    await agentsPage.expectAgentDetail('Product Manager');

    // ACT
    await agentsPage.closeAgentDetail();

    // ASSERT
    await expect(agentsPage.agentDetailModal).not.toBeVisible();
  });

  test('MAM module contains all 5 core agents', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();
    await agentsPage.filterByModule('mam');

    // ACT & ASSERT - Verify each MAM agent
    for (const agentName of testAgents.mam) {
      const agentCard = page.locator(`[data-testid="agent-card-${agentName}"]`);
      await expect(agentCard).toBeVisible();
    }
  });

  test('MADACE module contains all 10 v4 agents', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();
    await agentsPage.filterByModule('madace');

    // ACT & ASSERT - Verify MADACE agents loaded
    await agentsPage.expectMADACEAgentsLoaded();
  });

  test('MADACE v3 modules contain all agents', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();

    // ACT & ASSERT
    await agentsPage.expectMADACEv3AgentsLoaded();
  });

  test('navigation from home to agents works', async ({ page }) => {
    // ARRANGE
    await homePage.goto();

    // ACT
    await homePage.goToAgents();

    // ASSERT
    await expect(page).toHaveURL('/agents');
    const count = await agentsPage.getAgentCount();
    expect(count).toBeGreaterThan(0);
  });

  test('agent persona is displayed in detail view', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();
    await agentsPage.filterByModule('mam');

    // ACT
    await agentsPage.clickAgent('pm');

    // ASSERT
    await expect(agentsPage.agentPersona).toBeVisible();
    const personaText = await agentsPage.agentPersona.textContent();
    expect(personaText).toBeTruthy();
    expect(personaText!.length).toBeGreaterThan(0);
  });

  test('agent menu shows workflow options', async ({ page }) => {
    // ARRANGE
    await agentsPage.goto();
    await agentsPage.filterByModule('mam');

    // ACT
    await agentsPage.clickAgent('pm');

    // ASSERT
    const menuItems = agentsPage.agentMenu.locator('li');
    const count = await menuItems.count();

    // PM agent should have multiple menu items (workflow-status, plan-project, etc.)
    expect(count).toBeGreaterThan(5);
  });
});

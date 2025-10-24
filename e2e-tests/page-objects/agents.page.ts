/**
 * Page Object Model for Agents Management
 *
 * Encapsulates all interactions with the Agents page at /agents
 */

import { Page, Locator, expect } from '@playwright/test';

export class AgentsPage {
  readonly page: Page;

  // Agent list
  readonly agentList: Locator;
  readonly agentCards: Locator;

  // Module filter
  readonly moduleFilter: Locator;

  // Search
  readonly searchInput: Locator;

  // Agent details
  readonly agentDetailModal: Locator;
  readonly agentTitle: Locator;
  readonly agentPersona: Locator;
  readonly agentMenu: Locator;
  readonly closeModalButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Agent list
    this.agentList = page.locator('[data-testid="agent-list"]');
    this.agentCards = page.locator('[data-testid^="agent-card-"]');

    // Module filter
    this.moduleFilter = page.locator('select[name="moduleFilter"]');

    // Search
    this.searchInput = page.locator('input[placeholder*="Search"]');

    // Agent details
    this.agentDetailModal = page.locator('[data-testid="agent-detail-modal"]');
    this.agentTitle = page.locator('[data-testid="agent-title"]');
    this.agentPersona = page.locator('[data-testid="agent-persona"]');
    this.agentMenu = page.locator('[data-testid="agent-menu"]');
    this.closeModalButton = page.locator('button[aria-label="Close"]');
  }

  /**
   * Navigate to the Agents page
   */
  async goto() {
    await this.page.goto('/agents');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter agents by module
   */
  async filterByModule(module: string) {
    await this.moduleFilter.selectOption(module);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for agents
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  /**
   * Get count of visible agent cards
   */
  async getAgentCount(): Promise<number> {
    return await this.agentCards.count();
  }

  /**
   * Click on an agent card by name
   */
  async clickAgent(agentName: string) {
    const agentCard = this.page.locator(`[data-testid="agent-card-${agentName}"]`);
    await agentCard.click();
    await this.agentDetailModal.waitFor({ state: 'visible' });
  }

  /**
   * Close agent detail modal
   */
  async closeAgentDetail() {
    await this.closeModalButton.click();
    await this.agentDetailModal.waitFor({ state: 'hidden' });
  }

  /**
   * Verify agent detail is displayed
   */
  async expectAgentDetail(expectedTitle: string) {
    await expect(this.agentDetailModal).toBeVisible();
    await expect(this.agentTitle).toContainText(expectedTitle);
  }

  /**
   * Verify agent has menu items
   */
  async expectAgentHasMenu() {
    await expect(this.agentMenu).toBeVisible();
    const menuItems = this.agentMenu.locator('li');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Verify MAM agents are loaded (5 agents)
   */
  async expectMAMAgentsLoaded() {
    await this.filterByModule('mam');
    const count = await this.getAgentCount();
    expect(count).toBe(5);
  }

  /**
   * Verify MADACE agents are loaded (10 v4 agents)
   */
  async expectMADACEAgentsLoaded() {
    await this.filterByModule('madace');
    const count = await this.getAgentCount();
    expect(count).toBe(10);
  }

  /**
   * Verify MADACE v6 agents are loaded (20 agents)
   */
  async expectMADACEv6AgentsLoaded() {
    // Check BMM module (10 agents)
    await this.filterByModule('madace-v3-bmm');
    let count = await this.getAgentCount();
    expect(count).toBe(10);

    // Check CIS module (5 agents)
    await this.filterByModule('madace-v3-cis');
    count = await this.getAgentCount();
    expect(count).toBe(5);
  }
}

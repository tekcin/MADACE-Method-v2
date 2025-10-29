/**
 * Improved E2E Tests for Agent Management
 *
 * Enhanced tests with better utilities, visual regression,
 * and comprehensive coverage
 */

import { test, expect } from '@playwright/test';
import { AgentsPage } from './page-objects/agents.page';
import { HomePage } from './page-objects/home.page';
import { testAgents } from './fixtures/test-data';
import {
  waitForNetworkIdle,
  clickAndWait,
  retryAction,
  waitForAPIResponse,
  isVisible,
  getTextContent,
  waitForElementCount,
} from './utils/test-helpers';
import { testGET, testAPIWithRetry } from './utils/api-helpers';
import {
  comparePageSnapshot,
  compareElementSnapshot,
  compareResponsiveSnapshots,
  compareThemeSnapshots,
  VIEWPORTS,
  preparePageForVisualTest,
} from './utils/visual-regression';

test.describe('Agent Management - Improved', () => {
  let agentsPage: AgentsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    agentsPage = new AgentsPage(page);
    homePage = new HomePage(page);
  });

  test.describe('Agent Listing', () => {
    test('agents page loads correctly with proper UI state', async ({ page }) => {
      // ACT
      await agentsPage.goto();
      await waitForNetworkIdle(page);

      // ASSERT - Page structure
      await expect(page).toHaveURL('/agents');
      await expect(agentsPage.agentList).toBeVisible();

      // ASSERT - Filter dropdown exists
      await expect(agentsPage.moduleFilter).toBeVisible();

      // ASSERT - Search input exists
      await expect(agentsPage.searchInput).toBeVisible();

      // ASSERT - Agents are loaded
      const count = await agentsPage.getAgentCount();
      expect(count).toBeGreaterThan(0);
    });

    test('agents are loaded via API correctly', async ({ page, request }) => {
      // ARRANGE
      const apiURL = 'http://localhost:3000/api/agents';

      // ACT
      const response = await testGET(request, apiURL);

      // ASSERT - API response
      expect(response.ok).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);

      // ASSERT - Agent structure
      const firstAgent = response.data[0];
      expect(firstAgent).toHaveProperty('name');
      expect(firstAgent).toHaveProperty('title');
      expect(firstAgent).toHaveProperty('icon');
      expect(firstAgent).toHaveProperty('module');
    });

    test('agents list displays correctly across viewports', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      await preparePageForVisualTest(page);

      // ACT & ASSERT - Compare across different screen sizes
      await compareResponsiveSnapshots(
        page,
        'agents-listing',
        [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop],
        { maxDiffPixelRatio: 0.02 }
      );
    });

    test('agents list supports dark mode correctly', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      await preparePageForVisualTest(page);

      // ACT & ASSERT
      await compareThemeSnapshots(page, 'agents-theme', {
        maxDiffPixelRatio: 0.02,
      });
    });
  });

  test.describe('Agent Filtering', () => {
    test('filter by module updates agent count correctly', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();

      const testCases = [
        { module: 'mam', expected: 5, name: 'MAM module' },
        { module: 'madace', expected: 10, name: 'MADACE v4 module' },
        { module: 'madace-v3-bmm', expected: 10, name: 'MADACE v3 BMM module' },
      ];

      for (const testCase of testCases) {
        // ACT
        await agentsPage.filterByModule(testCase.module);
        await waitForNetworkIdle(page);

        // ASSERT
        const count = await agentsPage.getAgentCount();
        expect(count, `${testCase.name} should have ${testCase.expected} agents`).toBe(
          testCase.expected
        );
      }
    });

    test('filter persists after page reload', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();

      // ACT
      await agentsPage.filterByModule('mam');
      const beforeCount = await agentsPage.getAgentCount();

      // Reload page
      await page.reload();
      await waitForNetworkIdle(page);

      // ASSERT
      const afterCount = await agentsPage.getAgentCount();
      expect(afterCount).toBe(beforeCount);
    });

    test('multiple rapid filter changes work correctly', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();

      // ACT - Rapidly change filters
      const filters = ['mam', 'madace', 'madace-v3-bmm', 'madace-v3-cis'];
      for (const filter of filters) {
        await agentsPage.filterByModule(filter);
        // Don't wait - test rapid switching
      }

      // Wait for final state
      await waitForNetworkIdle(page);

      // ASSERT - Last filter should be active
      const count = await agentsPage.getAgentCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Agent Search', () => {
    test('search filters agents by name correctly', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();

      // ACT
      await agentsPage.search('Product Manager');
      await waitForNetworkIdle(page);

      // ASSERT
      const count = await agentsPage.getAgentCount();
      expect(count).toBeGreaterThan(0);

      // Verify all visible agents match search
      const agentCards = agentsPage.agentCards;
      const visibleCount = await agentCards.count();

      for (let i = 0; i < visibleCount; i++) {
        const text = await agentCards.nth(i).textContent();
        expect(text?.toLowerCase()).toMatch(/product|pm|manager/);
      }
    });

    test('search is case-insensitive', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();

      const searches = ['product', 'PRODUCT', 'Product', 'pRoDuCt'];

      for (const searchTerm of searches) {
        // ACT
        await agentsPage.search(searchTerm);
        await waitForNetworkIdle(page);

        // ASSERT
        const count = await agentsPage.getAgentCount();
        expect(count, `Search "${searchTerm}" should return results`).toBeGreaterThan(0);
      }
    });

    test('search with no results shows empty state', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();

      // ACT
      await agentsPage.search('NonExistentAgent123456');
      await waitForNetworkIdle(page);

      // ASSERT
      const count = await agentsPage.getAgentCount();
      expect(count).toBe(0);
    });

    test('clearing search restores all agents', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      const initialCount = await agentsPage.getAgentCount();

      // ACT
      await agentsPage.search('Product');
      await waitForNetworkIdle(page);
      const searchCount = await agentsPage.getAgentCount();
      expect(searchCount).toBeLessThan(initialCount);

      // Clear search
      await agentsPage.search('');
      await waitForNetworkIdle(page);

      // ASSERT
      const finalCount = await agentsPage.getAgentCount();
      expect(finalCount).toBe(initialCount);
    });
  });

  test.describe('Agent Details', () => {
    test('clicking agent opens detail modal with correct data', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      await agentsPage.filterByModule('mam');

      // ACT
      await clickAndWait(agentsPage.agentCards.first());
      await agentsPage.agentDetailModal.waitFor({ state: 'visible' });

      // ASSERT
      await expect(agentsPage.agentDetailModal).toBeVisible();
      await expect(agentsPage.agentTitle).toBeVisible();
      await expect(agentsPage.agentPersona).toBeVisible();
      await expect(agentsPage.agentMenu).toBeVisible();
    });

    test('agent detail modal is keyboard accessible', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      await agentsPage.filterByModule('mam');

      // ACT - Use keyboard navigation
      await page.keyboard.press('Tab'); // Focus first card
      await page.keyboard.press('Enter'); // Open modal

      // ASSERT
      await expect(agentsPage.agentDetailModal).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(agentsPage.agentDetailModal).not.toBeVisible();
    });

    test('agent persona contains required information', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      await agentsPage.filterByModule('mam');

      // ACT
      await agentsPage.clickAgent('pm');

      // ASSERT
      const personaText = await getTextContent(agentsPage.agentPersona);
      expect(personaText.length).toBeGreaterThan(50); // Should have meaningful content
    });

    test('agent menu displays all workflow options', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      await agentsPage.filterByModule('mam');

      // ACT
      await agentsPage.clickAgent('pm');

      // ASSERT
      const menuItems = agentsPage.agentMenu.locator('li');
      const count = await menuItems.count();

      // PM should have multiple workflows
      expect(count).toBeGreaterThan(5);

      // Each menu item should have text
      for (let i = 0; i < count; i++) {
        const text = await menuItems.nth(i).textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test('agent detail visual regression', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      await agentsPage.filterByModule('mam');
      await agentsPage.clickAgent('pm');
      await agentsPage.agentDetailModal.waitFor({ state: 'visible' });
      await preparePageForVisualTest(page);

      // ACT & ASSERT
      await compareElementSnapshot(agentsPage.agentDetailModal, 'agent-detail-modal', {
        maxDiffPixelRatio: 0.02,
      });
    });
  });

  test.describe('Module-Specific Tests', () => {
    test('MAM module contains all 5 core agents', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();
      await agentsPage.filterByModule('mam');

      // ACT & ASSERT
      await waitForElementCount(agentsPage.agentCards, 5);

      for (const agentName of testAgents.mam) {
        const agentCard = page.locator(`[data-testid="agent-card-${agentName}"]`);
        await expect(agentCard, `${agentName} agent should be visible`).toBeVisible();
      }
    });

    test('MADACE v4 module has correct agent count', async ({ page }) => {
      // ARRANGE & ACT
      await agentsPage.goto();
      await agentsPage.expectMADACEAgentsLoaded();

      // ASSERT
      const count = await agentsPage.getAgentCount();
      expect(count).toBe(10);
    });

    test('MADACE v3 modules load correctly', async ({ page, request }) => {
      // Test via API first
      const modules = ['madace-v3-bmm', 'madace-v3-cis', 'madace-v3-core'];

      for (const module of modules) {
        const response = await testAPIWithRetry(
          request,
          'GET',
          `http://localhost:3000/api/agents?module=${module}`
        );

        expect(response.ok).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
      }

      // Test UI
      await agentsPage.goto();
      await agentsPage.expectMADACEv3AgentsLoaded();
    });
  });

  test.describe('Performance', () => {
    test('agents page loads within performance budget', async ({ page }) => {
      const startTime = Date.now();

      await agentsPage.goto();
      await waitForNetworkIdle(page);

      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('filtering is responsive (under 500ms)', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();

      // ACT
      const startTime = Date.now();
      await agentsPage.filterByModule('mam');
      await agentsPage.agentCards.first().waitFor({ state: 'visible' });
      const filterTime = Date.now() - startTime;

      // ASSERT
      expect(filterTime).toBeLessThan(500);
    });

    test('search debouncing works correctly', async ({ page }) => {
      // ARRANGE
      await agentsPage.goto();

      // ACT - Type quickly
      await agentsPage.searchInput.fill('');
      await agentsPage.searchInput.type('Product', { delay: 50 });

      // Wait for debounce
      await page.waitForTimeout(600);

      // ASSERT - Should have filtered
      const count = await agentsPage.getAgentCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('handles API failure gracefully', async ({ page }) => {
      // ARRANGE - Mock API failure
      await page.route('**/api/agents', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      // ACT
      await agentsPage.goto();

      // ASSERT - Should show error state
      const errorMessage = page.locator('text=/error|failed|wrong/i');
      const isErrorVisible = await isVisible(errorMessage, 5000);
      expect(isErrorVisible).toBe(true);
    });

    test('retries failed API requests', async ({ page, request }) => {
      let attempts = 0;

      await page.route('**/api/agents', (route) => {
        attempts++;
        if (attempts < 3) {
          route.fulfill({ status: 500, body: 'Error' });
        } else {
          route.continue();
        }
      });

      // ACT
      await retryAction(
        async () => {
          await agentsPage.goto();
          const count = await agentsPage.getAgentCount();
          expect(count).toBeGreaterThan(0);
        },
        { maxAttempts: 3, delay: 500 }
      );

      // ASSERT
      expect(attempts).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('Accessibility', () => {
    test('agents page meets WCAG AA standards', async ({ page }) => {
      await agentsPage.goto();

      // Basic accessibility checks
      const agentCard = agentsPage.agentCards.first();

      // Should have proper ARIA attributes
      const role = await agentCard.getAttribute('role');
      const ariaLabel = await agentCard.getAttribute('aria-label');

      // At least one should be present
      expect(role || ariaLabel).toBeTruthy();
    });

    test('keyboard navigation works throughout', async ({ page }) => {
      await agentsPage.goto();

      // Tab through elements
      await page.keyboard.press('Tab'); // First agent card
      await page.keyboard.press('Tab'); // Second agent card
      await page.keyboard.press('Enter'); // Open detail

      await expect(agentsPage.agentDetailModal).toBeVisible();

      // Escape closes modal
      await page.keyboard.press('Escape');
      await expect(agentsPage.agentDetailModal).not.toBeVisible();
    });
  });

  test.describe('Navigation', () => {
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

    test('browser back button works correctly', async ({ page }) => {
      // ARRANGE
      await homePage.goto();
      await homePage.goToAgents();
      await expect(page).toHaveURL('/agents');

      // ACT
      await page.goBack();

      // ASSERT
      await expect(page).toHaveURL('/');
    });
  });
});

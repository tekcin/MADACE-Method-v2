/**
 * Kanban Board E2E Tests (TASK-036)
 *
 * Comprehensive tests for Kanban board functionality based on actual implementation.
 * Tests all 4 columns (BACKLOG, TODO, IN PROGRESS, DONE), story cards, refresh,
 * and state machine limits.
 */

import { test, expect } from '@playwright/test';
import {
  waitForNetworkIdle,
  expectElementVisible,
  waitForAPIResponse,
  mockAPIResponse,
} from './utils/test-helpers';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kanban');
    await waitForNetworkIdle(page);
  });

  test('should load the Kanban board page', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('MADACE Workflow Status');

    // Verify page description
    await expect(page.locator('p')).toContainText('Visual Kanban board for project progress tracking');
  });

  test('should display statistics panel with all metrics', async ({ page }) => {
    // Verify statistics panel exists
    const statsPanel = page.locator('.grid').first();
    await expect(statsPanel).toBeVisible();

    // Verify all 5 statistic cards
    await expect(page.locator('text=Backlog')).toBeVisible();
    await expect(page.locator('text=TODO')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
    await expect(page.locator('text=Total Points')).toBeVisible();
  });

  test('should load all 4 Kanban columns', async ({ page }) => {
    // Verify BACKLOG column
    const backlogColumn = page.locator('h2:has-text("BACKLOG")').locator('..');
    await expect(backlogColumn).toBeVisible();
    await expect(backlogColumn).toContainText('stories');

    // Verify TODO column
    const todoColumn = page.locator('h2:has-text("TODO")').locator('..');
    await expect(todoColumn).toBeVisible();
    await expect(todoColumn).toContainText('Limit: 1');

    // Verify IN PROGRESS column
    const inProgressColumn = page.locator('h2:has-text("IN PROGRESS")').locator('..');
    await expect(inProgressColumn).toBeVisible();
    await expect(inProgressColumn).toContainText('Limit: 1');

    // Verify DONE column
    const doneColumn = page.locator('h2:has-text("DONE")').locator('..');
    await expect(doneColumn).toBeVisible();
  });

  test('should display stories in correct columns with proper structure', async ({ page }) => {
    // Wait for state API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Get all story cards (they all have story ID in heading)
    const storyCards = page.locator('.rounded-lg.border-2.p-3');
    const storyCount = await storyCards.count();

    if (storyCount > 0) {
      // Verify first story card structure
      const firstStory = storyCards.first();
      await expect(firstStory).toBeVisible();

      // Each story should have an ID (h3 with text-sm font-semibold)
      const storyId = firstStory.locator('h3.text-sm.font-semibold');
      await expect(storyId).toBeVisible();

      // Each story should have a title (p with line-clamp-2)
      const storyTitle = firstStory.locator('p.line-clamp-2');
      await expect(storyTitle).toBeVisible();

      // Each story should have points badge
      const pointsBadge = firstStory.locator('span.rounded-full');
      await expect(pointsBadge).toBeVisible();
    }
  });

  test('should display story counts in column headers', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // BACKLOG column should show count
    const backlogHeader = page.locator('h2:has-text("BACKLOG")').locator('..');
    const backlogText = await backlogHeader.textContent();
    expect(backlogText).toMatch(/\d+ stories?/);

    // TODO column should show count
    const todoHeader = page.locator('h2:has-text("TODO")').locator('..');
    const todoText = await todoHeader.textContent();
    expect(todoText).toMatch(/\d+ story/);

    // IN PROGRESS column should show count
    const inProgressHeader = page.locator('h2:has-text("IN PROGRESS")').locator('..');
    const inProgressText = await inProgressHeader.textContent();
    expect(inProgressText).toMatch(/\d+ story/);

    // DONE column should show count and points
    const doneHeader = page.locator('h2:has-text("DONE")').locator('..');
    const doneText = await doneHeader.textContent();
    expect(doneText).toMatch(/\d+ stories? • \d+ pts/);
  });

  test('should enforce TODO limit (max 1 story)', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Check TODO column statistics card
    const todoStatCard = page.locator('text=TODO').locator('..').locator('..');
    const todoText = await todoStatCard.textContent();

    // Extract count
    const countMatch = todoText?.match(/(\d+)/);
    if (countMatch) {
      const todoCount = parseInt(countMatch[1]);

      if (todoCount > 1) {
        // Should show warning emoji in stat card
        await expect(todoStatCard.locator('text=⚠️')).toBeVisible();

        // Should show warning in column header
        const todoColumn = page.locator('h2:has-text("TODO")').locator('..');
        await expect(todoColumn).toContainText('⚠️ Exceeds limit');
      }
    }

    // Verify limit text is always shown
    await expect(page.locator('text=Limit: 1').first()).toBeVisible();
  });

  test('should enforce IN PROGRESS limit (max 1 story)', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Check IN PROGRESS column statistics card
    const inProgressStatCard = page.locator('text=In Progress').locator('..').locator('..');
    const inProgressText = await inProgressStatCard.textContent();

    // Extract count
    const countMatch = inProgressText?.match(/(\d+)/);
    if (countMatch) {
      const inProgressCount = parseInt(countMatch[1]);

      if (inProgressCount > 1) {
        // Should show warning emoji in stat card
        await expect(inProgressStatCard.locator('text=⚠️')).toBeVisible();

        // Should show warning in column header
        const inProgressColumn = page.locator('h2:has-text("IN PROGRESS")').locator('..');
        await expect(inProgressColumn).toContainText('⚠️ Exceeds limit');
      }
    }

    // Verify limit text is always shown
    await expect(page.locator('text=Limit: 1').nth(1)).toBeVisible();
  });

  test('should refresh board data when clicking refresh button', async ({ page }) => {
    // Wait for initial load
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Get initial story count
    const initialStoryCards = page.locator('.rounded-lg.border-2.p-3');
    const initialCount = await initialStoryCards.count();

    // Click refresh button
    await page.click('button:has-text("Refresh Status")');

    // Wait for API call
    await page.waitForResponse((response) => response.url().includes('/api/state'));
    await waitForNetworkIdle(page);

    // Verify board reloaded (count should be same or updated)
    const newStoryCards = page.locator('.rounded-lg.border-2.p-3');
    const newCount = await newStoryCards.count();
    expect(newCount).toBeGreaterThanOrEqual(0);

    // Verify no error message
    const errorMessage = page.locator('.text-red-600');
    const errorCount = await errorMessage.count();
    expect(errorCount).toBe(0);
  });

  test('should display BACKLOG stories grouped by milestone', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Find BACKLOG column content
    const backlogColumn = page.locator('h2:has-text("BACKLOG")').locator('../..');

    // Check if milestone headings exist (h3 with text-sm font-medium)
    const milestoneHeadings = backlogColumn.locator('h3.text-sm.font-medium');
    const milestoneCount = await milestoneHeadings.count();

    if (milestoneCount > 0) {
      // Verify at least one milestone heading is visible
      await expect(milestoneHeadings.first()).toBeVisible();

      // Verify milestone text is meaningful (not empty)
      const milestoneText = await milestoneHeadings.first().textContent();
      expect(milestoneText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should display empty state for empty columns', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Check each column for empty state message
    const columns = [
      { name: 'BACKLOG', message: 'No stories in backlog' },
      { name: 'TODO', message: 'No story in TODO' },
      { name: 'IN PROGRESS', message: 'No story in progress' },
      { name: 'DONE', message: 'No completed stories' },
    ];

    for (const column of columns) {
      const columnElement = page.locator(`h2:has-text("${column.name}")`).locator('../..');
      const storyCards = columnElement.locator('.rounded-lg.border-2.p-3');
      const storyCount = await storyCards.count();

      if (storyCount === 0) {
        // Verify empty state message is shown
        await expect(columnElement).toContainText(column.message);
      }
    }
  });

  test('should display story metadata (ID, title, points, milestone)', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Get all story cards
    const storyCards = page.locator('.rounded-lg.border-2.p-3');
    const storyCount = await storyCards.count();

    if (storyCount > 0) {
      const firstStory = storyCards.first();

      // Verify story ID (h3 with text-sm font-semibold)
      const storyId = firstStory.locator('h3.text-sm.font-semibold');
      await expect(storyId).toBeVisible();
      const idText = await storyId.textContent();
      expect(idText?.trim().length).toBeGreaterThan(0);

      // Verify story title (p with line-clamp-2)
      const storyTitle = firstStory.locator('p.line-clamp-2');
      await expect(storyTitle).toBeVisible();
      const titleText = await storyTitle.textContent();
      expect(titleText?.trim().length).toBeGreaterThan(0);

      // Verify story points (span with rounded-full)
      const pointsBadge = firstStory.locator('span.rounded-full');
      await expect(pointsBadge).toBeVisible();
      const pointsText = await pointsBadge.textContent();
      expect(pointsText?.trim()).toMatch(/^\d+$/);

      // Check if milestone badge exists (not all stories have it)
      const milestoneBadge = firstStory.locator('span.rounded.px-1');
      const hasMilestone = (await milestoneBadge.count()) > 0;
      if (hasMilestone) {
        await expect(milestoneBadge).toBeVisible();
      }
    }
  });

  test('should apply correct color coding to story cards', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Get story cards from each column
    const backlogCards = page
      .locator('h2:has-text("BACKLOG")')
      .locator('../..')
      .locator('.rounded-lg.border-2');
    const todoCards = page.locator('h2:has-text("TODO")').locator('../..').locator('.rounded-lg.border-2');
    const inProgressCards = page
      .locator('h2:has-text("IN PROGRESS")')
      .locator('../..')
      .locator('.rounded-lg.border-2');
    const doneCards = page.locator('h2:has-text("DONE")').locator('../..').locator('.rounded-lg.border-2');

    // Check BACKLOG cards (gray border)
    const backlogCount = await backlogCards.count();
    if (backlogCount > 0) {
      const backlogClass = await backlogCards.first().getAttribute('class');
      expect(backlogClass).toMatch(/border-gray/);
    }

    // Check TODO cards (blue border and background)
    const todoCount = await todoCards.count();
    if (todoCount > 0) {
      const todoClass = await todoCards.first().getAttribute('class');
      expect(todoClass).toMatch(/border-blue/);
      expect(todoClass).toMatch(/bg-blue/);
    }

    // Check IN PROGRESS cards (yellow border and background)
    const inProgressCount = await inProgressCards.count();
    if (inProgressCount > 0) {
      const inProgressClass = await inProgressCards.first().getAttribute('class');
      expect(inProgressClass).toMatch(/border-yellow/);
      expect(inProgressClass).toMatch(/bg-yellow/);
    }

    // Check DONE cards (green border and background)
    const doneCount = await doneCards.count();
    if (doneCount > 0) {
      const doneClass = await doneCards.first().getAttribute('class');
      expect(doneClass).toMatch(/border-green/);
      expect(doneClass).toMatch(/bg-green/);
    }
  });

  test('should handle loading state', async ({ page }) => {
    // Reload page to see loading state
    await page.goto('/kanban');

    // Check for loading spinner (during initial load)
    const loadingSpinner = page.locator('.animate-spin');
    const loadingText = page.locator('text=Loading workflow status...');

    // Loading state might appear briefly
    const isLoadingVisible = await loadingSpinner.isVisible().catch(() => false);

    if (isLoadingVisible) {
      await expect(loadingSpinner).toBeVisible();
      await expect(loadingText).toBeVisible();
    }

    // Wait for content to load
    await waitForNetworkIdle(page);

    // Verify loading state is gone
    await expect(loadingSpinner).not.toBeVisible();
  });

  test('should handle error state with retry button', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/state', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Internal server error' }),
      });
    });

    // Navigate to page
    await page.goto('/kanban');
    await waitForNetworkIdle(page);

    // Verify error message is shown
    const errorContainer = page.locator('.border-red-500');
    await expect(errorContainer).toBeVisible();
    await expect(errorContainer).toContainText('Error');
    await expect(errorContainer).toContainText('Internal server error');

    // Verify retry button exists
    const retryButton = page.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
  });

  test('should not have console errors on normal load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/kanban');
    await waitForNetworkIdle(page);

    // Filter out known/expected errors (if any)
    const unexpectedErrors = errors.filter(
      (error) =>
        !error.includes('favicon') && // Ignore favicon errors
        !error.includes('404') // Ignore 404s for optional resources
    );

    // Verify no unexpected console errors
    expect(unexpectedErrors.length).toBe(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport (iPhone 12)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/kanban');
    await waitForNetworkIdle(page);

    // Verify page is still usable
    await expect(page.locator('h1')).toBeVisible();

    // Verify statistics panel adapts to mobile (2 columns)
    const statsPanel = page.locator('.grid').first();
    await expect(statsPanel).toBeVisible();

    // Verify Kanban columns are stacked (1 column on mobile)
    const kanbanGrid = page.locator('.grid').nth(1);
    await expect(kanbanGrid).toBeVisible();

    // Verify all column headers are accessible
    await expect(page.locator('h2:has-text("BACKLOG")')).toBeVisible();
    await expect(page.locator('h2:has-text("TODO")')).toBeVisible();
    await expect(page.locator('h2:has-text("IN PROGRESS")')).toBeVisible();
    await expect(page.locator('h2:has-text("DONE")')).toBeVisible();

    // Verify refresh button is accessible
    await expect(page.locator('button:has-text("Refresh Status")')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/kanban');
    await waitForNetworkIdle(page);

    // Verify page loads correctly
    await expect(page.locator('h1')).toBeVisible();

    // Verify Kanban board is visible with 2 columns on tablet
    const kanbanGrid = page.locator('.grid').nth(1);
    await expect(kanbanGrid).toBeVisible();
  });

  test('should calculate and display total points correctly', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Get Total Points stat card
    const totalPointsCard = page.locator('text=Total Points').locator('..').locator('..');
    await expect(totalPointsCard).toBeVisible();

    // Extract points value
    const pointsText = await totalPointsCard.locator('.text-2xl.font-bold').textContent();
    const points = parseInt(pointsText?.trim() || '0');

    // Verify points is a non-negative number
    expect(points).toBeGreaterThanOrEqual(0);

    // Verify points matches DONE column total
    const doneHeader = page.locator('h2:has-text("DONE")').locator('..');
    const doneText = await doneHeader.textContent();
    const donePointsMatch = doneText?.match(/(\d+) pts/);

    if (donePointsMatch) {
      const donePoints = parseInt(donePointsMatch[1]);
      expect(points).toBe(donePoints);
    }
  });

  test('should display DONE column with scrollable content', async ({ page }) => {
    // Wait for API response
    await page.waitForResponse((response) => response.url().includes('/api/state'));

    // Find DONE column content area
    const doneColumn = page.locator('h2:has-text("DONE")').locator('../..');
    const doneContent = doneColumn.locator('.overflow-y-auto');

    // Verify scrollable area exists
    await expect(doneContent).toBeVisible();

    // Check if max-height style is applied
    const styleAttr = await doneContent.getAttribute('style');
    expect(styleAttr).toContain('max-height');
  });
});

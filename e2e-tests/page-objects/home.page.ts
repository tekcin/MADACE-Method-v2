/**
 * Page Object Model for Home Page
 *
 * Encapsulates all interactions with the Home page at /
 */

import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Navigation
  readonly navigationBar: Locator;
  readonly homeLink: Locator;
  readonly setupLink: Locator;
  readonly agentsLink: Locator;
  readonly settingsLink: Locator;

  // Hero section
  readonly heroTitle: Locator;
  readonly heroDescription: Locator;
  readonly getStartedButton: Locator;

  // Feature cards
  readonly featureCards: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.navigationBar = page.locator('nav');
    this.homeLink = page.locator('a[href="/"]').first();
    this.setupLink = page.locator('a[href="/setup"]');
    this.agentsLink = page.locator('a[href="/agents"]');
    this.settingsLink = page.locator('a[href="/settings"]');

    // Hero section
    this.heroTitle = page.locator('h1').first();
    this.heroDescription = page.locator('[data-testid="hero-description"]');
    this.getStartedButton = page.locator('button:has-text("Get Started")');

    // Feature cards
    this.featureCards = page.locator('[data-testid^="feature-card-"]');
  }

  /**
   * Navigate to the Home page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Setup page via navigation
   */
  async goToSetup() {
    await this.setupLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Agents page via navigation
   */
  async goToAgents() {
    await this.agentsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Settings page via navigation
   */
  async goToSettings() {
    await this.settingsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Get Started button
   */
  async clickGetStarted() {
    await this.getStartedButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify home page loaded correctly
   */
  async expectHomePageLoaded() {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroTitle).toContainText('MADACE');
    await expect(this.navigationBar).toBeVisible();
  }

  /**
   * Verify navigation links are present
   */
  async expectNavigationLinks() {
    await expect(this.setupLink).toBeVisible();
    await expect(this.agentsLink).toBeVisible();
    await expect(this.settingsLink).toBeVisible();
  }
}

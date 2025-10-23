/**
 * E2E Tests for LLM Integration
 *
 * Tests LLM connection, configuration, and API interactions
 */

import { test, expect } from '@playwright/test';
import { testLLMConfigs } from './fixtures/test-data';

test.describe('LLM Integration', () => {
  test('API endpoint accepts LLM test requests', async ({ request }) => {
    // ARRANGE
    const testRequest = {
      provider: testLLMConfigs.gemini.provider,
      apiKey: testLLMConfigs.gemini.apiKey,
      model: testLLMConfigs.gemini.model,
      testPrompt: 'Hello, test!',
    };

    // ACT
    const response = await request.post('http://localhost:3000/api/llm/test', {
      data: testRequest,
    });

    // ASSERT
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('provider');
  });

  test('API validates required fields for LLM test', async ({ request }) => {
    // ARRANGE - Missing API key
    const invalidRequest = {
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      // apiKey is missing
    };

    // ACT
    const response = await request.post('http://localhost:3000/api/llm/test', {
      data: invalidRequest,
    });

    // ASSERT
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('API supports all LLM providers', async ({ request }) => {
    const providers = [
      testLLMConfigs.gemini,
      testLLMConfigs.claude,
      testLLMConfigs.openai,
      testLLMConfigs.local,
    ];

    for (const config of providers) {
      // ARRANGE
      const testRequest = {
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model,
        testPrompt: `Test for ${config.provider}`,
      };

      // ACT
      const response = await request.post('http://localhost:3000/api/llm/test', {
        data: testRequest,
      });

      // ASSERT
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.provider).toBe(config.provider);
    }
  });

  test('invalid provider returns error', async ({ request }) => {
    // ARRANGE
    const invalidRequest = {
      provider: 'invalid-provider',
      apiKey: 'test-key',
      model: 'test-model',
    };

    // ACT
    const response = await request.post('http://localhost:3000/api/llm/test', {
      data: invalidRequest,
    });

    // ASSERT
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('LLM test page loads correctly', async ({ page }) => {
    // ARRANGE & ACT
    await page.goto('/llm-test');
    await page.waitForLoadState('networkidle');

    // ASSERT
    await expect(page.locator('h1')).toContainText('LLM Test');
  });

  test('LLM test page allows provider selection', async ({ page }) => {
    // ARRANGE
    await page.goto('/llm-test');

    // ACT
    const providerSelect = page.locator('select[name="provider"]');
    await providerSelect.selectOption('gemini');

    // ASSERT
    await expect(providerSelect).toHaveValue('gemini');
  });

  test('LLM test page validates API key input', async ({ page }) => {
    // ARRANGE
    await page.goto('/llm-test');

    // ACT - Fill form
    await page.locator('select[name="provider"]').selectOption('gemini');
    await page.locator('input[name="apiKey"]').fill('test-api-key');
    await page.locator('select[name="model"]').selectOption('gemini-2.0-flash-exp');
    await page.locator('textarea[name="prompt"]').fill('Test prompt');

    // Submit form
    await page.locator('button:has-text("Test Connection")').click();

    // ASSERT - Should show result (success or error)
    const result = page.locator('[data-testid="test-result"]');
    await expect(result).toBeVisible({ timeout: 10000 });
  });
});

test.describe('LLM Configuration API', () => {
  test('GET /api/llm/config returns current configuration', async ({ request }) => {
    // ACT
    const response = await request.get('http://localhost:3000/api/llm/config');

    // ASSERT
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('provider');
    expect(data).toHaveProperty('model');
  });

  test('POST /api/llm/config updates configuration', async ({ request }) => {
    // ARRANGE
    const newConfig = {
      provider: testLLMConfigs.gemini.provider,
      apiKey: testLLMConfigs.gemini.apiKey,
      model: testLLMConfigs.gemini.model,
    };

    // ACT
    const response = await request.post('http://localhost:3000/api/llm/config', {
      data: newConfig,
    });

    // ASSERT
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
  });
});

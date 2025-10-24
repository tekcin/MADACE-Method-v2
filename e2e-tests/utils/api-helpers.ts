/**
 * API Testing Helpers for Playwright E2E Tests
 *
 * Utilities for testing API endpoints directly within E2E tests
 */

import { Page, APIRequestContext, expect } from '@playwright/test';

export interface APITestOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface APIResponse<T = any> {
  status: number;
  statusText: string;
  ok: boolean;
  data: T;
  headers: Record<string, string>;
}

/**
 * Make API request and return typed response
 */
export async function apiRequest<T = any>(
  context: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  options: {
    data?: any;
    params?: Record<string, string>;
    headers?: Record<string, string>;
  } = {}
): Promise<APIResponse<T>> {
  const { data, params, headers } = options;

  const response = await context.fetch(url, {
    method,
    data: data ? JSON.stringify(data) : undefined,
    params,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  const responseData = await response.json().catch(() => null);

  return {
    status: response.status(),
    statusText: response.statusText(),
    ok: response.ok(),
    data: responseData,
    headers: response.headers(),
  };
}

/**
 * Test GET endpoint
 */
export async function testGET<T = any>(
  context: APIRequestContext,
  url: string,
  expectedStatus = 200
): Promise<APIResponse<T>> {
  const response = await apiRequest<T>(context, 'GET', url);
  expect(response.status).toBe(expectedStatus);
  return response;
}

/**
 * Test POST endpoint
 */
export async function testPOST<T = any>(
  context: APIRequestContext,
  url: string,
  data: any,
  expectedStatus = 200
): Promise<APIResponse<T>> {
  const response = await apiRequest<T>(context, 'POST', url, { data });
  expect(response.status).toBe(expectedStatus);
  return response;
}

/**
 * Test PUT endpoint
 */
export async function testPUT<T = any>(
  context: APIRequestContext,
  url: string,
  data: any,
  expectedStatus = 200
): Promise<APIResponse<T>> {
  const response = await apiRequest<T>(context, 'PUT', url, { data });
  expect(response.status).toBe(expectedStatus);
  return response;
}

/**
 * Test DELETE endpoint
 */
export async function testDELETE<T = any>(
  context: APIRequestContext,
  url: string,
  expectedStatus = 200
): Promise<APIResponse<T>> {
  const response = await apiRequest<T>(context, 'DELETE', url);
  expect(response.status).toBe(expectedStatus);
  return response;
}

/**
 * Test API endpoint with retry
 */
export async function testAPIWithRetry<T = any>(
  context: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options: {
    data?: any;
    maxAttempts?: number;
    delay?: number;
    expectedStatus?: number;
  } = {}
): Promise<APIResponse<T>> {
  const { data, maxAttempts = 3, delay = 1000, expectedStatus = 200 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await apiRequest<T>(context, method, url, { data });
      if (response.status === expectedStatus) {
        return response;
      }
      if (attempt === maxAttempts) {
        throw new Error(
          `Expected status ${expectedStatus}, got ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error('API request failed after retries');
}

/**
 * Validate API response schema
 */
export function validateResponseSchema<T>(
  response: APIResponse<T>,
  schema: {
    requiredFields: string[];
    optionalFields?: string[];
    types?: Record<string, string>;
  }
): void {
  const { requiredFields, optionalFields = [], types = {} } = schema;

  // Check required fields
  for (const field of requiredFields) {
    expect(response.data).toHaveProperty(field);
  }

  // Check types if specified
  for (const [field, expectedType] of Object.entries(types)) {
    if (response.data[field] !== undefined) {
      expect(typeof response.data[field]).toBe(expectedType);
    }
  }
}

/**
 * Test pagination endpoint
 */
export async function testPaginatedEndpoint(
  context: APIRequestContext,
  url: string,
  options: {
    pageSize?: number;
    totalExpected?: number;
  } = {}
): Promise<void> {
  const { pageSize = 10, totalExpected } = options;

  let page = 1;
  let allItems: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const response = await testGET(context, `${url}?page=${page}&limit=${pageSize}`);
    const items = response.data.items || response.data;

    if (!Array.isArray(items)) {
      throw new Error('Expected array response for paginated endpoint');
    }

    allItems = [...allItems, ...items];
    hasMore = items.length === pageSize;
    page++;

    // Safety limit
    if (page > 100) {
      throw new Error('Pagination safety limit reached (100 pages)');
    }
  }

  if (totalExpected !== undefined) {
    expect(allItems.length).toBe(totalExpected);
  }
}

/**
 * Test API error handling
 */
export async function testAPIError(
  context: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  expectedStatus: number,
  expectedErrorMessage?: string | RegExp
): Promise<void> {
  const response = await apiRequest(context, method, url);

  expect(response.status).toBe(expectedStatus);

  if (expectedErrorMessage) {
    const errorMessage = response.data?.error || response.data?.message || '';
    if (typeof expectedErrorMessage === 'string') {
      expect(errorMessage).toContain(expectedErrorMessage);
    } else {
      expect(errorMessage).toMatch(expectedErrorMessage);
    }
  }
}

/**
 * Test CRUD operations for a resource
 */
export async function testCRUDOperations(
  context: APIRequestContext,
  baseUrl: string,
  createData: any,
  updateData: any,
  options: {
    idField?: string;
    customAssertions?: (data: any) => void;
  } = {}
): Promise<void> {
  const { idField = 'id', customAssertions } = options;

  // CREATE
  const createResponse = await testPOST(context, baseUrl, createData, 201);
  expect(createResponse.data).toHaveProperty(idField);
  const resourceId = createResponse.data[idField];

  // READ
  const readResponse = await testGET(context, `${baseUrl}/${resourceId}`);
  expect(readResponse.data[idField]).toBe(resourceId);
  if (customAssertions) {
    customAssertions(readResponse.data);
  }

  // UPDATE
  const updateResponse = await testPUT(
    context,
    `${baseUrl}/${resourceId}`,
    updateData
  );
  expect(updateResponse.ok).toBe(true);

  // READ after UPDATE
  const updatedReadResponse = await testGET(context, `${baseUrl}/${resourceId}`);
  for (const [key, value] of Object.entries(updateData)) {
    expect(updatedReadResponse.data[key]).toBe(value);
  }

  // DELETE
  await testDELETE(context, `${baseUrl}/${resourceId}`, 204);

  // Verify DELETE (should return 404)
  const deletedResponse = await apiRequest(
    context,
    'GET',
    `${baseUrl}/${resourceId}`
  );
  expect(deletedResponse.status).toBe(404);
}

/**
 * Intercept and modify API requests
 */
export async function interceptAPI(
  page: Page,
  urlPattern: string | RegExp,
  modifier: (request: any) => any | Promise<any>
): Promise<void> {
  await page.route(urlPattern, async (route) => {
    const request = route.request();
    const modifiedData = await modifier({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postDataJSON(),
    });

    if (modifiedData === null) {
      // Cancel request
      await route.abort();
    } else if (modifiedData === undefined) {
      // Continue unchanged
      await route.continue();
    } else {
      // Modify response
      await route.fulfill({
        status: modifiedData.status || 200,
        contentType: 'application/json',
        body: JSON.stringify(modifiedData.body || modifiedData),
      });
    }
  });
}

/**
 * Wait for multiple API calls to complete
 */
export async function waitForMultipleAPICalls(
  page: Page,
  patterns: Array<string | RegExp>,
  timeout = 10000
): Promise<void> {
  const promises = patterns.map((pattern) =>
    page.waitForResponse(
      (resp) =>
        typeof pattern === 'string'
          ? resp.url().includes(pattern)
          : pattern.test(resp.url()),
      { timeout }
    )
  );

  await Promise.all(promises);
}

/**
 * Get API response time
 */
export async function measureAPIPerformance(
  context: APIRequestContext,
  method: 'GET' | 'POST',
  url: string,
  data?: any
): Promise<{ duration: number; response: APIResponse }> {
  const start = Date.now();
  const response = await apiRequest(context, method, url, { data });
  const duration = Date.now() - start;

  return { duration, response };
}

/**
 * Load test an API endpoint (simple version)
 */
export async function simpleLoadTest(
  context: APIRequestContext,
  url: string,
  options: {
    requests?: number;
    concurrency?: number;
  } = {}
): Promise<{
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
}> {
  const { requests = 10, concurrency = 3 } = options;

  const results: { success: boolean; duration: number }[] = [];

  // Run requests in batches
  for (let i = 0; i < requests; i += concurrency) {
    const batch = Array.from({ length: Math.min(concurrency, requests - i) }).map(
      async () => {
        const start = Date.now();
        try {
          const response = await apiRequest(context, 'GET', url);
          const duration = Date.now() - start;
          return { success: response.ok, duration };
        } catch {
          return { success: false, duration: Date.now() - start };
        }
      }
    );

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }

  const successfulRequests = results.filter((r) => r.success).length;
  const durations = results.map((r) => r.duration);

  return {
    totalRequests: results.length,
    successfulRequests,
    failedRequests: results.length - successfulRequests,
    avgResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
    minResponseTime: Math.min(...durations),
    maxResponseTime: Math.max(...durations),
  };
}

/**
 * Prisma Mock Setup for Jest Tests
 *
 * Provides mock implementations of Prisma Client for unit tests
 *
 * Usage:
 * import { setupPrismaMock, prismaMock } from '@/__tests__/setup/prisma-mock';
 *
 * // At the top of your test file:
 * setupPrismaMock();
 *
 * // Then in your tests:
 * prismaMock.agent.findMany.mockResolvedValue([...]);
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Export type for use in tests
export type PrismaMockType = DeepMockProxy<PrismaClient>;

/**
 * Setup Prisma mock for a test file
 * Call this at the top of your test file before describe()
 */
export function setupPrismaMock() {
  // Mock the prisma client module
  jest.mock('@/lib/database/client', () => ({
    __esModule: true,
    prisma: prismaMock,
  }));

  // Reset mock before each test
  beforeEach(() => {
    mockReset(prismaMock);
  });
}

export default prismaMock;

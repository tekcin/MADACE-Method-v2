/**
 * Prisma Client Singleton
 *
 * Ensures only one Prisma Client instance is created in development to avoid
 * connection exhaustion during hot reloading.
 *
 * In production, a new instance is created for each deployment.
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `var` declarations for Prisma singleton

  var prisma: PrismaClient | undefined;
}

/**
 * Global Prisma Client instance
 *
 * Configuration:
 * - log: [] in test (disable all logging for clean test output)
 * - log: ['error'] in production
 * - log: ['query', 'warn', 'error'] in development
 */
export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'test'
        ? []
        : process.env.NODE_ENV === 'production'
          ? ['error']
          : ['query', 'warn', 'error'],
  });

// In development, store the Prisma client globally to reuse across hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Disconnect from database (use for graceful shutdown)
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Connect to database explicitly (usually not needed - Prisma auto-connects)
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

/**
 * Check if database connection is healthy
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

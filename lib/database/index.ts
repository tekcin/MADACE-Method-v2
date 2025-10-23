/**
 * Database Module
 *
 * Exports Prisma client singleton and database utility functions.
 */

// Export Prisma client singleton
export { prisma, connectDatabase, disconnectDatabase, isDatabaseHealthy } from './client';

// Export database utility functions
export {
  DatabaseError,
  handlePrismaError,
  paginate,
  transaction,
  exists,
  softDelete,
  batchUpsert,
  getDatabaseStats,
  clearDatabase,
  search,
} from './utils';

// Re-export Prisma types for convenience
export type { PrismaClient } from '@prisma/client';

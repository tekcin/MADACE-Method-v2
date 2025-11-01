/**
 * Database Utility Functions
 *
 * Common database operations, error handling, and helper functions.
 */

import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './client';

/**
 * Custom database error with additional context
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'DatabaseError';

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

/**
 * Handle Prisma errors and convert to user-friendly messages
 */
export function handlePrismaError(error: unknown, operation: string): DatabaseError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === 'P2002') {
      const fields = (error.meta?.target as string[]) || [];
      return new DatabaseError(
        `A record with the same ${fields.join(', ')} already exists.`,
        error,
        operation
      );
    }

    // P2025: Record not found
    if (error.code === 'P2025') {
      return new DatabaseError('The requested record was not found.', error, operation);
    }

    // P2003: Foreign key constraint violation
    if (error.code === 'P2003') {
      return new DatabaseError(
        'Cannot perform operation due to related records.',
        error,
        operation
      );
    }

    // P2014: Invalid relation reference
    if (error.code === 'P2014') {
      return new DatabaseError('Invalid relationship between records.', error, operation);
    }

    // Generic Prisma error
    return new DatabaseError(`Database operation failed: ${error.message}`, error, operation);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new DatabaseError('Invalid data provided to database operation.', error, operation);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new DatabaseError(
      'Failed to connect to database. Please check your DATABASE_URL.',
      error,
      operation
    );
  }

  // Unknown error
  return new DatabaseError(
    `Unexpected error during ${operation}: ${error instanceof Error ? error.message : String(error)}`,
    error,
    operation
  );
}

/**
 * Paginated query helper
 *
 * @param model - Prisma model delegate (e.g., prisma.agent)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param where - Optional where clause
 * @param orderBy - Optional order by clause
 */
export async function paginate<
  T extends {
    findMany: (args: {
      where?: unknown;
      orderBy?: unknown;
      skip: number;
      take: number;
    }) => Promise<unknown[]>;
    count: (args: { where?: unknown }) => Promise<number>;
  },
  TData = unknown,
>(
  model: T,
  page: number = 1,
  pageSize: number = 10,
  where?: unknown,
  orderBy?: unknown
): Promise<{
  data: TData[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [data, totalRecords] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return {
    data: data as TData[],
    pagination: {
      page,
      pageSize,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Transaction helper with automatic rollback on error
 *
 * @param callback - Function to execute within transaction
 */
export async function transaction<T>(
  callback: (
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    throw handlePrismaError(error, 'transaction');
  }
}

/**
 * Check if a record exists by ID
 *
 * @param model - Prisma model delegate
 * @param id - Record ID
 */
export async function exists<
  T extends {
    findUnique: (args: { where: { id: string }; select: { id: true } }) => Promise<{ id: string } | null>;
  },
>(model: T, id: string): Promise<boolean> {
  try {
    const record = await model.findUnique({
      where: { id },
      select: { id: true },
    });
    return record !== null;
  } catch (error) {
    throw handlePrismaError(error, 'exists check');
  }
}

/**
 * Soft delete helper (updates deletedAt timestamp)
 * Note: Requires `deletedAt` field in schema
 *
 * @param model - Prisma model delegate
 * @param id - Record ID
 */
export async function softDelete<
  T extends {
    update: (args: { where: { id: string }; data: { deletedAt: Date } }) => Promise<unknown>;
  },
>(model: T, id: string): Promise<void> {
  try {
    await model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    throw handlePrismaError(error, 'soft delete');
  }
}

/**
 * Batch upsert helper
 *
 * @param model - Prisma model delegate
 * @param records - Array of records with unique field and data
 */
export async function batchUpsert<
  T extends {
    upsert: (args: { where: unknown; create: unknown; update: unknown }) => Promise<unknown>;
  },
>(
  model: T,
  records: Array<{
    where: unknown;
    create: unknown;
    update: unknown;
  }>
): Promise<void> {
  try {
    await prisma.$transaction(
      records.map((record) =>
        model.upsert({
          where: record.where,
          create: record.create,
          update: record.update,
        })
      ) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  } catch (error) {
    throw handlePrismaError(error, 'batch upsert');
  }
}

/**
 * Get database statistics (record counts)
 */
export async function getDatabaseStats(): Promise<{
  agents: number;
  agentMemories: number;
  workflows: number;
  configs: number;
  stateMachines: number;
  projects: number;
  users: number;
  projectMembers: number;
}> {
  try {
    const [
      agents,
      agentMemories,
      workflows,
      configs,
      stateMachines,
      projects,
      users,
      projectMembers,
    ] = await Promise.all([
      prisma.agent.count(),
      prisma.agentMemory.count(),
      prisma.workflow.count(),
      prisma.config.count(),
      prisma.stateMachine.count(),
      prisma.project.count(),
      prisma.user.count(),
      prisma.projectMember.count(),
    ]);

    return {
      agents,
      agentMemories,
      workflows,
      configs,
      stateMachines,
      projects,
      users,
      projectMembers,
    };
  } catch (error) {
    throw handlePrismaError(error, 'get database stats');
  }
}

/**
 * Clear all data from database (USE WITH CAUTION - for testing only)
 */
export async function clearDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear database in production environment');
  }

  try {
    await prisma.$transaction([
      // Delete in correct order to respect foreign key constraints
      prisma.agentMemory.deleteMany(),
      prisma.projectMember.deleteMany(),
      prisma.stateMachine.deleteMany(),
      prisma.workflow.deleteMany(),
      prisma.config.deleteMany(),
      prisma.agent.deleteMany(),
      prisma.project.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  } catch (error) {
    throw handlePrismaError(error, 'clear database');
  }
}

/**
 * Search helper with fuzzy matching (case-insensitive)
 *
 * @param model - Prisma model delegate
 * @param field - Field to search
 * @param query - Search query
 */
export async function search<
  T extends {
    findMany: (args: { where: Record<string, unknown> }) => Promise<unknown[]>;
  },
  TData = unknown,
>(model: T, field: string, query: string): Promise<TData[]> {
  try {
    const results = await model.findMany({
      where: {
        [field]: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
    return results as TData[];
  } catch (error) {
    throw handlePrismaError(error, 'search');
  }
}

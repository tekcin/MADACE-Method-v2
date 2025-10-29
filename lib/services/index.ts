/**
 * Services Module
 *
 * Business logic layer for all database operations.
 */

// Export agent service
export * from './agent-service';

// Re-export DatabaseError for convenience
export { DatabaseError } from '@/lib/database';

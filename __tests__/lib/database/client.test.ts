/**
 * Database Client Tests
 *
 * Tests for Prisma client singleton and database utility functions
 */

import {
  prisma,
  isDatabaseHealthy,
  connectDatabase,
  disconnectDatabase,
} from '@/lib/database/client';

describe('Database Client', () => {
  describe('Prisma Client Singleton', () => {
    it('should export a prisma client instance', () => {
      expect(prisma).toBeDefined();
      expect(prisma.$connect).toBeDefined();
      expect(prisma.$disconnect).toBeDefined();
    });

    it('should have agent model methods', () => {
      expect(prisma.agent).toBeDefined();
      expect(prisma.agent.create).toBeDefined();
      expect(prisma.agent.findUnique).toBeDefined();
      expect(prisma.agent.findMany).toBeDefined();
      expect(prisma.agent.update).toBeDefined();
      expect(prisma.agent.delete).toBeDefined();
    });

    it('should have all models defined', () => {
      expect(prisma.agent).toBeDefined();
      expect(prisma.agentMemory).toBeDefined();
      expect(prisma.workflow).toBeDefined();
      expect(prisma.config).toBeDefined();
      expect(prisma.stateMachine).toBeDefined();
      expect(prisma.project).toBeDefined();
      expect(prisma.user).toBeDefined();
      expect(prisma.projectMember).toBeDefined();
    });
  });

  describe('Database Health Check', () => {
    it('should check database health', async () => {
      const isHealthy = await isDatabaseHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });

    it('should return true for healthy database', async () => {
      // This test assumes database is properly set up
      const isHealthy = await isDatabaseHealthy();
      expect(isHealthy).toBe(true);
    });
  });

  describe('Database Connection', () => {
    it('should connect to database explicitly', async () => {
      // Prisma auto-connects, but we can test explicit connect
      await expect(connectDatabase()).resolves.not.toThrow();
    });

    it('should disconnect from database', async () => {
      await expect(disconnectDatabase()).resolves.not.toThrow();

      // Reconnect for other tests
      await connectDatabase();
    });
  });

  describe('Prisma Query Raw', () => {
    it('should execute raw SQL queries', async () => {
      const result = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

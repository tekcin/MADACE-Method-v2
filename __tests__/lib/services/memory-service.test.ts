/**
 * Memory Service Tests
 *
 * Tests for agent memory CRUD operations, search, and statistics
 */

import { prisma } from '@/lib/database/client';
import {
  saveMemory,
  getMemories,
  getMemory,
  updateMemory,
  deleteMemory,
  clearMemories,
  trackMemoryAccess,
  trackMemoryAccesses,
  getMemoryCount,
  searchMemories,
  getMemoryStats,
  formatMemoriesForPrompt,
  type MemoryContext,
} from '@/lib/services/memory-service';

describe('Memory Service', () => {
  let agentId: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-memory@example.com',
        name: 'Memory Tester',
      },
    });
    userId = user.id;

    // Create test agent
    const agent = await prisma.agent.create({
      data: {
        name: 'memory-agent',
        title: 'Memory Agent',
        icon: '🧠',
        module: 'test',
        version: '1.0.0',
        persona: { role: 'assistant' },
        menu: [],
        prompts: [],
      },
    });
    agentId = agent.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.agentMemory.deleteMany({ where: { agentId } });
    await prisma.agent.deleteMany({ where: { id: agentId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  describe('saveMemory', () => {
    it('should save a new memory', async () => {
      const memory: MemoryContext = {
        type: 'long-term',
        category: 'user_preference',
        key: 'communication_style',
        value: 'concise',
        importance: 8,
        source: 'user_input',
      };

      const saved = await saveMemory(agentId, userId, memory);

      expect(saved).toBeDefined();
      expect(saved.agentId).toBe(agentId);
      expect(saved.userId).toBe(userId);
      expect(saved.key).toBe('communication_style');
      expect(saved.value).toBe('concise');
      expect(saved.importance).toBe(8);
    });

    it('should save memory with default values', async () => {
      const memory: MemoryContext = {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      };

      const saved = await saveMemory(agentId, userId, memory);

      expect(saved.source).toBe('inferred_from_chat');
      expect(saved.expiresAt).toBeNull();
    });
  });

  describe('getMemories', () => {
    beforeEach(async () => {
      // Create test memories
      await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_preference',
        key: 'style',
        value: 'concise',
        importance: 8,
      });

      await saveMemory(agentId, userId, {
        type: 'short-term',
        category: 'project_context',
        key: 'current_task',
        value: 'implementing memory',
        importance: 6,
      });

      await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      });
    });

    it('should get all memories', async () => {
      const memories = await getMemories(agentId, userId);

      expect(memories.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by type', async () => {
      const longTerm = await getMemories(agentId, userId, { type: 'long-term' });
      const shortTerm = await getMemories(agentId, userId, { type: 'short-term' });

      expect(longTerm.every((m) => m.type === 'long-term')).toBe(true);
      expect(shortTerm.every((m) => m.type === 'short-term')).toBe(true);
    });

    it('should filter by category', async () => {
      const preferences = await getMemories(agentId, userId, { category: 'user_preference' });

      expect(preferences.every((m) => m.category === 'user_preference')).toBe(true);
    });

    it('should filter by minimum importance', async () => {
      const important = await getMemories(agentId, userId, { minImportance: 8 });

      expect(important.every((m) => m.importance >= 8)).toBe(true);
    });

    it('should limit results', async () => {
      const memories = await getMemories(agentId, userId, { limit: 2 });

      expect(memories.length).toBeLessThanOrEqual(2);
    });

    it('should order by importance', async () => {
      const memories = await getMemories(agentId, userId, {
        orderBy: 'importance',
        order: 'desc',
      });

      for (let i = 1; i < memories.length; i++) {
        expect(memories[i]?.importance).toBeLessThanOrEqual(memories[i - 1]?.importance ?? 0);
      }
    });
  });

  describe('getMemory', () => {
    it('should get a single memory', async () => {
      const saved = await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      });

      const retrieved = await getMemory(saved.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(saved.id);
      expect(retrieved?.key).toBe('name');
    });

    it('should return null for non-existent memory', async () => {
      const memory = await getMemory('non-existent-id');

      expect(memory).toBeNull();
    });
  });

  describe('updateMemory', () => {
    it('should update memory importance', async () => {
      const saved = await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 5,
      });

      const updated = await updateMemory(saved.id, { importance: 9 });

      expect(updated.importance).toBe(9);
    });

    it('should update memory value', async () => {
      const saved = await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_preference',
        key: 'style',
        value: 'verbose',
        importance: 7,
      });

      const updated = await updateMemory(saved.id, { value: 'concise' });

      expect(updated.value).toBe('concise');
    });
  });

  describe('deleteMemory', () => {
    it('should delete a memory', async () => {
      const saved = await saveMemory(agentId, userId, {
        type: 'short-term',
        category: 'project_context',
        key: 'temp',
        value: 'test',
        importance: 3,
      });

      await deleteMemory(saved.id);

      const retrieved = await getMemory(saved.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('clearMemories', () => {
    beforeEach(async () => {
      await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      });

      await saveMemory(agentId, userId, {
        type: 'short-term',
        category: 'project_context',
        key: 'task',
        value: 'testing',
        importance: 5,
      });
    });

    it('should clear all memories', async () => {
      const count = await clearMemories(agentId, userId);

      expect(count).toBeGreaterThanOrEqual(2);

      const remaining = await getMemories(agentId, userId);
      expect(remaining.length).toBe(0);
    });

    it('should clear only short-term memories', async () => {
      await clearMemories(agentId, userId, 'short-term');

      const remaining = await getMemories(agentId, userId);
      expect(remaining.every((m) => m.type === 'long-term')).toBe(true);
    });

    it('should clear only long-term memories', async () => {
      await clearMemories(agentId, userId, 'long-term');

      const remaining = await getMemories(agentId, userId);
      expect(remaining.every((m) => m.type === 'short-term')).toBe(true);
    });
  });

  describe('trackMemoryAccess', () => {
    it('should track memory access', async () => {
      const saved = await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      });

      const initialAccessCount = saved.accessCount;
      const initialLastAccessed = saved.lastAccessedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      await trackMemoryAccess(saved.id);

      const updated = await getMemory(saved.id);

      expect(updated?.accessCount).toBe(initialAccessCount + 1);
      expect(updated?.lastAccessedAt.getTime()).toBeGreaterThan(initialLastAccessed.getTime());
    });

    it('should track multiple accesses', async () => {
      const saved1 = await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      });

      const saved2 = await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_preference',
        key: 'style',
        value: 'concise',
        importance: 8,
      });

      await trackMemoryAccesses([saved1.id, saved2.id]);

      const updated1 = await getMemory(saved1.id);
      const updated2 = await getMemory(saved2.id);

      expect(updated1?.accessCount).toBe(1);
      expect(updated2?.accessCount).toBe(1);
    });
  });

  describe('getMemoryCount', () => {
    beforeEach(async () => {
      await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      });

      await saveMemory(agentId, userId, {
        type: 'short-term',
        category: 'project_context',
        key: 'task',
        value: 'testing',
        importance: 5,
      });
    });

    it('should count all memories', async () => {
      const count = await getMemoryCount(agentId, userId);

      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should count only short-term memories', async () => {
      const count = await getMemoryCount(agentId, userId, 'short-term');

      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should count only long-term memories', async () => {
      const count = await getMemoryCount(agentId, userId, 'long-term');

      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('searchMemories', () => {
    beforeEach(async () => {
      await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'favorite_language',
        value: 'TypeScript',
        importance: 8,
      });

      await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'project_context',
        key: 'framework',
        value: 'Next.js',
        importance: 7,
      });
    });

    it('should search memories by key', async () => {
      const results = await searchMemories(agentId, userId, 'language');

      expect(results.some((m) => m.key.includes('language'))).toBe(true);
    });

    it('should search memories by value', async () => {
      const results = await searchMemories(agentId, userId, 'TypeScript');

      expect(results.some((m) => m.value.includes('TypeScript'))).toBe(true);
    });

    it('should return empty array for non-matching query', async () => {
      const results = await searchMemories(agentId, userId, 'nonexistent12345');

      expect(results.length).toBe(0);
    });
  });

  describe('getMemoryStats', () => {
    beforeEach(async () => {
      await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_preference',
        key: 'style',
        value: 'concise',
        importance: 8,
      });

      await saveMemory(agentId, userId, {
        type: 'short-term',
        category: 'project_context',
        key: 'task',
        value: 'testing',
        importance: 6,
      });

      await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      });
    });

    it('should get memory statistics', async () => {
      const stats = await getMemoryStats(agentId, userId);

      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.shortTerm).toBeGreaterThanOrEqual(1);
      expect(stats.longTerm).toBeGreaterThanOrEqual(2);
      expect(stats.avgImportance).toBeGreaterThan(0);
      expect(stats.byCategory['user_preference']).toBeGreaterThanOrEqual(1);
    });
  });

  describe('formatMemoriesForPrompt', () => {
    it('should format memories as natural language', async () => {
      const memory1 = await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_preference',
        key: 'communication_style',
        value: 'concise',
        importance: 8,
      });

      const memory2 = await saveMemory(agentId, userId, {
        type: 'long-term',
        category: 'user_fact',
        key: 'name',
        value: 'Alex',
        importance: 10,
      });

      const formatted = formatMemoriesForPrompt([memory1, memory2]);

      expect(formatted).toContain('User Preferences');
      expect(formatted).toContain('communication_style');
      expect(formatted).toContain('concise');
      expect(formatted).toContain('User Facts');
      expect(formatted).toContain('name');
      expect(formatted).toContain('Alex');
    });

    it('should return message for no memories', () => {
      const formatted = formatMemoriesForPrompt([]);

      expect(formatted).toBe('No previous memories about this user.');
    });
  });
});

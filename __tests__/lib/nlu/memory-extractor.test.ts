/**
 * Memory Extractor Tests
 */

import { extractMemories, extractAndSaveMemories } from '@/lib/nlu/memory-extractor';
import { saveMemory, getMemories, clearMemories } from '@/lib/services/memory-service';
import { prisma } from '@/lib/database/client';

// Mock saveMemory to avoid database writes in some tests
jest.mock('@/lib/services/memory-service', () => ({
  ...jest.requireActual('@/lib/services/memory-service'),
  saveMemory: jest.fn(),
}));

const mockSaveMemory = saveMemory as jest.MockedFunction<typeof saveMemory>;

describe('Memory Extractor', () => {
  beforeEach(() => {
    mockSaveMemory.mockClear();
  });

  describe('extractMemories', () => {
    describe('User Name Extraction', () => {
      it('should extract name from "my name is X"', () => {
        const memories = extractMemories('Hello, my name is Alex');

        const nameFact = memories.find((m) => m.key === 'user_name');
        expect(nameFact).toBeDefined();
        expect(nameFact?.value).toBe('Alex');
        expect(nameFact?.category).toBe('user_fact');
        expect(nameFact?.importance).toBe(10);
      });

      it('should extract name from "I\'m X"', () => {
        const memories = extractMemories("Hi! I'm Sarah");

        const nameFact = memories.find((m) => m.key === 'user_name');
        expect(nameFact).toBeDefined();
        expect(nameFact?.value).toBe('Sarah');
      });

      it('should extract name from "call me X"', () => {
        const memories = extractMemories('You can call me Mike');

        const nameFact = memories.find((m) => m.key === 'user_name');
        expect(nameFact).toBeDefined();
        expect(nameFact?.value).toBe('Mike');
      });
    });

    describe('Work/Project Context Extraction', () => {
      it('should extract project from "I work on X"', () => {
        const memories = extractMemories('I work on an e-commerce platform');

        const projectFact = memories.find((m) => m.key === 'current_project');
        expect(projectFact).toBeDefined();
        expect(projectFact?.value).toBe('an e-commerce platform');
        expect(projectFact?.category).toBe('project_context');
        expect(projectFact?.importance).toBe(8);
      });

      it('should extract project from "I\'m building X"', () => {
        const memories = extractMemories("I'm building a social media app");

        const projectFact = memories.find((m) => m.key === 'current_project');
        expect(projectFact).toBeDefined();
        expect(projectFact?.value).toBe('a social media app');
      });

      it('should extract project from "working on X"', () => {
        const memories = extractMemories('Currently working on API documentation');

        const projectFact = memories.find((m) => m.key === 'current_project');
        expect(projectFact).toBeDefined();
        expect(projectFact?.value).toBe('API documentation');
      });
    });

    describe('Tech Stack Extraction', () => {
      it('should extract tech from "using X"', () => {
        const memories = extractMemories('I am using Next.js for this project');

        const techFact = memories.find((m) => m.key === 'tech_stack');
        expect(techFact).toBeDefined();
        expect(techFact?.value).toMatch(/next/i);
        expect(techFact?.category).toBe('project_context');
        expect(techFact?.importance).toBe(7);
      });

      it('should extract tech from "prefer X"', () => {
        const memories = extractMemories('I prefer TypeScript over JavaScript');

        const techFact = memories.find((m) => m.key === 'tech_stack');
        expect(techFact).toBeDefined();
        expect(techFact?.value).toMatch(/typescript/i);
      });

      it('should extract database tech', () => {
        const memories = extractMemories('We are using PostgreSQL as our database');

        const techFact = memories.find((m) => m.key === 'tech_stack');
        expect(techFact).toBeDefined();
        expect(techFact?.value).toMatch(/postgresql/i);
      });
    });

    describe('Role/Position Extraction', () => {
      it('should extract role from "I\'m a X developer"', () => {
        const memories = extractMemories("I'm a frontend developer");

        const roleFact = memories.find((m) => m.key === 'user_role');
        expect(roleFact).toBeDefined();
        expect(roleFact?.value).toBe('frontend developer');
        expect(roleFact?.category).toBe('user_fact');
        expect(roleFact?.importance).toBe(8);
      });

      it('should extract role from "I work as X"', () => {
        const memories = extractMemories('I work as a software engineer');

        const roleFact = memories.find((m) => m.key === 'user_role');
        expect(roleFact).toBeDefined();
        expect(roleFact?.value).toBe('software engineer');
      });

      it('should extract technical roles', () => {
        const roles = ['architect', 'analyst', 'manager', 'designer'];

        for (const role of roles) {
          const memories = extractMemories(`I am a ${role}`);
          const roleFact = memories.find((m) => m.key === 'user_role');
          expect(roleFact).toBeDefined();
          expect(roleFact?.value).toBe(role);
        }
      });
    });

    describe('Preference Inference', () => {
      it('should infer concise preference from short messages', () => {
        const history = ['ok', 'yes', 'no', 'sure', 'thanks'];
        const memories = extractMemories('got it', history);

        const concisePref = memories.find(
          (m) => m.key === 'communication_style' && m.value === 'concise'
        );
        expect(concisePref).toBeDefined();
        expect(concisePref?.category).toBe('user_preference');
        expect(concisePref?.importance).toBe(6);
      });

      it('should infer detailed preference from long messages', () => {
        const history = [
          'I would like to understand the architecture in detail including all the components and how they interact with each other',
          'Can you explain the entire process from start to finish with all the edge cases and error handling',
        ];
        const memories = extractMemories('Please provide comprehensive documentation', history);

        const detailedPref = memories.find(
          (m) => m.key === 'communication_style' && m.value === 'detailed'
        );
        expect(detailedPref).toBeDefined();
      });

      it('should detect preference for code examples', () => {
        const memories = extractMemories('Can you show me a code example?');

        const examplePref = memories.find((m) => m.key === 'prefers_examples');
        expect(examplePref).toBeDefined();
        expect(examplePref?.value).toBe('true');
        expect(examplePref?.importance).toBe(5);
      });
    });

    describe('Multiple Extractions', () => {
      it('should extract multiple facts from one message', () => {
        const memories = extractMemories(
          "Hi, I'm Alex and I'm working on a Next.js project as a frontend developer"
        );

        expect(memories.length).toBeGreaterThan(1);
        expect(memories.find((m) => m.key === 'user_name')).toBeDefined();
        expect(memories.find((m) => m.key === 'current_project')).toBeDefined();
        expect(memories.find((m) => m.key === 'user_role')).toBeDefined();
      });
    });

    describe('No Extraction Cases', () => {
      it('should return empty array for generic messages', () => {
        const memories = extractMemories('How are you today?');
        expect(memories).toHaveLength(0);
      });

      it('should return empty array for short conversation history', () => {
        const memories = extractMemories('okay', ['first message']);
        // Should not infer preference with only 2 messages
        expect(memories.filter((m) => m.category === 'user_preference')).toHaveLength(0);
      });
    });
  });

  describe('extractAndSaveMemories', () => {
    const testAgentId = 'test-agent-id';
    const testUserId = 'test-user-id';

    beforeEach(() => {
      mockSaveMemory.mockResolvedValue({
        id: 'memory-id',
        agentId: testAgentId,
        userId: testUserId,
        category: 'user_fact',
        key: 'user_name',
        value: 'Test User',
        importance: 10,
        source: 'inferred',
        type: 'long-term',
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 1,
        expiresAt: null,
      });
    });

    it('should save extracted memories to database', async () => {
      const savedCount = await extractAndSaveMemories(
        testAgentId,
        testUserId,
        'My name is Alex and I work on a React project'
      );

      expect(savedCount).toBeGreaterThan(0);
      expect(mockSaveMemory).toHaveBeenCalled();
    });

    it('should save memories as long-term and inferred source', async () => {
      await extractAndSaveMemories(
        testAgentId,
        testUserId,
        'I am a software developer'
      );

      expect(mockSaveMemory).toHaveBeenCalledWith(
        testAgentId,
        testUserId,
        expect.objectContaining({
          type: 'long-term',
          source: 'inferred',
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockSaveMemory.mockRejectedValue(new Error('Database error'));

      const savedCount = await extractAndSaveMemories(
        testAgentId,
        testUserId,
        'My name is Alex'
      );

      // Should return 0 on error, not throw
      expect(savedCount).toBe(0);
    });

    it('should return count of saved memories', async () => {
      const savedCount = await extractAndSaveMemories(
        testAgentId,
        testUserId,
        "I'm Alex, a frontend developer working with React"
      );

      // Should extract at least name and role
      expect(savedCount).toBeGreaterThanOrEqual(2);
    });
  });
});

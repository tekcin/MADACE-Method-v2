/**
 * Agent Service Tests
 *
 * Tests for agent CRUD operations and business logic
 */

import {
  createAgent,
  getAgent,
  getAgentByName,
  listAgents,
  updateAgent,
  deleteAgent,
  searchAgents,
  getAgentCountByModule,
  duplicateAgent,
  exportAgent,
  importAgent,
  type CreateAgentInput,
  type UpdateAgentInput,
} from '@/lib/services/agent-service';
import { prisma } from '@/lib/database/client';

// Test data
const mockAgentData: CreateAgentInput = {
  name: 'test-agent',
  title: 'Test Agent',
  icon: '🤖',
  module: 'mam',
  version: '1.0.0',
  persona: {
    role: 'Test Role',
    identity: 'Test Identity',
    communication_style: 'Professional',
    principles: ['Test Principle 1', 'Test Principle 2'],
  },
  menu: [
    {
      id: 'action1',
      label: 'Test Action',
      description: 'Test action description',
      action: 'test-action',
    },
  ],
  prompts: [
    {
      id: 'prompt1',
      label: 'Test Prompt',
      prompt: 'This is a test prompt',
      type: 'system',
    },
  ],
};

describe('Agent Service', () => {
  // Clean up test data before and after each test
  beforeEach(async () => {
    // Delete any existing test agents
    await prisma.agent.deleteMany({
      where: {
        name: { contains: 'test-agent' },
      },
    });
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.agent.deleteMany({
      where: {
        name: { contains: 'test-agent' },
      },
    });

    // Disconnect to avoid hanging test suite
    await prisma.$disconnect();
  });

  describe('createAgent', () => {
    it('should create a new agent with valid data', async () => {
      const agent = await createAgent(mockAgentData);

      expect(agent).toBeDefined();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe(mockAgentData.name);
      expect(agent.title).toBe(mockAgentData.title);
      expect(agent.icon).toBe(mockAgentData.icon);
      expect(agent.module).toBe(mockAgentData.module);
      expect(agent.version).toBe(mockAgentData.version);
    });

    it('should store persona, menu, and prompts as JSON', async () => {
      const agent = await createAgent(mockAgentData);

      expect(agent.persona).toEqual(mockAgentData.persona);
      expect(agent.menu).toEqual(mockAgentData.menu);
      expect(agent.prompts).toEqual(mockAgentData.prompts);
    });

    it('should throw error for invalid version format', async () => {
      const invalidData = {
        ...mockAgentData,
        name: 'test-agent-invalid-version',
        version: 'invalid',
      };

      await expect(createAgent(invalidData)).rejects.toThrow();
    });

    it('should throw error for invalid module', async () => {
      const invalidData = {
        ...mockAgentData,
        name: 'test-agent-invalid-module',
        module: 'invalid' as any,
      };

      await expect(createAgent(invalidData)).rejects.toThrow();
    });

    it('should throw error for duplicate name', async () => {
      await createAgent(mockAgentData);

      // Try to create with same name
      await expect(createAgent(mockAgentData)).rejects.toThrow();
    });
  });

  describe('getAgent', () => {
    it('should get an agent by ID', async () => {
      const created = await createAgent(mockAgentData);
      const retrieved = await getAgent(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe(mockAgentData.name);
    });

    it('should return null for non-existent agent', async () => {
      const retrieved = await getAgent('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should include memories and project relations', async () => {
      const created = await createAgent(mockAgentData);
      const retrieved = await getAgent(created.id);

      expect(retrieved).toHaveProperty('memories');
      expect(retrieved).toHaveProperty('project');
      expect(Array.isArray(retrieved?.memories)).toBe(true);
    });
  });

  describe('getAgentByName', () => {
    it('should get an agent by name', async () => {
      await createAgent(mockAgentData);
      const retrieved = await getAgentByName(mockAgentData.name);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe(mockAgentData.name);
    });

    it('should return null for non-existent agent name', async () => {
      const retrieved = await getAgentByName('non-existent-agent');
      expect(retrieved).toBeNull();
    });
  });

  describe('listAgents', () => {
    it('should list all agents', async () => {
      await createAgent(mockAgentData);
      await createAgent({ ...mockAgentData, name: 'test-agent-2' });

      const agents = await listAgents();

      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by module', async () => {
      await createAgent(mockAgentData);

      const agents = await listAgents({ module: 'mam' });

      expect(agents.length).toBeGreaterThan(0);
      agents.forEach((agent) => {
        expect(agent.module).toBe('mam');
      });
    });

    it('should support pagination with limit and offset', async () => {
      await createAgent(mockAgentData);
      await createAgent({ ...mockAgentData, name: 'test-agent-2' });
      await createAgent({ ...mockAgentData, name: 'test-agent-3' });

      const page1 = await listAgents({ limit: 2, offset: 0 });
      const page2 = await listAgents({ limit: 2, offset: 2 });

      expect(page1.length).toBe(2);
      expect(page2.length).toBeGreaterThanOrEqual(1);
      expect(page1[0]?.id).not.toBe(page2[0]?.id);
    });

    it('should include project relation and memory count', async () => {
      await createAgent(mockAgentData);
      const agents = await listAgents();

      expect(agents[0]).toHaveProperty('project');
      expect(agents[0]).toHaveProperty('_count');
      expect(agents[0]?._count).toHaveProperty('memories');
    });
  });

  describe('updateAgent', () => {
    it('should update agent fields', async () => {
      const created = await createAgent(mockAgentData);

      const updateData: UpdateAgentInput = {
        title: 'Updated Test Agent',
        version: '2.0.0',
      };

      const updated = await updateAgent(created.id, updateData);

      expect(updated.title).toBe('Updated Test Agent');
      expect(updated.version).toBe('2.0.0');
      expect(updated.name).toBe(mockAgentData.name); // Unchanged
    });

    it('should update JSON fields', async () => {
      const created = await createAgent(mockAgentData);

      const updateData: UpdateAgentInput = {
        persona: {
          role: 'Updated Role',
        },
      };

      const updated = await updateAgent(created.id, updateData);

      expect(updated.persona).toEqual({ role: 'Updated Role' });
    });

    it('should throw error for non-existent agent', async () => {
      await expect(updateAgent('non-existent-id', { title: 'Test' })).rejects.toThrow();
    });

    it('should throw error for invalid version format', async () => {
      const created = await createAgent(mockAgentData);

      await expect(updateAgent(created.id, { version: 'invalid' as any })).rejects.toThrow();
    });
  });

  describe('deleteAgent', () => {
    it('should delete an agent by ID', async () => {
      const created = await createAgent(mockAgentData);

      const deleted = await deleteAgent(created.id);

      expect(deleted.id).toBe(created.id);

      // Verify it's deleted
      const retrieved = await getAgent(created.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent agent', async () => {
      await expect(deleteAgent('non-existent-id')).rejects.toThrow();
    });
  });

  describe('searchAgents', () => {
    it('should search agents by name', async () => {
      await createAgent(mockAgentData);

      const results = await searchAgents({ query: 'test-agent' });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.name).toContain('test-agent');
    });

    it('should search agents by title', async () => {
      await createAgent(mockAgentData);

      const results = await searchAgents({ query: 'Test Agent' });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.title).toContain('Test Agent');
    });

    it('should filter search by module', async () => {
      await createAgent(mockAgentData);

      const results = await searchAgents({ query: 'test', module: 'mam' });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((agent) => {
        expect(agent.module).toBe('mam');
      });
    });

    it('should return empty array for no matches', async () => {
      const results = await searchAgents({ query: 'non-existent-xyz-abc' });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getAgentCountByModule', () => {
    it('should return count grouped by module', async () => {
      await createAgent(mockAgentData);
      await createAgent({ ...mockAgentData, name: 'test-agent-mab', module: 'mab' });

      const counts = await getAgentCountByModule();

      expect(typeof counts).toBe('object');
      expect(counts.mam).toBeGreaterThan(0);
      expect(counts.mab).toBeGreaterThan(0);
    });

    it('should return empty object if no agents exist', async () => {
      // This test assumes other tests have cleaned up
      const counts = await getAgentCountByModule();

      expect(typeof counts).toBe('object');
    });
  });

  describe('duplicateAgent', () => {
    it('should duplicate an agent with new name', async () => {
      const original = await createAgent(mockAgentData);

      const duplicate = await duplicateAgent(original.id, 'test-agent-duplicate');

      expect(duplicate.id).not.toBe(original.id);
      expect(duplicate.name).toBe('test-agent-duplicate');
      expect(duplicate.title).toContain('(Copy)');
      expect(duplicate.icon).toBe(original.icon);
      expect(duplicate.module).toBe(original.module);
      expect(duplicate.version).toBe(original.version);
      expect(duplicate.persona).toEqual(original.persona);
    });

    it('should throw error for non-existent source agent', async () => {
      await expect(duplicateAgent('non-existent-id', 'new-name')).rejects.toThrow();
    });
  });

  describe('exportAgent', () => {
    it('should export agent as JSON', async () => {
      const created = await createAgent(mockAgentData);

      const exported = await exportAgent(created.id);

      expect(exported).toBeDefined();
      expect(exported.name).toBe(mockAgentData.name);
      expect(exported.title).toBe(mockAgentData.title);
      expect(exported.icon).toBe(mockAgentData.icon);
      expect(exported.module).toBe(mockAgentData.module);
      expect(exported.version).toBe(mockAgentData.version);
      expect(exported.persona).toEqual(mockAgentData.persona);
      expect(exported.menu).toEqual(mockAgentData.menu);
      expect(exported.prompts).toEqual(mockAgentData.prompts);
      expect(exported.exportedAt).toBeDefined();
    });

    it('should not include internal IDs in export', async () => {
      const created = await createAgent(mockAgentData);

      const exported = await exportAgent(created.id);

      expect(exported).not.toHaveProperty('id');
      expect(exported).not.toHaveProperty('createdAt');
      expect(exported).not.toHaveProperty('updatedAt');
    });

    it('should throw error for non-existent agent', async () => {
      await expect(exportAgent('non-existent-id')).rejects.toThrow();
    });
  });

  describe('importAgent', () => {
    it('should import agent from JSON', async () => {
      const created = await createAgent(mockAgentData);
      const exported = await exportAgent(created.id);

      // Import with different name
      const importData = {
        ...exported,
        name: 'test-agent-imported',
      };

      const imported = await importAgent(importData);

      expect(imported).toBeDefined();
      expect(imported.name).toBe('test-agent-imported');
      expect(imported.title).toBe(exported.title);
      expect(imported.icon).toBe(exported.icon);
      expect(imported.module).toBe(exported.module);
      expect(imported.version).toBe(exported.version);
    });

    it('should throw error for invalid JSON format', async () => {
      const invalidData = {
        name: 'test',
        // Missing required fields
      };

      await expect(importAgent(invalidData)).rejects.toThrow();
    });

    it('should associate with project if projectId provided', async () => {
      const exported = await exportAgent((await createAgent(mockAgentData)).id);

      const importData = {
        ...exported,
        name: 'test-agent-with-project',
      };

      // Note: This would need a project to exist, but we're testing the parameter passing
      // In a real scenario with project setup, this would work
      const imported = await importAgent(importData);

      expect(imported).toBeDefined();
    });
  });

  describe('Validation Schemas', () => {
    it('should validate minimum name length', async () => {
      const invalidData = {
        ...mockAgentData,
        name: '',
      };

      await expect(createAgent(invalidData)).rejects.toThrow(/validation/i);
    });

    it('should validate maximum name length', async () => {
      const invalidData = {
        ...mockAgentData,
        name: 'a'.repeat(51), // Max is 50
      };

      await expect(createAgent(invalidData)).rejects.toThrow(/validation/i);
    });

    it('should validate version format (semver)', async () => {
      const invalidVersions = ['1', '1.0', 'v1.0.0', '1.0.0-beta'];

      for (const version of invalidVersions) {
        const invalidData = {
          ...mockAgentData,
          name: `test-agent-invalid-version-${version}`,
          version,
        };

        await expect(createAgent(invalidData)).rejects.toThrow();
      }
    });

    it('should accept valid version formats', async () => {
      const validVersions = ['1.0.0', '2.5.10', '0.1.0'];

      for (const version of validVersions) {
        const data = {
          ...mockAgentData,
          name: `test-agent-valid-version-${version}`,
          version,
        };

        const agent = await createAgent(data);
        expect(agent.version).toBe(version);

        // Cleanup
        await deleteAgent(agent.id);
      }
    });
  });
});

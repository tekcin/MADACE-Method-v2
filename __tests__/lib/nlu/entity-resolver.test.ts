/**
 * Entity Resolver Tests
 *
 * Tests for NLU entity resolution with fuzzy matching
 */

import { EntityResolver } from '@/lib/nlu/entity-resolver';
import type { NLUEntity, EntitySynonym } from '@/lib/nlu/types';
import * as agentService from '@/lib/services/agent-service';
import { createStateMachine } from '@/lib/state/machine';

// Mock agent service and state machine
jest.mock('@/lib/services/agent-service');
jest.mock('@/lib/state/machine');

const mockAgentService = agentService as jest.Mocked<typeof agentService>;
const mockCreateStateMachine = createStateMachine as jest.MockedFunction<typeof createStateMachine>;

describe('EntityResolver', () => {
  let resolver: EntityResolver;

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new EntityResolver({
      fuzzyThreshold: 0.4,
      maxMatches: 5,
    });
  });

  describe('resolveEntity - Exact match', () => {
    it('should resolve exact agent name match', async () => {
      const mockAgents = [
        { id: '1', name: 'PM', title: 'Project Manager' },
        { id: '2', name: 'Analyst', title: 'Business Analyst' },
      ];

      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'PM',
        originalText: 'PM',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('PM');
      expect(result.confidence).toBe(1.0);
      expect(result.source).toBe('exact');
    });

    it('should resolve case-insensitive exact match', async () => {
      const mockAgents = [{ id: '1', name: 'PM', title: 'Project Manager' }];
      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'pm',
        originalText: 'pm',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('PM');
      expect(result.source).toBe('exact');
    });
  });

  describe('resolveEntity - Synonym match', () => {
    it('should resolve agent synonym', async () => {
      const entity: NLUEntity = {
        type: '@agent',
        value: 'project manager',
        originalText: 'project manager',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('PM');
      expect(result.confidence).toBe(0.95);
      expect(result.source).toBe('synonym');
    });

    it('should resolve state synonym', async () => {
      const entity: NLUEntity = {
        type: '@state',
        value: 'in progress',
        originalText: 'in progress',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('IN_PROGRESS');
      expect(result.source).toBe('synonym');
    });

    it('should resolve "business analyst" to Analyst', async () => {
      const entity: NLUEntity = {
        type: '@agent',
        value: 'business analyst',
        originalText: 'business analyst',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('Analyst');
      expect(result.source).toBe('synonym');
    });
  });

  describe('resolveEntity - Fuzzy match', () => {
    it('should resolve typo in agent name', async () => {
      const mockAgents = [
        { id: '1', name: 'PM', title: 'Project Manager' },
        { id: '2', name: 'Analyst', title: 'Business Analyst' },
      ];

      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'Analist', // typo: should match "Analyst"
        originalText: 'Analist',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('Analyst');
      expect(result.source).toBe('fuzzy');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should return multiple fuzzy matches', async () => {
      const mockAgents = [
        { id: '1', name: 'DEV', title: 'Developer' },
        { id: '2', name: 'Analyst', title: 'Business Analyst' },
      ];

      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'dev',
        originalText: 'dev',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.source).toBe('exact'); // Actually exact match
    });

    it('should resolve story ID with fuzzy matching', async () => {
      const mockStateMachine = {
        load: jest.fn(),
        getStatus: jest.fn().mockReturnValue({
          backlog: [],
          todo: [{ id: 'NLU-001', title: 'Test Story', state: 'TODO' }],
          inProgress: [],
          done: [],
        }),
      };

      mockCreateStateMachine.mockReturnValue(mockStateMachine as any);

      const entity: NLUEntity = {
        type: '@story',
        value: 'NLU-001',
        originalText: 'NLU-001',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('NLU-001');
    });
  });

  describe('resolveEntity - Not found', () => {
    it('should return not_found for non-existent agent', async () => {
      mockAgentService.listAgents.mockResolvedValue([]);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'NonExistent',
        originalText: 'NonExistent',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(false);
      expect(result.source).toBe('not_found');
      expect(result.confidence).toBe(0);
    });

    it('should return not_found for very different value', async () => {
      const mockAgents = [{ id: '1', name: 'PM', title: 'Project Manager' }];
      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'zzzzzzzzzzz',
        originalText: 'zzzzzzzzzzz',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(false);
      expect(result.source).toBe('not_found');
    });
  });

  describe('Caching', () => {
    it('should cache agent candidates', async () => {
      const mockAgents = [{ id: '1', name: 'PM', title: 'Project Manager' }];
      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const entity1: NLUEntity = {
        type: '@agent',
        value: 'PM',
        originalText: 'PM',
        confidence: 1.0,
      };

      const entity2: NLUEntity = {
        type: '@agent',
        value: 'PM',
        originalText: 'PM',
        confidence: 1.0,
      };

      // First call
      await resolver.resolveEntity(entity1);

      // Second call should use cache
      await resolver.resolveEntity(entity2);

      // listAgents should only be called once due to caching
      expect(mockAgentService.listAgents).toHaveBeenCalledTimes(1);
    });

    it('should clear cache when requested', async () => {
      const mockAgents = [{ id: '1', name: 'PM', title: 'Project Manager' }];
      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'PM',
        originalText: 'PM',
        confidence: 1.0,
      };

      // First call
      await resolver.resolveEntity(entity);

      // Clear cache
      resolver.clearCache();

      // Second call should fetch again
      await resolver.resolveEntity(entity);

      // listAgents should be called twice (cache was cleared)
      expect(mockAgentService.listAgents).toHaveBeenCalledTimes(2);
    });
  });

  describe('Custom synonyms', () => {
    it('should add custom synonym', async () => {
      const customSynonym: EntitySynonym = {
        canonical: 'CustomAgent',
        synonyms: ['custom', 'special agent'],
      };

      resolver.addSynonym(customSynonym);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'custom',
        originalText: 'custom',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('CustomAgent');
      expect(result.source).toBe('synonym');
    });

    it('should get all synonyms', () => {
      const synonyms = resolver.getSynonyms();

      expect(synonyms.length).toBeGreaterThan(0);
      expect(synonyms.some((s) => s.canonical === 'PM')).toBe(true);
      expect(synonyms.some((s) => s.canonical === 'BACKLOG')).toBe(true);
    });
  });

  describe('State resolution', () => {
    it('should resolve valid state', async () => {
      const entity: NLUEntity = {
        type: '@state',
        value: 'TODO',
        originalText: 'TODO',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('TODO');
    });

    it('should resolve state synonym "wip" to IN_PROGRESS', async () => {
      const entity: NLUEntity = {
        type: '@state',
        value: 'wip',
        originalText: 'wip',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('IN_PROGRESS');
      expect(result.source).toBe('synonym');
    });
  });

  describe('Workflow resolution', () => {
    it('should resolve workflow name', async () => {
      const entity: NLUEntity = {
        type: '@workflow',
        value: 'planning',
        originalText: 'planning',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('planning');
    });

    it('should fuzzy match workflow name', async () => {
      const entity: NLUEntity = {
        type: '@workflow',
        value: 'planningg', // typo
        originalText: 'planningg',
        confidence: 1.0,
      };

      const result = await resolver.resolveEntity(entity);

      expect(result.resolved).toBe(true);
      expect(result.resolvedValue).toBe('planning');
      expect(result.source).toBe('fuzzy');
    });
  });
});

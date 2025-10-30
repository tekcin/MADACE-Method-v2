/**
 * Intent Handler Tests
 *
 * Tests for NLU intent-to-action mapping
 */

import { handleIntent, getAvailableIntents } from '@/lib/nlu/intent-handler';
import type { NLUIntent, NLUEntity } from '@/lib/nlu/types';
import * as agentService from '@/lib/services/agent-service';

// Mock agent service
jest.mock('@/lib/services/agent-service');
const mockAgentService = agentService as jest.Mocked<typeof agentService>;

describe('Intent Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableIntents', () => {
    it('should return list of registered intents', () => {
      const intents = getAvailableIntents();

      expect(intents).toBeInstanceOf(Array);
      expect(intents.length).toBeGreaterThan(0);
      expect(intents).toContain('create_agent');
      expect(intents).toContain('list_agents');
      expect(intents).toContain('help');
      expect(intents).toContain('greeting');
    });
  });

  describe('handleIntent - greeting', () => {
    it('should respond to greeting', async () => {
      const intent: NLUIntent = {
        name: 'greeting',
        displayName: 'Greeting',
        confidence: 0.95,
        parameters: {},
        requiresFollowUp: false,
      };

      const result = await handleIntent(intent, []);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Hello');
      expect(result.message).toContain('MADACE');
    });
  });

  describe('handleIntent - help', () => {
    it('should provide help message', async () => {
      const intent: NLUIntent = {
        name: 'help',
        displayName: 'Help',
        confidence: 0.9,
        parameters: {},
        requiresFollowUp: false,
      };

      const result = await handleIntent(intent, []);

      expect(result.success).toBe(true);
      expect(result.message).toContain('help you with');
      expect(result.message).toContain('Agents');
      expect(result.message).toContain('Workflows');
    });
  });

  describe('handleIntent - goodbye', () => {
    it('should respond to goodbye', async () => {
      const intent: NLUIntent = {
        name: 'goodbye',
        displayName: 'Goodbye',
        confidence: 0.92,
        parameters: {},
        requiresFollowUp: false,
      };

      const result = await handleIntent(intent, []);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Goodbye');
    });
  });

  describe('handleIntent - list_agents', () => {
    it('should list all agents', async () => {
      const mockAgents = [
        { id: '1', name: 'PM', title: 'Project Manager', module: 'MAM' },
        { id: '2', name: 'Analyst', title: 'Business Analyst', module: 'MAM' },
      ];

      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const intent: NLUIntent = {
        name: 'list_agents',
        displayName: 'List Agents',
        confidence: 0.88,
        parameters: {},
        requiresFollowUp: false,
      };

      const result = await handleIntent(intent, []);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAgents);
      expect(result.message).toContain('Found 2 agents');
      expect(mockAgentService.listAgents).toHaveBeenCalledWith({});
    });

    it('should filter agents by module', async () => {
      const mockAgents = [
        { id: '1', name: 'PM', title: 'Project Manager', module: 'MAM' },
      ];

      mockAgentService.listAgents.mockResolvedValue(mockAgents as any);

      const intent: NLUIntent = {
        name: 'list_agents',
        displayName: 'List Agents',
        confidence: 0.85,
        parameters: {},
        requiresFollowUp: false,
      };

      const entities: NLUEntity[] = [
        {
          type: '@module',
          value: 'MAM',
          originalText: 'MAM',
          confidence: 1.0,
        },
      ];

      const result = await handleIntent(intent, entities);

      expect(result.success).toBe(true);
      expect(result.message).toContain('in module MAM');
      expect(mockAgentService.listAgents).toHaveBeenCalledWith({
        module: 'MAM',
      });
    });
  });

  describe('handleIntent - show_agent', () => {
    it('should show agent details', async () => {
      const mockAgent = {
        id: '1',
        name: 'PM',
        title: 'Project Manager',
        module: 'MAM',
      };

      mockAgentService.getAgentByName.mockResolvedValue(mockAgent as any);

      const intent: NLUIntent = {
        name: 'show_agent',
        displayName: 'Show Agent',
        confidence: 0.9,
        parameters: {},
        requiresFollowUp: false,
      };

      const entities: NLUEntity[] = [
        {
          type: '@agent',
          value: 'PM',
          originalText: 'PM',
          confidence: 1.0,
        },
      ];

      const result = await handleIntent(intent, entities);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAgent);
      expect(result.message).toContain('Project Manager');
      expect(mockAgentService.getAgentByName).toHaveBeenCalledWith('PM');
    });

    it('should request agent name if not provided', async () => {
      const intent: NLUIntent = {
        name: 'show_agent',
        displayName: 'Show Agent',
        confidence: 0.85,
        parameters: {},
        requiresFollowUp: false,
      };

      const result = await handleIntent(intent, []);

      expect(result.success).toBe(false);
      expect(result.requiresFollowUp).toBe(true);
      expect(result.followUpQuestion).toContain('agent name');
      expect(mockAgentService.getAgentByName).not.toHaveBeenCalled();
    });

    it('should handle agent not found', async () => {
      mockAgentService.getAgentByName.mockResolvedValue(null);

      const intent: NLUIntent = {
        name: 'show_agent',
        displayName: 'Show Agent',
        confidence: 0.9,
        parameters: {},
        requiresFollowUp: false,
      };

      const entities: NLUEntity[] = [
        {
          type: '@agent',
          value: 'NonExistent',
          originalText: 'NonExistent',
          confidence: 1.0,
        },
      ];

      const result = await handleIntent(intent, entities);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('handleIntent - create_agent', () => {
    it('should provide guidance for creating agent', async () => {
      const intent: NLUIntent = {
        name: 'create_agent',
        displayName: 'Create Agent',
        confidence: 0.85,
        parameters: {},
        requiresFollowUp: false,
      };

      const entities: NLUEntity[] = [
        {
          type: '@agent',
          value: 'Architect',
          originalText: 'Architect',
          confidence: 1.0,
        },
      ];

      const result = await handleIntent(intent, entities);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Architect');
      expect(result.message).toContain('YAML file');
      expect(result.requiresFollowUp).toBe(true);
    });

    it('should request agent type if not provided', async () => {
      const intent: NLUIntent = {
        name: 'create_agent',
        displayName: 'Create Agent',
        confidence: 0.8,
        parameters: {},
        requiresFollowUp: false,
      };

      const result = await handleIntent(intent, []);

      expect(result.success).toBe(false);
      expect(result.requiresFollowUp).toBe(true);
      expect(result.followUpQuestion).toContain('What type of agent');
    });
  });

  describe('handleIntent - unknown', () => {
    it('should handle unknown intent with helpful message', async () => {
      const intent: NLUIntent = {
        name: 'unknown_intent',
        displayName: 'Unknown',
        confidence: 0.5,
        parameters: {},
        requiresFollowUp: false,
      };

      const result = await handleIntent(intent, []);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not sure I understand');
      expect(result.message).toContain('help');
    });
  });

  describe('handleIntent - error handling', () => {
    it('should handle service errors gracefully', async () => {
      mockAgentService.listAgents.mockRejectedValue(
        new Error('Database connection failed')
      );

      const intent: NLUIntent = {
        name: 'list_agents',
        displayName: 'List Agents',
        confidence: 0.9,
        parameters: {},
        requiresFollowUp: false,
      };

      const result = await handleIntent(intent, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });
  });
});

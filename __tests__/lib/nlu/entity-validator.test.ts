/**
 * Entity Validator Tests
 *
 * Tests for NLU entity validation logic
 */

import { EntityValidator } from '@/lib/nlu/entity-validator';
import type { NLUEntity } from '@/lib/nlu/types';
import * as agentService from '@/lib/services/agent-service';
import { createStateMachine } from '@/lib/state/machine';

// Mock agent service and state machine
jest.mock('@/lib/services/agent-service');
jest.mock('@/lib/state/machine');

const mockAgentService = agentService as jest.Mocked<typeof agentService>;
const mockCreateStateMachine = createStateMachine as jest.MockedFunction<typeof createStateMachine>;

describe('EntityValidator', () => {
  let validator: EntityValidator;

  beforeEach(() => {
    jest.clearAllMocks();
    validator = new EntityValidator({
      projectRoot: '/test/project',
      allowedExtensions: ['.md', '.yaml', '.ts'],
    });
  });

  describe('validateEntity - @agent', () => {
    it('should validate existing agent', async () => {
      const mockAgent = { id: '1', name: 'PM', title: 'Project Manager' };
      mockAgentService.getAgentByName.mockResolvedValue(mockAgent as any);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'PM',
        originalText: 'PM',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('PM');
      expect(result.errors).toHaveLength(0);
      expect(mockAgentService.getAgentByName).toHaveBeenCalledWith('PM');
    });

    it('should reject non-existent agent', async () => {
      mockAgentService.getAgentByName.mockResolvedValue(null);

      const entity: NLUEntity = {
        type: '@agent',
        value: 'NonExistent',
        originalText: 'NonExistent',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Agent "NonExistent" not found in database');
    });

    it('should handle missing agent name', async () => {
      const entity: NLUEntity = {
        type: '@agent',
        value: '',
        originalText: '',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Agent name is required');
    });
  });

  describe('validateEntity - @story', () => {
    it('should validate existing story', async () => {
      const mockStateMachine = {
        load: jest.fn(),
        getStatus: jest.fn().mockReturnValue({
          backlog: [{ id: 'DB-001', title: 'Test Story', state: 'BACKLOG' }],
          todo: [],
          inProgress: [],
          done: [],
        }),
      };

      mockCreateStateMachine.mockReturnValue(mockStateMachine as any);

      const entity: NLUEntity = {
        type: '@story',
        value: 'DB-001',
        originalText: 'DB-001',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('DB-001');
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid story ID format', async () => {
      const entity: NLUEntity = {
        type: '@story',
        value: 'invalid-story',
        originalText: 'invalid-story',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid story ID format');
    });

    it('should reject non-existent story', async () => {
      const mockStateMachine = {
        load: jest.fn(),
        getStatus: jest.fn().mockReturnValue({
          backlog: [],
          todo: [],
          inProgress: [],
          done: [],
        }),
      };

      mockCreateStateMachine.mockReturnValue(mockStateMachine as any);

      const entity: NLUEntity = {
        type: '@story',
        value: 'DB-999',
        originalText: 'DB-999',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Story "DB-999" not found in workflow status');
    });
  });

  describe('validateEntity - @state', () => {
    it('should validate correct state', async () => {
      const entity: NLUEntity = {
        type: '@state',
        value: 'TODO',
        originalText: 'TODO',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('TODO');
      expect(result.errors).toHaveLength(0);
    });

    it('should normalize state with spaces', async () => {
      const entity: NLUEntity = {
        type: '@state',
        value: 'IN PROGRESS',
        originalText: 'IN PROGRESS',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('IN_PROGRESS');
    });

    it('should reject invalid state', async () => {
      const entity: NLUEntity = {
        type: '@state',
        value: 'INVALID_STATE',
        originalText: 'INVALID_STATE',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid state');
    });
  });

  describe('validateEntity - @file_path', () => {
    it('should validate path within project', async () => {
      const entity: NLUEntity = {
        type: '@file_path',
        value: 'docs/test.md',
        originalText: 'docs/test.md',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('docs/test.md');
      expect(result.errors).toHaveLength(0);
    });

    it('should reject path outside project', async () => {
      const entity: NLUEntity = {
        type: '@file_path',
        value: '../../etc/passwd',
        originalText: '../../etc/passwd',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('outside project boundaries');
    });

    it('should warn about disallowed extension', async () => {
      const entity: NLUEntity = {
        type: '@file_path',
        value: 'docs/test.exe',
        originalText: 'docs/test.exe',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('not in allowed list');
    });
  });

  describe('validateEntity - @config_key', () => {
    it('should validate correct config key', async () => {
      const entity: NLUEntity = {
        type: '@config_key',
        value: 'project_name',
        originalText: 'project_name',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('project_name');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate nested config key with dots', async () => {
      const entity: NLUEntity = {
        type: '@config_key',
        value: 'llm.provider',
        originalText: 'llm.provider',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('llm.provider');
    });

    it('should reject invalid config key format', async () => {
      const entity: NLUEntity = {
        type: '@config_key',
        value: 'invalid-key!',
        originalText: 'invalid-key!',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid config key format');
    });
  });

  describe('validateEntity - @number', () => {
    it('should validate numeric string', async () => {
      const entity: NLUEntity = {
        type: '@number',
        value: '42',
        originalText: '42',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('42');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate float number', async () => {
      const entity: NLUEntity = {
        type: '@number',
        value: 3.14,
        originalText: '3.14',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('3.14');
    });

    it('should reject non-numeric value', async () => {
      const entity: NLUEntity = {
        type: '@number',
        value: 'not-a-number',
        originalText: 'not-a-number',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid number');
    });
  });

  describe('validateEntity - @date', () => {
    it('should validate ISO date string', async () => {
      const entity: NLUEntity = {
        type: '@date',
        value: '2025-10-29',
        originalText: '2025-10-29',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(true);
      expect(result.normalized).toContain('2025-10-29');
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid date', async () => {
      const entity: NLUEntity = {
        type: '@date',
        value: 'not-a-date',
        originalText: 'not-a-date',
        confidence: 1.0,
      };

      const result = await validator.validateEntity(entity);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid date');
    });
  });

  describe('validateEntities (batch)', () => {
    it('should validate multiple entities', async () => {
      const mockAgent = { id: '1', name: 'PM', title: 'Project Manager' };
      mockAgentService.getAgentByName.mockResolvedValue(mockAgent as any);

      const entities: NLUEntity[] = [
        { type: '@agent', value: 'PM', originalText: 'PM', confidence: 1.0 },
        { type: '@state', value: 'TODO', originalText: 'TODO', confidence: 1.0 },
        { type: '@number', value: '5', originalText: '5', confidence: 1.0 },
      ];

      const results = await validator.validateEntities(entities);

      expect(results).toHaveLength(3);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(true);
      expect(results[2].valid).toBe(true);
    });
  });
});

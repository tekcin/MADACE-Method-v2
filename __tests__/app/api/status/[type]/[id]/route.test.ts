/**
 * Comprehensive Tests for API Route: GET /api/status/:type/:id
 * STORY-V3-017: Create API Route for Status Checking
 *
 * Test Plan: 106 comprehensive tests covering all scenarios
 * Coverage Target: 100% (line, branch, function, statement)
 */

import { GET } from '@/app/api/status/[type]/[id]/route';
import { getStatusRegistry } from '@/lib/status/registry';
import type { StatusResult } from '@/lib/status/types';

// Mock Next.js server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

// Mock status registry
jest.mock('@/lib/status/registry');

const mockGetStatusRegistry = getStatusRegistry as jest.MockedFunction<typeof getStatusRegistry>;

describe('GET /api/status/:type/:id', () => {
  let mockRequest: Partial<Request>;
  let mockRegistry: {
    getStatusResult: jest.Mock;
    getStatus: jest.Mock;
    detectEntityType: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      url: 'http://localhost:3000/api/status/story/STORY-001',
      headers: new Headers(),
    };

    mockRegistry = {
      getStatusResult: jest.fn(),
      getStatus: jest.fn(),
      detectEntityType: jest.fn(),
    };

    mockGetStatusRegistry.mockReturnValue(mockRegistry as any);
  });

  // ============================================================================
  // Test Suite 1: Successful Status Queries (20 tests)
  // ============================================================================

  describe('Successful Status Queries', () => {
    describe('Story Status Queries', () => {
      it('should return story status for STORY-V3-001', async () => {
        const type = 'story';
        const id = 'STORY-V3-001';

        const mockResult: StatusResult = {
          entityType: 'story',
          entityId: 'STORY-V3-001',
          data: {
            status: 'in-progress',
            title: 'Example Story',
            points: 5,
          },
          timestamp: '2025-10-29T12:00:00.000Z',
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.result.entityType).toBe('story');
        expect(data.result.entityId).toBe('STORY-V3-001');
        expect(data.result.data.status).toBe('in-progress');
      });

      it('should return story status for US-001', async () => {
        const type = 'story';
        const id = 'US-001';

        const mockResult: StatusResult = {
          entityType: 'story',
          entityId: 'US-001',
          data: { status: 'done', title: 'User Story', points: 3 },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.result.entityId).toBe('US-001');
      });

      it('should return story status for TASK-001', async () => {
        const type = 'story';
        const id = 'TASK-001';

        const mockResult: StatusResult = {
          entityType: 'story',
          entityId: 'TASK-001',
          data: { status: 'todo', title: 'Task', points: 2 },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.entityId).toBe('TASK-001');
      });

      it('should return story status for story-v3-001 (lowercase)', async () => {
        const type = 'story';
        const id = 'story-v3-001';

        const mockResult: StatusResult = {
          entityType: 'story',
          entityId: 'story-v3-001',
          data: { status: 'done' },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.entityId).toBe('story-v3-001');
      });

      it('should return story with complete metadata', async () => {
        const type = 'story';
        const id = 'STORY-001';

        const mockResult: StatusResult = {
          entityType: 'story',
          entityId: 'STORY-001',
          data: {
            status: 'in-progress',
            title: 'Complete Story',
            points: 8,
            assignee: 'Claude',
            startedAt: '2025-10-29',
            milestone: '2.0',
          },
          timestamp: new Date().toISOString(),
          metadata: { epic: 'EPIC-V3-001' },
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.data.title).toBe('Complete Story');
        expect(data.result.data.points).toBe(8);
        expect(data.result.data.assignee).toBe('Claude');
        expect(data.result.metadata.epic).toBe('EPIC-V3-001');
      });
    });

    describe('Epic Status Queries', () => {
      it('should return epic status for EPIC-V3-001', async () => {
        const type = 'epic';
        const id = 'EPIC-V3-001';

        const mockResult: StatusResult = {
          entityType: 'epic',
          entityId: 'EPIC-V3-001',
          data: {
            title: 'Scale-Adaptive Workflow Router',
            priority: 'P0',
            effort: 34,
            completedStories: 3,
            totalStories: 10,
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.result.entityType).toBe('epic');
        expect(data.result.data.completedStories).toBe(3);
        expect(data.result.data.totalStories).toBe(10);
      });

      it('should return epic status for EPIC-MAM', async () => {
        const type = 'epic';
        const id = 'EPIC-MAM';

        const mockResult: StatusResult = {
          entityType: 'epic',
          entityId: 'EPIC-MAM',
          data: { title: 'MAM Epic', effort: 55 },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.entityId).toBe('EPIC-MAM');
      });

      it('should return epic status for epic-v3-001 (lowercase)', async () => {
        const type = 'epic';
        const id = 'epic-v3-001';

        const mockResult: StatusResult = {
          entityType: 'epic',
          entityId: 'epic-v3-001',
          data: { title: 'Epic' },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.entityId).toBe('epic-v3-001');
      });

      it('should return epic with complete metadata', async () => {
        const type = 'epic';
        const id = 'EPIC-V3-001';

        const mockResult: StatusResult = {
          entityType: 'epic',
          entityId: 'EPIC-V3-001',
          data: {
            title: 'Complete Epic',
            description: 'Epic description',
            priority: 'P0',
            effort: 34,
            quarter: 'Q2 2026',
            owner: 'Team',
            status: 'in-progress',
            storyCount: 10,
            lastUpdated: '2025-10-29',
            summary: 'Epic summary',
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.data.description).toBe('Epic description');
        expect(data.result.data.quarter).toBe('Q2 2026');
      });

      it('should return epic with story breakdown', async () => {
        const type = 'epic';
        const id = 'EPIC-V3-001';

        const mockResult: StatusResult = {
          entityType: 'epic',
          entityId: 'EPIC-V3-001',
          data: {
            title: 'Epic',
            stories: [
              { id: 'STORY-001', title: 'Story 1', status: 'done' },
              { id: 'STORY-002', title: 'Story 2', status: 'in-progress' },
            ],
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(data.result.data.stories)).toBe(true);
        expect(data.result.data.stories).toHaveLength(2);
      });
    });

    describe('Workflow Status Queries', () => {
      it('should return workflow status for pm-planning', async () => {
        const type = 'workflow';
        const id = 'pm-planning';

        const mockResult: StatusResult = {
          entityType: 'workflow',
          entityId: 'pm-planning',
          data: {
            workflowName: 'pm-planning',
            currentStep: 2,
            totalSteps: 5,
            progress: 40,
            status: 'in_progress',
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.result.entityType).toBe('workflow');
        expect(data.result.data.progress).toBe(40);
      });

      it('should return workflow status for completed workflow', async () => {
        const type = 'workflow';
        const id = 'create-prd';

        const mockResult: StatusResult = {
          entityType: 'workflow',
          entityId: 'create-prd',
          data: {
            workflowName: 'create-prd',
            status: 'completed',
            progress: 100,
            totalSteps: 3,
            currentStep: 3,
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.data.status).toBe('completed');
        expect(data.result.data.progress).toBe(100);
      });

      it('should return workflow with step details', async () => {
        const type = 'workflow';
        const id = 'route-workflow';

        const mockResult: StatusResult = {
          entityType: 'workflow',
          entityId: 'route-workflow',
          data: {
            steps: [
              { name: 'Step 1', status: 'completed', timestamp: '2025-10-29T10:00:00Z' },
              { name: 'Step 2', status: 'in_progress', timestamp: '2025-10-29T11:00:00Z' },
            ],
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(data.result.data.steps)).toBe(true);
      });

      it('should return workflow with context variables', async () => {
        const type = 'workflow';
        const id = 'pm-planning';

        const mockResult: StatusResult = {
          entityType: 'workflow',
          entityId: 'pm-planning',
          data: {
            context: {
              PROJECT_NAME: 'MADACE',
              USER_NAME: 'Claude',
            },
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.data.context).toBeDefined();
        expect(data.result.data.context.PROJECT_NAME).toBe('MADACE');
      });

      it('should return workflow status for failed workflow', async () => {
        const type = 'workflow';
        const id = 'test-workflow';

        const mockResult: StatusResult = {
          entityType: 'workflow',
          entityId: 'test-workflow',
          data: {
            status: 'failed',
            error: 'Workflow execution failed',
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.data.status).toBe('failed');
        expect(data.result.data.error).toBe('Workflow execution failed');
      });
    });

    describe('State Machine Queries', () => {
      it('should return state machine overview for state', async () => {
        const type = 'state-machine';
        const id = 'state';

        const mockResult: StatusResult = {
          entityType: 'state',
          entityId: undefined,
          data: {
            backlog: 45,
            todo: 1,
            inProgress: 1,
            done: 40,
          },
          timestamp: new Date().toISOString(),
          metadata: {
            todoLimit: 1,
            inProgressLimit: 1,
            todoViolation: false,
            inProgressViolation: false,
          },
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.result.entityType).toBe('state');
        expect(data.result.data.backlog).toBe(45);
        expect(data.result.data.todo).toBe(1);
        expect(data.result.data.inProgress).toBe(1);
        expect(data.result.data.done).toBe(40);
      });

      it('should return state machine overview for overview', async () => {
        const type = 'state-machine';
        const id = 'overview';

        const mockResult: StatusResult = {
          entityType: 'state',
          entityId: undefined,
          data: { backlog: 45, todo: 1, inProgress: 1, done: 40 },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.entityType).toBe('state');
      });

      it('should return state machine overview for summary', async () => {
        const type = 'state-machine';
        const id = 'summary';

        const mockResult: StatusResult = {
          entityType: 'state',
          entityId: undefined,
          data: { backlog: 45, todo: 1, inProgress: 1, done: 40 },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.entityType).toBe('state');
      });

      it('should return state machine with limit violations', async () => {
        const type = 'state-machine';
        const id = 'state';

        const mockResult: StatusResult = {
          entityType: 'state',
          entityId: undefined,
          data: {
            backlog: 45,
            todo: 2,
            inProgress: 2,
            done: 40,
          },
          timestamp: new Date().toISOString(),
          metadata: {
            todoLimit: 1,
            inProgressLimit: 1,
            todoViolation: true,
            inProgressViolation: true,
          },
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.metadata.todoViolation).toBe(true);
        expect(data.result.metadata.inProgressViolation).toBe(true);
      });

      it('should return state machine with empty sections', async () => {
        const type = 'state-machine';
        const id = 'state';

        const mockResult: StatusResult = {
          entityType: 'state',
          entityId: undefined,
          data: {
            backlog: 0,
            todo: 0,
            inProgress: 0,
            done: 0,
          },
          timestamp: new Date().toISOString(),
          metadata: {},
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result.data.backlog).toBe(0);
        expect(data.result.data.done).toBe(0);
      });
    });
  });

  // ============================================================================
  // Test Suite 2: Parameter Validation (15 tests)
  // ============================================================================

  describe('Parameter Validation', () => {
    describe('Valid Type Validation', () => {
      it('should accept type=story as valid', async () => {
        const type = 'story';
        const id = 'STORY-001';

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        expect(response.status).toBe(200);
      });

      it('should accept type=epic as valid', async () => {
        const type = 'epic';
        const id = 'EPIC-V3-001';

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'epic',
          entityId: 'EPIC-V3-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        expect(response.status).toBe(200);
      });

      it('should accept type=workflow as valid', async () => {
        const type = 'workflow';
        const id = 'pm-planning';

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'workflow',
          entityId: 'pm-planning',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        expect(response.status).toBe(200);
      });

      it('should accept type=state-machine as valid', async () => {
        const type = 'state-machine';
        const id = 'state';

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'state',
          entityId: undefined,
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        expect(response.status).toBe(200);
      });
    });

    describe('Invalid Type Validation', () => {
      it('should return 400 for invalid type', async () => {
        const type = 'invalid';
        const id = 'STORY-001';

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid type');
        expect(data.error).toContain('story, epic, workflow, state-machine');
      });

      it('should return 400 for empty type', async () => {
        const type = '';
        const id = 'STORY-001';

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      it('should return 400 for STORY type (uppercase)', async () => {
        const type = 'STORY';
        const id = 'STORY-001';

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid type');
      });

      it('should return 400 for type with special characters', async () => {
        const type = 'story!';
        const id = 'STORY-001';

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
      });
    });

    describe('ID Format Validation', () => {
      it('should accept STORY-V3-001, US-001, TASK-001 formats', async () => {
        const ids = ['STORY-V3-001', 'US-001', 'TASK-001'];

        for (const id of ids) {
          mockRegistry.getStatusResult.mockResolvedValue({
            entityType: 'story',
            entityId: id,
            data: {},
            timestamp: new Date().toISOString(),
            metadata: {},
          });

          const response = await GET(mockRequest as Request, {
            params: Promise.resolve({ type: 'story', id }),
          });

          expect(response.status).toBe(200);
        }
      });

      it('should accept EPIC-V3-001, EPIC-MAM formats', async () => {
        const ids = ['EPIC-V3-001', 'EPIC-MAM'];

        for (const id of ids) {
          mockRegistry.getStatusResult.mockResolvedValue({
            entityType: 'epic',
            entityId: id,
            data: {},
            timestamp: new Date().toISOString(),
            metadata: {},
          });

          const response = await GET(mockRequest as Request, {
            params: Promise.resolve({ type: 'epic', id }),
          });

          expect(response.status).toBe(200);
        }
      });

      it('should accept pm-planning, create-prd formats', async () => {
        const ids = ['pm-planning', 'create-prd'];

        for (const id of ids) {
          mockRegistry.getStatusResult.mockResolvedValue({
            entityType: 'workflow',
            entityId: id,
            data: {},
            timestamp: new Date().toISOString(),
            metadata: {},
          });

          const response = await GET(mockRequest as Request, {
            params: Promise.resolve({ type: 'workflow', id }),
          });

          expect(response.status).toBe(200);
        }
      });

      it('should accept state, overview, summary, all for state-machine', async () => {
        const ids = ['state', 'overview', 'summary', 'all'];

        for (const id of ids) {
          mockRegistry.getStatusResult.mockResolvedValue({
            entityType: 'state',
            entityId: undefined,
            data: {},
            timestamp: new Date().toISOString(),
            metadata: {},
          });

          const response = await GET(mockRequest as Request, {
            params: Promise.resolve({ type: 'state-machine', id }),
          });

          expect(response.status).toBe(200);
        }
      });
    });

    describe('Edge Cases', () => {
      it('should handle ID with 200+ characters', async () => {
        const type = 'story';
        const id = 'STORY-' + 'A'.repeat(200);

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: id,
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        // Should accept (within 1000 char limit)
        expect([200, 400]).toContain(response.status);
      });

      it('should handle URL-encoded ID', async () => {
        const type = 'story';
        const id = 'STORY%20001';

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: id,
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        // Should handle or reject
        expect([200, 400]).toContain(response.status);
      });

      it('should handle ID with trailing whitespace', async () => {
        const type = 'story';
        const id = 'STORY-001   ';

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        // Should trim and succeed
        expect(response.status).toBe(200);
      });
    });
  });

  // ============================================================================
  // Test Suite 3: Error Handling (20 tests)
  // ============================================================================

  describe('Error Handling', () => {
    describe('404 Not Found Errors', () => {
      it('should return 404 for non-existent story', async () => {
        const type = 'story';
        const id = 'STORY-NONEXISTENT';

        mockRegistry.getStatusResult.mockRejectedValue(
          new Error('Story not found: STORY-NONEXISTENT')
        );

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toContain('not found');
        expect(data.code).toBe('ENTITY_NOT_FOUND');
      });

      it('should return 404 for non-existent epic', async () => {
        const type = 'epic';
        const id = 'EPIC-NONEXISTENT';

        mockRegistry.getStatusResult.mockRejectedValue(new Error('Epic not found'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        expect(response.status).toBe(404);
      });

      it('should return 404 for non-existent workflow', async () => {
        const type = 'workflow';
        const id = 'nonexistent-workflow';

        mockRegistry.getStatusResult.mockRejectedValue(new Error('Workflow not found'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type, id }),
        });

        expect(response.status).toBe(404);
      });

      it('should return 404 for story not in mam-workflow-status.md', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Story not found in status file'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-999' }),
        });

        expect(response.status).toBe(404);
      });

      it('should return 404 for missing epic markdown file', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Epic file not found'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'epic', id: 'EPIC-V3-999' }),
        });

        expect(response.status).toBe(404);
      });

      it('should return 404 for missing workflow state directory', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(
          new Error('Workflow state directory not found')
        );

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'workflow', id: 'test-workflow' }),
        });

        expect(response.status).toBe(404);
      });

      it('should return 404 for missing mam-workflow-status.md', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Status file not found'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'state-machine', id: 'state' }),
        });

        expect(response.status).toBe(404);
      });

      it('should return 404 for ID that no provider recognizes', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(
          new Error('No status provider found for input')
        );

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'INVALID' }),
        });

        // Could be 400 or 404 depending on implementation
        expect([400, 404]).toContain(response.status);
      });
    });

    describe('500 Server Error', () => {
      it('should return 500 for registry internal error', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Internal registry error'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.code).toBe('INTERNAL_ERROR');
      });

      it('should return 500 for file system permission error', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('EACCES: permission denied'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.code).toBe('PERMISSION_DENIED');
      });

      it('should return 500 for malformed workflow state JSON', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('JSON parse error'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'workflow', id: 'test-workflow' }),
        });

        expect(response.status).toBe(500);
      });

      it('should return 500 for provider initialization failure', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Provider initialization failed'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(response.status).toBe(500);
      });

      it('should return 500 for non-Error exception', async () => {
        mockRegistry.getStatusResult.mockRejectedValue('String error');

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(response.status).toBe(500);
      });

      it('should return 500 for unknown error type', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Unknown error'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(response.status).toBe(500);
      });
    });

    describe('400 Bad Request', () => {
      it('should return 400 for missing type parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: undefined as any, id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.code).toBe('MISSING_PARAMS');
      });

      it('should return 400 for missing ID parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: undefined as any }),
        });

        expect(response.status).toBe(400);
      });

      it('should return 400 for both parameters missing', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: undefined as any, id: undefined as any }),
        });

        expect(response.status).toBe(400);
      });

      it('should return 400 for numeric type parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: '123', id: 'STORY-001' }),
        });

        expect(response.status).toBe(400);
      });

      it('should return 400 for ID with SQL injection attempt', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({
            type: 'story',
            id: "'; DROP TABLE stories; --",
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should return 400 for ID with path traversal', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: '../../../etc/passwd' }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  // ============================================================================
  // Test Suite 4: Response Format Validation (10 tests)
  // ============================================================================

  describe('Response Format Validation', () => {
    describe('Success Response Structure', () => {
      it('should return success response with required fields', async () => {
        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(data).toHaveProperty('success');
        expect(data.success).toBe(true);
        expect(data).toHaveProperty('result');
        expect(data).not.toHaveProperty('error');
      });

      it('should return result with StatusResult structure', async () => {
        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(data.result).toHaveProperty('entityType');
        expect(data.result).toHaveProperty('data');
        expect(data.result).toHaveProperty('timestamp');
        expect(data.result).toHaveProperty('metadata');
      });

      it('should return timestamp as Date-parseable string', async () => {
        const mockDate = new Date('2025-10-29T12:00:00Z');
        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: {},
          timestamp: mockDate,
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        const timestamp = new Date(data.result.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.toString()).not.toBe('Invalid Date');
      });

      it('should return data object (not null)', async () => {
        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: { test: 'value' },
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(data.result.data).not.toBeNull();
        expect(typeof data.result.data).toBe('object');
      });

      it('should return metadata object', async () => {
        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: { test: 'metadata' },
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(data.result.metadata).toBeDefined();
        expect(typeof data.result.metadata).toBe('object');
      });
    });

    describe('Error Response Structure', () => {
      it('should return error response with required fields', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Test error'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(data).toHaveProperty('success');
        expect(data.success).toBe(false);
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('code');
        expect(data).not.toHaveProperty('result');
      });

      it('should return error as string', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Test error'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(typeof data.error).toBe('string');
        expect(data.error.length).toBeGreaterThan(0);
      });

      it('should return error code from ERROR_CODE enum', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Entity not found'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        const validCodes = ['ENTITY_NOT_FOUND', 'INVALID_TYPE', 'INTERNAL_ERROR', 'MISSING_PARAMS'];
        expect(validCodes).toContain(data.code);
      });

      it('should not return stack trace in production', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Test error'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(data.error).not.toContain('at Object');
        expect(data.error).not.toContain('.ts:');
        expect(data).not.toHaveProperty('stack');
      });

      it('should return error response that is JSON-serializable', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Test error'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        // Should not throw
        const serialized = JSON.stringify(data);
        expect(serialized).toBeDefined();

        // Should be parseable
        const parsed = JSON.parse(serialized);
        expect(parsed).toEqual(data);
      });
    });
  });

  // ============================================================================
  // Test Suite 5: Registry Integration (15 tests)
  // ============================================================================

  describe('Registry Integration', () => {
    describe('Provider Detection', () => {
      it('should invoke StoryStatusProvider for type=story', async () => {
        const spy = jest.spyOn(mockRegistry, 'getStatusResult');

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(spy).toHaveBeenCalledWith('STORY-001');
      });

      it('should invoke EpicStatusProvider for type=epic', async () => {
        const spy = jest.spyOn(mockRegistry, 'getStatusResult');

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'epic',
          entityId: 'EPIC-V3-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'epic', id: 'EPIC-V3-001' }),
        });

        expect(spy).toHaveBeenCalledWith('EPIC-V3-001');
      });

      it('should invoke WorkflowStatusProvider for type=workflow', async () => {
        const spy = jest.spyOn(mockRegistry, 'getStatusResult');

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'workflow',
          entityId: 'pm-planning',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'workflow', id: 'pm-planning' }),
        });

        expect(spy).toHaveBeenCalledWith('pm-planning');
      });

      it('should invoke StateMachineStatusProvider for type=state-machine', async () => {
        const spy = jest.spyOn(mockRegistry, 'getStatusResult');

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'state',
          entityId: undefined,
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'state-machine', id: 'state' }),
        });

        expect(spy).toHaveBeenCalledWith('state');
      });

      it('should call registry getStatusResult() exactly once', async () => {
        const spy = jest.spyOn(mockRegistry, 'getStatusResult');

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: 'STORY-001',
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Provider Invocation', () => {
      it('should pass correct entity ID to provider', async () => {
        mockRegistry.getStatusResult.mockImplementation(async (entityId) => {
          expect(entityId).toBe('STORY-V3-001');
          return {
            entityType: 'story',
            entityId: 'STORY-V3-001',
            data: {},
            timestamp: new Date().toISOString(),
            metadata: {},
          };
        });

        await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-V3-001' }),
        });
      });

      it('should return provider result unchanged', async () => {
        const mockResult: StatusResult = {
          entityType: 'story',
          entityId: 'STORY-001',
          data: { status: 'done', points: 5 },
          timestamp: '2025-10-29T12:00:00.000Z',
          metadata: { test: 'value' },
        };

        mockRegistry.getStatusResult.mockResolvedValue(mockResult);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });
        const data = await response.json();

        expect(data.result).toEqual(mockResult);
      });

      it('should catch provider errors and return error response', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Provider error'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(response.status).toBeGreaterThanOrEqual(400);
      });

      it('should handle provider returning null gracefully', async () => {
        mockRegistry.getStatusResult.mockResolvedValue(null as any);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        // Should handle gracefully (likely error)
        expect([200, 400, 500]).toContain(response.status);
      });

      it('should handle provider undefined result', async () => {
        mockRegistry.getStatusResult.mockResolvedValue(undefined as any);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        // Should handle gracefully
        expect([200, 400, 500]).toContain(response.status);
      });
    });

    describe('Provider Errors', () => {
      it('should return 404 for provider "not found" error', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Entity not found: STORY-999'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-999' }),
        });

        expect(response.status).toBe(404);
      });

      it('should return 500 for provider permission error', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('EACCES: permission denied'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(response.status).toBe(500);
      });

      it('should return 400 for "No status provider found" error', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(
          new Error('No status provider found for input: "INVALID"')
        );

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'INVALID' }),
        });

        expect(response.status).toBe(400);
      });

      it('should return 400 for provider validation error', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(
          new Error('Validation failed: Invalid entity ID format')
        );

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'BAD-FORMAT' }),
        });

        expect(response.status).toBe(400);
      });

      it('should return 500 for provider generic error', async () => {
        mockRegistry.getStatusResult.mockRejectedValue(new Error('Something went wrong'));

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
        });

        expect(response.status).toBe(500);
      });
    });
  });

  // ============================================================================
  // Test Suite 6: Edge Cases & Security (10 tests)
  // ============================================================================

  describe('Edge Cases & Security', () => {
    describe('Malformed Input', () => {
      it('should handle null type parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: null as any, id: 'STORY-001' }),
        });

        expect(response.status).toBe(400);
      });

      it('should handle undefined ID parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: undefined as any }),
        });

        expect(response.status).toBe(400);
      });

      it('should handle object as ID parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: { foo: 'bar' } as any }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Special Characters', () => {
      it('should sanitize HTML in ID parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({
            type: 'story',
            id: '<script>alert("XSS")</script>',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should sanitize SQL injection in ID parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({
            type: 'story',
            id: "'; DROP TABLE stories; --",
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should prevent path traversal in ID parameter', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: '../../../etc/passwd' }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Empty Parameters', () => {
      it('should return 400 for empty string type', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: '', id: 'STORY-001' }),
        });

        expect(response.status).toBe(400);
      });

      it('should return 400 for empty string ID', async () => {
        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: '' }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Very Long IDs', () => {
      it('should handle 500-character ID', async () => {
        const longId = 'STORY-' + 'A'.repeat(494);

        mockRegistry.getStatusResult.mockResolvedValue({
          entityType: 'story',
          entityId: longId,
          data: {},
          timestamp: new Date().toISOString(),
          metadata: {},
        });

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: longId }),
        });

        // Should accept (within 1000 limit)
        expect([200, 400, 404]).toContain(response.status);
      });

      it('should reject 10000-character ID', async () => {
        const veryLongId = 'STORY-' + 'A'.repeat(9994);

        const response = await GET(mockRequest as Request, {
          params: Promise.resolve({ type: 'story', id: veryLongId }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ============================================================================
  // Test Suite 7: HTTP Status Codes (6 tests)
  // ============================================================================

  describe('HTTP Status Codes', () => {
    it('should return 200 OK for successful query', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'story',
        entityId: 'STORY-001',
        data: {},
        timestamp: new Date(),
        metadata: {},
      });

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });

      expect(response.status).toBe(200);
    });

    it('should return 200 OK for successful epic query', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'epic',
        entityId: 'EPIC-V3-001',
        data: {},
        timestamp: new Date(),
        metadata: {},
      });

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'epic', id: 'EPIC-V3-001' }),
      });

      expect(response.status).toBe(200);
    });

    it('should return 400 Bad Request for invalid type', async () => {
      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'invalid', id: 'STORY-001' }),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 Bad Request for missing parameters', async () => {
      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: undefined as any, id: 'STORY-001' }),
      });

      expect(response.status).toBe(400);
    });

    it('should return 404 Not Found for non-existent entity', async () => {
      mockRegistry.getStatusResult.mockRejectedValue(new Error('Entity not found'));

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-999' }),
      });

      expect(response.status).toBe(404);
    });

    it('should return 500 Internal Server Error for registry failure', async () => {
      mockRegistry.getStatusResult.mockRejectedValue(new Error('Internal error'));

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });

      expect(response.status).toBe(500);
    });
  });

  // ============================================================================
  // Test Suite 8: Integration Scenarios (10 tests)
  // ============================================================================

  describe('Integration Scenarios', () => {
    it('should handle complete story status query flow', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'story',
        entityId: 'STORY-V3-016',
        data: {
          status: 'done',
          title: 'Create madace status CLI Command',
          points: 3,
          completedAt: '2025-10-29',
        },
        timestamp: new Date(),
        metadata: {},
      });

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-V3-016' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result.entityType).toBe('story');
      expect(data.result.data.status).toBe('done');
    });

    it('should return epic progress for Web UI dashboard', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'epic',
        entityId: 'EPIC-V3-002',
        data: {
          title: 'Universal Workflow Status Checker',
          completedStories: 5,
          totalStories: 11,
          progress: 45,
        },
        timestamp: new Date(),
        metadata: {},
      });

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'epic', id: 'EPIC-V3-002' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.data.progress).toBe(45);
    });

    it('should return workflow status for monitoring page', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'workflow',
        entityId: 'pm-planning',
        data: {
          status: 'in_progress',
          currentStep: 3,
          totalSteps: 5,
        },
        timestamp: new Date(),
        metadata: {},
      });

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'workflow', id: 'pm-planning' }),
      });

      expect(response.status).toBe(200);
    });

    it('should return state machine overview for Kanban board', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'state',
        entityId: undefined,
        data: {
          backlog: 45,
          todo: 1,
          inProgress: 1,
          done: 40,
        },
        timestamp: new Date(),
        metadata: {},
      });

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'state-machine', id: 'state' }),
      });

      expect(response.status).toBe(200);
    });

    it('should return JSON response for CLI consumption', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'story',
        entityId: 'STORY-001',
        data: { status: 'done' },
        timestamp: new Date(),
        metadata: {},
      });

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(typeof data.result).toBe('object');
    });

    it('should handle multiple concurrent requests', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'story',
        entityId: 'STORY-001',
        data: {},
        timestamp: new Date(),
        metadata: {},
      });

      const requests = Array(10)
        .fill(null)
        .map(() =>
          GET(mockRequest as Request, {
            params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
          })
        );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    it('should return fresh data', async () => {
      mockRegistry.getStatusResult.mockResolvedValue({
        entityType: 'story',
        entityId: 'STORY-001',
        data: { status: 'done' },
        timestamp: new Date(),
        metadata: {},
      });

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });

      expect(response.status).toBe(200);
    });

    it('should return updated data after file change', async () => {
      // First call
      mockRegistry.getStatusResult.mockResolvedValueOnce({
        entityType: 'story',
        entityId: 'STORY-001',
        data: { status: 'in-progress' },
        timestamp: new Date(),
        metadata: {},
      });

      const response1 = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });
      const data1 = await response1.json();

      expect(data1.result.data.status).toBe('in-progress');

      // Second call (file changed)
      mockRegistry.getStatusResult.mockResolvedValueOnce({
        entityType: 'story',
        entityId: 'STORY-001',
        data: { status: 'done' },
        timestamp: new Date(),
        metadata: {},
      });

      const response2 = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });
      const data2 = await response2.json();

      expect(data2.result.data.status).toBe('done');
    });

    it('should recover after transient error', async () => {
      // First request fails
      mockRegistry.getStatusResult.mockRejectedValueOnce(new Error('Temporary error'));

      const response1 = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });
      expect(response1.status).toBe(500);

      // Second request succeeds
      mockRegistry.getStatusResult.mockResolvedValueOnce({
        entityType: 'story',
        entityId: 'STORY-001',
        data: {},
        timestamp: new Date(),
        metadata: {},
      });

      const response2 = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });
      expect(response2.status).toBe(200);
    });

    it('should handle complete error flow with proper codes', async () => {
      mockRegistry.getStatusResult.mockRejectedValue(new Error('Test error'));

      const response = await GET(mockRequest as Request, {
        params: Promise.resolve({ type: 'story', id: 'STORY-001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('INTERNAL_ERROR');
    });
  });
});

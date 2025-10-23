import { StateMachine } from '@/lib/state/machine';
import fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('StateMachine', () => {
  let machine: StateMachine;
  const mockStatusFile = '/tmp/mam-workflow-status.md';

  beforeEach(() => {
    jest.clearAllMocks();
    machine = new StateMachine(mockStatusFile);
  });

  const validStatusContent = `
# MADACE Workflow Status

## BACKLOG
- [TEST-001] Test Story [Points: 3]
- [TEST-002] Another Test Story [Points: 5]

## TODO
- [TEST-003] Todo Story [Points: 2]

## IN PROGRESS
- [TEST-004] In Progress Story [Points: 8]

## DONE
- [TEST-005] Completed Story [Points: 1]
`;

  describe('load', () => {
    it('should parse status file correctly', async () => {
      mockFs.readFile.mockResolvedValue(validStatusContent);

      await machine.load();

      const status = machine.getStatus();
      expect(status.backlog).toHaveLength(2);
      expect(status.todo).toHaveLength(1);
      expect(status.inProgress).toHaveLength(1);
      expect(status.done).toHaveLength(1);

      // Check story details
      expect(status.backlog[0]?.id).toBe('TEST-001');
      expect(status.backlog[0]?.title).toBe('Test Story');
      expect(status.backlog[0]?.points).toBe(3);
      expect(status.backlog[0]?.state).toBe('BACKLOG');

      expect(status.todo[0]?.id).toBe('TEST-003');
      expect(status.todo[0]?.points).toBe(2);

      expect(status.inProgress[0]?.id).toBe('TEST-004');
      expect(status.inProgress[0]?.points).toBe(8);

      expect(status.done[0]?.id).toBe('TEST-005');
      expect(status.done[0]?.points).toBe(1);
    });

    it('should throw StateMachineError if file read fails', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found') as any);

      await expect(machine.load()).rejects.toThrow('Failed to load status file');
    });

    it('should handle file without any stories', async () => {
      const emptyStatus = `
# MADACE Workflow Status

## BACKLOG

## TODO

## IN PROGRESS

## DONE
`;
      mockFs.readFile.mockResolvedValue(emptyStatus);

      await machine.load();

      const status = machine.getStatus();
      expect(status.backlog).toHaveLength(0);
      expect(status.todo).toHaveLength(0);
      expect(status.inProgress).toHaveLength(0);
      expect(status.done).toHaveLength(0);
    });

    it('should handle stories without points', async () => {
      const noPointsStatus = `
## BACKLOG
- [TEST-NP] Story Without Points

## DONE
- [TEST-DP] Done Story [Points: 4]
`;
      mockFs.readFile.mockResolvedValue(noPointsStatus);

      await machine.load();

      const status = machine.getStatus();
      expect(status.backlog[0]?.points).toBeUndefined();
      expect(status.done[0]?.points).toBe(4);
    });
  });

  describe('validate', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(validStatusContent);
      await machine.load();
    });

    it('should pass validation for correct state', () => {
      const validation = machine.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation with too many TODO stories', () => {
      const invalidStatusContent = `
## TODO
- [TEST-001] Story 1
- [TEST-002] Story 2
`;

      // Manipulate the internal state for testing
      machine['status'].todo = [
        { id: 'TEST-001', title: 'Story 1', state: 'TODO' },
        { id: 'TEST-002', title: 'Story 2', state: 'TODO' },
      ];

      const validation = machine.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Too many stories in TODO: 2 (expected 1)');
    });

    it('should fail validation with too many IN PROGRESS stories', () => {
      machine['status'].inProgress = [
        { id: 'TEST-001', title: 'Story 1', state: 'IN_PROGRESS' },
        { id: 'TEST-002', title: 'Story 2', state: 'IN_PROGRESS' },
      ];

      const validation = machine.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Too many stories in IN PROGRESS: 2 (expected 1)');
    });
  });

  describe('canTransition', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(validStatusContent);
      await machine.load();
    });

    it('should allow valid transitions', () => {
      expect(machine.canTransition('TEST-001', 'TODO')).toBe(true); // BACKLOG -> TODO
      expect(machine.canTransition('TEST-003', 'IN_PROGRESS')).toBe(true); // TODO -> IN_PROGRESS
      expect(machine.canTransition('TEST-004', 'DONE')).toBe(true); // IN_PROGRESS -> DONE
      expect(machine.canTransition('TEST-003', 'BACKLOG')).toBe(true); // TODO -> BACKLOG
    });

    it('should prevent invalid transitions', () => {
      expect(machine.canTransition('TEST-001', 'IN_PROGRESS')).toBe(false); // BACKLOG -> IN_PROGRESS (invalid)
      expect(machine.canTransition('TEST-001', 'DONE')).toBe(false); // BACKLOG -> DONE (invalid)
      expect(machine.canTransition('TEST-005', 'TODO')).toBe(false); // DONE -> TODO (invalid)
    });

    it('should return false for non-existent stories', () => {
      expect(machine.canTransition('NONEXISTENT', 'TODO')).toBe(false);
    });
  });

  describe('transition', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(validStatusContent);
      await machine.load();
    });

    it('should perform valid transition successfully', async () => {
      // Mock save method
      mockFs.writeFile = jest.fn().mockResolvedValue(undefined);

      // First move existing TODO story back to BACKLOG to make room
      await machine.transition('TEST-003', 'BACKLOG');

      // Now move TEST-001 to TODO
      await machine.transition('TEST-001', 'TODO');

      const status = machine.getStatus();
      expect(status.backlog).toHaveLength(2); // TEST-003 moved back, TEST-002 remains
      expect(status.todo).toHaveLength(1); // TEST-001 in TODO

      const movedStory = status.todo.find((s) => s.id === 'TEST-001');
      expect(movedStory).toBeDefined();
      expect(movedStory!.state).toBe('TODO');
    });

    it('should throw error for invalid transition', async () => {
      await expect(machine.transition('TEST-001', 'IN_PROGRESS')).rejects.toThrow(
        'Invalid transition'
      );
    });

    it('should throw error for story not found', async () => {
      await expect(machine.transition('NONEXISTENT', 'TODO')).rejects.toThrow(
        'Story not found: NONEXISTENT'
      );
    });

    it('should prevent transition to TODO if already has one', async () => {
      await expect(machine.transition('TEST-002', 'TODO')).rejects.toThrow(
        'Cannot move to TODO: already has 1 story'
      );
    });

    it('should prevent transition to IN_PROGRESS if already has one', async () => {
      // First need to move TEST-002 to TODO (BACKLOG -> TODO is valid)
      // First move existing TEST-003 out of TODO
      await machine.transition('TEST-003', 'BACKLOG');
      // Now move TEST-002 to TODO
      await machine.transition('TEST-002', 'TODO');

      // Now try to move to IN_PROGRESS when one already exists (TEST-004)
      await expect(machine.transition('TEST-002', 'IN_PROGRESS')).rejects.toThrow(
        'Cannot move to IN_PROGRESS: already has 1 story'
      );
    });
  });

  describe('getCurrent* helpers', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(validStatusContent);
      await machine.load();
    });

    it('should return current TODO story', () => {
      const currentTodo = machine.getCurrentTodo();
      expect(currentTodo).toBeDefined();
      expect(currentTodo!.id).toBe('TEST-003');
    });

    it('should return current IN PROGRESS story', () => {
      const currentInProgress = machine.getCurrentInProgress();
      expect(currentInProgress).toBeDefined();
      expect(currentInProgress!.id).toBe('TEST-004');
    });

    it('should return undefined when no story in state', () => {
      machine['status'].todo = [];
      expect(machine.getCurrentTodo()).toBeUndefined();

      machine['status'].inProgress = [];
      expect(machine.getCurrentInProgress()).toBeUndefined();
    });
  });
});

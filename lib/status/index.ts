/**
 * MADACE Status Module
 *
 * Unified status checking system for all MADACE entities.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Type Exports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
  EntityType,
  StatusFormat,
  StatusResult,
  IStatusProvider,
  StatusProviderEntry,
  StatusQueryOptions,
} from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider Exports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  StoryStatusProvider,
  createStoryStatusProvider,
} from './providers/story-provider';

export {
  EpicStatusProvider,
  createEpicStatusProvider,
} from './providers/epic-provider';

export {
  WorkflowStatusProvider,
  createWorkflowStatusProvider,
} from './providers/workflow-provider';

export {
  StateMachineStatusProvider,
  createStateMachineStatusProvider,
} from './providers/state-machine-provider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Registry Exports (Primary API)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  StatusProviderRegistry,
  getStatusRegistry,
  getStatus,
  getStatusResult,
} from './registry';

/**
 * MADACE Status Module
 *
 * Unified status checking system for all MADACE entities.
 */

export type {
  EntityType,
  StatusFormat,
  StatusResult,
  IStatusProvider,
  StatusProviderEntry,
  StatusQueryOptions,
} from './types';

export {
  StateMachineStatusProvider,
  createStateMachineStatusProvider,
} from './providers/state-machine-provider';

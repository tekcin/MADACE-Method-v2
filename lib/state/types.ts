/**
 * State Machine Types
 */

export type StoryState = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Story {
  id: string;
  title: string;
  state: StoryState;
  points?: number;
  description?: string;
  milestone?: string;
}

export interface WorkflowStatus {
  backlog: Story[];
  todo: Story[];
  inProgress: Story[];
  done: Story[];
}

export interface StateTransition {
  storyId: string;
  from: StoryState;
  to: StoryState;
  timestamp: Date;
}

export interface StateValidationResult {
  valid: boolean;
  errors: string[];
}

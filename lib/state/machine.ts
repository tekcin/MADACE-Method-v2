/**
 * State Machine
 *
 * Manages story lifecycle with strict transition rules.
 */

import fs from 'fs/promises';
import path from 'path';
import type { Story, StoryState, WorkflowStatus, StateValidationResult } from './types';

export class StateMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateMachineError';
  }
}

export class StateMachine {
  private statusFilePath: string;
  private status: WorkflowStatus = {
    backlog: [],
    todo: [],
    inProgress: [],
    done: [],
  };

  constructor(statusFilePath: string) {
    this.statusFilePath = path.resolve(statusFilePath);
  }

  async load(): Promise<void> {
    try {
      // Check if file exists first
      try {
        await fs.access(this.statusFilePath);
      } catch {
        // File doesn't exist - initialize with empty state
        this.status = {
          backlog: [],
          todo: [],
          inProgress: [],
          done: [],
        };
        return;
      }

      const content = await fs.readFile(this.statusFilePath, 'utf-8');
      this.status = this.parseStatusFile(content);
    } catch (error) {
      throw new StateMachineError(
        `Failed to load status file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private parseStatusFile(content: string): WorkflowStatus {
    // Simplified parser - extracts stories from markdown sections
    const status: WorkflowStatus = {
      backlog: [],
      todo: [],
      inProgress: [],
      done: [],
    };

    const lines = content.split('\n');
    let currentSection: StoryState | null = null;

    for (const line of lines) {
      // Detect sections
      if (line.includes('## BACKLOG')) currentSection = 'BACKLOG';
      else if (line.includes('## TODO')) currentSection = 'TODO';
      else if (line.includes('## IN PROGRESS')) currentSection = 'IN_PROGRESS';
      else if (line.includes('## DONE')) currentSection = 'DONE';

      // Parse story lines (e.g., "- [CORE-015] State Machine")
      if (currentSection && line.match(/^-\s*\[([^\]]+)\]/)) {
        const match = line.match(/^-\s*\[([^\]]+)\]\s*(.+?)(?:\s*\[Points:\s*(\d+)\])?$/);
        if (match && match[1] && match[2]) {
          const story: Story = {
            id: match[1].trim(),
            title: match[2].replace(/\s*\[Points:\s*\d+\]\s*$/, '').trim(),
            state: currentSection,
            points: match[3] ? parseInt(match[3]) : undefined,
          };

          if (currentSection === 'BACKLOG') status.backlog.push(story);
          else if (currentSection === 'TODO') status.todo.push(story);
          else if (currentSection === 'IN_PROGRESS') status.inProgress.push(story);
          else if (currentSection === 'DONE') status.done.push(story);
        }
      }
    }

    return status;
  }

  validate(): StateValidationResult {
    const errors: string[] = [];

    // Rule 1: Only ONE story in TODO
    if (this.status.todo.length > 1) {
      errors.push(`Too many stories in TODO: ${this.status.todo.length} (expected 1)`);
    }

    // Rule 2: Only ONE story in IN_PROGRESS
    if (this.status.inProgress.length > 1) {
      errors.push(`Too many stories in IN PROGRESS: ${this.status.inProgress.length} (expected 1)`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  canTransition(storyId: string, to: StoryState): boolean {
    const story = this.findStory(storyId);
    if (!story) return false;

    // Valid transitions
    const validTransitions: Record<StoryState, StoryState[]> = {
      BACKLOG: ['TODO'],
      TODO: ['IN_PROGRESS', 'BACKLOG'],
      IN_PROGRESS: ['DONE', 'TODO'],
      DONE: [],
    };

    const allowed = validTransitions[story.state];
    return allowed ? allowed.includes(to) : false;
  }

  async transition(storyId: string, to: StoryState): Promise<void> {
    const story = this.findStory(storyId);
    if (!story) {
      throw new StateMachineError(`Story not found: ${storyId}`);
    }

    if (!this.canTransition(storyId, to)) {
      throw new StateMachineError(
        `Invalid transition: ${story.state} → ${to} for story ${storyId}`
      );
    }

    // Check constraints before transition
    if (to === 'TODO' && this.status.todo.length >= 1) {
      throw new StateMachineError('Cannot move to TODO: already has 1 story');
    }

    if (to === 'IN_PROGRESS' && this.status.inProgress.length >= 1) {
      throw new StateMachineError('Cannot move to IN_PROGRESS: already has 1 story');
    }

    // Perform transition
    this.removeStoryFromCurrentState(story);
    story.state = to;
    this.addStoryToState(story, to);

    // Persist changes
    await this.save();
  }

  private findStory(storyId: string): Story | undefined {
    return (
      this.status.backlog.find((s) => s.id === storyId) ||
      this.status.todo.find((s) => s.id === storyId) ||
      this.status.inProgress.find((s) => s.id === storyId) ||
      this.status.done.find((s) => s.id === storyId)
    );
  }

  private removeStoryFromCurrentState(story: Story): void {
    if (story.state === 'BACKLOG') {
      this.status.backlog = this.status.backlog.filter((s) => s.id !== story.id);
    } else if (story.state === 'TODO') {
      this.status.todo = this.status.todo.filter((s) => s.id !== story.id);
    } else if (story.state === 'IN_PROGRESS') {
      this.status.inProgress = this.status.inProgress.filter((s) => s.id !== story.id);
    } else if (story.state === 'DONE') {
      this.status.done = this.status.done.filter((s) => s.id !== story.id);
    }
  }

  private addStoryToState(story: Story, state: StoryState): void {
    if (state === 'BACKLOG') this.status.backlog.push(story);
    else if (state === 'TODO') this.status.todo.push(story);
    else if (state === 'IN_PROGRESS') this.status.inProgress.push(story);
    else if (state === 'DONE') this.status.done.push(story);
  }

  private async save(): Promise<void> {
    // Validate before saving
    const validation = this.validate();
    if (!validation.valid) {
      throw new StateMachineError(`Invalid state: ${validation.errors.join(', ')}`);
    }

    // Generate markdown content
    const markdown = this.generateMarkdown();

    // Write to file
    try {
      await fs.writeFile(this.statusFilePath, markdown, 'utf-8');
    } catch (error) {
      throw new StateMachineError(
        `Failed to save status file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private generateMarkdown(): string {
    const lines: string[] = [];

    // Add header
    lines.push('# MAM Workflow Status');
    lines.push('');
    lines.push(
      '**MADACE** = **M**ethodology for **A**I-**D**riven **A**gile **C**ollaboration **E**ngine'
    );
    lines.push('');
    lines.push('**Project:** MADACE-Method v2.0 - Experimental Next.js Full-Stack Implementation');
    lines.push(`**Last Updated:** ${new Date().toISOString().split('T')[0]}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Add BACKLOG section
    lines.push('## BACKLOG');
    lines.push('');
    if (this.status.backlog.length > 0) {
      // Group by milestone if available
      const byMilestone = this.groupByMilestone(this.status.backlog);
      for (const [milestone, stories] of Object.entries(byMilestone)) {
        if (milestone !== 'undefined') {
          lines.push(`### ${milestone}`);
          lines.push('');
        }
        for (const story of stories) {
          lines.push(this.formatStoryLine(story));
        }
        lines.push('');
      }
    } else {
      lines.push('(Empty)');
      lines.push('');
    }
    lines.push('---');
    lines.push('');

    // Add TODO section
    lines.push('## TODO');
    lines.push('');
    lines.push('Story ready for drafting (only ONE at a time):');
    lines.push('');
    if (this.status.todo.length > 0) {
      for (const story of this.status.todo) {
        lines.push(this.formatStoryLine(story));
      }
    } else {
      lines.push('(Empty)');
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    // Add IN PROGRESS section
    lines.push('## IN PROGRESS');
    lines.push('');
    lines.push('Story being implemented (only ONE at a time):');
    lines.push('');
    if (this.status.inProgress.length > 0) {
      for (const story of this.status.inProgress) {
        lines.push(this.formatStoryLine(story));
      }
    } else {
      lines.push('(Empty)');
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    // Add DONE section
    lines.push('## DONE');
    lines.push('');
    lines.push('Completed stories with dates and points:');
    lines.push('');
    if (this.status.done.length > 0) {
      for (const story of this.status.done) {
        lines.push(this.formatStoryLine(story));
      }
    } else {
      lines.push('(Empty)');
    }
    lines.push('');

    return lines.join('\n');
  }

  private formatStoryLine(story: Story): string {
    let line = `- [${story.id}] ${story.title}`;
    if (story.points !== undefined) {
      line += ` [Points: ${story.points}]`;
    }
    return line;
  }

  private groupByMilestone(stories: Story[]): Record<string, Story[]> {
    const grouped: Record<string, Story[]> = {};
    for (const story of stories) {
      const milestone = story.milestone || 'undefined';
      if (!grouped[milestone]) {
        grouped[milestone] = [];
      }
      grouped[milestone].push(story);
    }
    return grouped;
  }

  getStatus(): WorkflowStatus {
    return { ...this.status };
  }

  getCurrentTodo(): Story | undefined {
    return this.status.todo[0];
  }

  getCurrentInProgress(): Story | undefined {
    return this.status.inProgress[0];
  }
}

export function createStateMachine(statusFilePath: string): StateMachine {
  return new StateMachine(statusFilePath);
}

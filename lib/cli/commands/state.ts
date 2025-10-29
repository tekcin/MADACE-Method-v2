/**
 * State Machine CLI Commands
 *
 * Commands for managing MADACE state machine via CLI
 */

import { Command } from 'commander';
import { createStateMachine, StateMachineError } from '@/lib/state/machine';
import { formatKeyValue, formatTable, formatJSON } from '@/lib/cli/formatters';
import { resolve } from 'path';
import { existsSync } from 'fs';
import type { StoryState } from '@/lib/state/types';

/**
 * Create state command group
 */
export function createStateCommand(): Command {
  const state = new Command('state');
  state.description('Manage state machine');

  // state show
  state
    .command('show')
    .description('Show state machine status')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Load state machine
        const statusFile = resolve(process.cwd(), 'docs/workflow-status.md');
        if (!existsSync(statusFile)) {
          console.error('Workflow status file not found: docs/workflow-status.md');
          process.exit(1);
        }

        const machine = createStateMachine(statusFile);
        await machine.load();

        const status = machine.getStatus();
        const validation = machine.validate();

        if (options.json) {
          console.log(
            formatJSON({
              status,
              validation,
            })
          );
          return;
        }

        // Display current state
        const currentTodo = machine.getCurrentTodo();
        const currentInProgress = machine.getCurrentInProgress();

        console.log(
          formatKeyValue(
            {
              'Current TODO': currentTodo ? `[${currentTodo.id}] ${currentTodo.title}` : 'None',
              'Current IN PROGRESS': currentInProgress
                ? `[${currentInProgress.id}] ${currentInProgress.title}`
                : 'None',
              'Backlog Count': status.backlog.length,
              'TODO Count': status.todo.length,
              'In Progress Count': status.inProgress.length,
              'Done Count': status.done.length,
              'Validation': validation.valid ? '✅ Valid' : '❌ Invalid',
            },
            'State Machine Status'
          )
        );

        if (!validation.valid) {
          console.log('\n⚠️  Validation Errors:');
          validation.errors.forEach((error) => console.log(`   - ${error}`));
          console.log();
        }

        // Show stories in each state
        if (status.backlog.length > 0) {
          console.log('\nBacklog:');
          console.log(
            formatTable({
              columns: [
                { key: 'id', label: 'ID', width: 12 },
                { key: 'title', label: 'Title', width: 50 },
                { key: 'points', label: 'Points', width: 8, align: 'right' },
              ],
              data: status.backlog as unknown as Record<string, unknown>[],
            })
          );
        }

        if (status.todo.length > 0) {
          console.log('\nTODO:');
          console.log(
            formatTable({
              columns: [
                { key: 'id', label: 'ID', width: 12 },
                { key: 'title', label: 'Title', width: 50 },
                { key: 'points', label: 'Points', width: 8, align: 'right' },
              ],
              data: status.todo as unknown as Record<string, unknown>[],
            })
          );
        }

        if (status.inProgress.length > 0) {
          console.log('\nIN PROGRESS:');
          console.log(
            formatTable({
              columns: [
                { key: 'id', label: 'ID', width: 12 },
                { key: 'title', label: 'Title', width: 50 },
                { key: 'points', label: 'Points', width: 8, align: 'right' },
              ],
              data: status.inProgress as unknown as Record<string, unknown>[],
            })
          );
        }
      } catch (error) {
        console.error('Error showing state machine:', error);
        process.exit(1);
      }
    });

  // state transition <story-id> <new-state>
  state
    .command('transition <story-id> <new-state>')
    .description('Transition story to new state')
    .option('--json', 'Output as JSON')
    .action(async (storyId, newState, options) => {
      try {
        // Validate state
        const validStates = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'];
        const normalizedState = newState.toUpperCase().replace(/[-\s]/g, '_');

        if (!validStates.includes(normalizedState)) {
          console.error(
            `Invalid state '${newState}'. Valid states: BACKLOG, TODO, IN_PROGRESS, DONE`
          );
          process.exit(1);
        }

        // Load state machine
        const statusFile = resolve(process.cwd(), 'docs/workflow-status.md');
        if (!existsSync(statusFile)) {
          console.error('Workflow status file not found: docs/workflow-status.md');
          process.exit(1);
        }

        const machine = createStateMachine(statusFile);
        await machine.load();

        // Check if transition is valid
        if (!machine.canTransition(storyId, normalizedState as StoryState)) {
          const status = machine.getStatus();
          const story =
            status.backlog.find((s) => s.id === storyId) ||
            status.todo.find((s) => s.id === storyId) ||
            status.inProgress.find((s) => s.id === storyId) ||
            status.done.find((s) => s.id === storyId);

          if (!story) {
            console.error(`Story '${storyId}' not found`);
            process.exit(1);
          }

          console.error(
            `Invalid transition: ${story.state} → ${normalizedState} for story ${storyId}`
          );
          console.log('\nValid transitions:');
          console.log('   BACKLOG → TODO');
          console.log('   TODO → IN_PROGRESS or BACKLOG');
          console.log('   IN_PROGRESS → DONE or TODO');
          console.log('   DONE → (no transitions)');
          process.exit(1);
        }

        // Perform transition
        try {
          await machine.transition(storyId, normalizedState as StoryState);

          if (options.json) {
            console.log(
              formatJSON({
                success: true,
                message: `Story '${storyId}' transitioned to ${normalizedState}`,
                storyId,
                newState: normalizedState,
              })
            );
            return;
          }

          console.log(`\n✅ Story '${storyId}' transitioned to ${normalizedState}!\n`);
        } catch (error) {
          if (error instanceof StateMachineError) {
            console.error(`\n❌ Transition failed: ${error.message}\n`);
          } else {
            console.error('Error performing transition:', error);
          }
          process.exit(1);
        }
      } catch (error) {
        console.error('Error transitioning story:', error);
        process.exit(1);
      }
    });

  // state stats
  state
    .command('stats')
    .description('Show state machine statistics')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Load state machine
        const statusFile = resolve(process.cwd(), 'docs/workflow-status.md');
        if (!existsSync(statusFile)) {
          console.error('Workflow status file not found: docs/workflow-status.md');
          process.exit(1);
        }

        const machine = createStateMachine(statusFile);
        await machine.load();

        const status = machine.getStatus();
        const validation = machine.validate();

        // Calculate statistics
        const allStories = [
          ...status.backlog,
          ...status.todo,
          ...status.inProgress,
          ...status.done,
        ];

        const totalStories = allStories.length;
        const totalPoints = allStories.reduce((sum, s) => sum + (s.points || 0), 0);

        const completedStories = status.done.length;
        const completedPoints = status.done.reduce((sum, s) => sum + (s.points || 0), 0);

        const inProgressStories = status.inProgress.length;
        const inProgressPoints = status.inProgress.reduce((sum, s) => sum + (s.points || 0), 0);

        const todoStories = status.todo.length;
        const todoPoints = status.todo.reduce((sum, s) => sum + (s.points || 0), 0);

        const backlogStories = status.backlog.length;
        const backlogPoints = status.backlog.reduce((sum, s) => sum + (s.points || 0), 0);

        const completionRate =
          totalPoints > 0 ? ((completedPoints / totalPoints) * 100).toFixed(1) : '0.0';

        const velocityByDone = completedStories > 0 ? (completedPoints / completedStories).toFixed(1) : '0.0';

        const stats = {
          'Total Stories': totalStories,
          'Total Points': totalPoints,
          'Completed Stories': completedStories,
          'Completed Points': completedPoints,
          'In Progress Stories': inProgressStories,
          'In Progress Points': inProgressPoints,
          'TODO Stories': todoStories,
          'TODO Points': todoPoints,
          'Backlog Stories': backlogStories,
          'Backlog Points': backlogPoints,
          'Completion Rate': `${completionRate}%`,
          'Avg Points per Story': velocityByDone,
          'State Machine Valid': validation.valid ? 'Yes' : 'No',
        };

        if (options.json) {
          console.log(
            formatJSON({
              ...stats,
              validation,
              status,
            })
          );
          return;
        }

        console.log(formatKeyValue(stats, 'State Machine Statistics'));

        if (!validation.valid) {
          console.log('\n⚠️  Validation Errors:');
          validation.errors.forEach((error) => console.log(`   - ${error}`));
          console.log();
        }

        // Show velocity chart
        if (status.done.length > 0) {
          console.log('\nCompleted Stories by Points:');
          const doneByPoints = status.done
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 10);

          console.log(
            formatTable({
              columns: [
                { key: 'id', label: 'ID', width: 12 },
                { key: 'title', label: 'Title', width: 40 },
                { key: 'points', label: 'Points', width: 8, align: 'right' },
              ],
              data: doneByPoints as unknown as Record<string, unknown>[],
            })
          );
        }
      } catch (error) {
        console.error('Error getting state machine statistics:', error);
        process.exit(1);
      }
    });

  return state;
}

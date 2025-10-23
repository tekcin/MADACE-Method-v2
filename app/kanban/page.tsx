'use client';

import { useEffect, useState } from 'react';
import type { WorkflowStatus, Story } from '@/lib/state/types';

export default function KanbanPage() {
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflowStatus();
  }, []);

  const loadWorkflowStatus = async () => {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
      } else {
        setError(data.error || 'Failed to load workflow status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading workflow status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-red-500 bg-red-500/10 p-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600 dark:text-red-400">Error</h2>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadWorkflowStatus}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-lg px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  // Calculate statistics
  const totalCompleted = status.done.length;
  const totalPoints = status.done.reduce(
    (sum: number, story: Story) => sum + (story.points || 0),
    0
  );
  const backlogCount = status.backlog.length;
  const todoCount = status.todo.length;
  const inProgressCount = status.inProgress.length;

  // Group backlog by milestone
  const backlogByMilestone: Record<string, Story[]> = {};
  status.backlog.forEach((story: Story) => {
    const milestone = story.milestone || 'Other';
    if (!backlogByMilestone[milestone]) {
      backlogByMilestone[milestone] = [];
    }
    backlogByMilestone[milestone].push(story);
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">MADACE Workflow Status</h1>
        <p className="text-muted-foreground">Visual Kanban board for project progress tracking</p>
      </div>

      {/* Statistics Panel */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">Backlog</div>
          <div className="text-2xl font-bold">{backlogCount}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">TODO</div>
          <div className="text-2xl font-bold">
            {todoCount}
            {todoCount > 1 && <span className="text-xs text-red-500"> ⚠️</span>}
          </div>
          <div className="text-muted-foreground text-xs">Limit: 1</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">In Progress</div>
          <div className="text-2xl font-bold">
            {inProgressCount}
            {inProgressCount > 1 && <span className="text-xs text-red-500"> ⚠️</span>}
          </div>
          <div className="text-muted-foreground text-xs">Limit: 1</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">Done</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalCompleted}
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">Total Points</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {totalPoints}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* BACKLOG Column */}
        <div className="bg-card flex flex-col rounded-lg border">
          <div className="border-b p-4">
            <h2 className="font-semibold">BACKLOG</h2>
            <div className="text-muted-foreground text-sm">
              {backlogCount} stories
              {backlogCount > 0 && (
                <span className="ml-2">
                  •{' '}
                  {status.backlog.reduce(
                    (sum: number, story: Story) => sum + (story.points || 0),
                    0
                  )}{' '}
                  pts
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-4 p-4">
            {Object.entries(backlogByMilestone).map(([milestone, stories]) => (
              <div key={milestone} className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">{milestone}</h3>
                {stories.map((story: Story) => (
                  <StoryCard key={story.id} story={story} state="backlog" />
                ))}
              </div>
            ))}
            {backlogCount === 0 && (
              <div className="text-muted-foreground text-center text-sm">No stories in backlog</div>
            )}
          </div>
        </div>

        {/* TODO Column */}
        <div className="bg-card flex flex-col rounded-lg border">
          <div className="border-b p-4">
            <h2 className="font-semibold">TODO</h2>
            <div className="text-muted-foreground text-sm">
              {todoCount} story • Limit: 1
              {todoCount > 1 && <span className="ml-2 text-red-500">⚠️ Exceeds limit</span>}
            </div>
          </div>
          <div className="flex-1 space-y-2 p-4">
            {status.todo.map((story: Story) => (
              <StoryCard key={story.id} story={story} state="todo" />
            ))}
            {todoCount === 0 && (
              <div className="text-muted-foreground text-center text-sm">No story in TODO</div>
            )}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="bg-card flex flex-col rounded-lg border">
          <div className="border-b p-4">
            <h2 className="font-semibold">IN PROGRESS</h2>
            <div className="text-muted-foreground text-sm">
              {inProgressCount} story • Limit: 1
              {inProgressCount > 1 && <span className="ml-2 text-red-500">⚠️ Exceeds limit</span>}
            </div>
          </div>
          <div className="flex-1 space-y-2 p-4">
            {status.inProgress.map((story: Story) => (
              <StoryCard key={story.id} story={story} state="in_progress" />
            ))}
            {inProgressCount === 0 && (
              <div className="text-muted-foreground text-center text-sm">No story in progress</div>
            )}
          </div>
        </div>

        {/* DONE Column */}
        <div className="bg-card flex flex-col rounded-lg border">
          <div className="border-b p-4">
            <h2 className="font-semibold">DONE</h2>
            <div className="text-muted-foreground text-sm">
              {totalCompleted} stories • {totalPoints} pts
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4" style={{ maxHeight: '70vh' }}>
            {status.done.map((story: Story) => (
              <StoryCard key={story.id} story={story} state="done" />
            ))}
            {totalCompleted === 0 && (
              <div className="text-muted-foreground text-center text-sm">No completed stories</div>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadWorkflowStatus}
          className="border-border bg-background hover:bg-muted rounded-lg border px-4 py-2 text-sm"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}

// Story Card Component
interface StoryCardProps {
  story: Story;
  state: 'backlog' | 'todo' | 'in_progress' | 'done';
}

function StoryCard({ story, state }: StoryCardProps) {
  const stateColors = {
    backlog: 'border-gray-300 dark:border-gray-700',
    todo: 'border-blue-500 bg-blue-500/5',
    in_progress: 'border-yellow-500 bg-yellow-500/5',
    done: 'border-green-500 bg-green-500/5',
  };

  return (
    <div className={`bg-card rounded-lg border-2 p-3 ${stateColors[state]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{story.id}</h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{story.title}</p>
        </div>
        <span className="bg-primary/10 ml-2 rounded-full px-2 py-1 text-xs font-medium">
          {story.points}
        </span>
      </div>
      {story.milestone && (
        <div className="text-muted-foreground mt-2 text-xs">
          <span className="bg-muted rounded px-1 py-0.5">{story.milestone}</span>
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * WorkflowCard Component
 *
 * Displays individual workflow information with name, description, phase, and agent.
 * Part of the workflow execution UI.
 */

export interface WorkflowCardData {
  name: string;
  description: string;
  agent?: string;
  phase?: number;
  stepCount?: number;
}

export interface WorkflowCardProps {
  workflow: WorkflowCardData;
  onExecute?: (workflowName: string) => void;
  onClick?: (workflowName: string) => void;
}

export function WorkflowCard({ workflow, onExecute, onClick }: WorkflowCardProps) {
  const handleExecuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExecute) {
      onExecute(workflow.name);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(workflow.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      data-testid={`workflow-card-${workflow.name}`}
      className="group cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-6 transition-all hover:border-blue-400 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:focus:ring-offset-gray-900"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white" data-testid="workflow-name">
          {workflow.name}
        </h3>
        {workflow.phase !== undefined && (
          <span
            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            data-testid="workflow-phase-badge"
          >
            Phase {workflow.phase}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400" data-testid="workflow-description">
        {workflow.description}
      </p>

      {/* Meta information */}
      <div
        className="mb-4 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400"
        data-testid="workflow-metadata"
      >
        {workflow.agent && (
          <div className="flex items-center" data-testid="workflow-agent">
            <svg className="mr-1.5 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Agent: {workflow.agent}</span>
          </div>
        )}
        {workflow.stepCount !== undefined && (
          <div className="flex items-center" data-testid="workflow-step-count">
            <svg className="mr-1.5 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>{workflow.stepCount} steps</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleExecuteClick}
          data-testid="workflow-execute-button"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
        >
          <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Execute Workflow
        </button>
        <span
          className="text-sm text-gray-400 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400"
          data-testid="workflow-details-link"
        >
          Click for details →
        </span>
      </div>
    </div>
  );
}

'use client';

/**
 * WorkflowExecutionPanel Component
 *
 * Displays workflow execution progress with step-by-step visualization.
 * Shows current step, completed steps, and allows manual progression.
 */

export interface WorkflowExecutionStep {
  name: string;
  action: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  message?: string;
  error?: string;
}

export interface WorkflowExecutionState {
  workflowName: string;
  currentStep: number;
  totalSteps: number;
  steps: WorkflowExecutionStep[];
  variables: Record<string, unknown>;
  completed: boolean;
  paused?: boolean;
  startedAt: Date;
}

export interface WorkflowExecutionPanelProps {
  state: WorkflowExecutionState;
  onExecuteNext?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  loading?: boolean;
}

export function WorkflowExecutionPanel({
  state,
  onExecuteNext,
  onPause,
  onResume,
  onCancel,
  onReset,
  loading = false,
}: WorkflowExecutionPanelProps) {
  const progress = state.totalSteps > 0 ? (state.currentStep / state.totalSteps) * 100 : 0;

  const getStepIcon = (status: WorkflowExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="size-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'in-progress':
        return (
          <div className="size-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        );
      case 'failed':
        return (
          <svg className="size-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <div className="size-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{state.workflowName}</h2>
          <div className="flex gap-2">
            {state.completed && (
              <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                Completed
              </span>
            )}
            {state.paused && !state.completed && (
              <span className="rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Paused
              </span>
            )}
            {!state.paused && !state.completed && loading && (
              <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Running
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-gray-600 dark:text-gray-400">
              {state.currentStep} / {state.totalSteps} steps
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {/* Execute/Resume Button */}
          {!state.completed && !state.paused && (
            <button
              onClick={onExecuteNext}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
            >
              {loading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Executing...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                  Execute Next Step
                </>
              )}
            </button>
          )}

          {/* Resume Button (when paused) */}
          {state.paused && !state.completed && onResume && (
            <button
              onClick={onResume}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-offset-gray-800"
            >
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
              Resume
            </button>
          )}

          {/* Pause Button (when running) */}
          {!state.completed && !state.paused && onPause && (
            <button
              onClick={onPause}
              disabled={loading}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
            >
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
              Pause
            </button>
          )}

          {/* Cancel Button */}
          {!state.completed && onCancel && (
            <button
              onClick={onCancel}
              className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:ring-offset-gray-900"
            >
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
          >
            <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Execution Steps</h3>
        {state.steps.map((step, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${
              step.status === 'in-progress'
                ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                : step.status === 'completed'
                  ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                  : step.status === 'failed'
                    ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-start">
              <div className="mt-0.5 mr-4 flex-shrink-0">{getStepIcon(step.status)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {index + 1}. {step.name}
                  </h4>
                  <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {step.action}
                  </span>
                </div>
                {step.message && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{step.message}</p>
                )}
                {step.error && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{step.error}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Variables */}
      {Object.keys(state.variables).length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Workflow Variables
          </h3>
          <div className="space-y-2">
            {Object.entries(state.variables).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start border-b border-gray-100 pb-2 last:border-0 dark:border-gray-700"
              >
                <code className="mr-3 font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                  {key}:
                </code>
                <code className="font-mono text-sm text-gray-700 dark:text-gray-300">
                  {JSON.stringify(value)}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

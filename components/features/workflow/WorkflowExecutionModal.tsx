/**
 * Workflow Execution Modal
 * 
 * Displays workflow execution progress with real-time updates
 */

'use client';

import { useState, useEffect } from 'react';

interface WorkflowStep {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  name?: string;
  result?: unknown;
  error?: string;
}

interface WorkflowExecutionModalProps {
  workflowName: string;
  workflowDescription?: string;
  onClose: () => void;
  variables?: Record<string, unknown>;
}

export function WorkflowExecutionModal({
  workflowName,
  workflowDescription,
  onClose,
  variables,
}: WorkflowExecutionModalProps) {
  const [status, setStatus] = useState<'initializing' | 'running' | 'completed' | 'failed'>(
    'initializing'
  );
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [_currentStepIndex, _setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  useEffect(() => {
    executeWorkflow();
  }, []);

  const executeWorkflow = async () => {
    try {
      setStatus('running');

      // Execute workflow
      const response = await fetch(`/api/workflows/${workflowName}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialize: true,
          variables: variables || {},
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Workflow execution failed');
      }

      // Update status based on result
      if (data.completed) {
        setStatus('completed');
        setResult(data.result);
      } else {
        // Workflow is still running (step-by-step execution)
        setStatus('running');
        setSteps([
          {
            id: 'step-1',
            status: 'completed',
            name: data.step?.name || 'Step 1',
            result: data.result,
          },
        ]);
      }
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'initializing':
        return (
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        );
      case 'running':
        return (
          <div className="h-12 w-12 animate-pulse rounded-full bg-yellow-500 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        );
      case 'completed':
        return (
          <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'initializing':
        return 'Initializing workflow...';
      case 'running':
        return 'Executing workflow...';
      case 'completed':
        return 'Workflow completed successfully';
      case 'failed':
        return 'Workflow execution failed';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'initializing':
        return 'text-gray-600 dark:text-gray-400';
      case 'running':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Workflow Execution
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {workflowName}
            </p>
          </div>
          {(status === 'completed' || status === 'failed') && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Section */}
          <div className="mb-6 flex flex-col items-center">
            {getStatusIcon()}
            <p className={`mt-4 text-lg font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {workflowDescription && status === 'initializing' && (
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {workflowDescription}
              </p>
            )}
          </div>

          {/* Steps */}
          {steps.length > 0 && (
            <>
              <div className="mb-6 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Execution Steps:
                </h3>
                {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    step.status === 'failed'
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      : step.status === 'completed'
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : step.status === 'running'
                          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'
                  }`}
                >
                  {step.status === 'completed' && (
                    <svg className="h-5 w-5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {step.status === 'running' && (
                    <div className="h-5 w-5 flex-shrink-0 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                  )}
                  {step.status === 'failed' && (
                    <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {step.status === 'pending' && (
                    <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300"></div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {step.name || `Step ${index + 1}`}
                    </p>
                    {step.error && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{step.error}</p>
                    )}
                  </div>
                </div>
                ))}
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-start">
                <svg
                  className="mr-3 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Error</h4>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && status === 'completed' && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <h4 className="mb-2 font-medium text-green-800 dark:text-green-200">Result</h4>
              <pre className="max-h-48 overflow-auto rounded bg-white p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-6 dark:border-gray-700">
          {(status === 'completed' || status === 'failed') && (
            <button
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Close
            </button>
          )}
          {(status === 'initializing' || status === 'running') && (
            <button
              disabled
              className="cursor-not-allowed rounded-lg bg-gray-300 px-6 py-2 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            >
              Please wait...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { WorkflowInputForm } from './WorkflowInputForm';
import type { Workflow, WorkflowState, WorkflowStep } from '@/lib/workflows/types';

interface WorkflowRunnerProps {
  workflow: Workflow;
  workflowId: string;
  autoStart?: boolean;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

/**
 * WorkflowRunner - Interactive workflow execution UI with live updates
 *
 * Features:
 * - Real-time execution monitoring via SSE
 * - Step-by-step progress visualization
 * - Live execution logs
 * - Interactive input collection
 * - Error handling and display
 * - Start/pause/resume controls
 */
export function WorkflowRunner({ workflow, workflowId, autoStart = false }: WorkflowRunnerProps) {
  const [state, setState] = useState<WorkflowState | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingInput, setIsSubmittingInput] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const steps = workflow.steps || [];
  const totalSteps = steps.length;

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Connect to SSE for live updates
  useEffect(() => {
    if (!isRunning) return;

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          message,
          type,
        },
      ]);
    };

    const eventSource = new EventSource(`/api/v3/workflows/${workflowId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      addLog('Connected to workflow execution stream', 'success');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'state':
            setState(data.state);
            break;

          case 'step_start':
            setCurrentStep(data.step);
            addLog(`▶️  Starting step: ${data.step.name}`, 'info');
            break;

          case 'step_complete':
            addLog(`✅ Completed step: ${data.step.name}`, 'success');
            break;

          case 'log':
            addLog(data.message, data.level || 'info');
            break;

          case 'waiting_input':
            setWaitingForInput(true);
            setCurrentStep(data.step);
            addLog(
              `⏸️  Workflow paused for input: ${data.step.name}`,
              'warning'
            );
            break;

          case 'input_received':
            setWaitingForInput(false);
            addLog(`✅ Input received, resuming workflow`, 'success');
            break;

          case 'completed':
            setIsRunning(false);
            addLog('🎉 Workflow completed successfully!', 'success');
            break;

          case 'error':
            setIsRunning(false);
            setError(data.error);
            addLog(`❌ Error: ${data.error}`, 'error');
            break;

          case 'reflection_start':
            addLog(`🤔 LLM reflection starting...`, 'info');
            break;

          case 'reflection_complete':
            addLog(
              `✅ LLM reflection complete (${data.tokensUsed} tokens, ${data.durationMs}ms)`,
              'success'
            );
            break;

          case 'template_rendered':
            addLog(`📄 Template rendered: ${data.outputFile}`, 'success');
            break;
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      addLog('Connection error. Attempting to reconnect...', 'error');
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [workflowId, isRunning]);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isRunning && !state) {
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const handleStart = async () => {
    setIsRunning(true);
    setLogs([]);
    setError(null);

    setLogs([
      {
        timestamp: new Date().toISOString(),
        message: `🚀 Starting workflow: ${workflow.name}`,
        type: 'info',
      },
    ]);

    try {
      const response = await fetch(`/api/v3/workflows/${workflowId}/execute`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to start workflow');
        setIsRunning(false);
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            message: `❌ Failed to start: ${result.error}`,
            type: 'error',
          },
        ]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setIsRunning(false);
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          message: `❌ Error: ${errorMsg}`,
          type: 'error',
        },
      ]);
    }
  };

  const handleInputSubmit = async (value: unknown) => {
    if (!currentStep || !state) return;

    setIsSubmittingInput(true);

    try {
      const response = await fetch(`/api/v3/workflows/${workflowId}/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepIndex: state.currentStep,
          value,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit input');
      }

      setWaitingForInput(false);

      // Resume workflow execution
      await fetch(`/api/v3/workflows/${workflowId}/resume`, {
        method: 'POST',
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit input';
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          message: `❌ ${errorMsg}`,
          type: 'error',
        },
      ]);
    } finally {
      setIsSubmittingInput(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset this workflow?')) return;

    try {
      await fetch(`/api/v3/workflows/${workflowId}/reset`, {
        method: 'POST',
      });

      setState(null);
      setCurrentStep(null);
      setWaitingForInput(false);
      setLogs([]);
      setError(null);
      setIsRunning(false);

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    } catch (err) {
      console.error('Failed to reset workflow:', err);
    }
  };

  const progressPercentage = state
    ? ((state.currentStep + 1) / totalSteps) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {workflow.name}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {workflow.description}
          </p>
          {workflow.agent && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Agent: {workflow.agent} | Phase: {workflow.phase || 1}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400 disabled:hover:bg-gray-400"
          >
            {isRunning ? 'Running...' : 'Start Workflow'}
          </button>

          {state && (
            <button
              onClick={handleReset}
              disabled={isRunning}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300 disabled:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Workflow Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {state && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Step {Math.min(state.currentStep + 1, totalSteps)} of {totalSteps}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Step */}
      {currentStep && !waitingForInput && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentStep.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Action: <span className="font-mono">{currentStep.action}</span>
              </p>
              {currentStep.prompt && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {currentStep.prompt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      {waitingForInput && currentStep && (
        <WorkflowInputForm
          step={currentStep}
          onSubmit={handleInputSubmit}
          isSubmitting={isSubmittingInput}
        />
      )}

      {/* Execution Logs */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Execution Log
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto p-4">
          {logs.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              No logs yet. Start the workflow to see execution details.
            </p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 font-mono text-xs ${
                    log.type === 'error'
                      ? 'text-red-600 dark:text-red-400'
                      : log.type === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : log.type === 'warning'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-gray-500 dark:text-gray-500">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Workflow Variables (Debug) */}
      {state && state.variables && Object.keys(state.variables).length > 0 && (
        <details className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <summary className="cursor-pointer border-b border-gray-200 px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">
            Workflow Variables ({Object.keys(state.variables).length})
          </summary>
          <div className="p-4">
            <pre className="overflow-x-auto text-xs">
              {JSON.stringify(state.variables, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}

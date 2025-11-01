'use client';

import { useState } from 'react';
import type { WorkflowStep } from '@/lib/workflows/types';

interface WorkflowInputFormProps {
  step: WorkflowStep;
  onSubmit: (value: unknown) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * WorkflowInputForm - Interactive input form for elicit workflow steps
 *
 * Features:
 * - Multi-line text input
 * - Real-time validation
 * - Loading states
 * - Error handling
 * - Accessible design
 */
export function WorkflowInputForm({
  step,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: WorkflowInputFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim()) {
      setError('This field is required');
      return;
    }

    // Validate based on step.validation if present
    if (step.validation) {
      try {
        const regex = new RegExp(step.validation);
        if (!regex.test(value)) {
          setError(`Input must match pattern: ${step.validation}`);
          return;
        }
      } catch {
        console.warn('Invalid validation regex:', step.validation);
      }
    }

    setError('');
    setIsProcessing(true);

    try {
      await onSubmit(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit input');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setValue('');
    setError('');
    onCancel?.();
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Workflow execution paused for input
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="workflow-input"
            className="block text-sm font-medium text-gray-900 dark:text-white"
          >
            {step.prompt}
            {step.variable && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Variable: {step.variable})
              </span>
            )}
          </label>

          <textarea
            id="workflow-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            disabled={isProcessing || isSubmitting}
            rows={6}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-900 sm:text-sm"
            placeholder="Enter your response here..."
            aria-label={step.prompt || 'Input field'}
            aria-describedby={error ? 'input-error' : 'input-hint'}
            aria-invalid={!!error}
          />

          {step.validation && !error && (
            <p id="input-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Pattern: {step.validation}
            </p>
          )}

          {error && (
            <p id="input-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isProcessing || isSubmitting || !value.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:hover:bg-gray-400 dark:focus:ring-offset-gray-900"
          >
            {isProcessing || isSubmitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              'Submit'
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing || isSubmitting}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-900"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 rounded-md bg-blue-100 p-3 dark:bg-blue-900/30">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Your input will be stored in the workflow variable{' '}
          <code className="rounded bg-blue-200 px-1 py-0.5 font-mono dark:bg-blue-800">
            {step.variable || 'user_input'}
          </code>{' '}
          and can be used in subsequent workflow steps.
        </p>
      </div>
    </div>
  );
}

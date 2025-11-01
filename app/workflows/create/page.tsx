'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkflowCreator } from '@/components/features/workflow/create/WorkflowCreator';
import type { CreateWorkflowData } from '@/lib/types/workflow-create';

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (_workflowData: CreateWorkflowData) => {
    try {
      setSaving(true);
      setError(null);

      // TODO: In production, save to database or file system
      // For now, just simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Success - redirect to workflows list
      router.push('/workflows?created=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/workflows');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Workflow
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Build a custom MADACE workflow with step-by-step guidance
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md border-2 border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Creator */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          {!saving && (
            <WorkflowCreator onComplete={handleComplete} onCancel={handleCancel} />
          )}
          {saving && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400"></div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Saving workflow...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Saving Overlay */}
        {saving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400"></div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Saving workflow...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

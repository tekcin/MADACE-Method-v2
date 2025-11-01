'use client';

import { useState, useMemo } from 'react';
import * as yaml from 'js-yaml';
import type { CreateWorkflowData, WorkflowStepData } from '@/lib/types/workflow-create';

interface PreviewStepProps {
  workflowData: CreateWorkflowData;
}

export function PreviewStep({ workflowData }: PreviewStepProps) {
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  // Generate YAML from workflow data
  const yamlContent = useMemo(() => {
    try {
      // Build workflow object matching MADACE workflow schema
      const workflowObject: Record<string, unknown> = {
        name: workflowData.name,
        description: workflowData.description,
        agent: workflowData.agent,
        phase: workflowData.phase,
      };

      // Add steps if present
      if (workflowData.steps.length > 0) {
        workflowObject.steps = workflowData.steps.map((step: WorkflowStepData) => {
          // Create step object with only relevant fields
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const stepObj: Record<string, any> = {
            name: step.name,
            action: step.action,
          };

          // Add action-specific fields
          if (step.message) stepObj.message = step.message;
          if (step.prompt) stepObj.prompt = step.prompt;
          if (step.variable) stepObj.variable = step.variable;
          if (step.validation) stepObj.validation = step.validation;
          if (step.model) stepObj.model = step.model;
          if (step.max_tokens) stepObj.max_tokens = step.max_tokens;
          if (step.temperature !== undefined) stepObj.temperature = step.temperature;
          if (step.store_as) stepObj.store_as = step.store_as;
          if (step.template) stepObj.template = step.template;
          if (step.output_file) stepObj.output_file = step.output_file;
          if (step.workflow_name) stepObj.workflow_name = step.workflow_name;
          if (step.workflow_file) stepObj.workflow_file = step.workflow_file;
          if (step.condition) stepObj.condition = step.condition;
          if (step.routes) stepObj.routes = step.routes;
          if (step.variables) stepObj.variables = step.variables;

          return stepObj;
        });
      }

      // Add variables if present
      if (workflowData.variables.length > 0) {
        const variablesObj: Record<string, unknown> = {};
        workflowData.variables.forEach((variable) => {
          variablesObj[variable.name] = variable.value;
        });
        workflowObject.variables = variablesObj;
      }

      return yaml.dump(workflowObject, {
        indent: 2,
        lineWidth: -1, // Disable line wrapping
      });
    } catch (error) {
      return `# Error generating YAML: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }, [workflowData]);

  // Validation checks
  const validationResults = useMemo(() => {
    const results = [];

    // Check basic fields
    if (!workflowData.name) {
      results.push({ type: 'error', message: 'Workflow name is required' });
    }
    if (!workflowData.description) {
      results.push({ type: 'error', message: 'Workflow description is required' });
    }
    if (!workflowData.agent) {
      results.push({ type: 'error', message: 'Primary agent is required' });
    }

    // Check steps
    if (workflowData.steps.length === 0) {
      results.push({ type: 'warning', message: 'No workflow steps defined' });
    } else {
      results.push({ type: 'success', message: `${workflowData.steps.length} step(s) defined` });
    }

    // Check variables
    if (workflowData.variables.length > 0) {
      results.push({ type: 'success', message: `${workflowData.variables.length} variable(s) defined` });
    }

    // If no errors, add success message
    if (!results.some(r => r.type === 'error')) {
      results.push({ type: 'success', message: 'Workflow is valid and ready to create' });
    }

    return results;
  }, [workflowData]);

  const hasErrors = validationResults.some(r => r.type === 'error');

  const handleDownload = () => {
    try {
      const blob = new Blob([yamlContent], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflowData.name || 'workflow'}.workflow.yaml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadStatus('Downloaded successfully!');
      setTimeout(() => setDownloadStatus(''), 3000);
    } catch (error) {
      setDownloadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent);
      setDownloadStatus('Copied to clipboard!');
      setTimeout(() => setDownloadStatus(''), 3000);
    } catch (error) {
      setDownloadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Preview & Finish
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review your workflow configuration and download the YAML file
        </p>
      </div>

      {/* Validation Summary */}
      <div className="space-y-2">
        {validationResults.map((result, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 rounded-md p-3 ${
              result.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20'
                : result.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20'
                  : 'bg-green-50 dark:bg-green-900/20'
            }`}
          >
            <svg
              className={`h-5 w-5 flex-shrink-0 ${
                result.type === 'error'
                  ? 'text-red-400'
                  : result.type === 'warning'
                    ? 'text-yellow-400'
                    : 'text-green-400'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {result.type === 'error' ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              ) : result.type === 'warning' ? (
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <p
              className={`text-sm ${
                result.type === 'error'
                  ? 'text-red-800 dark:text-red-300'
                  : result.type === 'warning'
                    ? 'text-yellow-800 dark:text-yellow-300'
                    : 'text-green-800 dark:text-green-300'
              }`}
            >
              {result.message}
            </p>
          </div>
        ))}
      </div>

      {/* Workflow Summary */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {workflowData.name || 'Untitled Workflow'}
        </h3>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          {workflowData.description || 'No description provided'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
            {workflowData.agent || 'No agent'}
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
            Phase {workflowData.phase}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-600 px-3 py-1 text-xs font-medium text-white">
            {workflowData.steps.length} steps
          </span>
          {workflowData.variables.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
              {workflowData.variables.length} variables
            </span>
          )}
        </div>
      </div>

      {/* YAML Preview */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            YAML Preview
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="rounded-md bg-gray-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-gray-500"
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Download YAML
            </button>
          </div>
        </div>

        {downloadStatus && (
          <div className="mb-2 text-sm text-green-600 dark:text-green-400">
            {downloadStatus}
          </div>
        )}

        <div className="relative">
          <pre className="overflow-x-auto rounded-lg border border-gray-300 bg-gray-900 p-4 text-sm text-gray-100 dark:border-gray-600">
            <code>{yamlContent}</code>
          </pre>
        </div>
      </div>

      {/* Next Steps */}
      {!hasErrors && (
        <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
                Ready to Save
              </h4>
              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                Your workflow configuration is valid. Click &quot;Finish&quot; below to save it,
                or download the YAML file to use in your MADACE project.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Using Your Workflow
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                After saving, you can use this workflow in MADACE:
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Place the YAML file in <code className="font-mono">madace/workflows/</code></li>
                <li>Execute with: <code className="font-mono">madace workflow {workflowData.name}</code></li>
                <li>Or reference it from other workflows using the workflow action</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

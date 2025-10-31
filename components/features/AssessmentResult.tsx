'use client';

import { useState } from 'react';
import type { AssessmentResult } from '@/lib/types/setup';

interface Props {
  assessment: AssessmentResult;

  // Export actions
  onExportMarkdown: () => void;
  onExportJSON: () => void;
  onSaveToProject: () => void;

  // View actions
  onViewMarkdown: () => void;
  onViewJSON: () => void;

  // Implementation actions
  onStartWorkflow: () => void;
  onCreateProject: () => void;
  onApplyConfiguration: () => void;
  onViewWorkflowDetails: () => void;
}

export function AssessmentResult({
  assessment,
  onExportMarkdown,
  onExportJSON,
  onSaveToProject,
  onViewMarkdown,
  onViewJSON,
  onStartWorkflow,
  onCreateProject,
  onApplyConfiguration,
  onViewWorkflowDetails,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  // Level colors
  const levelColors = {
    0: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200',
    1: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
    2: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
    3: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
    4: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200',
  };

  const levelNames = ['Minimal', 'Basic', 'Standard', 'Comprehensive', 'Enterprise'];
  const levelDescriptions = [
    'Simple scripts or prototypes with minimal planning',
    'Small teams with lightweight planning and story tracking',
    'Standard workflow with architecture, epics, and stories',
    'Comprehensive planning with tech specs and full documentation',
    'Enterprise-grade with security, DevOps, and compliance specs',
  ];

  return (
    <div className="space-y-6">
      {/* Result Card */}
      <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-8 dark:border-blue-700 dark:bg-blue-950">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assessment Complete</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Based on your project characteristics
        </p>

        {/* Level Badge */}
        <div className="mt-6 flex items-center gap-6">
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-xl border-4 ${levelColors[assessment.level as keyof typeof levelColors]}`}
          >
            <div className="text-center">
              <div className="text-4xl font-bold">L{assessment.level}</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {levelNames[assessment.level]}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {levelDescriptions[assessment.level]}
            </p>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Score: {assessment.totalScore}/40 points (
              {Math.round((assessment.totalScore / 40) * 100)}%)
            </div>
            <div className="mt-2">
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-3 rounded-full bg-blue-500"
                  style={{ width: `${(assessment.totalScore / 40) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Workflow */}
        <div className="mt-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recommended Workflow
          </h3>
          <p className="mt-2 font-mono text-sm text-gray-600 dark:text-gray-400">
            {assessment.recommendedWorkflow}
          </p>
        </div>

        {/* Criteria Breakdown (Collapsible) */}
        {showDetails && (
          <div className="mt-6 space-y-4 rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Criteria Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(assessment.breakdown).map(([key, score]) => {
                const percentage = (score / 5) * 100;
                const labels: Record<string, string> = {
                  projectSize: 'Project Size',
                  teamSize: 'Team Size',
                  codebaseComplexity: 'Codebase Complexity',
                  integrations: 'Integrations',
                  userBase: 'User Base',
                  security: 'Security Requirements',
                  duration: 'Project Duration',
                  existingCode: 'Existing Codebase',
                };

                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {labels[key]}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{score}/5</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Toggle Details Button */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {showDetails ? '▼ Hide' : '▶ Show'} Criteria Breakdown
        </button>
      </div>

      {/* Implementation Actions */}
      <div className="rounded-lg border-2 border-green-300 bg-green-50 p-6 dark:border-green-700 dark:bg-green-950">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🚀 Ready to Implement?
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Take action on your assessment with these implementation options
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {/* Start Workflow - PRIMARY ACTION */}
          <button
            type="button"
            onClick={onStartWorkflow}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            Start Recommended Workflow
          </button>

          {/* Create Project */}
          <button
            type="button"
            onClick={onCreateProject}
            className="flex items-center justify-center gap-2 rounded-lg border border-green-600 bg-white px-6 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 dark:border-green-500 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            Create Project
          </button>

          {/* Apply Configuration */}
          <button
            type="button"
            onClick={onApplyConfiguration}
            className="flex items-center justify-center gap-2 rounded-lg border border-green-600 bg-white px-6 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 dark:border-green-500 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Apply Configuration
          </button>

          {/* View Workflow Details */}
          <button
            type="button"
            onClick={onViewWorkflowDetails}
            className="flex items-center justify-center gap-2 rounded-lg border border-green-600 bg-white px-6 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 dark:border-green-500 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View Workflow Details
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          📄 View & Export Options
        </h3>
        <div className="flex flex-wrap gap-3">
          {/* View Markdown Button */}
          <button
            type="button"
            onClick={onViewMarkdown}
            className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Markdown
          </button>

          {/* View JSON Button */}
          <button
            type="button"
            onClick={onViewJSON}
            className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View JSON
          </button>

          <button
            type="button"
            onClick={onExportMarkdown}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Markdown Report
          </button>

          <button
            type="button"
            onClick={onExportJSON}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy JSON
          </button>

          <button
            type="button"
            onClick={onSaveToProject}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save to Project
          </button>
        </div>
      </div>
    </div>
  );
}

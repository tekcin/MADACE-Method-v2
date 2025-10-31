'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentSelector, type AgentCardData } from '@/components/features/AgentSelector';
import { ProjectBadge } from '@/components/features/ProjectBadge';

/**
 * Agents Page
 *
 * Displays all available MADACE agents with selection and interaction capabilities.
 */

export default function AgentsPage() {
  const router = useRouter();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedAgents(selectedIds);
  };

  const handleAgentClick = (agentId: string) => {
    // Navigate to agent detail page using the agent ID
    router.push(`/agents/${agentId}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MADACE Agents</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Select and interact with AI agents for your project workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/agents/create')}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Agent
          </button>
          <ProjectBadge />
        </div>
      </div>

      {/* View mode toggle and module filter */}
      <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Available Agents</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {viewMode === 'single'
                ? 'Click an agent to select it'
                : 'Click agents to add or remove from selection'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Selection mode:</span>
            <button
              onClick={() => setViewMode('single')}
              className={`rounded-l-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'single'
                  ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setViewMode('multi')}
              className={`rounded-r-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'multi'
                  ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Multiple
            </button>
          </div>
        </div>
        {/* Module filter */}
        <div className="mt-4 flex items-center space-x-2">
          <label
            htmlFor="moduleFilter"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Filter by module:
          </label>
          <select
            id="moduleFilter"
            name="moduleFilter"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="all">All Agents (5 total)</option>
            <option value="mam">MAM - MADACE Agile Method (5 agents)</option>
          </select>
        </div>
      </div>

      {/* Agent selector */}
      <AgentSelector
        mode={viewMode}
        initialSelection={selectedAgents}
        onSelectionChange={handleSelectionChange}
        onAgentClick={handleAgentClick}
        showBulkActions={viewMode === 'multi'}
        moduleFilter={moduleFilter}
      />

      {/* Agent information */}
      <div className="mt-8 space-y-6">
        {/* MADACE Agents Section */}
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-6 dark:border-blue-600 dark:bg-blue-900/20">
          <h2 className="mb-4 text-xl font-bold text-blue-900 dark:text-blue-100">
            🎯 MADACE Agents (5 agents)
          </h2>
          <div className="space-y-4">
            {/* MAM Module */}
            <div className="rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-700 dark:bg-blue-950">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                MAM - MADACE Agile Method
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">
                  Native MADACE agents for complete agile development workflow.
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong>PM</strong> - Product Manager for planning and scale assessment
                  </li>
                  <li>
                    <strong>Analyst</strong> - Requirements analysis and research
                  </li>
                  <li>
                    <strong>Architect</strong> - Solution architecture and technical design
                  </li>
                  <li>
                    <strong>SM</strong> - Scrum Master for story lifecycle management
                  </li>
                  <li>
                    <strong>DEV</strong> - Developer for implementation guidance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent features */}
      <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
        <h4 className="mb-2 font-medium text-green-900 dark:text-green-100">✅ New Features</h4>
        <ul className="list-inside list-disc space-y-1 text-sm text-green-700 dark:text-green-300">
          <li>✅ Interactive agent chat interface with advanced markdown rendering</li>
          <li>✅ Agent workflow execution with real-time progress tracking</li>
          <li>✅ Custom agent creation (click &quot;Create Agent&quot; button above)</li>
        </ul>
      </div>
    </div>
  );
}

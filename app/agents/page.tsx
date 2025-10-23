'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentSelector, type AgentCardData } from '@/components/features/AgentSelector';

/**
 * Agents Page
 *
 * Displays all available MADACE agents with selection and interaction capabilities.
 */

export default function AgentsPage() {
  const router = useRouter();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedAgents(selectedIds);
  };

  const handleAgentClick = (agentId: string, agent: AgentCardData) => {
    // Navigate to agent detail page
    // Extract the agent name from the ID (e.g., "madace/mam/agents/pm.md" -> "pm")
    const agentName = agent.name.toLowerCase();
    router.push(`/agents/${agentName}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MADACE Agents</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Select and interact with AI agents for your project workflow.
        </p>
      </div>

      {/* View mode toggle */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
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

      {/* Agent selector */}
      <AgentSelector
        mode={viewMode}
        initialSelection={selectedAgents}
        onSelectionChange={handleSelectionChange}
        onAgentClick={handleAgentClick}
        showBulkActions={viewMode === 'multi'}
      />

      {/* Agent information */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">About MAM Agents</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong className="text-gray-900 dark:text-white">MAM</strong> = MADACE Agile Method
          </p>
          <p>
            The MADACE Agile Method includes 5 specialized agents that work together to guide your
            project from planning through implementation:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>PM (Product Manager)</strong> - Handles planning and scale assessment
            </li>
            <li>
              <strong>Analyst</strong> - Conducts requirements gathering and research
            </li>
            <li>
              <strong>Architect</strong> - Designs solution architecture and technical
              specifications
            </li>
            <li>
              <strong>SM (Scrum Master)</strong> - Manages story lifecycle and workflow
            </li>
            <li>
              <strong>DEV (Developer)</strong> - Provides implementation guidance and code support
            </li>
          </ul>
        </div>
      </div>

      {/* Future features */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
        <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">Coming Soon</h4>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>Agent detail pages with persona, prompts, and menu actions</li>
          <li>Interactive agent chat interface</li>
          <li>Agent workflow execution</li>
          <li>Custom agent creation (via MAB module)</li>
        </ul>
      </div>
    </div>
  );
}

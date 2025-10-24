'use client';

import { useEffect, useState } from 'react';
import { AgentCard, type AgentCardData } from './AgentCard';

// Re-export AgentCardData for convenience
export type { AgentCardData };

/**
 * AgentSelector Component
 *
 * Provides a grid of selectable agent cards with support for:
 * - Single or multi-select mode
 * - Loading and error states
 * - Automatic agent fetching from API
 * - Selection callbacks
 */

export interface AgentSelectorProps {
  /**
   * Selection mode: 'single' allows one agent, 'multi' allows multiple
   */
  mode?: 'single' | 'multi';

  /**
   * Initially selected agent IDs
   */
  initialSelection?: string[];

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  /**
   * Callback when an agent card is clicked
   */
  onAgentClick?: (agentId: string, agent: AgentCardData) => void;

  /**
   * Optional custom agent list (defaults to fetching from API)
   */
  agents?: AgentCardData[];

  /**
   * Show select all / clear all buttons (only for multi mode)
   */
  showBulkActions?: boolean;

  /**
   * Filter agents by module (optional)
   */
  moduleFilter?: string;
}

export function AgentSelector({
  mode = 'single',
  initialSelection = [],
  onSelectionChange,
  onAgentClick,
  agents: providedAgents,
  showBulkActions = false,
  moduleFilter = 'all',
}: AgentSelectorProps) {
  const [agents, setAgents] = useState<AgentCardData[]>(providedAgents || []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelection));
  const [loading, setLoading] = useState(!providedAgents);
  const [error, setError] = useState<string | null>(null);

  // Filter agents by module
  const filteredAgents =
    moduleFilter === 'all' ? agents : agents.filter((agent) => agent.module === moduleFilter);

  // Fetch agents from API if not provided
  useEffect(() => {
    if (!providedAgents) {
      fetchAgents();
    }
  }, [providedAgents]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/agents');

      if (!response.ok) {
        throw new Error(`Failed to load agents: ${response.statusText}`);
      }

      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (agentId: string) => {
    const newSelection = new Set(selectedIds);

    if (mode === 'single') {
      // Single mode: replace selection
      newSelection.clear();
      newSelection.add(agentId);
    } else {
      // Multi mode: toggle selection
      if (newSelection.has(agentId)) {
        newSelection.delete(agentId);
      } else {
        newSelection.add(agentId);
      }
    }

    setSelectedIds(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  const handleClick = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent && onAgentClick) {
      onAgentClick(agentId, agent);
    }
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredAgents.map((a) => a.id));
    setSelectedIds(allIds);
    onSelectionChange?.(Array.from(allIds));
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
    onSelectionChange?.([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 dark:border-red-700 dark:bg-red-900/20">
        <div className="flex items-start">
          <svg
            className="mt-0.5 mr-3 size-6 flex-shrink-0 text-red-600 dark:text-red-400"
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
            <h3 className="font-bold text-red-900 dark:text-red-100">Error Loading Agents</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={fetchAgents}
              className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-offset-gray-900"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (filteredAgents.length === 0) {
    return (
      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          {moduleFilter === 'all'
            ? 'No agents available'
            : `No agents found in ${moduleFilter} module`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions (multi mode only) */}
      {mode === 'multi' && showBulkActions && (
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedIds.size} of {filteredAgents.length} selected
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              disabled={selectedIds.size === filteredAgents.length}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              disabled={selectedIds.size === 0}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Agent grid */}
      <div
        data-testid="agent-list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            selected={selectedIds.has(agent.id)}
            onSelect={handleSelect}
            onClick={handleClick}
          />
        ))}
      </div>

      {/* Selection summary */}
      {selectedIds.size > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Selected {selectedIds.size} agent{selectedIds.size !== 1 ? 's' : ''}:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from(selectedIds).map((id) => {
              const agent = agents.find((a) => a.id === id);
              return agent ? (
                <span
                  key={id}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                >
                  <span className="mr-1">{agent.icon}</span>
                  {agent.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

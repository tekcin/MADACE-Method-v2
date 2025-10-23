/**
 * Agent List Component
 *
 * Displays all agents in a grid/list view with search and filtering.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Agent } from '@prisma/client';

interface AgentListProps {
  projectId?: string;
}

export default function AgentList({ projectId }: AgentListProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (projectId) params.append('projectId', projectId);
        if (moduleFilter !== 'all') params.append('module', moduleFilter);

        const response = await fetch(`/api/v3/agents?${params}`);
        const data = await response.json();

        if (data.success) {
          setAgents(data.data);
        } else {
          setError(data.error || 'Failed to load agents');
        }
      } catch (err) {
        setError('Failed to fetch agents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [projectId, moduleFilter]);

  // Filter agents by search query
  const filteredAgents = agents.filter((agent) => {
    const query = searchQuery.toLowerCase();
    return agent.name.toLowerCase().includes(query) || agent.title.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="max-w-md flex-1">
          <input
            type="text"
            placeholder="Search agents by name or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex gap-3">
          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">All Modules</option>
            <option value="mam">MAM</option>
            <option value="mab">MAB</option>
            <option value="cis">CIS</option>
            <option value="core">Core</option>
          </select>

          {/* Create Agent Button */}
          <Link
            href="/agents/create"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Create Agent
          </Link>
        </div>
      </div>

      {/* Agent Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
      </div>

      {/* Agent Grid */}
      {filteredAgents.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center dark:bg-gray-800/50">
          <p className="text-gray-600 dark:text-gray-400">No agents found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Agent Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {agent.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{agent.name}</p>
                </div>
                <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {agent.module}
                </span>
              </div>

              {/* Agent Metadata */}
              <div className="mb-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>v{agent.version}</span>
                <span>{agent.icon}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/agents/${agent.id}/edit`}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700"
                >
                  Edit
                </Link>
                <Link
                  href={`/agents/${agent.id}`}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

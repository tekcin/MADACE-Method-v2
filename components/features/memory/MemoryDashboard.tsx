'use client';

import { useEffect, useState, useCallback } from 'react';
import type { AgentMemory } from '@prisma/client';
import { MemoryCard } from './MemoryCard';

interface MemoryDashboardProps {
  agentId: string;
  userId: string;
}

type SortField = 'createdAt' | 'lastAccessedAt' | 'importance';
type SortOrder = 'asc' | 'desc';

interface MemoryStats {
  total: number;
  shortTerm: number;
  longTerm: number;
  avgImportance: number;
  byCategory: Record<string, number>;
}

export function MemoryDashboard({ agentId }: MemoryDashboardProps) {
  const [memories, setMemories] = useState<AgentMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Stats
  const [stats, setStats] = useState<MemoryStats | null>(null);

  // Confirmation dialog
  const [showClearDialog, setShowClearDialog] = useState(false);

  const loadMemories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('orderBy', sortField);
      params.append('order', sortOrder);

      const response = await fetch(`/api/v3/agents/${agentId}/memory?${params}`);
      const data = await response.json();

      if (data.success) {
        setMemories(data.data);
      } else {
        setError(data.error || 'Failed to load memories');
      }
    } catch (err) {
      setError('Failed to fetch memories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [agentId, typeFilter, categoryFilter, sortField, sortOrder]);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/v3/agents/${agentId}/memory?action=stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [agentId]);

  useEffect(() => {
    loadMemories();
    loadStats();
  }, [loadMemories, loadStats]);

  const handleDelete = async (memoryId: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v3/agents/${agentId}/memory/${memoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMemories(memories.filter((m) => m.id !== memoryId));
        loadStats(); // Refresh stats
      } else {
        alert('Failed to delete memory: ' + data.error);
      }
    } catch (err) {
      alert('Failed to delete memory');
      console.error(err);
    }
  };

  const handleUpdate = async (memoryId: string, importance: number) => {
    try {
      const response = await fetch(`/api/v3/agents/${agentId}/memory/${memoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importance }),
      });

      const data = await response.json();

      if (data.success) {
        setMemories(memories.map((m) => (m.id === memoryId ? { ...m, importance } : m)));
        loadStats(); // Refresh stats
      } else {
        alert('Failed to update memory: ' + data.error);
      }
    } catch (err) {
      alert('Failed to update memory');
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch(`/api/v3/agents/${agentId}/memory`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMemories([]);
        loadStats();
        setShowClearDialog(false);
      } else {
        alert('Failed to clear memories: ' + data.error);
      }
    } catch (err) {
      alert('Failed to clear memories');
      console.error(err);
    }
  };

  const filteredMemories = memories.filter((memory) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return memory.key.toLowerCase().includes(query) || memory.value.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Agent Memory</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage persistent agent memories and preferences
          </p>
        </div>
        <button
          onClick={() => setShowClearDialog(true)}
          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear All
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="font-semibold text-blue-900 dark:text-blue-100">Total Memories</div>
            <div className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="font-semibold text-green-900 dark:text-green-100">Long-term</div>
            <div className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.longTerm}
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <div className="font-semibold text-purple-900 dark:text-purple-100">Short-term</div>
            <div className="mt-1 text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.shortTerm}
            </div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <div className="font-semibold text-yellow-900 dark:text-yellow-100">
              Avg. Importance
            </div>
            <div className="mt-1 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.avgImportance.toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Type filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="short-term">Short-term</option>
              <option value="long-term">Long-term</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">All Categories</option>
              <option value="user_preference">User Preference</option>
              <option value="project_context">Project Context</option>
              <option value="conversation_summary">Conversation Summary</option>
              <option value="user_fact">User Fact</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="createdAt">Created</option>
                <option value="lastAccessedAt">Last Accessed</option>
                <option value="importance">Importance</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Memory List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading memories...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {searchQuery
              ? 'No memories found matching your search'
              : 'No memories yet. The agent will start learning as you interact.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearDialog && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Clear All Memories?
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              This will permanently delete all memories for this agent. This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearDialog(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Clear All Memories
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

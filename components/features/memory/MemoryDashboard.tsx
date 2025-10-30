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
        setMemories(
          memories.map((m) => (m.id === memoryId ? { ...m, importance } : m))
        );
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
      return (
        memory.key.toLowerCase().includes(query) ||
        memory.value.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Agent Memory</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage persistent agent memories and preferences
          </p>
        </div>
        <button
          onClick={() => setShowClearDialog(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-blue-900 dark:text-blue-100 font-semibold">Total Memories</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.total}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-green-900 dark:text-green-100 font-semibold">Long-term</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.longTerm}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-purple-900 dark:text-purple-100 font-semibold">Short-term</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.shortTerm}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-yellow-900 dark:text-yellow-100 font-semibold">Avg. Importance</div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {stats.avgImportance.toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="short-term">Short-term</option>
              <option value="long-term">Long-term</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="createdAt">Created</option>
                <option value="lastAccessedAt">Last Accessed</option>
                <option value="importance">Importance</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading memories...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {searchQuery
              ? 'No memories found matching your search'
              : 'No memories yet. The agent will start learning as you interact.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Clear All Memories?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete all memories for this agent. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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

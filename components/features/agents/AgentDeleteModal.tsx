/**
 * Agent Delete Modal Component
 *
 * Confirmation dialog for deleting an agent.
 */

'use client';

import { useState } from 'react';
import type { Agent } from '@prisma/client';

interface AgentDeleteModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function AgentDeleteModal({
  agent,
  isOpen,
  onClose,
  onDelete,
}: AgentDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v3/agents/${agent.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onDelete();
      } else {
        setError(data.error || 'Failed to delete agent');
      }
    } catch (err) {
      setError('Failed to delete agent');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delete Agent</h2>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{agent.title}</strong> ({agent.name})?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            This action cannot be undone. The agent will be permanently deleted from the database.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Agent Detail Page
 *
 * View details of a specific agent with actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AgentDeleteModal from '@/components/features/agents/AgentDeleteModal';
import type { Agent } from '@prisma/client';

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchAgent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v3/agents/${id}`);
        const data = await response.json();

        if (data.success) {
          setAgent(data.data);
        } else {
          setError(data.error || 'Failed to load agent');
        }
      } catch (err) {
        setError('Failed to fetch agent');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const handleExport = async () => {
    if (!agent) return;

    try {
      const response = await fetch(`/api/v3/agents/${agent.id}/export`, {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agent.name}.agent.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to export agent');
      }
    } catch (err) {
      alert('Failed to export agent');
      console.error(err);
    }
  };

  const handleDuplicate = async () => {
    if (!agent) return;

    const newName = prompt('Enter a name for the duplicated agent:', `${agent.name}-copy`);
    if (!newName) return;

    try {
      const response = await fetch(`/api/v3/agents/${agent.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/agents/${data.data.id}`);
      } else {
        alert(data.error || 'Failed to duplicate agent');
      }
    } catch (err) {
      alert('Failed to duplicate agent');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-200">{error || 'Agent not found'}</p>
          <Link
            href="/agents/manage"
            className="mt-2 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{agent.title}</h1>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {agent.module}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {agent.name} v{agent.version} {agent.icon}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg border border-red-600 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Agent Details */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Persona */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Persona</h2>
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs dark:bg-gray-900">
            <code>{JSON.stringify(agent.persona, null, 2)}</code>
          </pre>
        </div>

        {/* Menu */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs dark:bg-gray-900">
            <code>{JSON.stringify(agent.menu, null, 2)}</code>
          </pre>
        </div>
      </div>

      {/* Prompts */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Prompts</h2>
        <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs dark:bg-gray-900">
          <code>{JSON.stringify(agent.prompts, null, 2)}</code>
        </pre>
      </div>

      {/* Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={handleExport}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Export as JSON
          </button>
          <button
            onClick={handleDuplicate}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Duplicate
          </button>
          <Link
            href="/agents/manage"
            className="rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && agent && (
        <AgentDeleteModal
          agent={agent}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => router.push('/agents/manage')}
        />
      )}
    </div>
  );
}

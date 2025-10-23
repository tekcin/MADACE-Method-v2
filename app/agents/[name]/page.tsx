'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Agent } from '@/lib/types/agent';
import { AgentPersona } from '@/components/features/AgentPersona';

/**
 * Agent Detail Page
 *
 * Displays detailed information about a specific MADACE agent.
 * Shows persona, principles, available actions, and prompts.
 */

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentName = params?.name as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/agents/${agentName}`);

      if (!response.ok) {
        throw new Error(`Failed to load agent: ${response.statusText}`);
      }

      const data = await response.json();
      setAgent(data.agent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentName) {
      fetchAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentName]);

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // Future: Execute workflow or open action dialog
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="size-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading agent...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
            <div className="flex-1">
              <h3 className="font-bold text-red-900 dark:text-red-100">Error Loading Agent</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={fetchAgent}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-offset-gray-900"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push('/agents')}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                >
                  Back to Agents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">Agent not found</p>
          <Link
            href="/agents"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center space-x-2 text-sm">
        <Link
          href="/agents"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Agents
        </Link>
        <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900 dark:text-white">{agent.metadata.name}</span>
      </nav>

      {/* Agent Persona */}
      <AgentPersona agent={agent} onActionClick={handleActionClick} />

      {/* Back button */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/agents"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
        >
          <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Agents
        </Link>
      </div>
    </div>
  );
}

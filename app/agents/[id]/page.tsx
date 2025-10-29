/**
 * Agent Detail Page (v2.0)
 *
 * Displays details of a MADACE agent loaded from YAML files.
 * Uses /api/agents/[name] endpoint with file-based architecture.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Agent } from '@/lib/types/agent';

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        const response = await fetch(`/api/agents/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.agent) {
          setAgent(data.agent);
        } else {
          setError('Agent not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agent');
        console.error('Error fetching agent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading agent...</span>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">
            Error Loading Agent
          </h2>
          <p className="mb-4 text-red-800 dark:text-red-200">{error || 'Agent not found'}</p>
          <Link
            href="/agents"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            ← Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href="/agents"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="text-4xl">{agent.metadata.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {agent.metadata.title}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {agent.metadata.name} v{agent.metadata.version}
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800 uppercase dark:bg-blue-900/30 dark:text-blue-300">
            {agent.metadata.module}
          </span>
        </div>
      </div>

      {/* Persona Section */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
          <span className="mr-2">👤</span>
          Persona
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Role</h3>
            <p className="text-gray-600 dark:text-gray-400">{agent.persona.role}</p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Identity</h3>
            <p className="whitespace-pre-line text-gray-600 dark:text-gray-400">
              {agent.persona.identity}
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Communication Style
            </h3>
            <p className="whitespace-pre-line text-gray-600 dark:text-gray-400">
              {agent.persona.communication_style}
            </p>
          </div>

          {agent.persona.principles && agent.persona.principles.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Principles</h3>
              <ul className="list-inside list-disc space-y-1 text-gray-600 dark:text-gray-400">
                {agent.persona.principles.map((principle, idx) => (
                  <li key={idx}>{principle}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Menu Actions */}
      {agent.menu && agent.menu.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
            <span className="mr-2">⚡</span>
            Menu Actions
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agent.menu.map((menuItem, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                <div className="mb-2 flex items-start justify-between">
                  <code className="rounded bg-blue-100 px-2 py-1 font-mono text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {menuItem.trigger}
                  </code>
                </div>
                <p className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {menuItem.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Action: {menuItem.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompts */}
      {agent.prompts && agent.prompts.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
            <span className="mr-2">📝</span>
            Prompts ({agent.prompts.length})
          </h2>

          <div className="space-y-4">
            {agent.prompts.map((prompt, idx) => (
              <details
                key={idx}
                className="group rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <summary className="cursor-pointer rounded-lg bg-gray-50 p-4 font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <span>{prompt.name}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-500 dark:text-gray-400">
                        {prompt.trigger}
                      </code>
                      <svg
                        className="h-5 w-5 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </summary>
                <div className="border-t border-gray-200 p-4 dark:border-gray-600">
                  <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm whitespace-pre-wrap text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {prompt.content}
                  </pre>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Files to Load */}
      {agent.load_always && agent.load_always.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
            <span className="mr-2">📁</span>
            Files Loaded Automatically
          </h2>

          <ul className="space-y-2">
            {agent.load_always.map((file, idx) => (
              <li
                key={idx}
                className="rounded-lg bg-gray-50 px-4 py-2 font-mono text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {file}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Critical Actions */}
      {agent.critical_actions && agent.critical_actions.length > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-yellow-900 dark:text-yellow-100">
            <span className="mr-2">⚠️</span>
            Critical Actions
          </h2>

          <ul className="list-inside list-disc space-y-1 text-yellow-800 dark:text-yellow-200">
            {agent.critical_actions.map((action, idx) => (
              <li key={idx}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
        <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">Agent Information</h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="font-medium text-blue-700 dark:text-blue-300">ID:</dt>
          <dd className="text-blue-600 dark:text-blue-400">{agent.metadata.id}</dd>

          <dt className="font-medium text-blue-700 dark:text-blue-300">Module:</dt>
          <dd className="text-blue-600 dark:text-blue-400">
            {agent.metadata.module?.toUpperCase() || 'N/A'}
          </dd>

          <dt className="font-medium text-blue-700 dark:text-blue-300">Version:</dt>
          <dd className="text-blue-600 dark:text-blue-400">{agent.metadata.version}</dd>
        </dl>
      </div>
    </div>
  );
}

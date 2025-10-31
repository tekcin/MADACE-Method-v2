/**
 * Agent Detail Page
 *
 * Displays comprehensive information about a specific agent including:
 * - Persona, prompts, and menu actions
 * - Chat interface integration
 * - Workflow execution capabilities
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectBadge } from '@/components/features/ProjectBadge';
import { WorkflowExecutionModal } from '@/components/features/workflow/WorkflowExecutionModal';

interface AgentPersona {
  role?: string;
  identity?: string;
  communication_style?: string;
  principles?: string[];
}

interface MenuItem {
  title: string;
  description?: string;
  action?: string;
  workflow?: string;
}

interface Prompt {
  name: string;
  content: string;
  category?: string;
}

interface Agent {
  id: string;
  name: string;
  title: string;
  icon: string;
  module: string;
  version: string;
  persona: AgentPersona;
  menu: MenuItem[];
  prompts: Prompt[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  projectId?: string;
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'persona' | 'prompts' | 'menu'>(
    'overview'
  );
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      loadAgent();
    }
  }, [resolvedParams]);

  const loadAgent = async () => {
    if (!resolvedParams?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/v3/agents/${resolvedParams.id}`);

      if (!response.ok) {
        throw new Error('Failed to load agent');
      }

      const data = await response.json();
      setAgent(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const startChat = () => {
    if (agent) {
      router.push(`/chat?agent=${agent.id}`);
    }
  };

  const executeWorkflow = (workflow: string) => {
    setExecutingWorkflow(workflow);
  };

  const closeWorkflowModal = () => {
    setExecutingWorkflow(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-2 text-xl font-bold text-red-800 dark:text-red-200">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error || 'Agent not found'}</p>
          <button
            onClick={() => router.push('/agents')}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/agents')}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-2xl text-white">
                  {agent.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {agent.title}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {agent.name} • {agent.module} • v{agent.version}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ProjectBadge size="sm" showDescription={false} />
              <button
                onClick={startChat}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>Start Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {['overview', 'persona', 'prompts', 'menu'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`border-b-2 px-1 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Basic Info */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Basic Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">ID</dt>
                    <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">
                      {agent.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{agent.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Module</dt>
                    <dd className="mt-1">
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {agent.module}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Version
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {agent.version}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Created
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Quick Stats */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Capabilities
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Menu Actions</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {agent.menu?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Prompts</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {agent.prompts?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Principles</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {agent.persona?.principles?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Summary */}
            {agent.persona?.role && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Role
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{agent.persona.role}</p>
              </div>
            )}
          </div>
        )}

        {/* Persona Tab */}
        {activeTab === 'persona' && (
          <div className="space-y-6">
            {agent.persona?.identity && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Identity
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{agent.persona.identity}</p>
              </div>
            )}

            {agent.persona?.communication_style && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Communication Style
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {agent.persona.communication_style}
                </p>
              </div>
            )}

            {agent.persona?.principles && agent.persona.principles.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Principles
                </h3>
                <ul className="space-y-2">
                  {agent.persona.principles.map((principle, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <div className="space-y-4">
            {agent.prompts && agent.prompts.length > 0 ? (
              agent.prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {prompt.name}
                    </h4>
                    {prompt.category && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {prompt.category}
                      </span>
                    )}
                  </div>
                  <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {prompt.content}
                  </pre>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">No prompts defined</p>
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {agent.menu && agent.menu.length > 0 ? (
              agent.menu.map((item, index) => (
                <div
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
                >
                  <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {item.workflow && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Workflow: {item.workflow}
                      </span>
                    )}
                    <button
                      onClick={() =>
                        item.workflow ? executeWorkflow(item.workflow) : alert('No workflow')
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 group-hover:bg-blue-700"
                    >
                      Execute
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">No menu actions defined</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workflow Execution Modal */}
      {executingWorkflow && (
        <WorkflowExecutionModal
          workflowName={executingWorkflow}
          workflowDescription={`Executing workflow: ${executingWorkflow}`}
          onClose={closeWorkflowModal}
        />
      )}
    </div>
  );
}

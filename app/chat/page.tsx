/**
 * Chat Page
 *
 * Main chat interface for conversational AI interaction
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/features/chat/ChatInterface';

interface Agent {
  id: string;
  name: string;
  title: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);

  // Mock user (in production, get from auth session)
  const userId = 'default-user';
  const userName = 'You';

  // Load agents on mount
  useEffect(() => {
    loadAgents();
    loadAllAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v3/agents');
      if (!response.ok) throw new Error('Failed to load agents');

      const result = await response.json();
      const allAgentsList = result.data || result.agents || [];

      // Filter to show only chat-friendly agents or show first 6
      const chatAgents = allAgentsList.filter((a: Agent) =>
        a.name === 'chat-assistant' ||
        a.name === 'pm' ||
        a.name === 'analyst' ||
        a.name === 'dev' ||
        a.name === 'ux-expert' ||
        a.name === 'qa'
      );

      setAgents(chatAgents.slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllAgents = async () => {
    try {
      const response = await fetch('/api/v3/agents');
      if (!response.ok) return;

      const result = await response.json();
      const allAgentsList = result.data || result.agents || [];
      setAllAgents(allAgentsList);
    } catch (err) {
      console.error('Failed to load all agents:', err);
    }
  };

  const startChat = async (agent: Agent) => {
    try {
      setError(null);
      setSelectedAgent(agent);

      // Create new chat session
      const response = await fetch('/api/v3/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          agentId: agent.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create chat session');

      const data = await response.json();
      setSessionId(data.session.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat');
      setSelectedAgent(null);
    }
  };

  const endChat = () => {
    setSelectedAgent(null);
    setSessionId(null);
  };

  const handleAddAgent = (agent: Agent) => {
    setShowAgentModal(false);
    startChat(agent);
  };

  // Show chat interface if session is active
  if (sessionId && selectedAgent) {
    return (
      <div className="flex h-screen flex-col">
        <ChatInterface
          sessionId={sessionId}
          agentId={selectedAgent.id}
          agentName={selectedAgent.title}
          userId={userId}
          userName={userName}
          onClose={endChat}
        />
      </div>
    );
  }

  // Show agent selection screen
  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Chat with AI Agents
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select an agent to start a conversation
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : agents.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No Agents Available
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Create your first agent to start chatting
            </p>
            <button
              onClick={() => router.push('/agents')}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Go to Agents
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => startChat(agent)}
                  className="group rounded-xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-lg font-medium text-white">
                      {agent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {agent.title}
                      </h3>
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{agent.name}</p>
                      <div className="flex items-center text-sm text-blue-600 group-hover:underline dark:text-blue-400">
                        <span>Start Chat</span>
                        <svg
                          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {/* Add Agent Button */}
              <button
                onClick={() => setShowAgentModal(true)}
                className="group flex min-h-[160px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-blue-100 dark:bg-gray-700 dark:group-hover:bg-blue-900">
                    <svg
                      className="h-6 w-6 text-gray-600 transition-colors group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Add Agent
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Browse all agents
                  </p>
                </div>
              </button>
            </div>

            {/* Agent Selection Modal */}
            {showAgentModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Select an Agent
                      </h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Choose from {allAgents.length} available agents
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAgentModal(false)}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg
                        className="h-6 w-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="max-h-[60vh] overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {allAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => handleAddAgent(agent)}
                          className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-750 dark:hover:border-blue-400"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-medium text-white">
                            {agent.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">
                              {agent.title}
                            </h3>
                            <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                              {agent.name}
                            </p>
                          </div>
                          <svg
                            className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

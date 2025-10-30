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

  // Mock user (in production, get from auth session)
  const userId = 'default-user';
  const userName = 'You';

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v3/agents');
      if (!response.ok) throw new Error('Failed to load agents');

      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
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
          </div>
        )}
      </div>
    </div>
  );
}

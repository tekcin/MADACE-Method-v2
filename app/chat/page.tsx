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
      <div className="h-screen flex flex-col">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Chat with AI Agents
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select an agent to start a conversation
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Agents Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first agent to start chatting
            </p>
            <button
              onClick={() => router.push('/agents')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Agents
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => startChat(agent)}
                className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                    {agent.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {agent.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {agent.name}
                    </p>
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 group-hover:underline">
                      <span>Start Chat</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

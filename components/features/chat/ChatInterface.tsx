/**
 * ChatInterface Component
 *
 * Main chat UI with message list, auto-scroll, and input
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@prisma/client';
import Message from './Message';
import ChatInput from './ChatInput';

export interface ChatInterfaceProps {
  sessionId: string;
  agentId: string;
  agentName: string;
  userId: string;
  userName?: string;
  onClose?: () => void;
}

export default function ChatInterface({
  sessionId,
  agentId,
  agentName,
  userId,
  userName,
  onClose,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v3/chat/sessions/${sessionId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (content: string) => {
    try {
      setIsSending(true);

      // Optimistically add user message
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        role: 'user',
        content,
        timestamp: new Date(),
        replyToId: null,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to API
      const response = await fetch(`/api/v3/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Replace temp message with real message
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMessage.id);
        return [...filtered, data.message];
      });

      // Get agent response (streaming or non-streaming)
      await getAgentResponse(data.message.id);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  const getAgentResponse = async (replyToId: string) => {
    try {
      setIsStreaming(true);

      // Add placeholder agent message for streaming indicator
      const placeholderMessage: ChatMessage = {
        id: `streaming-${Date.now()}`,
        sessionId,
        role: 'agent',
        content: '',
        timestamp: new Date(),
        replyToId,
      };
      setMessages((prev) => [...prev, placeholderMessage]);

      // Call LLM streaming endpoint
      const response = await fetch(`/api/v3/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          agentId,
          replyToId,
        }),
      });

      if (!response.ok) throw new Error('Failed to get agent response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let agentContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                agentContent += parsed.content || '';

                // Update streaming message
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === placeholderMessage.id
                      ? { ...m, content: agentContent }
                      : m
                  )
                );
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      }

      // Replace placeholder with final message from DB
      const finalResponse = await fetch(`/api/v3/chat/sessions/${sessionId}/messages?latest=1`);
      if (finalResponse.ok) {
        const finalData = await finalResponse.json();
        const latestMessage = finalData.messages?.[finalData.messages.length - 1];
        if (latestMessage && latestMessage.role === 'agent') {
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.id !== placeholderMessage.id);
            return [...filtered, latestMessage];
          });
        }
      }
    } catch (error) {
      console.error('Error getting agent response:', error);
      // Remove placeholder on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('streaming-')));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
            {agentName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{agentName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isStreaming ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close chat"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Start a conversation with {agentName}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Send a message to begin chatting with your AI agent
            </p>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                agentName={agentName}
                userName={userName}
                isStreaming={isStreaming && message.id.startsWith('streaming-')}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isSending || isStreaming} />
    </div>
  );
}

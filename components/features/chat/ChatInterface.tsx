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
import LLMSelector from './LLMSelector';

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
  userId: _userId,
  userName,
  onClose,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('local');
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

  const loadMessages = async (before?: Date) => {
    try {
      if (before) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        limit: '50',
        ...(before && { before: before.toISOString() }),
      });

      const response = await fetch(`/api/v3/chat/sessions/${sessionId}/messages?${params}`);
      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      const newMessages = data.messages || [];

      if (before) {
        // Prepend older messages for infinite scroll
        setMessages((prev) => [...newMessages, ...prev]);
        setHasMore(newMessages.length === 50);
      } else {
        // Initial load
        setMessages(newMessages);
        setHasMore(newMessages.length === 50);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll handler
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    // Check if scrolled to top (with 100px threshold)
    if (container.scrollTop < 100 && messages.length > 0) {
      const oldestMessage = messages[0];
      if (oldestMessage) {
        loadMessages(new Date(oldestMessage.timestamp));
      }
    }
  };

  // Add scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [messages, isLoadingMore, hasMore]);

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
        replyToId: replyingTo?.id || null,
        provider: null,
        model: null,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Clear reply state
      const replyToId = replyingTo?.id;
      setReplyingTo(null);

      // Send to API
      const response = await fetch(`/api/v3/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content, replyToId }),
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
        provider: selectedProvider,
        model: null,
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
          provider: selectedProvider, // Include selected provider
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
                    m.id === placeholderMessage.id ? { ...m, content: agentContent } : m
                  )
                );
              } catch {
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
    <div data-testid="chat-interface" className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div
        data-testid="chat-header"
        className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 font-medium text-white">
            {agentName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{agentName}</h2>
            <p
              className="text-sm text-gray-500 dark:text-gray-400"
              data-testid={isStreaming ? 'typing-indicator' : undefined}
            >
              {isStreaming ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* LLM Selector */}
          <LLMSelector
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            disabled={isSending || isStreaming}
          />

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Close chat"
            >
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
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
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              Start a conversation with {agentName}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Send a message to begin chatting with your AI agent
            </p>
          </div>
        ) : (
          <div>
            {/* Load more indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
                <span className="ml-2 text-sm text-gray-500">Loading more messages...</span>
              </div>
            )}

            {!hasMore && messages.length > 50 && (
              <div className="py-4 text-center">
                <span className="text-sm text-gray-500">
                  You&apos;ve reached the beginning of this conversation
                </span>
              </div>
            )}

            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                agentName={agentName}
                userName={userName}
                isStreaming={isStreaming && message.id.startsWith('streaming-')}
                onReply={() => setReplyingTo(message)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between border-t border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Replying to: {replyingTo.content.substring(0, 50)}...
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="rounded p-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            <svg
              className="h-4 w-4 text-gray-500"
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
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isSending || isStreaming} />
    </div>
  );
}

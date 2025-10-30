/**
 * Chat Panel Component
 *
 * Collapsible chat panel for in-app team communication.
 * Features:
 * - Message list with auto-scroll
 * - Text input with 500 char limit
 * - Real-time WebSocket updates
 * - Load last 50 messages on open
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { getWebSocketClient } from '@/lib/collab/websocket-client';
import { CollabEvent } from '@/lib/collab/types';
import type { ChatMessage as ChatMessageType } from '@/lib/collab/room-manager';
import ChatMessage from './ChatMessage';

interface ChatPanelProps {
  roomId: string; // Current room/project ID
  userId: string; // Current user ID
  userName: string; // Current user name
  userAvatar?: string; // Current user avatar URL (optional)
  visible?: boolean; // Show/hide the panel
  onClose?: () => void; // Callback when user closes the panel
}

export default function ChatPanel({
  roomId,
  userId,
  userName,
  userAvatar,
  visible = true,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const MAX_CHARS = 500;
  const remainingChars = MAX_CHARS - inputValue.length;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket setup
  useEffect(() => {
    const wsClient = getWebSocketClient();

    // Request chat history when component mounts
    wsClient.requestChatHistory(roomId);

    // Listen for chat history response
    const handleChatHistory = (data: unknown) => {
      const history = data as ChatMessageType[];
      setMessages(history);
    };

    // Listen for new chat messages
    const handleChatMessage = (data: unknown) => {
      const message = data as ChatMessageType;
      setMessages((prev) => [message, ...prev]);
    };

    // Subscribe to events
    wsClient.on(CollabEvent.CHAT_HISTORY, handleChatHistory);
    wsClient.on(CollabEvent.CHAT_MESSAGE, handleChatMessage);

    // Cleanup
    return () => {
      wsClient.off(CollabEvent.CHAT_HISTORY, handleChatHistory);
      wsClient.off(CollabEvent.CHAT_MESSAGE, handleChatMessage);
    };
  }, [roomId]);

  const handleSendMessage = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      return; // Don't send empty messages
    }

    if (trimmedValue.length > MAX_CHARS) {
      return; // Don't send if over limit
    }

    // Send message via WebSocket
    const wsClient = getWebSocketClient();
    wsClient.sendChatMessage(roomId, trimmedValue, userId, userName, userAvatar);

    // Clear input
    setInputValue('');

    // Focus input
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="flex w-80 flex-col border-l border-gray-800 bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 transition-colors hover:text-white"
            aria-label={isCollapsed ? 'Expand chat' : 'Collapse chat'}
          >
            <svg
              className={`h-5 w-5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
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
          </button>
          <h3 className="text-lg font-semibold text-white">Team Chat</h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
            aria-label="Close chat"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Chat Content (collapsible) */}
      {!isCollapsed && (
        <>
          {/* Message List */}
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-gray-500">
                <svg
                  className="mb-4 h-16 w-16 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm">No messages yet</p>
                <p className="mt-1 text-xs">Start the conversation!</p>
              </div>
            ) : (
              <>
                {/* Messages are displayed most recent first (reverse order) */}
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwnMessage={message.userId === userId}
                  />
                ))}
                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800 p-4">
            {/* Character Counter */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {remainingChars} / {MAX_CHARS} characters
              </span>
              {remainingChars < 0 && (
                <span className="text-xs font-medium text-red-500">Message too long!</span>
              )}
            </div>

            {/* Text Input */}
            <div className="flex space-x-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Shift+Enter for new line)"
                className="flex-1 resize-none rounded-lg bg-gray-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={3}
                maxLength={MAX_CHARS + 50} // Allow typing over to show error
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || remainingChars < 0}
                className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
                aria-label="Send message"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>

            {/* Hint */}
            <p className="mt-2 text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  );
}

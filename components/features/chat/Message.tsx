/**
 * Message Component
 *
 * Displays a single chat message with avatar, timestamp, and content
 */

'use client';

import { useMemo } from 'react';
import type { ChatMessage } from '@prisma/client';
import MarkdownMessage from './MarkdownMessage';

export interface MessageProps {
  message: ChatMessage;
  agentName?: string;
  userName?: string;
  isStreaming?: boolean;
  onReply?: () => void;
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 */
function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(timestamp).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.split(' ').filter((p) => p.length > 0);
  if (parts.length === 0) return 'AG';
  if (parts.length === 1) {
    const first = parts[0];
    return first ? first.substring(0, 2).toUpperCase() : 'AG';
  }
  const first = parts[0];
  const second = parts[1];
  if (!first || !second) return 'AG';
  return `${first[0]}${second[0]}`.toUpperCase();
}

export default function Message({
  message,
  agentName,
  userName,
  isStreaming,
  onReply,
}: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const relativeTime = useMemo(() => formatRelativeTime(message.timestamp), [message.timestamp]);

  const displayName = isUser ? userName || 'You' : isSystem ? 'System' : agentName || 'Agent';
  const initials = useMemo(() => (displayName ? getInitials(displayName) : 'AG'), [displayName]);

  // Color schemes
  const avatarBg = isUser ? 'bg-blue-500' : isSystem ? 'bg-gray-500' : 'bg-green-500';
  const bubbleBg = isUser
    ? 'bg-blue-50 dark:bg-blue-900/20'
    : isSystem
      ? 'bg-gray-50 dark:bg-gray-800'
      : 'bg-white dark:bg-gray-900';
  const bubbleBorder = isUser
    ? 'border-blue-200 dark:border-blue-700'
    : isSystem
      ? 'border-gray-200 dark:border-gray-700'
      : 'border-gray-200 dark:border-gray-700';

  return (
    <div
      data-testid="message"
      data-role={message.role}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} message mb-4`}
    >
      {/* Avatar */}
      <div
        className={`h-10 w-10 flex-shrink-0 rounded-full ${avatarBg} flex items-center justify-center text-sm font-medium text-white`}
      >
        {initials}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[70%] flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Name and Timestamp */}
        <div className={`mb-1 flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {displayName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{relativeTime}</span>
        </div>

        {/* Content */}
        <div
          className={`rounded-lg border ${bubbleBg} ${bubbleBorder} group relative p-3 shadow-sm`}
        >
          <MarkdownMessage content={message.content} />

          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="mt-2 flex items-center gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Typing...</span>
            </div>
          )}

          {/* Reply button (visible on hover) */}
          {onReply && !isStreaming && (
            <button
              onClick={onReply}
              className="absolute right-2 -bottom-2 rounded-full border border-gray-300 bg-white p-1.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="Reply to this message"
            >
              <svg
                className="h-4 w-4 text-gray-600 dark:text-gray-400"
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
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

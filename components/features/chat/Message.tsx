/**
 * Message Component
 *
 * Displays a single chat message with avatar, timestamp, and content
 */

'use client';

import { useMemo } from 'react';
import type { ChatMessage } from '@prisma/client';

export interface MessageProps {
  message: ChatMessage;
  agentName?: string;
  userName?: string;
  isStreaming?: boolean;
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
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return 'AG';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function Message({ message, agentName, userName, isStreaming }: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const relativeTime = useMemo(() => formatRelativeTime(message.timestamp), [message.timestamp]);

  const displayName = isUser ? (userName || 'You') : isSystem ? 'System' : (agentName || 'Agent');
  const initials = useMemo(() => displayName ? getInitials(displayName) : 'AG', [displayName]);

  // Color schemes
  const avatarBg = isUser
    ? 'bg-blue-500'
    : isSystem
      ? 'bg-gray-500'
      : 'bg-green-500';
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
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center text-white font-medium text-sm`}>
        {initials}
      </div>

      {/* Message Bubble */}
      <div className={`flex-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Name and Timestamp */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{relativeTime}</span>
        </div>

        {/* Content */}
        <div className={`rounded-lg border ${bubbleBg} ${bubbleBorder} p-3 shadow-sm`}>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{message.content}</p>

          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="flex items-center gap-1 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Typing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

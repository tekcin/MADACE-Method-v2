/**
 * Chat Message Component
 *
 * Displays a single chat message with avatar, user name, timestamp, and content.
 * Used in the ChatPanel to render the message list.
 */

'use client';

import Image from 'next/image';
import type { ChatMessage as ChatMessageType } from '@/lib/collab/room-manager';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage?: boolean; // Whether this message is from the current user
}

export default function ChatMessage({ message, isOwnMessage = false }: ChatMessageProps) {
  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter((p) => p.length > 0);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] || '') + (parts[1][0] || '');
    }
    return name.substring(0, Math.min(2, name.length));
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than 1 minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }

    // More than 24 hours - show time
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={`flex items-start space-x-3 rounded-lg p-3 transition-colors ${
        isOwnMessage ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-gray-800/50 hover:bg-gray-800/70'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {message.userAvatar ? (
          <Image
            src={message.userAvatar}
            alt={message.userName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white">
            {getInitials(message.userName).toUpperCase()}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="min-w-0 flex-1">
        {/* Header: Name + Timestamp */}
        <div className="mb-1 flex items-baseline space-x-2">
          <span
            className={`text-sm font-medium ${isOwnMessage ? 'text-blue-400' : 'text-gray-300'}`}
          >
            {message.userName}
            {isOwnMessage && <span className="ml-1 text-gray-500">(You)</span>}
          </span>
          <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
        </div>

        {/* Message Text */}
        <p className="text-sm break-words whitespace-pre-wrap text-gray-200">{message.content}</p>
      </div>
    </div>
  );
}

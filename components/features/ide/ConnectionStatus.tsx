'use client';

import React, { useEffect, useState } from 'react';
import { getWebSocketClient, ConnectionStatus as Status } from '@/lib/collab/websocket-client';
import type { CollabUser } from '@/lib/collab/websocket-server';

export interface ConnectionStatusProps {
  /** Show user count in room */
  showUserCount?: boolean;
  /** Show connection details on hover */
  showDetails?: boolean;
}

/**
 * ConnectionStatus Component
 *
 * Displays real-time WebSocket connection status with visual indicators.
 * Shows connected users count and connection health.
 */
export default function ConnectionStatus({
  showUserCount = true,
  showDetails = true,
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<Status>(Status.DISCONNECTED);
  const [users, setUsers] = useState<CollabUser[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const client = getWebSocketClient();

    // Subscribe to status changes
    const unsubscribeStatus = client.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Subscribe to room users changes
    const unsubscribeUsers = client.onRoomUsersChange((newUsers) => {
      setUsers(newUsers);
    });

    // Get initial status
    setStatus(client.getStatus());

    // Cleanup on unmount
    return () => {
      unsubscribeStatus();
      unsubscribeUsers();
    };
  }, []);

  /**
   * Get status color
   */
  const getStatusColor = (): string => {
    switch (status) {
      case Status.CONNECTED:
        return 'bg-green-500';
      case Status.CONNECTING:
        return 'bg-yellow-500';
      case Status.RECONNECTING:
        return 'bg-yellow-500 animate-pulse';
      case Status.DISCONNECTED:
        return 'bg-gray-500';
      case Status.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  /**
   * Get status text
   */
  const getStatusText = (): string => {
    switch (status) {
      case Status.CONNECTED:
        return 'Connected';
      case Status.CONNECTING:
        return 'Connecting...';
      case Status.RECONNECTING:
        return 'Reconnecting...';
      case Status.DISCONNECTED:
        return 'Disconnected';
      case Status.ERROR:
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (): React.ReactNode => {
    switch (status) {
      case Status.CONNECTED:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-green-500"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case Status.CONNECTING:
      case Status.RECONNECTING:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-yellow-500 animate-spin"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case Status.DISCONNECTED:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-gray-500"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case Status.ERROR:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-red-500"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Status indicator */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
        onMouseEnter={() => showDetails && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />

        {/* Status icon */}
        {getStatusIcon()}

        {/* User count (if connected and showUserCount is true) */}
        {showUserCount && status === Status.CONNECTED && users.length > 0 && (
          <span className="text-sm text-gray-300 font-medium">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </span>
        )}
      </div>

      {/* Tooltip with details */}
      {showDetails && showTooltip && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]">
          {/* Status */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-200">Status:</span>
            <span className="text-sm text-gray-400">{getStatusText()}</span>
          </div>

          {/* Users list (if connected) */}
          {status === Status.CONNECTED && users.length > 0 && (
            <>
              <div className="border-t border-gray-700 my-2" />
              <div className="text-sm font-semibold text-gray-200 mb-1">
                Online Users ({users.length}):
              </div>
              <div className="max-h-[120px] overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 py-1"
                  >
                    {/* User color indicator */}
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
                    {/* User name */}
                    <span className="text-xs text-gray-300 truncate">
                      {user.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Disconnected message */}
          {status === Status.DISCONNECTED && (
            <>
              <div className="border-t border-gray-700 my-2" />
              <p className="text-xs text-gray-400">
                Real-time collaboration unavailable
              </p>
            </>
          )}

          {/* Error message */}
          {status === Status.ERROR && (
            <>
              <div className="border-t border-gray-700 my-2" />
              <p className="text-xs text-red-400">
                Failed to connect to server
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

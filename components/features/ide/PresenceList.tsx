/**
 * Presence List Component
 *
 * Displays list of online users in the IDE sidebar.
 * Shows avatars, names, and status indicators for each user.
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPresenceManager, type UserPresence } from '@/lib/collab/presence-manager';
import { toast } from './Toast';

interface PresenceListProps {
  /**
   * Show/hide the component
   */
  visible?: boolean;

  /**
   * Callback when user count changes
   */
  onUserCountChange?: (count: number) => void;
}

export default function PresenceList({ visible = true, onUserCountChange }: PresenceListProps) {
  const [users, setUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    const presenceManager = getPresenceManager();

    // Subscribe to presence changes
    const unsubscribePresence = presenceManager.onPresenceChange((updatedUsers) => {
      // Exclude local user from the list
      const remoteUsers = updatedUsers.filter((user) => user.id !== presenceManager['localUserId']);
      setUsers(remoteUsers);

      // Notify parent of user count change
      if (onUserCountChange) {
        onUserCountChange(remoteUsers.length);
      }
    });

    // Subscribe to user join events
    const unsubscribeJoin = presenceManager.onUserJoin((user) => {
      // Show toast notification
      toast.success(`${user.name} joined`, 'Started collaborating on this project', 4000);
    });

    // Subscribe to user leave events
    const unsubscribeLeave = presenceManager.onUserLeave((userId) => {
      // Find user name from current users list
      const user = users.find((u) => u.id === userId);
      const userName = user?.name || 'A user';

      // Show toast notification
      toast.info(`${userName} left`, 'Stopped collaborating on this project', 3000);
    });

    // Load initial users
    const initialUsers = presenceManager.getOnlineUsers(true); // Exclude local user
    setUsers(initialUsers);
    if (onUserCountChange) {
      onUserCountChange(initialUsers.length);
    }

    return () => {
      unsubscribePresence();
      unsubscribeJoin();
      unsubscribeLeave();
    };
  }, [onUserCountChange, users]);

  if (!visible || users.length === 0) {
    return null;
  }

  return (
    <div className="flex w-64 flex-col border-l border-gray-800 bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <h3 className="text-lg font-semibold text-white">
          {users.length} {users.length === 1 ? 'User' : 'Users'} Online
        </h3>
      </div>

      {/* User List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

/**
 * User Card Component
 *
 * Displays a single user's information with avatar and status.
 */
function UserCard({ user }: { user: UserPresence }) {
  const getStatusColor = (): string => {
    switch (user.status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (): string => {
    switch (user.status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Idle';
      case 'away':
        return 'Away';
      default:
        return 'Unknown';
    }
  };

  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter((p) => p.length > 0);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] || '') + (parts[1][0] || '');
    }
    return name.substring(0, Math.min(2, name.length));
  };

  return (
    <div className="hover:bg-gray-750 flex items-center space-x-3 rounded-lg bg-gray-800 p-3 transition-colors">
      {/* Avatar */}
      <div className="relative">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            style={{ border: `2px solid ${user.color}` }}
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: user.color }}
          >
            {getInitials(user.name).toUpperCase()}
          </div>
        )}

        {/* Status Indicator */}
        <div
          className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-gray-800 ${getStatusColor()}`}
        />
      </div>

      {/* User Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{user.name}</p>
        {user.email && <p className="truncate text-xs text-gray-400">{user.email}</p>}
        <p className="text-xs text-gray-500">{getStatusText()}</p>
      </div>

      {/* Color Indicator */}
      <div
        className="h-4 w-4 rounded-full border border-gray-700"
        style={{ backgroundColor: user.color }}
        title={`User color: ${user.color}`}
      />
    </div>
  );
}

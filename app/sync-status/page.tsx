/**
 * Sync Status Page
 *
 * Real-time view of WebSocket sync service and connected clients
 */

'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';

interface ClientInfo {
  id: string;
  connectedAt: number;
  lastPing?: number;
  metadata?: {
    source?: 'web-ui' | 'cli-claude' | 'cli-gemini';
    userAgent?: string;
  };
}

interface SyncStatus {
  running: boolean;
  clients: ClientInfo[];
  clientCount: number;
  uptime: number;
}

export default function SyncStatusPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/sync');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start sync service');
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sync service');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to stop sync service');
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop sync service');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'cli-claude':
        return '🤖 Claude CLI';
      case 'cli-gemini':
        return '✨ Gemini CLI';
      case 'web-ui':
        return '🌐 Web UI';
      default:
        return '❓ Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sync status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Sync Service Status
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time WebSocket synchronization between Web UI and CLI tools
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Service Status Card */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-4 w-4 rounded-full ${
                status?.running
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Service Status: {status?.running ? 'Running' : 'Stopped'}
            </h2>
          </div>

          <div className="flex gap-2">
            {status?.running ? (
              <button
                onClick={handleStop}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <StopIcon className="h-5 w-5" />
                Stop Service
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                <PlayIcon className="h-5 w-5" />
                Start Service
              </button>
            )}

            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Refresh
            </button>
          </div>
        </div>

        {status?.running && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">Connected Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {status.clientCount}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">WebSocket Port</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3001</p>
            </div>
          </div>
        )}
      </div>

      {/* Connected Clients */}
      {status?.running && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Connected Clients ({status.clientCount})
          </h2>

          {status.clientCount === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400">
                No clients connected. Start a CLI tool or open another Web UI instance to see
                connections here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {status.clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSourceIcon(client.metadata?.source)}</span>
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {client.id.substring(0, 8)}...
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        client.lastPing && Date.now() - client.lastPing < 60000
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}
                    >
                      {client.lastPing && Date.now() - client.lastPing < 60000 ? 'Active' : 'Idle'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Connected:</span>{' '}
                      <span className="text-gray-900 dark:text-white">
                        {formatTimestamp(client.connectedAt)}
                      </span>
                    </div>

                    {client.lastPing && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Last Ping:</span>{' '}
                        <span className="text-gray-900 dark:text-white">
                          {formatUptime(client.lastPing)} ago
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connection Instructions */}
      {!status?.running && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
            How to Enable Real-Time Sync
          </h3>
          <p className="mb-4 text-blue-800 dark:text-blue-200">
            Click &quot;Start Service&quot; above to enable real-time synchronization between Web UI
            and CLI tools (Claude CLI, Gemini CLI).
          </p>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <p>
              <strong>After starting:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>WebSocket server will listen on port 3001</li>
              <li>File watchers will monitor workflow state changes</li>
              <li>All connected clients will receive real-time updates</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

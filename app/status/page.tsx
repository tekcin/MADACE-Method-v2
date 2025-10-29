'use client';

/**
 * Status Dashboard Page
 * STORY-V3-021: Create Web UI Status Dashboard Page
 *
 * Shows real-time project status with:
 * - State machine overview (Kanban summary)
 * - Recent activity feed (last 10 state changes)
 * - Quick status lookup (search)
 * - Real-time updates via WebSocket
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Status result from API
 */
interface StatusResult {
  found: boolean;
  entity: {
    type: string;
    id: string;
  };
  source: string;
  status?: {
    state: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

/**
 * State machine summary
 */
interface StateMachineSummary {
  backlog: number;
  todo: number;
  inProgress: number;
  done: number;
  total: number;
}

/**
 * Activity entry
 */
interface ActivityEntry {
  id: string;
  type: string;
  entityId: string;
  state: string;
  timestamp: string;
  details?: string;
}

export default function StatusPage() {
  const [summary, setSummary] = useState<StateMachineSummary>({
    backlog: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    total: 0,
  });
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<StatusResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());
  const [wsConnected, setWsConnected] = useState(false);

  /**
   * Fetch state machine summary
   */
  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/status/state-machine/state');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result.status) {
          const counts = data.result.status.details;
          setSummary({
            backlog: counts.backlogCount || 0,
            todo: counts.todoCount || 0,
            inProgress: counts.inProgressCount || 0,
            done: counts.doneCount || 0,
            total: counts.totalStories || 0,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, []);

  /**
   * Fetch recent activities
   * TODO: Implement activity log API endpoint
   */
  const fetchActivities = useCallback(async () => {
    // Placeholder: Mock activities for now
    setActivities([
      {
        id: '1',
        type: 'story',
        entityId: 'STORY-V3-010',
        state: 'DONE',
        timestamp: new Date().toISOString(),
        details: 'Manual Override functionality completed',
      },
      {
        id: '2',
        type: 'story',
        entityId: 'STORY-V3-007',
        state: 'DONE',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: 'CLI Command assess-scale completed',
      },
      {
        id: '3',
        type: 'story',
        entityId: 'STORY-V3-006',
        state: 'DONE',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: 'Conditional Workflow Execution completed',
      },
    ]);
  }, []);

  /**
   * Handle search
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      // Try to detect entity type from ID pattern
      const type = detectEntityType(searchQuery.trim());
      const response = await fetch(`/api/status/${type}/${encodeURIComponent(searchQuery.trim())}`);

      if (response.ok) {
        const data = await response.json();
        setSearchResult(data.result);
      } else {
        const errorData = await response.json();
        setSearchError(errorData.error || 'Failed to fetch status');
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Failed to fetch status');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Detect entity type from ID pattern
   */
  function detectEntityType(id: string): string {
    if (id.match(/^(STORY|EPIC|TASK)-/i)) return 'story';
    if (id.match(/^EPIC-/i)) return 'epic';
    if (id.match(/workflow/i)) return 'workflow';
    if (id === 'state') return 'state-machine';
    return 'story'; // Default
  }

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchSummary(), fetchActivities()]);
    setLastUpdate(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  };

  /**
   * Connect to WebSocket for real-time updates
   */
  useEffect(() => {
    // Initial data fetch
    fetchSummary();
    fetchActivities();

    // Connect to WebSocket server
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let pingInterval: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:3001');

        ws.onopen = () => {
          console.log('[WebSocket] Connected to sync server');
          setWsConnected(true);

          // Start ping interval to keep connection alive
          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('[WebSocket] Received:', message.type);

            // Handle different message types
            switch (message.type) {
              case 'state_updated':
              case 'workflow_completed':
              case 'workflow_started':
              case 'workflow_failed':
                // Refresh data on any state change
                fetchSummary();
                fetchActivities();
                setLastUpdate(new Date().toLocaleTimeString());
                break;
              case 'ping':
                // Server ping - send pong
                if (ws?.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                }
                break;
              case 'pong':
                // Server pong - connection healthy
                break;
            }
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          setWsConnected(false);
        };

        ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          setWsConnected(false);

          // Clear ping interval
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }

          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...');
            connect();
          }, 5000);
        };
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        setWsConnected(false);

        // Retry after 5 seconds
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    // Start connection
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      if (ws) {
        ws.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Status Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time project status and activity monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* WebSocket status indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`size-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-gray-400'}`}
            ></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {wsConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Last update timestamp */}
      <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Last updated: {lastUpdate}
      </div>

      {/* State machine overview (Kanban summary) */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          State Machine Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* BACKLOG */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">BACKLOG</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {summary.backlog}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">Ready to start</div>
          </div>

          {/* TODO */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-700 dark:bg-blue-900/20">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">TODO</div>
            <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
              {summary.todo}
            </div>
            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">Max 1 at a time</div>
          </div>

          {/* IN PROGRESS */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 dark:border-orange-700 dark:bg-orange-900/20">
            <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
              IN PROGRESS
            </div>
            <div className="mt-2 text-3xl font-bold text-orange-900 dark:text-orange-100">
              {summary.inProgress}
            </div>
            <div className="mt-1 text-xs text-orange-600 dark:text-orange-400">
              Max 1 at a time
            </div>
          </div>

          {/* DONE */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-700 dark:bg-green-900/20">
            <div className="text-sm font-medium text-green-700 dark:text-green-300">DONE</div>
            <div className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
              {summary.done}
            </div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">Completed</div>
          </div>

          {/* TOTAL */}
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20">
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">TOTAL</div>
            <div className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
              {summary.total}
            </div>
            <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">All stories</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Quick status lookup */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Quick Status Lookup
          </h2>
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter story ID (e.g., STORY-V3-010)"
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Search result */}
          {searchError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">{searchError}</p>
            </div>
          )}

          {searchResult && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {searchResult.entity.id}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    searchResult.status?.state === 'DONE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : searchResult.status?.state === 'IN_PROGRESS' || searchResult.status?.state === 'IN PROGRESS'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                        : searchResult.status?.state === 'TODO'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {searchResult.status?.state || 'BACKLOG'}
                </span>
              </div>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {searchResult.entity.type}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</dt>
                  <dd className="text-sm text-gray-900 dark:text-white break-all">
                    {searchResult.source}
                  </dd>
                </div>
                {searchResult.status?.details && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Details
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                        {JSON.stringify(searchResult.status.details, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Recent activity feed */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activity.entityId}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            activity.state === 'DONE'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                              : activity.state === 'IN_PROGRESS' || activity.state === 'IN PROGRESS'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                : activity.state === 'TODO'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {activity.state}
                        </span>
                      </div>
                      {activity.details && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {activity.details}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface UsageStatsProps {
  sessionId: string;
}

interface UsageData {
  total: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCost: number;
    averageResponseTime: number;
  };
  byProvider: Array<{
    provider: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCost: number;
    averageResponseTime: number;
  }>;
}

/**
 * UsageStats Component
 *
 * Displays real-time token usage, cost, and performance statistics for a chat session
 */
export function UsageStats({ sessionId }: UsageStatsProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchUsage = useCallback(async () => {
    try {
      const response = await fetch(`/api/v3/chat/sessions/${sessionId}/usage`);
      const data = await response.json();

      if (data.success) {
        setUsage(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to load usage stats');
      }
    } catch (err) {
      setError('Failed to fetch usage statistics');
      console.error('[UsageStats] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchUsage();
    // Refresh stats every 5 seconds
    const interval = setInterval(fetchUsage, 5000);
    return () => clearInterval(interval);
  }, [fetchUsage]);

  const formatTokens = (tokens: number): string => {
    return tokens.toLocaleString();
  };

  const formatCost = (cost: number): string => {
    if (cost === 0) return '$0.00';
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      gemini: 'text-blue-600 bg-blue-50 border-blue-200',
      claude: 'text-purple-600 bg-purple-50 border-purple-200',
      openai: 'text-green-600 bg-green-50 border-green-200',
      local: 'text-gray-600 bg-gray-50 border-gray-200',
    };
    return colors[provider] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-8 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error || 'No usage data available'}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Compact Header View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750"
      >
        <div className="flex items-center gap-4">
          <ChartBarIcon className="h-5 w-5 text-gray-500" />
          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatTokens(usage.total.totalTokens)}
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">tokens</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatCost(usage.total.estimatedCost)}
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">cost</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {usage.total.totalRequests}
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">requests</span>
            </div>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          {/* Total Stats Grid */}
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-750">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ChartBarIcon className="h-3 w-3" />
                Total Tokens
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatTokens(usage.total.totalTokens)}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatTokens(usage.total.promptTokens)} + {formatTokens(usage.total.completionTokens)}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-750">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <CurrencyDollarIcon className="h-3 w-3" />
                Estimated Cost
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCost(usage.total.estimatedCost)}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {usage.total.totalRequests} requests
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-750">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-3 w-3" />
                Avg Response
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(usage.total.averageResponseTime)}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">per request</div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-750">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircleIcon className="h-3 w-3" />
                Success Rate
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {((usage.total.successfulRequests / usage.total.totalRequests) * 100).toFixed(0)}%
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {usage.total.successfulRequests}/{usage.total.totalRequests}
              </div>
            </div>
          </div>

          {/* Provider Breakdown */}
          {usage.byProvider.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                By Provider
              </h4>
              <div className="space-y-2">
                {usage.byProvider.map((provider) => (
                  <div
                    key={provider.provider}
                    className={`rounded-lg border p-3 ${getProviderColor(provider.provider)} dark:bg-opacity-10`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">
                            {provider.provider}
                          </span>
                          {provider.failedRequests > 0 && (
                            <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <XCircleIcon className="h-3 w-3" />
                              {provider.failedRequests} failed
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex gap-3 text-xs">
                          <span>{formatTokens(provider.totalTokens)} tokens</span>
                          <span>•</span>
                          <span>{formatCost(provider.estimatedCost)}</span>
                          <span>•</span>
                          <span>{formatTime(provider.averageResponseTime)}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                        {provider.totalRequests} requests
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

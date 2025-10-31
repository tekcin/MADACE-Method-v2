/**
 * LLM Selector Component
 *
 * Dropdown to select LLM provider for chat
 */

'use client';

import { useState, useEffect } from 'react';
import type { LLMProviderInfo } from '@/app/api/v3/llm/providers/route';

export interface LLMSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  disabled?: boolean;
}

export default function LLMSelector({
  selectedProvider,
  onProviderChange,
  disabled = false,
}: LLMSelectorProps) {
  const [providers, setProviders] = useState<LLMProviderInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/v3/llm/providers');
      if (!response.ok) throw new Error('Failed to load providers');

      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProviderInfo = providers.find((p) => p.id === selectedProvider);
  const availableProviders = providers.filter((p) => p.available);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        title="Select LLM provider"
      >
        {/* Icon */}
        <svg
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>

        {/* Selected provider */}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {selectedProviderInfo?.name || selectedProvider}
        </span>

        {/* Default badge */}
        {selectedProviderInfo?.isDefault && (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Default
          </span>
        )}

        {/* Dropdown arrow */}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="p-2">
              <div className="mb-2 px-2 py-1">
                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Available Providers
                </h3>
              </div>

              {availableProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    onProviderChange(provider.id);
                    setIsOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                    provider.id === selectedProvider
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {provider.name}
                        </span>
                        {provider.isDefault && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {provider.description}
                      </p>
                    </div>

                    {/* Selected indicator */}
                    {provider.id === selectedProvider && (
                      <svg
                        className="ml-2 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}

              {/* Unavailable providers */}
              {providers.filter((p) => !p.available).length > 0 && (
                <>
                  <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                  <div className="mb-2 px-2 py-1">
                    <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                      Requires API Key
                    </h3>
                  </div>
                  {providers
                    .filter((p) => !p.available)
                    .map((provider) => (
                      <div
                        key={provider.id}
                        className="rounded-lg px-3 py-2 opacity-50"
                        title="API key not configured"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          <div className="flex-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {provider.name}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {provider.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorRecoveryProps {
  error: Error;
  onRetry: () => void;
  onSwitchProvider: (provider: string) => void;
  onDismiss: () => void;
  currentProvider?: string;
}

interface ProviderOption {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

/**
 * ErrorRecovery Component
 *
 * Displays helpful error messages and recovery options when LLM requests fail.
 * Implements RULES.md:
 * - RULE 5.4: Forgiving Errors, Clear Recovery
 * - RULE 3.6: LLM Provider Resilience
 */
export function ErrorRecovery({
  error,
  onRetry,
  onSwitchProvider,
  onDismiss,
  currentProvider = 'unknown',
}: ErrorRecoveryProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Detect error type
  const isOverloaded = error.message.toLowerCase().includes('overloaded');
  const isRateLimit = error.message.toLowerCase().includes('rate limit');
  const isAuthError =
    error.message.toLowerCase().includes('api key') ||
    error.message.toLowerCase().includes('authentication');
  const isNetworkError =
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('timeout') ||
    error.message.toLowerCase().includes('econnreset');

  // Available providers
  const providers: ProviderOption[] = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Free, fast, reliable (recommended)',
      available: true,
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      description: 'High quality, may be overloaded',
      available: true,
    },
    {
      id: 'openai',
      name: 'OpenAI GPT',
      description: 'Requires API key',
      available: !!process.env.OPENAI_API_KEY,
    },
    {
      id: 'local',
      name: 'Local Ollama',
      description: 'Private, offline (requires Ollama running)',
      available: true,
    },
  ].filter((p) => p.id !== currentProvider); // Don't show current provider

  // Determine error severity and styling
  const getSeverityColor = () => {
    if (isAuthError) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (isOverloaded || isRateLimit) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
  };

  // Get error-specific message
  const getErrorMessage = () => {
    if (isOverloaded) {
      return {
        title: `${currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)} API is Overloaded`,
        description:
          "The provider's servers are experiencing high traffic. This usually resolves in 30-60 seconds.",
        icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />,
      };
    }

    if (isRateLimit) {
      return {
        title: 'Rate Limit Reached',
        description:
          "You've exceeded the API rate limit. Try switching to a different provider or wait a few minutes.",
        icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />,
      };
    }

    if (isAuthError) {
      return {
        title: 'Authentication Failed',
        description:
          'API key is missing or invalid. Check your .env file and ensure the correct key is set.',
        icon: <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />,
      };
    }

    if (isNetworkError) {
      return {
        title: 'Network Error',
        description: 'Failed to connect to the API. Check your internet connection.',
        icon: <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />,
      };
    }

    return {
      title: 'Request Failed',
      description: error.message || 'An unexpected error occurred.',
      icon: <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />,
    };
  };

  const { title, description, icon } = getErrorMessage();

  return (
    <div
      className={`relative rounded-lg border-2 p-6 shadow-md ${getSeverityColor()}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10"
        aria-label="Dismiss error"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      {/* Error icon and message */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{description}</p>

          {/* Recovery options */}
          <div className="mt-4 space-y-3">
            {/* Retry button */}
            {(isOverloaded || isNetworkError) && (
              <div>
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Retry with {currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)}
                </button>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Wait 30-60 seconds before retrying
                </p>
              </div>
            )}

            {/* Provider switcher */}
            {!isAuthError && providers.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Switch to a different provider:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        onSwitchProvider(provider.id);
                      }}
                      disabled={!provider.available}
                      className={`rounded-md border border-gray-300 p-3 text-left transition-colors ${
                        provider.available
                          ? 'hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800'
                          : 'cursor-not-allowed opacity-50'
                      } ${
                        selectedProvider === provider.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {provider.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {provider.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status links */}
            <div className="mt-4 border-t border-gray-300 pt-3 dark:border-gray-600">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Check provider status:
              </p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                <a
                  href="https://status.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Claude Status
                </a>
                <a
                  href="https://status.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Google Cloud Status
                </a>
                <a
                  href="https://status.openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  OpenAI Status
                </a>
              </div>
            </div>

            {/* Technical details (collapsible) */}
            <details className="mt-4 rounded-md bg-black/5 p-3 dark:bg-white/5">
              <summary className="cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                Technical Details
              </summary>
              <pre className="mt-2 overflow-x-auto text-xs text-gray-600 dark:text-gray-400">
                {error.stack || error.message}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Agent } from '@/lib/types/agent';

/**
 * AgentPersona Component
 *
 * Displays detailed agent information including persona, role, principles,
 * communication style, menu actions, and prompts.
 */

export interface AgentPersonaProps {
  agent: Agent;
  onActionClick?: (action: string) => void;
}

export function AgentPersona({ agent, onActionClick }: AgentPersonaProps) {
  const handleActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with icon and title */}
      <div className="flex items-start space-x-4 border-b border-gray-200 pb-6 dark:border-gray-700">
        <div className="flex size-20 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-5xl dark:bg-blue-900">
          {agent.metadata.icon}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {agent.metadata.title}
          </h2>
          <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">{agent.persona.role}</p>
          <div className="mt-2 flex items-center space-x-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 uppercase dark:bg-blue-900 dark:text-blue-200">
              {agent.metadata.module}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              v{agent.metadata.version}
            </span>
          </div>
        </div>
      </div>

      {/* Identity */}
      {agent.persona.identity && (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">About</h3>
          <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
            {agent.persona.identity}
          </p>
        </div>
      )}

      {/* Communication Style */}
      {agent.persona.communication_style && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Communication Style</h3>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
              {agent.persona.communication_style}
            </p>
          </div>
        </div>
      )}

      {/* Principles */}
      {agent.persona.principles && agent.persona.principles.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Core Principles</h3>
          <ul className="space-y-2">
            {agent.persona.principles.map((principle, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="mt-0.5 mr-2 size-5 flex-shrink-0 text-blue-500 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300">{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Critical Actions */}
      {agent.critical_actions && agent.critical_actions.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Critical Actions</h3>
          <div className="flex flex-wrap gap-2">
            {agent.critical_actions.map((action, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
              >
                <svg
                  className="mr-1.5 size-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {action}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Menu Actions */}
      {agent.menu && agent.menu.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Available Actions</h3>
          <div className="space-y-2">
            {agent.menu.map((menuItem, index) => (
              <button
                key={index}
                onClick={() =>
                  handleActionClick(menuItem.action || menuItem.workflow || menuItem.exec || '')
                }
                className="flex w-full items-start rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {menuItem.trigger}
                    </code>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {menuItem.description}
                  </p>
                </div>
                <svg
                  className="ml-3 size-5 flex-shrink-0 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompts */}
      {agent.prompts && agent.prompts.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Available Prompts</h3>
          <div className="space-y-3">
            {agent.prompts.map((prompt, index) => (
              <details
                key={index}
                className="group rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div>
                    <code className="font-mono text-sm text-blue-600 dark:text-blue-400">
                      {prompt.trigger}
                    </code>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                      {prompt.name}
                    </p>
                  </div>
                  <svg
                    className="size-5 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </summary>
                <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <pre className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {prompt.content}
                  </pre>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Load Always */}
      {agent.load_always && agent.load_always.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Auto-loaded Files
          </h3>
          <ul className="space-y-1">
            {agent.load_always.map((file, index) => (
              <li
                key={index}
                className="flex items-center text-xs text-gray-600 dark:text-gray-400"
              >
                <svg
                  className="mr-2 size-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <code>{file}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

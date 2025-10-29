import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MADACE Web UI</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Methodology for AI-Driven Agile Collaboration Engine - v2.0
        </p>
      </div>

      {/* Status overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Agents</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">22</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">All Modules</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Workflows</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">0</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">Ready to start</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">System Status</div>
          <div className="mt-1 flex items-center">
            <div className="size-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
              Operational
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">All systems running</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/setup"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Setup Wizard</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure your installation
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/agents"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Agents</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View and manage agents</p>
              </div>
            </div>
          </Link>

          <Link
            href="/kanban"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Kanban Board</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track story lifecycle</p>
              </div>
            </div>
          </Link>

          <Link
            href="/workflows"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Workflows</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Execute workflows</p>
              </div>
            </div>
          </Link>

          <Link
            href="/llm-test"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300">
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">LLM Test</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Test LLM connections</p>
              </div>
            </div>
          </Link>

          <Link
            href="/settings"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure application</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting started */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-700 dark:bg-blue-900/20">
        <h2 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-100">Getting Started</h2>
        <p className="mb-4 text-sm text-blue-700 dark:text-blue-300">
          Welcome to the MADACE Web UI! This interface provides access to all MADACE features:
        </p>
        <ol className="list-inside list-decimal space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li>
            <strong>Setup Wizard</strong> - Configure project settings and LLM provider
          </li>
          <li>
            <strong>Agents</strong> - View and interact with AI agents (PM, Analyst, Architect, SM,
            DEV)
          </li>
          <li>
            <strong>Kanban Board</strong> - Visual workflow state tracking (BACKLOG → TODO → IN
            PROGRESS → DONE)
          </li>
          <li>
            <strong>Workflows</strong> - Execute automated development workflows
          </li>
          <li>
            <strong>LLM Test</strong> - Verify your LLM provider configuration
          </li>
          <li>
            <strong>Settings</strong> - Manage application and module settings
          </li>
        </ol>
      </div>
    </div>
  );
}

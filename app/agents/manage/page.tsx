/**
 * Manage Agents Page
 *
 * List and manage all agents from the database.
 */

import AgentList from '@/components/features/agents/AgentList';

export default function ManageAgentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Agents</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View, edit, and manage all your MADACE agents.
        </p>
      </div>

      {/* Agent List */}
      <AgentList />
    </div>
  );
}

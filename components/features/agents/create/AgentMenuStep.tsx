import { useState } from 'react';
import type { CreateAgentData, AgentMenuItem } from '@/lib/types/agent-create';

interface AgentMenuStepProps {
  agentData: CreateAgentData;
  setAgentData: (data: CreateAgentData) => void;
}

export function AgentMenuStep({ agentData, setAgentData }: AgentMenuStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [menuItem, setMenuItem] = useState<AgentMenuItem>({
    id: '',
    label: '',
    description: '',
    action: '',
  });

  const handleSaveMenuItem = () => {
    if (!menuItem.id || !menuItem.label || !menuItem.action) {
      alert('Please fill in ID, Label, and Action fields');
      return;
    }

    if (editingIndex !== null) {
      // Update existing item
      const updated = [...agentData.menu];
      updated[editingIndex] = menuItem;
      setAgentData({ ...agentData, menu: updated });
      setEditingIndex(null);
    } else {
      // Add new item
      setAgentData({ ...agentData, menu: [...agentData.menu, menuItem] });
    }

    // Reset form
    setMenuItem({ id: '', label: '', description: '', action: '' });
  };

  const handleEditMenuItem = (index: number) => {
    const item = agentData.menu[index];
    if (item) {
      setMenuItem(item);
      setEditingIndex(index);
    }
  };

  const handleDeleteMenuItem = (index: number) => {
    setAgentData({
      ...agentData,
      menu: agentData.menu.filter((_, i) => i !== index),
    });
  };

  const handleCancel = () => {
    setMenuItem({ id: '', label: '', description: '', action: '' });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Menu Actions</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define the actions users can trigger from the agent&apos;s menu
        </p>
      </div>

      {/* Menu Item Form */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          {editingIndex !== null ? 'Edit Menu Item' : 'Add Menu Item'}
        </h3>

        <div className="space-y-4">
          {/* ID Field */}
          <div>
            <label
              htmlFor="menu-id"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="menu-id"
              value={menuItem.id}
              onChange={(e) => setMenuItem({ ...menuItem, id: e.target.value })}
              placeholder="e.g., review-code"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          {/* Label Field */}
          <div>
            <label
              htmlFor="menu-label"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="menu-label"
              value={menuItem.label}
              onChange={(e) => setMenuItem({ ...menuItem, label: e.target.value })}
              placeholder="e.g., Review Code"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          {/* Action Field */}
          <div>
            <label
              htmlFor="menu-action"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Action <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="menu-action"
              value={menuItem.action}
              onChange={(e) => setMenuItem({ ...menuItem, action: e.target.value })}
              placeholder="e.g., workflow:review-code or prompt:code-review"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: workflow:name, prompt:name, or exec:command
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="menu-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="menu-description"
              value={menuItem.description || ''}
              onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
              placeholder="Brief description of what this action does..."
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveMenuItem}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Menu Item
            </button>
            {editingIndex !== null && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items List */}
      {agentData.menu.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Menu Items ({agentData.menu.length})
          </h3>
          <div className="space-y-2">
            {agentData.menu.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between rounded-md border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {item.id}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Action: <code className="font-mono">{item.action}</code>
                  </p>
                  {item.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditMenuItem(index)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMenuItem(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {agentData.menu.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No menu items added yet. Add your first menu action above.
          </p>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { CreateAgentData, AgentPrompt } from '@/lib/types/agent-create';

interface AgentPromptsStepProps {
  agentData: CreateAgentData;
  setAgentData: (data: CreateAgentData) => void;
}

export function AgentPromptsStep({ agentData, setAgentData }: AgentPromptsStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [prompt, setPrompt] = useState<AgentPrompt>({
    id: '',
    label: '',
    prompt: '',
    type: 'system',
  });

  const handleSavePrompt = () => {
    if (!prompt.id || !prompt.label || !prompt.prompt) {
      alert('Please fill in ID, Label, and Prompt fields');
      return;
    }

    if (editingIndex !== null) {
      // Update existing prompt
      const updated = [...agentData.prompts];
      updated[editingIndex] = prompt;
      setAgentData({ ...agentData, prompts: updated });
      setEditingIndex(null);
    } else {
      // Add new prompt
      setAgentData({ ...agentData, prompts: [...agentData.prompts, prompt] });
    }

    // Reset form
    setPrompt({ id: '', label: '', prompt: '', type: 'system' });
  };

  const handleEditPrompt = (index: number) => {
    setPrompt(agentData.prompts[index]);
    setEditingIndex(index);
  };

  const handleDeletePrompt = (index: number) => {
    setAgentData({
      ...agentData,
      prompts: agentData.prompts.filter((_, i) => i !== index),
    });
  };

  const handleCancel = () => {
    setPrompt({ id: '', label: '', prompt: '', type: 'system' });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Agent Prompts</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define the prompts that guide the agent&apos;s responses
        </p>
      </div>

      {/* Prompt Form */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          {editingIndex !== null ? 'Edit Prompt' : 'Add Prompt'}
        </h3>

        <div className="space-y-4">
          {/* ID Field */}
          <div>
            <label
              htmlFor="prompt-id"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="prompt-id"
              value={prompt.id}
              onChange={(e) => setPrompt({ ...prompt, id: e.target.value })}
              placeholder="e.g., system-prompt"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          {/* Label Field */}
          <div>
            <label
              htmlFor="prompt-label"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="prompt-label"
              value={prompt.label}
              onChange={(e) => setPrompt({ ...prompt, label: e.target.value })}
              placeholder="e.g., System Instructions"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          {/* Type Field */}
          <div>
            <label
              htmlFor="prompt-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Type
            </label>
            <select
              id="prompt-type"
              value={prompt.type || 'system'}
              onChange={(e) =>
                setPrompt({
                  ...prompt,
                  type: e.target.value as 'system' | 'user' | 'assistant',
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="assistant">Assistant</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Role of this prompt in the conversation
            </p>
          </div>

          {/* Prompt Content Field */}
          <div>
            <label
              htmlFor="prompt-content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Prompt Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="prompt-content"
              value={prompt.prompt}
              onChange={(e) => setPrompt({ ...prompt, prompt: e.target.value })}
              placeholder="Enter the prompt text that guides the agent&apos;s behavior..."
              rows={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use variables like {'{user_name}'} or {'{project_name}'} for dynamic content
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSavePrompt}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Prompt
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

      {/* Prompts List */}
      {agentData.prompts.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Prompts ({agentData.prompts.length})
          </h3>
          <div className="space-y-3">
            {agentData.prompts.map((item, index) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {item.id}
                      </span>
                      {item.type && (
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {item.type}
                        </span>
                      )}
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs font-mono text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                      {item.prompt}
                    </pre>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditPrompt(index)}
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
                      onClick={() => handleDeletePrompt(index)}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {agentData.prompts.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No prompts added yet. Add your first prompt above.
          </p>
        </div>
      )}
    </div>
  );
}

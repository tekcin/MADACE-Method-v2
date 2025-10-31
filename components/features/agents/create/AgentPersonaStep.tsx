import { useState } from 'react';
import type { CreateAgentData } from '@/lib/types/agent-create';

interface AgentPersonaStepProps {
  agentData: CreateAgentData;
  setAgentData: (data: CreateAgentData) => void;
}

export function AgentPersonaStep({ agentData, setAgentData }: AgentPersonaStepProps) {
  const [newPrinciple, setNewPrinciple] = useState('');

  const handleAddPrinciple = () => {
    if (newPrinciple.trim()) {
      setAgentData({
        ...agentData,
        persona: {
          ...agentData.persona,
          principles: [...(agentData.persona.principles || []), newPrinciple.trim()],
        },
      });
      setNewPrinciple('');
    }
  };

  const handleRemovePrinciple = (index: number) => {
    setAgentData({
      ...agentData,
      persona: {
        ...agentData.persona,
        principles: agentData.persona.principles?.filter((_, i) => i !== index) || [],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Agent Persona</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define your agent's personality and communication style
        </p>
      </div>

      {/* Role Field */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Role <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="role"
          value={agentData.persona.role}
          onChange={(e) =>
            setAgentData({
              ...agentData,
              persona: { ...agentData.persona, role: e.target.value },
            })
          }
          placeholder="e.g., Senior Software Developer"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          The agent's primary role or job title
        </p>
      </div>

      {/* Identity Field */}
      <div>
        <label
          htmlFor="identity"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Identity Description
        </label>
        <textarea
          id="identity"
          value={agentData.persona.identity || ''}
          onChange={(e) =>
            setAgentData({
              ...agentData,
              persona: { ...agentData.persona, identity: e.target.value },
            })
          }
          placeholder="Describe the agent&apos;s identity, expertise, and background..."
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Detailed description of who the agent is and their expertise
        </p>
      </div>

      {/* Communication Style Field */}
      <div>
        <label
          htmlFor="communication_style"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Communication Style
        </label>
        <select
          id="communication_style"
          value={agentData.persona.communication_style || 'professional'}
          onChange={(e) =>
            setAgentData({
              ...agentData,
              persona: { ...agentData.persona, communication_style: e.target.value },
            })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="technical">Technical</option>
          <option value="friendly">Friendly</option>
          <option value="formal">Formal</option>
          <option value="creative">Creative</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          How the agent communicates with users
        </p>
      </div>

      {/* Principles List */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Guiding Principles
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Core principles that guide the agent&apos;s behavior
        </p>

        {/* Add Principle Input */}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newPrinciple}
            onChange={(e) => setNewPrinciple(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPrinciple()}
            placeholder="e.g., Always prioritize code quality"
            className="block flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAddPrinciple}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Add
          </button>
        </div>

        {/* Principles List */}
        {agentData.persona.principles && agentData.persona.principles.length > 0 && (
          <ul className="mt-3 space-y-2">
            {agentData.persona.principles.map((principle, index) => (
              <li
                key={index}
                className="flex items-start justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {principle}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePrinciple(index)}
                  className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

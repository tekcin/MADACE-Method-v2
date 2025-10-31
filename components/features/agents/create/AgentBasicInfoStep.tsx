import type { CreateAgentData } from '@/lib/types/agent-create';

interface AgentBasicInfoStepProps {
  agentData: CreateAgentData;
  setAgentData: (data: CreateAgentData) => void;
}

const iconOptions = ['🤖', '👨‍💼', '👩‍💼', '🧑‍💻', '📊', '🎨', '🔧', '📝', '🔍', '💡', '🎯', '⚙️'];

export function AgentBasicInfoStep({ agentData, setAgentData }: AgentBasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Provide the core details for your custom agent
        </p>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Agent Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={agentData.name}
          onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
          placeholder="e.g., custom-dev"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          maxLength={50}
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Unique identifier (lowercase, no spaces, 1-50 characters)
        </p>
      </div>

      {/* Title Field */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Display Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={agentData.title}
          onChange={(e) => setAgentData({ ...agentData, title: e.target.value })}
          placeholder="e.g., Custom Developer"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          maxLength={100}
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Human-readable title (1-100 characters)
        </p>
      </div>

      {/* Icon Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Icon <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-12">
          {iconOptions.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setAgentData({ ...agentData, icon })}
              className={`flex h-12 w-12 items-center justify-center rounded-md border-2 text-2xl transition-colors ${
                agentData.icon === icon
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
        <div className="mt-2">
          <input
            type="text"
            value={agentData.icon}
            onChange={(e) => setAgentData({ ...agentData, icon: e.target.value })}
            placeholder="Or enter custom emoji"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            maxLength={10}
          />
        </div>
      </div>

      {/* Module Selection */}
      <div>
        <label
          htmlFor="module"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Module <span className="text-red-500">*</span>
        </label>
        <select
          id="module"
          value={agentData.module}
          onChange={(e) =>
            setAgentData({
              ...agentData,
              module: e.target.value as 'mam' | 'mab' | 'cis' | 'core',
            })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
        >
          <option value="mab">MAB - MADACE Agent Builder</option>
          <option value="mam">MAM - MADACE Agile Method</option>
          <option value="cis">CIS - Chat Interface System</option>
          <option value="core">Core - System Agent</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Choose the module this agent belongs to
        </p>
      </div>

      {/* Version Field */}
      <div>
        <label
          htmlFor="version"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Version <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="version"
          value={agentData.version}
          onChange={(e) => setAgentData({ ...agentData, version: e.target.value })}
          placeholder="1.0.0"
          pattern="^\d+\.\d+\.\d+$"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Semantic version format (e.g., 1.0.0)
        </p>
      </div>
    </div>
  );
}

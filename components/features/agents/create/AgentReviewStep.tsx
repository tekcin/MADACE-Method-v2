import type { CreateAgentData } from '@/lib/types/agent-create';

interface AgentReviewStepProps {
  agentData: CreateAgentData;
}

export function AgentReviewStep({ agentData }: AgentReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Review & Create</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review your agent configuration before creating
        </p>
      </div>

      {/* Agent Preview Card */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{agentData.icon}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {agentData.title || 'Untitled Agent'}
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                {agentData.module.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ID: {agentData.name || 'not-set'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                v{agentData.version}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h4>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Name</dt>
            <dd className="mt-1 text-gray-900 dark:text-white">{agentData.name || '-'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Title</dt>
            <dd className="mt-1 text-gray-900 dark:text-white">{agentData.title || '-'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Module</dt>
            <dd className="mt-1 text-gray-900 dark:text-white">
              {agentData.module.toUpperCase()}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Version</dt>
            <dd className="mt-1 text-gray-900 dark:text-white">{agentData.version}</dd>
          </div>
        </dl>
      </div>

      {/* Persona */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Persona</h4>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Role</dt>
            <dd className="mt-1 text-gray-900 dark:text-white">
              {agentData.persona.role || '-'}
            </dd>
          </div>
          {agentData.persona.identity && (
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Identity</dt>
              <dd className="mt-1 text-gray-900 dark:text-white">{agentData.persona.identity}</dd>
            </div>
          )}
          {agentData.persona.communication_style && (
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">
                Communication Style
              </dt>
              <dd className="mt-1 text-gray-900 dark:text-white">
                {agentData.persona.communication_style}
              </dd>
            </div>
          )}
          {agentData.persona.principles && agentData.persona.principles.length > 0 && (
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">
                Guiding Principles ({agentData.persona.principles.length})
              </dt>
              <dd className="mt-2">
                <ul className="list-inside list-disc space-y-1 text-gray-900 dark:text-white">
                  {agentData.persona.principles.map((principle, index) => (
                    <li key={index}>{principle}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Menu Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Menu Actions ({agentData.menu.length})
        </h4>
        {agentData.menu.length > 0 ? (
          <div className="space-y-2">
            {agentData.menu.map((item, index) => (
              <div
                key={index}
                className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-700 dark:bg-gray-600 dark:text-gray-300">
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
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No menu actions defined</p>
        )}
      </div>

      {/* Prompts */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Prompts ({agentData.prompts.length})
        </h4>
        {agentData.prompts.length > 0 ? (
          <div className="space-y-3">
            {agentData.prompts.map((item, index) => (
              <div
                key={index}
                className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                    {item.id}
                  </span>
                  {item.type && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {item.type}
                    </span>
                  )}
                </div>
                <pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded bg-white p-2 text-xs font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {item.prompt}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No prompts defined</p>
        )}
      </div>

      {/* Ready to Create Notice */}
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
              Ready to Create
            </h4>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              Your agent configuration looks good! Click &quot;Create Agent&quot; to save it to the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

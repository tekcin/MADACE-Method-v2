import type { SetupConfig } from '@/lib/types/setup';

interface Props {
  config: SetupConfig;
}

const providerNames = {
  gemini: 'Google Gemini',
  claude: 'Anthropic Claude',
  openai: 'OpenAI',
  local: 'Local (Ollama)',
};

export function SummaryStep({ config }: Props) {
  const { projectInfo, llmConfig, moduleConfig } = config;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configuration Summary</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Review your configuration before finishing setup
      </p>

      <div className="space-y-6">
        {/* Project Information */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Project Information
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Project Name:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {projectInfo.projectName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Output Folder:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {projectInfo.outputFolder}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Your Name:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {projectInfo.userName || '(Not provided)'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Language:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {projectInfo.communicationLanguage.toUpperCase()}
              </dd>
            </div>
          </dl>
        </div>

        {/* LLM Configuration */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            LLM Configuration
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Provider:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {providerNames[llmConfig.provider]}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">API Key:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {llmConfig.apiKey ? `${llmConfig.apiKey.substring(0, 8)}...` : '(Not provided)'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Model:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{llmConfig.model}</dd>
            </div>
          </dl>
        </div>

        {/* Module Configuration */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Enabled Modules
          </h3>
          <ul className="space-y-2 text-sm">
            {moduleConfig.mamEnabled && (
              <li className="flex items-center text-gray-900 dark:text-white">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                MAM (Multi-Agent Manager)
              </li>
            )}
            {moduleConfig.mabEnabled && (
              <li className="flex items-center text-gray-900 dark:text-white">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                MAB (Multi-Agent Builder)
              </li>
            )}
            {moduleConfig.cisEnabled && (
              <li className="flex items-center text-gray-900 dark:text-white">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                CIS (Container & Infrastructure Services)
              </li>
            )}
          </ul>
          {!moduleConfig.mamEnabled && !moduleConfig.mabEnabled && !moduleConfig.cisEnabled && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No modules enabled</p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Click &quot;Finish Setup&quot; to save your configuration. You can change these
              settings later in the Settings page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

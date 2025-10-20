import type { SetupConfig } from '@/lib/types/setup';

interface Props {
  config: SetupConfig;
  setConfig: (config: SetupConfig) => void;
}

const providerInfo = {
  gemini: {
    name: 'Google Gemini',
    description: 'Free tier available (60 req/min)',
    defaultModel: 'gemini-2.0-flash-exp',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Best reasoning, paid API',
    defaultModel: 'claude-3-5-sonnet-20241022',
    apiKeyUrl: 'https://console.anthropic.com/account/keys',
  },
  openai: {
    name: 'OpenAI',
    description: 'Popular choice, paid API',
    defaultModel: 'gpt-4-turbo-preview',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  local: {
    name: 'Local (Ollama)',
    description: 'Free and private, requires Ollama',
    defaultModel: 'llama2',
    apiKeyUrl: 'https://ollama.ai/',
  },
};

export function LLMConfigStep({ config, setConfig }: Props) {
  const updateLLMConfig = (field: string, value: string) => {
    setConfig({
      ...config,
      llmConfig: {
        ...config.llmConfig,
        [field]: value,
      },
    });
  };

  const handleProviderChange = (provider: 'gemini' | 'claude' | 'openai' | 'local') => {
    setConfig({
      ...config,
      llmConfig: {
        provider,
        apiKey: '',
        model: providerInfo[provider].defaultModel,
      },
    });
  };

  const currentProvider = config.llmConfig.provider;
  const info = providerInfo[currentProvider];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">LLM Configuration</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Select and configure your LLM provider for planning and architecture
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            LLM Provider
          </label>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(Object.keys(providerInfo) as Array<keyof typeof providerInfo>).map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleProviderChange(provider)}
                className={`flex flex-col rounded-lg border-2 p-4 text-left transition-colors ${
                  currentProvider === provider
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {providerInfo[provider].name}
                </span>
                <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {providerInfo[provider].description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            API Key {currentProvider === 'local' ? '(Optional)' : ''}
          </label>
          <input
            type="password"
            id="apiKey"
            value={config.llmConfig.apiKey}
            onChange={(e) => updateLLMConfig('apiKey', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder={
              currentProvider === 'local' ? 'Not required for local models' : 'Enter your API key'
            }
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get your API key from{' '}
            <a
              href={info.apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {info.name}
            </a>
          </p>
        </div>

        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Model
          </label>
          <input
            type="text"
            id="model"
            value={config.llmConfig.model}
            onChange={(e) => updateLLMConfig('model', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder={info.defaultModel}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Default: {info.defaultModel}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { LLMProvider } from '@/lib/llm/types';

// Provider-specific model lists
const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  gemini: ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'],
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  openai: ['gpt-4o-latest', 'gpt-4o-mini', 'gpt-3.5-turbo-latest'],
  local: ['gemma3', 'gemma3:latest', 'llama3.1', 'llama3.1:8b', 'codellama:7b', 'mistral:7b', 'custom'],
};

// Provider information
const PROVIDER_INFO: Record<
  LLMProvider,
  { name: string; description: string; requiresApiKey: boolean; defaultBaseURL?: string }
> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Fast and efficient AI models from Google',
    requiresApiKey: true,
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Advanced reasoning and analysis capabilities',
    requiresApiKey: true,
  },
  openai: {
    name: 'OpenAI GPT',
    description: 'Industry-leading language models',
    requiresApiKey: true,
  },
  local: {
    name: 'Local/Ollama',
    description: 'Run models locally with Ollama or Docker',
    requiresApiKey: false,
    defaultBaseURL: 'http://localhost:11434',
  },
};

// Error message helpers
const ERROR_MESSAGES: Record<LLMProvider, string> = {
  gemini: 'Invalid API key. Get yours at https://makersuite.google.com/app/apikey',
  claude: 'Invalid API key. Get yours at https://console.anthropic.com/account/keys',
  openai: 'Invalid API key. Get yours at https://platform.openai.com/api-keys',
  local: 'Cannot connect to Ollama. Ensure it is running: ollama serve',
};

interface TestResult {
  success: boolean;
  message?: string;
  response?: {
    content: string;
    provider: string;
    model: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: string;
}

export default function LLMTestPage() {
  const [provider, setProvider] = useState<LLMProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('http://localhost:11434');
  const [model, setModel] = useState('gemini-2.0-flash-exp');
  const [testPrompt, setTestPrompt] = useState('Hello! Please respond with a brief greeting.');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // Update model when provider changes
  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setModel(PROVIDER_MODELS[newProvider][0] || '');
    if (newProvider === 'local') {
      setBaseURL(PROVIDER_INFO.local.defaultBaseURL || 'http://localhost:11434');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/llm/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey: provider === 'local' ? undefined : apiKey,
          baseURL: provider === 'local' ? baseURL : undefined,
          model,
          testPrompt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Connection successful!',
          response: data.response,
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Connection failed',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setTesting(false);
    }
  };

  const providerInfo = PROVIDER_INFO[provider];
  const models = PROVIDER_MODELS[provider];

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">LLM Connection Test</h1>
        <p className="text-muted-foreground">
          Test your LLM provider configuration and verify connectivity
        </p>
      </div>

      <div className="space-y-6">
        {/* Provider Selection */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">1. Select Provider</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(Object.keys(PROVIDER_INFO) as LLMProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => handleProviderChange(p)}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  provider === p
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">{PROVIDER_INFO[p].name}</div>
                <div className="text-muted-foreground text-sm">{PROVIDER_INFO[p].description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">2. Configuration</h2>
          <div className="space-y-4">
            {/* API Key (for cloud providers) */}
            {providerInfo.requiresApiKey && (
              <div>
                <label htmlFor="apiKey" className="mb-2 block text-sm font-medium">
                  API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${providerInfo.name} API key`}
                  className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Your API key is never stored and only used for testing
                </p>
              </div>
            )}

            {/* Base URL (for local provider) */}
            {provider === 'local' && (
              <div>
                <label htmlFor="baseURL" className="mb-2 block text-sm font-medium">
                  Base URL
                </label>
                <input
                  type="text"
                  id="baseURL"
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  placeholder="http://localhost:11434 (auto-detected in Docker)"
                  className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Local: http://localhost:11434 | Docker: Auto-detected (http://ollama:11434)
                </p>
              </div>
            )}

            {/* Model Selection */}
            <div>
              <label htmlFor="model" className="mb-2 block text-sm font-medium">
                Model
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Prompt */}
            <div>
              <label htmlFor="testPrompt" className="mb-2 block text-sm font-medium">
                Test Prompt
              </label>
              <textarea
                id="testPrompt"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                rows={3}
                className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div>
          <button
            onClick={handleTest}
            disabled={testing || (providerInfo.requiresApiKey && !apiKey)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testing ? 'Testing Connection...' : 'Test Connection'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div
            className={`rounded-lg border p-6 ${
              result.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
            }`}
          >
            <h2 className="mb-4 text-xl font-semibold">
              {result.success ? '✅ Success' : '❌ Error'}
            </h2>

            {result.success && result.response && (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">Response:</h3>
                  <div className="bg-background/50 rounded-md p-4">
                    <p className="whitespace-pre-wrap">{result.response.content}</p>
                  </div>
                </div>

                {result.response.usage && (
                  <div>
                    <h3 className="mb-2 font-medium">Token Usage:</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-background/50 rounded-md p-3">
                        <div className="text-muted-foreground text-sm">Prompt Tokens</div>
                        <div className="text-lg font-semibold">
                          {result.response.usage.promptTokens}
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-md p-3">
                        <div className="text-muted-foreground text-sm">Completion Tokens</div>
                        <div className="text-lg font-semibold">
                          {result.response.usage.completionTokens}
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-md p-3">
                        <div className="text-muted-foreground text-sm">Total Tokens</div>
                        <div className="text-lg font-semibold">
                          {result.response.usage.totalTokens}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-muted-foreground text-sm">
                  Provider: {result.response.provider} | Model: {result.response.model}
                </div>
              </div>
            )}

            {!result.success && result.error && (
              <div className="space-y-4">
                <div className="bg-background/50 rounded-md p-4">
                  <p className="text-red-600 dark:text-red-400">{result.error}</p>
                </div>

                <div className="bg-background/50 rounded-md p-4">
                  <h3 className="mb-2 font-medium">Troubleshooting:</h3>
                  <p className="text-muted-foreground text-sm">{ERROR_MESSAGES[provider]}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

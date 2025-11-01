'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Config } from '@/lib/config/schema';

type LLMProvider = 'gemini' | 'claude' | 'openai' | 'local';

interface SettingsFormData {
  project_name: string;
  output_folder: string;
  user_name: string;
  communication_language: string;
  llm_provider: LLMProvider;
  llm_api_key: string;
  llm_model: string;
  mam_enabled: boolean;
  mab_enabled: boolean;
  cis_enabled: boolean;
}

interface FieldError {
  field: string;
  message: string;
}

// Provider-specific model options
const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  gemini: ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'],
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  openai: ['gpt-4o-latest', 'gpt-4o-mini', 'gpt-3.5-turbo-latest'],
  local: ['llama3.1', 'llama3.1:8b', 'codellama:7b', 'mistral:7b', 'custom'],
};

export default function SettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SettingsFormData>({
    project_name: '',
    output_folder: '',
    user_name: '',
    communication_language: '',
    llm_provider: 'gemini',
    llm_api_key: '',
    llm_model: '',
    mam_enabled: false,
    mab_enabled: false,
    cis_enabled: false,
  });
  const [originalData, setOriginalData] = useState<SettingsFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<FieldError[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/config');
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 404) {
          // Configuration not found - redirect to setup
          router.push('/setup');
          return;
        }
        throw new Error(result.message || 'Failed to load configuration');
      }

      const config: Config = result.config;

      // Transform Config to form data
      const data: SettingsFormData = {
        project_name: config.project_name,
        output_folder: config.output_folder,
        user_name: config.user_name,
        communication_language: config.communication_language,
        llm_provider: 'gemini', // Default, will be read from .env in future
        llm_api_key: '',
        llm_model: 'gemini-2.0-flash-exp',
        mam_enabled: config.modules.mam.enabled,
        mab_enabled: config.modules.mab.enabled,
        cis_enabled: config.modules.cis.enabled,
      };

      setFormData(data);
      setOriginalData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldError[] = [];

    if (!formData.project_name.trim()) {
      errors.push({ field: 'project_name', message: 'Project name is required' });
    }
    if (!formData.output_folder.trim()) {
      errors.push({ field: 'output_folder', message: 'Output folder is required' });
    }
    if (!formData.user_name.trim()) {
      errors.push({ field: 'user_name', message: 'User name is required' });
    }
    if (!formData.communication_language.trim()) {
      errors.push({
        field: 'communication_language',
        message: 'Communication language is required',
      });
    }
    if (formData.llm_provider !== 'local' && !formData.llm_api_key.trim()) {
      errors.push({ field: 'llm_api_key', message: 'API key is required for cloud providers' });
    }
    if (!formData.llm_model.trim()) {
      errors.push({ field: 'llm_model', message: 'Model selection is required' });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const response = await fetch('/api/llm/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formData.llm_provider,
          apiKey: formData.llm_api_key,
          model: formData.llm_model,
          testPrompt: 'Hello! Please respond with a brief greeting.',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTestResult({
          success: true,
          message: `Connection successful! Response: ${result.response?.substring(0, 100)}...`,
        });
      } else {
        setTestResult({
          success: false,
          message: result.message || 'Connection test failed',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find((e) => e.field === fieldName)?.message;
  };

  const handleSave = async () => {
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    setTestResult(null);

    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors before saving');
      return;
    }

    setIsSaving(true);

    try {
      // Transform form data to API payload
      const payload = {
        project_name: formData.project_name,
        output_folder: formData.output_folder,
        user_name: formData.user_name,
        communication_language: formData.communication_language,
        llm: {
          provider: formData.llm_provider,
          apiKey: formData.llm_api_key,
          model: formData.llm_model,
        },
        modules: {
          mam: { enabled: formData.mam_enabled },
          mab: { enabled: formData.mab_enabled },
          cis: { enabled: formData.cis_enabled },
        },
      };

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save configuration');
      }

      setSuccessMessage('Configuration saved successfully!');
      setOriginalData(formData);

      // Reload configuration to get updated values
      await loadConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
      setSuccessMessage(null);
      setError(null);
      setValidationErrors([]);
      setTestResult(null);
    }
  };

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !isSaving) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, isSaving]);

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading configuration...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MADACE Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your MADACE configuration and preferences
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
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
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Configuration Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Project Information Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Information
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Basic information about your MADACE project
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="project_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${
                  getFieldError('project_name')
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
                placeholder="My MADACE Project"
              />
              {getFieldError('project_name') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('project_name')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="output_folder"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Output Folder
              </label>
              <input
                type="text"
                id="output_folder"
                value={formData.output_folder}
                onChange={(e) => setFormData({ ...formData, output_folder: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="docs"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Folder where MADACE will generate documentation
              </p>
            </div>

            <div>
              <label
                htmlFor="user_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                User Name
              </label>
              <input
                type="text"
                id="user_name"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label
                htmlFor="communication_language"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Communication Language
              </label>
              <input
                type="text"
                id="communication_language"
                value={formData.communication_language}
                onChange={(e) =>
                  setFormData({ ...formData, communication_language: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="en"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Language code (e.g., en, es, fr, de)
              </p>
            </div>
          </div>
        </div>

        {/* LLM Configuration Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">LLM Configuration</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure your Language Model provider and API settings
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="llm_provider"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                LLM Provider
              </label>
              <select
                id="llm_provider"
                value={formData.llm_provider}
                onChange={(e) =>
                  setFormData({ ...formData, llm_provider: e.target.value as LLMProvider })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="gemini">Google Gemini</option>
                <option value="claude">Anthropic Claude</option>
                <option value="openai">OpenAI GPT</option>
                <option value="local">Local/Ollama</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="llm_api_key"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                API Key{' '}
                {formData.llm_provider !== 'local' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                id="llm_api_key"
                value={formData.llm_api_key}
                onChange={(e) => setFormData({ ...formData, llm_api_key: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${
                  getFieldError('llm_api_key')
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
                placeholder="Enter your API key"
              />
              {getFieldError('llm_api_key') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('llm_api_key')}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.llm_provider === 'local'
                  ? 'Local model URL (e.g., http://localhost:11434)'
                  : 'Your API key will be stored securely in .env'}
              </p>
            </div>

            <div>
              <label
                htmlFor="llm_model"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Model
              </label>
              <select
                id="llm_model"
                value={formData.llm_model}
                onChange={(e) => setFormData({ ...formData, llm_model: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${
                  getFieldError('llm_model')
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
              >
                <option value="">Select a model...</option>
                {PROVIDER_MODELS[formData.llm_provider].map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              {getFieldError('llm_model') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('llm_model')}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose a model for{' '}
                {formData.llm_provider === 'local' ? 'local inference' : 'API requests'}
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={
                  isTesting ||
                  !formData.llm_model ||
                  (formData.llm_provider !== 'local' && !formData.llm_api_key)
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {isTesting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Test LLM Connection
                  </>
                )}
              </button>
              {testResult && (
                <div
                  className={`mt-2 rounded-md p-3 ${
                    testResult.success
                      ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                      : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                  }`}
                >
                  <p className="text-sm">{testResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Modules</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enable or disable MADACE modules
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="mam_enabled"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  MAM (MADACE Agile Method)
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Core agile workflow with PM, Analyst, Architect, SM, and DEV agents
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.mam_enabled}
                onClick={() => setFormData({ ...formData, mam_enabled: !formData.mam_enabled })}
                className={`${
                  formData.mam_enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none`}
              >
                <span
                  className={`${
                    formData.mam_enabled ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="mab_enabled"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  MAB (MADACE Builder)
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create custom agents, workflows, and modules
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.mab_enabled}
                onClick={() => setFormData({ ...formData, mab_enabled: !formData.mab_enabled })}
                className={`${
                  formData.mab_enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none`}
              >
                <span
                  className={`${
                    formData.mab_enabled ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="cis_enabled"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  CIS (Creative Intelligence Suite)
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Creative workflows for ideation and innovation
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.cis_enabled}
                onClick={() => setFormData({ ...formData, cis_enabled: !formData.cis_enabled })}
                className={`${
                  formData.cis_enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none`}
              >
                <span
                  className={`${
                    formData.cis_enabled ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <div>
            {hasUnsavedChanges ? (
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  You have unsaved changes
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Press{' '}
                  <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-gray-600 dark:bg-gray-700">
                    Ctrl+S
                  </kbd>{' '}
                  or{' '}
                  <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-gray-600 dark:bg-gray-700">
                    ⌘+S
                  </kbd>{' '}
                  to save
                </p>
              </div>
            ) : validationErrors.length > 0 ? (
              <p className="text-sm text-red-600 dark:text-red-400">Please fix validation errors</p>
            ) : null}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={!hasUnsavedChanges || isSaving}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving && (
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

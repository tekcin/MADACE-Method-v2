'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectInfoStep } from '@/components/features/setup/ProjectInfoStep';
import { LLMConfigStep } from '@/components/features/setup/LLMConfigStep';
import { ModuleConfigStep } from '@/components/features/setup/ModuleConfigStep';
import { SummaryStep } from '@/components/features/setup/SummaryStep';
import { StepIndicator } from '@/components/features/setup/StepIndicator';
import type { SetupConfig, SetupStep } from '@/lib/types/setup';

const steps: SetupStep[] = ['project', 'llm', 'modules', 'summary'];

export default function SetupPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<SetupConfig>({
    projectInfo: {
      projectName: 'MADACE-Method v3.0',
      outputFolder: 'docs',
      userName: '',
      communicationLanguage: 'en',
    },
    llmConfig: {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-2.0-flash-exp',
    },
    moduleConfig: {
      mamEnabled: true,
      mabEnabled: false,
      cisEnabled: false,
    },
  });

  const currentStep = steps[currentStepIndex] as SetupStep;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare configuration payload
      const payload = {
        project_name: config.projectInfo.projectName,
        output_folder: config.projectInfo.outputFolder,
        user_name: config.projectInfo.userName,
        communication_language: config.projectInfo.communicationLanguage,
        llm: {
          provider: config.llmConfig.provider,
          apiKey: config.llmConfig.apiKey,
          model: config.llmConfig.model,
        },
        modules: {
          mam: { enabled: config.moduleConfig.mamEnabled },
          mab: { enabled: config.moduleConfig.mabEnabled },
          cis: { enabled: config.moduleConfig.cisEnabled },
        },
      };

      // Call configuration API
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Failed to save configuration');
      }

      // Show success message
      alert(
        `✅ Setup complete!\n\nConfiguration saved to:\n- ${result.paths.config}\n- ${result.paths.env}\n\nRedirecting to home page...`
      );

      // Redirect to home page
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save configuration';
      setError(errorMessage);
      console.error('Setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MADACE Setup Wizard</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Methodology for AI-Driven Agile Collaboration Engine
        </p>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Configure your MADACE installation in a few simple steps
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {currentStep === 'project' && <ProjectInfoStep config={config} setConfig={setConfig} />}
        {currentStep === 'llm' && <LLMConfigStep config={config} setConfig={setConfig} />}
        {currentStep === 'modules' && <ModuleConfigStep config={config} setConfig={setConfig} />}
        {currentStep === 'summary' && <SummaryStep config={config} />}

        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
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

        <div className="mt-8 flex justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <div className="flex gap-4">
            {!isLastStep && (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Next
              </button>
            )}
            {isLastStep && (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading && (
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
                {isLoading ? 'Saving...' : 'Finish Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

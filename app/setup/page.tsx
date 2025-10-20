'use client';

import { useState } from 'react';
import { ProjectInfoStep } from '@/components/features/setup/ProjectInfoStep';
import { LLMConfigStep } from '@/components/features/setup/LLMConfigStep';
import { ModuleConfigStep } from '@/components/features/setup/ModuleConfigStep';
import { SummaryStep } from '@/components/features/setup/SummaryStep';
import { StepIndicator } from '@/components/features/setup/StepIndicator';
import type { SetupConfig, SetupStep } from '@/lib/types/setup';

const steps: SetupStep[] = ['project', 'llm', 'modules', 'summary'];

export default function SetupPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [config, setConfig] = useState<SetupConfig>({
    projectInfo: {
      projectName: 'MADACE-Method v2.0',
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

  const handleFinish = () => {
    // eslint-disable-next-line no-console
    console.log('Setup configuration:', config);
    // TODO: Save configuration to file system or API
    alert(
      'Setup complete! Configuration saved to console.\n\nCheck the browser console to see your configuration.'
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MADACE Setup Wizard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure your MADACE installation in a few simple steps
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {currentStep === 'project' && <ProjectInfoStep config={config} setConfig={setConfig} />}
        {currentStep === 'llm' && <LLMConfigStep config={config} setConfig={setConfig} />}
        {currentStep === 'modules' && <ModuleConfigStep config={config} setConfig={setConfig} />}
        {currentStep === 'summary' && <SummaryStep config={config} />}

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
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
              >
                Finish Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

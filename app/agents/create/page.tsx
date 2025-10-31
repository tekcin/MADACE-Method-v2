'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentBasicInfoStep } from '@/components/features/agents/create/AgentBasicInfoStep';
import { AgentPersonaStep } from '@/components/features/agents/create/AgentPersonaStep';
import { AgentMenuStep } from '@/components/features/agents/create/AgentMenuStep';
import { AgentPromptsStep } from '@/components/features/agents/create/AgentPromptsStep';
import { AgentReviewStep } from '@/components/features/agents/create/AgentReviewStep';
import type { CreateAgentData, AgentCreateStep } from '@/lib/types/agent-create';

const steps: AgentCreateStep[] = ['basic', 'persona', 'menu', 'prompts', 'review'];

export default function CreateAgentPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<CreateAgentData>({
    name: '',
    title: '',
    icon: '🤖',
    module: 'mab',
    version: '1.0.0',
    persona: {
      role: '',
      identity: '',
      communication_style: 'professional',
      principles: [],
    },
    menu: [],
    prompts: [],
  });

  const currentStep = steps[currentStepIndex] as AgentCreateStep;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
      setError(null);
    }
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v3/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create agent');
      }

      alert(`✅ Agent created successfully!\n\nAgent: ${result.data.title}\nID: ${result.data.id}`);
      router.push(`/agents/${result.data.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Custom Agent</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Build your own AI agent with custom persona, menu actions, and prompts
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const stepLabels: Record<AgentCreateStep, string> = {
              basic: 'Basic Info',
              persona: 'Persona',
              menu: 'Menu Actions',
              prompts: 'Prompts',
              review: 'Review',
            };

            return (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isCompleted
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {stepLabels[step]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {currentStep === 'basic' && (
          <AgentBasicInfoStep agentData={agentData} setAgentData={setAgentData} />
        )}
        {currentStep === 'persona' && (
          <AgentPersonaStep agentData={agentData} setAgentData={setAgentData} />
        )}
        {currentStep === 'menu' && (
          <AgentMenuStep agentData={agentData} setAgentData={setAgentData} />
        )}
        {currentStep === 'prompts' && (
          <AgentPromptsStep agentData={agentData} setAgentData={setAgentData} />
        )}
        {currentStep === 'review' && <AgentReviewStep agentData={agentData} />}

        {/* Error Display */}
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
            >
              Previous
            </button>
          </div>
          <div className="flex gap-3">
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
                onClick={handleCreate}
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
                {isLoading ? 'Creating...' : 'Create Agent'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

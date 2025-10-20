import type { SetupStep } from '@/lib/types/setup';
import { CheckIcon } from '@heroicons/react/24/solid';

interface StepIndicatorProps {
  steps: SetupStep[];
  currentStep: SetupStep;
}

const stepLabels: Record<SetupStep, string> = {
  project: 'Project Info',
  llm: 'LLM Configuration',
  modules: 'Module Selection',
  summary: 'Summary',
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step} className="relative flex flex-1 items-center">
              <div className="group flex w-full items-center">
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-blue-600'
                        : isCurrent
                          ? 'border-2 border-blue-600 bg-white dark:bg-gray-900'
                          : 'border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={`${
                          isCurrent ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </span>
                  <span
                    className={`ml-4 text-sm font-medium ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {stepLabels[step]}
                  </span>
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-1/2 right-0 h-0.5 w-full -translate-y-1/2 ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

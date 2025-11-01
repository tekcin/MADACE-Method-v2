'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CreateWorkflowData, CreateWorkflowStep } from '@/lib/types/workflow-create';
import { BasicInfoStep } from './BasicInfoStep';
import { StepsEditorStep } from './StepsEditorStep';
import { VariablesStep } from './VariablesStep';
import { PreviewStep } from './PreviewStep';

interface WorkflowCreatorProps {
  onComplete?: (workflowData: CreateWorkflowData) => void;
  onCancel?: () => void;
}

const STEPS: { id: CreateWorkflowStep; label: string; description: string }[] = [
  { id: 'basic', label: 'Basic Info', description: 'Workflow metadata' },
  { id: 'steps', label: 'Steps', description: 'Define workflow steps' },
  { id: 'variables', label: 'Variables', description: 'Workflow variables' },
  { id: 'preview', label: 'Preview', description: 'Review and finish' },
];

export function WorkflowCreator({ onComplete, onCancel }: WorkflowCreatorProps) {
  const [currentStep, setCurrentStep] = useState<CreateWorkflowStep>('basic');
  const [workflowData, setWorkflowData] = useState<CreateWorkflowData>({
    name: '',
    description: '',
    agent: '',
    phase: 1,
    steps: [],
    variables: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'basic':
        if (!workflowData.name) {
          alert('Please provide a workflow name');
          return false;
        }
        if (!workflowData.description) {
          alert('Please provide a workflow description');
          return false;
        }
        if (!workflowData.agent) {
          alert('Please select a primary agent');
          return false;
        }
        return true;

      case 'steps':
        if (workflowData.steps.length === 0) {
          const confirmed = confirm(
            'You have not added any steps. Are you sure you want to continue?'
          );
          return confirmed;
        }
        return true;

      case 'variables':
        // Variables are optional
        return true;

      case 'preview':
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex];
      if (nextStep) {
        setCurrentStep(nextStep.id);
      }
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = STEPS[prevIndex];
      if (prevStep) {
        setCurrentStep(prevStep.id);
      }
    }
  };

  const handleFinish = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Call onComplete callback if provided
      if (onComplete) {
        await onComplete(workflowData);
      }

      setSubmitSuccess(true);

      // Reset form after a delay
      setTimeout(() => {
        setWorkflowData({
          name: '',
          description: '',
          agent: '',
          phase: 1,
          steps: [],
          variables: [],
        });
        setCurrentStep('basic');
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create workflow');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const confirmed = confirm(
      'Are you sure you want to cancel? All progress will be lost.'
    );
    if (confirmed) {
      if (onCancel) {
        onCancel();
      } else {
        // Reset form
        setWorkflowData({
          name: '',
          description: '',
          agent: '',
          phase: 1,
          steps: [],
          variables: [],
        });
        setCurrentStep('basic');
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl" data-testid="workflow-creator">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="creator-title">
          Create New Workflow
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Use this wizard to create a new MADACE workflow with steps and variables
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8" data-testid="progress-indicator">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className="flex flex-1 items-center" data-testid={`step-${step.id}`}>
                <div className="flex flex-col items-center">
                  <div
                    data-testid={`step-indicator-${step.id}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                        : isCompleted
                          ? 'border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500'
                          : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
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
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-medium ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      isCompleted
                        ? 'bg-green-600 dark:bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        data-testid="step-content"
      >
        {currentStep === 'basic' && (
          <BasicInfoStep workflowData={workflowData} setWorkflowData={setWorkflowData} />
        )}
        {currentStep === 'steps' && (
          <StepsEditorStep workflowData={workflowData} setWorkflowData={setWorkflowData} />
        )}
        {currentStep === 'variables' && (
          <VariablesStep workflowData={workflowData} setWorkflowData={setWorkflowData} />
        )}
        {currentStep === 'preview' && <PreviewStep workflowData={workflowData} />}
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20" data-testid="error-message">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-red-800 dark:text-red-300">{submitError}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="mt-4 rounded-md bg-green-50 p-4 dark:bg-green-900/20" data-testid="success-message">
          <div className="flex">
            <svg
              className="h-5 w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-green-800 dark:text-green-300">
              Workflow created successfully! Resetting form...
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between" data-testid="navigation-buttons">
        <div>
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isSubmitting}
              data-testid="previous-button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Previous
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            data-testid="cancel-button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>

          {currentStepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              data-testid="next-button"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              data-testid="finish-button"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Finish'}
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          Need help? Check the{' '}
          <Link href="/docs" className="text-blue-600 hover:underline dark:text-blue-400">
            documentation
          </Link>{' '}
          for workflow creation guidelines.
        </p>
      </div>
    </div>
  );
}

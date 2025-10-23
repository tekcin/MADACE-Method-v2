'use client';

import { useState } from 'react';
import { WorkflowCard, type WorkflowCardData } from '@/components/features/WorkflowCard';
import {
  WorkflowExecutionPanel,
  type WorkflowExecutionState,
  type WorkflowExecutionStep,
} from '@/components/features/WorkflowExecutionPanel';

/**
 * Workflows Page
 *
 * Displays available MADACE workflows and provides execution interface.
 * Shows workflow details, step-by-step execution, and progress tracking.
 */

export default function WorkflowsPage() {
  const [executionState, setExecutionState] = useState<WorkflowExecutionState | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock workflows for demonstration (in production, fetch from API)
  const workflows: WorkflowCardData[] = [
    {
      name: 'plan-project',
      description:
        'Scale-adaptive project planning workflow. Creates PRD/GDD and breaks down into epics based on project complexity.',
      agent: 'PM',
      phase: 1,
      stepCount: 8,
    },
    {
      name: 'create-story',
      description:
        'Generate detailed user story from epic. Includes acceptance criteria, technical requirements, and point estimation.',
      agent: 'Analyst',
      phase: 2,
      stepCount: 6,
    },
    {
      name: 'design-architecture',
      description:
        'Design system architecture and create technical specifications. Includes component design, data flow, and tech stack decisions.',
      agent: 'Architect',
      phase: 2,
      stepCount: 7,
    },
  ];

  const handleExecuteWorkflow = (workflowName: string) => {
    // Initialize workflow execution
    const workflow = workflows.find((w) => w.name === workflowName);
    if (!workflow) return;

    const steps: WorkflowExecutionStep[] = Array.from(
      { length: workflow.stepCount || 0 },
      (_, i) => ({
        name: `Step ${i + 1}`,
        action: 'pending',
        status: 'pending',
      })
    );

    setExecutionState({
      workflowName: workflow.name,
      currentStep: 0,
      totalSteps: workflow.stepCount || 0,
      steps,
      variables: {},
      completed: false,
      startedAt: new Date(),
    });
  };

  const handleExecuteNext = async () => {
    if (!executionState || executionState.completed) return;

    setLoading(true);

    // Simulate step execution (in production, call API)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newSteps = [...executionState.steps];
    const currentStepIndex = executionState.currentStep;

    if (currentStepIndex < newSteps.length) {
      const currentStep = newSteps[currentStepIndex];
      if (!currentStep) return;

      // Mark current step as completed
      newSteps[currentStepIndex] = {
        name: currentStep.name,
        action: currentStep.action,
        status: 'completed',
        message: `Step ${currentStepIndex + 1} executed successfully`,
      };

      // Mark next step as in-progress (if exists)
      if (currentStepIndex + 1 < newSteps.length) {
        const nextStep = newSteps[currentStepIndex + 1];
        if (!nextStep) return;

        newSteps[currentStepIndex + 1] = {
          name: nextStep.name,
          action: nextStep.action,
          status: 'in-progress',
        };
      }

      setExecutionState({
        ...executionState,
        currentStep: currentStepIndex + 1,
        steps: newSteps,
        completed: currentStepIndex + 1 >= newSteps.length,
        variables: {
          ...executionState.variables,
          [`step_${currentStepIndex + 1}_result`]: `Result from step ${currentStepIndex + 1}`,
        },
      });
    }

    setLoading(false);
  };

  const handleReset = () => {
    setExecutionState(null);
  };

  const handleWorkflowClick = (_workflowName: string) => {
    // In production, navigate to workflow detail page or show details modal
    // TODO: Implement workflow detail view
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MADACE Workflows</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Execute MADACE workflows to guide your project from planning through implementation.
        </p>
      </div>

      {/* Execution panel (if workflow is being executed) */}
      {executionState && (
        <div className="mb-8">
          <WorkflowExecutionPanel
            state={executionState}
            onExecuteNext={handleExecuteNext}
            onReset={handleReset}
            loading={loading}
          />
        </div>
      )}

      {/* Workflows grid (hide during execution) */}
      {!executionState && (
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Available Workflows
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.name}
                workflow={workflow}
                onExecute={handleExecuteWorkflow}
                onClick={handleWorkflowClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state for when no workflows exist */}
      {workflows.length === 0 && !executionState && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800">
          <svg
            className="mx-auto size-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No workflows available
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Workflow files will be loaded from the madace/workflows directory.
          </p>
        </div>
      )}

      {/* Information box */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
          About MADACE Workflows
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            MADACE workflows guide you through structured processes for project planning,
            requirements gathering, architecture design, and implementation.
          </p>
          <p>Each workflow consists of multiple steps with different action types:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Elicit</strong> - Gather input from user
            </li>
            <li>
              <strong>Reflect</strong> - LLM analyzes and processes information
            </li>
            <li>
              <strong>Guide</strong> - Provide guidance and instructions
            </li>
            <li>
              <strong>Template</strong> - Render templates with variables
            </li>
            <li>
              <strong>Validate</strong> - Check conditions and requirements
            </li>
            <li>
              <strong>Sub-workflow</strong> - Execute nested workflows
            </li>
          </ul>
        </div>
      </div>

      {/* Coming soon features */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
        <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">Coming Soon</h4>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>Load workflows from YAML files</li>
          <li>Real-time LLM integration for reflect steps</li>
          <li>Interactive input forms for elicit steps</li>
          <li>Template rendering with Handlebars</li>
          <li>Workflow state persistence and resume</li>
          <li>Custom workflow creation (via MAB module)</li>
        </ul>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type {
  CreateWorkflowData,
  WorkflowStepData,
  WorkflowActionType,
} from '@/lib/types/workflow-create';
import { ACTION_TEMPLATES, ACTION_DESCRIPTIONS } from '@/lib/types/workflow-create';

interface StepsEditorStepProps {
  workflowData: CreateWorkflowData;
  setWorkflowData: (data: CreateWorkflowData) => void;
}

export function StepsEditorStep({ workflowData, setWorkflowData }: StepsEditorStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [step, setStep] = useState<WorkflowStepData>({
    id: crypto.randomUUID(),
    name: '',
    action: 'display',
    message: 'Enter your message here...',
  });

  const handleActionTypeChange = (newAction: WorkflowActionType) => {
    const template = ACTION_TEMPLATES[newAction];
    setStep({
      id: step.id,
      name: step.name,
      action: newAction,
      ...template,
    } as WorkflowStepData);
  };

  const handleSaveStep = () => {
    if (!step.name) {
      alert('Please provide a step name');
      return;
    }

    // Validate action-specific fields
    if (step.action === 'display' && !step.message) {
      alert('Display action requires a message');
      return;
    }
    if ((step.action === 'reflect' || step.action === 'elicit') && !step.prompt) {
      alert(`${step.action} action requires a prompt`);
      return;
    }
    if (step.action === 'elicit' && !step.variable) {
      alert('Elicit action requires a variable name');
      return;
    }
    if (step.action === 'template' && (!step.template || !step.output_file)) {
      alert('Template action requires template path and output file');
      return;
    }
    if (step.action === 'workflow' && !step.workflow_name) {
      alert('Workflow action requires a workflow name');
      return;
    }
    if (step.action === 'sub-workflow' && !step.workflow_file) {
      alert('Sub-workflow action requires a workflow file path');
      return;
    }

    if (editingIndex !== null) {
      // Update existing step
      const updated = [...workflowData.steps];
      updated[editingIndex] = step;
      setWorkflowData({ ...workflowData, steps: updated });
      setEditingIndex(null);
    } else {
      // Add new step
      setWorkflowData({ ...workflowData, steps: [...workflowData.steps, step] });
    }

    // Reset form
    setStep({
      id: crypto.randomUUID(),
      name: '',
      action: 'display',
      message: 'Enter your message here...',
    });
  };

  const handleEditStep = (index: number) => {
    const item = workflowData.steps[index];
    if (item !== undefined) {
      setStep(item);
      setEditingIndex(index);
    }
  };

  const handleDeleteStep = (index: number) => {
    setWorkflowData({
      ...workflowData,
      steps: workflowData.steps.filter((_, i) => i !== index),
    });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...workflowData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    // Swap steps
    const temp = newSteps[index];
    const target = newSteps[targetIndex];
    if (temp && target) {
      newSteps[index] = target;
      newSteps[targetIndex] = temp;
      setWorkflowData({ ...workflowData, steps: newSteps });
    }
  };

  const handleCancel = () => {
    setStep({
      id: crypto.randomUUID(),
      name: '',
      action: 'display',
      message: 'Enter your message here...',
    });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Workflow Steps
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define the steps that make up your workflow
        </p>
      </div>

      {/* Step Editor Form */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          {editingIndex !== null ? 'Edit Step' : 'Add Step'}
        </h3>

        <div className="space-y-4">
          {/* Step Name */}
          <div>
            <label
              htmlFor="step-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Step Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="step-name"
              value={step.name}
              onChange={(e) => setStep({ ...step, name: e.target.value })}
              placeholder="e.g., gather-requirements"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lowercase with hyphens (e.g., my-step-name)
            </p>
          </div>

          {/* Action Type */}
          <div>
            <label
              htmlFor="step-action"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Action Type <span className="text-red-500">*</span>
            </label>
            <select
              id="step-action"
              value={step.action}
              onChange={(e) => handleActionTypeChange(e.target.value as WorkflowActionType)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              {Object.entries(ACTION_DESCRIPTIONS).map(([type, description]) => (
                <option key={type} value={type}>
                  {type} - {description}
                </option>
              ))}
            </select>
          </div>

          {/* Action-Specific Fields */}
          {step.action === 'display' && (
            <div>
              <label
                htmlFor="step-message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="step-message"
                value={step.message || ''}
                onChange={(e) => setStep({ ...step, message: e.target.value })}
                placeholder="Message to display to the user..."
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          )}

          {(step.action === 'reflect' || step.action === 'elicit') && (
            <>
              <div>
                <label
                  htmlFor="step-prompt"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="step-prompt"
                  value={step.prompt || ''}
                  onChange={(e) => setStep({ ...step, prompt: e.target.value })}
                  placeholder="Prompt for AI or user input..."
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              {step.action === 'elicit' && (
                <>
                  <div>
                    <label
                      htmlFor="step-variable"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Variable Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="step-variable"
                      value={step.variable || ''}
                      onChange={(e) => setStep({ ...step, variable: e.target.value })}
                      placeholder="e.g., user_input"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="step-validation"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Validation (Regex)
                    </label>
                    <input
                      type="text"
                      id="step-validation"
                      value={step.validation || ''}
                      onChange={(e) => setStep({ ...step, validation: e.target.value })}
                      placeholder="e.g., ^[a-zA-Z0-9]+$"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </>
              )}

              {step.action === 'reflect' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="step-model"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Model
                      </label>
                      <input
                        type="text"
                        id="step-model"
                        value={step.model || 'gemma3:latest'}
                        onChange={(e) => setStep({ ...step, model: e.target.value })}
                        placeholder="gemma3:latest"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="step-store-as"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Store As
                      </label>
                      <input
                        type="text"
                        id="step-store-as"
                        value={step.store_as || ''}
                        onChange={(e) => setStep({ ...step, store_as: e.target.value })}
                        placeholder="variable_name"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="step-max-tokens"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        id="step-max-tokens"
                        value={step.max_tokens || 500}
                        onChange={(e) => setStep({ ...step, max_tokens: parseInt(e.target.value) })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="step-temperature"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Temperature
                      </label>
                      <input
                        type="number"
                        id="step-temperature"
                        value={step.temperature || 0.7}
                        step="0.1"
                        min="0"
                        max="2"
                        onChange={(e) => setStep({ ...step, temperature: parseFloat(e.target.value) })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {step.action === 'template' && (
            <>
              <div>
                <label
                  htmlFor="step-template"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Template Path <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="step-template"
                  value={step.template || ''}
                  onChange={(e) => setStep({ ...step, template: e.target.value })}
                  placeholder="templates/example.hbs"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="step-output-file"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Output File <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="step-output-file"
                  value={step.output_file || ''}
                  onChange={(e) => setStep({ ...step, output_file: e.target.value })}
                  placeholder="output/{{'{filename}'}}.md"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
            </>
          )}

          {step.action === 'workflow' && (
            <div>
              <label
                htmlFor="step-workflow-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Workflow Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="step-workflow-name"
                value={step.workflow_name || ''}
                onChange={(e) => setStep({ ...step, workflow_name: e.target.value })}
                placeholder="example-workflow"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          )}

          {step.action === 'sub-workflow' && (
            <div>
              <label
                htmlFor="step-workflow-file"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Workflow File <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="step-workflow-file"
                value={step.workflow_file || ''}
                onChange={(e) => setStep({ ...step, workflow_file: e.target.value })}
                placeholder="workflows/sub-workflow.yaml"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          )}

          {/* Condition (Optional for all types) */}
          <div>
            <label
              htmlFor="step-condition"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Condition (Optional)
            </label>
            <input
              type="text"
              id="step-condition"
              value={step.condition || ''}
              onChange={(e) => setStep({ ...step, condition: e.target.value })}
              placeholder="e.g., complexity >= 2"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              JavaScript expression to determine if step should execute
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveStep}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Step
            </button>
            {editingIndex !== null && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Steps List */}
      {workflowData.steps.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Workflow Steps ({workflowData.steps.length})
          </h3>
          <div className="space-y-2">
            {workflowData.steps.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded-md border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleMoveStep(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 dark:hover:text-gray-300"
                      title="Move up"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(index, 'down')}
                      disabled={index === workflowData.steps.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 dark:hover:text-gray-300"
                      title="Move down"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.action}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {ACTION_DESCRIPTIONS[item.action]}
                    </p>
                    {item.condition && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Condition: <code className="font-mono">{item.condition}</code>
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditStep(index)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Edit step"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStep(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete step"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {workflowData.steps.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No steps added yet. Add your first workflow step above.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { CreateWorkflowData, WorkflowVariableData } from '@/lib/types/workflow-create';

interface VariablesStepProps {
  workflowData: CreateWorkflowData;
  setWorkflowData: (data: CreateWorkflowData) => void;
}

export function VariablesStep({ workflowData, setWorkflowData }: VariablesStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [variable, setVariable] = useState<WorkflowVariableData>({
    id: crypto.randomUUID(),
    name: '',
    value: '',
    description: '',
  });
  const [valueType, setValueType] = useState<'string' | 'number' | 'boolean'>('string');

  const handleSaveVariable = () => {
    if (!variable.name) {
      alert('Please provide a variable name');
      return;
    }

    // Convert value based on type
    let finalValue: string | number | boolean = variable.value;
    if (valueType === 'number') {
      const num = parseFloat(variable.value as string);
      if (isNaN(num)) {
        alert('Invalid number value');
        return;
      }
      finalValue = num;
    } else if (valueType === 'boolean') {
      finalValue = variable.value === 'true' || variable.value === true;
    }

    const finalVariable = { ...variable, value: finalValue };

    if (editingIndex !== null) {
      // Update existing variable
      const updated = [...workflowData.variables];
      updated[editingIndex] = finalVariable;
      setWorkflowData({ ...workflowData, variables: updated });
      setEditingIndex(null);
    } else {
      // Add new variable
      setWorkflowData({ ...workflowData, variables: [...workflowData.variables, finalVariable] });
    }

    // Reset form
    setVariable({
      id: crypto.randomUUID(),
      name: '',
      value: '',
      description: '',
    });
    setValueType('string');
  };

  const handleEditVariable = (index: number) => {
    const item = workflowData.variables[index];
    if (item) {
      setVariable(item);
      // Detect type from value
      if (typeof item.value === 'number') {
        setValueType('number');
      } else if (typeof item.value === 'boolean') {
        setValueType('boolean');
      } else {
        setValueType('string');
      }
      setEditingIndex(index);
    }
  };

  const handleDeleteVariable = (index: number) => {
    setWorkflowData({
      ...workflowData,
      variables: workflowData.variables.filter((_, i) => i !== index),
    });
  };

  const handleCancel = () => {
    setVariable({
      id: crypto.randomUUID(),
      name: '',
      value: '',
      description: '',
    });
    setValueType('string');
    setEditingIndex(null);
  };

  const getValueDisplay = (value: string | number | boolean): string => {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  };

  const getTypeDisplay = (value: string | number | boolean): string => {
    return typeof value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Workflow Variables
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define variables that can be used throughout the workflow
        </p>
      </div>

      {/* Variable Form */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          {editingIndex !== null ? 'Edit Variable' : 'Add Variable'}
        </h3>

        <div className="space-y-4">
          {/* Variable Name */}
          <div>
            <label
              htmlFor="var-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Variable Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="var-name"
              value={variable.name}
              onChange={(e) => setVariable({ ...variable, name: e.target.value })}
              placeholder="e.g., project_name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use snake_case for variable names (e.g., user_name, max_retries)
            </p>
          </div>

          {/* Value Type */}
          <div>
            <label
              htmlFor="var-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Value Type
            </label>
            <select
              id="var-type"
              value={valueType}
              onChange={(e) => {
                setValueType(e.target.value as 'string' | 'number' | 'boolean');
                // Reset value when type changes
                if (e.target.value === 'boolean') {
                  setVariable({ ...variable, value: 'false' });
                } else {
                  setVariable({ ...variable, value: '' });
                }
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>

          {/* Variable Value */}
          <div>
            <label
              htmlFor="var-value"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Value <span className="text-red-500">*</span>
            </label>
            {valueType === 'boolean' ? (
              <select
                id="var-value"
                value={getValueDisplay(variable.value)}
                onChange={(e) => setVariable({ ...variable, value: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="false">false</option>
                <option value="true">true</option>
              </select>
            ) : (
              <input
                type={valueType === 'number' ? 'number' : 'text'}
                id="var-value"
                value={getValueDisplay(variable.value)}
                onChange={(e) => setVariable({ ...variable, value: e.target.value })}
                placeholder={
                  valueType === 'number' ? 'e.g., 42' : 'e.g., My Project'
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="var-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="var-description"
              value={variable.description || ''}
              onChange={(e) => setVariable({ ...variable, description: e.target.value })}
              placeholder="Brief description of what this variable is used for..."
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveVariable}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Variable
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

      {/* Variables List */}
      {workflowData.variables.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Defined Variables ({workflowData.variables.length})
          </h3>
          <div className="space-y-2">
            {workflowData.variables.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded-md border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </code>
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {getTypeDisplay(item.value)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    Value: <code className="font-mono">{getValueDisplay(item.value)}</code>
                  </p>
                  {item.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditVariable(index)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Edit variable"
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
                    onClick={() => handleDeleteVariable(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete variable"
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

      {workflowData.variables.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No variables defined yet. Variables are optional but useful for dynamic workflows.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Using Variables
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Variables can be referenced in workflow steps using the syntax:
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Handlebars: <code className="font-mono">{'{{variable_name}}'}</code></li>
                <li>JavaScript: <code className="font-mono">$&#123;variable_name&#125;</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

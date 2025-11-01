import type { CreateWorkflowData } from '@/lib/types/workflow-create';

interface BasicInfoStepProps {
  workflowData: CreateWorkflowData;
  setWorkflowData: (data: CreateWorkflowData) => void;
}

export function BasicInfoStep({ workflowData, setWorkflowData }: BasicInfoStepProps) {
  const handleChange = (field: keyof CreateWorkflowData, value: string | number) => {
    setWorkflowData({
      ...workflowData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define the basic properties of your workflow
        </p>
      </div>

      <div className="space-y-4">
        {/* Workflow Name */}
        <div>
          <label
            htmlFor="workflow-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Workflow Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="workflow-name"
            value={workflowData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., feature-development"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Lowercase, use hyphens for spaces (e.g., my-workflow)
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="workflow-description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="workflow-description"
            value={workflowData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of what this workflow does..."
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            required
          />
        </div>

        {/* Agent */}
        <div>
          <label
            htmlFor="workflow-agent"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Primary Agent <span className="text-red-500">*</span>
          </label>
          <select
            id="workflow-agent"
            value={workflowData.agent}
            onChange={(e) => handleChange('agent', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            required
          >
            <option value="">Select an agent...</option>
            <option value="pm">Product Manager (PM)</option>
            <option value="analyst">Business Analyst</option>
            <option value="architect">Solution Architect</option>
            <option value="dev">Developer</option>
            <option value="qa">QA Engineer</option>
            <option value="devops">DevOps Engineer</option>
            <option value="sm">Scrum Master</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            The agent that will execute this workflow
          </p>
        </div>

        {/* Phase */}
        <div>
          <label
            htmlFor="workflow-phase"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Phase <span className="text-red-500">*</span>
          </label>
          <select
            id="workflow-phase"
            value={workflowData.phase}
            onChange={(e) => handleChange('phase', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            required
          >
            <option value={1}>Phase 1 - Planning & Analysis</option>
            <option value={2}>Phase 2 - Design & Architecture</option>
            <option value={3}>Phase 3 - Implementation</option>
            <option value={4}>Phase 4 - Testing & QA</option>
            <option value={5}>Phase 5 - Deployment & Monitoring</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            MADACE workflow phase (1-5)
          </p>
        </div>
      </div>

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
              Workflow Naming Convention
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Use descriptive lowercase names with hyphens. Examples:
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>feature-development</li>
                <li>code-review-process</li>
                <li>deployment-checklist</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { SetupConfig } from '@/lib/types/setup';

interface Props {
  config: SetupConfig;
  setConfig: (config: SetupConfig) => void;
}

export function ProjectInfoStep({ config, setConfig }: Props) {
  const updateProjectInfo = (field: string, value: string) => {
    setConfig({
      ...config,
      projectInfo: {
        ...config.projectInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Information</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Basic information about your MADACE project
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Project Name
          </label>
          <input
            type="text"
            id="projectName"
            value={config.projectInfo.projectName}
            onChange={(e) => updateProjectInfo('projectName', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="My MADACE Project"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The name of your project for documentation headers
          </p>
        </div>

        <div>
          <label
            htmlFor="outputFolder"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Output Folder
          </label>
          <input
            type="text"
            id="outputFolder"
            value={config.projectInfo.outputFolder}
            onChange={(e) => updateProjectInfo('outputFolder', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="docs"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Directory where generated documents will be stored
          </p>
        </div>

        <div>
          <label
            htmlFor="userName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Your Name
          </label>
          <input
            type="text"
            id="userName"
            value={config.projectInfo.userName}
            onChange={(e) => updateProjectInfo('userName', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Your Name"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your name for document headers and attribution
          </p>
        </div>

        <div>
          <label
            htmlFor="communicationLanguage"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Communication Language
          </label>
          <select
            id="communicationLanguage"
            value={config.projectInfo.communicationLanguage}
            onChange={(e) => updateProjectInfo('communicationLanguage', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Language for LLM interactions and generated documents
          </p>
        </div>
      </div>
    </div>
  );
}

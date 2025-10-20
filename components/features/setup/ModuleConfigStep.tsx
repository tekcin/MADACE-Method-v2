import type { SetupConfig } from '@/lib/types/setup';

interface Props {
  config: SetupConfig;
  setConfig: (config: SetupConfig) => void;
}

const moduleInfo = {
  mam: {
    name: 'MAM (Multi-Agent Manager)',
    description:
      'Core workflow for project planning, architecture, and story management using AI agents',
    recommended: true,
  },
  mab: {
    name: 'MAB (Multi-Agent Builder)',
    description: 'Automated code generation and implementation using AI agents',
    recommended: false,
  },
  cis: {
    name: 'CIS (Container & Infrastructure Services)',
    description: 'Infrastructure as code, containerization, and deployment automation',
    recommended: false,
  },
};

export function ModuleConfigStep({ config, setConfig }: Props) {
  const updateModuleConfig = (field: string, value: boolean) => {
    setConfig({
      ...config,
      moduleConfig: {
        ...config.moduleConfig,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Module Selection</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Choose which MADACE modules to enable for your project
      </p>

      <div className="space-y-4">
        {(Object.keys(moduleInfo) as Array<keyof typeof moduleInfo>).map((moduleKey) => {
          const moduleData = moduleInfo[moduleKey];
          const fieldName = `${moduleKey}Enabled` as keyof typeof config.moduleConfig;
          const isEnabled = config.moduleConfig[fieldName];

          return (
            <div
              key={moduleKey}
              className="flex items-start rounded-lg border border-gray-300 p-4 dark:border-gray-700"
            >
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  id={moduleKey}
                  checked={isEnabled}
                  onChange={(e) => updateModuleConfig(fieldName, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 flex-1">
                <label
                  htmlFor={moduleKey}
                  className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {moduleData.name}
                  {moduleData.recommended && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Recommended
                    </span>
                  )}
                </label>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {moduleData.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              MAM is recommended for all projects. MAB and CIS are optional and can be enabled
              later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

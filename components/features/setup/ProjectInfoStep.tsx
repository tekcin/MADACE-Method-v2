'use client';

import { useEffect } from 'react';
import type { SetupConfig } from '@/lib/types/setup';
import { assessComplexity } from '@/lib/workflows/complexity-assessment';
import type { ProjectInput } from '@/lib/workflows/complexity-types';
import { AssessmentWidget } from '../AssessmentWidget';

interface Props {
  config: SetupConfig;
  setConfig: (config: SetupConfig) => void;
}

export function ProjectInfoStep({ config, setConfig }: Props) {
  const updateProjectInfo = (field: string, value: string | number) => {
    setConfig({
      ...config,
      projectInfo: {
        ...config.projectInfo,
        [field]: value,
      },
    });
  };

  // Auto-assess when assessment fields change
   
  useEffect(() => {
    const {
      projectSize,
      teamSize,
      codebaseComplexity,
      integrations,
      userBase,
      security,
      duration,
      existingCode,
    } = config.projectInfo;

    // Only assess if all fields are filled
    if (
      projectSize !== undefined &&
      teamSize !== undefined &&
      codebaseComplexity !== undefined &&
      integrations !== undefined &&
      userBase !== undefined &&
      security !== undefined &&
      duration !== undefined &&
      existingCode !== undefined
    ) {
      const input: ProjectInput = {
        projectSize,
        teamSize,
        codebaseComplexity,
        integrations,
        userBase,
        security,
        duration,
        existingCode,
      };

      const result = assessComplexity(input);

      setConfig({
        ...config,
        assessment: {
          autoAssessment: result,
          manualOverride: config.assessment?.manualOverride ?? null,
        },
      });
    }
  }, [
    config.projectInfo.projectSize,
    config.projectInfo.teamSize,
    config.projectInfo.codebaseComplexity,
    config.projectInfo.integrations,
    config.projectInfo.userBase,
    config.projectInfo.security,
    config.projectInfo.duration,
    config.projectInfo.existingCode,
  ]);

  const handleManualOverride = (level: number | null) => {
    setConfig({
      ...config,
      assessment: {
        autoAssessment: config.assessment?.autoAssessment ?? null,
        manualOverride: level,
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

        {/* Complexity Assessment Fields */}
        <div className="mt-8 border-t border-gray-300 pt-6 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Complexity Assessment
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Answer these questions to determine the recommended planning level
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Project Size */}
            <div>
              <label
                htmlFor="projectSize"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Project Size
              </label>
              <select
                id="projectSize"
                value={config.projectInfo.projectSize ?? ''}
                onChange={(e) => updateProjectInfo('projectSize', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select size...</option>
                <option value="0">Tiny (&lt; 1K LOC)</option>
                <option value="1">Small (1K-5K LOC)</option>
                <option value="2">Medium (5K-20K LOC)</option>
                <option value="3">Large (20K-100K LOC)</option>
                <option value="4">Very Large (100K-500K LOC)</option>
                <option value="5">Massive (500K+ LOC)</option>
              </select>
            </div>

            {/* Team Size */}
            <div>
              <label
                htmlFor="teamSize"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Team Size
              </label>
              <select
                id="teamSize"
                value={config.projectInfo.teamSize ?? ''}
                onChange={(e) => updateProjectInfo('teamSize', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select team size...</option>
                <option value="0">Solo (1 developer)</option>
                <option value="1">Small (2-3 developers)</option>
                <option value="2">Medium (4-6 developers)</option>
                <option value="3">Large (7-15 developers)</option>
                <option value="4">Very Large (16-50 developers)</option>
                <option value="5">Enterprise (50+ developers)</option>
              </select>
            </div>

            {/* Codebase Complexity */}
            <div>
              <label
                htmlFor="codebaseComplexity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Codebase Complexity
              </label>
              <select
                id="codebaseComplexity"
                value={config.projectInfo.codebaseComplexity ?? ''}
                onChange={(e) => updateProjectInfo('codebaseComplexity', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select complexity...</option>
                <option value="0">Trivial (simple scripts)</option>
                <option value="1">Simple (straightforward app)</option>
                <option value="2">Moderate (standard patterns)</option>
                <option value="3">Complex (microservices)</option>
                <option value="4">Very Complex (distributed systems)</option>
                <option value="5">Extreme (large-scale distributed)</option>
              </select>
            </div>

            {/* Integrations */}
            <div>
              <label
                htmlFor="integrations"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                External Integrations
              </label>
              <select
                id="integrations"
                value={config.projectInfo.integrations ?? ''}
                onChange={(e) => updateProjectInfo('integrations', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select integration count...</option>
                <option value="0">None (standalone)</option>
                <option value="1">Few (1-2 APIs)</option>
                <option value="2">Some (3-5 APIs)</option>
                <option value="3">Many (6-10 integrations)</option>
                <option value="4">Very Many (11-20 integrations)</option>
                <option value="5">Extensive (20+ integrations)</option>
              </select>
            </div>

            {/* User Base */}
            <div>
              <label
                htmlFor="userBase"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Expected User Base
              </label>
              <select
                id="userBase"
                value={config.projectInfo.userBase ?? ''}
                onChange={(e) => updateProjectInfo('userBase', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select user base...</option>
                <option value="0">Personal (&lt; 10 users)</option>
                <option value="1">Internal (10-100 users)</option>
                <option value="2">Small (100-1K users)</option>
                <option value="3">Medium (1K-10K users)</option>
                <option value="4">Large (10K-100K users)</option>
                <option value="5">Massive (100K+ users)</option>
              </select>
            </div>

            {/* Security */}
            <div>
              <label
                htmlFor="security"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Security Requirements
              </label>
              <select
                id="security"
                value={config.projectInfo.security ?? ''}
                onChange={(e) => updateProjectInfo('security', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select security level...</option>
                <option value="0">None (no sensitive data)</option>
                <option value="1">Low (basic auth)</option>
                <option value="2">Moderate (user data, standard security)</option>
                <option value="3">High (PII, payment data, GDPR)</option>
                <option value="4">Very High (healthcare HIPAA, financial PCI-DSS)</option>
                <option value="5">Critical (government, military)</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Project Duration
              </label>
              <select
                id="duration"
                value={config.projectInfo.duration ?? ''}
                onChange={(e) => updateProjectInfo('duration', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select duration...</option>
                <option value="0">Very Short (&lt; 1 week)</option>
                <option value="1">Short (1-4 weeks)</option>
                <option value="2">Medium (1-3 months)</option>
                <option value="3">Long (3-6 months)</option>
                <option value="4">Very Long (6-12 months)</option>
                <option value="5">Indefinite (12+ months)</option>
              </select>
            </div>

            {/* Existing Code */}
            <div>
              <label
                htmlFor="existingCode"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Existing Codebase
              </label>
              <select
                id="existingCode"
                value={config.projectInfo.existingCode ?? ''}
                onChange={(e) => updateProjectInfo('existingCode', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select...</option>
                <option value="0">Greenfield (brand new)</option>
                <option value="1">Minor Refactor (&lt; 20% changes)</option>
                <option value="2">Moderate Refactor (20-50% changes)</option>
                <option value="3">Major Refactor (50-80% changes)</option>
                <option value="4">Legacy Modernization (80%+ changes)</option>
                <option value="5">Full Rewrite (replacing entire system)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Widget */}
      {config.projectInfo.projectSize !== undefined && (
        <div className="mt-6">
          <AssessmentWidget
            assessment={config.assessment?.autoAssessment ?? null}
            manualOverride={config.assessment?.manualOverride ?? null}
            onOverrideChange={handleManualOverride}
          />
        </div>
      )}
    </div>
  );
}

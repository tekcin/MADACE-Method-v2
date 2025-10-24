'use client';

import { useState } from 'react';
import {
  ProjectSize,
  TeamSize,
  ExistingCodebase,
  IntegrationsCount,
  UserBase,
  SecurityLevel,
  ProjectDuration,
  CodebaseComplexity,
  type ProjectInput,
} from '@/lib/workflows/complexity-types';

interface AssessmentFormProps {
  onSubmit: (input: ProjectInput) => void;
  initialValues?: Partial<ProjectInput>;
  isLoading?: boolean;
}

export default function AssessmentForm({
  onSubmit,
  initialValues,
  isLoading = false,
}: AssessmentFormProps) {
  const [formData, setFormData] = useState<ProjectInput>({
    projectSize: initialValues?.projectSize ?? ProjectSize.MEDIUM,
    teamSize: initialValues?.teamSize ?? TeamSize.SMALL,
    existingCode: initialValues?.existingCode ?? ExistingCodebase.GREENFIELD,
    integrations: initialValues?.integrations ?? IntegrationsCount.FEW,
    userBase: initialValues?.userBase ?? UserBase.SMALL,
    security: initialValues?.security ?? SecurityLevel.MODERATE,
    duration: initialValues?.duration ?? ProjectDuration.SHORT,
    codebaseComplexity: initialValues?.codebaseComplexity ?? CodebaseComplexity.MODERATE,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (ensure all fields are set)
    if (
      formData.projectSize === undefined ||
      formData.teamSize === undefined ||
      formData.existingCode === undefined ||
      formData.integrations === undefined ||
      formData.userBase === undefined ||
      formData.security === undefined ||
      formData.duration === undefined ||
      formData.codebaseComplexity === undefined
    ) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof ProjectInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Project Size */}
      <div className="space-y-2">
        <label htmlFor="projectSize" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Project Size
        </label>
        <select
          id="projectSize"
          value={formData.projectSize}
          onChange={(e) => handleChange('projectSize', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value={ProjectSize.TINY}>Tiny (&lt; 1K LOC or 1-3 features)</option>
          <option value={ProjectSize.SMALL}>Small (1K-5K LOC or 4-10 features)</option>
          <option value={ProjectSize.MEDIUM}>Medium (5K-20K LOC or 11-30 features)</option>
          <option value={ProjectSize.LARGE}>Large (20K-100K LOC or 31-100 features)</option>
          <option value={ProjectSize.VERY_LARGE}>Very Large (100K-500K LOC or 100+ features)</option>
          <option value={ProjectSize.MASSIVE}>Massive (500K+ LOC or enterprise-scale)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Estimated lines of code, features, or modules</p>
      </div>

      {/* Team Size */}
      <div className="space-y-2">
        <label htmlFor="teamSize" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Team Size
        </label>
        <select
          id="teamSize"
          value={formData.teamSize}
          onChange={(e) => handleChange('teamSize', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value={TeamSize.SOLO}>Solo (1 developer)</option>
          <option value={TeamSize.SMALL}>Small (2-3 developers)</option>
          <option value={TeamSize.MEDIUM}>Medium (4-6 developers)</option>
          <option value={TeamSize.LARGE}>Large (7-15 developers)</option>
          <option value={TeamSize.VERY_LARGE}>Very Large (16-50 developers)</option>
          <option value={TeamSize.ENTERPRISE}>Enterprise (50+ developers)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Number of developers working on the project</p>
      </div>

      {/* Existing Codebase */}
      <div className="space-y-2">
        <label htmlFor="existingCode" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Existing Codebase
        </label>
        <select
          id="existingCode"
          value={formData.existingCode}
          onChange={(e) => handleChange('existingCode', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value={ExistingCodebase.GREENFIELD}>Greenfield (no existing code)</option>
          <option value={ExistingCodebase.MINOR_REFACTOR}>Minor Refactor (&lt; 20% changes)</option>
          <option value={ExistingCodebase.MODERATE_REFACTOR}>Moderate Refactor (20-50% changes)</option>
          <option value={ExistingCodebase.MAJOR_REFACTOR}>Major Refactor (50-80% changes)</option>
          <option value={ExistingCodebase.LEGACY_MODERNIZATION}>Legacy Modernization (80%+ changes)</option>
          <option value={ExistingCodebase.FULL_REWRITE}>Full Rewrite (complete rewrite of large system)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Working with existing code vs. greenfield</p>
      </div>

      {/* Integrations */}
      <div className="space-y-2">
        <label htmlFor="integrations" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          External Integrations
        </label>
        <select
          id="integrations"
          value={formData.integrations}
          onChange={(e) => handleChange('integrations', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value={IntegrationsCount.NONE}>None (0)</option>
          <option value={IntegrationsCount.FEW}>Few (1-2 simple APIs)</option>
          <option value={IntegrationsCount.SOME}>Some (3-5 APIs or services)</option>
          <option value={IntegrationsCount.MANY}>Many (6-10 integrations)</option>
          <option value={IntegrationsCount.VERY_MANY}>Very Many (11-20 integrations)</option>
          <option value={IntegrationsCount.EXTENSIVE}>Extensive (20+ complex integrations)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Number and complexity of third-party integrations</p>
      </div>

      {/* User Base */}
      <div className="space-y-2">
        <label htmlFor="userBase" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          User Base
        </label>
        <select
          id="userBase"
          value={formData.userBase}
          onChange={(e) => handleChange('userBase', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value={UserBase.PERSONAL}>Personal (&lt; 10 users)</option>
          <option value={UserBase.INTERNAL}>Internal (10-100 users)</option>
          <option value={UserBase.SMALL}>Small (100-1K users)</option>
          <option value={UserBase.MEDIUM}>Medium (1K-10K users)</option>
          <option value={UserBase.LARGE}>Large (10K-100K users)</option>
          <option value={UserBase.MASSIVE}>Massive (100K+ users)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Number of expected users and usage patterns</p>
      </div>

      {/* Security */}
      <div className="space-y-2">
        <label htmlFor="security" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Security Requirements
        </label>
        <select
          id="security"
          value={formData.security}
          onChange={(e) => handleChange('security', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value={SecurityLevel.NONE}>None (no sensitive data)</option>
          <option value={SecurityLevel.LOW}>Low (basic auth, non-sensitive data)</option>
          <option value={SecurityLevel.MODERATE}>Moderate (user data, standard security)</option>
          <option value={SecurityLevel.HIGH}>High (PII, payment data, GDPR)</option>
          <option value={SecurityLevel.VERY_HIGH}>Very High (healthcare HIPAA, financial PCI-DSS)</option>
          <option value={SecurityLevel.CRITICAL}>Critical (government, military, critical infrastructure)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Security, compliance, and regulatory requirements</p>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Project Duration
        </label>
        <select
          id="duration"
          value={formData.duration}
          onChange={(e) => handleChange('duration', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value={ProjectDuration.VERY_SHORT}>Very Short (&lt; 1 week)</option>
          <option value={ProjectDuration.SHORT}>Short (1-4 weeks)</option>
          <option value={ProjectDuration.MEDIUM}>Medium (1-3 months)</option>
          <option value={ProjectDuration.LONG}>Long (3-6 months)</option>
          <option value={ProjectDuration.VERY_LONG}>Very Long (6-12 months)</option>
          <option value={ProjectDuration.INDEFINITE}>Indefinite (12+ months, ongoing)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Expected project timeline</p>
      </div>

      {/* Codebase Complexity */}
      <div className="space-y-2">
        <label htmlFor="codebaseComplexity" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Codebase Complexity
        </label>
        <select
          id="codebaseComplexity"
          value={formData.codebaseComplexity}
          onChange={(e) => handleChange('codebaseComplexity', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value={CodebaseComplexity.TRIVIAL}>Trivial (simple scripts, single file)</option>
          <option value={CodebaseComplexity.SIMPLE}>Simple (basic app, minimal dependencies)</option>
          <option value={CodebaseComplexity.MODERATE}>Moderate (modular architecture, standard dependencies)</option>
          <option value={CodebaseComplexity.COMPLEX}>Complex (microservices, multiple repos)</option>
          <option value={CodebaseComplexity.VERY_COMPLEX}>Very Complex (distributed systems, complex patterns)</option>
          <option value={CodebaseComplexity.EXTREME}>Extreme (large-scale distributed, advanced patterns)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Technical complexity of architecture and dependencies</p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Calculating Complexity...
            </span>
          ) : (
            'Calculate Complexity'
          )}
        </button>
      </div>
    </form>
  );
}

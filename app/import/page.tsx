'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TechStackReport } from '@/components/features/TechStackReport';
import { detectTechnologies } from '@/lib/utils/tech-detector';

// Storage key for localStorage
const STORAGE_KEY = 'madace-github-import-state';

interface ProjectAnalysis {
  name: string;
  description: string;
  language: string;
  languages: Record<string, number>;
  totalFiles: number;
  totalLines: number;
  directories: string[];
  fileTypes: Record<string, number>;
  hasPackageJson: boolean;
  hasPrisma: boolean;
  hasDocker: boolean;
  dependencies: string[];
  devDependencies: string[];
  repositoryUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastUpdated: string;
  defaultBranch: string;
  readme?: {
    content: string;
    summary: string;
    filename: string;
  };
}

export default function ImportPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.repoUrl) setRepoUrl(parsedState.repoUrl);
        if (parsedState.analysis) setAnalysis(parsedState.analysis);
      }
    } catch (error) {
      console.error('Failed to load saved import state:', error);
    }
  }, []);

  // Save state to localStorage when repoUrl or analysis changes
  useEffect(() => {
    if (repoUrl || analysis) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ repoUrl, analysis }));
      } catch (error) {
        console.error('Failed to save import state:', error);
      }
    }
  }, [repoUrl, analysis]);

  const handleImport = async () => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/v3/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl, createProject: false }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import repository');
      }

      setAnalysis(result.data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!analysis) return;

    try {
      const response = await fetch('/api/v3/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: analysis.name,
          description: analysis.description || `Imported from ${analysis.repositoryUrl}`,
        }),
      });

      if (response.ok) {
        alert(
          `✅ Project Created Successfully!\n\n` +
            `Project: "${analysis.name}"\n` +
            `Repository: ${analysis.repositoryUrl}\n\n` +
            `You can now start working on this project!`
        );
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.error || 'Unknown error'}`);
      }
    } catch {
      alert('Failed to create project. Please try again.');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all import data? This cannot be undone.')) {
      setRepoUrl('');
      setAnalysis(null);
      setError(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleCreatePRD = () => {
    if (!analysis) return;

    // Navigate to a PRD creation page or generate PRD
    // For now, we'll create a simple alert with PRD template
    const prdTemplate = `# Product Requirements Document (PRD)
## Project: ${analysis.name}

### Overview
${analysis.description || 'No description provided'}

### Repository Information
- **GitHub URL**: ${analysis.repositoryUrl}
- **Stars**: ${analysis.stars.toLocaleString()}
- **Forks**: ${analysis.forks.toLocaleString()}
- **Open Issues**: ${analysis.openIssues.toLocaleString()}
- **Last Updated**: ${new Date(analysis.lastUpdated).toLocaleDateString()}

### Technical Stack
- **Primary Language**: ${analysis.language}
- **Total Files**: ${analysis.totalFiles.toLocaleString()}
- **Lines of Code**: ${analysis.totalLines.toLocaleString()}
${analysis.hasPackageJson ? '- Node.js Project\n' : ''}${analysis.hasPrisma ? '- Uses Prisma ORM\n' : ''}${analysis.hasDocker ? '- Docker Support\n' : ''}
### Dependencies
${analysis.dependencies.length > 0 ? `**Production**: ${analysis.dependencies.slice(0, 10).join(', ')}${analysis.dependencies.length > 10 ? `, and ${analysis.dependencies.length - 10} more...` : ''}\n` : ''}${analysis.devDependencies.length > 0 ? `**Development**: ${analysis.devDependencies.slice(0, 10).join(', ')}${analysis.devDependencies.length > 10 ? `, and ${analysis.devDependencies.length - 10} more...` : ''}` : ''}

### Next Steps
1. Review codebase structure
2. Identify key features and functionality
3. Plan development roadmap
4. Set up development environment
`;

    // Copy to clipboard
    navigator.clipboard.writeText(prdTemplate).then(() => {
      alert(
        '✅ PRD Template copied to clipboard!\n\nYou can now paste it into your preferred document editor.'
      );
    });
  };

  const getLanguagePercentages = () => {
    if (!analysis?.languages) return [];

    const total = Object.values(analysis.languages).reduce((sum, val) => sum + val, 0);
    return Object.entries(analysis.languages)
      .map(([lang, bytes]) => ({
        language: lang,
        percentage: ((bytes / total) * 100).toFixed(1),
        bytes,
      }))
      .sort((a, b) => b.bytes - a.bytes);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Import GitHub Repository
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Clone and analyze any public GitHub repository to import into MADACE
          </p>
        </div>

        {/* Import Form */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import Repository
            </h2>
            {(repoUrl || analysis) && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                title="Clear all import data"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Reset
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="repoUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                GitHub Repository URL
              </label>
              <div className="mt-1 flex gap-3">
                <input
                  type="url"
                  id="repoUrl"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isLoading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                      </svg>
                      Import & Analyze
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Supported formats: https://github.com/owner/repo,
                https://github.com/owner/repo/tree/branch
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-8 space-y-6">
            {/* Project Overview */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysis.name}
                  </h2>
                  {analysis.description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{analysis.description}</p>
                  )}
                  <a
                    href={analysis.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    View on GitHub
                  </a>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {analysis.stars.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    {analysis.forks.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {analysis.openIssues.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* README Summary */}
            {analysis.readme && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📖 Project Overview ({analysis.readme.filename})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(analysis.readme!.content);
                      alert('✅ Full README copied to clipboard!');
                    }}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    title="Copy full README"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Full README
                  </button>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {analysis.readme.summary}
                  </p>
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    This is an AI-extracted summary from the repository&apos;s README file. Click
                    &quot;Copy Full README&quot; above to view the complete documentation.
                  </span>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Files
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {analysis.totalFiles.toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Lines of Code
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {analysis.totalLines.toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Primary Language
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {analysis.language}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Updated
                </div>
                <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(analysis.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Languages
              </h3>
              <div className="space-y-3">
                {getLanguagePercentages().map(({ language, percentage }) => (
                  <div key={language}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {language}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technology Stack Report */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                📊 Technology Stack Report
              </h3>
              <TechStackReport
                technologies={detectTechnologies(analysis)}
                totalFiles={analysis.totalFiles}
                showDetails={false}
              />
            </div>

            {/* Actions */}
            <div className="rounded-lg border-2 border-green-300 bg-green-50 p-6 dark:border-green-700 dark:bg-green-950">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🚀 What would you like to do?
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Import this repository into MADACE for project management
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCreateProject}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  Create MADACE Project
                </button>

                <button
                  type="button"
                  onClick={handleCreatePRD}
                  className="flex items-center gap-2 rounded-lg border border-green-600 bg-white px-6 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 dark:border-green-500 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Create PRD
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/assess')}
                  className="flex items-center gap-2 rounded-lg border border-green-600 bg-white px-6 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 dark:border-green-500 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Assess Complexity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

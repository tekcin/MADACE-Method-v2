'use client';

import { useState } from 'react';

interface Technology {
  name: string;
  category: 'language' | 'framework' | 'database' | 'tool' | 'infrastructure' | 'other';
  version?: string;
  confidence?: number; // 0-100
  usageCount?: number; // How many files use this
  description?: string;
}

interface TechStackReportProps {
  technologies: Technology[];
  totalFiles?: number;
  showDetails?: boolean;
  compact?: boolean;
}

const categoryColors = {
  language: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-300 dark:border-blue-700',
  },
  framework: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-300 dark:border-purple-700',
  },
  database: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-300 dark:border-green-700',
  },
  tool: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-300 dark:border-orange-700',
  },
  infrastructure: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-300 dark:border-gray-600',
  },
  other: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
};

const categoryLabels = {
  language: '🔤 Languages',
  framework: '🏗️ Frameworks',
  database: '💾 Databases',
  tool: '🛠️ Tools',
  infrastructure: '☁️ Infrastructure',
  other: '📦 Other',
};

const categoryIcons = {
  language: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  ),
  framework: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  ),
  database: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  ),
  tool: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  infrastructure: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  ),
  other: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
};

export function TechStackReport({
  technologies,
  totalFiles,
  showDetails = false,
  compact = false,
}: TechStackReportProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Group technologies by category
  const groupedTech = technologies.reduce(
    (acc, tech) => {
      if (!acc[tech.category]) {
        acc[tech.category] = [];
      }
      acc[tech.category].push(tech);
      return acc;
    },
    {} as Record<string, Technology[]>
  );

  // Sort categories by priority
  const categoryOrder: Array<Technology['category']> = [
    'language',
    'framework',
    'database',
    'tool',
    'infrastructure',
    'other',
  ];
  const sortedCategories = categoryOrder.filter((cat) => groupedTech[cat]?.length > 0);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (technologies.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No technologies detected
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Unable to detect technologies from the repository
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {!compact && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {technologies.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Technologies</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sortedCategories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
          </div>
          {totalFiles && (
            <>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalFiles.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(
                    (technologies.filter((t) => t.confidence && t.confidence > 80).length /
                      technologies.length) *
                      100
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">High Confidence</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Technology Categories */}
      <div className="space-y-4">
        {sortedCategories.map((category) => {
          const techs = groupedTech[category];
          const isExpanded = expandedCategories[category] ?? showDetails;
          const colors = categoryColors[category];

          return (
            <div
              key={category}
              className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800"
            >
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${colors.bg}`}>{categoryIcons[category]}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {categoryLabels[category]}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {techs.length} {techs.length === 1 ? 'technology' : 'technologies'}
                    </p>
                  </div>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {techs.map((tech, idx) => (
                      <div
                        key={`${tech.name}-${idx}`}
                        className={`rounded-lg border p-3 ${colors.border} ${colors.bg}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${colors.text}`}>{tech.name}</span>
                              {tech.version && (
                                <span
                                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                                >
                                  v{tech.version}
                                </span>
                              )}
                            </div>
                            {tech.description && (
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                {tech.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              {tech.confidence !== undefined && (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span>{tech.confidence}% confident</span>
                                </div>
                              )}
                              {tech.usageCount !== undefined && totalFiles && (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="h-3 w-3"
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
                                  <span>
                                    {tech.usageCount}/{totalFiles} files (
                                    {Math.round((tech.usageCount / totalFiles) * 100)}%)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Export Button */}
      {!compact && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              const report = generateTextReport(technologies, sortedCategories, groupedTech);
              navigator.clipboard.writeText(report).then(() => {
                alert('✅ Tech stack report copied to clipboard!');
              });
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Report
          </button>
        </div>
      )}
    </div>
  );
}

function generateTextReport(
  technologies: Technology[],
  sortedCategories: Array<Technology['category']>,
  groupedTech: Record<string, Technology[]>
): string {
  let report = '# Technology Stack Report\n\n';
  report += `**Total Technologies**: ${technologies.length}\n`;
  report += `**Categories**: ${sortedCategories.length}\n\n`;

  sortedCategories.forEach((category) => {
    const techs = groupedTech[category];
    report += `## ${categoryLabels[category]}\n\n`;

    techs.forEach((tech) => {
      report += `- **${tech.name}**`;
      if (tech.version) report += ` (v${tech.version})`;
      if (tech.confidence) report += ` - ${tech.confidence}% confidence`;
      if (tech.usageCount) report += ` - Used in ${tech.usageCount} files`;
      report += '\n';
      if (tech.description) report += `  ${tech.description}\n`;
    });
    report += '\n';
  });

  return report;
}

/**
 * Project Badge Component
 *
 * Reusable component to display current project information
 * Used across multiple pages for consistency
 */

'use client';

import { useProject } from '@/lib/context/ProjectContext';

interface ProjectBadgeProps {
  className?: string;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProjectBadge({
  className = '',
  showDescription = true,
  size = 'md',
}: ProjectBadgeProps) {
  const { currentProject, isLoading } = useProject();

  if (isLoading) {
    return (
      <div
        className={`animate-pulse rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 ${className}`}
      >
        <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600"></div>
      </div>
    );
  }

  if (!currentProject) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div
      className={`rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 ${sizeClasses[size]} ${className}`}
      data-testid="project-badge"
    >
      <div className="text-xs text-blue-600 dark:text-blue-400">Current Project</div>
      <div className={`font-semibold text-blue-900 dark:text-blue-100 ${titleSizeClasses[size]}`}>
        {currentProject.name}
      </div>
      {showDescription && currentProject.description && (
        <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
          {currentProject.description}
        </div>
      )}
      {size !== 'sm' && (
        <div className="mt-2 flex gap-3 text-xs text-blue-600 dark:text-blue-400">
          <span>{currentProject._count.agents} agents</span>
          <span>{currentProject._count.workflows} workflows</span>
          <span>{currentProject._count.stories} stories</span>
        </div>
      )}
    </div>
  );
}

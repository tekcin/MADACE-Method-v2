/**
 * Project Selector Component
 *
 * Dropdown for switching between projects
 * Displays in navigation bar
 */

'use client';

import React, { useState } from 'react';
import { useProject } from '@/lib/context/ProjectContext';

export function ProjectSelector() {
  const { currentProject, projects, switchProject, isLoading } = useProject();
  const [isOpen, setIsOpen] = useState(false);

  const handleProjectSelect = async (projectId: string) => {
    try {
      await switchProject(projectId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
        <span>Loading projects...</span>
      </div>
    );
  }

  if (!currentProject) {
    return <div className="px-3 py-2 text-sm text-gray-500">No project selected</div>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        data-testid="project-selector-button"
      >
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <span className="max-w-[150px] truncate">{currentProject.name}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            data-testid="project-selector-backdrop"
          />

          {/* Dropdown Menu */}
          <div
            className="absolute left-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            data-testid="project-selector-dropdown"
          >
            <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                Your Projects
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {projects.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-gray-500">No projects found</div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={`flex w-full items-start gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      project.id === currentProject.id
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                    data-testid={`project-option-${project.id}`}
                  >
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
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{project.name}</p>
                      {project.description && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {project.description}
                        </p>
                      )}
                      <div className="mt-1 flex gap-3 text-xs text-gray-500">
                        <span>{project._count.agents} agents</span>
                        <span>{project._count.workflows} workflows</span>
                        <span>{project._count.stories} stories</span>
                      </div>
                    </div>
                    {project.id === currentProject.id && (
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 p-2 dark:border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Trigger create project modal (handled by parent)
                  window.dispatchEvent(new CustomEvent('open-create-project-modal'));
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                data-testid="create-project-button"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Create New Project</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Project Modal Component
 *
 * Modal for creating and editing projects
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/lib/context/ProjectContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  projectId?: string;
}

export function ProjectModal({ isOpen, onClose, mode = 'create', projectId }: ProjectModalProps) {
  const { currentProject, createProject, updateProject } = useProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load project data in edit mode
  useEffect(() => {
    if (mode === 'edit' && projectId && currentProject?.id === projectId) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
    } else if (mode === 'create') {
      setName('');
      setDescription('');
    }
  }, [mode, projectId, currentProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        await createProject({
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else if (mode === 'edit' && projectId) {
        await updateProject(projectId, {
          name: name.trim(),
          description: description.trim() || null,
        });
      }

      // Reset form and close
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity"
        onClick={handleClose}
        data-testid="project-modal-backdrop"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          data-testid="project-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {mode === 'create' ? 'Create New Project' : 'Edit Project'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              data-testid="project-modal-close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error Message */}
            {error && (
              <div
                className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400"
                data-testid="project-modal-error"
              >
                {error}
              </div>
            )}

            {/* Project Name */}
            <div className="mb-4">
              <label
                htmlFor="project-name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-800"
                placeholder="My Project"
                maxLength={100}
                required
                data-testid="project-name-input"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {name.length}/100 characters
              </p>
            </div>

            {/* Project Description */}
            <div className="mb-6">
              <label
                htmlFor="project-description"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-800"
                placeholder="Describe your project..."
                rows={3}
                maxLength={500}
                data-testid="project-description-input"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {description.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                data-testid="project-modal-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                data-testid="project-modal-submit"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>{mode === 'create' ? 'Creating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <span>{mode === 'create' ? 'Create Project' : 'Save Changes'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

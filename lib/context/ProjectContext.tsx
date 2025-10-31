/**
 * Project Context Provider
 *
 * Manages global project state for MADACE v3.0
 * Allows users to create, switch, update, and delete projects
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ProjectWithMembers } from '@/lib/services/project-service';

export interface ProjectContextValue {
  currentProject: ProjectWithMembers | null;
  projects: ProjectWithMembers[];
  isLoading: boolean;
  error: string | null;
  switchProject: (projectId: string) => Promise<void>;
  createProject: (data: { name: string; description?: string }) => Promise<ProjectWithMembers>;
  updateProject: (
    projectId: string,
    data: { name?: string; description?: string | null }
  ) => Promise<ProjectWithMembers>;
  deleteProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<ProjectWithMembers | null>(null);
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v3/projects');
      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.statusText}`);
      }

      const result = await response.json();
      const loadedProjects = result.data || [];

      setProjects(loadedProjects);

      // Auto-select last updated project if none selected
      if (!currentProject && loadedProjects.length > 0) {
        setCurrentProject(loadedProjects[0]!);
        localStorage.setItem('madace-current-project', loadedProjects[0]!.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('[ProjectContext] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  // Load projects on mount and restore last selected project
  useEffect(() => {
    const initProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/v3/projects');
        if (!response.ok) throw new Error('Failed to load projects');

        const result = await response.json();
        const loadedProjects = result.data || [];
        setProjects(loadedProjects);

        // Restore last selected project from localStorage
        const savedProjectId = localStorage.getItem('madace-current-project');
        if (savedProjectId) {
          const savedProject = loadedProjects.find(
            (p: ProjectWithMembers) => p.id === savedProjectId
          );
          if (savedProject) {
            setCurrentProject(savedProject);
          } else if (loadedProjects.length > 0) {
            setCurrentProject(loadedProjects[0]!);
            localStorage.setItem('madace-current-project', loadedProjects[0]!.id);
          }
        } else if (loadedProjects.length > 0) {
          setCurrentProject(loadedProjects[0]!);
          localStorage.setItem('madace-current-project', loadedProjects[0]!.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    initProjects();
  }, []);

  const switchProject = useCallback(
    async (projectId: string) => {
      try {
        setError(null);
        const project = projects.find((p) => p.id === projectId);

        if (!project) {
          throw new Error('Project not found');
        }

        setCurrentProject(project);
        localStorage.setItem('madace-current-project', projectId);

        // Trigger page refresh to reload project-scoped data
        window.dispatchEvent(new CustomEvent('project-switched', { detail: { projectId } }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to switch project';
        setError(errorMessage);
        throw err;
      }
    },
    [projects]
  );

  const createProject = useCallback(async (data: { name: string; description?: string }) => {
    try {
      setError(null);
      const response = await fetch('/api/v3/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const result = await response.json();
      const newProject = result.data;

      setProjects((prev) => [newProject, ...prev]);
      setCurrentProject(newProject);
      localStorage.setItem('madace-current-project', newProject.id);

      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateProject = useCallback(
    async (projectId: string, data: { name?: string; description?: string | null }) => {
      try {
        setError(null);
        const response = await fetch(`/api/v3/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update project');
        }

        const result = await response.json();
        const updatedProject = result.data;

        setProjects((prev) => prev.map((p) => (p.id === projectId ? updatedProject : p)));

        if (currentProject?.id === projectId) {
          setCurrentProject(updatedProject);
        }

        return updatedProject;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
        setError(errorMessage);
        throw err;
      }
    },
    [currentProject]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        setError(null);
        const response = await fetch(`/api/v3/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete project');
        }

        setProjects((prev) => prev.filter((p) => p.id !== projectId));

        // If deleted project was current, switch to another
        if (currentProject?.id === projectId) {
          const remainingProjects = projects.filter((p) => p.id !== projectId);
          if (remainingProjects.length > 0) {
            setCurrentProject(remainingProjects[0]!);
            localStorage.setItem('madace-current-project', remainingProjects[0]!.id);
          } else {
            setCurrentProject(null);
            localStorage.removeItem('madace-current-project');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
        setError(errorMessage);
        throw err;
      }
    },
    [currentProject, projects]
  );

  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  const value: ProjectContextValue = {
    currentProject,
    projects,
    isLoading,
    error,
    switchProject,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

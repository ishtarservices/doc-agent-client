// src/hooks/useProjectSelection.ts

import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProjectsByOrganization,
  type ProjectData,
} from '@/lib/api';
import { useProjectContext } from './useBoardData';

// Query keys for project selection
export const projectSelectionKeys = {
  organizationProjects: (organizationId: string) => ['organization-projects', organizationId] as const,
  defaultProject: () => ['default-project'] as const,
};

export const useProjectSelection = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  // Get current project context (for organization info)
  const currentProjectId = projectId || '507f1f77bcf86cd799439011'; // Default fallback
  const { data: projectContext } = useProjectContext(currentProjectId);

  // Fetch projects for the current organization
  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    error: projectsError
  } = useQuery({
    queryKey: projectSelectionKeys.organizationProjects(projectContext?.organization?._id || ''),
    queryFn: () => {
      if (!projectContext?.organization?._id) return Promise.resolve([]);

      if (!getProjectsByOrganization) {
        // Mock mode: return current project as single project
        return Promise.resolve([projectContext.project].filter(Boolean) as ProjectData[]);
      }

      return getProjectsByOrganization(projectContext.organization._id);
    },
    enabled: !!projectContext?.organization?._id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Switch to a different project
  const switchProject = useCallback((newProjectId: string) => {
    if (newProjectId === currentProjectId) return;

    // Navigate to the new project's board
    navigate(`/projects/${newProjectId}/board`);

    // Preload the new project's data
    queryClient.prefetchQuery({
      queryKey: ['project-context', newProjectId],
      queryFn: () => import('@/lib/api').then(api => api.getCurrentProjectContext(newProjectId)),
      staleTime: 30 * 1000,
    });
  }, [currentProjectId, navigate, queryClient]);

  // Get current project from the list
  const currentProject = projects.find(p => p._id === currentProjectId) || projectContext?.project;

  // Helper to check if a project is currently selected
  const isProjectSelected = useCallback((checkProjectId: string) => {
    return checkProjectId === currentProjectId;
  }, [currentProjectId]);

  return {
    // Current state
    currentProjectId,
    currentProject,
    projects,
    organization: projectContext?.organization,

    // Loading states
    isProjectsLoading,
    projectsError,

    // Actions
    switchProject,
    isProjectSelected,

    // For debugging/development
    projectContext,
  };
};

// Helper hook for components that just need to switch projects
export const useProjectSwitcher = () => {
  const { switchProject, isProjectSelected } = useProjectSelection();
  return { switchProject, isProjectSelected };
};
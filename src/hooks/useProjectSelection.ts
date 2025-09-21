// src/hooks/useProjectSelection.ts

import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  getProjectsByOrganization,
  type ProjectData,
} from '@/lib/api';
import { useProjectContext } from './useBoardData';
import { useOrganization } from './useOrganization';

// Query keys for project selection
export const projectSelectionKeys = {
  organizationProjects: (organizationId: string) => ['organization-projects', organizationId] as const,
  defaultProject: () => ['default-project'] as const,
};

export const useProjectSelection = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const { currentOrganization, isOrgSwitching } = useOrganization();

  // Get current project context (for organization info) - only if projectId exists
  const currentProjectId = projectId;
  const prevOrganizationId = React.useRef<string | undefined>();

  // Use current organization context as primary source
  const organizationId = currentOrganization?._id;

  // More aggressive prevention of queries during org switches
  const shouldFetchProjectContext = !!currentProjectId &&
    !isOrgSwitching &&
    (!organizationId || !prevOrganizationId.current || organizationId === prevOrganizationId.current);

  const { data: projectContext } = useProjectContext(currentProjectId || '', shouldFetchProjectContext);

  // Fetch projects for the current organization
  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    error: projectsError
  } = useQuery({
    queryKey: projectSelectionKeys.organizationProjects(organizationId || ''),
    queryFn: () => {
      if (!organizationId) return Promise.resolve([]);

      if (!getProjectsByOrganization) {
        // Mock mode: return current project as single project
        return Promise.resolve([projectContext?.project].filter(Boolean) as ProjectData[]);
      }

      return getProjectsByOrganization(organizationId);
    },
    enabled: !!organizationId && !isOrgSwitching,
    staleTime: 2 * 60 * 1000, // Reduced to 2 minutes for fresher data
    refetchOnWindowFocus: true,
    refetchInterval: false, // Don't auto-refetch, let manual invalidation handle it
    retry: (failureCount, error) => {
      // Don't retry on 404 errors - organization might not exist
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
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

  // Handle organization changes - invalidate project queries when org changes
  useEffect(() => {
    if (organizationId && prevOrganizationId.current && organizationId !== prevOrganizationId.current) {
      console.log('🔄 [useProjectSelection] Organization changed - invalidating project queries', {
        oldOrgId: prevOrganizationId.current,
        newOrgId: organizationId,
      });

      // Invalidate queries for both old and new organizations
      queryClient.invalidateQueries({
        queryKey: ['organization-projects', prevOrganizationId.current]
      });
      queryClient.invalidateQueries({
        queryKey: ['organization-projects', organizationId]
      });
    }
    prevOrganizationId.current = organizationId;
  }, [organizationId, queryClient]);

  // Secondary check: log when project not found but don't redirect - let Board handle it
  useEffect(() => {
    if (currentProjectId && projects.length > 0 && organizationId && !isOrgSwitching) {
      const currentProjectInOrg = projects.find(p => p._id === currentProjectId);
      if (!currentProjectInOrg) {
        console.log('🔄 [useProjectSelection] Current project not found in new organization projects - Board will handle this');
      }
    }
  }, [currentProjectId, projects, organizationId, isOrgSwitching]);

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
    organization: currentOrganization || projectContext?.organization,

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
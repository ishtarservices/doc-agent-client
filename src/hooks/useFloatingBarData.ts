// src/hooks/useFloatingBarData.ts

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProjectsByOrganization,
  type OrganizationData,
  type ProjectData,
  type TaskData,
  type ColumnData,
  type AgentData
} from '@/lib/api';
import { useProjectContext, queryKeys } from './useBoardData';
import { useOrganization } from './useOrganization';
import { projectSelectionKeys } from './useProjectSelection';

// Mock notification type (expand this when implementing real notifications)
interface Notification {
  id: string;
  type: 'comment' | 'assignment' | 'mention' | 'deadline' | 'completion';
  message: string;
  time: string;
  isRead: boolean;
  taskId?: string;
  userId?: string;
}

// Mock upcoming task type (expand this when implementing real calendar integration)
interface UpcomingTask {
  id: string;
  title: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectName?: string;
}

export const useFloatingBarData = (initialProjectId?: string) => {
  const queryClient = useQueryClient();
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(initialProjectId);

  // Use the organization hook to get the current organization
  const { currentOrganization } = useOrganization();

  // Fetch project context using optimized hook from useBoardData
  const {
    data: projectContext,
    isLoading: isContextLoading,
    error: contextError,
    refetch: refetchContext
  } = useProjectContext(currentProjectId || '');

  // Use the organization ID from context, fallback to project context
  const organizationId = currentOrganization?._id || projectContext?.organization?._id;

  // Fetch projects for the current organization using the same query key as useProjectSelection
  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    refetch: refetchProjects
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
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });

  // Generate mock notifications (replace with real API when ready)
  const generateMockNotifications = useCallback((): Notification[] => {
    if (!projectContext) return [];

    return [
      {
        id: 'notif_1',
        type: 'comment',
        message: 'Alice commented on "Legal Review"',
        time: '2m ago',
        isRead: false,
        taskId: projectContext.tasks[0]?._id
      },
      {
        id: 'notif_2',
        type: 'assignment',
        message: 'You were assigned to "Email Setup"',
        time: '1h ago',
        isRead: false,
        taskId: projectContext.tasks[1]?._id
      },
      {
        id: 'notif_3',
        type: 'mention',
        message: 'Bob mentioned you in "Code Review"',
        time: '2h ago',
        isRead: true,
        taskId: projectContext.tasks[2]?._id
      }
    ];
  }, [projectContext]);

  // Generate mock upcoming tasks (replace with real calendar integration)
  const generateMockUpcomingTasks = useCallback((): UpcomingTask[] => {
    if (!projectContext) return [];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return projectContext.tasks
      .filter((task: TaskData) => task.dueDate && new Date(task.dueDate) <= tomorrow)
      .slice(0, 5)
      .map((task: TaskData) => ({
        id: task._id,
        title: task.title,
        deadline: new Date(task.dueDate!).toDateString() === today.toDateString() ? 'Today' : 'Tomorrow',
        priority: task.priority,
        projectName: projectContext.project.name
      }));
  }, [projectContext]);

  // Switch project
  const switchProject = useCallback(async (projectId: string) => {
    setCurrentProjectId(projectId);

    // Invalidate and refetch project context using consistent query key
    await queryClient.invalidateQueries({
      queryKey: queryKeys.projectContext(projectId) // Use same query keys as useBoardData
    });
  }, [queryClient]);


  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      refetchContext(),
      refetchProjects()
    ]);
  }, [refetchContext, refetchProjects]);

  // Derived state
  const organization: OrganizationData | undefined = currentOrganization || projectContext?.organization;
  const currentProject: ProjectData | undefined = projectContext?.project;
  const tasks: TaskData[] = projectContext?.tasks || [];
  const columns: ColumnData[] = projectContext?.columns || [];
  const agents: AgentData[] = projectContext?.agents || [];
  const members = projectContext?.members || [];

  const notifications = generateMockNotifications();
  const upcomingTasks = generateMockUpcomingTasks();

  const isLoading = isContextLoading || isProjectsLoading;
  const hasError = !!contextError;

  return {
    // Core data
    organization,
    projects,
    currentProject,
    tasks,
    columns,
    agents,
    members,

    // Derived data
    notifications,
    upcomingTasks,

    // State
    isLoading,
    hasError,
    contextError,

    // Actions
    switchProject,
    refreshData,

    // IDs for reference
    currentProjectId,
    currentOrganizationId: organizationId,
  };
};
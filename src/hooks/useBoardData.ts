import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOrganization } from './useOrganization';
import {
  getCurrentProjectContext,
  createColumn,
  createTask,
  updateTask,
  updateColumn,
  deleteTask,
  deleteColumn,
  moveTask,
  callAIAssistant,
  getUserOrganizations,
  createOrganization,
  createProject,
  ensureUserHasOrganization,
  type ColumnData,
  type TaskData,
  type OrganizationData,
  type ProjectData,
  type CreateColumnRequest,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type UpdateColumnRequest,
  type CreateOrganizationRequest,
  type CreateProjectRequest,
  type AIRequest,
  type AIResponse,
} from '@/lib/api';

// Query keys
export const queryKeys = {
  project: (projectId: string) => ['project', projectId] as const,
  projectContext: (projectId: string) => ['project-context', projectId] as const,
  organizations: () => ['organizations'] as const,
  userOrganizations: () => ['user-organizations'] as const,
};

// Hook to fetch project context (tasks and columns)
export const useProjectContext = (projectId: string, enabled: boolean = true) => {
  // Import the org switching state here to prevent queries during org switches
  const { isOrgSwitching } = useOrganization();

  const actuallyEnabled = !!projectId && enabled && !isOrgSwitching;

  return useQuery({
    queryKey: queryKeys.projectContext(projectId),
    queryFn: async () => {
      try {
        const result = await getCurrentProjectContext(projectId);
        return result;
      } catch (error) {
        console.error('❌ [useBoardData] === PROJECT CONTEXT FETCH FAILED ===');
        console.error('❌ [useBoardData] Project context fetch failed:', {
          projectId,
          error: error instanceof Error ? error.message : String(error),
          is403: error instanceof Error && error.message.includes('403'),
          is404: error instanceof Error && error.message.includes('404'),
          timestamp: new Date().toISOString(),
        });

        // Handle cache invalidation for deleted/missing projects
        if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
          // Return minimal structure to prevent crashes
          return {
            tasks: [],
            columns: [],
            organization: null,
            project: null,
            agents: [],
            members: []
          };
        }

        throw error;
      }
    },
    enabled: actuallyEnabled, // Only run query if projectId is provided and explicitly enabled
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds (replaces your useEffect interval)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: (failureCount, error) => {

      // Don't retry on 403 errors - these are authorization issues
      if (error instanceof Error && error.message.includes('403')) {
        return false;
      }

      // Don't retry on 404 errors - project doesn't exist
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        return false;
      }

      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for creating columns
export const useCreateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateColumnRequest) => {
      return createColumn(data);
    },
    onMutate: async (newColumn) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projectContext(newColumn.projectId) });
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<{ columns?: ColumnData[] }>(queryKeys.projectContext(newColumn.projectId));

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.projectContext(newColumn.projectId),
        (old: { columns?: ColumnData[]; tasks?: TaskData[] } | undefined) => {
          if (!old) {
            return old;
          }

          const tempColumn: ColumnData = {
          _id: `temp-${Date.now()}`,
          projectId: newColumn.projectId,
          title: newColumn.title,
          name: newColumn.name,
          description: newColumn.description,
          color: newColumn.color || '#6b7280',
          position: old.columns?.length || 0,
          settings: {
            isCollapsed: false,
            isPinned: false,
            autoRun: false,
            taskLimit: 50,
          },
          visibility: newColumn.visibility || 'public',
          createdBy: 'current-user', // Will be updated by server response
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const newData = {
          ...old,
          columns: [...(old.columns || []), tempColumn],
        };
        return newData;
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: (newColumn, variables) => {
      // Invalidate and refetch project context to get the real data
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
      toast.success('List created successfully');
    },
    onError: (error, variables, context) => {
      console.error('📋 [useBoardData] Error creating column:', error);
      // Roll back to the previous state
      if (context?.previousData) {
        console.log('📋 [useBoardData] Rolling back to previous data');
        queryClient.setQueryData(queryKeys.projectContext(variables.projectId), context.previousData);
      }
      toast.error('Failed to create list');
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
    },
  });
};

// Hook for creating tasks
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => createTask(data),
    onSuccess: (newTask, variables) => {
      // Invalidate and refetch project context
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    },
  });
};

// Hook for updating tasks
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates, projectId }: { taskId: string; updates: UpdateTaskRequest; projectId: string }) =>
      updateTask(taskId, updates),
    onSuccess: (updatedTask, variables) => {
      // Invalidate project context to refresh the board
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    },
  });
};

// Hook for updating columns
export const useUpdateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, updates, projectId }: { columnId: string; updates: UpdateColumnRequest; projectId: string }) =>
      updateColumn(columnId, updates),
    onSuccess: (updatedColumn, variables) => {
      // Update cached data optimistically
      queryClient.setQueryData(queryKeys.projectContext(variables.projectId), (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData;
        const data = oldData as { columns?: ColumnData[] };
        if (!data.columns) return oldData;

        return {
          ...data,
          columns: data.columns.map((col: ColumnData) =>
            col._id === variables.columnId ? { ...col, ...variables.updates } : col
          ),
        };
      });
    },
    onError: (error, variables) => {
      console.error('Error updating column:', error);
      toast.error('Failed to update column');
      // Refetch to get the correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
    },
  });
};

// Hook for deleting tasks
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, projectId }: { taskId: string; projectId: string }) => deleteTask(taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    },
  });
};

// Hook for deleting columns
export const useDeleteColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, projectId }: { columnId: string; projectId: string }) => deleteColumn(columnId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
      toast.success('Column deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting column:', error);
      toast.error('Failed to delete column');
    },
  });
};

// Hook for moving tasks
export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, newColumnId, newPosition, projectId }: {
      taskId: string;
      newColumnId: string;
      newPosition?: number;
      projectId: string;
    }) => moveTask(taskId, newColumnId, newPosition),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
      toast.success('Task moved successfully');
    },
    onError: (error) => {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
    },
  });
};

// Hook for AI Assistant
export const useAIAssistant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AIRequest) => callAIAssistant(request),
    onSuccess: (response: AIResponse, variables) => {
      // Handle different AI response types
      switch (response.type) {
        case 'task_creation':
          if (response.createdTasks && response.createdTasks.length > 0) {
            toast.success(`Created ${response.createdTasks.length} task(s)`);
            // Refetch project context to show new tasks
            if (variables.projectId) {
              queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
            }
          }
          break;
        case 'task_management':
          if (response.message) {
            console.log('Task management operation:', response.message);
            // Refresh project context in case tasks were modified
            if (variables.projectId) {
              queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
            }
          }
          break;
        default:
          break;
      }
    },
    onError: (error) => {
      console.error('AI Assistant error:', error);
      toast.error('Failed to process AI request. Please try again.');
    },
  });
};

// Utility hook to get current board context for AI
export const useBoardContext = (projectId: string, enabled: boolean = true) => {
  const { data } = useProjectContext(projectId, enabled);

  return {
    tasks: data?.tasks || [],
    columns: (data?.columns || []).map((col: ColumnData) => ({
      _id: col._id,
      projectId: col.projectId,
      title: col.title || col.name || 'Untitled',
      name: col.name,
      description: col.description,
      color: col.color,
      position: col.position,
      settings: col.settings,
      visibility: col.visibility,
      createdBy: col.createdBy,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
      tasks: (data?.tasks || []).filter((task: TaskData) =>
        task.columnId === col._id ||
        task.status === col._id ||
        (task.status && col.name?.toLowerCase() === task.status)
      )
    }))
  };
};

// Hook to fetch user's organizations
export const useUserOrganizations = () => {
  return useQuery({
    queryKey: queryKeys.userOrganizations(),
    queryFn: async () => {
      // console.log('🏢 [useBoardData] Fetching user organizations');
      try {
        const result: OrganizationData[] = await (getUserOrganizations?.() || Promise.resolve([]));
        return result;
      } catch (error) {
        console.error('🏢 [useBoardData] User organizations fetch failed:', {
          error: error instanceof Error ? error.message : String(error),
          is403: error instanceof Error && error.message.includes('403'),
          is404: error instanceof Error && error.message.includes('404'),
        });

        // Handle cache invalidation for deleted/missing data
        if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
          return [];
        }

        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {

      // Don't retry on 403 errors - these might indicate user needs organization setup
      if (error instanceof Error && error.message.includes('403')) {
        return false;
      }

      // Don't retry on 404 errors - data doesn't exist
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        return false;
      }

      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!getUserOrganizations, // Only run if API is available
  });
};

// Hook for creating organizations
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => {
      if (!createOrganization) {
        throw new Error('Create organization API not available');
      }
      return createOrganization(data);
    },
    onSuccess: (createdOrg) => {
      // Invalidate and refetch user organizations
      queryClient.invalidateQueries({ queryKey: queryKeys.userOrganizations() });
      toast.success('Organization created successfully');
    },
    onError: (error) => {
      console.error('🏢 [useBoardData] Error creating organization:', error);
      toast.error('Failed to create organization');
    },
  });
};

// Hook for creating projects
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => {
      if (!createProject) {
        throw new Error('Create project API not available');
      }
      return createProject(data);
    },
    onSuccess: (newProject: ProjectData, variables) => {

      // Invalidate organization projects list to refresh the project selection
      queryClient.invalidateQueries({
        queryKey: ['organization-projects', variables.organizationId]
      });

      // Backend fix complete - can now safely prefetch project context
      queryClient.prefetchQuery({
        queryKey: queryKeys.projectContext(newProject._id),
        queryFn: () => getCurrentProjectContext(newProject._id),
        staleTime: 30 * 1000,
      });

      toast.success(`Project "${newProject.name}" created successfully`);

      // Return the new project for use in onSuccess callback
      return newProject;
    },
    onError: (error) => {
      console.error('📋 [useBoardData] Error creating project:', error);
      toast.error('Failed to create project');
    },
  });
};

// Hook to ensure user has organization (for first-time setup)
export const useEnsureUserOrganization = () => {
  return useMutation({
    mutationFn: ({ userEmail }: { userEmail: string }) => {
      return ensureUserHasOrganization(userEmail);
    },
    onSuccess: (organization) => {
      toast.success(`Organization "${organization.name}" is ready`);
    },
    onError: (error) => {
      console.error('🏢 [useBoardData] Error setting up user organization:', error);
      toast.error('Failed to setup organization. Please try again or contact support.');
    },
  });
};

// Hook to handle cache invalidation for edge cases (when data is deleted externally)
export const useCacheManagement = () => {
  const queryClient = useQueryClient();

  const clearAllCache = () => {
    queryClient.clear();
  };

  const invalidateUserData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userOrganizations() });
  };

  const invalidateOrganizationData = (organizationId: string) => {
    queryClient.invalidateQueries({
      queryKey: ['organization-projects', organizationId]
    });
  };

  const invalidateProjectData = (projectId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.projectContext(projectId)
    });
  };

  return {
    clearAllCache,
    invalidateUserData,
    invalidateOrganizationData,
    invalidateProjectData,
  };
};
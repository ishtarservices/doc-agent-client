import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  type ColumnData,
  type TaskData,
  type CreateColumnRequest,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type UpdateColumnRequest,
  type AIRequest,
  type AIResponse,
} from '@/lib/api';

// Query keys
export const queryKeys = {
  project: (projectId: string) => ['project', projectId] as const,
  projectContext: (projectId: string) => ['project-context', projectId] as const,
};

// Hook to fetch project context (tasks and columns)
export const useProjectContext = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projectContext(projectId),
    queryFn: () => getCurrentProjectContext(projectId),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds (replaces your useEffect interval)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for creating columns
export const useCreateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateColumnRequest) => createColumn(data),
    onSuccess: (newColumn, variables) => {
      // Invalidate and refetch project context
      queryClient.invalidateQueries({ queryKey: queryKeys.projectContext(variables.projectId) });
      toast.success('Column created successfully');
    },
    onError: (error) => {
      console.error('Error creating column:', error);
      toast.error('Failed to create column');
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
      queryClient.setQueryData(queryKeys.projectContext(variables.projectId), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          columns: oldData.columns.map((col: ColumnData) =>
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
export const useBoardContext = (projectId: string) => {
  const { data } = useProjectContext(projectId);

  return {
    tasks: data?.tasks || [],
    columns: (data?.columns || []).map(col => ({
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
      tasks: (data?.tasks || []).filter(task =>
        task.columnId === col._id ||
        task.status === col._id ||
        (task.status && col.name?.toLowerCase() === task.status)
      )
    }))
  };
};
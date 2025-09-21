import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import FloatingBottomBar from '@/components/floatingBar/FloatingBottomBar';
import BoardColumn from '@/components/board/BoardColumn';
import TaskCard from '@/components/board/TaskCard';
import TaskDetailPopup from '@/components/board/TaskDetail';
import AgentResultModal from '@/components/board/AgentResultModal';
import AddColumnButton from '@/components/board/AddColumnButton';
import EmptyProjectState from '@/components/board/EmptyProjectState';
import {
  useProjectContext,
  useCreateColumn,
  useCreateTask,
  useUpdateTask,
  useUpdateColumn,
  useDeleteTask,
  useMoveTask,
  useRunAgent,
} from '@/hooks/useBoardData';
import { useProjectSelection } from '@/hooks/useProjectSelection';
import { useOrganization } from '@/hooks/useOrganization';
import { useCacheManagement } from '@/hooks/useBoardData';
import {
  type AIResponse,
  type ColumnData,
  type TaskData,
} from '@/lib/api';

const Board = () => {
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [resultTask, setResultTask] = useState<TaskData | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Use project selection hook for dynamic project management
  const { currentProjectId, currentProject, projects } = useProjectSelection();
  const { currentOrganization, isOrgSwitching } = useOrganization();
  const { invalidateProjectData } = useCacheManagement();

  // Agent operations
  const runAgentMutation = useRunAgent({ autoComplete: false }); // Set to true if you want auto-completion

  // Handle organization switching and project validation
  useEffect(() => {
    if (!isOrgSwitching && currentOrganization) {
      // Organization switch completed
      if (currentProjectId && projects.length > 0) {
        const currentProjectInOrg = projects.find(p => p._id === currentProjectId);
        if (!currentProjectInOrg) {
          console.log('🔄 [Board] Current project not found in new organization - redirecting');
          // Invalidate stale project cache immediately
          invalidateProjectData(currentProjectId);
          // Don't redirect here - let the validation logic handle it
        } else {
          console.log('🔄 [Board] Project found in new organization - displaying board');
        }
      }
    }
  }, [isOrgSwitching, currentProjectId, projects, currentOrganization, invalidateProjectData]);

  // Check if current project is valid for current organization
  const isCurrentProjectValid = currentProjectId &&
    projects.length > 0 &&
    projects.find(p => p._id === currentProjectId) &&
    !isOrgSwitching;

  // TanStack Query hooks - only fetch if project is valid for current org
  const { data: projectContext, isLoading: loading, error, refetch } = useProjectContext(
    isCurrentProjectValid ? currentProjectId : '',
    isCurrentProjectValid
  );
  const createColumnMutation = useCreateColumn();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const updateColumnMutation = useUpdateColumn();
  const deleteTaskMutation = useDeleteTask();
  const moveTaskMutation = useMoveTask();

  // Extract columns from the query data (already properly formatted by API transformation)
  const formattedColumns: ColumnData[] = projectContext?.columns || [];

  // Extract tasks from the query data (already properly formatted by API transformation)
  const formattedTasks: TaskData[] = projectContext?.tasks || [];

  const getTasksByColumn = (columnId: string) => {
    // Handle both columnId and status field for backwards compatibility
    return formattedTasks.filter(task =>
      task.columnId === columnId ||
      task.status === columnId ||
      (task.status && formattedColumns.find(col => col._id === columnId)?.name?.toLowerCase() === task.status)
    );
  };

  const handleAddTask = async (columnId: string, taskData: { title: string; description?: string }) => {
    if (!isCurrentProjectValid) return;

    // Map column name to proper status
    const column = formattedColumns.find(col => col._id === columnId);
    const statusMap: Record<string, TaskData['status']> = {
      'backlog': 'backlog',
      'ready': 'ready',
      'in progress': 'in_progress',
      'done': 'done'
    };

    const columnName = column?.name?.toLowerCase() || column?.title?.toLowerCase() || '';
    const status = statusMap[columnName] || 'backlog';

    createTaskMutation.mutate({
      projectId: currentProjectId,
      columnId: columnId,
      title: taskData.title,
      description: taskData.description,
      type: 'doc', // Could be made dynamic
      status: status,
      tokenEstimate: 500, // Could be estimated
    });
  };

  const handleToggleCollapse = (columnId: string) => {
    if (!isCurrentProjectValid) return;
    const column = formattedColumns.find(col => col._id === columnId);
    if (!column) return;

    updateColumnMutation.mutate({
      columnId,
      updates: { settings: { ...column.settings, isCollapsed: !column.settings.isCollapsed } },
      projectId: currentProjectId,
    });
  };

  const handleTogglePin = (columnId: string) => {
    const column = formattedColumns.find(col => col._id === columnId);
    if (!column) return;

    updateColumnMutation.mutate({
      columnId,
      updates: { settings: { ...column.settings, isPinned: !column.settings.isPinned } },
      projectId: currentProjectId,
    });
  };

  const handleToggleVisibility = (columnId: string) => {
    const column = formattedColumns.find(col => col._id === columnId);
    if (!column) return;

    const visibilityOrder: ColumnData['visibility'][] = ['public', 'team', 'private'];
    const currentIndex = visibilityOrder.indexOf(column.visibility || 'public');
    const nextIndex = (currentIndex + 1) % visibilityOrder.length;
    const newVisibility = visibilityOrder[nextIndex];

    updateColumnMutation.mutate({
      columnId,
      updates: { visibility: newVisibility },
      projectId: currentProjectId,
    });
  };

  const runQuickAction = (taskId: string, action: string) => {
    if (action === 'run') {
      // Find the task to get its agents
      const task = projectContext?.tasks?.find(t => t._id === taskId);

      if (!task) {
        toast.error('Task not found');
        return;
      }

      if (!currentProjectId) {
        toast.error('Project ID not available');
        return;
      }

      // Use first assigned agent or let backend default to Coral-Interface-Agent
      const agentId = task.agents && task.agents.length > 0 ? task.agents[0].agentId : undefined;

      toast.info('Starting agent execution...');

      runAgentMutation.mutate({
        taskId,
        agentId,
        projectId: currentProjectId,
      });
    } else {
      toast.success(`Running ${action} on task ${taskId}`);
    }
  };

  const handleMarkComplete = (taskId: string) => {
    // Find a "done" column or default to the last column
    const doneColumn = formattedColumns.find(col => col.name?.toLowerCase().includes('done')) || formattedColumns[formattedColumns.length - 1];
    if (!doneColumn) return;

    moveTaskMutation.mutate({
      taskId,
      newColumnId: doneColumn._id,
      projectId: currentProjectId,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate({
      taskId,
      projectId: currentProjectId,
    });
  };

  const handleMoveTask = (taskId: string, newColumnId: string) => {
    moveTaskMutation.mutate({
      taskId,
      newColumnId,
      projectId: currentProjectId,
    });
  };

  const handleAddColumn = (columnName: string) => {
    if (!isCurrentProjectValid || !columnName?.trim()) return;

    createColumnMutation.mutate({
      projectId: currentProjectId,
      title: columnName,
      name: columnName.toLowerCase().replace(/\s+/g, '_'),
      color: '#6b7280',
      visibility: 'public',
    });
  };

  // Task detail popup handlers
  const handleShowTaskDetails = (task: TaskData) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleViewResults = (task: TaskData) => {
    setResultTask(task);
    setIsResultModalOpen(true);
  };

  const handleMarkCompleteFromResults = () => {
    if (resultTask) {
      handleMarkComplete(resultTask._id);
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<TaskData>) => {
    updateTaskMutation.mutate({
      taskId,
      updates,
      projectId: currentProjectId,
    });
  };

  const handleAssignAgent = (taskId: string, agent: string) => {
    updateTaskMutation.mutate({
      taskId,
      updates: { assignedAgent: agent },
      projectId: currentProjectId,
    });
  };

  const handleRunTask = (taskId: string) => {
    runQuickAction(taskId, 'run');
  };

  // Handle AI Assistant responses
  const handleAIResponse = (response: AIResponse) => {
    switch (response.type) {
      case 'task_creation':
        // Tasks and columns are created server-side, TanStack Query will auto-refresh
        if (response.createdTasks && response.createdTasks.length > 0) {
          // The useAIAssistant hook already handles invalidation, no manual refresh needed
        }
        break;

      case 'task_management':
        // Handle task management operations
        if (response.message) {
          console.log('Task management operation:', response.message);
          // The useAIAssistant hook already handles invalidation, no manual refresh needed
        }
        break;

      default:
        // General responses are handled in FloatingBottomBar with toasts
        break;
    }
  };

  // Enhanced project validation and routing logic
  if (!loading && !isOrgSwitching) {
    // Case 1: No projects exist in current organization
    if (projects.length === 0) {
      return <EmptyProjectState hasOrganization={!!currentOrganization} />;
    }

    // Case 2: Current project in URL doesn't belong to current organization
    if (currentProjectId && !isCurrentProjectValid) {
      console.log('🔄 [Board] Current project not valid for organization - redirecting to first project');
      // Invalidate the stale project data
      invalidateProjectData(currentProjectId);
      // Redirect to first available project
      window.location.href = `/projects/${projects[0]._id}/board`;
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Switching to available project...</p>
          </div>
        </div>
      );
    }

    // Case 3: No project selected but projects exist
    if (!currentProjectId && projects.length > 0) {
      window.location.href = `/projects/${projects[0]._id}/board`;
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Redirecting to project...</p>
          </div>
        </div>
      );
    }
  }

  // Show organization switching overlay
  if (isOrgSwitching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Switching Organization</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please wait while we load your new workspace...
          </p>
        </div>
      </div>
    );
  }

  // Only show loading if we have a valid project to load
  if (loading && isCurrentProjectValid) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Loading {currentProject?.name || 'board'}...
          </p>
        </div>
      </div>
    );
  }

  // Handle errors only for valid project queries
  if (error && isCurrentProjectValid) {
    console.log('❌ [Board] Error loading valid project:', {
      error: error instanceof Error ? error.message : String(error),
      currentProjectId,
      currentOrgId: currentOrganization?._id,
      timestamp: new Date().toISOString()
    });

    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load board data</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Final check: if we reach this point and don't have valid project data, show empty state
  if (!isCurrentProjectValid) {
    return <EmptyProjectState hasOrganization={!!currentOrganization} />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Board Content - Takes remaining space minus floating bar */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 pb-20">
        <div className="flex gap-3 p-4 h-full overflow-x-auto">
          {formattedColumns.length === 0 ? (
            // Empty state - show single "Add List" button
            <AddColumnButton
              onAddColumn={handleAddColumn}
              isLoading={createColumnMutation.isPending}
              variant="empty"
            />
          ) : (
            <>
              {/* Existing Columns */}
              {formattedColumns.map((column) => (
                <BoardColumn
                  key={column._id}
                  column={column}
                  taskCount={getTasksByColumn(column._id).length}
                  onToggleCollapse={handleToggleCollapse}
                  onTogglePin={handleTogglePin}
                  onToggleVisibility={handleToggleVisibility}
                  onAddTask={handleAddTask}
                >
                  {/* Tasks */}
                  {getTasksByColumn(column._id).map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onQuickAction={runQuickAction}
                      onMarkComplete={handleMarkComplete}
                      onDelete={handleDeleteTask}
                      onMove={handleMoveTask}
                      onShowDetails={handleShowTaskDetails}
                      onViewResults={handleViewResults}
                    />
                  ))}
                </BoardColumn>
              ))}
              {/* Add Column Button - Always rightmost */}
              <AddColumnButton
                onAddColumn={handleAddColumn}
                isLoading={createColumnMutation.isPending}
                variant="regular"
              />
            </>
          )}
        </div>
      </div>

      {/* Task Detail Popup */}
      <TaskDetailPopup
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onAssignAgent={handleAssignAgent}
        onRunTask={handleRunTask}
        projectId={currentProjectId}
      />

      {/* Agent Result Modal */}
      <AgentResultModal
        result={resultTask?.lastAgentResult || null}
        isOpen={isResultModalOpen}
        onClose={() => {
          setIsResultModalOpen(false);
          setResultTask(null);
        }}
        onMarkComplete={handleMarkCompleteFromResults}
      />

      {/* AI-Powered Floating Bottom Bar */}
      <FloatingBottomBar
        onAIResponse={handleAIResponse}
        currentProjectId={currentProjectId}
      />
    </div>
  );
};

export default Board;
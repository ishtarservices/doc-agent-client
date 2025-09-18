import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import FloatingActionBubble from '@/components/board/FloatingActionBubble';
import FloatingBottomBar from '@/components/floatingBar/FloatingBottomBar';
import BoardColumn from '@/components/board/BoardColumn';
import TaskCard from '@/components/board/TaskCard';
import TaskDetailPopup from '@/components/board/TaskDetail';
import {
  useProjectContext,
  useCreateColumn,
  useCreateTask,
  useUpdateTask,
  useUpdateColumn,
  useDeleteTask,
  useMoveTask,
} from '@/hooks/useBoardData';
import { useProjectSelection } from '@/hooks/useProjectSelection';
import {
  type AIResponse,
  type ColumnData,
  type TaskData,
} from '@/lib/api';

const Board = () => {
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Use project selection hook for dynamic project management
  const { currentProjectId, currentProject } = useProjectSelection();

  // TanStack Query hooks
  const { data: projectContext, isLoading: loading, error, refetch } = useProjectContext(currentProjectId);
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
    toast.success(`Running ${action} on task ${taskId}`);
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

  const handleAddColumn = () => {
    const columnName = prompt('Enter column name:');
    if (!columnName?.trim()) return;

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

  if (loading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load board data</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Scrollable Board Content */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex gap-4 p-4 h-full overflow-x-auto">
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
                />
              ))}
            </BoardColumn>
          ))}
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
      />

      {/* Floating Action Bubble */}
      <FloatingActionBubble onAddColumn={handleAddColumn} />

      {/* AI-Powered Floating Bottom Bar */}
      <FloatingBottomBar
        onAIResponse={handleAIResponse}
        currentProjectId={currentProjectId}
      />
    </div>
  );
};

export default Board;
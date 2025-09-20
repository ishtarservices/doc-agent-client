import React, { useState } from 'react';
import { MessageSquare, Calendar, Inbox, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFloatingBarData } from '@/hooks/useFloatingBarData';
import { useAIAssistant } from '@/hooks/useBoardData';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AIAssistant from './panels/AIAssistantPanel';
import { ProjectPanelContent } from './panels/ProjectPanel';
import type { AIRequest, AIResponse } from '@/types/ai';

type FloatingMenuType = 'ai' | 'planner' | 'inbox' | 'projects' | null;

interface FloatingBottomBarProps {
  onAIResponse?: (response: AIResponse) => void;
  currentProjectId?: string;
}

const FloatingBottomBar: React.FC<FloatingBottomBarProps> = ({
  onAIResponse,
  currentProjectId
}) => {
  const [activeMenu, setActiveMenu] = useState<FloatingMenuType>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    projects,
    currentProject,
    tasks,
    columns,
    agents,
    isLoading,
    notifications,
    upcomingTasks,
    switchProject,
    refreshData
  } = useFloatingBarData(currentProjectId);

  // Use TanStack Query hook for AI assistant
  const aiAssistantMutation = useAIAssistant();

  const toggleMenu = (menu: FloatingMenuType) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleAIMessage = async (message: string, attachments?: File[]): Promise<AIResponse> => {
    if (!currentProject || !user) {
      toast.error('Project or user not available');
      throw new Error('Project or user not available');
    }

    try {
      // Process attachments if any
      const processedAttachments = attachments ? await Promise.all(
        attachments.map(async (file) => ({
          type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          content: await fileToBase64(file)
        }))
      ) : undefined;

      // Build enhanced AI request with better column-task relationship mapping
      const enhancedColumns = columns.map(col => ({
        ...col,
        taskCount: tasks.filter(t => t.columnId === col._id).length,
        tasks: tasks.filter(t => t.columnId === col._id)
      }));

      // Improved default column selection logic
      const getDefaultColumn = () => {
        // Priority order for column selection
        const columnPriority = ['backlog', 'todo', 'ready', 'pending', 'new'];

        // First, try to find by name (case-insensitive)
        for (const priority of columnPriority) {
          const found = columns.find(col =>
            col.name?.toLowerCase() === priority ||
            col.title?.toLowerCase() === priority ||
            col.title?.toLowerCase().includes(priority)
          );
          if (found) return found._id;
        }

        // If no priority match, use the first column with lowest task count
        const leastBusyColumn = enhancedColumns
          .filter(col => !col.settings?.taskLimit || col.taskCount < col.settings.taskLimit)
          .sort((a, b) => a.taskCount - b.taskCount)[0];

        return leastBusyColumn?._id || columns[0]?._id;
      };

      const aiRequest: AIRequest = {
        input: message,
        userId: user.id,
        projectId: currentProject._id,
        organizationId: currentProject.organizationId,
        attachments: processedAttachments,
        context: {
          currentTasks: tasks,
          currentColumns: enhancedColumns,
          availableAgents: agents,
          project: currentProject,
          organization: {
            _id: currentProject.organizationId,
            name: 'Current Organization', // This should come from organization context
            slug: 'current-org',
            settings: {
              defaultColumns: [],
              aiCredits: 10000,
              maxProjects: 10,
              features: []
            },
            members: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
          }
        },
        options: {
          autoAssignAgent: true,
          createInColumn: getDefaultColumn(),
          enableTools: true,
          responseFormat: 'text',
          priority: 'normal'
        }
      };

      // Send request using the mutation and return the response
      return new Promise<AIResponse>((resolve, reject) => {
        aiAssistantMutation.mutate(aiRequest, {
          onSuccess: (response) => {
            console.log('AI Assistant response:', response);
            // Handle different response types
            switch (response.type) {
            case 'general_answer':
              toast.success('AI Response', {
                description: response.message,
                duration: 5000,
              });
              break;

            case 'task_creation':
              if (response.createdTasks && response.createdTasks.length > 0) {
                toast.success(`Created ${response.createdTasks.length} new task(s)!`, {
                  description: response.message,
                  duration: 4000,
                });
              }
              if (response.createdColumns && response.createdColumns.length > 0) {
                toast.success(`Created ${response.createdColumns.length} new column(s)!`, {
                  description: 'Board updated with new columns',
                  duration: 4000,
                });
              }
              break;

            case 'task_management':
              toast.success('Task management completed!', {
                description: response.message,
                duration: 4000,
              });
              break;

            case 'project_management':
              toast.success('Project updated!', {
                description: response.message,
                duration: 4000,
              });
              break;

            case 'tool_execution': {
              const successfulTools = response.toolResults?.filter(tr => tr.success).length || 0;
              const failedTools = response.toolResults?.filter(tr => !tr.success).length || 0;
              
              if (successfulTools > 0) {
                toast.success(`Executed ${successfulTools} action(s) successfully`, {
                  description: response.message,
                  duration: 4000,
                });
              }
              
              if (failedTools > 0) {
                toast.warning(`${failedTools} action(s) failed`, {
                  description: 'Some operations could not be completed',
                  duration: 4000,
                });
              }
              break;
            }

            case 'agent_assignment':
              toast.success('Agent assigned!', {
                description: response.message,
                duration: 4000,
              });
              break;

            case 'error':
              toast.error('AI Assistant Error', {
                description: response.message,
                duration: 5000,
              });
              break;

            default:
              toast.info('AI Response', {
                description: response.message || 'Operation completed',
                duration: 4000,
              });
          }

          // Call the callback if provided
          if (onAIResponse) {
            onAIResponse(response);
          }

          // Enhanced query invalidation for better data refresh
          if (currentProject) {
            // Force refresh the project context to get updated tasks/columns
            queryClient.invalidateQueries({
              queryKey: ['project-context', currentProject._id]
            });

            // More targeted refresh based on what was actually changed
            if (response.createdTasks?.length > 0 || response.updatedTasks?.length > 0) {
              queryClient.invalidateQueries({
                queryKey: ['tasks', currentProject._id]
              });
            }

            if (response.createdColumns?.length > 0) {
              queryClient.invalidateQueries({
                queryKey: ['columns', currentProject._id]
              });
            }

            // If projects were created/updated, refresh organization projects
            if (response.createdProjects?.length > 0 || response.updatedProjects?.length > 0) {
              queryClient.invalidateQueries({
                queryKey: ['organization-projects', currentProject.organizationId]
              });
            }
          }

          // Original refresh for backward compatibility
          refreshData();

          // Resolve the promise with the response
          resolve(response);
        },
        onError: (error) => {
          toast.error('AI Assistant Error', {
            description: error.message || 'Failed to process your request',
            duration: 5000,
          });
          // Reject the promise with the error
          reject(error);
        }
      });
      });

    } catch (error) {
      console.error('Error processing AI request:', error);
      toast.error('Failed to process request', {
        description: 'Please try again',
        duration: 5000,
      });
      throw error;
    }
  };

  const handleProjectSwitch = async (projectId: string) => {
    await switchProject(projectId);
    setActiveMenu(null);
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 content
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const renderDropup = () => {
    if (!activeMenu) return null;

    // AI Assistant gets special treatment with the new component
    if (activeMenu === 'ai') {
      return (
        <AIAssistant
          isOpen={true}
          onClose={() => setActiveMenu(null)}
          onSendMessage={handleAIMessage}
          currentProject={currentProject ? {
            _id: currentProject._id,
            name: currentProject.name
          } : undefined}
          isLoading={aiAssistantMutation.isPending}
          taskCount={tasks.length}
          agentCount={agents.length}
        />
      );
    }

    // Other menu panels remain as cards
    return (
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-80 mb-2">
        <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">
              {activeMenu === 'planner' && '📅 Planner'}
              {activeMenu === 'inbox' && '📥 Inbox'}
              {activeMenu === 'projects' && '📁 Projects'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setActiveMenu(null)}
            >
              ×
            </Button>
          </div>

          {activeMenu === 'planner' && (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.deadline}</p>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {activeMenu === 'inbox' && (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-2 rounded-lg bg-muted/50">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
          )}

          {activeMenu === 'projects' && (
            <ProjectPanelContent
              onClose={() => setActiveMenu(null)}
              isLoading={isLoading}
              currentProject={currentProject}
              projects={projects}
              onProjectSwitch={handleProjectSwitch}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderDropup()}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-1 bg-background/95 backdrop-blur-sm rounded-full shadow-lg border px-3 py-2">
          <Button
            variant={activeMenu === 'projects' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleMenu('projects')}
            className="rounded-full px-3"
            disabled={isLoading}
          >
            <FolderOpen className="h-4 w-4 mr-1" />
            Projects
          </Button>
          
          <div className="w-px h-5 bg-border" />
          
          <Button
            variant={activeMenu === 'ai' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleMenu('ai')}
            className="rounded-full px-3"
            disabled={isLoading || !currentProject}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            AI
            {aiAssistantMutation.isPending && (
              <div className="ml-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
            )}
          </Button>
          
          <div className="w-px h-5 bg-border" />
          
          <Button
            variant={activeMenu === 'planner' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleMenu('planner')}
            className="rounded-full px-3"
            disabled={isLoading}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Planner
          </Button>
          
          <div className="w-px h-5 bg-border" />
          
          <Button
            variant={activeMenu === 'inbox' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleMenu('inbox')}
            className="rounded-full px-3"
            disabled={isLoading}
          >
            <Inbox className="h-4 w-4 mr-1" />
            Inbox
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                {notifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default FloatingBottomBar;
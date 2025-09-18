import React, { useState } from 'react';
import { MessageSquare, Calendar, Inbox, X, Send, FolderOpen, Plus, Building, ChevronDown, Filter, Folder, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFloatingBarData } from '@/hooks/useFloatingBarData';
import { useAIAssistant } from '@/hooks/useBoardData';
import { type AIResponse } from '@/types/api';
import { toast } from 'sonner';

type FloatingMenuType = 'ai' | 'planner' | 'inbox' | 'projects' | 'organizations' | null;

interface FloatingBottomBarProps {
  onAIResponse?: (response: AIResponse) => void;
  currentProjectId?: string;
}

const FloatingBottomBar: React.FC<FloatingBottomBarProps> = ({
  onAIResponse,
  currentProjectId
}) => {
  const [activeMenu, setActiveMenu] = useState<FloatingMenuType>(null);
  const [aiInput, setAiInput] = useState('');
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    organization,
    projects,
    currentProject,
    tasks,
    columns,
    agents,
    isLoading,
    notifications,
    upcomingTasks,
    switchOrganization,
    switchProject,
    refreshData
  } = useFloatingBarData(currentProjectId);

  // Use TanStack Query hook for AI assistant
  const aiAssistantMutation = useAIAssistant();

  const toggleMenu = (menu: FloatingMenuType) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleAiSubmit = () => {
    if (!aiInput.trim() || aiAssistantMutation.isPending || !currentProject) return;

    const request = {
      input: aiInput.trim(),
      projectId: currentProject._id,
      organizationId: currentProject.organizationId,
      context: {
        currentTasks: tasks,
        currentColumns: columns,
        availableAgents: agents
      },
      options: {
        autoAssignAgent: true,
        createInColumn: columns.find(col => col.name === 'backlog')?._id
      }
    };

    aiAssistantMutation.mutate(request, {
      onSuccess: (response) => {
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
              if (onAIResponse) {
                onAIResponse(response);
              }
            }
            break;

          case 'task_management':
            toast.success('Task management operation completed!', {
              description: response.message,
              duration: 4000,
            });
            if (onAIResponse) {
              onAIResponse(response);
            }
            break;

          case 'agent_assignment':
            toast.success('Agent assigned!', {
              description: response.message,
              duration: 4000,
            });
            if (onAIResponse) {
              onAIResponse(response);
            }
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

        // Clear input, refresh data, and close menu
        setAiInput('');
        refreshData();
        setActiveMenu(null);
      },
      onError: (error) => {
        toast.error('AI Assistant Error', {
          description: error.message || 'Failed to process your request',
          duration: 5000,
        });
      }
    });
  };

  const handleProjectSwitch = async (projectId: string) => {
    await switchProject(projectId);
    setActiveMenu(null);
  };

  const handleOrganizationSwitch = async (organizationId: string) => {
    await switchOrganization(organizationId);
    setActiveMenu(null);
  };

  // Get contextual content based on current page
  const getContextualContent = () => {
    if (currentPath.startsWith('/board')) {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Board Filters</h3>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Filter className="h-4 w-4 mr-2" />
              All Tasks
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Filter className="h-4 w-4 mr-2" />
              My Tasks
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Filter className="h-4 w-4 mr-2" />
              High Priority
            </Button>
          </div>
        </div>
      );
    }

    if (currentPath.startsWith('/docs')) {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Access</h3>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Folder className="h-4 w-4 mr-2" />
              README.md
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Folder className="h-4 w-4 mr-2" />
              CONTEXT.md
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Folder className="h-4 w-4 mr-2" />
              CHANGELOG.md
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderDropup = () => {
    if (!activeMenu) return null;

    return (
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-80 mb-2">
        <Card className="shadow-lg border-2 bg-background/95 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">
              {activeMenu === 'ai' && '🤖 AI Assistant'}
              {activeMenu === 'planner' && '📅 Planner'}
              {activeMenu === 'inbox' && '📥 Inbox'}
              {activeMenu === 'projects' && '📁 Projects'}
              {activeMenu === 'organizations' && '🏢 Organizations'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setActiveMenu(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {activeMenu === 'ai' && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask AI or create tasks..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !aiAssistantMutation.isPending && handleAiSubmit()}
                    disabled={aiAssistantMutation.isPending || !currentProject}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAiSubmit} disabled={aiAssistantMutation.isPending || !currentProject}>
                    {aiAssistantMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentProject ? (
                    `Try: "Create a task for legal review" or "Summarize backlog" • ${tasks.length} tasks • ${agents.length} agents available`
                  ) : (
                    'Select a project to use AI assistant'
                  )}
                </div>
              </div>
            )}

            {activeMenu === 'planner' && (
              <ScrollArea className="h-48">
                <div className="space-y-3">
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
              </ScrollArea>
            )}

            {activeMenu === 'inbox' && (
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-2 rounded-lg bg-muted/50">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {activeMenu === 'projects' && (
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        project._id === currentProject?._id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 hover:bg-muted/70'
                      }`}
                      onClick={() => handleProjectSwitch(project._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.description}</p>
                        </div>
                        {project._id === currentProject?._id && <Badge variant="default" className="text-xs">Active</Badge>}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Plus className="h-3 w-3 mr-2" />
                    New Project
                  </Button>
                </div>
              </ScrollArea>
            )}

            {activeMenu === 'organizations' && (
              <div className="space-y-4">
                {/* Current Organization & Project */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Current Organization</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between text-left" size="sm">
                          <span className="truncate">{organization?.name || 'No Organization'}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {/* Organization switching would be implemented here */}
                        <DropdownMenuItem>+ New Organization</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Current Project</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between text-left" size="sm">
                          <span className="truncate">{currentProject?.name || 'No Project'}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {projects.map((project) => (
                          <DropdownMenuItem key={project._id} onClick={() => handleProjectSwitch(project._id)}>
                            <div className="flex items-center justify-between w-full">
                              <span>{project.name}</span>
                              {project._id === currentProject?._id && <Badge variant="default" className="text-xs">Active</Badge>}
                            </div>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem>+ New Project</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Page-specific contextual content */}
                {getContextualContent()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {renderDropup()}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-1 bg-background/95 backdrop-blur-sm rounded-full shadow-sm px-3 py-2">
          <Button
            variant={activeMenu === 'organizations' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleMenu('organizations')}
            className="rounded-full px-3"
            disabled={isLoading}
          >
            <Building className="h-4 w-4 mr-1" />
            Org
          </Button>
          <div className="w-px h-5 bg-border" />
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
            disabled={isLoading}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            AI
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
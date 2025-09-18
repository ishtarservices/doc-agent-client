// src/components/FloatingBottomBar/panels/ProjectPanel.tsx

import React from 'react';
import { Plus, Calendar, Users, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelWrapper } from '../common/PanelWrapper';
import { ContextualContent } from '../common/ContextualContent';
import { type ProjectData } from '@/types/api';

interface ProjectPanelProps {
  onClose: () => void;
  isLoading: boolean;
  currentProject?: ProjectData;
  projects: ProjectData[];
  onProjectSwitch: (projectId: string) => void;
}

export const ProjectPanel: React.FC<ProjectPanelProps> = ({
  onClose,
  isLoading,
  currentProject,
  projects,
  onProjectSwitch
}) => {
  const handleProjectSelect = (projectId: string) => {
    if (projectId !== currentProject?._id) {
      onProjectSwitch(projectId);
    }
  };

  const getProjectStatus = (project: ProjectData) => {
    if (project.isArchived) return { label: 'Archived', variant: 'secondary' as const };
    if (!project.isActive) return { label: 'Inactive', variant: 'destructive' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  const formatMemberCount = (members: ProjectData['members']) => {
    const count = members?.length || 0;
    return `${count} member${count !== 1 ? 's' : ''}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <PanelWrapper 
      title="📁 Projects" 
      onClose={onClose}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {/* Current Project Info */}
        {currentProject && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="text-xs">Current</Badge>
                <span className="font-medium text-sm">{currentProject.name}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            
            {currentProject.description && (
              <p className="text-xs text-muted-foreground">
                {currentProject.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{formatMemberCount(currentProject.members)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(currentProject.createdAt)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Project List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              All Projects ({projects.length})
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>

          <ScrollArea className="h-48">
            <div className="space-y-2">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No projects found</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Create your first project
                  </Button>
                </div>
              ) : (
                projects.map((project) => {
                  const status = getProjectStatus(project);
                  const isCurrent = project._id === currentProject?._id;
                  
                  return (
                    <div
                      key={project._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isCurrent 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-muted/50 hover:bg-muted/70 border border-transparent'
                      }`}
                      onClick={() => handleProjectSelect(project._id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {project.name}
                            </span>
                            <Badge variant={status.variant} className="text-xs">
                              {status.label}
                            </Badge>
                          </div>
                          
                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{formatMemberCount(project.members)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                        
                        {project.settings?.autoRunEnabled && (
                          <Badge variant="outline" className="text-xs">
                            Auto-run
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              New Project
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        {/* Contextual Content */}
        <ContextualContent currentProject={currentProject} />
      </div>
    </PanelWrapper>
  );
};
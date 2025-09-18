// src/components/floatingBar/common/ContextualContent.tsx

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Filter,
  Folder,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Calendar,
  Target,
  FileText,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectContext } from '@/hooks/useBoardData';
import { type ProjectData } from '@/types/api';

interface ContextualContentProps {
  currentProject?: ProjectData;
}

export const ContextualContent: React.FC<ContextualContentProps> = ({
  currentProject
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Fetch project data using the hook when we have a project
  const { data: projectData } = useProjectContext(currentProject?._id || '');

  // Calculate contextual metrics
  const contextualMetrics = useMemo(() => {
    const tasks = projectData?.tasks || [];
    if (!tasks.length) return {};

    const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent');
    const myTasks = tasks.filter(task =>
      task.assignees?.some(assignee => assignee.role === 'assignee' || assignee.role === 'owner')
    );
    const dueSoonTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate <= weekFromNow && dueDate >= new Date();
    });
    const completedTasks = tasks.filter(task => task.status === 'done');
    const blockedTasks = tasks.filter(task => task.status === 'blocked');

    return {
      total: tasks.length,
      highPriority: highPriorityTasks.length,
      myTasks: myTasks.length,
      dueSoon: dueSoonTasks.length,
      completed: completedTasks.length,
      blocked: blockedTasks.length,
      completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
    };
  }, [projectData?.tasks]);

  // Don't show contextual content if no project is selected
  if (!currentProject) {
    return (
      <div className="space-y-3 pt-3 border-t">
        <div className="text-center py-4">
          <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a project to see contextual content</p>
        </div>
      </div>
    );
  }

  // Board page contextual content
  if (currentPath.startsWith('/board')) {
    return (
      <div className="space-y-3 pt-3 border-t">
        <h3 className="text-sm font-medium text-muted-foreground">Board Filters</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/board?project=${currentProject._id}`)}
          >
            <Filter className="h-4 w-4 mr-2" />
            All Tasks
            <Badge variant="secondary" className="ml-auto text-xs">
              {contextualMetrics.total || 0}
            </Badge>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/board?project=${currentProject._id}&filter=my-tasks`)}
          >
            <User className="h-4 w-4 mr-2" />
            My Tasks
            <Badge variant="secondary" className="ml-auto text-xs">
              {contextualMetrics.myTasks || 0}
            </Badge>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/board?project=${currentProject._id}&filter=high-priority`)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            High Priority
            <Badge variant="destructive" className="ml-auto text-xs">
              {contextualMetrics.highPriority || 0}
            </Badge>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/board?project=${currentProject._id}&filter=due-soon`)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Due This Week
            <Badge variant="outline" className="ml-auto text-xs">
              {contextualMetrics.dueSoon || 0}
            </Badge>
          </Button>
        </div>

        {/* Project Stats */}
        {contextualMetrics.total > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Project Stats</h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Completed
                </span>
                <span>{contextualMetrics.completed}/{contextualMetrics.total}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Progress</span>
                <span>{contextualMetrics.completionRate}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Docs page contextual content
  if (currentPath.startsWith('/docs')) {
    return (
      <div className="space-y-3 pt-3 border-t">
        <h3 className="text-sm font-medium text-muted-foreground">Documentation</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/docs?project=${currentProject._id}&doc=readme`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            README.md
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/docs?project=${currentProject._id}&doc=context`)}
          >
            <Folder className="h-4 w-4 mr-2" />
            CONTEXT.md
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/docs?project=${currentProject._id}&doc=changelog`)}
          >
            <Activity className="h-4 w-4 mr-2" />
            CHANGELOG.md
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/docs?project=${currentProject._id}&doc=api`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            API_DOCS.md
          </Button>
        </div>

        {/* Project Info */}
        <div className="pt-2 border-t">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Project Info</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Created: {new Date(currentProject.createdAt).toLocaleDateString()}</div>
            <div>Members: {currentProject.members?.length || 0}</div>
            <div>Status: {currentProject.isActive ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard contextual content
  if (currentPath === '/dashboard' || currentPath === '/') {
    return (
      <div className="space-y-3 pt-3 border-t">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/dashboard?view=recent-activity`)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Recent Activity
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/dashboard?view=pending-reviews`)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending Reviews
            {contextualMetrics.blocked > 0 && (
              <Badge variant="outline" className="ml-auto text-xs">
                {contextualMetrics.blocked}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/dashboard?view=my-assignments`)}
          >
            <User className="h-4 w-4 mr-2" />
            My Assignments
            {contextualMetrics.myTasks > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {contextualMetrics.myTasks}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate(`/dashboard?view=due-soon`)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Due Soon
            {contextualMetrics.dueSoon > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs">
                {contextualMetrics.dueSoon}
              </Badge>
            )}
          </Button>
        </div>

        {/* Current Project Summary */}
        {contextualMetrics.total > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              {currentProject.name}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-medium">{contextualMetrics.total}</div>
                <div className="text-muted-foreground">Tasks</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-medium">{contextualMetrics.completionRate}%</div>
                <div className="text-muted-foreground">Done</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Marketplace contextual content
  if (currentPath.startsWith('/marketplace')) {
    return (
      <div className="space-y-3 pt-3 border-t">
        <h3 className="text-sm font-medium text-muted-foreground">Marketplace</h3>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Target className="h-4 w-4 mr-2" />
            AI Agents
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>
    );
  }

  // Default: show basic project info
  return (
    <div className="space-y-3 pt-3 border-t">
      <div className="text-center">
        <h4 className="text-sm font-medium">{currentProject.name}</h4>
        {currentProject.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {currentProject.description}
          </p>
        )}
      </div>
    </div>
  );
};
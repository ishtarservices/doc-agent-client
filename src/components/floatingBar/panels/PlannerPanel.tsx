// src/components/FloatingBottomBar/panels/PlannerPanel.tsx

import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelWrapper } from '../common/PanelWrapper';

interface UpcomingTask {
  id: string;
  title: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectName?: string;
}

interface PlannerPanelProps {
  onClose: () => void;
  isLoading: boolean;
  upcomingTasks: UpcomingTask[];
}

export const PlannerPanel: React.FC<PlannerPanelProps> = ({
  onClose,
  isLoading,
  upcomingTasks
}) => {
  const getPriorityColor = (priority: UpcomingTask['priority']) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <PanelWrapper 
      title="📅 Planner" 
      onClose={onClose}
      isLoading={isLoading}
    >
      <ScrollArea className="h-48">
        <div className="space-y-3">
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No upcoming tasks</p>
            </div>
          ) : (
            upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.deadline}</span>
                    </div>
                    {task.projectName && (
                      <span className="truncate">• {task.projectName}</span>
                    )}
                  </div>
                </div>
                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                  {task.priority}
                </Badge>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </PanelWrapper>
  );
};
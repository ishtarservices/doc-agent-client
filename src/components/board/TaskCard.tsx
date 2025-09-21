import React, { useState } from 'react';
import {
  Mail,
  FileText,
  Code,
  Search,
  Play,
  CheckCircle,
  Scale,
  Palette,
  Server,
  Edit3,
  MoreHorizontal,
  Bug,
  TestTube,
  DollarSign,
  MessageCircle,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskData } from '@/types/api';

interface TaskCardProps {
  task: TaskData;
  onQuickAction: (taskId: string, action: string) => void;
  onMarkComplete: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onMove?: (taskId: string, newColumnId: string) => void;
  onDelete?: (taskId: string) => void;
  onShowDetails?: (task: TaskData) => void;
  onViewResults?: (task: TaskData) => void; // New callback for viewing agent results
  isDragging?: boolean;
  isSelected?: boolean;
}

const TaskCard = ({
  task,
  onQuickAction,
  onMarkComplete,
  onEdit,
  onShowDetails,
  onViewResults,
  isDragging = false,
  isSelected = false
}: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeIcon = (type: TaskData['type']) => {
    const icons = {
      email: Mail,
      doc: FileText,
      code: Code,
      research: Search,
      legal: Scale,
      design: Palette,
      infra: Server,
      finance: DollarSign,
      bug: Bug,
      test: TestTube,
      outreach: MessageCircle,
    };
    return icons[type] || FileText;
  };

  const getTypeColor = (type: TaskData['type']) => {
    const colors = {
      email: 'text-blue-500',
      doc: 'text-green-500',
      code: 'text-purple-500',
      research: 'text-orange-500',
      legal: 'text-red-500',
      design: 'text-pink-500',
      infra: 'text-gray-500',
      finance: 'text-emerald-500',
      bug: 'text-red-600',
      test: 'text-cyan-500',
      outreach: 'text-indigo-500',
    };
    return colors[type] || 'text-green-500';
  };

  const TypeIcon = getTypeIcon(task.type);

  return (
    <Card
      className={`
        group cursor-pointer transition-all duration-200 border-none shadow-sm bg-background
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
        ${isSelected ? 'ring-1 ring-primary/30' : ''}
        ${task.isUpdating ? 'animate-pulse' : ''}
        ${task.isNew ? 'animate-in slide-in-from-top-2 duration-300' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onShowDetails?.(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          {/* Complete button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 shrink-0 hover:bg-green-100 dark:hover:bg-green-900/30 mt-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onMarkComplete(task._id);
            }}
          >
            <CheckCircle className={`h-4 w-4 ${task.status === 'done' ? 'text-green-500 fill-green-100' : 'text-muted-foreground'}`} />
          </Button>

          {/* Task content */}
          <div className="flex-1 mx-3 min-w-0">
            <div className="flex items-start gap-2">
              <TypeIcon className={`h-3 w-3 ${getTypeColor(task.type)} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-normal leading-tight text-foreground break-words">
                  {task.title}
                </h3>
                
                {/* Assignees */}
                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex -space-x-1 mt-2">
                    {task.assignees.slice(0, 2).map((assignee) => (
                      <Avatar key={assignee.userId} className="w-4 h-4 border border-background">
                        <AvatarImage src={assignee.avatar} alt={assignee.name} />
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {task.assignees.length > 2 && (
                      <div className="w-4 h-4 rounded-full bg-muted border border-background flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          +{task.assignees.length - 2}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Agents */}
                {task.agents && task.agents.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.agents.slice(0, 2).map((agent) => (
                      <div
                        key={agent.agentId}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                        title={agent.agentName}
                      >
                        <Server className="h-2 w-2" />
                        <span className="truncate max-w-[60px]">{agent.agentName}</span>
                      </div>
                    ))}
                    {task.agents.length > 2 && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                        +{task.agents.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-start gap-1 shrink-0">
            {/* View Results Button - show if task has agent results */}
            {task.lastAgentResult && onViewResults && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewResults(task);
                }}
                title="View agent results"
              >
                {task.lastAgentResult.success ? (
                  <Sparkles className="h-3 w-3 text-purple-500" />
                ) : (
                  <Eye className="h-3 w-3 text-purple-500" />
                )}
              </Button>
            )}

            {/* Run Agent Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction(task._id, 'run');
              }}
              title="Run agent"
            >
              <Play className="h-3 w-3 text-blue-500" />
            </Button>

            {/* Edit menu - only visible on hover */}
            {isHovered && onEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => onEdit(task._id)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
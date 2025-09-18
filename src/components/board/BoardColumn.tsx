import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ColumnData } from '@/types/api';

interface BoardColumnProps {
  column: ColumnData;
  taskCount: number;
  onToggleCollapse: (columnId: string) => void;
  onTogglePin: (columnId: string) => void;
  onToggleVisibility: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onUpdateColumn?: (columnId: string, updates: Partial<ColumnData>) => void;
  onAddTask?: (columnId: string, taskData: { title: string; description?: string }) => void;
  children: React.ReactNode;
  isDragging?: boolean;
  isPlaceholder?: boolean;
}

const BoardColumn = ({
  column,
  taskCount,
  onAddTask,
  children,
  isDragging = false,
  isPlaceholder = false,
}: BoardColumnProps) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const getColumnTitle = () => {
    return column.title || column.name || 'Untitled Column';
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    onAddTask?.(column._id, {
      title: newTaskTitle,
      description: newTaskDescription || undefined,
    });
    
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddTaskOpen(false);
  };

  const handleAIAddTask = () => {
    // TODO: Add AI functionality later
    console.log('AI task creation for column:', column._id);
    setIsAddTaskOpen(false);
  };

  // Handle placeholder state
  if (isPlaceholder) {
    return (
      <div className="flex flex-col h-full min-w-72 bg-muted/20 rounded-lg p-3 border-2 border-dashed border-muted-foreground/30">
        <div className="rounded-lg p-6 border border-dashed border-muted-foreground/30 bg-muted/10">
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Drop to create column</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      flex flex-col h-full min-w-72 max-w-72 
      bg-muted/80 dark:bg-muted/90 rounded-lg shadow-sm
      ${isDragging ? 'opacity-50 scale-95' : ''} 
      transition-all duration-200
    `}>
      {/* Column Header */}
      <div className="p-4 pb-3 border-b border-muted-foreground/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-sm text-foreground">
              {getColumnTitle()}
            </h3>
            <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
              {taskCount}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks Area - Scrollable */}
      <div className="flex-1 min-h-0 p-3">
        <ScrollArea className="h-full">
          <div className="space-y-2 pb-20">{children}</div>
        </ScrollArea>
      </div>

      {/* Fixed Add Task Button at Bottom */}
      <div className="p-3 pt-0 mt-auto">
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-10 border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 rounded-md bg-background/50 hover:bg-background/80 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm">Add Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task in the {getColumnTitle()} column
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
              />
              <Textarea
                placeholder="Task description (optional)"
                rows={3}
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
              <div className="flex justify-between space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleAIAddTask}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Create
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                    Add Task
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BoardColumn;
import React, { useState } from 'react';
import {
  Mail,
  FileText,
  Code,
  Search,
  Scale,
  Palette,
  Server,
  Calendar,
  Tag,
  Play,
  Edit3,
  Trash2,
  X,
  Bug,
  TestTube,
  DollarSign,
  MessageCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { TaskData } from '@/types/api';

interface TaskDetailPopupProps {
  task: TaskData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (taskId: string, updates: Partial<TaskData>) => void;
  onDelete?: (taskId: string) => void;
  onAssignAgent?: (taskId: string, agent: string) => void;
  onRunTask?: (taskId: string) => void;
}

const TaskDetailPopup = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAssignAgent,
  onRunTask,
}: TaskDetailPopupProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<TaskData>>({});
  const [newTag, setNewTag] = useState('');

  if (!task) return null;

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
      email: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      doc: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      code: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      research: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      legal: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      design: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      infra: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      bug: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      test: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      outreach: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    };
    return colors[type] || 'bg-green-100 text-green-700';
  };

  const handleSave = () => {
    if (onUpdate && Object.keys(editedTask).length > 0) {
      onUpdate(task._id, editedTask);
      setIsEditing(false);
      setEditedTask({});
      toast.success('Task updated successfully');
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const currentTags = task.tags || [];
    if (!currentTags.includes(newTag)) {
      const updatedTags = [...currentTags, newTag];
      setEditedTask({ ...editedTask, tags: updatedTags });
      onUpdate?.(task._id, { tags: updatedTags });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = task.tags || [];
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    setEditedTask({ ...editedTask, tags: updatedTags });
    onUpdate?.(task._id, { tags: updatedTags });
  };

  const TypeIcon = getTypeIcon(task.type);
  const tokenEstimate = task.tokenEstimate || task.tokenEstimate || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-2 rounded-lg ${getTypeColor(task.type)}`}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={editedTask.title || task.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="text-lg font-semibold mb-2"
                  />
                ) : (
                  <DialogTitle className="text-lg font-semibold leading-tight">
                    {task.title}
                  </DialogTitle>
                )}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {task.createdAt?.toLocaleDateString()}
                  </span>
                  <span>{tokenEstimate} tokens</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto space-y-6 pr-2">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            {isEditing ? (
              <Textarea
                value={editedTask.description || task.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={4}
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          <Separator />

          {/* Assignees */}
          <div>
            <h4 className="text-sm font-medium mb-2">Assignees</h4>
            <div className="flex items-center space-x-2">
              {task.assignees && task.assignees.length > 0 ? (
                task.assignees.map((assignee) => (
                  <div key={assignee.userId} className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                      <AvatarFallback className="text-xs">{assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignee.name}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No assignees</span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {task.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* AI Agent Assignment */}
          <div>
            <h4 className="text-sm font-medium mb-2">AI Agent Assignment</h4>
            <div className="space-y-2">
              <Select
                value={task.assignedAgent || ''}
                onValueChange={(value) => {
                  onAssignAgent?.(task._id, value);
                  toast.success(`Task assigned to ${value}`);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI agent or platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude AI</SelectItem>
                  <SelectItem value="gpt4">GPT-4</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="copilot">GitHub Copilot</SelectItem>
                  <SelectItem value="cursor">Cursor AI</SelectItem>
                </SelectContent>
              </Select>
              {task.assignedAgent && (
                <p className="text-xs text-muted-foreground">
                  Currently assigned to: <span className="font-medium">{task.assignedAgent}</span>
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                    setEditedTask({});
                  }
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Save' : 'Edit'}
              </Button>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTask({});
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDelete?.(task._id);
                  onClose();
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button
              onClick={() => {
                onRunTask?.(task._id);
                toast.success('Task execution started');
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailPopup;
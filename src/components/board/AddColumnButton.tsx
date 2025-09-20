import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface AddColumnButtonProps {
  onAddColumn: (columnName: string) => void;
  isLoading?: boolean;
  variant?: 'empty' | 'regular';
}

const AddColumnButton = ({
  onAddColumn,
  isLoading = false,
  variant = 'regular'
}: AddColumnButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [columnName, setColumnName] = useState('');

  const handleAddColumn = () => {
    if (!columnName.trim()) return;

    onAddColumn(columnName.trim());
    setColumnName('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddColumn();
    }
  };

  if (variant === 'empty') {
    return (
      <div className="flex flex-col h-full min-w-72 max-w-72">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="flex flex-col h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-medium text-muted-foreground mb-1">Add List</h3>
                  <p className="text-sm text-muted-foreground/70">
                    Create your first list to get started
                  </p>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New List</DialogTitle>
              <DialogDescription>
                Create a new list to organize your tasks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="List name (e.g., To Do, In Progress, Done)"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddColumn}
                  disabled={!columnName.trim() || isLoading}
                >
                  {isLoading ? 'Creating...' : 'Add List'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-w-72 max-w-72 flex-shrink-0">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="h-full border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
          >
            <div className="flex flex-col items-center justify-center p-6">
              <Plus className="h-6 w-6 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Add List</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New List</DialogTitle>
            <DialogDescription>
              Create a new list to organize your tasks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="List name (e.g., To Do, In Progress, Done)"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddColumn}
                disabled={!columnName.trim() || isLoading}
              >
                {isLoading ? 'Creating...' : 'Add List'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddColumnButton;
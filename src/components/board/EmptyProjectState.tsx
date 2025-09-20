import React, { useState } from 'react';
import { Plus, Building2, Folder, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/hooks/useBoardData';
import { useOrganization } from '@/hooks/useOrganization';
import { useProjectSwitcher } from '@/hooks/useProjectSelection';

interface EmptyProjectStateProps {
  hasOrganization: boolean;
}

const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({ hasOrganization }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const { currentOrganization } = useOrganization();
  const { switchProject } = useProjectSwitcher();
  const createProjectMutation = useCreateProject();

  const handleCreateProject = async () => {
    if (!currentOrganization?._id || !projectName.trim()) {
      return;
    }

    try {
      const newProject = await createProjectMutation.mutateAsync({
        organizationId: currentOrganization._id,
        name: projectName.trim(),
        description: projectDescription.trim() || 'Default project for getting started',
        visibility: "private",
        settings: {
          autoRunEnabled: false,
          aiModel: "claude-3-haiku",
          tokenBudget: 10000,
        },
      });

      // Switch to the new project immediately
      switchProject(newProject._id);
      setIsCreateDialogOpen(false);
      setProjectName('');
      setProjectDescription('');
    } catch (error) {
      console.error('🏗️ [EmptyProjectState] Failed to create project:', error);
    }
  };

  if (!hasOrganization) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>No Organization Found</CardTitle>
            <CardDescription>
              You need to be part of an organization to create projects. Please check your organization settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-lg mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Folder className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Welcome to {currentOrganization?.name}</CardTitle>
            <CardDescription>
              You don't have any projects yet. Create your first project to start organizing your tasks and collaborating with your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full h-12"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Project
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Projects help you organize tasks, collaborate with team members, and track progress.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Your First Project</DialogTitle>
            <DialogDescription>
              Set up your project to start organizing tasks and collaborating with your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="My Awesome Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && projectName.trim()) {
                    handleCreateProject();
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Textarea
                id="project-description"
                placeholder="Describe what this project is about..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setProjectName('');
                setProjectDescription('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!projectName.trim() || createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmptyProjectState;
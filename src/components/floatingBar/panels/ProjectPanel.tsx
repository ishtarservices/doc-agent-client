// src/components/FloatingBottomBar/panels/ProjectPanelContent.tsx

import React, { useState } from "react";
import {
  Plus,
  Calendar,
  Users,
  Settings,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ContextualContent } from "../common/ContextualContent";
import { useCreateProject } from "@/hooks/useBoardData";
import { useOrganization } from "@/hooks/useOrganization";
import { useProjectSwitcher } from "@/hooks/useProjectSelection";
import { type ProjectData } from "@/types/api";

interface ProjectPanelContentProps {
  onClose: () => void;
  isLoading: boolean;
  currentProject?: ProjectData;
  projects: ProjectData[];
  onProjectSwitch: (projectId: string) => void;
}

export const ProjectPanelContent: React.FC<ProjectPanelContentProps> = ({
  onClose,
  isLoading,
  currentProject,
  projects,
  onProjectSwitch,
}) => {
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const { currentOrganization } = useOrganization();
  const { switchProject } = useProjectSwitcher();
  const createProjectMutation = useCreateProject();

  const handleProjectSelect = (projectId: string) => {
    if (projectId !== currentProject?._id) {
      // Use the proper project switcher that updates URL and triggers re-render
      switchProject(projectId);
      onProjectSwitch(projectId);
      onClose(); // Close the panel after switching
    }
  };

  const handleCreateProject = async () => {
    if (!currentOrganization?._id || !newProjectName.trim()) {
      return;
    }

    try {
      const newProject = await createProjectMutation.mutateAsync({
        organizationId: currentOrganization._id,
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
        visibility: "private",
        settings: {
          autoRunEnabled: false,
          aiModel: "claude-3-haiku",
          tokenBudget: 10000,
        },
      });

      // Navigate to the new project - this will trigger Board.tsx re-render
      switchProject(newProject._id);
      setNewProjectDialogOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const getProjectStatus = (project: ProjectData) => {
    if (project.isArchived)
      return { label: "Archived", variant: "secondary" as const };
    if (!project.isActive)
      return { label: "Inactive", variant: "destructive" as const };
    return { label: "Active", variant: "default" as const };
  };

  const formatMemberCount = (members: ProjectData["members"]) => {
    const count = members?.length || 0;
    return count;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  // Filter mock data for Board Filters
  const mockFilters = [
    { label: "All Tasks", count: 8, active: true },
    { label: "My Tasks", count: 8, active: false },
    { label: "High Priority", count: 6, active: false },
    { label: "Due This Week", count: 0, active: false },
  ];

  return (
    <div className="space-y-3 max-h-96 flex flex-col overflow-hidden">
      {/* Current Project - Compact Display */}
      {currentProject && (
        <div className="bg-primary/5 border border-primary/20 rounded-md p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Badge
                variant="default"
                className="text-xs px-1.5 py-0.5 shrink-0"
              >
                Current
              </Badge>
              <span className="font-medium text-sm truncate">
                {currentProject.name}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{formatMemberCount(currentProject.members)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(currentProject.createdAt)}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {getProjectStatus(currentProject).label}
            </Badge>
          </div>
        </div>
      )}

      {/* Board Filters - Collapsible */}
      <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-8">
            <span className="text-xs font-medium text-muted-foreground flex items-center">
              <Filter className="h-3 w-3 mr-1.5" />
              Board Filters
            </span>
            {filtersExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {mockFilters.map((filter) => (
            <Button
              key={filter.label}
              variant={filter.active ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-between h-7 px-2"
            >
              <span className="text-xs">{filter.label}</span>
              <Badge
                variant={filter.count === 0 ? "outline" : "secondary"}
                className="text-xs h-4 px-1.5"
              >
                {filter.count}
              </Badge>
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Project List - Collapsible with Scrollable Content */}
      <Collapsible open={projectsExpanded} onOpenChange={setProjectsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="flex-1 justify-between p-2 h-8">
              <span className="text-xs font-medium text-muted-foreground flex items-center">
                <BarChart3 className="h-3 w-3 mr-1.5" />
                All Projects ({projects.length})
              </span>
              {projectsExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
            <Dialog
              open={newProjectDialogOpen}
              onOpenChange={setNewProjectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs shrink-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new project in{" "}
                    {currentOrganization?.name || "your organization"}.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name *</Label>
                    <Input
                      id="project-name"
                      placeholder="Enter project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newProjectName.trim()) {
                          handleCreateProject();
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-description">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="project-description"
                      placeholder="Describe your project"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewProjectDialogOpen(false);
                      setNewProjectName("");
                      setNewProjectDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={
                      !newProjectName.trim() || createProjectMutation.isPending
                    }
                  >
                    {createProjectMutation.isPending
                      ? "Creating..."
                      : "Create Project"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex-1 min-h-0">
          <ScrollArea className="h-full max-h-40 w-full">
            <div className="space-y-1.5 pr-3">
              {projects.length === 0 ? (
                <div className="text-center py-4">
                  <BarChart3 className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mb-2">
                    No projects found
                  </p>
                  <Dialog
                    open={newProjectDialogOpen}
                    onOpenChange={setNewProjectDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create first project
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                projects.map((project) => {
                  const isCurrent = project._id === currentProject?._id;

                  return (
                    <div
                      key={project._id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                      }`}
                      onClick={() => handleProjectSelect(project._id)}
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="text-xs font-medium truncate">
                          {project.name}
                        </span>
                        {isCurrent && (
                          <Badge
                            variant="default"
                            className="text-xs px-1.5 py-0.5 shrink-0"
                          >
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {!project.isActive && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0.5"
                          >
                            Inactive
                          </Badge>
                        )}
                        {project.isArchived && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5"
                          >
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Quick Actions - Always Visible */}
      <div className="pt-2 border-t shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <Dialog
            open={newProjectDialogOpen}
            onOpenChange={setNewProjectDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                New Project
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

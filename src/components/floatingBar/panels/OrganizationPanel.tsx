import React from 'react';
import { ChevronDown, Users, Settings, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFloatingBarData } from '@/hooks/useFloatingBarData';
import { toast } from 'sonner';

interface OrganizationPanelProps {
  onClose: () => void;
  currentProjectId?: string;
}

export const OrganizationPanel: React.FC<OrganizationPanelProps> = ({
  onClose,
  currentProjectId
}) => {
  // Use the centralized data management hook
  const {
    organization: currentOrganization,
    projects,
    currentProject,
    isLoading,
    hasError,
    contextError,
    switchOrganization,
    switchProject,
    refreshData,
    members
  } = useFloatingBarData(currentProjectId);

  // For now, we only have the current organization from the API
  // In the future, when multiple orgs are supported, this would be an array from a separate API call
  const availableOrganizations = currentOrganization ? [
    {
      _id: currentOrganization._id,
      name: currentOrganization.name,
      description: currentOrganization.description,
      logo: currentOrganization.logo,
      members: currentOrganization.members?.length || 0,
      isActive: true
    }
  ] : [];

  const handleOrganizationSelect = async (orgId: string) => {
    if (orgId !== currentOrganization?._id) {
      try {
        await switchOrganization(orgId);
        toast.success('Organization switched successfully');
        onClose();
      } catch (error) {
        console.error('Failed to switch organization:', error);
        toast.error('Failed to switch organization');
      }
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    if (projectId !== currentProject?._id) {
      try {
        await switchProject(projectId);
        toast.success('Project switched successfully');
        onClose();
      } catch (error) {
        console.error('Failed to switch project:', error);
        toast.error('Failed to switch project');
      }
    }
  };

  const handleRefreshData = async () => {
    try {
      await refreshData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    }
  };

  // Show error state
  if (hasError && contextError) {
    return (
      <div className="w-80 p-4 bg-background border rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🏢 Organizations</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-destructive mb-4">
            Failed to load organization data: {contextError.message}
          </p>
          <Button onClick={handleRefreshData} size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 p-4 bg-background border rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🏢 Organizations</h3>
        <div className="flex items-center space-x-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {/* Current Organization Selector */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Current Organization
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-left h-auto p-3"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentOrganization?.logo} />
                    <AvatarFallback>
                      {currentOrganization?.name?.substring(0, 2).toUpperCase() || 'ORG'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      {currentOrganization?.name || 'Select Organization'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentOrganization?.description || 'No organization selected'}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {availableOrganizations.map((org) => (
                <DropdownMenuItem
                  key={org._id}
                  onClick={() => handleOrganizationSelect(org._id)}
                  className="p-3"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={org.logo} />
                      <AvatarFallback>
                        {org.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{org.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {org.members} member{org.members !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {org.isActive && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              {availableOrganizations.length === 0 && (
                <DropdownMenuItem disabled className="p-3">
                  <div className="text-sm text-muted-foreground">
                    {isLoading ? 'Loading organizations...' : 'No organizations available'}
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3" disabled>
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Organization</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Current Project Selector */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Current Project
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-left h-auto p-3"
                disabled={isLoading || !currentOrganization || projects.length === 0}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">
                    {currentProject?.name || 'Select Project'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentProject?.description || 'No project selected'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project._id}
                  onClick={() => handleProjectSelect(project._id)}
                  className="p-3"
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {project.description || 'No description'}
                      </div>
                    </div>
                    {project._id === currentProject?._id && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              {projects.length === 0 && (
                <DropdownMenuItem disabled className="p-3">
                  <div className="text-sm text-muted-foreground">
                    {isLoading ? 'Loading projects...' : 'No projects found'}
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3" disabled>
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Project</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Organization Stats */}
        {currentOrganization && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {members?.length || currentOrganization.members?.length || 0} Members
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleRefreshData}
                disabled={isLoading}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Projects:</span>
                <span className="ml-1 font-medium">{projects.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">AI Credits:</span>
                <span className="ml-1 font-medium">
                  {currentOrganization.settings?.aiCredits?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
            {currentOrganization.settings?.features && (
              <div className="pt-2 border-t border-muted">
                <div className="text-xs text-muted-foreground mb-1">Features:</div>
                <div className="flex flex-wrap gap-1">
                  {currentOrganization.settings.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs px-1 py-0">
                      {feature.replace('_', ' ')}
                    </Badge>
                  ))}
                  {currentOrganization.settings.features.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{currentOrganization.settings.features.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Project Context Info */}
        {currentProject && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Project Info</span>
              <Badge variant="secondary" className="text-xs">
                {currentProject.visibility}
              </Badge>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(currentProject.createdAt).toLocaleDateString()}</span>
              </div>
              {currentProject.settings && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Model:</span>
                  <span>{currentProject.settings.aiModel || 'Default'}</span>
                </div>
              )}
              {currentProject.settings?.tokenBudget && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Budget:</span>
                  <span>{currentProject.settings.tokenBudget.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Status */}
        <div className="text-xs text-muted-foreground text-center">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <span>Data last refreshed: {new Date().toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { ChevronDown, Plus, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useOrganization } from '@/hooks/useOrganization';
import { useCreateOrganization } from '@/hooks/useBoardData';
import type { OrganizationData } from '@/lib/api';

const OrganizationSelector = () => {
  const { currentOrganization, setCurrentOrganization, organizations, isLoading } = useOrganization();
  const createOrgMutation = useCreateOrganization();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');


  const handleOrganizationSelect = (org: OrganizationData) => {
    setCurrentOrganization(org);
  };

  const handleCreateOrganization = () => {
    if (!newOrgName.trim()) return;

    createOrgMutation.mutate(
      {
        name: newOrgName.trim(),
        slug: newOrgName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: '',
      },
      {
        onSuccess: (newOrg) => {
          setCurrentOrganization(newOrg);
          setIsCreateDialogOpen(false);
          setNewOrgName('');
        },
      }
    );
  };

  const displayText = currentOrganization?.name || 'Select Organization';
  const hasOrganizations = organizations.length > 0;

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="min-w-[160px]">
        <Building2 className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="min-w-[160px] justify-between bg-background border-border hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="truncate max-w-[120px]">{displayText}</span>
            </div>
            <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-background border-border" align="end">
          {hasOrganizations ? (
            <>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org._id}
                  onClick={() => handleOrganizationSelect(org)}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="truncate">{org.name}</span>
                    </div>
                    {currentOrganization?._id === org._id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : (
            <div className="px-2 py-2 text-sm text-muted-foreground">
              No organizations found
            </div>
          )}
          <DropdownMenuItem
            onClick={() => setIsCreateDialogOpen(true)}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage your projects and team members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter organization name"
                className="col-span-3 bg-background border-border"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateOrganization();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={!newOrgName.trim() || createOrgMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrganizationSelector;
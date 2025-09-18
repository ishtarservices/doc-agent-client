import { ChevronDown, Filter, Folder, Settings2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  // Mock data - in real app, this would come from context/state
  const currentOrg = { name: 'Personal', slug: 'personal' };
  const currentProject = { name: 'My First Project', id: '1' };

  const getContextualContent = () => {
    if (currentPath.startsWith('/board')) {
      return (
        <SidebarGroup>
          <SidebarGroupLabel>Board Filters</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Filter className="h-4 w-4" />
                  All Tasks
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Filter className="h-4 w-4" />
                  My Tasks
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      );
    }

    if (currentPath.startsWith('/docs')) {
      return (
        <SidebarGroup>
          <SidebarGroupLabel>Doc Mounts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Folder className="h-4 w-4" />
                  README.md
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Folder className="h-4 w-4" />
                  CONTEXT.md
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      );
    }

    return null;
  };

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent>
        {/* Organization & Project Switchers */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="space-y-2 p-2">
              {/* Organization Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left"
                    size="sm"
                  >
                    <span className="truncate">{currentOrg.name}</span>
                    {!isCollapsed && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>Personal</DropdownMenuItem>
                  <DropdownMenuItem>Work Team</DropdownMenuItem>
                  <DropdownMenuItem>+ New Organization</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Project Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left"
                    size="sm"
                  >
                    <span className="truncate">{currentProject.name}</span>
                    {!isCollapsed && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>My First Project</DropdownMenuItem>
                  <DropdownMenuItem>Documentation Hub</DropdownMenuItem>
                  <DropdownMenuItem>+ New Project</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Contextual Content */}
        {getContextualContent()}

        {/* Quick Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings2 className="h-4 w-4" />
                  {!isCollapsed && 'Settings'}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
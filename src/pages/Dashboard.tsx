import React from 'react';
import { Plus, Activity, FileText, Mail, BarChart3, Github, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import OrganizationSelector from '@/components/OrganizationSelector';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentOrganization, organizations, isLoading } = useOrganization();

  // Mock data
  const recentUpdates = [
    { id: 1, doc: 'README.md', type: 'Auto-update', time: '2 hours ago' },
    { id: 2, doc: 'CONTEXT.md', type: 'Manual edit', time: '5 hours ago' },
    { id: 3, doc: 'CHANGELOG.md', type: 'Token usage', time: '1 day ago' },
  ];

  const recentTasks = [
    { id: 1, title: 'Review legal documentation', status: 'in_progress', type: 'doc' },
    { id: 2, title: 'Setup email integration', status: 'ready', type: 'email' },
    { id: 3, title: 'Code review automation', status: 'done', type: 'code' },
  ];

  const usageData = [
    { period: 'Today', tokens: 1250 },
    { period: 'This Week', tokens: 8900 },
    { period: 'This Month', tokens: 32400 },
  ];

  // Show empty organization state if no organizations
  if (!isLoading && organizations.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Welcome to Your Workspace</CardTitle>
            <CardDescription>
              You need to create or join an organization to start managing projects and tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <OrganizationSelector />
            <div className="text-center text-sm text-muted-foreground">
              <p>Organizations help you collaborate with team members and manage multiple projects.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user?.email ? `, ${user.email}` : ''}! {currentOrganization ? `Organization: ${currentOrganization.name}` : 'Here\'s what\'s happening with your project.'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed"
        >
          <Github className="h-6 w-6" />
          <span>Connect GitHub</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed"
        >
          <FileText className="h-6 w-6" />
          <span>Add Doc Mount</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed"
        >
          <Plus className="h-6 w-6" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Doc Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Doc Updates
            </CardTitle>
            <CardDescription>
              Latest changes to your living documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUpdates.map((update) => (
              <div key={update.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{update.doc}</p>
                  <p className="text-sm text-muted-foreground">{update.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{update.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Tasks
            </CardTitle>
            <CardDescription>
              Your latest board activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {task.type}
                  </Badge>
                </div>
                <Badge 
                  variant={task.status === 'done' ? 'default' : 'secondary'}
                >
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Token Usage
            </CardTitle>
            <CardDescription>
              AI token consumption overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageData.map((usage) => (
              <div key={usage.period} className="flex items-center justify-between">
                <span className="font-medium">{usage.period}</span>
                <span className="text-muted-foreground">
                  {usage.tokens.toLocaleString()} tokens
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inbox (Stub) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Inbox
            </CardTitle>
            <CardDescription>
              Email integration coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <p>Email inbox will appear here once connected</p>
              <Button variant="outline" size="sm" className="mt-2">
                Setup Email Integration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
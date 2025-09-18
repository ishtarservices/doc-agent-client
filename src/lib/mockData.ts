// src/lib/mockData.ts

import type { 
  TaskData, 
  ColumnData, 
  ProjectContext, 
  AIResponse,
  OrganizationData,
  ProjectData,
  AgentData,
  CreateColumnRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateColumnRequest,
  CreateAgentRequest,
  UpdateAgentRequest,
  AssignAgentRequest,
  RunAgentRequest
} from '@/types/api';

// ============================================================================
// MOCK ORGANIZATIONS
// ============================================================================

export const mockOrganization: OrganizationData = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Startup Innovations Inc',
  slug: 'startup-innovations',
  description: 'Building the future of productivity tools',
  logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=64&h=64&fit=crop&crop=center',
  settings: {
    defaultColumns: ['backlog', 'ready', 'in_progress', 'done'],
    aiCredits: 50000,
    maxProjects: 10,
    features: ['ai_agents', 'auto_run', 'advanced_analytics', 'integrations']
  },
  members: [
    {
      userId: 'user_1',
      role: 'owner',
      joinedAt: new Date('2024-01-01T00:00:00Z'),
      permissions: ['*']
    },
    {
      userId: 'user_2',
      role: 'admin',
      joinedAt: new Date('2024-01-02T00:00:00Z'),
      permissions: ['manage_projects', 'manage_agents', 'manage_members']
    },
    {
      userId: 'user_3',
      role: 'member',
      joinedAt: new Date('2024-01-03T00:00:00Z'),
      permissions: ['create_tasks', 'edit_tasks', 'run_agents']
    }
  ],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-15T00:00:00Z'),
  isActive: true
};

// ============================================================================
// MOCK PROJECTS
// ============================================================================

export const mockProject: ProjectData = {
  _id: '507f1f77bcf86cd799439012',
  organizationId: mockOrganization._id,
  name: 'Doc Agent Board - MVP Launch',
  description: 'Task management and document collaboration platform with AI integration',
  settings: {
    autoRunEnabled: true,
    aiModel: 'claude-3-5-sonnet',
    tokenBudget: 10000
  },
  visibility: 'team',
  members: [
    {
      userId: 'user_1',
      role: 'owner',
      addedAt: new Date('2024-01-01T00:00:00Z')
    },
    {
      userId: 'user_2',
      role: 'editor',
      addedAt: new Date('2024-01-02T00:00:00Z')
    }
  ],
  createdBy: 'user_1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-15T00:00:00Z'),
  isActive: true,
  isArchived: false
};

// ============================================================================
// MOCK AGENTS
// ============================================================================

export const mockAgents: AgentData[] = [
  {
    _id: 'agent_code_reviewer',
    name: 'Code Reviewer',
    description: 'Reviews code for best practices, bugs, and improvements',
    type: 'code',
    logo: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=64&h=64&fit=crop&crop=center',
    model: 'claude-3-5-sonnet',
    systemPrompt: 'You are an expert code reviewer. Analyze the provided code for bugs, security issues, performance improvements, and adherence to best practices. Provide constructive feedback with specific suggestions.',
    settings: {
      maxTokens: 4000,
      temperature: 0.1,
      autoRun: true,
      retryAttempts: 2,
      timeout: 30
    },
    capabilities: ['code_review', 'bug_detection', 'security_analysis', 'performance_optimization'],
    organizationId: mockOrganization._id,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-10T00:00:00Z'),
    isActive: true,
    isPublic: false
  },
  {
    _id: 'agent_content_writer',
    name: 'Content Writer',
    description: 'Creates marketing content, documentation, and copy',
    type: 'doc',
    logo: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=64&h=64&fit=crop&crop=center',
    model: 'claude-3-5-sonnet',
    systemPrompt: 'You are a professional content writer. Create engaging, clear, and well-structured content based on the requirements. Focus on audience needs and business objectives.',
    settings: {
      maxTokens: 6000,
      temperature: 0.7,
      autoRun: false,
      retryAttempts: 1,
      timeout: 45
    },
    capabilities: ['content_creation', 'copywriting', 'documentation', 'seo_optimization'],
    organizationId: mockOrganization._id,
    createdBy: 'user_2',
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-12T00:00:00Z'),
    isActive: true,
    isPublic: true
  },
  {
    _id: 'agent_researcher',
    name: 'Market Researcher',
    description: 'Conducts market research and competitive analysis',
    type: 'research',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=center',
    model: 'claude-3-5-sonnet',
    systemPrompt: 'You are a market research analyst. Conduct thorough research on markets, competitors, trends, and opportunities. Provide data-driven insights and actionable recommendations.',
    settings: {
      maxTokens: 8000,
      temperature: 0.3,
      autoRun: false,
      retryAttempts: 3,
      timeout: 60
    },
    capabilities: ['market_analysis', 'competitor_research', 'trend_analysis', 'data_synthesis'],
    organizationId: mockOrganization._id,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-14T00:00:00Z'),
    isActive: true,
    isPublic: false
  },
  {
    _id: 'agent_email_automation',
    name: 'Email Automation Specialist',
    description: 'Creates email sequences and marketing automation',
    type: 'email',
    logo: 'https://images.unsplash.com/photo-1586297098062-5ac17bb3a408?w=64&h=64&fit=crop&crop=center',
    model: 'claude-3-haiku',
    systemPrompt: 'You are an email marketing specialist. Create effective email sequences, subject lines, and automation workflows that drive engagement and conversions.',
    settings: {
      maxTokens: 3000,
      temperature: 0.6,
      autoRun: true,
      retryAttempts: 2,
      timeout: 25
    },
    capabilities: ['email_sequences', 'automation_workflows', 'a_b_testing', 'personalization'],
    organizationId: mockOrganization._id,
    createdBy: 'user_2',
    createdAt: new Date('2024-01-04T00:00:00Z'),
    updatedAt: new Date('2024-01-16T00:00:00Z'),
    isActive: true,
    isPublic: true
  }
];

// ============================================================================
// MOCK TEAM MEMBERS
// ============================================================================

export const mockTeamMembers = [
  { 
    userId: 'user_1', 
    name: 'Alex Chen', 
    email: 'alex@startup.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    role: 'owner'
  },
  { 
    userId: 'user_2', 
    name: 'Sarah Wilson', 
    email: 'sarah@startup.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    role: 'editor'
  },
  { 
    userId: 'user_3', 
    name: 'Jordan Rivera', 
    email: 'jordan@startup.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    role: 'editor'
  },
  { 
    userId: 'user_4', 
    name: 'Morgan Taylor', 
    email: 'morgan@startup.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
    role: 'viewer'
  },
];

// ============================================================================
// MOCK COLUMNS
// ============================================================================

export const mockColumns: ColumnData[] = [
  {
    _id: 'col_backlog',
    projectId: mockProject._id,
    title: 'Backlog',
    name: 'backlog',
    description: 'Tasks waiting to be prioritized and planned',
    color: '#6b7280',
    position: 0,
    settings: {
      isCollapsed: false,
      isPinned: false,
      autoRun: false,
      taskLimit: 50
    },
    visibility: 'public',
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  {
    _id: 'col_ready',
    projectId: mockProject._id,
    title: 'Sprint Ready',
    name: 'ready',
    description: 'Tasks that are ready to be worked on',
    color: '#3b82f6',
    position: 1,
    settings: {
      isCollapsed: false,
      isPinned: false,
      autoRun: false,
      taskLimit: 20
    },
    visibility: 'public',
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  {
    _id: 'col_progress',
    projectId: mockProject._id,
    title: 'In Progress',
    name: 'in_progress',
    description: 'Tasks currently being worked on',
    color: '#f59e0b',
    position: 2,
    settings: {
      isCollapsed: false,
      isPinned: true,
      autoRun: true,
      autoRunAgent: 'agent_code_reviewer',
      taskLimit: 10
    },
    visibility: 'public',
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-15T14:30:00Z'),
  },
  {
    _id: 'col_done',
    projectId: mockProject._id,
    title: 'Done',
    name: 'done',
    description: 'Completed tasks',
    color: '#10b981',
    position: 3,
    settings: {
      isCollapsed: false,
      isPinned: false,
      autoRun: false,
      taskLimit: 100
    },
    visibility: 'public',
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
];

// ============================================================================
// MOCK TASKS
// ============================================================================

export const mockTasks: TaskData[] = [
  // Backlog tasks
  {
    _id: 'task_1',
    projectId: mockProject._id,
    columnId: 'col_backlog',
    title: 'Setup legal entity and compliance',
    description: 'Incorporate the company, setup banking, and ensure regulatory compliance for our SaaS platform',
    type: 'legal',
    status: 'backlog',
    priority: 'high',
    assignedAgent: undefined,
    agentHistory: [],
    tokenEstimate: 800,
    actualTokensUsed: 0,
    progressPercentage: 0,
    assignees: [{
      userId: 'user_1',
      name: 'Alex Chen',
      email: 'alex@startup.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      role: 'owner',
      assignedAt: new Date('2024-01-01T09:00:00Z'),
      initials: 'AC'
    }],
    tags: ['compliance', 'startup', 'legal', 'incorporation'],
    position: 0,
    dependencies: [],
    blockedBy: [],
    subtasks: [],
    dueDate: new Date('2024-02-01T00:00:00Z'),
    estimatedDuration: 16,
    timeSpent: 0,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T09:00:00Z'),
  },
  {
    _id: 'task_2',
    projectId: mockProject._id,
    columnId: 'col_backlog',
    title: 'Design system and component library',
    description: 'Create a comprehensive design system with reusable components for consistent UI/UX',
    type: 'design',
    status: 'backlog',
    priority: 'medium',
    assignedAgent: 'agent_content_writer',
    agentHistory: [{
      agentId: 'agent_content_writer',
      assignedAt: new Date('2024-01-01T09:30:00Z'),
      assignedBy: 'user_2'
    }],
    tokenEstimate: 1200,
    actualTokensUsed: 0,
    progressPercentage: 0,
    assignees: [{
      userId: 'user_2',
      name: 'Sarah Wilson',
      email: 'sarah@startup.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      role: 'owner',
      assignedAt: new Date('2024-01-01T09:30:00Z'),
      initials: 'SW'
    }],
    tags: ['design-system', 'ui', 'frontend', 'components'],
    position: 1,
    dependencies: [],
    blockedBy: [],
    subtasks: [],
    dueDate: new Date('2024-01-25T00:00:00Z'),
    estimatedDuration: 24,
    timeSpent: 2,
    createdBy: 'user_2',
    createdAt: new Date('2024-01-01T09:30:00Z'),
    updatedAt: new Date('2024-01-01T09:30:00Z'),
  },

  // Ready tasks
  {
    _id: 'task_5',
    projectId: mockProject._id,
    columnId: 'col_ready',
    title: 'Authentication system implementation',
    description: 'Implement secure user registration, login, password reset, and session management',
    type: 'code',
    status: 'ready',
    priority: 'high',
    assignedAgent: 'agent_code_reviewer',
    agentHistory: [{
      agentId: 'agent_code_reviewer',
      assignedAt: new Date('2024-01-01T11:00:00Z'),
      assignedBy: 'user_1'
    }],
    tokenEstimate: 1000,
    actualTokensUsed: 0,
    progressPercentage: 0,
    assignees: [{
      userId: 'user_1',
      name: 'Alex Chen',
      email: 'alex@startup.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      role: 'owner',
      assignedAt: new Date('2024-01-01T11:00:00Z'),
      initials: 'AC'
    }, {
      userId: 'user_4',
      name: 'Morgan Taylor',
      email: 'morgan@startup.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      role: 'assignee',
      assignedAt: new Date('2024-01-01T11:00:00Z'),
      initials: 'MT'
    }],
    tags: ['auth', 'backend', 'security', 'supabase'],
    position: 0,
    dependencies: [],
    blockedBy: [],
    subtasks: [],
    dueDate: new Date('2024-01-20T00:00:00Z'),
    estimatedDuration: 20,
    timeSpent: 0,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T11:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z'),
  },
  {
    _id: 'task_6',
    projectId: mockProject._id,
    columnId: 'col_ready',
    title: 'Database schema design and migration',
    description: 'Design the complete database schema for users, projects, tasks, and permissions',
    type: 'code',
    status: 'ready',
    priority: 'high',
    assignedAgent: 'agent_code_reviewer',
    agentHistory: [{
      agentId: 'agent_code_reviewer',
      assignedAt: new Date('2024-01-01T11:30:00Z'),
      assignedBy: 'user_1'
    }],
    tokenEstimate: 800,
    actualTokensUsed: 0,
    progressPercentage: 0,
    assignees: [{
      userId: 'user_4',
      name: 'Morgan Taylor',
      email: 'morgan@startup.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      role: 'owner',
      assignedAt: new Date('2024-01-01T11:30:00Z'),
      initials: 'MT'
    }],
    tags: ['database', 'backend', 'schema', 'migration'],
    position: 1,
    dependencies: [],
    blockedBy: [],
    subtasks: [],
    dueDate: new Date('2024-01-18T00:00:00Z'),
    estimatedDuration: 16,
    timeSpent: 4,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T11:30:00Z'),
    updatedAt: new Date('2024-01-01T11:30:00Z'),
  },

  // In Progress tasks
  {
    _id: 'task_7',
    projectId: mockProject._id,
    columnId: 'col_progress',
    title: 'React dashboard and board components',
    description: 'Build the main dashboard interface with kanban board functionality',
    type: 'code',
    status: 'in_progress',
    priority: 'high',
    assignedAgent: 'agent_code_reviewer',
    agentHistory: [{
      agentId: 'agent_code_reviewer',
      assignedAt: new Date('2024-01-01T12:00:00Z'),
      assignedBy: 'user_2',
      result: {
        success: true,
        output: 'Code review completed. Found 3 minor issues and 2 optimization opportunities. Overall structure is solid.',
        tokensUsed: 1250,
        executedAt: new Date('2024-01-01T14:30:00Z')
      }
    }],
    tokenEstimate: 1500,
    actualTokensUsed: 1250,
    progressPercentage: 75,
    assignees: [{
      userId: 'user_2',
      name: 'Sarah Wilson',
      email: 'sarah@startup.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      role: 'owner',
      assignedAt: new Date('2024-01-01T12:00:00Z'),
      initials: 'SW'
    }, {
      userId: 'user_3',
      name: 'Jordan Rivera',
      email: 'jordan@startup.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      role: 'assignee',
      assignedAt: new Date('2024-01-01T12:00:00Z'),
      initials: 'JR'
    }],
    tags: ['react', 'frontend', 'dashboard', 'kanban'],
    position: 0,
    dependencies: ['task_5'],
    blockedBy: [],
    subtasks: ['task_7_1', 'task_7_2'],
    dueDate: new Date('2024-01-18T00:00:00Z'),
    estimatedDuration: 30,
    timeSpent: 24,
    createdBy: 'user_2',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-01T14:00:00Z'),
    lastAgentRun: new Date('2024-01-01T14:30:00Z'),
    isUpdating: false,
  },
  {
    _id: 'task_8',
    projectId: mockProject._id,
    columnId: 'col_progress',
    title: 'Express API with Claude AI integration',
    description: 'Create REST API endpoints with AI assistant functionality for task management',
    type: 'code',
    status: 'in_progress',
    priority: 'high',
    assignedAgent: 'agent_code_reviewer',
    agentHistory: [{
      agentId: 'agent_code_reviewer',
      assignedAt: new Date('2024-01-01T12:30:00Z'),
      assignedBy: 'user_1'
    }],
    tokenEstimate: 900,
    actualTokensUsed: 350,
    progressPercentage: 40,
    assignees: [{
      userId: 'user_1',
      name: 'Alex Chen',
      email: 'alex@startup.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      role: 'owner',
      assignedAt: new Date('2024-01-01T12:30:00Z'),
      initials: 'AC'
    }],
    tags: ['api', 'backend', 'express', 'ai', 'claude'],
    position: 1,
    dependencies: ['task_6'],
    blockedBy: [],
    subtasks: [],
    dueDate: new Date('2024-01-22T00:00:00Z'),
    estimatedDuration: 18,
    timeSpent: 8,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T12:30:00Z'),
    updatedAt: new Date('2024-01-01T15:00:00Z'),
    lastAgentRun: new Date('2024-01-01T13:00:00Z'),
  },

  // Done tasks
  {
    _id: 'task_9',
    projectId: mockProject._id,
    columnId: 'col_done',
    title: 'Project setup and configuration',
    description: 'Initialize React project with TypeScript, Vite, Tailwind, and essential dependencies',
    type: 'code',
    status: 'done',
    priority: 'high',
    assignedAgent: 'agent_code_reviewer',
    agentHistory: [{
      agentId: 'agent_code_reviewer',
      assignedAt: new Date('2024-01-01T08:00:00Z'),
      assignedBy: 'user_1',
      result: {
        success: true,
        output: 'Project setup looks excellent. All configurations are properly set up following best practices.',
        tokensUsed: 450,
        executedAt: new Date('2024-01-01T08:30:00Z')
      }
    }],
    tokenEstimate: 400,
    actualTokensUsed: 450,
    progressPercentage: 100,
    assignees: [{
      userId: 'user_4',
      name: 'Morgan Taylor',
      email: 'morgan@startup.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      role: 'owner',
      assignedAt: new Date('2024-01-01T08:00:00Z'),
      initials: 'MT'
    }],
    tags: ['setup', 'config', 'vite', 'typescript'],
    position: 0,
    dependencies: [],
    blockedBy: [],
    subtasks: [],
    dueDate: new Date('2024-01-01T00:00:00Z'),
    estimatedDuration: 8,
    timeSpent: 6,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T08:00:00Z'),
    updatedAt: new Date('2024-01-01T09:00:00Z'),
    lastAgentRun: new Date('2024-01-01T08:30:00Z'),
    completedAt: new Date('2024-01-01T09:00:00Z'),
  },
  {
    _id: 'task_10',
    projectId: mockProject._id,
    columnId: 'col_done',
    title: 'AWS infrastructure provisioning',
    description: 'Setup AWS services including EC2, RDS, S3, and CloudFront for production deployment',
    type: 'infra',
    status: 'done',
    priority: 'medium',
    assignedAgent: 'agent_researcher',
    agentHistory: [{
      agentId: 'agent_researcher',
      assignedAt: new Date('2024-01-01T07:00:00Z'),
      assignedBy: 'user_1',
      result: {
        success: true,
        output: 'Infrastructure setup completed successfully. All services are configured and ready for production.',
        tokensUsed: 650,
        executedAt: new Date('2024-01-01T11:30:00Z')
      }
    }],
    tokenEstimate: 700,
    actualTokensUsed: 650,
    progressPercentage: 100,
    assignees: [{
      userId: 'user_1',
      name: 'Alex Chen',
      email: 'alex@startup.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      role: 'owner',
      assignedAt: new Date('2024-01-01T07:00:00Z'),
      initials: 'AC'
    }, {
      userId: 'user_4',
      name: 'Morgan Taylor',
      email: 'morgan@startup.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      role: 'reviewer',
      assignedAt: new Date('2024-01-01T07:00:00Z'),
      initials: 'MT'
    }],
    tags: ['aws', 'infrastructure', 'deployment', 'devops'],
    position: 1,
    dependencies: [],
    blockedBy: [],
    subtasks: [],
    dueDate: new Date('2024-01-05T00:00:00Z'),
    estimatedDuration: 14,
    timeSpent: 12,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-01T07:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z'),
    lastAgentRun: new Date('2024-01-01T11:30:00Z'),
    completedAt: new Date('2024-01-01T12:00:00Z'),
  },
];

// ============================================================================
// MOCK PROJECT CONTEXT
// ============================================================================

export const mockProjectContext: ProjectContext = {
  organization: mockOrganization,
  project: mockProject,
  tasks: mockTasks,
  columns: mockColumns,
  agents: mockAgents,
  members: mockTeamMembers,
};

// ============================================================================
// ENHANCED MOCK API
// ============================================================================

export const mockAPI = {
  // Organization Operations
  async getOrganization(organizationId: string): Promise<OrganizationData> {
    console.log(`[MOCK] Fetching organization: ${organizationId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...mockOrganization };
  },

  // Project Operations
  async getCurrentProjectContext(projectId?: string): Promise<ProjectContext> {
    console.log(`[MOCK] Fetching project context for: ${projectId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      organization: { ...mockOrganization },
      project: { ...mockProject },
      tasks: [...mockTasks],
      columns: [...mockColumns],
      agents: [...mockAgents],
      members: [...mockTeamMembers],
    };
  },

  // Agent Operations
  async getAgents(organizationId: string): Promise<AgentData[]> {
    console.log(`[MOCK] Fetching agents for organization: ${organizationId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockAgents];
  },

  async createAgent(data: CreateAgentRequest): Promise<AgentData> {
    console.log('[MOCK] Creating agent:', data);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newAgent: AgentData = {
      _id: `agent_${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      logo: data.logo,
      model: data.model,
      systemPrompt: data.systemPrompt,
      settings: {
        maxTokens: 4000,
        temperature: 0.3,
        autoRun: false,
        retryAttempts: 2,
        timeout: 30,
        ...data.settings
      },
      capabilities: data.capabilities || [],
      organizationId: data.organizationId,
      createdBy: 'user_1',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isPublic: data.isPublic || false
    };
    
    mockAgents.push(newAgent);
    return newAgent;
  },

  async updateAgent(agentId: string, updates: UpdateAgentRequest): Promise<AgentData> {
    console.log('[MOCK] Updating agent:', agentId, updates);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const agentIndex = mockAgents.findIndex(a => a._id === agentId);
    if (agentIndex === -1) throw new Error('Agent not found');
    
    mockAgents[agentIndex] = {
      ...mockAgents[agentIndex],
      ...updates,
      settings: {
        ...mockAgents[agentIndex].settings,
        ...updates.settings
      },
      updatedAt: new Date(),
    };
    
    return mockAgents[agentIndex];
  },

  async deleteAgent(agentId: string): Promise<void> {
    console.log('[MOCK] Deleting agent:', agentId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const agentIndex = mockAgents.findIndex(a => a._id === agentId);
    if (agentIndex === -1) throw new Error('Agent not found');
    
    mockAgents.splice(agentIndex, 1);
  },

  // Column Operations
  async createColumn(data: CreateColumnRequest): Promise<ColumnData> {
    console.log('[MOCK] Creating column:', data);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newColumn: ColumnData = {
      _id: `col_${Date.now()}`,
      projectId: data.projectId,
      title: data.title,
      name: data.name,
      description: data.description,
      color: data.color || '#6b7280',
      position: data.position || mockColumns.length,
      settings: {
        isCollapsed: false,
        isPinned: false,
        autoRun: false,
        taskLimit: 50,
        ...data.settings
      },
      visibility: data.visibility || 'public',
      createdBy: 'user_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockColumns.push(newColumn);
    return newColumn;
  },

  async updateColumn(columnId: string, updates: UpdateColumnRequest): Promise<ColumnData> {
    console.log('[MOCK] Updating column:', columnId, updates);
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const columnIndex = mockColumns.findIndex(c => c._id === columnId);
    if (columnIndex === -1) throw new Error('Column not found');
    
    mockColumns[columnIndex] = {
      ...mockColumns[columnIndex],
      ...updates,
      settings: {
        ...mockColumns[columnIndex].settings,
        ...updates.settings
      },
      updatedAt: new Date(),
    };
    
    return mockColumns[columnIndex];
  },

  async deleteColumn(columnId: string): Promise<void> {
    console.log('[MOCK] Deleting column:', columnId);
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const columnIndex = mockColumns.findIndex(c => c._id === columnId);
    if (columnIndex === -1) throw new Error('Column not found');
    
    // Remove tasks in this column
    const tasksToRemove = mockTasks.filter(t => t.columnId === columnId);
    tasksToRemove.forEach(task => {
      const taskIndex = mockTasks.findIndex(t => t._id === task._id);
      if (taskIndex !== -1) mockTasks.splice(taskIndex, 1);
    });
    
    mockColumns.splice(columnIndex, 1);
  },

  // Task Operations
  async createTask(data: CreateTaskRequest): Promise<TaskData> {
    console.log('[MOCK] Creating task:', data);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newTask: TaskData = {
      _id: `task_${Date.now()}`,
      projectId: data.projectId,
      columnId: data.columnId,
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status || 'backlog',
      priority: data.priority || 'medium',
      assignedAgent: data.assignedAgent,
      agentHistory: data.assignedAgent ? [{
        agentId: data.assignedAgent,
        assignedAt: new Date(),
        assignedBy: 'user_1'
      }] : [],
      tokenEstimate: data.tokenEstimate || 500,
      actualTokensUsed: 0,
      progressPercentage: 0,
      assignees: data.assignees?.map(a => ({
        ...a,
        name: mockTeamMembers.find(m => m.userId === a.userId)?.name || 'Unknown',
        email: mockTeamMembers.find(m => m.userId === a.userId)?.email || 'unknown@email.com',
        avatar: mockTeamMembers.find(m => m.userId === a.userId)?.avatar,
        initials: (mockTeamMembers.find(m => m.userId === a.userId)?.name || 'Unknown').split(' ').map(n => n[0]).join('').toUpperCase(),
        assignedAt: new Date()
      })) || [],
      tags: data.tags || [],
      position: mockTasks.filter(t => t.columnId === data.columnId).length,
      dependencies: data.dependencies || [],
      blockedBy: [],
      subtasks: data.parentTask ? [] : [],
      parentTask: data.parentTask,
      dueDate: data.dueDate,
      estimatedDuration: data.estimatedDuration,
      timeSpent: 0,
      createdBy: 'user_1',
      createdAt: new Date(),
      updatedAt: new Date(),
      isNew: true,
    };
    
    mockTasks.push(newTask);
    return newTask;
  },

  async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<TaskData> {
    console.log('[MOCK] Updating task:', taskId, updates);
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const taskIndex = mockTasks.findIndex(t => t._id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');
    
    // Handle agent assignment change
    if (updates.assignedAgent && updates.assignedAgent !== mockTasks[taskIndex].assignedAgent) {
      mockTasks[taskIndex].agentHistory.push({
        agentId: updates.assignedAgent,
        assignedAt: new Date(),
        assignedBy: 'user_1'
      });
    }

    // Handle assignees updates - ensure they have all required fields
    const updatedAssignees = updates.assignees ? updates.assignees.map(assignee => ({
      ...assignee,
      name: mockTeamMembers.find(m => m.userId === assignee.userId)?.name || 'Unknown',
      email: mockTeamMembers.find(m => m.userId === assignee.userId)?.email || 'unknown@email.com',
      avatar: mockTeamMembers.find(m => m.userId === assignee.userId)?.avatar,
      initials: (mockTeamMembers.find(m => m.userId === assignee.userId)?.name || 'Unknown').split(' ').map(n => n[0]).join('').toUpperCase(),
      assignedAt: new Date()
    })) : mockTasks[taskIndex].assignees;

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      assignees: updatedAssignees,
      updatedAt: new Date(),
    };
    
    return mockTasks[taskIndex];
  },

  async deleteTask(taskId: string): Promise<void> {
    console.log('[MOCK] Deleting task:', taskId);
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const taskIndex = mockTasks.findIndex(t => t._id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');
    
    mockTasks.splice(taskIndex, 1);
  },

  async moveTask(taskId: string, newColumnId: string, newPosition?: number): Promise<TaskData> {
    console.log('[MOCK] Moving task:', taskId, 'to column:', newColumnId);
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const taskIndex = mockTasks.findIndex(t => t._id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');
    
    const column = mockColumns.find(c => c._id === newColumnId);
    if (!column) throw new Error('Column not found');
    
    // Update task status based on column name
    const statusMap: Record<string, TaskData['status']> = {
      'backlog': 'backlog',
      'ready': 'ready',
      'in_progress': 'in_progress',
      'done': 'done'
    };
    const newStatus = statusMap[column.name?.toLowerCase() || ''] || 'backlog';
    
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      columnId: newColumnId,
      status: newStatus,
      position: newPosition,
      updatedAt: new Date(),
    };
    
    // Auto-run agent if column has auto-run enabled
    if (column.settings.autoRun && column.settings.autoRunAgent) {
      console.log('[MOCK] Auto-running agent due to column auto-run setting');
      setTimeout(() => {
        this.runAgent({
          taskId: taskId,
          agentId: column.settings.autoRunAgent
        });
      }, 1000);
    }
    
    return mockTasks[taskIndex];
  },

  // Agent Execution Operations
  async assignAgent(request: AssignAgentRequest): Promise<TaskData> {
    console.log('[MOCK] Assigning agent to task:', request);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const taskIndex = mockTasks.findIndex(t => t._id === request.taskId);
    if (taskIndex === -1) throw new Error('Task not found');
    
    const agent = mockAgents.find(a => a._id === request.agentId);
    if (!agent) throw new Error('Agent not found');
    
    // Add to agent history
    mockTasks[taskIndex].agentHistory.push({
      agentId: request.agentId,
      assignedAt: new Date(),
      assignedBy: 'user_1'
    });
    
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      assignedAgent: request.agentId,
      updatedAt: new Date(),
    };
    
    // Auto-run if requested
    if (request.autoRun) {
      setTimeout(() => {
        this.runAgent({
          taskId: request.taskId,
          agentId: request.agentId
        });
      }, 500);
    }
    
    return mockTasks[taskIndex];
  },

  async runAgent(request: RunAgentRequest): Promise<TaskData> {
    console.log('[MOCK] Running agent for task:', request);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate agent execution time
    
    const taskIndex = mockTasks.findIndex(t => t._id === request.taskId);
    if (taskIndex === -1) throw new Error('Task not found');
    
    const task = mockTasks[taskIndex];
    const agentId = request.agentId || task.assignedAgent;
    if (!agentId) throw new Error('No agent assigned to task');
    
    const agent = mockAgents.find(a => a._id === agentId);
    if (!agent) throw new Error('Agent not found');
    
    // Simulate agent execution
    const mockResults = [
      'Analysis completed successfully. Found several optimization opportunities.',
      'Code review finished. No critical issues found, minor improvements suggested.',
      'Content created and ready for review. SEO optimization included.',
      'Research completed with comprehensive market analysis and recommendations.',
      'Email sequence drafted with A/B testing suggestions.'
    ];
    
    const tokensUsed = Math.floor(Math.random() * 1000) + 500;
    const success = Math.random() > 0.1; // 90% success rate
    
    // Update agent history with result
    const historyIndex = task.agentHistory.findIndex(h => h.agentId === agentId && !h.result);
    if (historyIndex !== -1) {
      task.agentHistory[historyIndex].result = {
        success,
        output: success ? mockResults[Math.floor(Math.random() * mockResults.length)] : 'Agent execution failed due to timeout',
        tokensUsed: success ? tokensUsed : 0,
        executedAt: new Date(),
        error: success ? undefined : 'Execution timeout'
      };
    }
    
    mockTasks[taskIndex] = {
      ...task,
      actualTokensUsed: task.actualTokensUsed + (success ? tokensUsed : 0),
      progressPercentage: Math.min(task.progressPercentage + (success ? 25 : 0), 100),
      lastAgentRun: new Date(),
      updatedAt: new Date(),
    };
    
    return mockTasks[taskIndex];
  },

  // AI Assistant
  async callAIAssistant(request: { input: string; projectId?: string; [key: string]: unknown }): Promise<AIResponse> {
    console.log('[MOCK] AI Assistant called with:', request.input);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const input = request.input.toLowerCase();
    const tokensUsed = Math.floor(Math.random() * 500) + 200;
    
    if (input.includes('create') && input.includes('task')) {
      const newTask = await this.createTask({
        projectId: request.projectId || mockProject._id,
        columnId: 'col_backlog',
        title: 'AI Generated Task',
        description: 'This task was created by the AI assistant based on your request',
        type: 'doc',
        status: 'backlog',
        priority: 'medium',
        tokenEstimate: 400,
        tags: ['ai-generated']
      });

      return {
        type: 'task_creation',
        message: 'I created a new task for you based on your request.',
        createdTasks: [newTask],
        tokensUsed,
        executionTime: 1000,
        suggestions: ['Consider adding more details to the task description', 'You might want to assign an agent to this task']
      };
    }
    
    if (input.includes('assign') && input.includes('agent')) {
      return {
        type: 'agent_assignment',
        message: 'I can help you assign agents to your tasks. Which task would you like to assign an agent to?',
        tokensUsed,
        executionTime: 800,
        suggestions: ['Use the "Code Reviewer" agent for development tasks', 'The "Content Writer" agent is great for documentation']
      };
    }
    
    return {
      type: 'general_answer',
      message: 'This is a mock AI response. The backend is not connected yet, but I can help you with task management, agent assignment, and project organization once it\'s ready!',
      tokensUsed,
      executionTime: 600,
      suggestions: ['Try asking me to create a task', 'Ask about assigning agents to tasks']
    };
  },
};
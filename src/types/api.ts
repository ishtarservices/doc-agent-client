// src/types/api.ts

// ============================================================================
// CORE ENTITY INTERFACES
// ============================================================================

export interface OrganizationData {
  _id: string; // MongoDB ObjectId
  name: string;
  slug: string; // URL-friendly identifier
  description?: string;
  logo?: string; // URL to organization logo
  settings: {
    defaultColumns: string[]; // Default column structure for new projects
    aiCredits: number; // Available AI credits
    maxProjects: number;
    features: string[]; // Enabled features
  };
  members: Array<{
    userId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: Date;
    permissions: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ProjectData {
  _id: string; // MongoDB ObjectId
  organizationId: string; // Reference to organization
  name: string;
  description?: string;
  settings: {
    autoRunEnabled: boolean; // Global auto-run setting
    aiModel: string; // Default AI model for the project
    tokenBudget: number; // Token budget for AI operations
  };
  visibility: 'public' | 'private' | 'team';
  members: Array<{
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    addedAt: Date;
  }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isArchived: boolean;
}

export interface AgentData {
  _id: string; // MongoDB ObjectId
  name: string;
  description: string;
  type: 'email' | 'doc' | 'code' | 'research' | 'design' | 'legal' | 'finance' | 'bug' | 'test' | 'infra' | 'outreach' | 'custom';
  logo?: string; // URL to agent logo/avatar
  model: string; // AI model to use (claude-3-5-sonnet, gpt-4, etc.)
  systemPrompt: string; // Instructions for the AI agent
  settings: {
    maxTokens: number;
    temperature: number;
    autoRun: boolean; // Whether this agent runs automatically
    retryAttempts: number;
    timeout: number; // Timeout in seconds
  };
  capabilities: string[]; // What this agent can do
  organizationId: string; // Reference to organization
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isPublic: boolean; // Whether other orgs can use this agent
}

export interface ColumnData {
  _id: string; // MongoDB ObjectId
  projectId: string; // Reference to project
  title: string;
  name: string; // Slug/identifier
  description?: string;
  color: string;
  position: number;
  settings: {
    isCollapsed: boolean;
    isPinned: boolean;
    autoRun: boolean; // Auto-run all tasks in this column
    autoRunAgent?: string; // Default agent for auto-run
    taskLimit?: number; // Max tasks allowed in column
  };
  visibility: 'public' | 'private' | 'team';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskData {
  _id: string; // MongoDB ObjectId
  projectId: string; // Reference to project
  columnId: string; // Reference to column
  title: string;
  description?: string;
  type: 'email' | 'doc' | 'code' | 'research' | 'design' | 'legal' | 'finance' | 'bug' | 'test' | 'infra' | 'outreach' | 'custom';
  status: 'backlog' | 'ready' | 'in_progress' | 'done' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // AI Agent Assignment
  assignedAgent?: string; // Reference to AgentData._id
  agentHistory: Array<{
    agentId: string;
    assignedAt: Date;
    assignedBy: string;
    result?: {
      success: boolean;
      output?: string;
      tokensUsed: number;
      executedAt: Date;
      error?: string;
    };
  }>;
  
  // Estimation and Progress
  tokenEstimate: number;
  actualTokensUsed: number;
  progressPercentage: number; // 0-100
  
  // Assignment and Collaboration
  assignees: Array<{
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'assignee' | 'reviewer';
    assignedAt: Date;
    initials: string;
  }>;
  
  // Organization and Metadata
  tags: string[];
  position: number;
  
  // Dependencies and Relationships
  dependencies: string[]; // Task IDs this task depends on
  blockedBy: string[]; // Task IDs blocking this task
  subtasks: string[]; // Subtask IDs
  parentTask?: string; // Parent task ID if this is a subtask
  
  // Timing
  dueDate?: Date;
  estimatedDuration?: number; // Hours
  timeSpent: number; // Actual hours spent
  
  // Lifecycle
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastAgentRun?: Date;
  completedAt?: Date;
  
  // UI State (not stored in DB)
  isUpdating?: boolean;
  isNew?: boolean;
  isSelected?: boolean;
}

// ============================================================================
// CONTEXT AND RESPONSE INTERFACES
// ============================================================================

export interface ProjectContext {
  organization: OrganizationData;
  project: ProjectData;
  tasks: TaskData[];
  columns: ColumnData[];
  agents: AgentData[];
  members: Array<{
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  }>;
}

export interface AIRequest {
  input: string;
  projectId: string;
  organizationId: string;
  agentId?: string; // Specific agent to use
  context: {
    currentTasks: TaskData[];
    currentColumns: ColumnData[];
    availableAgents: AgentData[];
  };
  options?: {
    autoAssignAgent: boolean;
    createInColumn?: string;
    maxTokens?: number;
  };
}

export interface AIResponse {
  type: 'general_answer' | 'task_creation' | 'task_management' | 'agent_assignment' | 'error';
  message: string;
  
  // Creation Results
  createdTasks?: TaskData[];
  createdColumns?: ColumnData[];
  createdAgents?: AgentData[];
  
  // Modification Results
  updatedTasks?: TaskData[];
  updatedColumns?: ColumnData[];
  
  // Agent Execution Results
  agentResults?: Array<{
    taskId: string;
    agentId: string;
    success: boolean;
    output?: string;
    tokensUsed: number;
    error?: string;
  }>;
  
  // Metadata
  tokensUsed: number;
  executionTime: number;
  suggestions?: string[];
}

// ============================================================================
// API REQUEST/RESPONSE INTERFACES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    totalCount?: number;
    page?: number;
    limit?: number;
    tokensUsed?: number;
  };
}

// Organization Operations
export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  logo?: string;
  settings?: Partial<OrganizationData['settings']>;
}

// Project Operations
export interface CreateProjectRequest {
  organizationId: string;
  name: string;
  description?: string;
  visibility?: ProjectData['visibility'];
  settings?: Partial<ProjectData['settings']>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  visibility?: ProjectData['visibility'];
  settings?: Partial<ProjectData['settings']>;
  isArchived?: boolean;
}

// Agent Operations
export interface CreateAgentRequest {
  organizationId: string;
  name: string;
  description: string;
  type: AgentData['type'];
  logo?: string;
  model: string;
  systemPrompt: string;
  settings?: Partial<AgentData['settings']>;
  capabilities?: string[];
  isPublic?: boolean;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  logo?: string;
  model?: string;
  systemPrompt?: string;
  settings?: Partial<AgentData['settings']>;
  capabilities?: string[];
  isActive?: boolean;
  isPublic?: boolean;
}

// Column Operations
export interface CreateColumnRequest {
  projectId: string;
  title: string;
  name: string;
  description?: string;
  color?: string;
  position?: number;
  settings?: Partial<ColumnData['settings']>;
  visibility?: ColumnData['visibility'];
}

export interface UpdateColumnRequest {
  title?: string;
  name?: string;
  description?: string;
  color?: string;
  position?: number;
  settings?: Partial<ColumnData['settings']>;
  visibility?: ColumnData['visibility'];
}

// Task Operations
export interface CreateTaskRequest {
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  type: TaskData['type'];
  status?: TaskData['status'];
  priority?: TaskData['priority'];
  tokenEstimate?: number;
  assignedAgent?: string;
  assignees?: Array<{
    userId: string;
    role: 'owner' | 'assignee' | 'reviewer';
  }>;
  tags?: string[];
  dueDate?: Date;
  estimatedDuration?: number;
  dependencies?: string[];
  parentTask?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: TaskData['type'];
  status?: TaskData['status'];
  priority?: TaskData['priority'];
  columnId?: string;
  tokenEstimate?: number;
  assignedAgent?: string;
  assignees?: Array<{
    userId: string;
    role: 'owner' | 'assignee' | 'reviewer';
  }>;
  tags?: string[];
  position?: number;
  dueDate?: Date;
  estimatedDuration?: number;
  timeSpent?: number;
  progressPercentage?: number;
  dependencies?: string[];
  blockedBy?: string[];
}

export interface MoveTaskRequest {
  columnId: string;
  position?: number;
}

export interface AssignAgentRequest {
  taskId: string;
  agentId: string;
  autoRun?: boolean;
}

export interface RunAgentRequest {
  taskId: string;
  agentId?: string; // If not provided, uses task's assigned agent
  options?: {
    maxTokens?: number;
    temperature?: number;
  };
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Legacy interfaces for backward compatibility
export type Task = TaskData;
export type ColumnConfig = ColumnData;
export type Agent = AgentData;
export type Organization = OrganizationData;
export type Project = ProjectData;

// Legacy field mappings for gradual migration
export interface LegacyTaskData extends Omit<TaskData, '_id' | 'projectId' | 'columnId' | 'createdBy'> {
  id: string; // Maps to _id
  project_id?: string; // Maps to projectId
  created_by?: string; // Maps to createdBy
  token_estimate?: number; // Maps to tokenEstimate
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type EntityStatus = 'active' | 'inactive' | 'archived' | 'deleted';
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type TaskStatus = TaskData['status'];
export type TaskType = TaskData['type'];
export type TaskPriority = TaskData['priority'];
export type ColumnVisibility = ColumnData['visibility'];
export type AIModelType = 'claude-3-5-sonnet' | 'claude-3-haiku' | 'gpt-4' | 'gpt-3.5-turbo';

// Query and Filter Types
export interface TaskFilters {
  status?: TaskStatus[];
  type?: TaskType[];
  priority?: TaskPriority[];
  assignedAgent?: string[];
  assignees?: string[];
  tags?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  createdAt?: {
    from?: Date;
    to?: Date;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
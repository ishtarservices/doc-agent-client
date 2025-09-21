// src/lib/api.ts

import { supabase } from '@/integrations/supabase/client';
import { mockAPI } from './mockData';
import type {
  TaskData,
  ColumnData,
  ProjectContext,
  OrganizationData,
  ProjectData,
  AgentData,
  ApiResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateAgentRequest,
  UpdateAgentRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignAgentRequest,
  RunAgentRequest,
  AvailableAgent,
  AvailableAgentsResponse,
  AgentExecutionResult,
  AssignAgentsRequest
} from '@/types/api';
import type { AIRequest, AIResponse } from '@/types/ai';

// Configuration - Toggle between mock and real API
const USE_MOCK_DATA = false; // Set to false when backend is ready
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Get authentication headers for API requests
 * For development: skip authentication when using mock data
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  if (USE_MOCK_DATA) {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Real authentication for production
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('🔑 [API] Authentication failed:', sessionError?.message || 'No session');
    throw new Error('Authentication required');
  }

  const headers = {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };


  return headers;
}

/**
 * Make authenticated request to Express server
 */
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const requestId = Math.random().toString(36).substring(2, 15);
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  //   bodyPreview: options.body ? options.body.toString().substring(0, 100) + '...' : null,
  // });

  try {
    const headers = await getAuthHeaders();

    const finalHeaders = {
      ...headers,
      ...options.headers,
    };

    const response = await fetch(fullUrl, {
      ...options,
      headers: finalHeaders,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: `Failed to parse error response: ${parseError}` };
      }

      console.error(`🌐 [API-${requestId}] HTTP Error:`, {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      console.error(`🌐 [API-${requestId}] API Error:`, result.message || result.error);
      throw new Error(result.message || result.error || 'Request failed');
    }

    // console.log(`🌐 [API-${requestId}] Request successful`);
    return result.data as T;
  } catch (error) {
    console.error(`🌐 [API-${requestId}] Request failed:`, {
      endpoint,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Enhanced error handling for 403s
    if (error instanceof Error && error.message.includes('403')) {
      if (error.message.includes('not a member')) {
        throw new Error('You are not a member of this organization. Please contact an administrator for access.');
      }
      if (error.message.includes('private')) {
        throw new Error('This is a private project. Please request access from the project owner.');
      }
      if (error.message.includes('Required role')) {
        throw new Error('Insufficient permissions. You need higher privileges for this action.');
      }
      throw new Error('Access denied. Please check your permissions or contact support.');
    }

    throw error;
  }
}

// ============================================================================
// REAL API IMPLEMENTATIONS
// ============================================================================

const realAPI = {
  // ========================================
  // Organization Operations
  // ========================================
  async getOrganization(organizationId: string): Promise<OrganizationData> {
    return await makeAuthenticatedRequest<OrganizationData>(`/organizations/${organizationId}`);
  },

  async createOrganization(data: CreateOrganizationRequest): Promise<OrganizationData> {
    return await makeAuthenticatedRequest<OrganizationData>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrganization(organizationId: string, updates: UpdateOrganizationRequest): Promise<OrganizationData> {
    return await makeAuthenticatedRequest<OrganizationData>(`/organizations/${organizationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteOrganization(organizationId: string): Promise<void> {
    await makeAuthenticatedRequest<void>(`/organizations/${organizationId}`, {
      method: 'DELETE',
    });
  },

  // ========================================
  // Project Operations
  // ========================================
  async getCurrentProjectContext(projectId?: string): Promise<ProjectContext> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    console.log(`Fetching project context for: ${projectId}`);
    return await makeAuthenticatedRequest<ProjectContext>(`/projects/${projectId}/context`);
  },

  async getProject(projectId: string): Promise<ProjectData> {
    return await makeAuthenticatedRequest<ProjectData>(`/projects/${projectId}`);
  },

  async createProject(data: CreateProjectRequest): Promise<ProjectData> {
    return await makeAuthenticatedRequest<ProjectData>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(projectId: string, updates: UpdateProjectRequest): Promise<ProjectData> {
    return await makeAuthenticatedRequest<ProjectData>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteProject(projectId: string): Promise<void> {
    await makeAuthenticatedRequest<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  async getProjectsByOrganization(organizationId: string): Promise<ProjectData[]> {
    return await makeAuthenticatedRequest<ProjectData[]>(`/organizations/${organizationId}/projects`);
  },

  // ========================================
  // Agent Operations
  // ========================================
  async getAgents(organizationId: string): Promise<AgentData[]> {
    return await makeAuthenticatedRequest<AgentData[]>(`/organizations/${organizationId}/agents`);
  },

  async getAgent(agentId: string): Promise<AgentData> {
    return await makeAuthenticatedRequest<AgentData>(`/agents/${agentId}`);
  },

  async createAgent(data: CreateAgentRequest): Promise<AgentData> {
    return await makeAuthenticatedRequest<AgentData>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAgent(agentId: string, updates: UpdateAgentRequest): Promise<AgentData> {
    return await makeAuthenticatedRequest<AgentData>(`/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteAgent(agentId: string): Promise<void> {
    await makeAuthenticatedRequest<void>(`/agents/${agentId}`, {
      method: 'DELETE',
    });
  },

  async assignAgent(request: AssignAgentRequest): Promise<TaskData> {
    return await makeAuthenticatedRequest<TaskData>(`/tasks/${request.taskId}/assign-agent`, {
      method: 'POST',
      body: JSON.stringify({
        agentId: request.agentId,
        autoRun: request.autoRun,
      }),
    });
  },

  async runAgent(request: RunAgentRequest): Promise<AgentExecutionResult> {
    // Backend returns the updated TaskData, but we need to extract the AgentExecutionResult
    const updatedTask = await makeAuthenticatedRequest<TaskData>(`/agents/run/${request.taskId}`, {
      method: 'POST',
      body: JSON.stringify({
        agentId: request.agentId,
        options: request.options,
      }),
    });

    // Extract the execution result from the task
    if (!updatedTask.executionResult) {
      throw new Error('No execution result found in task response');
    }

    // Map the task's executionResult to our expected AgentExecutionResult format
    const result: AgentExecutionResult = {
      success: updatedTask.executionResult.success,
      message: updatedTask.executionResult.output || 'Agent execution completed',
      output: updatedTask.executionResult.output,
      tokensUsed: updatedTask.executionResult.tokensUsed || 0,
      executionTime: updatedTask.executionResult.executionTime || 0,
      artifacts: updatedTask.executionResult.artifacts,
      followUp: updatedTask.executionResult.followUp,
      error: updatedTask.executionResult.error || undefined,
    };

    return result;
  },

  // New agent endpoints matching backend routes
  async getAvailableAgents(): Promise<AvailableAgent[]> {
    // makeAuthenticatedRequest already extracts result.data, so we get the array directly
    const agentsData = await makeAuthenticatedRequest<Array<{
      agentId: string;
      agentName: string;
      description: string;
      type: string;
      capabilities: string[];
    }>>('/agents/available');

    // Transform backend format to frontend format
    return agentsData.map(agent => ({
      id: agent.agentId,
      name: agent.agentName,
      description: agent.description,
      capabilities: agent.capabilities,
      version: '1.0.0', // Default version since backend doesn't provide it
      isActive: true, // Default to active since backend doesn't provide it
    }));
  },

  async assignAgentsToTask(taskId: string, data: AssignAgentsRequest): Promise<TaskData> {
    return await makeAuthenticatedRequest<TaskData>(`/agents/assign/${taskId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ========================================
  // Column Operations
  // ========================================
  async getColumns(projectId: string): Promise<ColumnData[]> {
    return await makeAuthenticatedRequest<ColumnData[]>(`/projects/${projectId}/columns`);
  },

  async getColumn(columnId: string): Promise<ColumnData> {
    return await makeAuthenticatedRequest<ColumnData>(`/columns/${columnId}`);
  },

  async createColumn(data: CreateColumnRequest): Promise<ColumnData> {
    return await makeAuthenticatedRequest<ColumnData>('/columns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateColumn(columnId: string, updates: UpdateColumnRequest): Promise<ColumnData> {
    return await makeAuthenticatedRequest<ColumnData>(`/columns/${columnId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteColumn(columnId: string): Promise<void> {
    await makeAuthenticatedRequest<void>(`/columns/${columnId}`, {
      method: 'DELETE',
    });
  },

  // ========================================
  // Task Operations
  // ========================================
  async getTasks(projectId: string): Promise<TaskData[]> {
    return await makeAuthenticatedRequest<TaskData[]>(`/projects/${projectId}/tasks`);
  },

  async getTask(taskId: string): Promise<TaskData> {
    return await makeAuthenticatedRequest<TaskData>(`/tasks/${taskId}`);
  },

  async createTask(data: CreateTaskRequest): Promise<TaskData> {
    return await makeAuthenticatedRequest<TaskData>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<TaskData> {
    return await makeAuthenticatedRequest<TaskData>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    await makeAuthenticatedRequest<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  async moveTask(taskId: string, newColumnId: string, newPosition?: number): Promise<TaskData> {
    return await makeAuthenticatedRequest<TaskData>(`/tasks/${taskId}/move`, {
      method: 'POST',
      body: JSON.stringify({
        columnId: newColumnId,
        position: newPosition
      }),
    });
  },

  async getTasksByColumn(columnId: string): Promise<TaskData[]> {
    return await makeAuthenticatedRequest<TaskData[]>(`/columns/${columnId}/tasks`);
  },

  async getTasksByStatus(projectId: string, status: TaskData['status']): Promise<TaskData[]> {
    return await makeAuthenticatedRequest<TaskData[]>(`/projects/${projectId}/tasks?status=${status}`);
  },

  // ========================================
  // AI Assistant Operations
  // ========================================
  async callAIAssistant(request: AIRequest): Promise<AIResponse> {
    return await makeAuthenticatedRequest<AIResponse>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getAIUsage(organizationId: string): Promise<{
    tokensUsed: number;
    tokensRemaining: number;
    lastResetDate: Date;
  }> {
    return await makeAuthenticatedRequest(`/organizations/${organizationId}/ai-usage`);
  },

  // ========================================
  // User Organization Operations
  // ========================================
  async getUserOrganizations(): Promise<OrganizationData[]> {
    return await makeAuthenticatedRequest<OrganizationData[]>('/user/organizations');
  },
};

// ============================================================================
// DATA TRANSFORMATION HELPERS
// ============================================================================

// Helper types for data transformation
interface RawTaskData {
  _id?: string;
  id?: string;
  projectId?: string;
  project_id?: string;
  columnId?: string;
  title: string;
  description?: string;
  type: TaskData['type'];
  status: TaskData['status'];
  priority?: TaskData['priority'];
  agents?: Array<{
    agentId: string;
    agentName: string;
  }>;
  agentHistory?: TaskData['agentHistory'];
  tokenEstimate?: number;
  token_estimate?: number;
  actualTokensUsed?: number;
  progressPercentage?: number;
  assignees?: TaskData['assignees'];
  tags?: string[];
  position?: number;
  dependencies?: string[];
  blockedBy?: string[];
  subtasks?: string[];
  parentTask?: string;
  dueDate?: Date;
  estimatedDuration?: number;
  timeSpent?: number;
  createdBy?: string;
  created_by?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastAgentRun?: Date;
  completedAt?: Date;
  lastAgentResult?: AgentExecutionResult;
  isUpdating?: boolean;
  isNew?: boolean;
}

interface RawColumnData {
  _id?: string;
  id?: string;
  projectId: string;
  title?: string;
  name: string;
  description?: string;
  color?: string;
  position?: number;
  settings?: {
    isCollapsed?: boolean;
    isPinned?: boolean;
    autoRun?: boolean;
    autoRunAgent?: string;
    taskLimit?: number;
  };
  isCollapsed?: boolean;
  isPinned?: boolean;
  visibility?: ColumnData['visibility'];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LegacyTaskInput {
  title: string;
  description?: string;
  type: string;
  status: string;
  tokenEstimate?: number;
  [key: string]: unknown;
}

function transformTaskData(task: RawTaskData): TaskData {
  return {
    _id: task._id || task.id,
    projectId: task.projectId || task.project_id,
    columnId: task.columnId,
    title: task.title,
    description: task.description,
    type: task.type,
    status: task.status,
    priority: task.priority || 'medium',
    agents: task.agents || [],
    agentHistory: task.agentHistory || [],
    tokenEstimate: task.tokenEstimate || task.token_estimate || 0,
    actualTokensUsed: task.actualTokensUsed || 0,
    progressPercentage: task.progressPercentage || 0,
    assignees: task.assignees || [],
    tags: task.tags || [],
    position: task.position || 0,
    dependencies: task.dependencies || [],
    blockedBy: task.blockedBy || [],
    subtasks: task.subtasks || [],
    parentTask: task.parentTask,
    dueDate: task.dueDate,
    estimatedDuration: task.estimatedDuration,
    timeSpent: task.timeSpent || 0,
    createdBy: task.createdBy || task.created_by,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    lastAgentRun: task.lastAgentRun,
    completedAt: task.completedAt,
    lastAgentResult: task.lastAgentResult,
    isUpdating: task.isUpdating,
    isNew: task.isNew,
  };
}

function transformColumnData(column: RawColumnData): ColumnData {
  return {
    _id: column._id || column.id,
    projectId: column.projectId,
    title: column.title || column.name || 'Untitled',
    name: column.name,
    description: column.description,
    color: column.color || '#6b7280',
    position: column.position || 0,
    settings: {
      isCollapsed: column.settings?.isCollapsed || column.isCollapsed || false,
      isPinned: column.settings?.isPinned || column.isPinned || false,
      autoRun: column.settings?.autoRun || false,
      autoRunAgent: column.settings?.autoRunAgent,
      taskLimit: column.settings?.taskLimit || 50,
    },
    visibility: column.visibility || 'public',
    createdBy: column.createdBy,
    createdAt: column.createdAt,
    updatedAt: column.updatedAt,
  };
}

// Data transformation wrapper for mock API
const transformedMockAPI = {
  getCurrentProjectContext: async (projectId?: string) => {
    const context = await mockAPI.getCurrentProjectContext(projectId);
    return {
      ...context,
      tasks: context.tasks.map(transformTaskData),
      columns: context.columns.map(transformColumnData),
    };
  },
};

// ============================================================================
// UNIFIED API EXPORTS
// ============================================================================

// Organization Operations
export const getOrganization = USE_MOCK_DATA
  ? mockAPI.getOrganization
  : realAPI.getOrganization;

export const createOrganization = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.createOrganization;

export const updateOrganization = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.updateOrganization;

export const deleteOrganization = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.deleteOrganization;

// Project Operations
export const getCurrentProjectContext = USE_MOCK_DATA
  ? transformedMockAPI.getCurrentProjectContext
  : realAPI.getCurrentProjectContext;

export const getProject = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getProject;

export const createProject = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.createProject;

export const updateProject = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.updateProject;

export const deleteProject = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.deleteProject;

export const getProjectsByOrganization = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getProjectsByOrganization;

// Agent Operations
export const getAgents = USE_MOCK_DATA
  ? mockAPI.getAgents
  : realAPI.getAgents;

export const getAgent = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getAgent;

export const createAgent = USE_MOCK_DATA
  ? mockAPI.createAgent
  : realAPI.createAgent;

export const updateAgent = USE_MOCK_DATA
  ? mockAPI.updateAgent
  : realAPI.updateAgent;

export const deleteAgent = USE_MOCK_DATA
  ? mockAPI.deleteAgent
  : realAPI.deleteAgent;

export const assignAgent = USE_MOCK_DATA
  ? mockAPI.assignAgent
  : realAPI.assignAgent;

export const runAgent = USE_MOCK_DATA
  ? mockAPI.runAgent
  : realAPI.runAgent;

// New agent operations
export const getAvailableAgents = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getAvailableAgents;

export const assignAgentsToTask = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.assignAgentsToTask;

// Column Operations
export const getColumns = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getColumns;

export const getColumn = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getColumn;

export const createColumn = USE_MOCK_DATA
  ? mockAPI.createColumn
  : realAPI.createColumn;

export const updateColumn = USE_MOCK_DATA
  ? mockAPI.updateColumn
  : realAPI.updateColumn;

export const deleteColumn = USE_MOCK_DATA
  ? mockAPI.deleteColumn
  : realAPI.deleteColumn;

// Task Operations
export const getTasks = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getTasks;

export const getTask = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getTask;

export const createTask = USE_MOCK_DATA
  ? mockAPI.createTask
  : realAPI.createTask;

export const updateTask = USE_MOCK_DATA
  ? mockAPI.updateTask
  : realAPI.updateTask;

export const deleteTask = USE_MOCK_DATA
  ? mockAPI.deleteTask
  : realAPI.deleteTask;

export const moveTask = USE_MOCK_DATA
  ? mockAPI.moveTask
  : realAPI.moveTask;

export const getTasksByColumn = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getTasksByColumn;

export const getTasksByStatus = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getTasksByStatus;

// AI Assistant Operations
export const callAIAssistant = USE_MOCK_DATA
  ? (request: AIRequest) => mockAPI.callAIAssistant({ input: request.input, projectId: request.projectId })
  : realAPI.callAIAssistant;

export const getAIUsage = USE_MOCK_DATA
  ? undefined // Mock doesn't implement this yet
  : realAPI.getAIUsage;

// User Organization Operations
export const getUserOrganizations = USE_MOCK_DATA
  ? mockAPI.getUserOrganizations
  : realAPI.getUserOrganizations;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getAPIMode = () => USE_MOCK_DATA ? 'MOCK' : 'REAL';

export const setMockMode = (_useMock: boolean) => {
  console.warn('setMockMode is not implemented. Change USE_MOCK_DATA constant in api.ts');
};

// Helper to handle first-time user setup
export const ensureUserHasOrganization = async (userEmail: string): Promise<OrganizationData> => {
  try {
    // First try to get user's existing organizations
    const organizations = await getUserOrganizations?.() || [];

    if (organizations.length > 0) {
      return organizations[0]; // Return first organization
    }

    // If no organizations, create a default one
    if (!createOrganization) {
      throw new Error('Organization creation not available');
    }

    const newOrg = await createOrganization({
      name: `${userEmail.split('@')[0]}'s Organization`,
      slug: `${userEmail.split('@')[0]}-org-${Date.now()}`,
      description: 'Default organization created automatically',
    });

    return newOrg;
  } catch (error) {
    console.error('Error ensuring user has organization:', error);
    throw new Error('Failed to setup user organization. Please contact support.');
  }
};

// Legacy helper functions for backward compatibility
export async function saveTasksToDatabase(
  tasks: LegacyTaskInput[],
  projectId: string,
  userId: string
): Promise<TaskData[]> {
  console.warn('saveTasksToDatabase: This function is deprecated. Task creation is now handled server-side.');

  if (!tasks || tasks.length === 0) return [];

  return tasks.map((task, index) => transformTaskData({
    _id: `temp-${Date.now()}-${index}`,
    title: task.title,
    description: task.description,
    type: task.type as TaskData['type'],
    status: task.status as TaskData['status'],
    tokenEstimate: task.tokenEstimate,
    projectId: projectId,
    createdBy: userId,
    position: index,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

export type {
  TaskData,
  ColumnData,
  ProjectContext,
  OrganizationData,
  ProjectData,
  AgentData,
  ApiResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateAgentRequest,
  UpdateAgentRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignAgentRequest,
  RunAgentRequest,
  AvailableAgent,
  AvailableAgentsResponse,
  AgentExecutionResult,
  AssignAgentsRequest
} from '@/types/api';
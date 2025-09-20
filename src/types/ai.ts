// Frontend AI Types - src/types/ai.ts

import type { TaskData, ColumnData, AgentData, ProjectData, OrganizationData } from './api';

// ============================================================================
// FRONTEND AI REQUEST/RESPONSE INTERFACES
// ============================================================================

export interface AIAttachment {
  type: 'image' | 'document' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  content?: string; // Base64 encoded content for processing
}

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: AIAttachment[];
  metadata?: {
    tokensUsed?: number;
    executionTime?: number;
    createdTasks?: number;
    updatedTasks?: number;
  };
}

// Enhanced column data for AI context
export interface AIColumnContext extends ColumnData {
  taskCount: number;
  tasks: TaskData[];
}

export interface AIRequest {
  // Core request data
  input: string;
  userId: string;
  projectId: string;
  organizationId: string;

  // Optional parameters
  agentId?: string;
  conversationId?: string;
  attachments?: AIAttachment[];

  // Current project context
  context: {
    currentTasks: TaskData[];
    currentColumns: AIColumnContext[];
    availableAgents: AgentData[];
    project: ProjectData;
    organization: OrganizationData;
  };
  
  // AI processing options
  options?: {
    autoAssignAgent?: boolean;
    createInColumn?: string;
    maxTokens?: number;
    temperature?: number;
    enableTools?: boolean;
    responseFormat?: 'text' | 'structured';
    priority?: 'low' | 'normal' | 'high';
  };
}

export interface AIResponse {
  // Core response data
  type: 'general_answer' | 'task_creation' | 'task_management' | 'agent_assignment' | 'project_management' | 'agent_use' | 'other' | 'error';
  message: string;
  conversationId?: string;
  
  // Creation Results
  createdTasks?: TaskData[];
  createdColumns?: ColumnData[];
  createdAgents?: AgentData[];
  createdProjects?: ProjectData[];
  
  // Modification Results
  updatedTasks?: TaskData[];
  updatedColumns?: ColumnData[];
  updatedProjects?: ProjectData[];
  deletedItems?: Array<{
    type: 'task' | 'column' | 'agent';
    id: string;
    name: string;
  }>;
  
  // Agent Execution Results
  agentResults?: Array<{
    taskId: string;
    agentId: string;
    success: boolean;
    output?: string;
    tokensUsed: number;
    error?: string;
  }>;
  
  // Tool execution results
  toolResults?: Array<{
    tool: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  
  // Metadata
  tokensUsed: number;
  executionTime: number;
  suggestions?: string[];
  confidence?: number;
  requiresConfirmation?: boolean;
  
  // Follow-up actions
  followUpActions?: Array<{
    type: 'create_task' | 'assign_agent' | 'move_task' | 'update_project';
    description: string;
    data: any;
  }>;
}

// ============================================================================
// FRONTEND UI STATE TYPES
// ============================================================================

export interface AIAssistantState {
  isOpen: boolean;
  isLoading: boolean;
  currentConversation?: AIConversationContext;
  messages: AIMessage[];
  error?: string;
}

export interface AIAssistantActions {
  sendMessage: (message: string, attachments?: File[]) => Promise<void>;
  clearConversation: () => void;
  retryLastMessage: () => Promise<void>;
  openAssistant: () => void;
  closeAssistant: () => void;
}

export interface AIConversationContext {
  conversationId: string;
  messages: AIMessage[];
  projectId: string;
  organizationId: string;
  userId: string;
}

// ============================================================================
// FRONTEND VALIDATION
// ============================================================================

export interface AIRequestValidation {
  input: {
    minLength: number;
    maxLength: number;
    allowedTypes: string[];
  };
  attachments: {
    maxCount: number;
    maxSize: number; // in bytes
    allowedTypes: string[];
  };
  context: {
    requiredFields: string[];
  };
}

// Default validation rules for frontend
export const DEFAULT_AI_VALIDATION: AIRequestValidation = {
  input: {
    minLength: 1,
    maxLength: 2000,
    allowedTypes: ['text']
  },
  attachments: {
    maxCount: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
  },
  context: {
    requiredFields: ['projectId', 'organizationId', 'userId']
  }
};

// ============================================================================
// FRONTEND ERROR HANDLING
// ============================================================================

export interface AIError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  suggestedAction?: string;
}

export const AI_ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  CONTEXT_MISSING: 'CONTEXT_MISSING',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  LLM_SERVICE_ERROR: 'LLM_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type AIErrorCode = typeof AI_ERROR_CODES[keyof typeof AI_ERROR_CODES];

// ============================================================================
// FRONTEND UTILITY FUNCTIONS
// ============================================================================

export function validateFileAttachment(file: File): { valid: boolean; error?: string } {
  if (file.size > DEFAULT_AI_VALIDATION.attachments.maxSize) {
    return {
      valid: false,
      error: `File ${file.name} is too large (max ${DEFAULT_AI_VALIDATION.attachments.maxSize / 1024 / 1024}MB)`
    };
  }

  if (!DEFAULT_AI_VALIDATION.attachments.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported`
    };
  }

  return { valid: true };
}

export function convertFileToAttachment(file: File): Promise<AIAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        mimeType: file.type,
        content: base64
      });
    };
    reader.onerror = error => reject(error);
  });
}

export function createAIMessage(
  type: 'user' | 'assistant',
  content: string,
  attachments?: File[]
): AIMessage {
  return {
    id: `${type}-${Date.now()}`,
    type,
    content,
    timestamp: new Date(),
    attachments: attachments?.map(file => ({
      type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      mimeType: file.type
    }))
  };
}

// ============================================================================
// TYPE GUARDS FOR FRONTEND
// ============================================================================

export function isAIRequest(request: any): request is AIRequest {
  return typeof request === 'object' && 
         typeof request.userId === 'string' &&
         typeof request.input === 'string' &&
         typeof request.projectId === 'string' &&
         typeof request.organizationId === 'string' &&
         typeof request.context === 'object';
}

export function isAIResponse(response: any): response is AIResponse {
  return typeof response === 'object' &&
         typeof response.type === 'string' &&
         typeof response.message === 'string' &&
         typeof response.tokensUsed === 'number' &&
         typeof response.executionTime === 'number';
}

export function isAIError(error: any): error is AIError {
  return typeof error === 'object' &&
         typeof error.code === 'string' &&
         typeof error.message === 'string' &&
         typeof error.recoverable === 'boolean';
}

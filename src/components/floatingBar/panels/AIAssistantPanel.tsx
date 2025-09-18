// src/components/FloatingBottomBar/panels/AIAssistantPanel.tsx

import React, { useState } from 'react';
import { Send, Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PanelWrapper } from '../common/PanelWrapper';
import { useAIAssistant } from '@/hooks/useBoardData';
import { toast } from 'sonner';
import { 
  type ProjectData, 
  type TaskData, 
  type ColumnData, 
  type AgentData, 
  type AIResponse 
} from '@/types/api';

interface AIAssistantPanelProps {
  onClose: () => void;
  isLoading: boolean;
  currentProject?: ProjectData;
  currentTasks: TaskData[];
  currentColumns: ColumnData[];
  agents: AgentData[];
  onSuccess: (response: AIResponse) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onClose,
  isLoading: parentLoading,
  currentProject,
  currentTasks,
  currentColumns,
  agents,
  onSuccess
}) => {
  const [input, setInput] = useState('');
  const aiAssistantMutation = useAIAssistant();

  const isProcessing = aiAssistantMutation.isPending;
  const isDisabled = parentLoading || isProcessing || !input.trim() || !currentProject;

  const handleSubmit = () => {
    if (isDisabled) return;

    const request = {
      input: input.trim(),
      projectId: currentProject!._id,
      organizationId: currentProject!.organizationId,
      context: {
        currentTasks,
        currentColumns,
        availableAgents: agents
      },
      options: {
        autoAssignAgent: true,
        createInColumn: currentColumns.find(col => col.name === 'backlog')?._id
      }
    };

    aiAssistantMutation.mutate(request, {
      onSuccess: (response) => {
        handleAIResponse(response);
        setInput('');
      },
      onError: (error) => {
        toast.error('AI Assistant Error', {
          description: error.message || 'Failed to process your request',
          duration: 5000,
        });
      }
    });
  };

  const handleAIResponse = (response: AIResponse) => {
    switch (response.type) {
      case 'general_answer':
        toast.success('AI Response', {
          description: response.message,
          duration: 5000,
        });
        break;

      case 'task_creation':
        if (response.createdTasks && response.createdTasks.length > 0) {
          toast.success(`Created ${response.createdTasks.length} new task(s)!`, {
            description: response.message,
            duration: 4000,
          });
        }
        break;

      case 'task_management':
        toast.success('Task management completed!', {
          description: response.message,
          duration: 4000,
        });
        break;

      case 'agent_assignment':
        toast.success('Agent assigned!', {
          description: response.message,
          duration: 4000,
        });
        break;

      case 'error':
        toast.error('AI Assistant Error', {
          description: response.message,
          duration: 5000,
        });
        return; // Don't call onSuccess for errors

      default:
        toast.info('AI Response', {
          description: response.message || 'Operation completed',
          duration: 4000,
        });
    }

    onSuccess(response);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = [
    "Create a task for user authentication",
    "Assign code review agent to in-progress tasks",
    "Summarize current sprint backlog",
    "Create documentation task",
    "Find tasks missing agents"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <PanelWrapper 
      title="🤖 AI Assistant" 
      onClose={onClose}
      subtitle={currentProject ? `Project: ${currentProject.name}` : 'No project selected'}
    >
      <div className="space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask AI or create tasks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={isDisabled}
              className="px-3"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Status Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {currentProject ? (
                <>
                  {currentTasks.length} tasks • {agents.length} agents available
                </>
              ) : (
                'Select a project to use AI assistant'
              )}
            </span>
            {isProcessing && (
              <div className="flex items-center space-x-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Prompts */}
        {!isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              <span>Quick prompts:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isDisabled}
                  className="text-xs h-7 px-2 py-1"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* AI Capabilities */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="pt-3 pb-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  AI Capabilities
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">Task Creation</Badge>
                <Badge variant="secondary" className="text-xs">Agent Assignment</Badge>
                <Badge variant="secondary" className="text-xs">Project Analysis</Badge>
                <Badge variant="secondary" className="text-xs">Progress Tracking</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats (if available) */}
        {currentProject && (
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Tokens used today:</span>
              <span>{Math.floor(Math.random() * 5000)} / 10,000</span>
            </div>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
};
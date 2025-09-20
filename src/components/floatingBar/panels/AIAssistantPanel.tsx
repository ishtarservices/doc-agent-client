import React, { useState, useRef } from 'react';
import { MessageSquare, Send, Paperclip, X, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { AIResponse } from '@/types/ai';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
  metadata?: {
    tokensUsed?: number;
    executionTime?: number;
    createdTasks?: number;
    updatedTasks?: number;
  };
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string, attachments?: File[]) => Promise<AIResponse>;
  currentProject?: {
    _id: string;
    name: string;
  };
  isLoading?: boolean;
  taskCount?: number;
  agentCount?: number;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  currentProject,
  isLoading = false,
  taskCount = 0,
  agentCount = 0
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatAIResponseMessage = (response: AIResponse): string => {
    switch (response.type) {
      case 'task_creation':
        if (response.createdTasks && response.createdTasks.length > 0) {
          const taskList = response.createdTasks
            .map(task => `• ${task.title}`)
            .join('\n');
          return `✅ I've created ${response.createdTasks.length} new task(s) for you:\n\n${taskList}`;
        }
        if (response.createdColumns && response.createdColumns.length > 0) {
          const columnList = response.createdColumns
            .map(col => `• ${col.title}`)
            .join('\n');
          return `✅ I've created ${response.createdColumns.length} new column(s):\n\n${columnList}`;
        }
        return response.message || '✅ Tasks have been created successfully!';

      case 'general_answer':
        // Extract meaningful information from tool results for general answers
        if (response.toolResults && response.toolResults.length > 0) {
          const toolResult = response.toolResults[0];
          if (toolResult.tool === 'analyze_tasks' && toolResult.result) {
            const analysis = toolResult.result;
            return `📊 Here's your project analysis:\n\n• Total tasks: ${analysis.totalTasks || 0}\n• Completed: ${analysis.completedTasks || 0}\n• In progress: ${analysis.inProgressTasks || 0}\n• Backlog: ${analysis.backlogTasks || 0}\n• Completion rate: ${analysis.completionRate || 0}%`;
          }
        }
        return response.message || '✅ Request completed successfully!';

      case 'task_management':
        if (response.updatedTasks && response.updatedTasks.length > 0) {
          return `✅ I've updated ${response.updatedTasks.length} task(s) for you.`;
        }
        return response.message || '✅ Task management completed!';

      case 'project_management':
        return response.message || '✅ Project has been updated!';

      case 'agent_assignment':
        return response.message || '✅ Agent has been assigned!';

      case 'error':
        return `❌ ${response.message || 'An error occurred while processing your request.'}`;

      default:
        return response.message || '✅ Operation completed successfully!';
    }
  };

  const handleSend = async () => {
    console.log('🚀 [AIAssistant] Sending message:', { input, attachments });
    if ((!input.trim() && attachments.length === 0) || isProcessing || !currentProject) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachments.map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const aiResponse = await onSendMessage(input.trim(), attachments);

      // Format the AI response message based on response type
      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: formatAIResponseMessage(aiResponse),
        timestamp: new Date(),
        metadata: {
          tokensUsed: aiResponse.tokensUsed,
          executionTime: aiResponse.executionTime,
          createdTasks: aiResponse.createdTasks?.length || 0,
          updatedTasks: aiResponse.updatedTasks?.length || 0
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      toast.error('Failed to send message');
      console.error('AI Assistant error:', error);

      // Add error message to chat
      const errorMessage: AIMessage = {
        id: `assistant-error-${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        metadata: {
          tokensUsed: 0,
          executionTime: 0
        }
      };
      setMessages(prev => [...prev, errorMessage]);

    } finally {
      setInput('');
      setAttachments([]);
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`File ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const renderMessage = (message: AIMessage) => (
    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[85%] ${
        message.type === 'user' 
          ? 'bg-foreground text-background' 
          : 'bg-muted border'
      } rounded-2xl px-4 py-3`}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center space-x-2">
                {attachment.type === 'image' ? (
                  <img src={attachment.url} alt={attachment.name} className="max-w-48 max-h-48 rounded-lg" />
                ) : (
                  <div className="flex items-center space-x-2 bg-background/10 rounded px-2 py-1">
                    <Paperclip className="h-3 w-3" />
                    <span className="text-xs">{attachment.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {message.metadata && (
          <div className="mt-3 flex flex-wrap gap-1">
            {message.metadata.tokensUsed !== undefined && message.metadata.tokensUsed > 0 && (
              <Badge variant="secondary" className="text-xs h-5">
                {message.metadata.tokensUsed} tokens
              </Badge>
            )}
            {message.metadata.createdTasks && (
              <Badge variant="secondary" className="text-xs h-5">
                +{message.metadata.createdTasks} tasks
              </Badge>
            )}
            {message.metadata.executionTime !== undefined && (
              <Badge variant="secondary" className="text-xs h-5">
                {message.metadata.executionTime}ms
              </Badge>
            )}
          </div>
        )}
        
        <div className="text-xs opacity-60 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-[600px] h-[400px] mb-2 z-50">
      <div className="bg-background/95 backdrop-blur-sm rounded-xl shadow-2xl border flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-background" />
            </div>
            <div>
              <h3 className="font-medium text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {currentProject ? (
                  `${currentProject.name} • ${taskCount} tasks • ${agentCount} agents`
                ) : (
                  'Select a project to continue'
                )}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Start a conversation</h4>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Ask me to create tasks, analyze your project, or help with planning
                  </p>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput('Create 5 marketing tasks for product launch')}
                    disabled={isProcessing || !currentProject}
                  >
                    Create marketing tasks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput('Analyze my current backlog and suggest priorities')}
                    disabled={isProcessing || !currentProject}
                  >
                    Analyze backlog
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput('Summarize project progress and next steps')}
                    disabled={isProcessing || !currentProject}
                  >
                    Progress summary
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2 text-sm">
                  {file.type.startsWith('image/') ? (
                    <Image className="h-4 w-4" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                  <span className="truncate max-w-32">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Textarea
                placeholder="Ask AI or describe what you need help with..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isProcessing || !currentProject}
                className="min-h-[44px] max-h-32 resize-none pr-12 rounded-xl border-2 focus:border-foreground/20"
                rows={1}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-7 w-7 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || !currentProject}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              size="sm" 
              onClick={handleSend} 
              disabled={isProcessing || !currentProject || (!input.trim() && attachments.length === 0)}
              className="h-11 w-11 p-0 rounded-xl"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Status */}
          {!currentProject && (
            <p className="text-xs text-muted-foreground text-center">
              Select a project to enable AI assistant
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
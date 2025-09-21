import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Code,
  FileText,
  Bug,
  TestTube,
  GitBranch,
  Copy,
  ExternalLink,
  X,
} from 'lucide-react';
import { AgentExecutionResult } from '@/types/api';
import { toast } from 'sonner';

interface AgentResultModalProps {
  result: AgentExecutionResult | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkComplete?: () => void; // Callback to mark task as complete
}

const AgentResultModal = ({ result, isOpen, onClose, onMarkComplete }: AgentResultModalProps) => {
  const [copiedContent, setCopiedContent] = useState<string | null>(null);

  if (!result) return null;

  const getArtifactIcon = (type: string) => {
    const icons = {
      git_patch: GitBranch,
      code: Code,
      analysis: FileText,
      documentation: FileText,
      test_results: TestTube,
      file_diff: Code,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getArtifactColor = (type: string) => {
    const colors = {
      git_patch: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      code: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      analysis: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      documentation: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      test_results: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      file_diff: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(type);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopiedContent(null), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const formatContent = (content: string, type: string) => {
    // For git patches, preserve formatting
    if (type === 'git_patch' || type === 'file_diff') {
      return (
        <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded border overflow-x-auto whitespace-pre-wrap font-mono">
          {content}
        </pre>
      );
    }

    // For other content, format as readable text
    return (
      <div className="text-sm space-y-2 whitespace-pre-wrap">
        {content}
      </div>
    );
  };

  const renderMetadata = (metadata: any) => {
    if (!metadata) return null;

    const displayItems = [];

    // Git-specific metadata
    if (metadata.repository) displayItems.push(['Repository', metadata.repository]);
    if (metadata.branch) displayItems.push(['Branch', metadata.branch]);
    if (metadata.filesChanged) displayItems.push(['Files Changed', metadata.filesChanged]);
    if (metadata.linesAdded) displayItems.push(['Lines Added', `+${metadata.linesAdded}`, 'text-green-600']);
    if (metadata.linesRemoved) displayItems.push(['Lines Removed', `-${metadata.linesRemoved}`, 'text-red-600']);
    if (metadata.language) displayItems.push(['Language', metadata.language]);

    // Test-specific metadata
    if (metadata.testsPassed !== undefined) displayItems.push(['Tests Passed', metadata.testsPassed, 'text-green-600']);
    if (metadata.testsFailed !== undefined) displayItems.push(['Tests Failed', metadata.testsFailed, 'text-red-600']);
    if (metadata.coverage !== undefined) displayItems.push(['Coverage', `${metadata.coverage}%`]);

    // Bug-specific metadata
    if (metadata.severity) {
      const severityColors = {
        low: 'text-yellow-600',
        medium: 'text-orange-600',
        high: 'text-red-600',
        critical: 'text-red-800'
      };
      displayItems.push(['Severity', metadata.severity, severityColors[metadata.severity as keyof typeof severityColors]]);
    }

    if (displayItems.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        {displayItems.map(([label, value, className]) => (
          <div key={label} className="flex justify-between">
            <span className="text-muted-foreground">{label}:</span>
            <span className={className || 'font-medium'}>{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${result.success ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {result.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Agent Execution {result.success ? 'Completed' : 'Failed'}
                </DialogTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {result.executionTime}ms
                  </span>
                  <span className="flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    {result.tokensUsed} tokens
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {result.success && onMarkComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onMarkComplete();
                    onClose();
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Main Message */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm">{result.message}</p>
              {result.output && (
                <div className="mt-3 p-3 bg-background rounded border">
                  <p className="text-xs text-muted-foreground mb-2">Output:</p>
                  <p className="text-sm">{result.output}</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {result.error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">{result.error}</p>
              </div>
            )}

            {/* Artifacts */}
            {result.artifacts && result.artifacts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Generated Artifacts</h3>
                <Tabs defaultValue="0" className="w-full">
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(result.artifacts.length, 4)}, 1fr)` }}>
                    {result.artifacts.slice(0, 4).map((artifact, index) => {
                      const Icon = getArtifactIcon(artifact.type);
                      return (
                        <TabsTrigger key={index} value={index.toString()} className="flex items-center space-x-2">
                          <Icon className="h-3 w-3" />
                          <span className="truncate">{artifact.title}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {result.artifacts.map((artifact, index) => (
                    <TabsContent key={index} value={index.toString()}>
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className={getArtifactColor(artifact.type)}>
                                {artifact.type.replace('_', ' ')}
                              </Badge>
                              <CardTitle className="text-base">{artifact.title}</CardTitle>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(artifact.content, artifact.type)}
                              >
                                {copiedContent === artifact.type ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              {artifact.metadata?.repository && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={artifact.metadata.repository} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          {renderMetadata(artifact.metadata)}
                        </CardHeader>
                        <CardContent>
                          {formatContent(artifact.content, artifact.type)}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            {/* Follow-up Actions */}
            {result.followUp && (result.followUp.suggestions?.length || result.followUp.nextSteps?.length) && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Recommendations</h3>

                {result.followUp.suggestions && result.followUp.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Suggestions:</p>
                    <ul className="space-y-1">
                      {result.followUp.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.followUp.nextSteps && result.followUp.nextSteps.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Next Steps:</p>
                    <ul className="space-y-1">
                      {result.followUp.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm flex items-start space-x-2">
                          <div className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                            {index + 1}
                          </div>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentResultModal;
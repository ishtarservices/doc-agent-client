import React, { useState } from 'react';
import { FileText, Plus, RefreshCw, GitPullRequest, Eye, Edit, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface DocMount {
  id: string;
  name: string;
  type: 'local' | 'repo' | 'upload';
  path: string;
  lastUpdated: string;
}

const Docs = () => {
  const [selectedDoc, setSelectedDoc] = useState<DocMount | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');

  const docMounts: DocMount[] = [
    {
      id: '1',
      name: 'README.md',
      type: 'repo',
      path: '/docs/README.md',
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      name: 'CONTEXT.md',
      type: 'local',
      path: './context.md',
      lastUpdated: '5 hours ago',
    },
    {
      id: '3',
      name: 'CHANGELOG.md',
      type: 'repo',
      path: '/CHANGELOG.md',
      lastUpdated: '1 day ago',
    },
  ];

  const sampleContent = `# ALLnOne Project Documentation

## Overview
ALLnOne is an innovative platform that combines auto-updating documentation with AI-powered task management and a comprehensive marketplace for development tools.

## Features
- **Living Documents**: Documentation that updates automatically from repository changes
- **AI Task Board**: Intelligent task management with built-in AI actions
- **Tool Marketplace**: Discover and integrate powerful development tools

## Recent Changes
- Added marketplace integration for third-party tools
- Implemented AI-powered task summarization
- Enhanced document mount system for better file tracking

## Usage Statistics
- Total tokens used this month: 32,400
- Documents updated: 15
- Tasks completed: 23

## Next Steps
- [ ] Implement GitHub webhook integration
- [ ] Add email processing capabilities
- [ ] Expand marketplace tool selection
- [ ] Enhance AI model selection options`;

  const getTypeColor = (type: DocMount['type']) => {
    const colors = {
      local: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      repo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      upload: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[type];
  };

  const openDocument = (doc: DocMount) => {
    setSelectedDoc(doc);
    setContent(sampleContent);
    setIsEditing(false);
  };

  const updateSections = () => {
    // Stub for update sections functionality
  };

  const showDiff = () => {
    // Stub for diff display
  };

  const createPR = () => {
    // Stub for PR creation
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Doc Mounts */}
      <div className="w-1/3 border-r bg-muted/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Doc Mounts</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Mount
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Document Mount</DialogTitle>
                <DialogDescription>
                  Connect a document to your project for automatic updates
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Document mount creation will be implemented in the full version.
                </p>
                <div className="flex justify-end">
                  <Button disabled>Add Mount</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {docMounts.map((doc) => (
            <Card 
              key={doc.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedDoc?.id === doc.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => openDocument(doc)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {doc.name}
                  </CardTitle>
                  <Badge className={getTypeColor(doc.type)} variant="secondary">
                    {doc.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-1">{doc.path}</p>
                <p className="text-xs text-muted-foreground">Updated {doc.lastUpdated}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Panel - Document Viewer/Editor */}
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            {/* Document Header */}
            <div className="border-b bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    {selectedDoc.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoc.path} • Updated {selectedDoc.lastUpdated}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button variant="outline" size="sm" onClick={updateSections}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Sections
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={showDiff}>
                    Show Diff
                  </Button>
                  
                  {selectedDoc.type === 'repo' && (
                    <Button variant="outline" size="sm" onClick={createPR}>
                      <GitPullRequest className="h-4 w-4 mr-2" />
                      Create PR
                    </Button>
                  )}

                  {isEditing && (
                    <Button size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 p-6">
              {isEditing ? (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full min-h-[600px] font-mono text-sm"
                  placeholder="Edit your document content here..."
                />
              ) : (
                <div className="prose max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {content}
                  </pre>
                </div>
              )}
            </div>
          </>
        ) : (
          /* No Document Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No Document Selected</h3>
                <p className="text-muted-foreground">
                  Select a document mount from the left panel to view or edit its content
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Docs;
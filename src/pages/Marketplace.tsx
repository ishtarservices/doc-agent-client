import React, { useState } from 'react';
import { Search, Filter, Star, Zap, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Tool {
  id: string;
  name: string;
  description: string;
  logo?: string;
  price: number;
  categories: string[];
  hasDeal: boolean;
  isFeatured: boolean;
}

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const tools: Tool[] = [
    {
      id: '1',
      name: 'OpenAI GPT-4',
      description: 'Advanced language model for text generation and analysis',
      price: 20.00,
      categories: ['LLM', 'AI'],
      hasDeal: true,
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Anthropic Claude',
      description: 'Constitutional AI assistant for safe and helpful responses',
      price: 18.00,
      categories: ['LLM', 'AI'],
      hasDeal: false,
      isFeatured: true,
    },
    {
      id: '3',
      name: 'GitHub Integration',
      description: 'Connect repositories for automatic documentation updates',
      price: 0.00,
      categories: ['Git', 'Integration'],
      hasDeal: false,
      isFeatured: false,
    },
    {
      id: '4',
      name: 'Gmail Connector',
      description: 'Sync emails and create tasks from important messages',
      price: 5.00,
      categories: ['Email', 'Integration'],
      hasDeal: true,
      isFeatured: false,
    },
    {
      id: '5',
      name: 'Pinecone Vector DB',
      description: 'High-performance vector database for semantic search',
      price: 25.00,
      categories: ['Vector DB', 'Storage'],
      hasDeal: false,
      isFeatured: false,
    },
    {
      id: '6',
      name: 'Notion API',
      description: 'Sync documents and databases with Notion workspace',
      price: 10.00,
      categories: ['Docs', 'Integration'],
      hasDeal: false,
      isFeatured: false,
    },
  ];

  const categories = ['All', 'LLM', 'AI', 'Git', 'Integration', 'Email', 'Vector DB', 'Storage', 'Docs'];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const assignTool = (tool: Tool) => {
    // Stub for tool assignment
    setSelectedTool(null);
  };

  const addApiKey = (tool: Tool) => {
    // Stub for API key addition
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and integrate powerful tools for your projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Card 
            key={tool.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              tool.isFeatured ? 'ring-2 ring-accent' : ''
            }`}
            onClick={() => setSelectedTool(tool)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {tool.name}
                    {tool.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg font-bold">
                      {tool.price === 0 ? 'Free' : `$${tool.price}/mo`}
                    </Badge>
                    {tool.hasDeal && (
                      <Badge variant="destructive" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Deal
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {tool.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {tool.categories.map((category) => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
              
              <Button className="w-full" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool Detail Modal */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTool && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTool.name}
                  {selectedTool.isFeatured && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                </DialogTitle>
                <DialogDescription>
                  {selectedTool.description}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Pricing</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-lg">
                          {selectedTool.price === 0 ? 'Free' : `$${selectedTool.price}/month`}
                        </Badge>
                        {selectedTool.hasDeal && (
                          <Badge variant="destructive">
                            <Zap className="h-3 w-3 mr-1" />
                            Special Deal
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Features</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Advanced AI-powered capabilities</li>
                        <li>Easy integration with ALLnOne platform</li>
                        <li>Comprehensive documentation and support</li>
                        <li>Regular updates and improvements</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="space-y-3">
                    <Button onClick={() => assignTool(selectedTool)} className="w-full">
                      Assign to Project
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => addApiKey(selectedTool)}
                      className="w-full"
                    >
                      Add API Key
                    </Button>
                    
                    <Button variant="outline" className="w-full" disabled>
                      Add to Bundle (Coming Soon)
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="compatibility" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Compatible Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTool.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This tool is compatible with your current project setup and can be 
                      integrated seamlessly with your existing workflow.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};

export default Marketplace;
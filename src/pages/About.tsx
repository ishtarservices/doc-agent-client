import React from 'react';
import { FileText, Zap, ShoppingCart, Users, Github, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const About = () => {
  const features = [
    {
      icon: FileText,
      title: 'Living Documents',
      description: 'Documents that automatically update from repository changes, API usage, and data sources. Never let your documentation fall behind again.',
      color: 'text-blue-500',
    },
    {
      icon: Zap,
      title: 'AI-Powered Tasks',
      description: 'Intelligent task management with built-in AI actions like summarize, polish, and automated execution. Boost your productivity with smart automation.',
      color: 'text-yellow-500',
    },
    {
      icon: ShoppingCart,
      title: 'Tool Marketplace',
      description: 'Discover and integrate powerful development tools, AI models, and services. Build your perfect workflow with our curated marketplace.',
      color: 'text-green-500',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Multi-tenant organization support with role-based access control. Work together seamlessly across projects and teams.',
      color: 'text-purple-500',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '1,200+' },
    { label: 'Documents Managed', value: '15,000+' },
    { label: 'Tasks Automated', value: '50,000+' },
    { label: 'Integrations', value: '25+' },
  ];

  return (
    <div className="space-y-12 p-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <Badge variant="outline" className="mb-4">
            Version 1.0 MVP
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to ALLnOne
          </h1>
          <p className="text-xl text-muted-foreground">
            Auto-Updating Docs + Agent Workspace with Marketplace
          </p>
        </div>
        
        <p className="text-lg text-muted-foreground leading-relaxed">
          ALLnOne is the comprehensive platform that helps founders and engineers maintain 
          living documents, manage AI-powered tasks, and discover the best tools for their projects. 
          Experience the future of documentation and workflow automation.
        </p>

        <div className="flex justify-center space-x-4">
          <Button size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            <Github className="h-4 w-4 mr-2" />
            View on GitHub
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Powerful Features</h2>
          <p className="text-lg text-muted-foreground mt-2">
            Everything you need to streamline your development workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <feature.icon className={`h-6 w-6 mr-3 ${feature.color}`} />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-lg text-muted-foreground mt-2">
            Simple steps to transform your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold">Connect Your Sources</h3>
            <p className="text-muted-foreground">
              Link your GitHub repositories, documents, and data sources to ALLnOne
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold">Setup Automation</h3>
            <p className="text-muted-foreground">
              Configure your task board and document templates with AI-powered actions
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold">Scale with Tools</h3>
            <p className="text-muted-foreground">
              Discover and integrate powerful tools from our marketplace to enhance your workflow
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted rounded-xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join thousands of developers who are already using ALLnOne to streamline their 
          documentation and task management workflows.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Button size="lg">
            Start Free Trial
          </Button>
          <Button variant="outline" size="lg">
            <Mail className="h-4 w-4 mr-2" />
            Contact Sales
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>© 2024 ALLnOne. Built with React, TypeScript, and Tailwind CSS.</p>
        <p className="mt-1">Powered by Supabase and designed for modern development workflows.</p>
      </div>
    </div>
  );
};

export default About;
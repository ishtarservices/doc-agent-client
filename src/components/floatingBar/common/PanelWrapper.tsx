// src/components/FloatingBottomBar/common/PanelWrapper.tsx

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PanelWrapperProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const PanelWrapper: React.FC<PanelWrapperProps> = ({
  title,
  subtitle,
  onClose,
  isLoading = false,
  children
}) => {
  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-80 mb-2">
      <Card className="shadow-lg border-2 bg-background/95 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex-1">
            <CardTitle className="text-sm flex items-center space-x-2">
              <span>{title}</span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};


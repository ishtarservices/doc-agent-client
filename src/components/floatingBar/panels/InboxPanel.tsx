
// src/components/FloatingBottomBar/panels/InboxPanel.tsx

import React from 'react';
import { Mail, MessageCircle, AtSign, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelWrapper } from '../common/PanelWrapper';

interface Notification {
  id: string;
  type: 'comment' | 'assignment' | 'mention' | 'deadline' | 'completion';
  message: string;
  time: string;
  isRead: boolean;
  taskId?: string;
  userId?: string;
}

interface InboxPanelProps {
  onClose: () => void;
  isLoading: boolean;
  notifications: Notification[];
}

export const InboxPanel: React.FC<InboxPanelProps> = ({
  onClose,
  isLoading,
  notifications
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment': return MessageCircle;
      case 'assignment': return Mail;
      case 'mention': return AtSign;
      case 'deadline': return Clock;
      case 'completion': return CheckCircle2;
      default: return Mail;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <PanelWrapper 
      title="📥 Inbox" 
      onClose={onClose}
      isLoading={isLoading}
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
    >
      <ScrollArea className="h-48">
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              
              return (
                <div 
                  key={notification.id} 
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    notification.isRead ? 'bg-muted/30' : 'bg-muted/50 border border-primary/20'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </PanelWrapper>
  );
};
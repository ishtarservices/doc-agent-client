import React, { useState } from 'react';
import { Plus, UserPlus, Share2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FloatingActionBubbleProps {
  onAddColumn?: () => void;
}

const FloatingActionBubble = ({ onAddColumn }: FloatingActionBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Mock team members
  const teamMembers = [
    { id: '1', name: 'Alice Johnson', avatar: '', initials: 'AJ' },
    { id: '2', name: 'Bob Smith', avatar: '', initials: 'BS' },
    { id: '3', name: 'Charlie Brown', avatar: '', initials: 'CB' },
  ];

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  const actionButtons = [
    {
      id: 'invite',
      icon: UserPlus,
      label: 'Invite',
      className: 'bg-white/90 hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-lg',
      onClick: () => setIsInviteOpen(true),
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Share',
      className: 'bg-white/90 hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-lg',
      onClick: () => toast.info('Share link copied to clipboard'),
    },
    {
      id: 'add',
      icon: Plus,
      label: 'Add Column',
      className: 'bg-white/90 hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-lg',
      onClick: onAddColumn,
    },
  ];

  return (
    <>
      {/* Floating Action Bubble */}
      <div
        className="fixed bottom-8 right-8 z-50"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Action Buttons - Swirl Animation */}
        <div className="relative">
          {actionButtons.map((button, index) => {
            const Icon = button.icon;
            const angle = (index * 90) - 135; // Distribute in a tighter arc starting from top-left
            const radius = isExpanded ? 60 : 0;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <Button
                key={button.id}
                size="sm"
                className={`absolute w-12 h-12 rounded-full shadow-lg transition-all duration-500 ease-out ${button.className} ${
                  isExpanded
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-0 pointer-events-none'
                }`}
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${isExpanded ? 360 : 0}deg)`,
                  transitionDelay: `${index * 50}ms`,
                }}
                onClick={button.onClick}
                title={button.label}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>

        {/* Main Bubble */}
        <div className="relative">
          {/* Team Members Background */}
          <div className={`absolute inset-0 transition-all duration-300 ${
            isExpanded ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
          }`}>
            <div className="flex -space-x-1 justify-center items-center h-14">
              {teamMembers.slice(0, 3).map((member, index) => (
                <Avatar
                  key={member.id}
                  className={`border-2 border-white w-8 h-8 transition-all duration-300 ${
                    isExpanded ? 'scale-0' : 'scale-100'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          {/* Main Action Button */}
          <Button
            className={`w-14 h-14 rounded-full shadow-xl bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 transition-all duration-300 ${
              isExpanded
                ? 'rotate-45 scale-110'
                : 'rotate-0 scale-100 hover:scale-105'
            }`}
          >
            <Settings
              className={`h-6 w-6 transition-all duration-300 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </Button>
        </div>

        {/* Ripple Effect */}
        <div
          className={`absolute inset-0 rounded-full bg-gray-400/10 transition-all duration-700 ${
            isExpanded
              ? 'scale-[2.5] opacity-0'
              : 'scale-100 opacity-0'
          }`}
        />
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on this board
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite}>Send Invite</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingActionBubble;
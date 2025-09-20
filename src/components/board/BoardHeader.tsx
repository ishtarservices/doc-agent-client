// import React, { useState } from 'react';
// import { Plus, UserPlus, Share2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { toast } from 'sonner';

// interface BoardHeaderProps {
//   onAddColumn?: () => void;
// }

// const BoardHeader = ({ onAddColumn }: BoardHeaderProps) => {
//   const [inviteEmail, setInviteEmail] = useState('');
//   const [isInviteOpen, setIsInviteOpen] = useState(false);

//   // Mock team members
//   const teamMembers = [
//     { id: '1', name: 'Alice Johnson', avatar: '', initials: 'AJ' },
//     { id: '2', name: 'Bob Smith', avatar: '', initials: 'BS' },
//     { id: '3', name: 'Charlie Brown', avatar: '', initials: 'CB' },
//   ];

//   const handleInvite = () => {
//     if (!inviteEmail.trim()) return;
//     toast.success(`Invite sent to ${inviteEmail}`);
//     setInviteEmail('');
//     setIsInviteOpen(false);
//   };

//   return (
//     <div className="flex items-center justify-end p-3 border-b bg-background/95 backdrop-blur">
//       <div className="flex items-center space-x-4">
//         {/* Team Avatars */}
//         <div className="flex -space-x-2">
//           {teamMembers.map((member) => (
//             <Avatar key={member.id} className="border-2 border-background w-8 h-8">
//               <AvatarImage src={member.avatar} alt={member.name} />
//               <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
//             </Avatar>
//           ))}
//         </div>

//         {/* Invite Button */}
//         <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
//           <DialogTrigger asChild>
//             <Button variant="outline" size="sm">
//               <UserPlus className="h-4 w-4 mr-2" />
//               Invite
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Invite Team Member</DialogTitle>
//               <DialogDescription>
//                 Send an invitation to collaborate on this board
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4">
//               <Input
//                 placeholder="Enter email address"
//                 value={inviteEmail}
//                 onChange={(e) => setInviteEmail(e.target.value)}
//               />
//               <div className="flex justify-end space-x-2">
//                 <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleInvite}>Send Invite</Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Share Button */}
//         <Button variant="outline" size="sm" onClick={() => toast.info('Share link copied to clipboard')}>
//           <Share2 className="h-4 w-4 mr-2" />
//           Share
//         </Button>

//         {/* Add Column Button */}
//         <Button onClick={onAddColumn}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Column
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default BoardHeader;
import { useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { GroupDetails } from '@/components/groups/GroupDetails';
import { Priority } from '@/lib/types';

// Mock data for development
const mockGroup = {
  id: 1,
  name: 'Study Group',
  description: 'A group for studying together and tracking progress',
  goalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  totalTasks: 6,
  completedTasks: 2,
  progress: 33,
};

const mockMembers = [
  { id: 1, name: 'Sophia Lee', role: 'admin', completed: 2, total: 4, avatar: null },
  { id: 2, name: 'Alex Johnson', role: 'member', completed: 1, total: 3, avatar: null },
  { id: 3, name: 'Emma Wilson', role: 'member', completed: 0, total: 2, avatar: null },
  { id: 4, name: 'Noah Garcia', role: 'member', completed: 2, total: 3, avatar: null },
  { id: 5, name: 'Olivia Brown', role: 'member', completed: 1, total: 2, avatar: null },
];

const mockTasks: Array<{
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  dueTime?: string;
  priority: Priority;
  completed: boolean;
  assignedTo?: number;
  createdBy: number;
}> = [
  {
    id: 1,
    title: 'Complete chapter 5 exercises',
    description: 'Work through all practice problems at the end of the chapter',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    dueTime: '18:00',
    priority: 'high',
    completed: true,
    assignedTo: 1,
    createdBy: 1,
  },
  {
    id: 2,
    title: 'Research paper outline',
    description: 'Create a detailed outline for the research paper',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    priority: 'medium',
    completed: false,
    assignedTo: 2,
    createdBy: 1,
  },
  {
    id: 3,
    title: 'Review lecture notes',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    priority: 'low',
    completed: false,
    assignedTo: 3,
    createdBy: 2,
  },
  {
    id: 4,
    title: 'Prepare presentation slides',
    description: 'Create slides for the final presentation',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    priority: 'medium',
    completed: true,
    assignedTo: 4,
    createdBy: 1,
  },
  {
    id: 5,
    title: 'Schedule group meeting',
    description: 'Find a time that works for everyone to discuss progress',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    dueTime: '12:00',
    priority: 'urgent',
    completed: false,
    assignedTo: 1,
    createdBy: 1,
  },
  {
    id: 6,
    title: 'Share study resources',
    description: 'Compile and share useful resources with the group',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    priority: 'low',
    completed: false,
    assignedTo: 5,
    createdBy: 2,
  },
];

export default function GroupView() {
  const [match, params] = useRoute('/groups/:id');
  const groupId = match ? parseInt(params.id) : null;
  
  // In a real implementation, we would fetch the group data using the ID
  // const { isLoading, error, data } = useQuery({
  //   queryKey: ['/api/groups', groupId],
  //   enabled: !!groupId
  // });
  
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  // For mock data, we're ignoring the actual groupId parameter
  const group = mockGroup;
  const members = mockMembers;
  const tasks = mockTasks;
  
  if (!groupId) return <div>Group not found</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Back to Groups
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="sr-only">Group Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddTaskModalOpen(true)}>
            Add Task
          </Button>
          <Button variant="outline">
            Invite Member
          </Button>
        </div>
      </div>
      
      <GroupDetails 
        group={group}
        members={members}
        tasks={tasks}
      />
      
      {/* In a full implementation, we would add a CreateTaskModal component here */}
      {/* <CreateTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        groupId={groupId}
      /> */}
    </div>
  );
}
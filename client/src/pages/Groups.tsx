import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';
import { formatDateForInput } from '@/lib/date';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';

// Mock data to use until API integration
const mockGroups = [
  {
    id: 1,
    name: 'Study Group',
    description: 'A group for studying together and tracking progress',
    memberCount: 5,
    goalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    progress: 45,
    totalTasks: 20,
    completedTasks: 9,
  },
  {
    id: 2,
    name: 'Project Team',
    description: 'Working on the quarterly project',
    memberCount: 8,
    goalDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    progress: 72,
    totalTasks: 25,
    completedTasks: 18,
  },
  {
    id: 3,
    name: 'Fitness Challenge',
    description: 'Group for fitness goals and accountability',
    memberCount: 3,
    goalDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    progress: 20,
    totalTasks: 30,
    completedTasks: 6,
  }
];

export default function Groups() {
  const [groups, setGroups] = useState(mockGroups);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-gray-500 mt-1">Collaborate with others on shared goals</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Group
        </Button>
      </div>
      
      {groups.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-4">You're not in any groups yet</h2>
          <p className="text-gray-500 mb-6">Create a group to collaborate with others on shared tasks and goals</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Your First Group</Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <Badge variant="outline" className="bg-blue-50">
                      {group.progress}% Complete
                    </Badge>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <Progress 
                      value={group.progress} 
                      className={`h-2 ${getProgressColor(group.progress)}`} 
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        <span>{group.memberCount} members</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>Due {formatDateForInput(group.goalDate)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Tasks</span>
                      <span>{group.completedTasks}/{group.totalTasks}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
      
      <CreateGroupModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
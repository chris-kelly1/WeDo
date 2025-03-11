import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateForInput } from '@/lib/date';
import { Badge } from '@/components/ui/badge';
import { GroupTaskList } from './GroupTaskList';

interface Member {
  id: number;
  name: string;
  avatar?: string;
  role: string;
  completed: number;
  total: number;
}

interface GroupTask {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  assignedTo?: number;
  createdBy: number;
}

interface GroupDetailsProps {
  group: {
    id: number;
    name: string;
    description: string;
    goalDate: Date;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  };
  members: Member[];
  tasks: GroupTask[];
}

export function GroupDetails({ group, members, tasks }: GroupDetailsProps) {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  
  // For demonstration, we'll handle these functions as no-ops
  const handleTaskComplete = (taskId: number) => {
    console.log('Complete task:', taskId);
  };
  
  const handleTaskReassign = (taskId: number, userId: number) => {
    console.log('Reassign task:', taskId, 'to user:', userId);
  };
  
  const handleTaskDelete = (taskId: number) => {
    console.log('Delete task:', taskId);
  };
  
  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-gray-500 mt-1">{group.description}</p>
          <p className="text-sm mt-2">
            <span className="font-medium">Goal date:</span> {formatDateForInput(group.goalDate)}
          </p>
        </div>
        
        <div className="flex flex-col justify-center">
          <div className="text-center mb-2">
            <span className="text-lg font-semibold">{group.progress}%</span>
            <span className="text-gray-500 ml-2">completed</span>
          </div>
          <Progress value={group.progress} className="w-full md:w-40 h-2" />
        </div>
      </div>
      
      <Tabs defaultValue="tasks">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Group Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupTaskList 
                tasks={tasks}
                members={members}
                onComplete={handleTaskComplete}
                onDelete={handleTaskDelete}
                onReassign={handleTaskReassign}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Group Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{member.completed}/{member.total}</p>
                      <p className="text-sm text-gray-500">tasks completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
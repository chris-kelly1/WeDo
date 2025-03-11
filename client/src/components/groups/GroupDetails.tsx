import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarDays, 
  Clock, 
  Users, 
  CheckSquare, 
  Plus, 
  UserPlus,
  Settings,
  AlertCircle
} from "lucide-react";

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
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  assignedTo: number;
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
  const admin = members.find(member => member.role === 'admin');
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // Sort tasks by due date (most urgent first)
  const sortedTasks = [...incompleteTasks].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Goal: {group.goalDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {members.length} members
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {group.completedTasks}/{group.totalTasks} tasks completed
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
          {admin?.id === 1 && (
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage Group
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Group Progress</CardTitle>
          <CardDescription>Overall progress towards group goal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Total Progress</span>
                <span className="font-medium">{group.progress}%</span>
              </div>
              <Progress value={group.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Task Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                      {group.completedTasks}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Remaining</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {group.totalTasks - group.completedTasks}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Group Lead</h3>
                {admin && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={admin.avatar} alt={admin.name} />
                      <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">Group Admin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Group Tasks</h2>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {sortedTasks.length === 0 ? (
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No pending tasks</h3>
                <p className="text-muted-foreground">All tasks have been completed!</p>
              </div>
            ) : (
              sortedTasks.map(task => {
                const assignedMember = members.find(m => m.id === task.assignedTo);
                const isOverdue = task.dueDate < new Date();
                const isDueToday = new Date().toDateString() === task.dueDate.toDateString();
                
                return (
                  <Card key={task.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-grow p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                          </div>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                              {isOverdue && <AlertCircle className="h-3 w-3 inline mr-1" />}
                              {isDueToday ? 'Due Today' : task.dueDate.toLocaleDateString()}
                            </span>
                          </div>
                          
                          {assignedMember && (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={assignedMember.avatar} alt={assignedMember.name} />
                                <AvatarFallback className="text-[10px]">{assignedMember.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{assignedMember.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 flex items-center md:justify-center">
                        <Button size="sm" variant={task.completed ? "outline" : "default"}>
                          {task.completed ? "Completed" : "Mark Complete"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Group Members</h2>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Task Progress</span>
                      <span>{member.completed}/{member.total} ({Math.round((member.completed / Math.max(member.total, 1)) * 100)}%)</span>
                    </div>
                    <Progress value={(member.completed / Math.max(member.total, 1)) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <div className="bg-muted/50 p-6 rounded-lg text-center">
              <p>Group activity tracking will be implemented soon!</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
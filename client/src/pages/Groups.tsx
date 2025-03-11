import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarDays, 
  Clock, 
  Users, 
  CheckSquare, 
  Plus, 
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";

// Mock data for groups
const mockGroups = [
  {
    id: 1,
    name: "Website Redesign",
    description: "Collaborative project to redesign company website",
    goalDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    createdBy: 1,
    members: [
      { id: 1, name: "Sophia Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", role: "admin" },
      { id: 2, name: "Alex Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", role: "member" },
      { id: 3, name: "Maria Garcia", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", role: "member" }
    ],
    totalTasks: 8,
    completedTasks: 3,
    progress: 37,
    tasksStatus: {
      overdue: 1,
      dueToday: 2,
      upcoming: 5
    }
  },
  {
    id: 2,
    name: "Coding Study Group",
    description: "Group for learning and practicing coding together",
    goalDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdBy: 2,
    members: [
      { id: 2, name: "Alex Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", role: "admin" },
      { id: 1, name: "Sophia Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", role: "member" },
      { id: 4, name: "Tyrone Williams", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", role: "member" }
    ],
    totalTasks: 6,
    completedTasks: 1,
    progress: 16,
    tasksStatus: {
      overdue: 0,
      dueToday: 1,
      upcoming: 5
    }
  }
];

export default function Groups() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Groups</h1>
          <p className="text-muted-foreground">Collaborative task groups you're a part of</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGroups.map(group => (
          <Card key={group.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{group.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>View Tasks</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Invite Member</DropdownMenuItem>
                    <DropdownMenuItem>Leave Group</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{group.description}</CardDescription>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <CalendarDays className="h-4 w-4" />
                <span>Goal: {group.goalDate.toLocaleDateString()}</span>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{group.progress}%</span>
                  </div>
                  <Progress value={group.progress} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {group.tasksStatus.overdue > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {group.tasksStatus.overdue} Overdue
                    </Badge>
                  )}
                  {group.tasksStatus.dueToday > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-500">
                      <Clock className="h-3 w-3" />
                      {group.tasksStatus.dueToday} Due Today
                    </Badge>
                  )}
                  {group.tasksStatus.upcoming > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {group.tasksStatus.upcoming} Upcoming
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {group.members.length} members
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {group.completedTasks}/{group.totalTasks} tasks
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-3 border-t">
              <div className="flex -space-x-2">
                {group.members.slice(0, 3).map(member => (
                  <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {group.members.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                    +{group.members.length - 3}
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
        
        {/* Create New Group Card */}
        <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsCreateModalOpen(true)}>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <p className="font-medium text-lg">Create a New Group</p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Start collaborating on tasks with your team
          </p>
        </Card>
      </div>

      <CreateGroupModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
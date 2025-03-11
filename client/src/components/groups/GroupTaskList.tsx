import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Clock, 
  CalendarDays, 
  AlertCircle,
  Calendar,
  Tag,
  User
} from "lucide-react";
import { Priority } from "@/lib/types";

interface Member {
  id: number;
  name: string;
  avatar?: string;
  role: string;
}

interface GroupTask {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  dueTime?: string;
  priority: Priority;
  completed: boolean;
  assignedTo?: number;
  createdBy: number;
}

interface GroupTaskListProps {
  tasks: GroupTask[];
  members: Member[];
  onComplete: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onReassign?: (taskId: number, userId: number) => void;
}

export function GroupTaskList({ tasks, members, onComplete, onDelete, onReassign }: GroupTaskListProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterAssignee, setFilterAssignee] = useState<number | "all">("all");
  
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === "all" || 
      (filterStatus === "pending" && !task.completed) || 
      (filterStatus === "completed" && task.completed);
    
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
    
    const assigneeMatch = filterAssignee === "all" || task.assignedTo === filterAssignee;
    
    return statusMatch && priorityMatch && assigneeMatch;
  });
  
  // Sort tasks: overdue first, then by due date, then by priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by whether task is overdue
    const now = new Date();
    const aIsOverdue = !a.completed && a.dueDate < now;
    const bIsOverdue = !b.completed && b.dueDate < now;
    
    if (aIsOverdue !== bIsOverdue) {
      return aIsOverdue ? -1 : 1;
    }
    
    // Then sort by due date
    if (a.dueDate.getTime() !== b.dueDate.getTime()) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    
    // Finally sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const checkIsOverdue = (date: Date) => {
    const now = new Date();
    return date < now;
  };
  
  const checkIsDueToday = (date: Date) => {
    const now = new Date();
    return date.getDate() === now.getDate() && 
           date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  };
  
  const formatDueDate = (date: Date) => {
    if (checkIsDueToday(date)) {
      return "Today";
    } else if (checkIsOverdue(date)) {
      return `Overdue: ${date.toLocaleDateString()}`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Status</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </Button>
            <Button 
              size="sm" 
              variant={filterStatus === "completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("completed")}
            >
              Completed
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Priority</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={filterPriority === "all" ? "default" : "outline"}
              onClick={() => setFilterPriority("all")}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filterPriority === "urgent" ? "default" : "outline"}
              onClick={() => setFilterPriority("urgent")}
              className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 border-red-200"
            >
              Urgent
            </Button>
            <Button 
              size="sm" 
              variant={filterPriority === "high" ? "default" : "outline"}
              onClick={() => setFilterPriority("high")}
              className="bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 border-orange-200"
            >
              High
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Assignee</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={filterAssignee === "all" ? "default" : "outline"}
              onClick={() => setFilterAssignee("all")}
            >
              All Members
            </Button>
            <Button 
              size="sm" 
              variant={filterAssignee === 1 ? "default" : "outline"}
              onClick={() => setFilterAssignee(1)}
              className="flex gap-2 items-center"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sophia" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span>My Tasks</span>
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Group Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {sortedTasks.length === 0 ? (
              <div className="text-center p-8">
                <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">No tasks found</h3>
                <p className="text-muted-foreground text-sm">
                  {filterStatus === "all" 
                    ? "This group has no tasks matching your filters." 
                    : filterStatus === "pending" 
                    ? "No pending tasks. Create a new task or change your filters." 
                    : "No completed tasks yet."}
                </p>
              </div>
            ) : (
              sortedTasks.map(task => {
                const assignedMember = task.assignedTo ? members.find(m => m.id === task.assignedTo) : undefined;
                const isOverdue = !task.completed && checkIsOverdue(task.dueDate);
                const isDueToday = !task.completed && checkIsDueToday(task.dueDate);
                
                return (
                  <div key={task.id} className={`flex items-start gap-4 p-4 rounded-lg border ${task.completed ? 'bg-muted/50' : isOverdue ? 'border-red-200 bg-red-50' : isDueToday ? 'border-orange-200 bg-orange-50' : ''}`}>
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.completed}
                      onCheckedChange={() => onComplete(task.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <label 
                            htmlFor={`task-${task.id}`}
                            className={`font-medium cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {task.title}
                          </label>
                          
                          {task.description && (
                            <p className={`text-sm text-muted-foreground mt-1 ${task.completed ? 'line-through' : ''}`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            <Tag className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>
                          
                          <Badge variant="outline" className={`flex items-center gap-1 ${isOverdue ? 'text-red-800 border-red-800' : isDueToday ? 'text-orange-800 border-orange-800' : ''}`}>
                            {isOverdue 
                              ? <AlertCircle className="h-3 w-3" /> 
                              : isDueToday 
                              ? <Clock className="h-3 w-3" /> 
                              : <CalendarDays className="h-3 w-3" />
                            }
                            {formatDueDate(task.dueDate)}
                          </Badge>
                          
                          {assignedMember && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {assignedMember.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {(onDelete || onReassign) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          
                          {onReassign && (
                            <>
                              <DropdownMenuItem onClick={() => onReassign(task.id, 1)}>
                                Assign to me
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                              {members.map(member => (
                                <DropdownMenuItem 
                                  key={member.id}
                                  onClick={() => onReassign(task.id, member.id)}
                                  className="flex items-center gap-2"
                                >
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {member.name}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                            </>
                          )}
                          
                          {onDelete && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(task.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Delete Task
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
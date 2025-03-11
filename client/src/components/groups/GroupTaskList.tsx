import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Pencil, MoreVertical, Trash2, UserPlus } from 'lucide-react';
import { formatRelativeTime } from '@/lib/date';
import { Priority } from '@/lib/types';

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
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  
  const handleTaskClick = (taskId: number) => {
    const newSelectedTasks = new Set(selectedTasks);
    if (selectedTasks.has(taskId)) {
      newSelectedTasks.delete(taskId);
    } else {
      newSelectedTasks.add(taskId);
    }
    setSelectedTasks(newSelectedTasks);
  };
  
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const checkIsOverdue = (date: Date) => {
    return new Date(date) < new Date() && !getIsToday(date);
  };
  
  const getIsToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const getAssignedMember = (assignedTo?: number) => {
    if (!assignedTo) return 'Unassigned';
    const member = members.find(m => m.id === assignedTo);
    return member ? member.name : 'Unknown';
  };
  
  return (
    <div>
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tasks found for this group.</p>
          <Button className="mt-4" variant="outline">Add a Task</Button>
        </div>
      ) : (
        <Table>
          <TableCaption>Group tasks and their status</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow 
                key={task.id} 
                className={task.completed ? 'opacity-60 bg-gray-50' : ''}
              >
                <TableCell>
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => onComplete(task.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div>{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-500">{task.description}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className={
                    checkIsOverdue(task.dueDate) 
                      ? 'text-red-600 font-medium' 
                      : getIsToday(task.dueDate) 
                        ? 'text-orange-600 font-medium' 
                        : ''
                  }>
                    {formatRelativeTime(task.dueDate)}
                    {task.dueTime && <span className="text-sm text-gray-500 block">{task.dueTime}</span>}
                  </div>
                </TableCell>
                <TableCell>{getAssignedMember(task.assignedTo)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onComplete(task.id)}
                        className="cursor-pointer"
                      >
                        <Checkbox className="mr-2" checked={task.completed} />
                        Mark as {task.completed ? 'incomplete' : 'complete'}
                      </DropdownMenuItem>
                      
                      {onReassign && members.length > 0 && (
                        <DropdownMenuItem className="cursor-pointer">
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Reassign</span>
                        </DropdownMenuItem>
                      )}
                      
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(task.id)}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
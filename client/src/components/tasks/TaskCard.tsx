import { useState } from 'react';
import { Priority, Task } from '@/lib/types';
import { 
  Clock, 
  MoreVertical,
  Check,
  Edit2,
  Trash2,
  PenLine
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatTaskTime } from '@/lib/date';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskCardProps {
  task: Task;
  isExpanded?: boolean;
  onToggleExpand: () => void;
  onComplete: () => void;
  onEdit: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

export function TaskCard({ 
  task, 
  isExpanded = false,
  onToggleExpand,
  onComplete, 
  onEdit, 
  onDelete 
}: TaskCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueTime: task.dueTime || ''
  });
  
  const getPriorityBadgeStyles = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-amber-100 text-amber-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatPriority = (priority: Priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const handleTaskEdit = () => {
    onEdit(editedTask);
    setIsEditDialogOpen(false);
  };

  const handleTaskClick = () => {
    onToggleExpand();
  };

  return (
    <>
      <div className={cn(
        "task-card bg-white rounded-lg shadow hover:shadow-md transition-all p-4",
        "hover:translate-y-[-2px] duration-200",
        task.completed && "bg-gray-50"
      )}>
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-1">
            <Button 
              variant="outline"
              size="icon"
              className={cn(
                "h-5 w-5 rounded-full p-0 border-2", 
                task.completed 
                  ? "border-success bg-success" 
                  : "border-success bg-white"
              )}
              onClick={onComplete}
            >
              <Check className={cn(
                "h-3 w-3", 
                task.completed ? "text-white" : "text-success opacity-0"
              )} />
            </Button>
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 
                className={cn(
                  "text-lg font-medium cursor-pointer", 
                  task.completed && "line-through text-gray-500"
                )}
                onClick={handleTaskClick}
              >
                {task.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span 
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getPriorityBadgeStyles(task.priority)
                  )}
                >
                  {formatPriority(task.priority)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onComplete}>
                      {task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onToggleExpand}>
                      {isExpanded ? 'Show less' : 'Show more'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <PenLine className="h-4 w-4 mr-2" /> Edit task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {(isExpanded || (task.description?.length && task.description.length < 60)) && (
              <p 
                className={cn(
                  "mt-1",
                  task.completed ? "text-gray-400 line-through" : "text-gray-600"
                )}
              >
                {task.description}
              </p>
            )}
            <div 
              className={cn(
                "mt-2 flex items-center text-sm",
                task.completed ? "text-gray-400" : "text-gray-500"
              )}
            >
              <Clock className="mr-1 h-3 w-3" />
              <span>{formatTaskTime(task.dueTime)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={editedTask.title} 
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={editedTask.description} 
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={editedTask.priority}
                onValueChange={(value) => setEditedTask({...editedTask, priority: value as Priority})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input 
                id="dueTime" 
                type="time"
                value={editedTask.dueTime} 
                onChange={(e) => setEditedTask({...editedTask, dueTime: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTaskEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Task Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

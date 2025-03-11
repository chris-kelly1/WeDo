import { createContext, useContext, ReactNode, useState } from 'react';
import { Task, Priority } from '@/lib/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';

interface TaskContextType {
  tasks: Task[];
  todayTasks: Task[];
  isLoading: boolean;
  isAddingTask: boolean;
  isAddTaskModalOpen: boolean;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  addTask: (task: Omit<Task, 'id' | 'userId' | 'completed' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: number, taskUpdate: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (id: number) => Promise<boolean>;
  toggleTaskCompletion: (task: Task) => Promise<Task | undefined>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const { toast } = useToast();

  const userId = currentUser?.id || 1; // Fallback to 1 for demo purposes
  
  // Get all tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: [`/api/tasks?userId=${userId}`],
    enabled: !!userId,
  });
  
  // Get today's tasks
  const { data: todayTasks = [], isLoading: isLoadingTodayTasks } = useQuery<Task[]>({
    queryKey: [`/api/tasks/today?userId=${userId}`],
    enabled: !!userId,
  });
  
  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'userId' | 'completed' | 'createdAt'>) => {
      const taskWithUserId = { ...task, userId };
      console.log("Adding task:", taskWithUserId);
      const response = await apiRequest('POST', '/api/tasks', taskWithUserId);
      const data = await response.json();
      console.log("Task created response:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Success! Invalidating queries.");
      queryClient.invalidateQueries({ queryKey: [`/api/tasks?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/today?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/today?userId=${userId}`] });
      toast({
        title: "Success!",
        description: "Task added successfully",
      });
      setIsAddTaskModalOpen(false);
    },
    onError: (error) => {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...taskUpdate }: { id: number } & Partial<Task>) => {
      const response = await apiRequest('PATCH', `/api/tasks/${id}`, taskUpdate);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/today?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/today?userId=${userId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/today?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/today?userId=${userId}`] });
      toast({
        title: "Success!",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const openAddTaskModal = () => setIsAddTaskModalOpen(true);
  const closeAddTaskModal = () => setIsAddTaskModalOpen(false);
  
  const addTask = async (task: Omit<Task, 'id' | 'userId' | 'completed' | 'createdAt'>) => {
    return addTaskMutation.mutateAsync(task);
  };
  
  const updateTask = async (id: number, taskUpdate: Partial<Task>) => {
    return updateTaskMutation.mutateAsync({ id, ...taskUpdate });
  };
  
  const deleteTask = async (id: number) => {
    return deleteTaskMutation.mutateAsync(id);
  };
  
  const toggleTaskCompletion = async (task: Task) => {
    try {
      // Optimistically update the task in the cache to prevent UI flickering
      const optimisticTask = { ...task, completed: !task.completed };
      
      // Update tasks in the cache
      queryClient.setQueryData([`/api/tasks?userId=${userId}`], (oldData: Task[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(t => t.id === task.id ? optimisticTask : t);
      });
      
      queryClient.setQueryData([`/api/tasks/today?userId=${userId}`], (oldData: Task[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(t => t.id === task.id ? optimisticTask : t);
      });
      
      // Make API call to update the server
      const response = await apiRequest('PATCH', `/api/tasks/${task.id}`, { 
        completed: !task.completed 
      });
      
      const updatedTask = await response.json();
      
      // Only invalidate stats query since we've already updated the tasks optimistically
      queryClient.invalidateQueries({ queryKey: [`/api/stats/today?userId=${userId}`] });
      
      return updatedTask;
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: [`/api/tasks?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/today?userId=${userId}`] });
      
      console.error("Error toggling task completion:", error);
      toast({
        title: "Error",
        description: "Failed to update task completion status",
        variant: "destructive",
      });
      return task; // Return original task on error
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        todayTasks,
        isLoading: isLoadingTasks || isLoadingTodayTasks,
        isAddingTask: addTaskMutation.isPending,
        isAddTaskModalOpen,
        openAddTaskModal,
        closeAddTaskModal,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

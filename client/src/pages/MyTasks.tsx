import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useTasks } from '@/context/TaskContext';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task } from '@/lib/types';
import { isToday, isFuture, isPast } from 'date-fns';

export default function MyTasks() {
  const { 
    tasks, 
    isLoading,
    toggleTaskCompletion,
    updateTask,
    deleteTask,
    openAddTaskModal
  } = useTasks();
  
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
  
  const toggleTaskExpanded = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Helper function to sort tasks by completion status (incomplete first, then completed)
  const sortTasksByCompletion = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      // Sort by completion status first (incomplete tasks come first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // If completion status is the same, sort by due date (oldest first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };
  
  // Filter tasks by tab and sort by completion status
  const todayTasks = sortTasksByCompletion(
    tasks.filter(task => isToday(new Date(task.dueDate)))
  );
  
  const upcomingTasks = sortTasksByCompletion(
    tasks.filter(task => isFuture(new Date(task.dueDate)))
  );
  
  const pastTasks = sortTasksByCompletion(
    tasks.filter(task => 
      isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
    )
  );
  
  const completedTasks = tasks.filter(task => task.completed);
  
  // Get incomplete past tasks
  const overdueTasks = pastTasks.filter(task => !task.completed);

  // Sort tasks by date and priority
  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      const priorityMap: Record<string, number> = {
        urgent: 3,
        high: 2,
        medium: 1,
        low: 0
      };
      
      return priorityMap[b.priority] - priorityMap[a.priority];
    });
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <Button 
          onClick={openAddTaskModal}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Task
        </Button>
      </div>
      
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="today" className="relative">
            Today
            {todayTasks.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full px-2 py-0.5">
                {todayTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {upcomingTasks.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full px-2 py-0.5">
                {upcomingTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="relative">
            Overdue
            {overdueTasks.length > 0 && (
              <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                {overdueTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading...</div>
          ) : todayTasks.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">No tasks for today</p>
              <Button 
                onClick={openAddTaskModal}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" /> Add New Task
              </Button>
            </div>
          ) : (
            sortTasks(todayTasks).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isExpanded={expandedTasks.includes(task.id)}
                onToggleExpand={() => toggleTaskExpanded(task.id)}
                onComplete={() => toggleTaskCompletion(task)}
                onEdit={(updates) => updateTask(task.id, updates)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading...</div>
          ) : upcomingTasks.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No upcoming tasks</p>
            </div>
          ) : (
            sortTasks(upcomingTasks).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isExpanded={expandedTasks.includes(task.id)}
                onToggleExpand={() => toggleTaskExpanded(task.id)}
                onComplete={() => toggleTaskCompletion(task)}
                onEdit={(updates) => updateTask(task.id, updates)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading...</div>
          ) : overdueTasks.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No overdue tasks</p>
            </div>
          ) : (
            sortTasks(overdueTasks).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isExpanded={expandedTasks.includes(task.id)}
                onToggleExpand={() => toggleTaskExpanded(task.id)}
                onComplete={() => toggleTaskCompletion(task)}
                onEdit={(updates) => updateTask(task.id, updates)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading...</div>
          ) : completedTasks.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No completed tasks</p>
            </div>
          ) : (
            sortTasks(completedTasks).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isExpanded={expandedTasks.includes(task.id)}
                onToggleExpand={() => toggleTaskExpanded(task.id)}
                onComplete={() => toggleTaskCompletion(task)}
                onEdit={(updates) => updateTask(task.id, updates)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
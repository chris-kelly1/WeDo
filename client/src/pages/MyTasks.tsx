import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
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
import { isToday, isFuture, isPast, isYesterday } from 'date-fns';

export default function MyTasks() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { 
    tasks, 
    isLoading,
    toggleTaskCompletion,
    updateTask,
    deleteTask,
    openAddTaskModal
  } = useTasks();
  
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  const toggleTaskExpanded = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };
  
  // Filter tasks by tab
  const todayTasks = tasks.filter(task => isToday(new Date(task.dueDate)));
  const upcomingTasks = tasks.filter(task => isFuture(new Date(task.dueDate)));
  const pastTasks = tasks.filter(task => 
    isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
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
    <div className="flex h-screen">
      {/* Main sidebar - desktop only */}
      <Sidebar />
      
      {/* Mobile sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={toggleMobileSidebar}
          ></div>
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full">
            <Sidebar className="relative z-50" />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1 h-full">
        <TopBar onMenuClick={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <Button onClick={openAddTaskModal}>
              <Plus className="mr-1 h-4 w-4" /> Add Task
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
                  <Button onClick={openAddTaskModal}>
                    <Plus className="mr-1 h-4 w-4" /> Add a task
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
        </main>
        
        <MobileNavigation />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

export function TodayTasks() {
  const { 
    todayTasks, 
    isLoading, 
    isAddTaskModalOpen, 
    openAddTaskModal, 
    closeAddTaskModal,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    isAddingTask
  } = useTasks();
  
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);
  
  const toggleTaskExpanded = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };
  
  const toggleSectionExpanded = () => {
    setIsSectionExpanded(!isSectionExpanded);
  };
  
  // Sort tasks by completion status (incomplete first)
  const displayTasks = [...todayTasks].sort((a, b) => {
    // Sort by completion status first (incomplete tasks first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // If completion status is the same, sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Today's Tasks</h2>
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Add Task
          </Button>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse mt-1"></div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={toggleSectionExpanded}>
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold text-gray-700">Today's Tasks</h2>
              <span className="ml-2 text-sm text-gray-500 bg-gray-100 rounded-full px-2">
                {todayTasks.length}
              </span>
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  openAddTaskModal();
                }}
                className="relative text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-5 w-5" />
                <span className="absolute inset-0 animate-ping opacity-50 rounded-full bg-blue-200 h-full w-full"></span>
              </Button>
              {isSectionExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
          
          {isSectionExpanded && (
            <div className="p-4 pt-0">
              {displayTasks.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500 mb-4">No tasks for today. Add your first task!</p>
                  <Button 
                    onClick={openAddTaskModal}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Add New Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isExpanded={expandedTasks.includes(task.id)}
                      onToggleExpand={() => toggleTaskExpanded(task.id)}
                      onComplete={() => toggleTaskCompletion(task)}
                      onEdit={(updates) => updateTask(task.id, updates)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={closeAddTaskModal} 
        onSubmit={addTask}
        isSubmitting={isAddingTask}
      />
    </div>
  );
}

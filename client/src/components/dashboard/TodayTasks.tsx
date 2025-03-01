import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { Task } from '@/lib/types';

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
  const [showAllTasks, setShowAllTasks] = useState(false);
  
  const toggleTaskExpanded = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };
  
  const displayTasks = showAllTasks ? todayTasks : todayTasks.slice(0, 5);
  
  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Today's Tasks</h2>
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Today's Tasks</h2>
        <Button onClick={openAddTaskModal}>
          <Plus className="mr-1 h-4 w-4" /> Add Task
        </Button>
      </div>
      
      {displayTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No tasks for today. Add your first task!</p>
          <Button onClick={openAddTaskModal}>
            <Plus className="mr-1 h-4 w-4" /> Add Task
          </Button>
        </div>
      ) : (
        <>
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
          
          {todayTasks.length > 5 && (
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                className="text-primary font-medium hover:text-indigo-700"
                onClick={() => setShowAllTasks(!showAllTasks)}
              >
                {showAllTasks ? 'Show less' : `View all tasks (${todayTasks.length})`}
              </Button>
            </div>
          )}
        </>
      )}
      
      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={closeAddTaskModal} 
        onSubmit={addTask}
        isSubmitting={isAddingTask}
      />
    </div>
  );
}

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { DailyOverview } from '@/components/dashboard/DailyOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subDays } from 'date-fns';
import { useTasks } from '@/context/TaskContext';
import { useUser } from '@/context/UserContext';
import { Task, Priority } from '@/lib/types';

export default function Progress() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { tasks, isLoading } = useTasks();
  const { currentUser } = useUser();
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Generate data for the weekly completion chart
  const generateWeeklyData = () => {
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayTasks = tasks.filter(task => 
        new Date(task.dueDate).toDateString() === date.toDateString()
      );
      
      const totalTasks = dayTasks.length;
      const completedTasks = dayTasks.filter(task => task.completed).length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      data.push({
        name: format(date, 'E'),
        completionRate,
        completed: completedTasks,
        total: totalTasks
      });
    }
    
    return data;
  };

  // Generate data for the priority distribution chart
  const generatePriorityData = () => {
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };
    
    tasks.forEach(task => {
      priorityCounts[task.priority]++;
    });
    
    return [
      { name: 'Low', value: priorityCounts.low, color: '#10B981' },
      { name: 'Medium', value: priorityCounts.medium, color: '#4F46E5' },
      { name: 'High', value: priorityCounts.high, color: '#F59E0B' },
      { name: 'Urgent', value: priorityCounts.urgent, color: '#EF4444' }
    ];
  };

  // Task completion statistics
  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, completedTasks, completionRate };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="lg:pl-64 flex flex-col flex-1 h-full">
          <TopBar onMenuClick={toggleMobileSidebar} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
            <div className="text-center p-8">Loading progress data...</div>
          </main>
          <MobileNavigation />
        </div>
      </div>
    );
  }

  const weeklyData = generateWeeklyData();
  const priorityData = generatePriorityData();
  const { totalTasks, completedTasks, completionRate } = getTaskStats();

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
          <h1 className="text-2xl font-bold mb-6">Progress Overview</h1>
          
          <DailyOverview />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Overall Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{completionRate}%</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Task Completion</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'completionRate') return [`${value}%`, 'Completion Rate'];
                        return [value, name];
                      }}
                      labelFormatter={(value) => `Day: ${value}`}
                    />
                    <Bar dataKey="completionRate" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Task Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [value, 'Tasks']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Streak</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {currentUser?.streak || 0}
                  </div>
                  <p className="text-gray-500">Days in a row</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <MobileNavigation />
      </div>
    </div>
  );
}

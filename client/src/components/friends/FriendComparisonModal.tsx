import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Task, Priority } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { X, ChevronRight, Award, CheckCircle2, Clock, Target, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface FriendComparisonModalProps {
  friend: User & { progress: number };
  isOpen: boolean;
  onClose: () => void;
}

interface ComparisonData {
  user: User;
  friend: User;
  userTasks: Task[];
  friendTasks: Task[];
  userStats: { completed: number; total: number; byPriority: Record<string, number> };
  friendStats: { completed: number; total: number; byPriority: Record<string, number> };
}

export function FriendComparisonModal({ friend, isOpen, onClose }: FriendComparisonModalProps) {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['/api/friends', friend.id, 'comparison'],
    enabled: isOpen && !!currentUser?.id && !!friend?.id,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/friends/${friend.id}/comparison?userId=${currentUser?.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }
        const data = await response.json();
        return data as ComparisonData;
      } catch (error) {
        console.error('Error fetching comparison data:', error);
        throw error;
      }
    },
  });
  
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "low": return "bg-blue-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-orange-500";
      case "urgent": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };
  
  const PRIORITY_COLORS = {
    low: "#3B82F6",
    medium: "#FBBF24", 
    high: "#F97316",
    urgent: "#EF4444"
  };
  
  // Convert priority data for pie chart
  const getPriorityPieData = (byPriority: Record<string, number>) => {
    return Object.entries(byPriority).map(([name, value]) => ({
      name,
      value
    })).filter(item => item.value > 0);
  };
  
  // Convert comparison data for bar chart
  const getComparisonBarData = () => {
    if (!comparison) return [];
    
    const userCompletionRate = comparison.userStats.total > 0 
      ? Math.round((comparison.userStats.completed / comparison.userStats.total) * 100) 
      : 0;
      
    const friendCompletionRate = comparison.friendStats.total > 0 
      ? Math.round((comparison.friendStats.completed / comparison.friendStats.total) * 100) 
      : 0;
    
    return [
      {
        name: "Completion Rate",
        [currentUser?.name || "You"]: userCompletionRate,
        [friend.name]: friendCompletionRate
      },
      {
        name: "Tasks Completed",
        [currentUser?.name || "You"]: comparison.userStats.completed,
        [friend.name]: comparison.friendStats.completed
      },
      {
        name: "Total Tasks",
        [currentUser?.name || "You"]: comparison.userStats.total,
        [friend.name]: comparison.friendStats.total
      }
    ];
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={friend.avatar || ""} alt={friend.name} />
              <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{friend.name}</span>
          </SheetTitle>
          <SheetDescription>
            Compare your task completion with {friend.name}
          </SheetDescription>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading comparison data...</p>
            </div>
          ) : !comparison ? (
            <div className="flex justify-center p-8">
              <p>Failed to load comparison data</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              <TabsContent value="overview" className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex gap-2 items-center">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={currentUser?.avatar || ""} alt={currentUser?.name || "You"} />
                          <AvatarFallback>{currentUser?.name?.charAt(0) || "Y"}</AvatarFallback>
                        </Avatar>
                        {currentUser?.name || "You"}
                      </CardTitle>
                      <CardDescription>
                        {comparison.userStats.completed} of {comparison.userStats.total} tasks completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress 
                        value={comparison.userStats.total > 0 
                          ? (comparison.userStats.completed / comparison.userStats.total) * 100 
                          : 0
                        } 
                        className="h-2" 
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex gap-2 items-center">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={friend.avatar || ""} alt={friend.name} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {friend.name}
                      </CardTitle>
                      <CardDescription>
                        {comparison.friendStats.completed} of {comparison.friendStats.total} tasks completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress 
                        value={comparison.friendStats.total > 0 
                          ? (comparison.friendStats.completed / comparison.friendStats.total) * 100 
                          : 0
                        } 
                        className="h-2" 
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Task Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getComparisonBarData()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey={currentUser?.name || "You"} 
                            fill="#4f46e5" 
                            name={currentUser?.name || "You"}
                          />
                          <Bar 
                            dataKey={friend.name} 
                            fill="#06b6d4" 
                            name={friend.name}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {currentUser?.name || "You"}'s streak: {currentUser?.streak || 0} days
                  </p>
                  <p className="text-sm text-gray-500">
                    {friend.name}'s streak: {friend.streak} days
                  </p>
                </div>
              </TabsContent>
              
              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-sm font-medium mb-1">Your recent tasks</h3>
                  <ul className="space-y-2">
                    {comparison.userTasks.slice(0, 5).map((task: Task) => (
                      <li key={task.id} className="flex items-center p-2 rounded-md border">
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          getPriorityColor(task.priority)
                        )} />
                        <span className={cn(
                          "flex-1 text-sm truncate",
                          task.completed && "line-through text-gray-500"
                        )}>
                          {task.title}
                        </span>
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                          task.completed ? "bg-green-500" : "border-2 border-green-500 bg-white"
                        )}>
                          {task.completed && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </li>
                    ))}
                    {comparison.userTasks.length === 0 && (
                      <p className="text-sm text-gray-500">No tasks found</p>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">{friend.name}'s recent tasks</h3>
                  <ul className="space-y-2">
                    {comparison.friendTasks.slice(0, 5).map((task: Task) => (
                      <li key={task.id} className="flex items-center p-2 rounded-md border">
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          getPriorityColor(task.priority)
                        )} />
                        <span className={cn(
                          "flex-1 text-sm truncate",
                          task.completed && "line-through text-gray-500"
                        )}>
                          {task.title}
                        </span>
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                          task.completed ? "bg-green-500" : "border-2 border-green-500 bg-white"
                        )}>
                          {task.completed && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </li>
                    ))}
                    {comparison.friendTasks.length === 0 && (
                      <p className="text-sm text-gray-500">No tasks found</p>
                    )}
                  </ul>
                </div>
              </TabsContent>
              
              {/* Stats Tab */}
              <TabsContent value="stats">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Your priority pie chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Your Priority Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPriorityPieData(comparison.userStats.byPriority)}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {getPriorityPieData(comparison.userStats.byPriority).map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={PRIORITY_COLORS[entry.name as Priority] || "#gray"} 
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Friend's priority pie chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{friend.name}'s Priority Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPriorityPieData(comparison.friendStats.byPriority)}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {getPriorityPieData(comparison.friendStats.byPriority).map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={PRIORITY_COLORS[entry.name as Priority] || "#gray"} 
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Priority Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                    <div key={priority} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1" 
                        style={{ backgroundColor: color }} 
                      />
                      <span className="text-xs capitalize">{priority}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
        
        <SheetClose className="absolute top-4 right-4">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
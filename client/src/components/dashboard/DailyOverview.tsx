import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { DailyStats } from '@/lib/types';
import { useUser } from '@/context/UserContext';

export function DailyOverview() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;

  const { data: stats, isLoading } = useQuery<DailyStats>({
    queryKey: [`/api/stats/today?userId=${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="mb-4">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="mt-3 sm:mt-0">
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-6"></div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <div className="h-6 w-8 mx-auto bg-gray-200 rounded animate-pulse mt-1"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <div className="h-6 w-8 mx-auto bg-gray-200 rounded animate-pulse mt-1"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Streak</p>
                <div className="h-6 w-16 mx-auto bg-gray-200 rounded animate-pulse mt-1"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="text-center text-gray-500">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { completedTasks, totalTasks, progress, date, streak } = stats;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Today's Progress</h2>
        <div className="text-sm font-medium text-gray-500">{date}</div>
      </div>
      
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-medium mb-1">
                {completedTasks} of {totalTasks} tasks completed
              </h3>
              <p className="text-gray-500">
                {progress >= 75 
                  ? "You're doing great today!" 
                  : progress >= 50 
                  ? "You're making good progress!" 
                  : progress > 0 
                  ? "Keep going, you're making progress!" 
                  : "Get started with your tasks for today!"}
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="text-4xl font-bold text-primary bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{progress}%</span>
            </div>
          </div>
          
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <Progress className="absolute top-0 left-0 h-full rounded-full" value={progress} />
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-semibold text-success">{completedTasks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-xl font-semibold text-warning">{totalTasks - completedTasks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-xl font-semibold text-primary">{streak} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

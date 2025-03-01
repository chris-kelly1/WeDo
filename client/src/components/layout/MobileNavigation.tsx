import { Link, useLocation } from 'wouter';
import { Home, CheckSquare, BarChart2, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/context/TaskContext';

export function MobileNavigation() {
  const [location] = useLocation();
  const { openAddTaskModal } = useTasks();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: null, label: 'Add', path: '', action: openAddTaskModal },
    { icon: BarChart2, label: 'Progress', path: '/progress' },
    { icon: Users, label: 'Friends', path: '/friends' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-10">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item, index) => {
          const isActive = item.path && location === item.path;
          const Icon = item.icon;
          
          // Center "Add" button
          if (index === 2) {
            return (
              <div key="add-button" className="flex justify-center">
                <Button
                  className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
                  onClick={item.action}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            );
          }
          
          // Regular nav items
          return (
            <Link
              key={item.path || index}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center",
                isActive ? "text-primary" : "text-gray-500"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

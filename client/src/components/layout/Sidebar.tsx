import { Link, useLocation } from 'wouter';
import { useUser } from '@/context/UserContext';
import { UserProfile } from '@/components/ui/UserProfile';
import { cn } from '@/lib/utils';
import { Home, CheckSquare, BarChart2, Users, Settings } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { currentUser, isLoading } = useUser();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
    { icon: BarChart2, label: 'Progress', path: '/progress' },
    { icon: Users, label: 'Friends', path: '/friends' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={cn("hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 py-4 px-3", className)}>
      <div className="flex items-center justify-center h-14 mb-8">
        <h1 className="text-2xl font-bold text-primary">TaskStep</h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex items-center px-4 py-3 rounded-md group",
                isActive 
                  ? "text-gray-900 bg-gray-100" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-gray-500")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <UserProfile user={currentUser} isLoading={isLoading} />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'wouter';
import { Bell, Menu, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationsPanel } from '@/components/ui/NotificationsPanel';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { currentUser } = useUser();
  const { 
    notifications, 
    unreadCount, 
    isNotificationsPanelOpen, 
    openNotificationsPanel, 
    closeNotificationsPanel,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  return (
    <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className="flex items-center lg:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
        <Link href="/">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent ml-3">WeDo</h1>
        </Link>
      </div>
      
      <div className="hidden sm:flex items-center ml-4 lg:ml-0">
        <div className="relative">
          <Input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full sm:w-64 pl-10"
          />
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={openNotificationsPanel}
            className="text-gray-600 hover:text-gray-900"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>
        </div>
        <div className="lg:hidden">
          {currentUser && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      <NotificationsPanel
        notifications={notifications}
        isOpen={isNotificationsPanelOpen}
        onClose={closeNotificationsPanel}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </header>
  );
}

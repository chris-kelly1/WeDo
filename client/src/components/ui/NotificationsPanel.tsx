import { useRef, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Notification } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BellRing, UserPlus, Flag, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/date";

interface NotificationsPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: number) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

export function NotificationsPanel({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationsPanelProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <BellRing className="text-primary h-5 w-5" />;
      case 'friend_activity':
        return <UserPlus className="text-success h-5 w-5" />;
      default:
        return <Flag className="text-warning h-5 w-5" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:w-80 p-0">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <SheetHeader className="p-0">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        
        {notifications.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          </div>
        )}
        
        <ScrollArea className="h-[calc(100vh-8rem)] p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`py-3 border-b border-gray-200 ${!notification.read ? 'bg-gray-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-sm text-gray-500">{notification.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

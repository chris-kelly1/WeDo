import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Notification } from '@/lib/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useUser } from './UserContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isNotificationsPanelOpen: boolean;
  openNotificationsPanel: () => void;
  closeNotificationsPanel: () => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

  const userId = currentUser?.id || 1; // Fallback to 1 for demo purposes
  
  // Get notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: [`/api/notifications?userId=${userId}`],
    enabled: !!userId,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/notifications/${id}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications?userId=${userId}`] });
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const openNotificationsPanel = () => setIsNotificationsPanelOpen(true);
  const closeNotificationsPanel = () => setIsNotificationsPanelOpen(false);

  const markAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync(id);
  };

  const markAllAsRead = async () => {
    // For demo purposes, mark each notification as read sequentially
    for (const notification of notifications.filter(n => !n.read)) {
      await markAsRead(notification.id);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isNotificationsPanelOpen,
        openNotificationsPanel,
        closeNotificationsPanel,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

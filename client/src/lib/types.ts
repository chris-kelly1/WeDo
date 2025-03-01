export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  streak: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  dueDate: string | Date;
  dueTime?: string;
  priority: Priority;
  completed: boolean;
  createdAt: string | Date;
}

export interface Friend extends User {
  progress: number;
}

export type NotificationType = 'reminder' | 'friend_activity' | 'system';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message?: string;
  type: NotificationType;
  read: boolean;
  createdAt: string | Date;
}

export interface DailyStats {
  date: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  streak: number;
}

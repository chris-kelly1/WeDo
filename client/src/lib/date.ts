import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

export function formatTaskDate(date: Date | string): string {
  const taskDate = new Date(date);
  
  if (isToday(taskDate)) {
    return 'Today';
  } else if (isTomorrow(taskDate)) {
    return 'Tomorrow';
  } else if (isYesterday(taskDate)) {
    return 'Yesterday';
  }
  
  return format(taskDate, 'EEE, MMM d');
}

export function formatTaskTime(time?: string): string {
  if (!time) return '';
  
  // Handle time strings like "14:30"
  const [hours, minutes] = time.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return time;
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getCurrentFormattedDate(): string {
  return format(new Date(), 'EEEE, MMMM d');
}

export function formatDateForInput(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function isTaskDueSoon(dueDate: Date | string, dueTime?: string): boolean {
  const now = new Date();
  const taskDate = new Date(dueDate);
  
  if (!isToday(taskDate)) {
    return false;
  }
  
  if (!dueTime) {
    return true;
  }
  
  const [hours, minutes] = dueTime.split(':').map(Number);
  const dueDateTime = new Date(taskDate);
  dueDateTime.setHours(hours, minutes);
  
  // If task is due within 2 hours
  return dueDateTime.getTime() - now.getTime() <= 2 * 60 * 60 * 1000;
}

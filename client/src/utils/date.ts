import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export const formatDate = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

export const formatRelativeTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${formatTime(dateObj)}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${formatTime(dateObj)}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${formatTime(dateObj)}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatDueDate = (dueDate: string | Date) => {
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const now = new Date();
  
  if (isToday(dateObj)) {
    return 'Due today';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Due tomorrow';
  }
  
  if (dateObj < now) {
    return `Overdue by ${formatDistanceToNow(dateObj)}`;
  }
  
  return `Due ${formatDistanceToNow(dateObj, { addSuffix: true })}`;
};

export const isOverdue = (dueDate: string | Date) => {
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return dateObj < new Date() && !isToday(dateObj);
};

export const getDaysInStreak = (lastCompleted: string | Date | null) => {
  if (!lastCompleted) return 0;
  
  const lastDate = typeof lastCompleted === 'string' ? parseISO(lastCompleted) : lastCompleted;
  const today = new Date();
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const formatInputDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

export const formatInputDateTime = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

export interface User {
  id: string;
  stack_user_id?: string;
  name: string;
  email: string;
  age?: number;
  profile_picture_url?: string;
  email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires?: string;
  task_reminders_enabled: boolean;
  otp_token?: string;
  otp_expires?: string;
  otp_purpose?: 'verify_email' | 'forgot_password' | '2fa_login';
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  created_at: Date;
  updated_at: Date;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_url: string;
  file_type: 'image' | 'audio' | 'document';
  file_name: string;
  file_size: number;
  created_at: Date;
}

export interface Journal {
  id: string;
  task_id: string;
  entry: string;
  created_at: Date;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  streak_count: number;
  last_completed?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
}

export interface ProductivityInsight {
  date: string;
  completed_tasks: number;
  total_tasks: number;
  completion_rate: number;
}

export interface HabitCompletion {
  habit_id: string;
  completed_date: Date;
}

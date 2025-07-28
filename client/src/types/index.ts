export interface User {
  id: string;
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
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  journals?: Journal[];
  attachment_count?: number;
  journal_count?: number;
  has_notes?: boolean;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_url: string;
  file_type: 'image' | 'audio' | 'document';
  file_name: string;
  file_size: number;
  created_at: string;
}

export interface Journal {
  id: string;
  task_id: string;
  entry: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  streak_count: number;
  last_completed?: string;
  created_at: string;
  updated_at: string;
  completed_today?: boolean;
  completion_history?: { completed_date: string }[];
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
  daily_stats: {
    date: string;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  }[];
  priority_stats: {
    priority: string;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  }[];
  hourly_stats: {
    hour: number;
    completed_tasks: number;
  }[];
  completion_time: {
    avg_completion_hours: number;
    tasks_with_completion_time: number;
  };
  current_streak: number;
  habit_stats: {
    name: string;
    streak_count: number;
    total_completions: number;
    weekly_completions: number;
  }[];
}

export interface WorkloadAnalysis {
  weekly_workload: {
    week_start: string;
    total_tasks: number;
    high_priority_tasks: number;
    medium_priority_tasks: number;
    low_priority_tasks: number;
  }[];
  overdue_tasks: {
    overdue_count: number;
    high_priority_overdue: number;
  };
  this_week_tasks: {
    due_this_week: number;
    high_priority_this_week: number;
  };
}

export type Theme = 'dark' | 'minimal';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface HyperspeedOptions {
  onSpeedUp?: () => void;
  onSlowDown?: () => void;
  distortion?: string;
  length?: number;
  roadWidth?: number;
  islandWidth?: number;
  lanesPerRoad?: number;
  fov?: number;
  fovSpeedUp?: number;
  speedUp?: number;
  carLightsFade?: number;
  totalSideLightSticks?: number;
  lightPairsPerRoadWay?: number;
  shoulderLinesWidthPercentage?: number;
  brokenLinesWidthPercentage?: number;
  brokenLinesLengthPercentage?: number;
  lightStickWidth?: [number, number];
  lightStickHeight?: [number, number];
  movingAwaySpeed?: [number, number];
  movingCloserSpeed?: [number, number];
  carLightsLength?: [number, number];
  carLightsRadius?: [number, number];
  carWidthPercentage?: [number, number];
  carShiftX?: [number, number];
  carFloorSeparation?: [number, number];
  colors?: {
    roadColor?: number;
    islandColor?: number;
    background?: number;
    shoulderLines?: number;
    brokenLines?: number;
    leftCars?: number[];
    rightCars?: number[];
    sticks?: number;
  };
}

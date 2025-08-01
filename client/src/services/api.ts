import api from '@/utils/api';
import { 
  User, 
  Task, 
  Habit, 
  Journal, 
  Attachment, 
  ApiResponse, 
  TaskFilters,
  ProductivityInsight,
  WorkloadAnalysis
} from '@/types';

// User API
export const userApi = {
  getProfile: () => api.get<ApiResponse<User>>('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>('/users/profile', data),
  deleteProfile: () => api.delete<ApiResponse>('/users/profile'),
  getStats: () => api.get<ApiResponse>('/users/stats'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<ApiResponse>('/users/change-password', data),
  toggle2FA: (data: { enabled: boolean }) =>
    api.post<ApiResponse<{ two_factor_enabled: boolean }>>('/users/toggle-2fa', data),
};

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string } | { requires2FA: boolean; userId: string }>>('/auth/login', data),
  refreshToken: () => api.post<ApiResponse<{ token: string }>>('/auth/refresh'),
  verify2FA: (data: { userId: string; otp: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/verify-2fa', data),
  forgotPassword: (data: { email: string }) =>
    api.post<ApiResponse>('/auth/forgot-password', data),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post<ApiResponse>('/auth/reset-password', data),
};

// Email API
export const emailApi = {
  sendVerification: () => api.post<ApiResponse>('/email/send-verification'),
  verifyEmail: (otp: string) => api.post<ApiResponse>('/email/verify', { otp }),
  updateTaskReminders: (enabled: boolean) => api.post<ApiResponse>('/users/toggle-alerts', { enabled }),
  getStatus: () => api.get<ApiResponse<{ email_verified: boolean; task_reminders_enabled: boolean }>>('/email/status'),
};

// Tasks API
export const tasksApi = {
  getTasks: (filters?: TaskFilters) => api.get<ApiResponse<Task[]>>('/tasks', { params: filters }),
  getTask: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  createTask: (data: Partial<Task>) => api.post<ApiResponse<Task>>('/tasks', data),
  updateTask: (id: string, data: Partial<Task>) => api.put<ApiResponse<Task>>(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete<ApiResponse>(`/tasks/${id}`),
};

// Habits API
export const habitsApi = {
  getHabits: () => api.get<ApiResponse<Habit[]>>('/habits'),
  getHabit: (id: string) => api.get<ApiResponse<Habit>>(`/habits/${id}`),
  createHabit: (data: Partial<Habit>) => api.post<ApiResponse<Habit>>('/habits', data),
  updateHabit: (id: string, data: Partial<Habit>) => api.put<ApiResponse<Habit>>(`/habits/${id}`, data),
  deleteHabit: (id: string) => api.delete<ApiResponse>(`/habits/${id}`),
  completeHabit: (id: string) => api.post<ApiResponse<Habit>>(`/habits/${id}/complete`),
};

// Journals API
export const journalsApi = {
  getAllJournals: () => api.get<ApiResponse<Journal[]>>('/journals'),
  getTaskJournals: (taskId: string) => api.get<ApiResponse<Journal[]>>(`/journals/tasks/${taskId}`),
  createJournal: (taskId: string, data: { entry: string }) => 
    api.post<ApiResponse<Journal>>(`/journals/tasks/${taskId}`, data),
  updateJournal: (id: string, data: { entry: string }) => 
    api.put<ApiResponse<Journal>>(`/journals/${id}`, data),
  deleteJournal: (id: string) => api.delete<ApiResponse>(`/journals/${id}`),
};

// Attachments API
export const attachmentsApi = {
  getTaskAttachments: (taskId: string) => api.get<ApiResponse<Attachment[]>>(`/attachments/tasks/${taskId}`),
  uploadAttachment: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<Attachment>>(`/attachments/tasks/${taskId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAttachment: (id: string) => api.delete<ApiResponse>(`/attachments/${id}`),
};

// Analytics API
export const analyticsApi = {
  getProductivityInsights: (days?: number) => 
    api.get<ApiResponse<ProductivityInsight>>('/analytics/insights', { params: { days } }),
  getTaskTimeline: (startDate?: string, endDate?: string) => 
    api.get<ApiResponse>('/analytics/timeline', { 
      params: { start_date: startDate, end_date: endDate } 
    }),
  getWorkloadAnalysis: () => api.get<ApiResponse<WorkloadAnalysis>>('/analytics/workload'),
};

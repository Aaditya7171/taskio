import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
};

// Cookie keys
export const COOKIE_KEYS = {
  THEME: 'taskio_theme',
  USER_PREFERENCES: 'taskio_user_prefs',
  AUTH_TOKEN: 'taskio_auth_token',
  USER_DATA: 'taskio_user_data',
  LANGUAGE: 'taskio_language',
  SIDEBAR_COLLAPSED: 'taskio_sidebar_collapsed',
  DASHBOARD_LAYOUT: 'taskio_dashboard_layout',
  TASK_VIEW_MODE: 'taskio_task_view_mode',
  LAST_VISITED_PAGE: 'taskio_last_page',
  NOTIFICATION_SETTINGS: 'taskio_notifications'
};

// Cookie utility functions
export const cookieUtils = {
  // Set a cookie
  set: (key: string, value: any, options?: Cookies.CookieAttributes) => {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      Cookies.set(key, serializedValue, { ...COOKIE_OPTIONS, ...options });
      return true;
    } catch (error) {
      console.error('Error setting cookie:', error);
      return false;
    }
  },

  // Get a cookie
  get: <T = any>(key: string, defaultValue?: T): T | null => {
    try {
      const value = Cookies.get(key);
      if (!value) return defaultValue || null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error('Error getting cookie:', error);
      return defaultValue || null;
    }
  },

  // Remove a cookie
  remove: (key: string) => {
    try {
      Cookies.remove(key, { path: '/' });
      return true;
    } catch (error) {
      console.error('Error removing cookie:', error);
      return false;
    }
  },

  // Check if cookie exists
  exists: (key: string): boolean => {
    return Cookies.get(key) !== undefined;
  },

  // Clear all Taskio cookies
  clearAll: () => {
    try {
      Object.values(COOKIE_KEYS).forEach(key => {
        Cookies.remove(key, { path: '/' });
      });
      return true;
    } catch (error) {
      console.error('Error clearing cookies:', error);
      return false;
    }
  }
};

// Theme-specific cookie functions
export const themeCookies = {
  setTheme: (theme: 'light' | 'dark' | 'system') => {
    return cookieUtils.set(COOKIE_KEYS.THEME, theme);
  },

  getTheme: (): 'light' | 'dark' | 'system' => {
    return cookieUtils.get(COOKIE_KEYS.THEME, 'system') || 'system';
  },

  removeTheme: () => {
    return cookieUtils.remove(COOKIE_KEYS.THEME);
  }
};

// User preferences cookie functions
export const userPreferencesCookies = {
  setPreferences: (preferences: Record<string, any>) => {
    return cookieUtils.set(COOKIE_KEYS.USER_PREFERENCES, preferences);
  },

  getPreferences: (): Record<string, any> => {
    return cookieUtils.get(COOKIE_KEYS.USER_PREFERENCES, {}) || {};
  },

  updatePreference: (key: string, value: any) => {
    const currentPrefs = userPreferencesCookies.getPreferences();
    const updatedPrefs = { ...currentPrefs, [key]: value };
    return cookieUtils.set(COOKIE_KEYS.USER_PREFERENCES, updatedPrefs);
  },

  removePreferences: () => {
    return cookieUtils.remove(COOKIE_KEYS.USER_PREFERENCES);
  }
};

// Auth-related cookie functions
export const authCookies = {
  setAuthToken: (token: string) => {
    return cookieUtils.set(COOKIE_KEYS.AUTH_TOKEN, token, {
      expires: 7, // 7 days for auth token
      httpOnly: false, // Allow JS access for API calls
      secure: process.env.NODE_ENV === 'production'
    });
  },

  getAuthToken: (): string | null => {
    return cookieUtils.get(COOKIE_KEYS.AUTH_TOKEN);
  },

  removeAuthToken: () => {
    return cookieUtils.remove(COOKIE_KEYS.AUTH_TOKEN);
  },

  setUserData: (userData: any) => {
    return cookieUtils.set(COOKIE_KEYS.USER_DATA, userData, {
      expires: 7 // 7 days
    });
  },

  getUserData: (): any => {
    return cookieUtils.get(COOKIE_KEYS.USER_DATA);
  },

  removeUserData: () => {
    return cookieUtils.remove(COOKIE_KEYS.USER_DATA);
  },

  clearAuthCookies: () => {
    authCookies.removeAuthToken();
    authCookies.removeUserData();
  }
};

// UI state cookie functions
export const uiStateCookies = {
  setSidebarCollapsed: (collapsed: boolean) => {
    return cookieUtils.set(COOKIE_KEYS.SIDEBAR_COLLAPSED, collapsed);
  },

  getSidebarCollapsed: (): boolean => {
    return cookieUtils.get(COOKIE_KEYS.SIDEBAR_COLLAPSED, false) || false;
  },

  setTaskViewMode: (mode: 'list' | 'kanban' | 'calendar') => {
    return cookieUtils.set(COOKIE_KEYS.TASK_VIEW_MODE, mode);
  },

  getTaskViewMode: (): 'list' | 'kanban' | 'calendar' => {
    return cookieUtils.get(COOKIE_KEYS.TASK_VIEW_MODE, 'kanban') || 'kanban';
  },

  setLastVisitedPage: (page: string) => {
    return cookieUtils.set(COOKIE_KEYS.LAST_VISITED_PAGE, page);
  },

  getLastVisitedPage: (): string | null => {
    return cookieUtils.get(COOKIE_KEYS.LAST_VISITED_PAGE);
  },

  setDashboardLayout: (layout: any) => {
    return cookieUtils.set(COOKIE_KEYS.DASHBOARD_LAYOUT, layout);
  },

  getDashboardLayout: (): any => {
    return cookieUtils.get(COOKIE_KEYS.DASHBOARD_LAYOUT);
  }
};

// Notification settings cookie functions
export const notificationCookies = {
  setNotificationSettings: (settings: any) => {
    return cookieUtils.set(COOKIE_KEYS.NOTIFICATION_SETTINGS, settings);
  },

  getNotificationSettings: (): any => {
    return cookieUtils.get(COOKIE_KEYS.NOTIFICATION_SETTINGS, {
      email: true,
      push: true,
      taskReminders: true,
      habitReminders: true,
      weeklyReports: true
    });
  },

  updateNotificationSetting: (key: string, value: boolean) => {
    const currentSettings = notificationCookies.getNotificationSettings();
    const updatedSettings = { ...currentSettings, [key]: value };
    return cookieUtils.set(COOKIE_KEYS.NOTIFICATION_SETTINGS, updatedSettings);
  }
};

export default cookieUtils;

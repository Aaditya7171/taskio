import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import api from '@/utils/api';
import { authApi } from '@/services/api';
import { authCookies } from '@/utils/cookies';
import { googleAuthService } from '@/services/googleAuth';

// Temporarily disable Stack Auth to focus on JWT authentication
// const stackApp = new StackClientApp({
//   projectId: import.meta.env.VITE_STACK_PROJECT_ID || '',
//   publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '',
//   baseUrl: import.meta.env.VITE_STACK_BASE_URL || 'https://api.stack-auth.com',
// });

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authMethod: 'jwt' | 'google' | null;
  loginWithJWT: (email: string, password: string) => Promise<{ requires2FA?: boolean; userId?: string }>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verify2FA: (userId: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  googleAuth: () => Promise<any>;
  setGoogleUser: (user: User) => void;
  // Temporarily disabled Stack Auth
  loginWithStack?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<'jwt' | 'google' | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Google redirect result is handled by GoogleAuthRedirectHandler component

        // Check for JWT token (cookies then localStorage fallback)
        const jwtToken = authCookies.getAuthToken() || localStorage.getItem('jwt-auth-token');
        if (jwtToken) {
          try {
            const response = await api.get('/users/profile');
            if (response.data.success) {
              setUser(response.data.data);
              setAuthMethod('jwt');
              // Migrate from localStorage to cookies if needed
              if (!authCookies.getAuthToken() && localStorage.getItem('jwt-auth-token')) {
                authCookies.setAuthToken(jwtToken);
                authCookies.setUserData(response.data.data);
                localStorage.removeItem('jwt-auth-token');
              }
              setIsLoading(false);
              return;
            }
          } catch (error) {
            // Clear both cookie and localStorage on error
            authCookies.clearAuthCookies();
            localStorage.removeItem('jwt-auth-token');
          }
        }

        // Stack Auth temporarily disabled
        // Focus on JWT authentication for now
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Stack Auth listener temporarily disabled

    return () => {
      // Cleanup if needed
    };
  }, [authMethod]);

  const loginWithStack = () => {
    console.warn('Stack Auth temporarily disabled');
    throw new Error('Stack Auth not available in this version');
  };

  const loginWithJWT = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.data.success) {
        const data = response.data.data;

        // Check if 2FA is required
        if (data && 'requires2FA' in data && data.requires2FA) {
          return { requires2FA: true, userId: data.userId };
        }

        // Normal login flow
        if (data && 'user' in data && 'token' in data) {
          authCookies.setAuthToken(data.token);
          authCookies.setUserData(data.user);
          setUser(data.user);
          setAuthMethod('jwt');
          return {};
        }
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const verify2FA = async (userId: string, otp: string) => {
    try {
      const response = await authApi.verify2FA({ userId, otp });
      if (response.data.success && response.data.data) {
        const { user: userData, token } = response.data.data;
        authCookies.setAuthToken(token);
        authCookies.setUserData(userData);
        setUser(userData);
        setAuthMethod('jwt');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '2FA verification failed');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword({ email });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send password reset code');
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      await authApi.resetPassword({ email, otp, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ name, email, password });
      if (response.data.success && response.data.data) {
        const { user: userData, token } = response.data.data;
        authCookies.setAuthToken(token);
        authCookies.setUserData(userData);
        setUser(userData);
        setAuthMethod('jwt');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    if (authMethod === 'jwt') {
      // Clear both cookies and localStorage
      authCookies.clearAuthCookies();
      localStorage.removeItem('jwt-auth-token');
    }

    setUser(null);
    setAuthMethod(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Also update localStorage if using JWT
      if (authMethod === 'jwt') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  const googleAuth = async () => {
    try {
      console.log('🔐 Starting Google authentication...');

      const result = await googleAuthService.signInWithPopup();

      if (result.success && result.user && result.token) {
        setUser(result.user);
        setAuthMethod('google');

        console.log('✅ Google authentication successful');
        return result;
      } else {
        throw new Error(result.error || 'Google authentication failed');
      }
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      throw error;
    }
  };

  // Method to set user and auth method (for Google Auth button)
  const setGoogleUser = (user: User) => {
    setUser(user);
    setAuthMethod('google');
    console.log('✅ Google user set in AuthContext:', user.email);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    authMethod,
    loginWithStack,
    loginWithJWT,
    register,
    verify2FA,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
    googleAuth,
    setGoogleUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

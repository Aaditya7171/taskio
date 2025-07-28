import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import Aurora from './components/ui/Aurora';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Layout Components
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

// Page Components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GettingStartedPage from './pages/GettingStartedPage';
import TasksPage from './pages/TasksPage';
import HabitsPage from './pages/HabitsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import NotFoundPage from './pages/NotFoundPage';
import GoogleAuthRedirectHandler from './components/auth/GoogleAuthRedirectHandler';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to getting-started if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/getting-started" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { theme } = useTheme();

  // Aurora background options based on theme
  const auroraColors = theme === 'dark'
    ? ["#FF1CF7", "#B249F8", "#00D4FF", "#7C3AED", "#EC4899"]
    : ["#FF69B4", "#9D4EDD", "#4CC9F0", "#7209B7", "#F72585"];

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <ErrorBoundary fallback={<div className="w-full h-full bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5" />}>
          <Aurora
            colorStops={auroraColors}
            blend={0.4}
            amplitude={1.0}
            speed={0.3}
          />
        </ErrorBoundary>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Google Auth Redirect Handler */}
          <Route
            path="/auth/google/callback"
            element={<GoogleAuthRedirectHandler />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/getting-started" replace />} />
            <Route path="getting-started" element={<GettingStartedPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="verify-email" element={<EmailVerificationPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

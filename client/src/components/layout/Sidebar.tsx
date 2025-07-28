import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BarChart3,
  User,
  Menu,
  X,
  Zap,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/contexts/ThemeContext';

const navigation = [
  { name: 'Getting Started', href: '/getting-started', icon: Sparkles },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Habits', href: '/habits', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">Taskio</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-dark-700',
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500'
                    : 'text-gray-700 dark:text-gray-300'
                )
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
              {isActive && (
                <motion.div
                  className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme indicator */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <div className={cn(
            'w-2 h-2 rounded-full',
            theme === 'dark' ? 'bg-purple-500' : 'bg-gray-500'
          )} />
          <span>{theme === 'dark' ? 'Dark Theme' : 'Minimal Theme'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 dark:bg-dark-800/10 backdrop-blur-md border border-white/20 dark:border-dark-700/20 text-gray-900 dark:text-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/10 dark:bg-dark-800/10 backdrop-blur-md border-r border-white/20 dark:border-dark-700/20">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-dark-800/95 backdrop-blur-md border-r border-white/20 dark:border-dark-700/20"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

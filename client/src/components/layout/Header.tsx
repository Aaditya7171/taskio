import React, { useState } from 'react';
import { Search, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to tasks page with search query
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white/10 dark:bg-dark-800/10 backdrop-blur-md border-b border-white/20 dark:border-dark-700/20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, habits..."
                className="w-full pl-10 pr-4 py-2 bg-white/20 dark:bg-dark-700/20 border border-white/30 dark:border-dark-600/30 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
              />
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 bg-white/10 dark:bg-dark-700/10 backdrop-blur-sm border border-white/20 dark:border-dark-600/20"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.div>
            </Button>

            {/* Profile Picture */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 bg-white/10 dark:bg-dark-700/10 backdrop-blur-sm border border-white/20 dark:border-dark-600/20 rounded-full hover:bg-white/20 dark:hover:bg-dark-600/20 transition-all duration-200"
              onClick={() => window.location.href = '/profile'}
            >
              {user?.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

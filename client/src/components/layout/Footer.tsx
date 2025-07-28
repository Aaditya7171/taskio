import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Star } from 'lucide-react';
import AverageRating from '@/components/ui/AverageRating';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white/5 dark:bg-black/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Thank You Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Heart className="w-6 h-6 text-pink-500 mr-2 animate-pulse" />
              <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                Thank You!
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Thank you for using Taskio! We're grateful for your trust in helping you stay organized and productive. 
              Your journey to better productivity starts here.
            </p>
          </motion.div>

          {/* Features Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Features
              </h3>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>✨ Beautiful Aurora Background</li>
              <li>📋 Task & Habit Management</li>
              <li>📊 Analytics & Insights</li>
              <li>🎨 Dark/Light Theme</li>
              <li>📱 Responsive Design</li>
            </ul>
          </motion.div>

          {/* Contact & Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center md:text-right"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Connect
            </h3>
            <div className="flex flex-col items-center md:items-end space-y-4 mb-4">
              <a
                href="mailto:verifytaskio@gmail.com"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors duration-200 hover:scale-110 transform"
              >
                <Mail className="w-5 h-5" />
              </a>

              {/* Average Rating */}
              <div className="flex flex-col items-center space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">User Rating</p>
                <AverageRating showCount={true} size="sm" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Built with ❤️ for productivity
            </p>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Logo & Brand */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                Taskio
              </span>
            </motion.div>

            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center md:text-right"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} Taskio. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Made with passion for better productivity
              </p>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-1 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 rounded-full opacity-50"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

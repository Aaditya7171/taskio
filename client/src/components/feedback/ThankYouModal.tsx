import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Auto close after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.5 
          }}
          className={cn(
            'relative max-w-md w-full mx-auto p-8 rounded-2xl shadow-2xl',
            'bg-white dark:bg-gray-900',
            'border border-gray-200 dark:border-gray-700'
          )}
        >
          {/* Floating Elements */}
          <div className="absolute -top-2 -left-2">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-70"
            />
          </div>
          
          <div className="absolute -top-1 -right-3">
            <motion.div
              animate={{ 
                y: [-5, 5, -5],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-60"
            />
          </div>

          <div className="absolute -bottom-2 -right-1">
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full"
            />
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-20 h-20"
            >
              <div className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center',
                'bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500',
                'shadow-lg'
              )}>
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              {/* Sparkles around the icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400" />
                <Sparkles className="absolute -bottom-2 -left-2 w-3 h-3 text-pink-400" />
                <Sparkles className="absolute top-1/2 -left-3 w-3 h-3 text-blue-400" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Thank You! 
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block ml-2"
                >
                  💖
                </motion.span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Your feedback means the world to us! We're constantly working to make Taskio better for you.
              </p>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={cn(
                'p-4 rounded-lg',
                'bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50',
                'dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20',
                'border border-pink-200 dark:border-pink-800/30'
              )}
            >
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Your voice helps us grow and improve
                </span>
                <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
              </div>
            </motion.div>

            {/* Auto-close indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              This message will close automatically
            </motion.div>
          </div>

          {/* Progress bar for auto-close */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 rounded-b-2xl"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ThankYouModal;

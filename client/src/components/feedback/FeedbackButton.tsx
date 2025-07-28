import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import FeedbackModal from './FeedbackModal';
import ThankYouModal from './ThankYouModal';
import { cn } from '@/utils/cn';

const FeedbackButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize EmailJS
  useEffect(() => {
    // This is now handled in the FeedbackModal component
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFeedbackSuccess = () => {
    setIsThankYouOpen(true);
  };

  const handleCloseThankYou = () => {
    setIsThankYouOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.button
          onClick={handleOpenModal}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'relative flex items-center justify-center',
            'w-14 h-14 rounded-full shadow-lg',
            'bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500',
            'hover:from-pink-600 hover:via-purple-700 hover:to-blue-600',
            'transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
            isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Spotlight Effect */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.8, scale: 1.5 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-full bg-white dark:bg-purple-300 blur-xl"
                style={{ zIndex: -1 }}
              />
            )}
          </AnimatePresence>

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-70 blur-md" />

          {/* Icon */}
          <MessageSquare className="w-6 h-6 text-white relative z-10" />

          {/* Sparkles */}
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: 360 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute -top-1 -right-1 z-20"
                >
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: -360 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="absolute -bottom-1 -left-1 z-20"
                >
                  <Sparkles className="w-3 h-3 text-blue-300" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Label that appears on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 whitespace-nowrap"
            >
              <div className={cn(
                'px-3 py-1.5 rounded-lg shadow-md text-sm font-medium',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-white',
                'border border-gray-200 dark:border-gray-700'
              )}>
                Share Feedback
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleFeedbackSuccess}
      />

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={isThankYouOpen}
        onClose={handleCloseThankYou}
      />
    </>
  );
};

export default FeedbackButton;

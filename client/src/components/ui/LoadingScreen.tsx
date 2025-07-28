import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full"></div>
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold gradient-text mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Taskio
        </motion.h2>
        
        <motion.p
          className="text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Loading your productivity workspace...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;

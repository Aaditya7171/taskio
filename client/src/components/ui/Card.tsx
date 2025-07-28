import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  enableAnimation?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
  enableAnimation = true,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardContent = (
    <div
      className={cn(
        'bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-dark-700/50 transition-all duration-300 group relative overflow-hidden',
        hover && 'hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/90 dark:hover:bg-dark-800/90 hover:border-pink-200/50 dark:hover:border-pink-500/30',
        onClick && 'cursor-pointer',
        paddingClasses[padding],
        className
      )}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
           style={{ padding: '1px' }}>
        <div className="w-full h-full bg-white dark:bg-dark-800 rounded-xl" />
      </div>
    </div>
  );

  if (enableAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{
          scale: hover ? 1.02 : 1,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: onClick ? 0.98 : 1 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export default Card;

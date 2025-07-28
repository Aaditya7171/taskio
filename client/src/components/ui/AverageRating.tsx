import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useRating } from '@/contexts/RatingContext';
import { cn } from '@/utils/cn';

interface AverageRatingProps {
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AverageRating: React.FC<AverageRatingProps> = ({
  className,
  showCount = false,
  size = 'md'
}) => {
  const { averageRating, totalRatings } = useRating();

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  // If there are no ratings yet, don't display anything
  if (totalRatings === 0) {
    return null;
  }

  // Round to nearest 0.5
  const roundedRating = Math.round(averageRating * 2) / 2;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          // Full star
          if (star <= Math.floor(roundedRating)) {
            return (
              <motion.div
                key={star}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: star * 0.1, duration: 0.3 }}
              >
                <Star 
                  className={cn(
                    sizeClasses[size],
                    'text-yellow-400 fill-yellow-400'
                  )} 
                />
              </motion.div>
            );
          }
          // Half star
          else if (star === Math.ceil(roundedRating) && !Number.isInteger(roundedRating)) {
            return (
              <motion.div
                key={star}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: star * 0.1, duration: 0.3 }}
                className="relative"
              >
                {/* Background star (empty) */}
                <Star 
                  className={cn(
                    sizeClasses[size],
                    'text-gray-300 dark:text-gray-600'
                  )} 
                />
                {/* Foreground half star */}
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star 
                    className={cn(
                      sizeClasses[size],
                      'text-yellow-400 fill-yellow-400'
                    )} 
                  />
                </div>
              </motion.div>
            );
          }
          // Empty star
          else {
            return (
              <motion.div
                key={star}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: star * 0.1, duration: 0.3 }}
              >
                <Star 
                  className={cn(
                    sizeClasses[size],
                    'text-gray-300 dark:text-gray-600'
                  )} 
                />
              </motion.div>
            );
          }
        })}
      </div>
      
      {showCount && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {roundedRating.toFixed(1)}/5 - {totalRatings} {totalRatings === 1 ? 'user' : 'users'} rated
        </div>
      )}
    </div>
  );
};

export default AverageRating;

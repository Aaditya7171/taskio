import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  className
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const getStarColor = (starIndex: number) => {
    const currentRating = hoverRating || rating;
    if (starIndex <= currentRating) {
      return 'text-yellow-400 fill-yellow-400';
    }
    return 'text-gray-300 dark:text-gray-600';
  };

  return (
    <div 
      className={cn('flex items-center space-x-1', className)}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <motion.button
          key={starIndex}
          type="button"
          onClick={() => handleStarClick(starIndex)}
          onMouseEnter={() => handleStarHover(starIndex)}
          disabled={readonly}
          className={cn(
            'transition-all duration-200',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
          whileHover={!readonly ? { scale: 1.1 } : {}}
          whileTap={!readonly ? { scale: 0.95 } : {}}
        >
          <Star 
            className={cn(
              sizeClasses[size],
              getStarColor(starIndex),
              'transition-colors duration-200'
            )}
          />
        </motion.button>
      ))}
    </div>
  );
};

export default StarRating;

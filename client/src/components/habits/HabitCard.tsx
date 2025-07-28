import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Flame,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { Habit } from '@/types';
import { useCompleteHabit } from '@/hooks/useHabits';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface HabitCardProps {
  habit: Habit;
  onEdit: () => void;
  onShowCalendar: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onEdit, onShowCalendar }) => {
  const completeHabitMutation = useCompleteHabit();

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!habit.completed_today) {
      completeHabitMutation.mutate(habit.id);
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-600';
    if (streak >= 7) return 'text-yellow-600';
    if (streak >= 3) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStreakBgColor = (streak: number) => {
    if (streak >= 30) return 'bg-purple-100 dark:bg-purple-900/20';
    if (streak >= 14) return 'bg-orange-100 dark:bg-orange-900/20';
    if (streak >= 7) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (streak >= 3) return 'bg-green-100 dark:bg-green-900/20';
    return 'bg-gray-100 dark:bg-gray-900/20';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`p-6 cursor-pointer transition-all duration-200 group ${
          habit.completed_today 
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' 
            : 'hover:shadow-lg'
        }`}
        onClick={onEdit}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {habit.description}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getStreakBgColor(habit.streak_count)}`}>
            <Flame className={`w-5 h-5 ${getStreakColor(habit.streak_count)}`} />
            <span className={`font-bold ${getStreakColor(habit.streak_count)}`}>
              {habit.streak_count}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              day{habit.streak_count !== 1 ? 's' : ''}
            </span>
          </div>

          <Badge 
            variant={habit.completed_today ? 'success' : 'gray'}
            className="flex items-center space-x-1"
          >
            {habit.completed_today ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <Circle className="w-3 h-3" />
            )}
            <span>{habit.completed_today ? 'Done' : 'Pending'}</span>
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={habit.completed_today ? 'secondary' : 'primary'}
            onClick={handleComplete}
            disabled={habit.completed_today || completeHabitMutation.isLoading}
            className="flex-1"
          >
            {completeHabitMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : habit.completed_today ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 mr-2" />
                Mark Done
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onShowCalendar();
            }}
            className="px-3"
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Weekly Progress</span>
            <span>5/7 days</span> {/* This would be dynamic */}
          </div>
          <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '71%' }} // This would be dynamic
            />
          </div>
        </div>

        {/* Streak Milestones */}
        {habit.streak_count > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Next milestone:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {habit.streak_count < 7 ? '7 days' :
                 habit.streak_count < 14 ? '14 days' :
                 habit.streak_count < 30 ? '30 days' :
                 habit.streak_count < 100 ? '100 days' : '365 days'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1 mt-1">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (habit.streak_count % (
                    habit.streak_count < 7 ? 7 :
                    habit.streak_count < 14 ? 14 :
                    habit.streak_count < 30 ? 30 :
                    habit.streak_count < 100 ? 100 : 365
                  )) / (
                    habit.streak_count < 7 ? 7 :
                    habit.streak_count < 14 ? 14 :
                    habit.streak_count < 30 ? 30 :
                    habit.streak_count < 100 ? 100 : 365
                  ) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default HabitCard;

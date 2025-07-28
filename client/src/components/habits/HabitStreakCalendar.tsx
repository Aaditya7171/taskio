import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, TrendingUp } from 'lucide-react';
import { useHabit } from '@/hooks/useHabits';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface HabitStreakCalendarProps {
  habitId: string;
  isOpen: boolean;
  onClose: () => void;
}

const HabitStreakCalendar: React.FC<HabitStreakCalendarProps> = ({
  habitId,
  isOpen,
  onClose,
}) => {
  const { data: habit, isLoading } = useHabit(habitId);

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading...">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Modal>
    );
  }

  if (!habit) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Habit Not Found">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Habit not found or failed to load.
          </p>
        </div>
      </Modal>
    );
  }

  // Generate calendar data for the last 30 days
  const generateCalendarData = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Check if this date is in the completion history
      const isCompleted = habit.completion_history?.some(
        completion => new Date(completion.completed_date).toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        isCompleted,
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    
    return days;
  };

  const calendarData = generateCalendarData();
  const completedDays = calendarData.filter(day => day.isCompleted).length;
  const completionRate = Math.round((completedDays / 30) * 100);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${habit.name} - Progress Calendar`}
      size="lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getStreakBgColor(habit.streak_count)}`}>
                <Flame className={`w-5 h-5 ${getStreakColor(habit.streak_count)}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {habit.streak_count} days
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 30 Days</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {completedDays}/30
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {completionRate}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar Grid */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Last 30 Days
          </h3>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200
                  ${day.isCompleted
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-400 dark:text-gray-500'
                  }
                  ${day.isToday
                    ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-dark-800'
                    : ''
                  }
                `}
              >
                {day.date.getDate()}
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 dark:bg-dark-600 rounded"></div>
                <span>Missed</span>
              </div>
            </div>
            
            <Badge variant="primary">
              {completionRate}% success rate
            </Badge>
          </div>
        </Card>

        {/* Motivational Message */}
        <Card className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          <div className="text-center">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {habit.streak_count >= 21 
                ? '🎉 Amazing! You\'re building a strong habit!'
                : habit.streak_count >= 7
                ? '🔥 Great progress! Keep the momentum going!'
                : habit.streak_count >= 3
                ? '💪 You\'re on the right track!'
                : '🌱 Every journey starts with a single step!'
              }
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {habit.streak_count >= 21
                ? 'Research shows it takes 21+ days to form a habit. You\'re there!'
                : `${21 - habit.streak_count} more days to make this a solid habit!`
              }
            </p>
          </div>
        </Card>
      </motion.div>
    </Modal>
  );
};

export default HabitStreakCalendar;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Flame, Calendar, TrendingUp } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import HabitCard from '@/components/habits/HabitCard';
import HabitModal from '@/components/habits/HabitModal';
import HabitStreakCalendar from '@/components/habits/HabitStreakCalendar';

const HabitsPage: React.FC = () => {
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState<string | null>(null);

  const { data: habits = [], isLoading, error } = useHabits();

  const handleCreateHabit = () => {
    setSelectedHabitId(null);
    setShowHabitModal(true);
  };

  const handleEditHabit = (habitId: string) => {
    setSelectedHabitId(habitId);
    setShowHabitModal(true);
  };

  const handleCloseModal = () => {
    setShowHabitModal(false);
    setSelectedHabitId(null);
  };

  const handleShowCalendar = (habitId: string) => {
    setSelectedHabitForCalendar(habitId);
  };

  // Calculate stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(habit => habit.completed_today).length;
  const longestStreak = Math.max(...habits.map(h => h.streak_count), 0);
  const averageStreak = totalHabits > 0 
    ? Math.round(habits.reduce((sum, h) => sum + h.streak_count, 0) / totalHabits)
    : 0;

  const stats = [
    {
      title: 'Total Habits',
      value: totalHabits,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Completed Today',
      value: `${completedToday}/${totalHabits}`,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Longest Streak',
      value: longestStreak,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Average Streak',
      value: averageStreak,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load habits. Please try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build lasting habits and track your progress
          </p>
        </div>

        <Button onClick={handleCreateHabit}>
          <Plus className="w-4 h-4 mr-2" />
          New Habit
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Habits Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : habits.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center">
              <Target className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No habits yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start building good habits today. Create your first habit to begin your journey.
            </p>
            <Button onClick={handleCreateHabit}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Habit
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <HabitCard
                  habit={habit}
                  onEdit={() => handleEditHabit(habit.id)}
                  onShowCalendar={() => handleShowCalendar(habit.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Habit Modal */}
      {showHabitModal && (
        <HabitModal
          habitId={selectedHabitId}
          isOpen={showHabitModal}
          onClose={handleCloseModal}
        />
      )}

      {/* Habit Streak Calendar Modal */}
      {selectedHabitForCalendar && (
        <HabitStreakCalendar
          habitId={selectedHabitForCalendar}
          isOpen={!!selectedHabitForCalendar}
          onClose={() => setSelectedHabitForCalendar(null)}
        />
      )}
    </div>
  );
};

export default HabitsPage;

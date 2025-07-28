import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Plus,
  Calendar,
  Flame,
  Paperclip,
  MessageSquare
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import TaskModal from '@/components/tasks/TaskModal';
import HabitModal from '@/components/habits/HabitModal';
import MagicBento from '@/components/ui/MagicBento';
import { formatRelativeTime, isOverdue } from '@/utils/date';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: habits = [], isLoading: habitsLoading } = useHabits();

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  // Calculate stats
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const pendingTasks = tasks.filter(task => task.status !== 'done').length;
  const overdueTasks = tasks.filter(task => 
    task.due_date && isOverdue(task.due_date) && task.status !== 'done'
  ).length;
  

  const longestStreak = Math.max(...habits.map(h => h.streak_count), 0);

  const upcomingTasks = tasks
    .filter(task => task.status !== 'done' && task.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const recentTasks = tasks
    .filter(task => task.status === 'done')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  // Get completed and pending tasks for dashboard display
  const completedTasksForDisplay = tasks
    .filter(task => task.status === 'done')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  const pendingTasksForDisplay = tasks
    .filter(task => task.status !== 'done')
    .sort((a, b) => {
      // Sort by priority first, then by due date
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;

      if (aPriority !== bPriority) return aPriority - bPriority;

      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 3);



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'success';
      case 'in_progress': return 'primary';
      case 'todo': return 'gray';
      default: return 'gray';
    }
  };

  if (tasksLoading || habitsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Here's what's happening with your productivity today.
        </p>
      </motion.div>

      {/* Stats Grid with MagicBento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <MagicBento
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          disableAnimations={false}
          spotlightRadius={200}
          particleCount={3}
          enableTilt={false}
          glowColor={isDark ? "255, 28, 247" : "124, 58, 237"}
          clickEffect={false}
          enableMagnetism={false}
          isDark={isDark}
          dashboardData={{
            stats: {
              completedTasks: completedTasks,
              pendingTasks: pendingTasks,
              longestStreak: longestStreak || 1
            },
            upcomingTasks: upcomingTasks.slice(0, 6),
            recentActivity: recentTasks.slice(0, 4),
            completedTasks: completedTasksForDisplay,
            pendingTasks: pendingTasksForDisplay
          }}
        />
      </motion.div>

      {/* Overdue Tasks Alert */}
      {overdueTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  You have {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Review your tasks to stay on track
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upcoming Tasks
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTaskModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
            
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getPriorityColor(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatRelativeTime(task.due_date)}
                          </span>
                        )}

                        {/* Attachment Indicator */}
                        {(task.attachment_count && task.attachment_count > 0) && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full flex items-center">
                            <Paperclip className="w-3 h-3 mr-1" />
                            {task.attachment_count}
                          </span>
                        )}

                        {/* Notes Indicator */}
                        {task.has_notes && (
                          <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Notes
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(task.status)} size="sm">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No upcoming tasks. Great job! 🎉
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
              <Button size="sm" variant="ghost">
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Completed {formatRelativeTime(task.updated_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Habits Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Today's Habits
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsHabitModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.length > 0 ? (
              habits.slice(0, 6).map((habit) => (
                <div
                  key={habit.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    habit.completed_today
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {habit.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {habit.streak_count}
                      </span>
                      <Flame className={`w-4 h-4 ${
                        habit.streak_count > 0 ? 'text-orange-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge 
                      variant={habit.completed_today ? 'success' : 'gray'} 
                      size="sm"
                    >
                      {habit.completed_today ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No habits yet. Start building good habits today!
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      <TaskModal
        taskId={null}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <HabitModal
        habitId={null}
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;

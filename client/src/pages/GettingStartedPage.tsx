import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Target,
  BarChart3,
  Plus,
  Zap,
  Heart,
  Star,
  Bell,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTasks } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';
import TextTrail from '@/components/ui/TextTrail';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TaskModal from '@/components/tasks/TaskModal';
import HabitModal from '@/components/habits/HabitModal';
import CustomRobot from '@/components/ui/CustomRobot';

const GettingStartedPage: React.FC = () => {
  // Add CSS animation for gradient text
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  const isDark = theme === 'dark';

  // Motivational quotes
  const quotes = [
    "Every small step forward is progress worth celebrating! 🌟",
    "Your future self will thank you for the habits you build today! 💪",
    "Progress, not perfection, is the key to lasting change! ✨",
    "One task at a time, one day at a time - you've got this! 🚀",
    "Building better habits is building a better you! 🌱"
  ];

  // Cycle through quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // Calculate user stats
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const longestStreak = Math.max(...habits.map(h => h.streak_count), 0);
  const totalHabits = habits.length;

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickStartSteps = [
    {
      icon: CheckSquare,
      title: "Create Your First Task",
      description: "Start by adding a simple task to get organized",
      action: () => setIsTaskModalOpen(true),
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Target,
      title: "Build a Habit",
      description: "Choose one small habit to track daily",
      action: () => setIsHabitModalOpen(true),
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: BarChart3,
      title: "Track Your Progress",
      description: "View insights and celebrate your achievements",
      action: () => navigate('/analytics'),
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Bell,
      title: "Set Up Reminders",
      description: "Enable notifications to stay on track",
      action: () => navigate('/profile'),
      color: "from-orange-500 to-red-600"
    }
  ];

  const features = [
    {
      icon: CheckSquare,
      title: "Smart Task Management",
      description: "Organize, prioritize, and track your tasks with ease",
      color: "text-blue-500"
    },
    {
      icon: Target,
      title: "Habit Building",
      description: "Build lasting habits with streak tracking and motivation",
      color: "text-green-500"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Visualize your productivity with beautiful charts",
      color: "text-purple-500"
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss important tasks with intelligent notifications",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* App Name with TextTrail */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="w-full max-w-4xl h-56">
              <TextTrail
                text="Taskio"
                fontFamily="Figtree"
                fontWeight="900"
                noiseFactor={2.5}
                noiseScale={0.002}
                rgbPersistFactor={0.85}
                alphaPersistFactor={0.75}
                animateColor={false}
                textColor={isDark ? "#B19CD9" : "#4C1D95"}
                backgroundColor={isDark ? 0x1a1a2e : 0xf8fafc}
                supersample={2}
              />
            </div>
          </motion.div>

          {/* Custom Animated Robot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full max-w-4xl mx-auto mb-8"
          >
            <div className="relative w-full flex items-center justify-center py-12 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-blue-900/10 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30 shadow-2xl">
              <CustomRobot size="xl" />

              {/* Decorative elements */}
              <motion.div
                className="absolute top-8 left-8 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-60"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-8 right-8 w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-60"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [360, 180, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <motion.div
                className="absolute top-1/2 left-4 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-50"
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />
            </div>
          </motion.div>

          {/* Tagline with Beautiful Gradient Text */}
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative"
            >
              <h2
                className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease-in-out infinite'
                }}
              >
                Build better habits, one day at a time
              </h2>
              {/* Subtle glow effect */}
              <div
                className="absolute inset-0 text-2xl md:text-3xl font-bold text-center text-purple-400/20 blur-sm -z-10"
                aria-hidden="true"
              >
                Build better habits, one day at a time
              </div>
            </motion.div>
          </div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4"
          >
            Your personal productivity companion is here to help you achieve your goals with style and efficiency.
          </motion.div>

          {/* Personal Greeting */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center justify-center space-x-2 text-lg text-gray-700 dark:text-gray-300"
          >
            <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
            <span>{getGreeting()}, {user?.name || 'Friend'}!</span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </motion.div>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          key={currentQuote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800">
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {quotes[currentQuote]}
            </p>
          </Card>
        </motion.div>

        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
              Your Progress So Far
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckSquare className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{completedTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{longestStreak}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalHabits}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Habits</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Quick Start Guide
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get started with Taskio in just a few simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStartSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="text-center group cursor-pointer"
                  onClick={step.action}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {step.description}
                  </p>
                  <div className="flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                What You Can Do
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Discover the powerful features that will boost your productivity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="text-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors duration-200"
                >
                  <feature.icon className={`w-12 h-12 mx-auto mb-3 ${feature.color}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Quick Actions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Jump right into productivity with these quick actions
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Task</span>
              </Button>

              <Button
                onClick={() => setIsHabitModalOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Target className="w-4 h-4" />
                <span>Create Habit</span>
              </Button>

              <Button
                onClick={() => navigate('/analytics')}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Analytics</span>
              </Button>

              <Button
                onClick={() => navigate('/tasks')}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Browse Tasks</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Inspirational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <Card className="relative overflow-hidden p-10 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 border-pink-200 dark:border-pink-800 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full animate-bounce delay-500"></div>
            </div>

            {/* Main content */}
            <div className="relative z-10">
              {/* Animated title */}
              <motion.div
                className="flex items-center justify-center mb-6"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5, type: "spring", bounce: 0.4 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Star className="w-10 h-10 text-yellow-500 mr-3 drop-shadow-lg" />
                </motion.div>
                <motion.h2
                  className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  You're Amazing!
                </motion.h2>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.5 }}
                >
                  <Star className="w-10 h-10 text-yellow-500 ml-3 drop-shadow-lg" />
                </motion.div>
              </motion.div>

              {/* Enhanced message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mb-8"
              >
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed font-medium">
                  Every journey begins with a single step. You're here, you're ready to grow,
                  and that's already something to be proud of.
                </p>
                <motion.p
                  className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                >
                  Let's build something beautiful together! ✨
                </motion.p>
              </motion.div>

              {/* Interactive elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6"
              >
                <motion.div
                  className="flex items-center bg-white/50 dark:bg-gray-800/50 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="w-6 h-6 text-red-500 mr-3" />
                  </motion.div>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Made with love</span>
                </motion.div>

                <motion.div
                  className="flex items-center bg-white/50 dark:bg-gray-800/50 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-500 mr-3" />
                  </motion.div>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">For your success</span>
                </motion.div>
              </motion.div>

              {/* Motivational call-to-action */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-600/30"
              >
                <motion.p
                  className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-3"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🌟 Ready to transform your productivity journey?
                </motion.p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Start with one small task, build one meaningful habit, and watch yourself grow into the person you've always wanted to become.
                </p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskModal
          taskId={null}
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
        />
      )}

      {isHabitModalOpen && (
        <HabitModal
          habitId={null}
          isOpen={isHabitModalOpen}
          onClose={() => setIsHabitModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GettingStartedPage;

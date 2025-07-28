import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Calendar
} from 'lucide-react';
import { useProductivityInsights, useWorkloadAnalysis } from '@/hooks/useAnalytics';
import Card from '@/components/ui/Card';
import ProductivityChart from '@/components/analytics/ProductivityChart';
import PriorityChart from '@/components/analytics/PriorityChart';
import HourlyChart from '@/components/analytics/HourlyChart';
import WorkloadChart from '@/components/analytics/WorkloadChart';

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<number>(30);
  
  const { 
    data: insights, 
    isLoading: insightsLoading, 
    error: insightsError 
  } = useProductivityInsights(timeRange);
  
  const { 
    data: workload, 
    isLoading: workloadLoading, 
    error: workloadError 
  } = useWorkloadAnalysis();

  const timeRangeOptions = [
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' },
  ];

  const stats = insights ? [
    {
      title: 'Current Streak',
      value: insights.current_streak,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      suffix: 'days',
    },
    {
      title: 'Avg. Completion Time',
      value: insights.completion_time?.avg_completion_hours 
        ? Math.round(insights.completion_time.avg_completion_hours * 10) / 10
        : 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      suffix: 'hours',
    },
    {
      title: 'Total Habits',
      value: insights.habit_stats?.length || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      suffix: 'habits',
    },
    {
      title: 'Overdue Tasks',
      value: workload?.overdue_tasks?.overdue_count || 0,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      suffix: 'tasks',
    },
  ] : [];

  if (insightsError || workloadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load analytics data. Please try again.
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
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights into your productivity patterns and progress
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === option.value
                    ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {!insightsLoading && stats.length > 0 && (
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
                      {stat.value} {stat.suffix}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Daily Productivity
              </h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            {insightsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ProductivityChart data={insights?.daily_stats || []} />
            )}
          </Card>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Task Priority Distribution
              </h2>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
            
            {insightsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <PriorityChart data={insights?.priority_stats || []} />
            )}
          </Card>
        </motion.div>

        {/* Most Productive Hours */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Most Productive Hours
              </h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            
            {insightsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <HourlyChart data={insights?.hourly_stats || []} />
            )}
          </Card>
        </motion.div>

        {/* Workload Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upcoming Workload
              </h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            {workloadLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <WorkloadChart data={workload?.weekly_workload || []} />
            )}
          </Card>
        </motion.div>
      </div>

      {/* Habits Performance */}
      {!insightsLoading && insights?.habit_stats && insights.habit_stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Habit Performance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.habit_stats.slice(0, 6).map((habit, index) => (
                <motion.div
                  key={habit.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {habit.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Streak:</span>
                      <span className="font-medium text-orange-600">
                        {habit.streak_count} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">This week:</span>
                      <span className="font-medium text-green-600">
                        {habit.weekly_completions}/7
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-medium text-blue-600">
                        {habit.total_completions}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsPage;

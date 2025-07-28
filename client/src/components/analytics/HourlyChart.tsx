import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface HourlyData {
  hour: number;
  completed_tasks: number;
}

interface HourlyChartProps {
  data: HourlyData[];
}

const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  const { theme } = useTheme();

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {formatHour(label)}
          </p>
          <p className="text-sm text-blue-600">
            Tasks completed: {payload[0]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No hourly data available
      </div>
    );
  }

  // Fill in missing hours with 0 values and sort by hour
  const completeData = Array.from({ length: 24 }, (_, hour) => {
    const existingData = data.find(d => d.hour === hour);
    return {
      hour,
      completed_tasks: existingData?.completed_tasks || 0,
    };
  });

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={completeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="hour" 
            tickFormatter={formatHour}
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="completed_tasks" 
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlyChart;

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface ProductivityData {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

interface ProductivityChartProps {
  data: ProductivityData[];
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({ data }) => {
  const { theme } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {formatDate(label)}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Completed: {payload[0]?.value || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {payload[1]?.value || 0}
            </p>
            <p className="text-sm text-green-600">
              Rate: {payload[2]?.value || 0}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No productivity data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <YAxis 
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="completed_tasks"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="total_tasks"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#9ca3af', strokeWidth: 2, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="completion_rate"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;

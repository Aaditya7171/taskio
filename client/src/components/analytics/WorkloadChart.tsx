import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface WorkloadData {
  week_start: string;
  total_tasks: number;
  high_priority_tasks: number;
  medium_priority_tasks: number;
  low_priority_tasks: number;
}

interface WorkloadChartProps {
  data: WorkloadData[];
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ data }) => {
  const { theme } = useTheme();

  const formatWeek = (dateString: string) => {
    const date = new Date(dateString);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Week of {formatWeek(label)}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-red-600">
              High Priority: {payload.find((p: any) => p.dataKey === 'high_priority_tasks')?.value || 0}
            </p>
            <p className="text-sm text-yellow-600">
              Medium Priority: {payload.find((p: any) => p.dataKey === 'medium_priority_tasks')?.value || 0}
            </p>
            <p className="text-sm text-green-600">
              Low Priority: {payload.find((p: any) => p.dataKey === 'low_priority_tasks')?.value || 0}
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 pt-1 border-t border-gray-200 dark:border-dark-600">
              Total: {payload.find((p: any) => p.dataKey === 'total_tasks')?.value || 0}
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
        No workload data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="week_start" 
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={10}
          />
          <YAxis 
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const labels: { [key: string]: string } = {
                high_priority_tasks: 'High Priority',
                medium_priority_tasks: 'Medium Priority',
                low_priority_tasks: 'Low Priority',
              };
              return (
                <span style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                  {labels[value] || value}
                </span>
              );
            }}
          />
          <Bar 
            dataKey="high_priority_tasks" 
            stackId="priority"
            fill="#ef4444"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="medium_priority_tasks" 
            stackId="priority"
            fill="#f59e0b"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="low_priority_tasks" 
            stackId="priority"
            fill="#10b981"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkloadChart;
